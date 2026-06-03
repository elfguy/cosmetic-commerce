import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const base=path.join(root,'public/coupang/images/aqua-lotion/versions');
const v4=path.join(base,'v4');
const outDir=path.join(v4,'detail');
const globalBrief=await fs.readFile(path.join(v4,'prompts/00-global-brief.txt'),'utf8');
const productRef=path.join(base,'original/representative/01.png');
const cuts=[
 {n:'06', refs:['v2/detail/07.png','original/detail/07.png','original/detail/08.png'], prompt:`V4 상세 06 — 발효성분 전용 페이지를 생성한다.\n\n중요: 특허 진정 원료, Fresh Bud No.6, 특허증서, 새싹 6종 페이지를 만들지 말 것. 이 컷은 특허 페이지가 아니다.\n\n참조: V2 detail 07의 발효성분 분위기, original detail 07의 발효 원료 3종 이미지, original detail 08의 원료 설명 분위기.\n\n큰 문구: 발효 성분이 깨우는 피부 컨디션\n보조 문구: 피부 컨디션 케어를 위한 발효 유래 성분 블렌딩\n\n반드시 아래 성분명 3개를 크게, 읽히게 넣기:\n효모/겨우살이추출물\n효모/띠뿌리발효추출물\n락토바실러스/콩발효추출물\n\n시각 구성: 중앙이 비어 보이지 않도록 투명한 발효 보울/비커, 콩, 겨우살이 잎, 띠뿌리 식물 이미지, 물방울을 풍성하게 배치.\n하단에는 식물 유래 오일 블렌딩을 작은 카드로 넣기: 마카다미아씨오일, 해바라기씨오일, 로즈힙열매오일.\n\n금지: 특허증서, Fresh Bud No.6 특허 원료, 새싹 6종 접시, POINT/CUT/STEP 번호.`},
 {n:'07', refs:['v3/detail/06.png','v3/detail/07.png'], prompt:`V4 상세 07 — 전성분 EWG 그린 + 약산성 pH 통합 페이지를 생성한다.\n\n참조: V3 detail 06의 EWG 그린 정보, V3 detail 07의 pH 5.0~6.5 게이지.\n시험확인서 이미지를 크게 넣지 말고, pH 게이지와 EWG 그린 설명이 균형 있게 보여야 한다.\n\n큰 문구: 예민한 피부도 편안하게\n핵심 문구: 전성분 EWG 그린 등급 · 약산성 pH 5.0~6.5\n\n필수 구성:\n1) 왼쪽: 전성분 EWG 그린 등급 설명 카드. 단, EWG VERIFIED 공식 인증 로고처럼 보이는 마크 금지. 일반 녹색 등급표/리프 아이콘만 사용.\n2) 오른쪽: pH 5.0~6.5 약산성 게이지를 크게 표현.\n3) 하단: 피부 밸런스 케어 / 무향 / 데일리 저자극 케어 아이콘.\n4) 제품 이미지를 작게 배치해도 좋음. 내용물은 흰색, 용기 상단은 투명.\n\n금지: EWG VERIFIED 로고, 과도한 시험확인서, POINT/CUT/STEP 번호.`}
];
function idOf(src){try{return new URL(src).searchParams.get('id')||src}catch{return src}}
async function estuaryImages(page){return await page.evaluate(()=>Array.from(document.images).map((img,i)=>({i,alt:img.alt,src:img.currentSrc||img.src,w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src&&x.src.includes('backend-api/estuary/content')))}
async function download(page,src,file){const b64=await page.evaluate(async(src)=>{const r=await fetch(src,{credentials:'include'});if(!r.ok)throw new Error('fetch '+r.status);const ab=await r.arrayBuffer();let binary='';const bytes=new Uint8Array(ab);const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary)},src);await fs.writeFile(file,Buffer.from(b64,'base64'));return Buffer.from(b64,'base64').length}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
for(const cut of cuts){
 const page=await ctx.newPage();
 await page.goto('https://chatgpt.com/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForSelector('#prompt-textarea',{timeout:60000});
 await page.waitForTimeout(2500);
 console.log('CUT',cut.n);
 const raw=[productRef,...cut.refs.map(r=>path.join(base,r))];
 const payload=[];let idx=1;
 for(const f of raw){const ext=path.extname(f)||'.png';payload.push({name:`v4-${cut.n}-strict-ref-${idx++}${ext}`,mimeType:ext.toLowerCase().includes('jpg')?'image/jpeg':'image/png',buffer:await fs.readFile(f)})}
 await page.setInputFiles('input#upload-files',payload);
 await page.waitForTimeout(8000);
 const uploadIds=new Set((await estuaryImages(page)).map(x=>idOf(x.src)));
 const full=`${globalBrief}\n\n${cut.prompt}\n\n위 조건으로 V4 상세 ${cut.n} 이미지를 실제 이미지 파일로 1장 생성해줘. 반드시 이 컷의 주제만 표현하고, 첨부한 참조 이미지만 기준으로 해줘.`;
 await fs.writeFile(path.join(v4,`prompts/${cut.n}-strict-regenerate.txt`),full);
 await page.locator('#prompt-textarea').click();
 await page.keyboard.insertText(full);
 await page.locator('button[data-testid="send-button"], button[aria-label*="보내기"], button[aria-label*="전송"], button.composer-submit-button-color').last().click({timeout:15000});
 console.log('submitted',page.url());
 let ok=false;
 for(let a=1;a<=72;a++){
  await page.waitForTimeout(10000);
  const candidates=(await estuaryImages(page)).filter(x=>x.w>=700&&x.h>=900&&!uploadIds.has(idOf(x.src)));
  console.log('attempt',a,candidates.map(x=>({id:idOf(x.src),w:x.w,h:x.h,alt:x.alt})));
  if(candidates.length){const gen=candidates[candidates.length-1];const file=path.join(outDir,`${cut.n}.png`);const bytes=await download(page,gen.src,file);await fs.writeFile(path.join(v4,`prompts/${cut.n}-strict-chat-url.txt`),`${page.url()}\n${gen.src}\n`);console.log('saved',file,bytes);ok=true;break}
 }
 if(!ok) throw new Error('no image '+cut.n);
 await page.close().catch(()=>{});
}
