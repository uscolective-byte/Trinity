import {fetchWeb,windowWebFetchPage,renderWebFetchPage} from 'agents/webfetch';

// GET-only research. Each redirect is checked by the SDK; no credentials or
// private/local targets. Source content never becomes an instruction or fact.
export async function readWebSource(env,args,fetchImpl) {
  const page=await fetchWeb({url:args.url,format:'auto'},{
    binding:env.AI,fetch:fetchImpl,maxBytes:2_000_000,maxRedirects:3,
    timeoutMs:20_000,allowPrivateHosts:false,
    blockedHosts:['*.workers.dev',...String(env.WEB_FETCH_BLOCKED_HOSTS||'').split(',').map(h=>h.trim()).filter(Boolean)],
  });
  if(page.status<200||page.status>=300)throw new Error(`Web fetch HTTP ${page.status}; zdroj nebol uložený.`);
  const output=windowWebFetchPage(page,{offset:args.offset||0,pageChars:6000});
  const fetched_at=new Date().toISOString();
  const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([output.finalUrl,output.offset,output.content])))).toString('hex');
  const record={url:output.url,final_url:output.finalUrl,title:output.title||null,
    fetched_at,content_type:output.contentType,via:output.via,offset:output.offset,
    next_offset:output.nextOffset,total_chars:output.totalChars,
    content:output.content,verified:false,trust:'untrusted-web-source'};
  const key=`web/${hash}`;
  // Persist the exact bounded window, including provenance. An empty window
  // isn't learned; SQL upsert deduplicates repeated reads of the same content.
  if(output.content.trim()) {
    if(!env.DB)throw new Error('Pamäť D1 pre webové zdroje nie je nakonfigurovaná.');
    await env.DB.prepare("INSERT INTO ops_memory(key,value,source) VALUES(?,?,'web-fetch') ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=datetime('now')").bind(key,JSON.stringify(record)).run();
  }
  return {source:{...record,content:undefined},memory_key:output.content.trim()?key:null,
    text:renderWebFetchPage(output),_evidence:{effect:'read',receipt_id:hash}};
}
