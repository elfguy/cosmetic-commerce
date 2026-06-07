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
  [path.join(outDir, 'representative/01.png'), path.join(refDir, 'rep01-center-v2-01-current-exact-base.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), path.join(refDir, 'rep01-center-v2-02-real-packshot-label-ref.png')],
  [path.join(outDir, 'representative-raw/01-center-product-agent-20260607T004343Z-1254.png'), path.join(refDir, 'rep01-center-v2-03-negative-label-changed.png')],
];
for (const [src, dst] of candidates) {
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); }
  catch (e) { console.warn('missing ref', src, e.message); }
}

const prompt = `쿠팡 대표이미지 1번을 실제로 다시 생성/수정해 주세요. 설명만 하지 말고 이미지를 만들어 주세요.\n\n[목표: 기존 이미지의 제품/라벨/배지 스타일은 그대로 유지하고, 상품 위치만 중앙으로 개선]\n현재 대표 01 이미지는 품질과 라벨은 좋지만, 좌상단 신선제품 마크 때문에 제품 병이 오른쪽으로 밀려 보입니다.\n기존 이미지와 거의 같은 제품컷을 유지하면서, 제품 병의 중심선이 이미지 전체 중앙축에 오도록 약간 왼쪽으로 재배치해 주세요.\n\n[참고 이미지 역할]\n1) 현재 대표 01: 최종 스타일 기준입니다. 제품 라벨, 펌프, 병 모양, 신선제품 마크 문구/스타일, 흰 배경을 최대한 그대로 유지하세요. 단 하나의 문제인 상품 위치만 수정하세요.\n2) 실제 제품 팩샷: 라벨/용량/제품명 정체성 확인용입니다.\n3) 물방울 라벨 후보: 부정 예시입니다. 이처럼 제품 라벨을 바꾸거나 물방울 아이콘을 추가하면 실패입니다.\n\n[정확히 유지해야 할 제품 라벨]\n- YOURSKIN+\n- HYALURONIC\n- ACID\n- AQUA\n- LOTION\n- 300ml / 10.14 fl.oz\n- 현재 대표 01처럼 파란 곡선 장식만 유지. 물방울 아이콘 추가 금지.\n\n[정확히 유지해야 할 좌상단 마크]\n- 문구: “신선 제품” / “제조 6개월 이내”\n- 현재 대표 01의 초록+파랑 원형 링, 잎사귀 포인트 느낌 유지.\n- 위치는 좌상단 유지.\n- 마크가 제품 라벨을 가리지 않게 유지.\n\n[바꿀 것 — 이것만]\n- 제품 병을 현재보다 왼쪽으로 이동하여 병 중심선이 이미지 중앙축에 오게 합니다.\n- 병 크기/높이는 현재와 비슷하게 유지합니다.\n- 제품이 마크와 겹치지 않는 선에서 중앙 배치.\n\n[절대 금지]\n- 라벨 디자인 변경 금지.\n- 물방울 아이콘 추가 금지.\n- 용량 표기 300ml만 단독으로 만들지 말고 “300ml / 10.14 fl.oz” 유지.\n- 신선제품 마크 색상을 검정/남색 단색으로 바꾸지 마세요. 현재 초록+파랑 느낌 유지.\n- 제품을 뚱뚱하게/다른 병으로 변경 금지.\n- 큰 광고 카피, 해시태그, 성분 아이콘, 물결 배경, 가짜 박스 금지.\n- V1, V4, CUT, STEP, POINT, 후보번호 금지.\n\n[완성 기준]\n- 한눈에 기존 대표 01과 같은 제품으로 보이지만, 상품 병이 오른쪽 치우침 없이 중앙에 와야 합니다.\n- 쿠팡 썸네일용 고급 제품컷 품질.`;

await fs.writeFile(path.join(promptDir, '01-center-product-agent-v2-submitted.txt'), prompt);

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
await fs.writeFile(path.join(promptDir, '01-center-product-agent-v2-before-ids.json'), JSON.stringify(before.map(src => { try { return new URL(src).searchParams.get('id') || src } catch { return src } }), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(9000);
for (const text of ['확인','완료']) { const btn = page.getByRole('button', { name: text }).first(); if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(()=>{}); await page.waitForTimeout(1000); } }
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-rep01-center-product-v2-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(10000);
await fs.writeFile(path.join(promptDir, '01-center-product-agent-v2-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url(), title: await page.title() });
