import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/detail/11.png'), path.join(outDir, 'reference/cut10-regenerate-original-manufacture-date.png')],
  [path.join(root, 'tmp-v7-01-09-contact-no-labels.png'), path.join(outDir, 'reference/cut10-regenerate-tone-board-no-labels.png')],
  [path.join(outDir, 'detail/09.png'), path.join(outDir, 'reference/cut10-regenerate-tone-ref-09.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `쿠팡 상세페이지용 세로 이미지 1장을 새로 생성해줘. 설명만 하지 말고 실제 이미지를 생성해줘.

중요: 이 이미지는 최종 판매 상세페이지에 들어가는 완성 이미지다. 이미지 안에 버전명, 시안명, 제작용 라벨, 컷 번호를 절대 넣지 마라. 특히 V7, v7, 10, CUT, DETAIL CUT, POINT, STEP, page 같은 글자는 어떤 위치에도 넣지 마라. 참조 이미지에 보이는 제작용 표식이나 버전명은 모두 무시한다.

[주제]
제조일자 공개로 확인하는 신선함

[반드시 들어갈 텍스트]
제조일자는 신선함을 판단하는 가장 정확한 기준입니다.

유어스킨플러스는
제조번호와 제조일자를 표기하고 있습니다.
언제 제조했는지 소비자가 바로 확인할 수 있습니다.

일부 타사 제품은
제조번호와 사용기한만을 표기하고 있습니다.
언제 제조했는지 실제 제조 시점을 알기 어렵습니다.

유어스킨플러스는 제조일로부터 6개월 이내의 제품만을 출고합니다.

일부 저가로 유통되는 제품들 중에 제조일로부터 상당 기간이 지났거나 사용기한 만료일에 임박한 제품들이 있습니다.

[디자인]
- 780×1360 비율의 모바일 상세페이지 세로 인포그래픽.
- 전체 톤은 깨끗한 화이트, 연아쿠아, 민트그린. 고급스럽고 신뢰감 있는 화장품 상세페이지 느낌.
- 상단에는 제목만 크게 배치. 버전명/번호/장식용 알파벳 금지.
- 중앙에는 좌우 비교 카드 2개.
  - 왼쪽 카드: 유어스킨플러스 / 제조번호 + 제조일자 표기 / 소비자가 바로 확인 가능. GOOD 체크 아이콘 사용 가능.
  - 오른쪽 카드: 일부 타사 제품 / 제조번호 + 사용기한만 표기 / 실제 제조 시점 확인 어려움. CHECK 아이콘 사용 가능.
- 카드 안에는 제품 용기 바닥면에 날짜가 인쇄된 클로즈업 느낌의 간단한 일러스트를 넣어라. 단 제품 전체 병 정면샷은 넣지 마라.
- 왼쪽 예시 표기는 작게: 제조 2025.07.19
- 오른쪽 예시 표기는 작게: 2026.03.29까지
- 하단에는 민트그린 강조 배너로 “제조일로부터 6개월 이내 제품만 출고”를 가장 잘 보이게 만든다.
- 맨 아래에는 작은 주의 문구를 넣는다.
- 정보가 너무 복잡하지 않게 넉넉한 여백과 둥근 카드 사용.

[품질 규칙]
- 한국어 텍스트는 선명하고 자연스럽게. 오타, 깨짐, 의미 없는 글자, 잘림 금지.
- “확인 할수”가 아니라 “확인할 수”로 써라.
- “제조일자로부터”가 아니라 “제조일로부터”로 써라.
- 타사 비방이 과격하지 않도록 반드시 “일부 타사 제품” 정도로만 표현.
- 치료, 완치, 질병 개선, 효능 보장, 100% 안전 보장 표현 금지.
- 브라우저 주소창, 휴대폰 UI, 검정 상태바, 안드로이드 네비게이션바 금지.
- 공식 인증마크나 정부 보증 느낌 금지.
- 화면 안 어디에도 V7, v7, 버전, 컷번호, Point, POINT, CUT, STEP, page, 10 같은 제작용 표식을 넣지 마라.`;

await fs.writeFile(path.join(outDir, 'prompts/10-regenerate-gpt-only-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/10-regenerate-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
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
await page.screenshot({ path: path.join(root, 'tmp-v7-cut10-regenerate-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/10-regenerate-chat-url.txt'), page.url() + '\n');
console.log('submitted', { url: page.url(), title: await page.title() });
process.exit(0);
