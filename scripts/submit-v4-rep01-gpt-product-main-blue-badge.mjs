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
  [path.join(outDir, 'representative/01.png'), path.join(refDir, 'rep01-blue-badge-01-current-green-badge.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), path.join(refDir, 'rep01-blue-badge-02-real-product-packshot.png')],
  ['/Users/elfguy/.hermes/image_cache/img_79b308d83598.jpeg', path.join(refDir, 'rep01-blue-badge-03-user-coupang-example.jpeg')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/representative/01.png'), path.join(refDir, 'rep01-blue-badge-04-v2-ref.png')],
];
for (const [src, dst] of candidates) {
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); } catch (e) { console.warn('missing ref', src, e.message); }
}

const prompt = `업로드한 현재 대표 1번 이미지를 기반으로 쿠팡 상품 대표이미지 1번을 다시 만들어 주세요. 설명만 하지 말고 실제 이미지를 생성해 주세요.\n\n[수정 목표]\n현재 이미지는 제품 중심 구도는 좋지만, 좌하단 보장 마크 색이 제품 라벨/전체 톤과 어울리지 않습니다.\n제품, 흰 배경, 제품 중심 구도는 유지하고, 보장 마크를 제품 라벨과 어울리는 청량한 블루 + 화이트 계열로 다시 디자인해 주세요.\n\n[제품]\nYOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml\n히알루론산 아쿠아 로션\n\n[반드시 유지할 것]\n- 쿠팡 대표 1번 메인 이미지 느낌: 흰 배경 + 제품 크게 + 최소 요소.\n- 제품이 화면 대부분을 차지해야 합니다.\n- 제품 형태/펌프/라벨은 실제 팩샷 느낌을 최대한 유지.\n- 보장 마크 문구는 반드시 유지:\n  제조 6개월 이내\n  신선제품 보장\n\n[보장 마크 색/디자인 수정]\n- 기존 초록/탁한 민트 느낌은 줄이세요.\n- 제품 라벨의 파란색과 어울리는 맑은 아쿠아 블루/스카이블루/화이트 계열만 사용하세요.\n- 원형 또는 부드러운 라운드 스티커 형태.\n- 배경은 거의 흰색, 테두리는 얇은 블루, 텍스트는 진한 블루.\n- 크기는 전체 이미지의 약 15~18% 정도로 작고 깔끔하게.\n- 위치는 좌하단 또는 제품을 가리지 않는 하단 구석.\n- 고급스럽고 자연스럽게, 나중에 얹은 스티커처럼 튀지 않게.\n\n[절대 금지]\n- 큰 광고 카피 추가 금지.\n- 성분 아이콘, 해시태그, 물결 배경, 잎사귀 카드, 상세페이지형 레이아웃 금지.\n- 빨간색/노란색/금색/초록색이 강한 인증마크 금지.\n- V2, V4, CUT, STEP, POINT, 후보번호, 제작용 번호 금지.\n- 가짜 박스/패키지 추가 금지.\n- 제품명을 데일리 아쿠아 로션 등으로 바꾸지 마세요.\n- 합성 티 나는 테두리, 누끼 티, 회색 얼룩, 평면 포스터 느낌 금지.\n\n[완성 기준]\n제품 중심 메인 이미지로 보이고, 보장 마크 색상이 제품 라벨의 블루톤과 자연스럽게 맞아야 합니다.`;

await fs.writeFile(path.join(promptDir, '01-gpt-product-main-blue-badge-submitted.txt'), prompt);

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
await fs.writeFile(path.join(promptDir, '01-gpt-product-main-blue-badge-before-ids.json'), JSON.stringify(before.map(src => { try { return new URL(src).searchParams.get('id') || src } catch { return src } }), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(9000);
for (const text of ['확인','완료']) { const btn = page.getByRole('button', { name: text }).first(); if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(()=>{}); await page.waitForTimeout(1000); } }
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-rep01-gpt-blue-badge-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(10000);
await fs.writeFile(path.join(promptDir, '01-gpt-product-main-blue-badge-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url() });
