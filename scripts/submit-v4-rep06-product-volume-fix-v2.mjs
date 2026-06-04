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
async function copyRef(src, dstName) {
  const dst = path.join(refDir, dstName);
  await fs.copyFile(src, dst);
  refs.push(dst);
}
await copyRef(path.join(outDir, 'representative/06.png'), 'rep06-volume-v2-01-current-base-lock.png');
await copyRef(path.join(outDir, 'representative/01.png'), 'rep06-volume-v2-02-size-target-rep01.png');
await copyRef(path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), 'rep06-volume-v2-03-real-product-packshot.png');

const prompt = `쿠팡 대표이미지 6번을 다시 이미지 편집으로 생성해 주세요. 설명만 하지 말고 완성 이미지를 실제로 만들어 주세요.\n\n[핵심 피드백]\n현재 6번은 제품 병이 아직 덜 찬 느낌입니다. 제품이 더 커지고, 300ml 펌프형 대용량 로션처럼 우측을 가득 채워야 합니다.\n\n[가장 중요한 작업 방식]\n첫 번째 업로드 이미지(rep06-volume-v2-01-current-base-lock.png)를 BASE CANVAS로 사용하세요.\n디자인/배경/물결/물방울/카드/아이콘/한국어 문구/색감/전체 레이아웃은 그대로 유지하세요.\n이번 작업은 제품 병만 더 크게 만드는 product-only edit 입니다.\n\n[제품 크기 목표 — 반드시 반영]\n- 제품 병은 현재 6번보다 확실히 더 크게 만드세요.\n- 두 번째 업로드 이미지 대표 1번처럼 제품이 화면 우측에서 시원하게 꽉 차 보여야 합니다.\n- 제품 병 높이는 이미지 전체 높이의 약 62~72% 수준으로 보이게 하세요.\n- 제품 병은 우측 세로 공간 대부분을 차지하게 하되, 펌프와 바닥이 잘리지 않아야 합니다.\n- 제품 병 좌우 폭도 조금 더 넓게 보여서 300ml 용량감이 나야 합니다.\n- 제품을 단순히 오른쪽 아래 작은 소품처럼 두지 마세요. 대표 6번의 메인 판매 포인트가 펌프형 300ml이므로 제품 자체가 확실한 주인공이어야 합니다.\n\n[참고 이미지 역할]\n1) 현재 6번: 문구/레이아웃/배경/아이콘을 그대로 유지할 기준\n2) 대표 1번: 제품이 크게 차 보이는 크기감의 기준\n3) 실제 팩샷: 제품 형태/흰색 펌프/투명한 어깨/흰색 로션 내용물/라벨 정체성 기준\n\n[반드시 유지해야 하는 문구]\n- 큰 제목: 펌프형 300ml / 매일 쓰기 좋은 수분 로션\n- 서브/칩/아이콘 등 현재 6번에 있는 모든 한국어 문구를 의미상 그대로 유지\n- 문구 위치와 좌측 정보 구조 유지\n\n[제품 표현]\n- YOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml로 보여야 합니다.\n- 흰색 펌프, 투명한 원통형 병 상단, 내부는 맑은 물이 아니라 흰색 로션 내용물 느낌.\n- 라벨은 너무 작게 보이지 않게, 대표 1번처럼 상품 인식이 잘 되게.\n\n[절대 금지]\n- 문구 변경, 오타 생성, 새 문구 추가, 문구 삭제 금지.\n- 좌측 제목/카드/아이콘 위치를 크게 바꾸기 금지.\n- 새 인증마크, 번호, V4, CUT, STEP, POINT, 후보번호 추가 금지.\n- 제품명을 데일리 아쿠아 로션 등 다른 이름으로 변경 금지.\n- 가짜 박스/패키지 추가 금지.\n- 의료/치료/질병개선 표현 추가 금지.\n- 전체 디자인을 새로 만드는 것 금지.\n\n[완성 기준]\n기존 6번과 같은 이미지로 보이지만, 오른쪽 제품 병만 훨씬 더 커져서 대표 1번처럼 가득 차고 300ml 용량감이 강하게 느껴져야 합니다.`;

await fs.writeFile(path.join(promptDir, '06-product-volume-fix-v2-submitted.txt'), prompt);

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
await cleanupStaleImageAgentTabs(ctx, { maxTabs: 2 });
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
console.log('opened-images-workspace', { url: page.url(), title: await page.title(), uploadFiles: refs.length });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('not Images workspace');
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(2000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
const getId = src => { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } };
await fs.writeFile(path.join(promptDir, '06-product-volume-fix-v2-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(9000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-rep06-product-volume-v2-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(10000);
await fs.writeFile(path.join(promptDir, '06-product-volume-fix-v2-chat-url.txt'), page.url() + '\n');
console.log('submitted', { finalUrl: page.url() });
