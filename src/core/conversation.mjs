/** Pure language/intent helpers: never execute deployments. */
const clean = text => String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._\s-]+/g, ' ').trim().replace(/\s+/g, ' ');
export const normalize = clean;

export function approvalIntent(text) {
  const s = clean(text);
  // Negations must be checked before positive commands.
  if (/^(nie|nechcem|neschvalujem|nesuhlasim|zamietam|zamietnut|odmietam|zrus|zrusit|stop|cancel)(\b|$)/.test(s)) return 'reject';
  if (/^(ano|hej|ok|okej|suhlasim|schvalujem|potvrdzujem|potvrdim|schvalene|approve)(\b|$)/.test(s)) return 'approve';
  if (/^(nasad to|spusti toto nasadenie|muzes to nasadit|mozes to nasadit)(\b|$)/.test(s)) return 'approve';
  return null;
}

export function parseDeploy(message, explicit = undefined) {
  const s = clean(message);
  const asksDeployment = /\b(nasad|nasadit|nasadenie|deploy|deployment|publikuj|publikovat)\b/.test(s);
  if (!asksDeployment && !explicit) return null;
  const explicitIsObj = explicit && typeof explicit === 'object' && !Array.isArray(explicit);
  const matchTarget = s.match(/\b(?:worker|sluzbu|aplikaciu|projekt|service)\s+([a-z0-9][a-z0-9._-]{1,79})/);
  const namedWorker = s.match(/\b(trinity[-_][a-z0-9._-]{2,60})\b/);
  const matchVersion = s.match(/\b(?:commit|sha|verziu|verzia|verzie|revision|revisions)\s+([a-z0-9._-]{5,64})/);
  const target = explicitIsObj ? explicit.target : (matchTarget?.[1] || namedWorker?.[1]);
  const environment = explicitIsObj ? explicit.environment : (/\b(produkci[aeu]|production|prod)\b/.test(s) ? 'production' : /\b(staging|test|testovaci[aeo])\b/.test(s) ? 'staging' : '');
  const version = explicitIsObj ? explicit.version : matchVersion?.[1];
  const safe = (value, rule) => typeof value === 'string' && rule.test(value) ? value : '';
  return {
    target: safe(target, /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,79}$/),
    environment: safe(environment, /^(production|staging)$/),
    version: safe(version, /^[a-zA-Z0-9][a-zA-Z0-9._-]{4,63}$/),
  };
}

export function deployMissing(spec) {
  return [!spec.target && 'cieľ (napríklad trinity-gateway)', !spec.environment && 'prostredie (produkcia alebo staging)', !spec.version && 'konkrétnu verziu alebo commit'].filter(Boolean);
}

export function deploymentLabel(spec) {
  const env = spec.environment === 'production' ? 'produkcie' : 'stagingu';
  return `Nasadiť ${spec.target}, verzia ${spec.version}, do ${env}`;
}

export const SYSTEM_PROMPT = `Si Trinity, užitočná digitálna asistentka pre vývoj projektov. Píš po slovensky, prirodzene a jasne, bez robotických fráz. V nadväzujúcich otázkach rešpektuj kontext. Nezahlcuj používateľa technickými ID. Keď to pomôže, ponúkni jeden konkrétny ďalší krok.
Nepredstieraj vedomie, vlastné pocity, živé údaje, používateľské oprávnenia, spustenie kódu ani dokončené nasadenie. Ak je model alebo nástroj nedostupný, povedz to. Akcia sa vykonala len ak to potvrdzuje skutočný výsledok nástroja. Rizikové akcie si vyžadujú platné schválenie viazané na konkrétny cieľ, prostredie a verziu; bežný chat sám o sebe nič nenasadzuje. Nikdy nežiadaj interné ID schválenia. Odpovedaj stručne, ale vecne; pri práci s kódom buď presná.`;

export function safeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-10).filter(x => x && ['user','assistant'].includes(x.role) && typeof x.text === 'string').map(x => ({role:x.role,text:x.text.slice(0,2500)}));
}
