import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
const repDir = path.join(outDir, 'representative');
await fs.mkdir(repDir, { recursive: true });
await fs.mkdir(path.join(outDir, 'representative-raw'), { recursive: true });
await fs.mkdir(path.join(outDir, 'representative-prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });

const refPairs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/archive/v5-gpt-images-workspace/reference/v5-proof01-v2-rep01.png'), path.join(outDir, 'reference/rep-v2-base-01.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), path.join(outDir, 'reference/rep-real-packshot.png')],
  [path.join(outDir, 'detail/01.png'), path.join(outDir, 'reference/rep-v4-detail-tone-01.png')],
  [path.join(outDir, 'detail/10.png'), path.join(outDir, 'reference/rep-v4-detail-tone-10.png')],
  [path.join(outDir, 'detail/11.png'), path.join(outDir, 'reference/rep-v4-detail-tone-11.png')],
];
const refs=[];
for (const [src,dst] of refPairs) { try { await fs.stat(src); await fs.copyFile(src,dst); refs.push(dst); } catch {} }

const briefs = [
  {
    n: 1,
    title: '크림은 무겁고\n토너는 부족할 때',
    sub: '끈적임 없이 산뜻하게, 수분·진정·보호를 한 번에',
    chips: '#수분충전  #피부진정  #무향',
    visual: 'v2 대표 01과 가장 비슷한 메인 히어로. 제품은 오른쪽 크게, 왼쪽 큰 제목, 하단 물결과 병풀 잎. 성분 아이콘 4개: 8종 히알루론산, 병풀추출물, 해양심층수, Fresh Bud No.6.'
  },
  {
    n: 2,
    title: '수분·진정·보호\n한 번에 데일리 케어',
    sub: '가볍게 발리고 편안하게 머무는 아쿠아 로션',
    chips: '#데일리로션  #산뜻보습  #편안한사용감',
    visual: '제품 중앙 또는 우측, 주변에 3개의 둥근 카드/아이콘: 수분, 진정, 보호. 물방울과 부드러운 흰색 아쿠아 배경.'
  },
  {
    n: 3,
    title: '8종 히알루론산으로\n촘촘한 수분 레이어',
    sub: '건조함이 느껴지는 피부에 산뜻한 보습 루틴',
    chips: '#히알루론산  #수분레이어  #촉촉한피부',
    visual: '히알루론산 분자와 물방울 레이어 느낌. 제품은 우측 또는 중앙 하단에 현실적으로. 과학 포스터처럼 차갑지 않게, v2의 부드러운 광고 톤.'
  },
  {
    n: 4,
    title: '병풀·해양심층수·\nFresh Bud No.6',
    sub: '피부가 편안하게 느끼는 원료 중심 수분 케어',
    chips: '#병풀추출물  #해양심층수  #FreshBudNo6',
    visual: '병풀 잎, 맑은 물, 작은 원료 접시/드롭 아이콘. 제품은 한쪽에 배치. 싱그럽지만 잎이 과하지 않게.'
  },
  {
    n: 5,
    title: '제조 6개월 이내\n신선 제품 보장',
    sub: '제조번호와 제조일자를 확인할 수 있는 신선한 출고 기준',
    chips: '#신선출고  #제조일자표기  #대용량300ml',
    visual: 'v2의 원형 배지 스타일을 활용. 제품 옆에 깨끗한 원형 신선보장 배지. 작은 바닥면/날짜 인쇄 클로즈업은 보조로만, 체크 아이콘 남발 금지.'
  },
  {
    n: 6,
    title: '펌프형 300ml\n매일 쓰기 좋은 수분 로션',
    sub: '얼굴과 건조한 부위에 부담 없이 산뜻하게',
    chips: '#펌프타입  #300ml  #데일리보습',
    visual: '흰색 펌프 상단과 제품을 고급스럽게. 손/펌프 클로즈업 또는 제품 전체 일부. 사용감이 직관적으로 보이는 깨끗한 대표 이미지.'
  }
];

function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];

