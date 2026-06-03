import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v5-gpt-images-workspace');
const oldV4 = path.join(root, 'public/coupang/images/aqua-lotion/versions/archive/v4-message-generated-invalid');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'detail'), { recursive: true });
await fs.mkdir(path.join(outDir, 'representative'), { recursive: true });

const refs = [
  [path.join(oldV4, 'reference/v4-reference-board.png'), 'v5-proof01-ref-board.png'],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/representative/01.png'), 'v5-proof01-original-rep01.png'],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/representative/01.png'), 'v5-proof01-v2-rep01.png'],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v3/detail/01.png'), 'v5-proof01-v3-detail01.png'],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/01.png'), 'v5-proof01-v2-detail01.png'],
];
const uploadFiles = [];
for (const [src, name] of refs) {
  const dest = path.join(outDir, 'reference', name);
  await fs.copyFile(src, dest);
  uploadFiles.push(dest);
}

const globalBrief = await fs.readFile(path.join(oldV4, 'prompts/00-global-brief.txt'), 'utf8');
const cutPrompt = await fs.readFile(path.join(oldV4, 'prompts/01-hero.txt'), 'utf8');
const prompt = `${globalBrief}\n\n${cutPrompt}\n\n[이번 작업의 핵심 규칙]\n- 반드시 현재 ChatGPT Images 2.0 이미지 생성 화면에서 새 이미지 파일로 생성한다.\n- 일반 ChatGPT 메시지 답변으로 설명하지 말고, 실제 이미지를 생성한다.\n- 이 proof는 V5 후보의 01번 히어로 한 장만 만든다.\n- 비율은 세로형 긴 모바일 상세페이지, 약 941×1672.\n- 기존 불합격 V4의 스타일을 그대로 베끼지 말고, 첨부된 V2/V3/원본 피드백을 반영해 새로 만든다.\n- 제품 내용물은 흰색, 용기 맨 윗부분은 투명하게 비어 보이게 한다.\n- 이미지 안에 CUT/DETAIL CUT/POINT/STEP/번호 배지/가이드 라벨 금지.\n\n위 조건으로 V5 proof 상세 01 히어로 이미지를 1장 생성해줘.`;
await fs.writeFile(path.join(outDir, 'prompts/01-proof-submitted.txt'), prompt);

function estuaryIds(urls) {
  return urls.map((src) => {
    try { return new URL(src).searchParams.get('id') || src; } catch { return src; }
  }).filter(Boolean);
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);

const title = await page.title();
const body = await page.locator('body').innerText({ timeout: 10000 });
if (!title.includes('Images') && !body.includes('이미지 만들기')) {
  throw new Error(`Not on Images workspace: title=${title}`);
}
console.log('workspace verified', { url: page.url(), title });

const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) {
  await create.click({ timeout: 15000 }).catch(async () => {
    await page.locator('button').filter({ hasText: '이미지 만들기' }).first().click({ timeout: 15000 });
  });
  await page.waitForTimeout(3000);
}

await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
console.log('before ids', estuaryIds(before));

await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length);
await page.waitForTimeout(10000);

// Dismiss duplicate or confirmation dialogs if any, but do not click security/payment dialogs.
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) {
    await btn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }
}

await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
console.log('submitted', { url: page.url(), title: await page.title() });
await page.screenshot({ path: path.join(root, 'tmp-v5-proof01-images-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/01-proof-chat-url.txt'), page.url() + '\n');
