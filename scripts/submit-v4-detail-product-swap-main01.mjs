import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cleanupStaleImageAgentTabs } from './lib/chrome-tab-cleanup.mjs';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
const promptDir = path.join(outDir, 'detail-prompts');
const refDir = path.join(outDir, 'reference');
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(refDir, { recursive: true });

const targets = [
  {
    n: 1,
    productArea: '중앙 하단의 큰 제품 병',
    keep: '상단 YOURSKIN+, 제목/서브카피/해시태그/신선제품 원형 배지/하단 4개 원료 아이콘/물결과 병풀 배경을 그대로 유지',
  },
  {
    n: 3,
    productArea: '오른쪽 하단의 작은 제품 병',
    keep: '상단 제목/서브카피/4개 타입 카드/체크 아이콘/물결과 병풀 배경을 그대로 유지',
  },
];

async function copy(src, dstName) {
  const dst = path.join(refDir, dstName);
  await fs.copyFile(src, dst);
  return dst;
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
await cleanupStaleImageAgentTabs(ctx, { maxTabs: 2 });

for (const target of targets) {
  const nn = String(target.n).padStart(2, '0');
  const refs = [
    await copy(path.join(outDir, `detail/${nn}.png`), `detail${nn}-product-swap-01-current-base-lock.png`),
    await copy(path.join(outDir, 'representative/01.png'), `detail${nn}-product-swap-02-main01-product-target.png`),
    await copy(path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), `detail${nn}-product-swap-03-real-packshot.png`),
  ];

  const prompt = `V4 상세 이미지 ${target.n}번을 이미지 편집으로 다시 생성해 주세요. 설명만 하지 말고 완성 이미지를 실제로 만들어 주세요.\n\n[작업 목표]\n첫 번째 업로드 이미지(detail${nn}-product-swap-01-current-base-lock.png)를 BASE CANVAS로 사용하세요.\n제품 병 내용물이 적게 표현되어 보이는 문제가 있으므로, 제품 이미지만 두 번째 업로드 이미지 대표 메인 1번의 제품처럼 내용물이 충분하고 꽉 찬 제품으로 교체해 주세요.\n\n[가장 중요한 규칙]\n이 작업은 product-only edit 입니다. 전체 디자인을 새로 만들지 마세요.\n${target.productArea}만 교체 대상입니다.\n${target.keep}하세요.\n한국어 문구, 글자 위치, 폰트 느낌, 카드 개수, 아이콘, 배지, 물방울, 잎사귀, 배경, 전체 레이아웃은 그대로 유지하세요.\n\n[제품 교체 기준]\n- 두 번째 업로드 이미지 대표 메인 1번의 제품 병을 가장 중요한 제품 이미지 기준으로 사용하세요.\n- 세 번째 업로드 실제 팩샷은 형태/라벨/펌프/투명한 어깨/흰색 로션 내용물 기준으로 사용하세요.\n- 제품은 YOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml로 보여야 합니다.\n- 투명한 원통형 병 상단과 내부의 흰색 로션 내용물이 충분히 차 있는 느낌이 나야 합니다.\n- 흰색 펌프와 라벨 정체성을 유지하세요.\n- 기존 제품 위치와 크기는 크게 바꾸지 말고, 기존 영역 안에서 더 선명하고 내용물이 충분한 제품으로 교체하세요.\n- 제품이 흐릿하거나 내용물이 비어 보이면 안 됩니다.\n\n[절대 금지]\n- 문구 변경, 오타 생성, 새 문구 추가, 문구 삭제 금지.\n- 제목/카드/아이콘/배지/해시태그 위치 변경 금지.\n- 카드 개수 변경 금지.\n- 새 인증마크, 새 번호, V4, CUT, STEP, POINT, 후보번호 추가 금지.\n- 제품명을 데일리 아쿠아 로션 등 다른 이름으로 변경 금지.\n- 가짜 박스/패키지 추가 금지.\n- 의료/치료/질병개선 표현 추가 금지.\n- 제품이 너무 작아지거나 너무 크게 확대되어 텍스트를 가리는 것 금지.\n- 전체 배경이나 정보 구조를 새 디자인으로 바꾸기 금지.\n\n[완성 기준]\n기존 상세 ${target.n}번과 거의 같은 이미지로 보이되, 제품 병만 대표 메인 1번 제품처럼 내용물이 충분하고 상품 인식이 좋은 병으로 교체되어야 합니다. 최종 세로 비율은 780x1360 상세 이미지 구도입니다.`;

  await fs.writeFile(path.join(promptDir, `${nn}-product-swap-main01-submitted.txt`), prompt);
  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  console.log('opened-images-workspace', { n: target.n, url: page.url(), title: await page.title(), uploadFiles: refs.length });
  if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('not Images workspace');
  const create = page.getByText('이미지 만들기', { exact: true }).first();
  if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(2000); }
  await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
  const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
  const getId = src => { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } };
  await fs.writeFile(path.join(promptDir, `${nn}-product-swap-main01-before-ids.json`), JSON.stringify(before.map(getId), null, 2));
  const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
  await page.setInputFiles(uploadSelectors, refs);
  await page.waitForTimeout(9000);
  for (const text of ['확인', '완료']) {
    const btn = page.getByRole('button', { name: text }).first();
    if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
  }
  await page.locator('#prompt-textarea').last().click();
  await page.keyboard.insertText(prompt);
  await page.screenshot({ path: path.join(root, `tmp-v4-detail${nn}-product-swap-main01-before-send.png`), fullPage: true });
  await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
  await page.waitForTimeout(10000);
  await fs.writeFile(path.join(promptDir, `${nn}-product-swap-main01-chat-url.txt`), page.url() + '\n');
  console.log('submitted', { n: target.n, finalUrl: page.url() });
}
console.log('submitted detail product swaps');
