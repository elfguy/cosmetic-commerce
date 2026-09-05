import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { resolve, join } from 'node:path';
import { ownerGuide, ownerMarkdown } from '../src/data/metaOwnerGuide.mjs';

assert.equal(ownerGuide.steps.length, 7);
assert.equal(new Set(ownerGuide.steps.map(s => s.id)).size, 7);
for (const step of ownerGuide.steps) {
  assert.ok(step.instructions.length >= 3 && step.done && step.help && step.note);
  if (step.action) assert.equal(new URL(step.action[1]).protocol, 'https:');
}
const buildRoot = resolve(process.argv[2] || 'dist');
const html = await readFile(join(buildRoot, 'marketing/meta-owner-setup/index.html'), 'utf8');
assert.equal((html.match(/data-owner-check=/g) || []).length, 7);
assert.ok(html.includes('noindex, nofollow'));
assert.ok(html.includes('href="/marketing/meta-owner-setup/guide.md"'));
assert.equal(await readFile(join(buildRoot, 'marketing/meta-owner-setup/guide.md'), 'utf8'), ownerMarkdown());
const code = await readFile(new URL('../src/scripts/metaOwnerGuide.js', import.meta.url), 'utf8');
const state = new Map();
function harness({ blocked = false, clipboardBlocked = false } = {}) {
  const elements = new Map();
  const make = (id) => ({ id, disabled:true, checked:false, value:'', textContent:'', dataset:{}, events:{}, addEventListener(name, fn) { this.events[name] = fn; }, focus(){ this.focused = true; }, select(){ this.selected = true; } });
  for (const id of ['owner-storage','owner-message','owner-count','owner-progress','owner-print','owner-copy','owner-reset','owner-feedback']) elements.set(id,make(id));
  const checks = ownerGuide.steps.map(step => {
    elements.set(`title-${step.id}`, {...make(`title-${step.id}`), textContent:step.title});
    return {...make(step.id), dataset:{ownerCheck:step.id}};
  });
  const nav = new Map(ownerGuide.steps.map(step => [step.id,make(step.id)]));
  const details = [{open:false},{open:true}];
  const windows = {};
  const clipboard = {value:''};
  const context = {
    document: {
      getElementById: id => elements.get(id),
      querySelectorAll: selector => selector==='[data-owner-check]' ? checks : details,
      querySelector: selector => nav.get(selector.match(/"(.*?)"/)[1]),
    },
    localStorage: { getItem:k=>{if(blocked) throw Error('blocked'); return state.get(k)??null;}, setItem:(k,v)=>{if(blocked) throw Error('blocked');state.set(k,v);} },
    window: {confirm:()=>true,print:()=>{},addEventListener:(name,fn)=>{windows[name]=fn;}},
    navigator: {clipboard:{writeText:async value=>{if(clipboardBlocked) throw Error('blocked');clipboard.value=value;}}},
  };
  vm.runInNewContext(code,context);
  return {elements,checks,windows,details,clipboard};
}
let app = harness();
assert.equal(app.elements.get('owner-count').textContent,'0 / 7 완료');
assert.ok(app.checks.every(x=>!x.disabled));
app.checks[0].checked=true;app.checks[0].events.change();
assert.equal(app.elements.get('owner-count').textContent,'1 / 7 완료');
app = harness();
assert.equal(app.checks[0].checked,true,'saved state restores');
app.checks.forEach(x=>{x.checked=true;});app.checks[0].events.change();
assert.equal(app.elements.get('owner-progress').value,7);
await app.elements.get('owner-copy').events.click();
assert.ok(app.clipboard.value.includes('(7/7)'));
app.windows.beforeprint();assert.ok(app.details.every(x=>x.open));
app.windows.afterprint();assert.equal(app.details[0].open,false);assert.equal(app.details[1].open,true);
app.elements.get('owner-reset').events.click();assert.ok(app.checks.every(x=>!x.checked));
app = harness({blocked:true,clipboardBlocked:true});
app.checks[0].checked=true;app.checks[0].events.change();
assert.ok(app.elements.get('owner-storage').textContent.includes('저장하지 못했어요'));
await app.elements.get('owner-copy').events.click();assert.ok(app.elements.get('owner-message').selected);
console.log('PASS: content, generated Markdown, 7 checks, storage restore, blocked storage, copy/fallback, print and reset.');
