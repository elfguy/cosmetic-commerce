import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const chatUrl = (await fs.readFile(path.join(outDir, 'prompts/03-result.txt'), 'utf8')).split('\n')[0].trim();
const prompt = `방금 생성한 03번 이미지를 같은 디자인/구도/품질로 수정해줘. 실제 이미지를 다시 생성한다.

수정 포인트는 한 가지다:
- 보조 문구의 제품명 표현을 “데일리 아쿠아 로션”이 아니라 정식 제품명 기준으로 바꾼다.
- 보조 문구는 다음처럼 자연스럽게 만들어라:
  산뜻하게 채우는 히알루론산 아쿠아 로션

유지할 것:
- 큰 문구 “크림은 무겁고 토너는 부족할 때”는 그대로 유지.
- 성분/혜택 아이콘 4개: 수분 충전, 산뜻한 사용감, 피부 진정, 보호막 케어 유지.
- 중앙 제품 병, 물결/수분 레이어, 병풀잎, 깨끗한 아쿠아 톤 유지.
- 제품 병은 투명 PET/투명 플라스틱 용기 + 내부 우유빛 흰 로션처럼 보이게 유지. 완전 흰 플라스틱 병 금지.
- 라벨은 YOURSKIN+, HYALURONIC ACID AQUA LOTION, 300ml 느낌 유지.
- 780:1360 세로형 안전 여백.

금지:
- “데일리 수분 아쿠아 로션” 금지.
- “데일리 아쿠아 로션”을 제품명처럼 쓰는 것도 금지.
- CUT, DETAIL CUT, 번호 배지, 편집 가이드 라벨 금지.`;
await fs.writeFile(path.join(outDir, 'prompts/03-official-name-revision.txt'), prompt);

function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto(chatUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/03-revision-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
await page.screenshot({ path: path.join(root, 'tmp-v7-cut03-revision-submitted.png'), fullPage: true });
console.log('revision submitted', page.url(), 'before', before.map(getId));
