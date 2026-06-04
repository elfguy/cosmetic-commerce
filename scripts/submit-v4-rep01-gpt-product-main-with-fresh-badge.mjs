import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
const promptDir = path.join(outDir, 'representative-prompts');
const refDir = path.join(outDir, 'reference');
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(refDir, { recursive: true });

const refs = [];
const candidates = [
  // Positive reference: V1 representative 01 has the desired top-left circular fresh icon style.
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v1/representative/01.png'), path.join(refDir, 'rep01-badge-01-v1-icon-style-positive.png')],
  // Product identity references. Preserve the real bottle/pump/label as much as possible.
  [path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), path.join(refDir, 'rep01-badge-02-real-product-packshot.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/representative/01.png'), path.join(refDir, 'rep01-badge-03-original-product-reference.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/representative/01.png'), path.join(refDir, 'rep01-badge-04-clean-coupang-main-reference.png')],
];
for (const [src, dst] of candidates) {
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); } catch (e) { console.warn('missing ref', src, e.message); }
}

const prompt = `쿠팡 상품 대표이미지 1번으로 사용할 정사각형 이미지 1장을 실제로 생성해 주세요. 설명만 하지 말고 이미지를 만들어 주세요.\n\n[중요: 이번 작업은 로컬 합성이 아니라 GPT Images로 자연스럽게 새로 생성하는 작업입니다]\n업로드한 참조 중 V1 대표이미지 1번의 좌상단 원형 신선제품 아이콘 스타일을 참고하고, 실제 제품 팩샷/원본 대표이미지의 제품 형태와 라벨을 최대한 보존해 주세요.\n\n[핵심 목표]\n- V4 대표이미지 1번을 V1 대표이미지 1번처럼: 흰 배경 + 제품 중심 + 좌상단 원형 신선제품 아이콘 구성으로 만듭니다.\n- 아이콘은 V1처럼 좌상단에 배치합니다. 제품을 가리지 마세요.\n- 아이콘 안의 아래 문구 “제조 6개월 이내”가 V1보다 더 크게, 더 잘 읽히게 보여야 합니다.\n- 전체적으로 쿠팡 메인 썸네일에서 제품과 신선 제조 포인트가 바로 보이게 해 주세요.\n\n[제품]\nYOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml\n히알루론산 아쿠아 로션\n흰색 내용물, 투명한 상단 용기, 흰색 펌프, 실제 라벨 느낌을 유지합니다.\n\n[아이콘 문구 — 반드시 정확히]\n상단/메인: 신선 제품\n하단: 제조 6개월 이내\n\n[아이콘 디자인]\n- 위치: 좌상단, V1 이미지처럼 제품 왼쪽 위 여백에 배치.\n- 형태: 원형 스티커/도장형 아이콘. 흰 바탕, 초록+아쿠아/블루 링, 작은 잎사귀 포인트.\n- “신선 제품”은 초록색 굵은 글씨.\n- “제조 6개월 이내”는 파란색 굵은 글씨이며 반드시 크게 보이게. 너무 작게 만들지 마세요.\n- 아이콘 크기는 이미지 전체의 약 20~24% 정도. V1보다 하단 문구가 더 읽혀야 합니다.\n\n[구성]\n- 1:1 정사각형 1254x1254 비율.\n- 흰색/아주 밝은 배경, 부드러운 스튜디오 조명, 자연스러운 그림자.\n- 제품은 중앙 또는 약간 오른쪽 중심. 제품 높이 약 75~82%.\n- 제품과 아이콘 외 추가 카피/장식은 넣지 않습니다.\n\n[절대 금지]\n- 로컬 합성처럼 보이는 흰 박스, 배지 지운 흔적, 누끼 티, 회색 얼룩 금지.\n- 제품 라벨 문구 왜곡 금지. YOURSKIN+, HYALURONIC ACID, AQUA LOTION, 300ml 표기가 최대한 정확해야 합니다.\n- 가짜 박스/패키지 추가 금지.\n- 하단/우하단 배지 금지. 아이콘은 좌상단 하나만.\n- 수분/진정/보호 해시태그, 성분 아이콘, 물결 배경, 상세페이지형 레이아웃 금지.\n- V1, V4, CUT, STEP, POINT, 후보번호, 제작용 번호 금지.\n- 의료/치료/아토피 표현 금지.\n\n[완성 기준]\n- V1 대표 1번과 같은 깔끔한 쿠팡 메인 이미지 느낌.\n- 제품이 가장 돋보이고, 좌상단 신선제품 아이콘의 “제조 6개월 이내”가 모바일에서도 읽히는 크기.\n- 고급스럽고 자연스러운 이미지 생성 결과물이어야 합니다.`;

await fs.writeFile(path.join(promptDir, '01-gpt-product-main-with-fresh-badge-submitted.txt'), prompt);

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
console.log('opened-images-workspace', { url: page.url(), title: await page.title(), uploadFiles: refs.length });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('not Images workspace');
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(()=>{}); await page.waitForTimeout(2000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(promptDir, '01-gpt-product-main-with-fresh-badge-before-ids.json'), JSON.stringify(before.map(src => { try { return new URL(src).searchParams.get('id') || src } catch { return src } }), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(9000);
for (const text of ['확인','완료']) { const btn = page.getByRole('button', { name: text }).first(); if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(()=>{}); await page.waitForTimeout(1000); } }
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-rep01-gpt-product-main-with-badge-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(10000);
await fs.writeFile(path.join(promptDir, '01-gpt-product-main-with-fresh-badge-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url() });
