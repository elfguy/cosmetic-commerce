import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });
await fs.mkdir(path.join(outDir, 'detail'), { recursive: true });

const refs = [
  ['/Users/elfguy/.hermes/image_cache/img_f585d329b55e.jpeg', path.join(outDir, 'reference/cut05-ref-user-core-ingredients.jpeg')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/01.png'), path.join(outDir, 'reference/cut05-tone-ref-01.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/02.png'), path.join(outDir, 'reference/cut05-tone-ref-02.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/03.png'), path.join(outDir, 'reference/cut05-tone-ref-03.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/04.png'), path.join(outDir, 'reference/cut05-tone-ref-04.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/05.png'), path.join(outDir, 'reference/cut05-ref-v2-detail-05.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/06.png'), path.join(outDir, 'reference/cut05-ref-v2-detail-06.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 05번 이미지를 1장 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[가장 중요한 참조]
- cut05-ref-user-core-ingredients.jpeg: 사용자가 직접 보낸 참조. 브라우저 주소창/휴대폰 UI/상하단 검정선/안드로이드 내비게이션은 절대 포함하지 말고, 상세페이지 본문 영역의 구성과 내용을 참고한다.
- V7 01~04 참조 이미지는 톤앤매너 기준: 화이트 배경, 연아쿠아 물결, 민트그린 포인트, 깨끗한 카드, 부드러운 물방울.
- V2 detail 05~06은 원료/진정 성분 분위기 참고.

[이번 컷 주제]
05 핵심 성분 4종 카드
- 상품 이미지는 넣지 않는다.
- 주인공은 성분 이미지와 4개 카드다.
- 첨부한 참조처럼 성분 카드 2x2 구성으로 만든다.

[큰 문구 — 반드시 정확히]
수분·진정·피부결 케어를
한 번에

[보조 문구]
피부에 필요한 핵심 성분만 담았습니다.

[카드 4개 — 반드시 포함]
1) 병풀추출물
   민감 피부 진정
   외부 자극으로부터 지친 피부를 진정시키고 편안하게 케어

2) 해양심층수
   오래가는 수분감
   미네랄이 풍부한 심층수가 피부에 깊은 수분감을 선사

3) AHA·PHA
   매끈한 피부결 정돈
   각질과 노폐물을 부드럽게 케어하여 매끈하고 맑은 피부결로 정돈

4) Fresh Bud No.6
   편안한 진정 케어
   엄선된 6가지 식물 성분이 피부를 편안하게 진정

[하단 문구]
필요한 핵심 성분만 간결하게 담았습니다.

[레이아웃]
- 상단: 작은 잎 아이콘/얇은 구분선, 큰 제목, 보조 문구.
- 중단~하단: 2x2 성분 카드.
- 각 카드 상단에는 원료/수분 이미지: 병풀잎, 물방울/물결, 투명 수분 젤/버블, 식물/허브 원료.
- 각 카드 중앙에는 작은 라인 아이콘을 둥근 배지로 배치.
- 카드 하단에는 성분명, 짧은 효능 문구, 한 줄 설명.
- 최하단에는 연한 물결 배경과 하단 문구.

[톤앤매너]
- V7 01~04와 맞는 화이트 + 연아쿠아 + 민트그린 톤.
- 진한 파란색/네이비 과다 사용 금지.
- 카드 테두리는 연한 민트/아쿠아, 배경은 깨끗한 흰색.
- 모바일 쿠팡 상세페이지에서 읽기 쉽게 한국어는 크게.
- 상품 패키지/제품 병은 넣지 않는다.

[금지]
- 브라우저 주소창, 휴대폰 상태바, 안드로이드 내비게이션 바, 화면 캡처 UI 포함 금지.
- 상품 병/제품 이미지/펌프/라벨/패키지 넣지 말 것.
- POINT, CUT, DETAIL CUT, STEP, 페이지 번호, 독립 숫자 배지 금지.
- 공식 인증처럼 보이는 로고/마크 금지.
- 의료적 치료/완치/질병 개선 표현 금지.
- 한국어 깨짐/의미 없는 글자 금지.

최종 비율은 780:1360 세로형. 나중에 780×1360으로 정규화해도 잘리지 않도록 안전 여백을 둔다.`;

await fs.writeFile(path.join(outDir, 'prompts/05-core-ingredients-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/05-before-estuary-ids.json'), JSON.stringify(before.map(getId), null, 2));
await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length, uploadFiles);
await page.waitForTimeout(12000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
console.log('submitted', { url: page.url(), title: await page.title() });
await page.screenshot({ path: path.join(root, 'tmp-v7-cut05-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/05-chat-url.txt'), page.url() + '\n');
