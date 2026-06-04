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

const targets = [
  {
    n: 3,
    issue: '오른쪽 제품 병이 작아서 300ml 대용량감이 약함',
    desired: '대표 1번처럼 오른쪽 제품 병을 더 키워 세로로 길고 가득 차 보이게. 단, 왼쪽 제목/아이콘/물결 배경은 그대로 유지.',
  },
  {
    n: 5,
    issue: '오른쪽 제품 병이 작아서 300ml 신선제품의 용량감이 약함',
    desired: '대표 1번처럼 오른쪽 제품 병을 크게 키워 화면 우측을 더 채우게. 단, 왼쪽 제조일자 클로즈업 카드와 모든 문구는 그대로 유지.',
  },
  {
    n: 6,
    issue: '오른쪽 제품 병이 작아서 펌프형 300ml의 대용량감이 약함',
    desired: '대표 1번처럼 오른쪽 제품 병을 크게 키워 펌프와 300ml 용량감이 한눈에 보이게. 단, 왼쪽 제목/아이콘/물방울 배경은 그대로 유지.',
  },
];

async function copyRef(src, dstName) {
  const dst = path.join(refDir, dstName);
  await fs.copyFile(src, dst);
  return dst;
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
await cleanupStaleImageAgentTabs(ctx, { maxTabs: 2 });

for (const target of targets) {
  const nn = String(target.n).padStart(2, '0');
  const base = await copyRef(path.join(outDir, `representative/${nn}.png`), `rep${nn}-product-volume-01-current-base-lock.png`);
  const rep01 = await copyRef(path.join(outDir, 'representative/01.png'), `rep${nn}-product-volume-02-size-target-rep01.png`);
  const packshot = await copyRef(path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), `rep${nn}-product-volume-03-real-product-packshot.png`);
  const refs = [base, rep01, packshot];

  const prompt = `쿠팡 대표이미지 ${target.n}번을 이미지 편집으로 다시 생성해 주세요. 설명만 하지 말고 완성 이미지를 실제로 만들어 주세요.\n\n[가장 중요한 지시]\n첫 번째 업로드 이미지(rep${nn}-product-volume-01-current-base-lock.png)를 완성본의 BASE CANVAS로 사용하세요.\n디자인, 배경, 물결, 물방울, 잎사귀, 카드, 아이콘, 원형 배지, 한국어 문구, 제목 위치, 색감, 전체 레이아웃은 변경하지 마세요.\n이번 작업은 제품 병 크기/존재감만 수정하는 product-only edit 입니다.\n\n[현재 문제]\n${target.issue}\n\n[수정 목표]\n${target.desired}\n- 두 번째 업로드 이미지(대표 1번)를 제품 크기/가득 찬 느낌의 기준으로 삼으세요.\n- 세 번째 업로드 이미지(실제 팩샷)를 병 형태, 흰색 펌프, 투명한 어깨, 흰색 로션 내용물, 라벨 정체성 기준으로 삼으세요.\n- 제품은 YOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml로 보여야 합니다.\n- 병은 기존보다 확실히 크게, 화면 우측에서 더 꽉 차게 보이게 하세요.\n- 다만 텍스트나 아이콘을 가리거나 자르지 말고 자연스럽게 우측 공간 안에서 키워 주세요.\n- 제품 하단이 잘리거나 펌프가 잘리지 않게 안전 여백을 둡니다.\n\n[반드시 유지]\n- 기존 대표 ${target.n}번의 한국어 카피와 위치를 유지.\n- 기존 대표 ${target.n}번의 아이콘/카드/원형 배지/해시태그를 유지.\n- 기존 대표 ${target.n}번의 화이트 + 연아쿠아 + 민트 톤을 유지.\n- 기존 대표 ${target.n}번의 전체 구성을 유지.\n\n[절대 금지]\n- 문구 변경, 오타 생성, 새 문구 추가, 문구 삭제 금지.\n- 제목/아이콘/카드/배지/해시태그 위치 변경 금지.\n- 새 인증마크, 새 번호, V4, CUT, STEP, POINT, 후보번호 같은 제작용 표식 추가 금지.\n- 제품명을 데일리 아쿠아 로션 등 다른 이름으로 변경 금지.\n- 가짜 박스/패키지 추가 금지.\n- 의료/치료/질병개선 표현 추가 금지.\n- 배경을 새 디자인으로 갈아엎기 금지.\n\n[완성 기준]\n기존 대표 ${target.n}번과 거의 같은 이미지로 보이되, 오른쪽 제품 병만 대표 1번처럼 더 크고 300ml 대용량 제품처럼 가득 차 보여야 합니다.`;

  await fs.writeFile(path.join(promptDir, `${nn}-product-volume-fix-submitted.txt`), prompt);

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
  await fs.writeFile(path.join(promptDir, `${nn}-product-volume-fix-before-ids.json`), JSON.stringify(before.map(getId), null, 2));
  const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
  await page.setInputFiles(uploadSelectors, refs);
  await page.waitForTimeout(9000);
  for (const text of ['확인', '완료']) {
    const btn = page.getByRole('button', { name: text }).first();
    if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
  }
  await page.locator('#prompt-textarea').last().click();
  await page.keyboard.insertText(prompt);
  await page.screenshot({ path: path.join(root, `tmp-v4-rep${nn}-product-volume-before-send.png`), fullPage: true });
  await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
  await page.waitForTimeout(10000);
  await fs.writeFile(path.join(promptDir, `${nn}-product-volume-fix-chat-url.txt`), page.url() + '\n');
  console.log('submitted', { n: target.n, finalUrl: page.url() });
}
console.log('submitted all product-volume fixes');
