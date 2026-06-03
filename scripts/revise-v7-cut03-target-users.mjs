import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const fallbackUrl = 'https://chatgpt.com/c/6a1e2937-fafc-83a4-b814-b17a585d4f4f';
let chatUrl = fallbackUrl;
try {
  const txt = await fs.readFile(path.join(outDir, 'prompts/03-revision-result.txt'), 'utf8');
  chatUrl = txt.split('\n')[0].trim() || fallbackUrl;
} catch {}

const prompt = `03번 상세페이지 이미지를 다시 만든다. 이전 03번의 '크림은 무겁고 토너는 부족할 때' 콘셉트는 버리고, 아래 새 콘셉트로 실제 이미지를 다시 생성해줘.

[새 콘셉트]
이런 분들께 필요해요

[핵심 의도]
- 이 컷은 제품을 여러 번 보여주는 상품 광고 컷이 아니라, 어떤 피부/사용자에게 필요한지 알려주는 '타깃 고객 안내형' 상세페이지다.
- 제품 병이 다기/중복으로 많이 나올 필요 없다.
- 제품 이미지는 하단 또는 한쪽에 작게 1개만 보조로 배치하거나, 정보 카드 중심 구성이 더 중요하다.
- 01번 히어로처럼 큰 제품 중심 컷을 반복하지 말 것.

[큰 문구]
이런 분들께 필요해요

[보조 문구]
산뜻한 수분 케어가 필요한 순간

[타깃 고객 카드 4개]
1. 크림은 무겁게 느껴지는 피부
2. 토너만으로는 건조한 피부
3. 끈적임 없는 보습을 원하는 피부
4. 매일 산뜻하게 관리하고 싶은 피부

[구성]
- 상단: 큰 문구 '이런 분들께 필요해요'
- 중단: 4개의 둥근 카드/체크리스트/아이콘형 박스. 모바일에서 잘 읽히게 큰 글자.
- 하단: 깨끗한 아쿠아 물결, 병풀잎, 수분감. 제품 병은 작게 1개만 보조 배치 가능.
- 제품보다 텍스트 카드와 수분감 있는 분위기가 주인공.

[스타일]
- YOURSKIN+ 아쿠아로션 01, 02와 같은 밝고 깨끗한 아쿠아/그린 톤.
- 한국 쿠팡/네이버 모바일 상세페이지용 프리미엄 스킨케어 디자인.
- 780:1360 세로형, 안전 여백. 나중에 780×1360으로 정규화해도 글자/제품이 잘리지 않게.
- 카드 배경은 흰색/반투명 흰색, 체크 아이콘은 민트/아쿠아 컬러.
- 여백 충분히, 정보 과다 금지.

[제품명/제품 표현]
- 제품명이 들어간다면 정식명은 '히알루론산 아쿠아 로션'만 사용.
- '데일리 수분 아쿠아 로션' 금지.
- '데일리 아쿠아 로션'을 제품명처럼 쓰는 것도 금지.
- 병을 그릴 경우: 투명 PET/투명 플라스틱 용기 + 내부 우유빛 흰 로션. 병 전체가 통흰색 플라스틱처럼 보이면 안 됨.
- 라벨은 YOURSKIN+, HYALURONIC ACID AQUA LOTION, 300ml 느낌 유지.

[금지]
- 제품 병 여러 개 반복 금지.
- CUT, DETAIL CUT, POINT 01, STEP 01, 숫자 배지, 편집 가이드 라벨 금지.
- 의료적 치료/완치/질병 개선 표현 금지.
- EWG VERIFIED 같은 공식 인증 로고 금지.

위 조건으로 03번 이미지를 새로 생성해줘.`;

await fs.writeFile(path.join(outDir, 'prompts/03-target-users-revision.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto(chatUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/03-target-users-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
await page.screenshot({ path: path.join(root, 'tmp-v7-cut03-target-users-submitted.png'), fullPage: true });
console.log('target-users revision submitted', page.url(), 'beforeCount', before.length);
