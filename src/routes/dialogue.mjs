import { approvalIntent, parseDeploy, deployMissing, deploymentLabel, safeHistory, SYSTEM_PROMPT } from '../core/conversation.mjs';

const json = (value, status=200) => new Response(JSON.stringify(value), {status, headers:{'content-type':'application/json; charset=utf-8', 'cache-control':'no-store'}});
const nowIso = () => new Date().toISOString();
const idValid = s => typeof s === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(s);

async function tryDatabase(env) {
  const db = env?.TRINITY_DB;
  if (!db || typeof db.prepare !== 'function') return null;
  try { await db.prepare('SELECT 1 FROM trinity_chat_turns LIMIT 1').all(); return db; }
  catch { return null; } // Migration not applied: degrade to ephemeral chat, never approve.
}

async function storeTurn(db, owner, conversationId, message, response) {
  if (!db) return;
  try {
    await db.prepare('INSERT INTO trinity_chat_turns (id, owner, conversation_id, message, response, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), owner, conversationId, message, response, nowIso()).run();
    // Bound each conversation to a reasonable size; old items are not retained forever.
    await db.prepare('DELETE FROM trinity_chat_turns WHERE owner = ? AND conversation_id = ? AND id NOT IN (SELECT id FROM trinity_chat_turns WHERE owner = ? AND conversation_id = ? ORDER BY created_at DESC LIMIT 60)')
      .bind(owner, conversationId, owner, conversationId).run();
  } catch { /* Chat still works; response declares degraded persistence. */ }
}

async function previousTurns(db, owner, conversationId) {
  if (!db) return [];
  const {results = []} = await db.prepare('SELECT message, response FROM trinity_chat_turns WHERE owner = ? AND conversation_id = ? ORDER BY created_at DESC LIMIT 5')
    .bind(owner, conversationId).all();
  return results.reverse().flatMap(turn => [{role:'user',text:turn.message},{role:'assistant',text:turn.response}]);
}

async function handleApproval(db, owner, conversationId, intent) {
  if (!db) return {response:'Na bezpečné schvaľovanie ešte chýba databázové úložisko TRINITY_DB a migrácia. Nasadenie nebolo vykonané.',mode:'not_configured',engine:'approval'};
  const {results=[]} = await db.prepare("SELECT id, label FROM trinity_deployment_approvals WHERE owner = ? AND conversation_id = ? AND status = 'pending' AND expires_at > ? ORDER BY created_at DESC LIMIT 2")
    .bind(owner, conversationId, nowIso()).all();
  if (results.length > 1) return {response:'Čaká viac návrhov nasadenia. Napíš názov služby, ktorú chceš schváliť. Interné ID netreba.',mode:'ambiguous',engine:'approval'};
  if (!results.length) return {response:'Nemám v tejto konverzácii otvorený návrh nasadenia na schválenie. Najprv pripravíme presný cieľ a verziu.',mode:'no_pending',engine:'approval'};
  const chosen = results[0];
  const status = intent === 'approve' ? 'approved' : 'rejected';
  const updated = await db.prepare("UPDATE trinity_deployment_approvals SET status = ?, decided_at = ? WHERE id = ? AND owner = ? AND conversation_id = ? AND status = 'pending' AND expires_at > ?")
    .bind(status,nowIso(),chosen.id,owner,conversationId,nowIso()).run();
  if (updated.meta?.changes !== 1) return {response:'Schválenie sa nepodarilo uložiť (mohlo vypršať). Nespustila som žiadnu akciu.',mode:'conflict',engine:'approval'};
  const word = status === 'approved' ? 'Schválenie zaznamenané' : 'Návrh zamietnutý';
  return {response:`${word}: ${chosen.label}. ${status==='approved'?'Nasadenie sa ešte nespustilo. Vykoná ho až samostatný autorizovaný deploy nástroj.':'Žiadne nasadenie sa nespustilo.'}`,mode:status,engine:'approval'};
}

async function stageDeployment(db, owner, conversationId, spec) {
  const missing = deployMissing(spec);
  if (missing.length) return {response:`Rozumiem zámeru nasadiť službu. Na bezpečné schválenie ešte potrebujem: ${missing.join(', ')}. Identifikátor schválenia nemusíš zadávať.`,mode:'needs_details',engine:'planner'};
  if (!db) return {response:`Návrh: ${deploymentLabel(spec)}. Na uloženie schválenia je potrebné nakonfigurovať TRINITY_DB a spustiť migráciu; bez toho žiadne nasadenie ani schválenie nespustím.`,mode:'not_configured',engine:'planner'};
  const label=deploymentLabel(spec);
  const expiration = new Date(Date.now()+15*60*1000).toISOString();
  await db.prepare('INSERT INTO trinity_deployment_approvals (id, owner, conversation_id, label, target, environment, version, status, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(),owner,conversationId,label,spec.target,spec.environment,spec.version,'pending',nowIso(),expiration).run();
  return {response:`Pripravený návrh: ${label}. Schváliš? Stačí odpovedať „Schvaľujem“ alebo kliknúť na tlačidlo. Návrh platí 15 minút. Nič ešte nie je nasadené.`,mode:'pending_approval',engine:'planner',approval:{summary:label,can_approve:true}};
}

async function askModel(message, history, env, fetcher) {
  const key = env?.GEMINI_API_KEY || env?.GEMINI || env?.gemini;
  if (!key) return {response:'AI model zatiaľ nie je pripojený. Môžem pripraviť plán, ale nemám teraz skutočnú odpoveď modelu ani výsledok nástroja.',mode:'model_unavailable',engine:'unavailable'};
  const model = typeof env?.GEMINI_MODEL === 'string' && /^[a-zA-Z0-9._-]{3,60}$/.test(env.GEMINI_MODEL) ? env.GEMINI_MODEL : 'gemini-flash-latest';
  const contents = [...safeHistory(history),{role:'user',text:message}].map(turn=>({role:turn.role==='assistant'?'model':'user',parts:[{text:turn.text}]}));
  try {
    const res = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},
      signal: AbortSignal.timeout(20000),
      body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM_PROMPT}]},contents,generationConfig:{temperature:0.65,maxOutputTokens:1100}})
    });
    if(!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const payload=await res.json();
    const text=payload?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').trim();
    if(!text) throw new Error('Gemini returned no content');
    return {response:text.slice(0,6000),mode:'answer',engine:'gemini'};
  } catch {
    return {response:'Model momentálne neodpovedá. Nespustila som žiadnu akciu ani nasadenie. Skús opakovať požiadavku.',mode:'model_unavailable',engine:'unavailable'};
  }
}

