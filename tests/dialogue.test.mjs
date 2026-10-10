import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleDialogue} from '../src/routes/dialogue.mjs';
const principal = {user:'admin-test'};
const req = (text, extras={}) => new Request('https://local/api/ai/command',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({command:text,conversation_id:'current',...extras})});
const send = async (text, env={}, extras={}) => {
 const res = await handleDialogue(req(text,extras),env,principal,async (_url,opts)=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:'Rozumiem. Tu je ďalší krok.'}]}}]})}));
 return {status:res.status,body:await res.json()};
};

class FakeDb {
  approvals=[]; turns=[];
  prepare(sql) {return {all:async()=>({results:[]}),bind:(...args)=>({
    all:async()=>{
      if(sql.startsWith('SELECT 1'))return {results:[]};
      if(sql.includes('FROM trinity_deployment_approvals'))return {results:this.approvals.filter(a=>a.owner===args[0] && a.conversation_id===args[1] && a.status==='pending' && a.expires_at>args[2]).slice(-2).reverse()};
      if(sql.includes('FROM trinity_chat_turns'))return {results:this.turns.filter(t=>t.owner===args[0]&&t.conversation_id===args[1]).slice(-5).reverse()};
      throw new Error('Unexpected all: '+sql);
    },
    run:async()=>{
      if(sql.startsWith('INSERT INTO trinity_chat_turns')) {this.turns.push({id:args[0],owner:args[1],conversation_id:args[2],message:args[3],response:args[4]});return {meta:{changes:1}};}
      if(sql.startsWith('DELETE FROM trinity_chat_turns'))return {meta:{changes:0}};
      if(sql.startsWith('INSERT INTO trinity_deployment_approvals')) {this.approvals.push({id:args[0],owner:args[1],conversation_id:args[2],label:args[3],target:args[4],environment:args[5],version:args[6],status:args[7],created_at:args[8],expires_at:args[9]});return {meta:{changes:1}};}
      if(sql.startsWith('UPDATE trinity_deployment_approvals')) {const found=this.approvals.find(a=>a.id===args[2]&&a.owner===args[3]&&a.conversation_id===args[4]&&a.status==='pending'&&a.expires_at>args[5]);if(!found)return {meta:{changes:0}};found.status=args[0];return {meta:{changes:1}};}
      throw new Error('Unexpected run: '+sql);
    }
  })};}
}

test('must authenticate',async()=>{
 const res=await handleDialogue(req('Ahoj'),{},null); assert.equal(res.status,401);
});
test('no model never fabricates results',async()=>{
 const {body}=await send('Aký je aktuálny stav infraštruktúry?');
 assert.equal(body.mode,'model_unavailable'); assert.match(body.response,/model.*nie je pripojený/i);
});
test('Gemini uses API key header and retains short history',async()=>{
 let passed;
 const r=await handleDialogue(req('Čo ďalej?',{history:[{role:'user',text:'Stav projektu?'},{role:'assistant',text:'Príprava.'}]}),{GEMINI_API_KEY:'testkey'},principal,async(url,opts)=>{
   passed={url,headers:opts.headers,body:JSON.parse(opts.body)};
   return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:'Navrhujem jeden krok.'}]}}]})};
 });
 assert.equal((await r.json()).response,'Navrhujem jeden krok.');
 assert.equal(passed.headers['x-goog-api-key'],'testkey');
 assert.ok(!passed.url.includes('testkey')); assert.equal(passed.body.contents.length,3);
});
test('cannot stage approval without database',async()=>{
 const {body}=await send('Nasad worker trinity-gateway do produkcie commit abcdef1234');
 assert.equal(body.mode,'not_configured');
});
test('natural approval stages and marks correct proposal without running deployment',async()=>{
 const db=new FakeDb();
 const env={TRINITY_DB:db};
 let {body}=await send('Nasad worker trinity-gateway do produkcie commit abcdef1234',env);
 assert.equal(body.mode,'pending_approval'); assert.equal(db.approvals[0].status,'pending');
 ({body}=await send('Schvaľujem',env));
 assert.equal(body.mode,'approved'); assert.equal(db.approvals[0].status,'approved');
 assert.match(body.response,/ešte nespustilo/);
});
test('reject blocks deployment and cannot approve again',async()=>{
 const db=new FakeDb();const env={TRINITY_DB:db};
 await send('Nasad worker trinity-gateway do produkcie commit abcdef1234',env);
 let {body}=await send('Zamietam',env);assert.equal(body.mode,'rejected');
 ({body}=await send('Schvaľujem',env));assert.equal(body.mode,'no_pending');
});
test('ambiguous pending approvals cannot approve by bare yes',async()=>{
 const db=new FakeDb();const env={TRINITY_DB:db};
 await send('Nasad worker trinity-gateway do produkcie commit abcdef1234',env);
 await send('Nasad worker trinity-gemini do produkcie commit abcdef1234',env);
 const {body}=await send('Áno',env);assert.equal(body.mode,'ambiguous');assert.ok(db.approvals.every(x=>x.status==='pending'));
});
test('no approval leakage between user sessions',async()=>{
 const db=new FakeDb();const env={TRINITY_DB:db};
 await send('Nasad worker trinity-gateway do produkcie commit abcdef1234',env);
 const res=await handleDialogue(req('Schvaľujem'),env,{user:'different-user'});
 assert.equal((await res.json()).mode,'no_pending');
});
