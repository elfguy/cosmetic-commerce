import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/detail/12.png'), path.join(outDir, 'reference/cut11-clean-original-how-to-use.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v3/detail/08.png'), path.join(outDir, 'reference/cut11-clean-v3-pump-ref.png')],
  [path.join(root, 'tmp-v7-01-10-contact-no-labels-v2.png'), path.join(outDir, 'reference/cut11-clean-v7-tone-board.png')],
  [path.join(outDir, 'detail/10.png'), path.join(outDir, 'reference/cut11-clean-tone-ref-10.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `쿠팡 상세페이지용 세로 이미지 1장을 생성해줘. 설명만 하지 말고 실제 이미지를 생성해줘.

[이번 재생성 핵심]
기존 결과는 위쪽 잎사귀가 너무 많고 제품 광고컷 느낌이 강했다. 이번에는 잎사귀/식물 장식은 꼭 넣지 않아도 된다. 넣더라도 아주 작고 적게만 사용한다.
가장 중요한 것은 “사용 방법 / HOW TO USE / 펌프 OPEN 안내”가 잘 읽히는 깔끔한 정보형 상세페이지 컷이다.

[전체 톤]
- 기존 V7 01~10 세트와 이어지는 밝은 상세페이지 인포그래픽 톤.
- 화이트 배경 + 연아쿠아 물결/수분감 + 부드러운 민트 포인트.
- 둥근 흰색 카드형 정보 블록 중심.
- 잎사귀/식물 장식은 필수 아님. 과하게 넣지 말 것. 상단을 잎사귀로 채우지 말 것.
- 제품 사진은 보조 요소로 작게. 병이 화면 대부분을 차지하는 광고컷 금지.

[이번 컷 주제]
사용 방법 / HOW TO USE
히알루론산 아쿠아 로션 사용법과 펌프 OPEN 안내.

[이미지 안에 들어갈 문구]
사용 방법
HOW TO USE

얼굴에 골고루 펴 바른 후
부드럽게 흡수시켜 주세요.

건조한 부위에는
한 번 더 덧발라 주세요.

펌프 헤드를 OPEN 방향으로
살짝 돌려 올린 후 눌러 사용하세요.

무리하게 돌리거나 분리하지 마세요.

[레이아웃]
- 상단: “사용 방법”과 “HOW TO USE”. 여백 넉넉하게, 깔끔하게.
- 중앙: 둥근 흰색 카드 2개로 사용법을 정리. 카드 안 문구가 크고 선명해야 한다.
- 하단 또는 우하단: 펌프 클로즈업 작은 안내 카드. OPEN 글자와 부드러운 곡선 화살표 1개만.
- 하단 제품 이미지는 작게 보조 배치. 제품 라벨은 가능하면 YOURSKIN+ / HYALURONIC ACID AQUA LOTION / 300ml 느낌 유지.
- 전체는 정보 전달이 주인공, 제품 사진은 보조.

[펌프 안내 중요]
- 펌프 헤드를 OPEN 방향으로 살짝 돌려 올리고 누르는 느낌만 보여준다.
- STOP 글자, STOP 화살표, STOP 방향 안내는 절대 넣지 않는다.
- 펌프가 빠지거나 분리되는 그림 금지.
- 복잡한 기계식 잠금/해제 도식 금지.

[디자인 금지]
- 상단에 잎사귀를 많이 배치하지 말 것.
- 큰 식물 프레임/잎사귀 터널/정글 느낌 금지.
- 풀화면 병 클로즈업 금지.
- 얼음/유리/차가운 블루 광고 배경 금지.
- 어두운 청록 단색 고급 광고톤 금지.
- 세트와 다른 고급 제품 단독 광고컷 금지.
- 저가 일러스트 금지. 제품/펌프는 적당히 실제 사진 느낌, 전체는 밝은 카드형 정보컷.

[절대 금지]
- V7, v7, 버전명, 컷번호, 11, Point, POINT, CUT, STEP, page 같은 제작용 표식 금지.
- 브라우저 UI, 휴대폰 UI, 검정 상태바 금지.
- 한국어 오타/깨짐/잘림 금지.
- 치료/완치/질병개선/효능보장 표현 금지.
- STOP 관련 모든 표기 금지.

최종 비율은 780×1360 세로 상세페이지.`;

await fs.writeFile(path.join(outDir, 'prompts/11-clean-open-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
console.log('workspace', {url: page.url(), title: await page.title()});
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(()=>{}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/11-clean-open-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
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
await fs.writeFile(path.join(outDir, 'prompts/11-clean-open-chat-url.txt'), page.url() + '\n');
await page.screenshot({ path: path.join(root, 'tmp-v7-cut11-clean-open-submitted.png'), fullPage: true });
console.log('submitted', { url: page.url(), title: await page.title() });
process.exit(0);
