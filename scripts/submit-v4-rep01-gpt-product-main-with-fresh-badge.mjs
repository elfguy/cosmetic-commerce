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
  [path.join(outDir, 'representative/01.png'), path.join(refDir, 'rep01-badge-01-current-gpt-product-main.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), path.join(refDir, 'rep01-badge-02-real-product-packshot.png')],
  ['/Users/elfguy/.hermes/image_cache/img_79b308d83598.jpeg', path.join(refDir, 'rep01-badge-03-user-coupang-example.jpeg')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/representative/01.png'), path.join(refDir, 'rep01-badge-04-original-coupang-ref.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/representative/01.png'), path.join(refDir, 'rep01-badge-05-v2-ref-badge-style.png')],
];
for (const [src, dst] of candidates) {
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); } catch (e) { console.warn('missing ref', src, e.message); }
}

const prompt = `업로드한 현재 GPT Images 대표 1번 이미지를 기반으로, 쿠팡 상품 대표이미지 1번을 다시 만들어 주세요. 설명만 하지 말고 실제 이미지를 생성해 주세요.\n\n[핵심 목표]\n- 현재 이미지의 장점인 깨끗한 흰 배경 + 제품 중심 + 고급 제품컷 느낌은 유지합니다.\n- 단, 구매 신뢰 포인트로 원형 보장 마크를 반드시 1개 추가합니다.\n- 광고 배너처럼 만들지 말고, 제품만 돋보이는 쿠팡 메인 이미지 느낌을 유지하세요.\n\n[제품]\nYOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml\n히알루론산 아쿠아 로션\n\n[반드시 넣을 마크 문구]\n원형 또는 깔끔한 스티커형 보장 마크 1개:\n제조 6개월 이내\n신선제품 보장\n\n[마크 디자인]\n- 위치: 제품을 가리지 않는 좌하단 또는 우하단.\n- 크기: 작지만 읽히는 정도. 전체 이미지의 약 15~20% 이내.\n- 색상: 기존 V2/V4 톤에 맞는 아쿠아 블루/민트/화이트 계열.\n- 자연스럽고 고급스러운 쿠팡 제품 메인 이미지용 배지.\n- 빨간 경고/과한 인증마크/금색 과장 배지 금지.\n\n[구성 유지]\n- 1:1 정사각형 1254x1254에 맞는 구도.\n- 제품이 화면의 대부분을 차지해야 합니다. 제품 높이 약 75~85%.\n- 흰색 또는 아주 밝은 배경, 부드러운 스튜디오 조명, 자연스러운 그림자.\n- 실제 제품 팩샷의 흰색 용기/펌프/라벨 느낌을 최대한 유지.\n\n[절대 금지]\n- 큰 광고 카피 추가 금지.\n- 수분·진정·보호 해시태그/성분 아이콘/물결 배경/잎사귀 카드 금지.\n- 상세페이지형 레이아웃 금지.\n- V2, V4, CUT, STEP, POINT, 후보번호, 제작용 번호 금지.\n- 가짜 박스/패키지 추가 금지.\n- 제품명을 데일리 아쿠아 로션 등으로 바꾸지 마세요.\n- 합성 티 나는 테두리, 누끼 티, 회색 얼룩, 평면 포스터 느낌 금지.\n\n[완성 기준]\n- 쿠팡 대표 1번 이미지로, 제품이 가장 돋보이고 보장 마크만 자연스럽게 들어가야 합니다.\n- 사용자가 보기에도 이미지 에이전트로 만든 고급 제품컷처럼 보여야 합니다.`;

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
