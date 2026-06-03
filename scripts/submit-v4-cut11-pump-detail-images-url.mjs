import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });
await fs.mkdir(path.join(outDir, 'rejected'), { recursive: true });

const refPairs = [
  ['detail/10.png', 'reference/cut11-pumpdetail-01-approved-cut10-tone.png'],
  ['detail/12.png', 'reference/cut11-pumpdetail-02-approved-cut12-tone.png'],
  ['detail/11.png', 'reference/cut11-pumpdetail-03-current-11-keep-top-improve-bottom.png'],
  ['reference/cut11-product-lock-01-exact-yourskin-aqua-lotion.png', 'reference/cut11-pumpdetail-04-real-product-ref.png'],
  ['reference/cut11-product-lock-02-full-product-identity.png', 'reference/cut11-pumpdetail-05-product-identity-ref.png'],
  ['reference/cut11-product-lock-04-positive-pump-photo-ref.png', 'reference/cut11-pumpdetail-06-positive-pump-photo-ref.png'],
  ['reference/cut11-product-lock-05-negative-stop-ref.png', 'reference/cut11-pumpdetail-07-negative-stop-ref.png'],
];
const uploadFiles = [];
for (const [relSrc, relDst] of refPairs) {
  const src = path.join(outDir, relSrc);
  const dst = path.join(outDir, relDst);
  try { await fs.stat(src); await fs.copyFile(src, dst); uploadFiles.push(dst); } catch {}
}

const prompt = `쿠팡 모바일 상세페이지용 세로 이미지 1장을 실제 이미지로 생성해 주세요.
반드시 ChatGPT Images 결과물 안에 한국어 텍스트와 펌프 사용법 그림/사진 표현까지 모두 포함해 주세요. 설명만 하지 마세요.

목표: 히알루론산 아쿠아 로션 V4 상세페이지 11번째 컷 교체 이미지.
최종 비율: 780×1360 세로형.

[참고 이미지 역할]
- 업로드한 현재 11번: 위쪽 구성과 분위기는 좋습니다. 상단 제목과 1, 2번 사용법 카드의 느낌은 최대한 유지하세요.
- 하지만 현재 11번의 아래쪽 제품 OPEN 부분은 너무 단순합니다. 전체 병을 크게 보여주기보다 펌프 상단/헤드 클로즈업을 더 자세히 표현하세요.
- 업로드한 10번/12번: V4 세트의 흰색 + 연아쿠아 + 민트 카드형 톤, 폰트 크기, 여백 기준.
- 업로드한 실제 제품 레퍼런스: 제품은 YOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml 정체성을 참고하되, 이번 컷은 제품 전체 이미지보다 펌프 윗부분 클로즈업이 중요합니다.
- 업로드한 positive pump photo ref: 펌프 OPEN 안내의 긍정 참조입니다.
- 업로드한 negative STOP ref: 목적/구조 참고만 하고 STOP, 잠금/해제 혼동, 빨간 경고 스타일은 절대 복사하지 마세요.

[이번 수정 핵심]
- 위쪽 영역: 현재 11번처럼 깨끗한 제목과 1, 2번 카드 중심. 가능하면 거의 유지.
- 아래쪽 영역: 제품 전체 병샷보다 흰색 펌프 상단 클로즈업을 크게 표현.
- 펌프를 여는 방법이 더 자세히 보여야 합니다: 손가락이 펌프 헤드를 잡고, 부드러운 곡선 화살표로 OPEN 방향을 보여주고, 펌프 헤드가 올라온 상태를 보여주는 미니 단계/클로즈업.
- 전체 병을 꼭 다 보여줄 필요 없습니다. 상단 펌프/목 부분 클로즈업이 중심이어도 됩니다.
- 현실적인 흰색 화장품 펌프와 흰색/반투명 용기 상단 느낌. 플랫 아이콘만으로 끝내지 마세요.
- 09~12 세트와 맞게 글씨 크기는 작고 깔끔하게, 연아쿠아/민트 톤 유지.

[반드시 들어갈 한국어 문구 — 아래 문구 중심]
제목:
사용 방법

작은 영문:
HOW TO USE

1번 카드:
얼굴에 골고루 펴 바른 후
부드럽게 흡수시켜 주세요.

2번 카드:
건조한 부위에는
한 번 더 덧발라 주세요.

펌프 안내 제목:
펌프 OPEN 안내

펌프 안내 문구:
처음 사용 전 펌프 헤드를
OPEN 방향으로 돌려 주세요.

주의 문구:
무리하게 돌리거나 분리하지 마세요.

[아래 펌프 상세 표현]
- 하단 40~45% 영역을 펌프 상세 설명에 사용하세요.
- 흰색 펌프 헤드와 목 부분을 크게 클로즈업.
- 손가락 또는 손 실루엣이 펌프 헤드를 잡고 돌리는 모습은 자연스럽게 가능.
- 곡선 화살표와 작은 OPEN 라벨만 사용. STOP 라벨은 절대 금지.
- 가능하면 2개 또는 3개의 작은 단계 카드:
  1) 펌프 헤드를 잡기
  2) OPEN 방향으로 부드럽게 돌리기
  3) 펌프가 올라오면 사용 가능
- 단계 번호가 이미지 컷번호처럼 보이지 않도록 큰 숫자 배지는 쓰지 마세요. 필요하면 작은 점/아이콘만 사용.

[절대 금지]
- STOP, LOCK, 잠금 방향, 빨간 경고 화살표 금지.
- V4, V7, 컷번호, 11, POINT, STEP, CUT 같은 제작용 표식 금지.
- 제품 전체 병을 너무 크게 반복해서 광고컷처럼 만들지 마세요.
- 제품 라벨을 이상하게 바꾸거나 가짜 브랜드를 넣지 마세요.
- 한국어 오타/깨짐/잘림 금지.
- 브라우저 UI, 휴대폰 UI, 검정 상태바 금지.
- 치료/효능보장 표현 금지.

[검수 기준]
- 위쪽은 현재 11번의 장점을 유지해야 합니다.
- 아래쪽은 현재보다 펌프를 여는 방법이 훨씬 자세히 이해되어야 합니다.
- 10/12와 나란히 봤을 때 같은 V4 세트처럼 보여야 합니다.
- OPEN만 표시되고 STOP이 없어야 합니다.`;

await fs.writeFile(path.join(outDir, 'prompts/11-pump-detail-images-url-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-pumpdetail-images-url-opened.png'), fullPage: true });
const bodyText = (await page.locator('body').innerText().catch(() => '')).slice(0, 1200);
console.log('opened-images-workspace', { url: page.url(), title: await page.title(), uploadFiles: uploadFiles.length, hasLogin: /로그인/.test(bodyText) });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('Not on images URL: ' + page.url());
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/11-pump-detail-images-url-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, uploadFiles);
console.log('uploaded refs', uploadFiles);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
 const btn = page.getByRole('button', { name: text }).first();
 if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
const composer = page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-pumpdetail-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(15000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-pumpdetail-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/11-pump-detail-images-url-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url(), title: await page.title() });
process.exit(0);