async function submitAndDownload(brief) {
  const prompt = `쿠팡 대표이미지 후보 정사각형 1장을 실제로 생성해 주세요. 설명만 하지 말고 이미지를 만들어 주세요.\n\n제품: YOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml / 히알루론산 아쿠아 로션\n목표: V2 대표이미지 스타일을 기반으로 한 V4 대표이미지 후보 ${String(brief.n).padStart(2,'0')}\n최종 비율: 1:1 정사각형. 기존 V2 대표처럼 1254×1254에 맞는 구도.\n\n[중요]\n- 반드시 ChatGPT Images 결과물 안에 한국어 텍스트까지 자연스럽게 포함해 주세요. 배경만 만들지 마세요.\n- 업로드한 V2 대표 이미지를 가장 중요한 구도/톤 레퍼런스로 사용하세요.\n- 업로드한 실제 제품 팩샷을 제품 형태/라벨/흰색 용기 기준으로 사용하세요. 제품명은 HYALURONIC ACID AQUA LOTION / 300ml 느낌을 유지하세요.\n- V4 상세컷의 흰색 + 연아쿠아 + 민트 톤과 맞춰 주세요.\n\n[이번 후보의 핵심 카피]\n큰 제목:\n${brief.title}\n\n서브 카피:\n${brief.sub}\n\n해시태그/칩:\n${brief.chips}\n\n[시각 구성]\n${brief.visual}\n\n[공통 디자인]\n- 고급 쿠팡 화장품 대표이미지 느낌.\n- v2처럼 맑은 물결, 물방울, 흰색/연아쿠아 배경, 민트 포인트.\n- 제품은 현실적인 흰색/반투명 화장품 펌프 용기처럼. 내용물은 맑은 물이 아니라 흰색 로션감이 느껴지게.\n- 텍스트는 크고 명확한 한국어 산세리프. 너무 작은 긴 문장 금지.\n- 제품을 너무 왜곡하거나 가짜 브랜드/가짜 박스를 만들지 마세요.\n\n[절대 금지]\n- V2, V4, 컷번호, 후보번호, 01, 02, CUT, STEP, POINT 같은 제작용 표식 금지.\n- 제품명을 데일리 아쿠아 로션, 데일리 수분 로션 등으로 바꾸지 마세요.\n- 의료/치료/완치/질병개선/효능보장 표현 금지.\n- 과한 잎사귀, 가짜 인증마크, 공장 이미지, 포스터처럼 복잡한 아이콘 남발 금지.\n- 한국어 오타/깨짐/잘림 금지.\n\n[검수 기준]\n- V2 대표이미지를 기반으로 한 느낌이 나야 합니다.\n- 제품과 카피가 모바일 썸네일에서도 직관적으로 보여야 합니다.\n- 각 후보는 서로 다른 판매 포인트가 느껴져야 합니다.`;
  await fs.writeFile(path.join(outDir, 'representative-prompts', `${String(brief.n).padStart(2,'0')}-submitted.txt`), prompt);
  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  console.log('opened', brief.n, { url: page.url(), title: await page.title(), refs: refs.length });
  if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('not images url');
  const create = page.getByText('이미지 만들기', { exact: true }).first();
  if (await create.count()) { await create.click({ timeout: 15000 }).catch(()=>{}); await page.waitForTimeout(2500); }
  await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
  const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
  await fs.writeFile(path.join(outDir, 'representative-prompts', `${String(brief.n).padStart(2,'0')}-before-ids.json`), JSON.stringify(before.map(getId), null, 2));
  const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
  await page.setInputFiles(uploadSelectors, refs);
  await page.waitForTimeout(9000);
  for (const text of ['확인', '완료']) { const btn = page.getByRole('button', { name: text }).first(); if (await btn.count()) { await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000); } }
  await page.locator('#prompt-textarea').last().click();
  await page.keyboard.insertText(prompt);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(root, `tmp-v4-rep-${String(brief.n).padStart(2,'0')}-before-send.png`), fullPage: true });
  await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
  await page.waitForTimeout(12000);
  const targetUrl = page.url();
  await fs.writeFile(path.join(outDir, 'representative-prompts', `${String(brief.n).padStart(2,'0')}-chat-url.txt`), targetUrl + '\n');
  console.log('submitted', brief.n, targetUrl);
  const beforeIds = new Set(before.map(getId));
  for (let attempt=1; attempt<=120; attempt++) {
    await page.waitForTimeout(10000);
    const data = await page.evaluate(() => ({
      busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
      imgs: Array.from(document.images).map(img => ({alt: img.alt, src: img.currentSrc||img.src, w: img.naturalWidth, h: img.naturalHeight})).filter(x => x.src.includes('backend-api/estuary/content'))
    }));
    const uniq=[]; const seen=new Set();
    for (const x of data.imgs.map(x=>({...x,id:getId(x.src)})).filter(x => x.w>=900 && x.h>=900 && !beforeIds.has(x.id) && !String(x.alt||'').startsWith('rep-'))) {
      if (!seen.has(x.id)) { seen.add(x.id); uniq.push(x); }
    }
    console.log('poll', brief.n, attempt, 'busy', data.busy, 'candidates', uniq.map(x=>({id:x.id,w:x.w,h:x.h,alt:x.alt})));
    if (uniq.length && !data.busy) {
      const img=uniq.at(-1);
      const b64 = await page.evaluate(async src => { const r=await fetch(src,{credentials:'include'}); if(!r.ok) throw new Error('fetch '+r.status); const ab=await r.arrayBuffer(); const bytes=new Uint8Array(ab); let s=''; for(let i=0;i<bytes.length;i+=0x8000) s+=String.fromCharCode(...bytes.subarray(i,i+0x8000)); return btoa(s); }, img.src);
      const buf=Buffer.from(b64,'base64');
      const raw=path.join(outDir,'representative-raw',`${String(brief.n).padStart(2,'0')}-gpt.png`);
      const final=path.join(repDir,`${String(brief.n).padStart(2,'0')}.png`);
      await fs.writeFile(raw, buf);
      await sharp(buf).resize(1254,1254,{fit:'cover',position:'center'}).png({compressionLevel:9}).toFile(final);
      await fs.writeFile(path.join(outDir,'representative-prompts',`${String(brief.n).padStart(2,'0')}-result.txt`), `${targetUrl}\n${img.src}\n${img.id}\n${buf.length}\n${img.w}x${img.h}\nraw=${raw}\nfinal=${final}\n`);
      console.log('saved', brief.n, final, img.id, buf.length, `${img.w}x${img.h}`);
      await page.close().catch(()=>{});
      return;
    }
  }
  throw new Error('no image for rep '+brief.n);
}

for (const brief of briefs) {
  const finalPath = path.join(repDir, `${String(brief.n).padStart(2,'0')}.png`);
  try {
    await fs.stat(finalPath);
    console.log('skip existing', brief.n, finalPath);
    continue;
  } catch {}
  await submitAndDownload(brief);
}
console.log('done all representatives');
