import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const detailDir=path.join(outDir,'detail');
const rawDir=path.join(outDir,'agent-detail-raw');
const promptDir=path.join(outDir,'agent-detail-prompts');
const rejectedDir=path.join(outDir,'rejected');
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'');
const backup=path.join(rejectedDir,`13-before-sans-tone-fix-${stamp}.png`); if(existsSync(path.join(detailDir,'13.png'))) await fs.copyFile(path.join(detailDir,'13.png'),backup);
const refs=[path.join(detailDir,'11.png'),path.join(detailDir,'12.png'),path.join(root,'public/coupang/images/aqua-lotion/versions/v4/detail/15.png'),path.join(root,'public/coupang/images/aqua-lotion/versions/v4/detail/14.png')].filter(p=>existsSync(p));
const prompt=`쿠팡 모바일 상세페이지용 세로 이미지 1장을 만들어주세요. 목표는 유어스킨플러스 히알루론산 토너 상세페이지 13번째 마지막 안내 컷입니다.

중요: 반드시 ChatGPT Images 이미지 생성 결과물 안에 텍스트까지 자연스럽게 포함해 주세요. 배경만 만들지 마세요.

[스타일 고정]
- 업로드한 토너 11, 12번과 아쿠아 로션 14, 15번처럼 깔끔한 한국어 산세리프 폰트로 맞춰 주세요.
- 절대 붓글씨, 캘리그라피, 명조/세리프 느낌, 손글씨 제목을 쓰지 마세요.
- 제목은 기존 상세컷과 같은 굵은 한국어 산세리프, 짙은 그린+민트 강조.
- 흰색 베이스, 아쿠아 물결, 연한 민트 카드, 둥근 정보 카드, 차분한 공식 안내 톤.
- 실제 제품병, 제품 라벨, 패키지, 박스, 목업은 절대 넣지 마세요.
- 컷 번호, POINT/STEP 숫자, V1/V4 표기 금지.

[반드시 들어갈 한국어 텍스트 — 그대로 사용]
제목:
공식 판매처에서
신선하게 받아보세요

서브 문장:
유어스킨플러스 제품 상태와
출고 이력을 직접 관리합니다

중앙 큰 카드:
(주)유어스킨
공식 판매자 여부를 확인 후 구매해 주세요

카드 1:
공식 판매처 확인
판매자 정보를 꼭 확인하세요

카드 2:
비공식 재판매 제품 주의
출처가 불분명한 상품은 피해주세요

카드 3:
제품 상태 확인 어려움
비공식 판매 상품은 관리 이력을 알기 어렵습니다

카드 4:
신선 출고 관리
최근 제조 제품 위주로 꼼꼼히 관리합니다

하단 강조 문구:
좋은 제품은 안전하게 받아보실 수 있도록
공식 판매 경로를 권장합니다

[검수 기준]
- “무료 재판매”라는 표현이 나오면 실패입니다.
- 붓글씨/캘리그라피/명조체 제목이면 실패입니다.
- 제품병/박스/라벨이 나오면 실패입니다.
- 한국어가 깨지거나 이상한 글자로 변형되면 실패입니다.`;
await fs.writeFile(path.join(promptDir,'13-official-seller-sans-tone-fix-prompt.txt'),prompt);
function fileIdsFromText(text){return [...String(text||'').matchAll(/file_[0-9a-fA-F]+/g)].map(m=>m[0]);}
function candidateIds(src){const ids=new Set(fileIdsFromText(src)); try{const u=new URL(src); const id=u.searchParams.get('id'); for(const x of fileIdsFromText(id||'')) ids.add(x); if(id?.startsWith('file_')) ids.add(id);}catch{} return [...ids];}
function hasKnownId(src,known){return candidateIds(src).some(id=>known.has(id));}
function primaryId(src){return candidateIds(src).find(id=>id.startsWith('file_'))||src;}
async function state(page){return page.evaluate(()=>({busy:!!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),imgs:Array.from(document.images).map(img=>({alt:img.alt||'',src:img.currentSrc||img.src||'',w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src.includes('backend-api/estuary/content'))}));}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222'); const ctx=browser.contexts()[0]; const page=await ctx.newPage();
console.log('goto images'); await page.goto('https://chatgpt.com/images/',{waitUntil:'domcontentloaded',timeout:60000}); await page.waitForTimeout(4000); console.log({url:page.url(),title:await page.title()});
const create=page.getByText('이미지 만들기',{exact:true}).first(); if(await create.count()){await create.click({timeout:15000}).catch(e=>console.log('create click fail',e.message)); await page.waitForTimeout(1500);} await page.waitForSelector('#prompt-textarea',{timeout:60000});
const before=await state(page); const beforeIds=new Set(before.imgs.flatMap(x=>candidateIds(x.src))); await page.setInputFiles('input[type="file"]',refs); await page.waitForTimeout(10000); for(const text of ['확인','완료']){const btn=page.getByRole('button',{name:text}).first(); if(await btn.count()){await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000);}}
await page.locator('#prompt-textarea').last().click(); await page.keyboard.insertText(prompt); await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({timeout:15000}); await page.waitForTimeout(8000); const chatUrl=page.url(); console.log('submitted',chatUrl);
for(let i=1;i<=150;i++){await page.waitForTimeout(8000); const s=await state(page); const candidates=[]; const seen=new Set(); for(const img of s.imgs){if(img.w<900||img.h<900) continue; if(hasKnownId(img.src,beforeIds)) continue; if(refs.some(r=>img.alt===path.basename(r))) continue; const id=primaryId(img.src); if(seen.has(id)) continue; seen.add(id); candidates.push({...img,id});} console.log('poll',i,s.busy,candidates.map(c=>({id:c.id,w:c.w,h:c.h,alt:c.alt}))); if(candidates.length&&!s.busy){const gen=candidates.filter(c=>c.alt.includes('생성된 이미지')); const img=(gen.length?gen:candidates).at(-1); const b64=await page.evaluate(async(src)=>{const r=await fetch(src,{credentials:'include'}); if(!r.ok) throw new Error('fetch '+r.status); const ab=await r.arrayBuffer(); const bytes=new Uint8Array(ab); let s=''; for(let j=0;j<bytes.length;j+=0x8000)s+=String.fromCharCode(...bytes.subarray(j,j+0x8000)); return btoa(s);},img.src); const buf=Buffer.from(b64,'base64'); const raw=path.join(rawDir,'13-official-seller-sans-tone-fix-agent.png'); const final=path.join(detailDir,'13.png'); await fs.writeFile(raw,buf); await sharp(buf).resize(780,1360,{fit:'cover',position:'center'}).png({compressionLevel:9}).toFile(final); const meta=await sharp(final).metadata(); const result={chatUrl,id:img.id,natural:`${img.w}x${img.h}`,bytes:buf.length,raw,final,finalSize:`${meta.width}x${meta.height}`,backup,refs,alt:img.alt,rule:'direct ChatGPT Images output; normalized only; no local text patch'}; await fs.writeFile(path.join(promptDir,'13-official-seller-sans-tone-fix-result.json'),JSON.stringify(result,null,2)); console.log('saved',JSON.stringify(result)); await page.close().catch(()=>{}); process.exit(0);}}
throw new Error('no generated image');
