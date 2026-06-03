import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/detail/11.png'), path.join(outDir, 'reference/cut10-original-fresh-manufacture-date.png')],
  [path.join(root, 'tmp-v7-01-09-contact.png'), path.join(outDir, 'reference/cut10-v7-tone-board-01-09.png')],
  [path.join(outDir, 'detail/09.png'), path.join(outDir, 'reference/cut10-tone-ref-09-clean-info.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 V7 10번 이미지를 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[이번 컷의 역할]
- 원본 10번 약산성 pH 내용은 이미 V7 09번에 통합되었다.
- 따라서 이번 V7 10번은 원본 11번의 제조일자/신선함 내용을 이어서 만든다.
- 사용자가 요청문구를 다시 확인해서 진행하라고 했으므로, 아래 요청문구를 정확히 반영한다.

[원본 요청문구 — 의미 유지, 상세페이지용 자연스러운 맞춤법으로 정리]
상단 제목:
제조일자는 신선함을 판단하는 가장 정확한 기준입니다.

좌측 카드 — 유어스킨플러스:
유어스킨플러스는
제조번호와 제조일자를 표기하고 있습니다.
언제 제조했는지 소비자가 바로 확인할 수 있습니다.

우측 카드 — 일부 타사 제품:
일부 타사 제품은
제조번호와 사용기한만을 표기하고 있습니다.
언제 제조했는지 실제 제조 시점을 알기 어렵습니다.

하단 강조 문구:
유어스킨플러스는 제조일로부터 6개월 이내의 제품만을 출고합니다.

하단 주의 문구:
일부 저가로 유통되는 제품들 중에 제조일로부터 상당 기간이 지났거나 사용기한 만료일에 임박한 제품들이 있습니다.

[시각 구성]
- 원본처럼 좌우 비교 구조를 유지하되, V7 스타일로 더 깨끗하고 고급스럽게 리디자인한다.
- 상단: 큰 제목, “신선함” 단어는 민트그린 포인트.
- 중앙: 둥근 흰색 카드 2개.
  1) 왼쪽 카드: GOOD / 유어스킨플러스 / 제조번호 + 제조일자 표기 / 소비자가 바로 확인 가능
  2) 오른쪽 카드: CHECK / 일부 타사 제품 / 제조번호 + 사용기한만 표기 / 실제 제조 시점 확인 어려움
- 각 카드 안에 제품 용기 바닥면에 인쇄된 코드 사진 느낌의 일러스트를 넣는다.
  - 왼쪽 예시: A2507191 / 제조 2025.07.19
  - 오른쪽 예시: A39 / 2026.03.29까지
  - 실제 회사 식별정보나 실제 제조번호처럼 보이게 과도하게 구체화하지 말고 예시 느낌으로 작게 표현한다.
- 하단: 넓은 민트/그린 강조 배너에 “제조일로부터 6개월 이내 제품만 출고”를 크게 넣는다.
- 맨 아래: 노란 체크 아이콘 + 작은 주의 문구.

[톤앤매너]
- V7 01~09와 맞는 화이트 + 연아쿠아 + 민트그린 중심.
- 깨끗한 쿠팡 상세페이지용 세로형 인포그래픽.
- 배경은 연한 민트/아쿠아 그라데이션.
- 비교 구조는 명확하지만 공격적인 비방 느낌은 줄이고 “일부 타사 제품” 수준의 부드러운 표현.
- 정보는 읽기 쉽게, 텍스트가 너무 작거나 빽빽하지 않게.
- 최종 사용 크기는 780×1360 세로형이므로 안전 여백을 확보한다.

[절대 금지]
- Point 8, Point, POINT, CUT, DETAIL CUT, STEP, 독립 숫자 배지, 페이지 번호 금지.
- 브라우저 주소창, 휴대폰 상태바, 검정 UI 바, 안드로이드 내비게이션 바 금지.
- 제품 병 전체/패키지 정면 샷 금지. 단, 제조일자 확인을 위한 용기 바닥면 클로즈업 느낌의 작은 예시 이미지는 허용.
- 실제 식별 가능한 제조번호/개인정보/회사 내부정보처럼 보이는 세부 정보 금지. 예시 표기만 사용.
- 한국어 깨짐/의미 없는 글자/잘림 금지.
- 치료, 완치, 질병 개선, 효능 보장, 100% 안전 보장 표현 금지.
- 과도한 타사 비방 금지.`;

await fs.writeFile(path.join(outDir, 'prompts/10-fresh-manufacture-date-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
const title = await page.title();
const body = await page.locator('body').innerText({ timeout: 10000 });
if (!title.includes('Images') && !body.includes('이미지 만들기')) throw new Error(`Not on Images workspace: title=${title}`);
console.log('workspace verified', { url: page.url(), title });
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(()=>{}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/10-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length, uploadFiles);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
const composer = page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
await page.waitForTimeout(15000);
await page.screenshot({ path: path.join(root, 'tmp-v7-cut10-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/10-chat-url.txt'), page.url() + '\n');
console.log('submitted', { url: page.url(), title: await page.title() });
process.exit(0);
