import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });

const chatUrl = 'https://chatgpt.com/c/6a1e1d5e-399c-83a2-91b5-68791fc81942';
const prompt = `방금 만든 01번 히어로 이미지를 같은 디자인으로 다시 수정해서 생성해줘.

[수정할 문제]
- 현재 이미지 중간 제품명 문구가 "데일리 수분 아쿠아 로션"처럼 보인다.
- 이것은 정식 제품명이 아니다.

[정확히 바꿀 문구]
기존 중간 제품명 라인:
데일리 수분 아쿠아 로션

수정할 정식 제품명:
히알루론산 아쿠아 로션

[유지할 것]
- 상단 YOURSKIN+ 로고는 유지.
- 큰 메인 카피 "수분 · 진정 · 보호를 한 번에"는 유지.
- 보조 문구, 혜택 칩, 제조 6개월 이내 신선 제품 보장 배지, 성분 카드, 배경 물결/병풀잎/물방울, 전체 레이아웃은 최대한 그대로 유지.
- 중앙 제품 병도 그대로 유지. 투명 용기 + 불투명한 우유빛 흰색 내용물 느낌 유지.
- 병 라벨의 영문 제품명 HYALURONIC ACID AQUA LOTION / 300ml 느낌 유지.

[중요]
- 전체 디자인을 새로 바꾸지 말고, 중간 제품명 한 줄만 정식명으로 교정한 버전처럼 보여야 한다.
- 최종 비율은 780:1360 세로형. 나중에 780×1360으로 정규화해도 잘리지 않도록 안전 여백 유지.

[금지]
- 데일리 수분 아쿠아 로션 문구 금지.
- CUT, DETAIL CUT, POINT, STEP, 독립적인 숫자 배지, 편집 가이드 라벨 금지.
- 병 전체를 흰색 플라스틱 병처럼 만들지 말 것.

위 조건으로 01번 히어로 이미지를 제품명만 "히알루론산 아쿠아 로션"으로 교정해서 1장 다시 생성해줘.`;

await fs.writeFile(path.join(outDir, 'prompts/01-revision-official-product-name-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages().find(p => p.url().includes('/c/6a1e1d5e-399c-83a2-91b5-68791fc81942'));
if (!page) {
  page = await ctx.newPage();
  await page.goto(chatUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
}
await page.bringToFront();
await page.waitForTimeout(3000);
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/01-revision-before-estuary-ids.json'), JSON.stringify(before.map(getId), null, 2));
console.log('page', page.url(), await page.title());
console.log('before ids', before.map(getId));

await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
console.log('revision submitted', page.url());
await fs.writeFile(path.join(outDir, 'prompts/01-revision-chat-url.txt'), page.url() + '\n');