/** Authenticated user is supplied by /api/ai routing; this endpoint never performs deployments. */
export async function handleDialogue(request, env, principal, fetcher=fetch) {
  if (!principal?.user) return json({error:'Vyžaduje sa prihlásenie.'},401);
  let body;
  try { body=await request.json(); } catch { return json({error:'Neplatný JSON.'},400); }
  const message=body?.message ?? body?.command;
  if (typeof message !== 'string' || !message.trim() || message.length>3000) return json({error:'Správa musí mať 1 až 3000 znakov.'},400);
  const conversationId=body?.conversation_id ?? 'default';
  if(!idValid(conversationId)) return json({error:'Neplatná relácia konverzácie.'},400);
  const db=await tryDatabase(env);
  let result;
  try {
    const intent=approvalIntent(message);
    const spec=parseDeploy(message,body?.deployment);
    // An explicit deploy specification always starts a new proposal, never an approval.
    if (body?.deployment) result=await stageDeployment(db,principal.user,conversationId,spec);
    else if(intent) result=await handleApproval(db,principal.user,conversationId,intent);
    else if(spec) result=await stageDeployment(db,principal.user,conversationId,spec);
    else {
      const history=db ? await previousTurns(db,principal.user,conversationId) : safeHistory(body?.history);
      result=await askModel(message,history,env,fetcher);
    }
    await storeTurn(db,principal.user,conversationId,message,result.response);
    return json({...result,conversation_id:conversationId,persistence:db?'d1':'ephemeral'});
  } catch {
    return json({error:'Došlo k chybe pri spracovaní. Žiadne nasadenie sa nevykonalo.'},503);
  }
}
