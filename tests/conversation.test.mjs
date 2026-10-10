import { test } from 'node:test';
import assert from 'node:assert/strict';
import { approvalIntent, parseDeploy, deployMissing, deploymentLabel, safeHistory } from '../src/core/conversation.mjs';

test('approval accepts natural Slovak and no ID', () => {
 for (const s of ['Schvaľujem', 'Potvrdzujem', 'Áno', 'Súhlasím', 'nasad to']) assert.equal(approvalIntent(s), 'approve');
});
test('reject takes precedence over schvaľujem substring', () => {
 for (const s of ['Neschvaľujem', 'Nie', 'Zamietam', 'Zruš to']) assert.equal(approvalIntent(s), 'reject');
});
test('ordinary user commands are not approvals', () => {
 assert.equal(approvalIntent('Nasad worker trinity-gateway'), null);
 assert.equal(approvalIntent('Zistíš stav workerov?'), null);
});
test('extract target environment and immutable version', () => {
 const spec = parseDeploy('Nasad worker trinity-gateway do produkcie commit abcdef1234');
 assert.deepEqual(spec, {target:'trinity-gateway', environment:'production', version:'abcdef1234'});
 assert.equal(deploymentLabel(spec), 'Nasadiť trinity-gateway, verzia abcdef1234, do produkcie');
});
test('missing deployment details must be requested, never invented', () => {
 assert.deepEqual(deployMissing(parseDeploy('nasad worker trinity-gateway')), ['prostredie (produkcia alebo staging)','konkrétnu verziu alebo commit']);
});
test('structured deployment spec validated', () => {
 const invalid = parseDeploy('', {target:'../root', environment:'production', version:'abc'});
 assert.equal(invalid.target,''); assert.equal(invalid.version,'');
});
test('unrelated text is not deployment', () => assert.equal(parseDeploy('Ahoj Trinity'), null));
test('history bounded and trimmed', () => {
 const history = Array.from({length:15}, (_,i)=>({role:'user',text:'x'.repeat(3000)}));
 assert.equal(safeHistory(history).length,10);
 assert.equal(safeHistory(history)[0].text.length,2500);
});
