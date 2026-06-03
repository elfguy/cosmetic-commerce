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
  [path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), path.join(refDir, 'rep01-gpt-main-01-real-product-packshot.png')],
  ['/Users/elfguy/.hermes/image_cache/img_79b308d83598.jpeg', path.join(refDir, 'rep01-gpt-main-02-user-coupang-example.jpeg')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/representative/01.png'), path.join(refDir, 'rep01-gpt-main-03-v2-style-ref.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/representative/01.png'), path.join(refDir, 'rep01-gpt-main-04-original-coupang-ref.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/representative/01.png'), path.join(refDir, 'rep01-gpt-main-05-local-composite-negative.png')],
];
for (const [src, dst] of candidates) {
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); } catch (e) { console.warn('missing ref', src, e.message); }
}

const prompt = `쿠팡 상품 대표이미지 1번으로 사용할 정사각형 메인 제품 이미지 1장을 실제로 생성해 주세요. 설명만 하지 말고 이미지를 만들어 주세요.\n\n[가장 중요한 목표]\n- 광고 배너/상세페이지 이미지가 아닙니다.\n- 쿠팡 검색결과와 상품 첫 이미지에서 제품 자체가 가장 먼저 보이는 대표 1번 이미지입니다.\n- 업로드한 실제 제품 팩샷을 기준으로, 제품이 화면의 대부분을 차지하도록 자연스럽고 고급스럽게 표현해 주세요.\n\n[제품]\nYOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml\n히알루론산 아쿠아 로션\n\n[참고 이미지 역할]\n1) 실제 제품 팩샷: 제품 형태, 흰색 용기, 펌프, 라벨/브랜드 기준입니다. 가장 중요합니다.\n2) 사용자가 준 쿠팡 예시: 흰 배경, 제품 중심, 과한 디자인 없는 메인 이미지 구성 기준입니다.\n3) V2 대표 이미지: 이전 톤 참고용이지만, 이번에는 배너 카피/물결/잎사귀를 따라하지 마세요.\n4) 원본 쿠팡 대표: 쿠팡 메인 이미지의 단순함 참고용입니다.\n5) 로컬 합성 이미지는 부정 참고입니다. 이처럼 합성 티 나거나 평면적으로 보이면 실패입니다.\n\n[구성 지시]\n- 1:1 정사각형, 1254x1254에 맞는 구도.\n- 깨끗한 흰색 또는 아주 밝은 미색 배경.\n- 제품을 중앙 또는 약간 우측 중앙에 크게 배치. 제품 높이가 이미지의 약 75~85%를 차지하게 해 주세요.\n- 자연스러운 제품 사진 느낌: 실제 촬영한 흰색 화장품 펌프 용기, 부드러운 스튜디오 조명, 자연스러운 바닥 그림자.\n- 제품 라벨은 가능한 한 실제 팩샷의 느낌을 유지하고, 가짜 브랜드명/다른 제품명으로 바꾸지 마세요.\n- 배지는 넣더라도 아주 작고 자연스럽게 1개 이하만. 가능하면 제품만으로 구성해도 됩니다.\n\n[절대 금지]\n- 큰 한국어 광고 카피 금지.\n- 수분·진정·보호 같은 배너 문구/해시태그/아이콘 금지.\n- 물결 배경, 과한 잎사귀, 성분 카드, 상세페이지형 레이아웃 금지.\n- V2, V4, CUT, STEP, POINT, 후보번호, 제작용 번호 금지.\n- 합성 티 나는 테두리, 누끼 티, 회색 얼룩, 평면 포스터 느낌 금지.\n- 가짜 박스/패키지 추가 금지.\n- 제품명을 데일리 아쿠아 로션 등으로 바꾸지 마세요.\n\n[완성 기준]\n- 사용자가 보기에 “에이전트로 만든 고급 제품컷”처럼 보여야 합니다.\n- 쿠팡 대표 1번 이미지로 제품만 돋보여야 합니다.\n- 상세페이지 광고 이미지처럼 보이면 실패입니다.`;

await fs.writeFile(path.join(promptDir, '01-gpt-product-main-submitted.txt'), prompt);

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
await fs.writeFile(path.join(promptDir, '01-gpt-product-main-before-ids.json'), JSON.stringify(before.map(src => { try { return new URL(src).searchParams.get('id') || src } catch { return src } }), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(9000);
for (const text of ['확인','완료']) { const btn = page.getByRole('button', { name: text }).first(); if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(()=>{}); await page.waitForTimeout(1000); } }
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-rep01-gpt-product-main-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(10000);
await fs.writeFile(path.join(promptDir, '01-gpt-product-main-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url() });
