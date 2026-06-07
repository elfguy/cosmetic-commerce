import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cleanupStaleImageAgentTabs } from './lib/chrome-tab-cleanup.mjs';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
const promptDir = path.join(outDir, 'representative-prompts');
const refDir = path.join(outDir, 'reference');
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(refDir, { recursive: true });

const refs = [];
const candidates = [
  [path.join(outDir, 'representative/01.png'), path.join(refDir, 'rep01-center-01-current-shifted-right-structure.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), path.join(refDir, 'rep01-center-02-real-product-packshot.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v1/representative/01.png'), path.join(refDir, 'rep01-center-03-fresh-badge-style-ref.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/detail/01.png'), path.join(refDir, 'rep01-center-04-product-realism-ref.png')],
];
for (const [src, dst] of candidates) {
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); }
  catch (e) { console.warn('missing ref', src, e.message); }
}

const prompt = `쿠팡 대표이미지 1번으로 사용할 정사각형 이미지를 실제로 새로 생성/수정해 주세요. 설명만 하지 말고 이미지를 만들어 주세요.\n\n[이번 수정의 핵심]\n현재 이미지에서 좌상단 원형 신선제품 마크 때문에 상품 병이 오른쪽으로 치우쳐 보입니다.\n상품 병 자체가 이미지의 시각적 중앙에 오도록 다시 배치해 주세요.\n\n[참고 이미지 역할]\n1) 현재 대표 01: 전체 구조, 흰 배경, 좌상단 신선제품 마크, 상품 크기/톤 참고. 단, 상품 위치가 오른쪽으로 치우친 문제는 반드시 수정.\n2) 실제 제품 팩샷: 제품 형태, 펌프, 라벨, 300ml 표기 기준.\n3) V1 대표 01: 신선제품 마크의 스타일 참고.\n4) 상세 01: 제품의 입체감/광택/현실감 참고.\n\n[반드시 유지]\n- 1:1 정사각형, 1254x1254 비율.\n- 깨끗한 흰색/아주 밝은 배경.\n- 좌상단 원형 마크 1개 유지.\n- 마크 문구는 정확히: “신선 제품” / “제조 6개월 이내”.\n- 제품은 YOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml.\n- 흰색 펌프, 투명한 상단 용기, 흰색 내용물, 기존 라벨 느낌 유지.\n- 제품 높이는 현재처럼 약 78~84% 정도로 크게 유지.\n- 부드러운 스튜디오 조명과 자연스러운 바닥 그림자.\n\n[바꿀 것]\n- 제품 병 중심선을 이미지 전체 중앙축에 맞춰 주세요.\n- 현재보다 제품을 왼쪽으로 이동해서, 배지와 상품을 함께 봐도 상품이 오른쪽으로 밀려 보이지 않게 해 주세요.\n- 단, 제품이 좌상단 마크와 겹치거나 라벨이 가려지면 안 됩니다.\n- 상품은 중앙에 안정적으로 서 있고, 마크는 좌상단 여백에 자연스럽게 있어야 합니다.\n\n[절대 금지]\n- 상품을 오른쪽으로 치우치게 배치 금지.\n- 상품 라벨/브랜드/제품명/용량 변경 금지.\n- 마크를 오른쪽/하단으로 옮기지 마세요. 좌상단 유지.\n- 마크가 상품을 덮거나 라벨을 가리는 것 금지.\n- 큰 광고 카피, 해시태그, 물결 배경, 성분 아이콘, 상세페이지형 카드 추가 금지.\n- 가짜 박스/패키지 추가 금지.\n- 로컬 합성처럼 보이는 흰 박스, 누끼 테두리, 회색 얼룩, 붙인 티 금지.\n- V1, V4, CUT, STEP, POINT, 후보번호, 제작용 번호 금지.\n\n[완성 기준]\n- 쿠팡 검색 썸네일에서 상품 병이 화면 중앙에 안정적으로 보입니다.\n- 좌상단 신선제품 마크는 유지되지만, 상품을 오른쪽으로 밀어낸 느낌이 없어야 합니다.\n- 기존 대표 01과 같은 고급 제품컷 품질을 유지하되, 상품 위치만 중앙으로 개선합니다.`;

await fs.writeFile(path.join(promptDir, '01-center-product-agent-submitted.txt'), prompt);

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
await cleanupStaleImageAgentTabs(ctx, { maxTabs: 2 });
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
console.log('opened-images-workspace', { url: page.url(), title: await page.title(), uploadFiles: refs.length });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('not Images workspace');
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(()=>{}); await page.waitForTimeout(2000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(promptDir, '01-center-product-agent-before-ids.json'), JSON.stringify(before.map(src => { try { return new URL(src).searchParams.get('id') || src } catch { return src } }), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(9000);
for (const text of ['확인','완료']) { const btn = page.getByRole('button', { name: text }).first(); if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(()=>{}); await page.waitForTimeout(1000); } }
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-rep01-center-product-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(10000);
await fs.writeFile(path.join(promptDir, '01-center-product-agent-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url(), title: await page.title() });
