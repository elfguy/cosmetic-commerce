import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const repDir = path.join(outDir, 'representative');
const rawDir = path.join(outDir, 'agent-representative-raw');
const promptDir = path.join(outDir, 'agent-representative-prompts');
await fs.mkdir(rawDir, { recursive: true }); await fs.mkdir(promptDir, { recursive: true });
const refs = [path.join(root,'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'), path.join(outDir,'representative/01.png')];
const briefs = [
  ['02','매일 쓰는 산뜻 수분 토너','끈적임 없이 가볍게, 세안 후 촉촉한 첫 루틴','산뜻한 사용감 / 피부결 정돈 / 500ml 대용량'],
  ['03','500ml 넉넉한 수분 루틴','아침저녁 부담 없이 쓰는 대용량 데일리 토너','500ml / 데일리 / 넉넉한 용량'],
  ['04','세안 후 첫 수분','건조해지기 전, 가장 먼저 채우는 토너 케어','첫 단계 수분 / 산뜻한 시작 / 피부결 정돈'],
  ['05','하나로 4가지 토너 케어','닦토 · 흡토 · 스킨팩 · 레이어링','4가지 활용 / 데일리 케어 / 산뜻 수분'],
  ['06','수분 레이어링','겹겹이 가볍게 쌓는 촉촉한 토너 루틴','흡수감 / 물방울 레이어 / 데일리 보습'],
];
function fileIdsFromText(text){return[...String(text||'').matchAll(/file_[0-9a-fA-F]+/g)].map(m=>m[0]);}
function candidateIds(src){const ids=new Set(fileIdsFromText(src));try{const u=new URL(src);const id=u.searchParams.get('id');for(const x of fileIdsFromText(id||''))ids.add(x);if(id?.startsWith('file_'))ids.add(id);}catch{}return[...ids];}
function hasKnownId(src,known){return candidateIds(src).some(id=>known.has(id));}
function primaryId(src){return candidateIds(src).find(id=>id.startsWith('file_'))||src;}
async function state(page){return page.evaluate(()=>({busy:!!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),imgs:Array.from(document.images).map(img=>({alt:img.alt||'',src:img.currentSrc||img.src||'',w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src.includes('backend-api/estuary/content'))}));}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222'); const ctx=browser.contexts()[0];
async function gen([n,title,sub,points]){
 const prompt=`이미지 에이전트로 쿠팡 대표 이미지 1장을 생성하세요.\n\n가장 중요한 조건: 업로드한 실제 제품 사진을 거의 그대로 보존하세요. 제품 병은 새로 그리면 실패입니다.\n\n제품 보존 기준:\n- 01번 참고 이미지와 같은 실제 YOURSKIN+ HYALURONIC ACID TONER 500ml 병이어야 합니다.\n- 길고 슬림한 투명/흰색 원통 병, 짧은 흰색 원통 캡, YOURSKIN+ 로고, HYALURONIC ACID TONER 텍스트, HYDRATING FORMULA, 500ml / 16.9 fl.oz, 하단 연한 파란 물결 라벨을 유지하세요.\n- 병을 더 통통하게 만들거나, 다른 라벨로 단순화하거나, 유리병/펌프병/크림병처럼 바꾸면 안 됩니다.\n- 가능하면 업로드한 제품 사진을 광고 배경 위에 그대로 올려놓은 것처럼 보여주세요. 제품 디자인보다 제품 보존이 우선입니다.\n\n광고 문구:\n큰 제목: ${title}\n서브: ${sub}\n포인트: ${points}\n\n배경은 흰색/연아쿠아/민트 톤의 깨끗한 수분 토너 광고. 배경은 단순해도 됩니다. 제품 사진 보존이 최우선입니다.\n\n금지: 온가족/가족/아이, 의료 효능, 다른 상품명, AQUA LOTION, CREAM, SERUM, 제작용 번호/STEP/CUT.`;
 await fs.writeFile(path.join(promptDir,`${n}-agent-only-strict-product-prompt.txt`),prompt);
 const page=await ctx.newPage(); await page.goto('https://chatgpt.com/images/',{waitUntil:'domcontentloaded',timeout:60000}); await page.waitForTimeout(4000);
 const create=page.getByText('이미지 만들기',{exact:true}).first(); if(await create.count()){await create.click({timeout:15000}).catch(()=>{}); await page.waitForTimeout(1500);}
 await page.waitForSelector('#prompt-textarea',{timeout:60000});
 const before=await state(page); const beforeIds=new Set(before.imgs.flatMap(x=>candidateIds(x.src)));
 await fs.writeFile(path.join(promptDir,`${n}-agent-only-strict-before.json`),JSON.stringify({ids:[...beforeIds]},null,2));
 await page.setInputFiles('input#upload-files,input#upload-photos,input#image-gen-action-modal-upload-photos,input[name="images-app-drop-container-input"],input[type="file"]',refs);
 await page.waitForTimeout(8000);
 for(const text of ['확인','완료']){const btn=page.getByRole('button',{name:text}).first(); if(await btn.count()){await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000);}}
 await page.locator('#prompt-textarea').last().click(); await page.keyboard.insertText(prompt);
 await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({timeout:15000});
 await page.waitForTimeout(8000); const chatUrl=page.url(); await fs.writeFile(path.join(promptDir,`${n}-agent-only-strict-chat-url.txt`),chatUrl+'\n'); console.log('submitted-strict',n,chatUrl);
 for(let i=1;i<=120;i++){await page.waitForTimeout(8000); const s=await state(page); const cand=[]; const seen=new Set(); for(const img of s.imgs){if(img.w<900||img.h<900)continue;if(hasKnownId(img.src,beforeIds))continue;const id=primaryId(img.src); if(seen.has(id))continue;seen.add(id);cand.push({...img,id});} console.log('poll-strict',n,i,'busy',s.busy,'cand',cand.map(c=>({id:c.id,w:c.w,h:c.h,alt:c.alt}))); if(cand.length&&!s.busy){const img=cand.at(-1); const b64=await page.evaluate(async(src)=>{const r=await fetch(src,{credentials:'include'});if(!r.ok)throw new Error('fetch '+r.status);const ab=await r.arrayBuffer();const bytes=new Uint8Array(ab);let ss='';for(let j=0;j<bytes.length;j+=0x8000)ss+=String.fromCharCode(...bytes.subarray(j,j+0x8000));return btoa(ss);},img.src); const buf=Buffer.from(b64,'base64'); const raw=path.join(rawDir,`${n}-agent-only-strict-product.png`); const final=path.join(repDir,`${n}.png`); await fs.writeFile(raw,buf); await fs.writeFile(final,buf); const res={n,chatUrl,id:img.id,natural:`${img.w}x${img.h}`,bytes:buf.length,raw,final,rule:'direct strict image-agent output; no local compositing'}; await fs.writeFile(path.join(promptDir,`${n}-agent-only-strict-result.json`),JSON.stringify(res,null,2)); console.log('saved-strict',n,img.id,`${img.w}x${img.h}`,buf.length); await page.close().catch(()=>{}); return res;}}
 throw new Error('no strict result '+n);
}
const results=[]; for(const b of briefs) results.push(await gen(b)); await fs.writeFile(path.join(promptDir,'agent-only-strict-batch-result.json'),JSON.stringify(results,null,2)); console.log('done-strict',results.length); process.exit(0);
