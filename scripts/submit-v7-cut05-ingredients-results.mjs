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
  ['/Users/elfguy/.hermes/image_cache/img_f585d329b55e.jpeg', path.join(outDir, 'reference/cut05-ref-core-ingredients-card.jpeg')],
  ['/Users/elfguy/.hermes/image_cache/img_3635b7e03ac2.jpeg', path.join(outDir, 'reference/cut05-ref-skin-result-flow.jpeg')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/01.png'), path.join(outDir, 'reference/cut05-tone-ref-01.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/02.png'), path.join(outDir, 'reference/cut05-tone-ref-02.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/03.png'), path.join(outDir, 'reference/cut05-tone-ref-03.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/04.png'), path.join(outDir, 'reference/cut05-tone-ref-04.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 05번 이미지를 1장 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[가장 중요한 참조]
- cut05-ref-core-ingredients-card.jpeg: 핵심 성분 4종 카드형 구성 참고. 단, 브라우저 주소창/폰 UI/검정선/내비게이션 바는 절대 포함하지 않는다.
- cut05-ref-skin-result-flow.jpeg: 이번 컷의 핵심 흐름 참고. 성분을 보여준 뒤 하단에 “그래서 피부는 이렇게 달라집니다.”로 결과를 연결하는 구조를 반영한다. 단, Point 2 라벨과 브라우저/폰 UI는 절대 포함하지 않는다.
- V7 01~04 이미지는 톤앤매너 기준: 화이트 배경, 연아쿠아, 민트그린, 깨끗한 카드, 부드러운 물방울/병풀잎.

[이번 컷 주제]
05 성분이 만드는 피부 변화
- 단순 성분 소개에서 끝나지 말고 “그래서 피부가 어떻게 달라지는지”까지 이어지는 상세페이지.
- 상품 병/제품 이미지는 넣지 않는다.
- 성분 이미지와 결과 메시지가 주인공이다.

[큰 문구 — 반드시 정확히]
수분·진정·피부결 정돈을 한 번에
자연성분을 더했습니다.

[보조 문구]
피부에 필요한 핵심 성분만 담았습니다.

[성분 역할 구성 — 반드시 포함]
병풀추출물
민감 피부를 빠르게 진정
피부 진정 & 피부 보호

해양심층수
오랜기간 촉촉한 피부를 유지
강력한 수분 관리

AHA·PHA
촉촉하고 매끄러운 피부결로 정돈
각질 관리 & 피부결 정돈

Fresh Bud No.6
편안한 진정 케어
엄선된 6가지 식물 성분이 피부를 편안하게 진정

[하단 결과 문구 — 반드시 크게 포함]
그래서 피부는 이렇게 달라집니다.

[하단 결과 3개 — 반드시 포함]
수분은 더 오래동안
피부는 더 편안하게
피부결은 더 매끈하게

[레이아웃]
- 상단: 큰 제목. “자연성분” 단어는 민트그린으로 강조, 나머지는 검정.
- 중단: 병풀잎, 물방울/해양심층수, 투명 수분 버블/AHA·PHA, 식물/허브 원료 이미지를 균형 있게 배치한다.
- 각 성분은 큰 성분명 + 짧은 결과 문구 + 작은 역할 문구로 구성한다.
- 카드형 2x2 또는 참조 이미지처럼 자연스럽게 흩어진 인포그래픽 구성 가능.
- 하단: “그래서 피부는 이렇게 달라집니다.”를 굵게 넣고, 그 아래 3개 결과 문구를 가로 또는 칩 형태로 정리한다.
- 배경은 연한 아쿠아 그라데이션과 흰 여백 중심.

[톤앤매너]
- V7 01~04와 맞는 화이트 + 연아쿠아 + 민트그린 톤.
- 진한 파란색/네이비 과다 사용 금지.
- 깨끗한 한국 쿠팡/네이버 모바일 상세페이지 느낌.
- 텍스트는 모바일에서 읽기 쉽게 크게.
- 상품 패키지/제품 병은 넣지 않는다.

[금지]
- 브라우저 주소창, 휴대폰 상태바, 안드로이드 내비게이션 바, YOURSKIN+ 웹 헤더, 햄버거 메뉴, 화면 캡처 UI 포함 금지.
- Point 2, POINT, CUT, DETAIL CUT, STEP, 페이지 번호, 독립 숫자 배지 금지.
- 상품 병/제품 이미지/펌프/라벨/패키지 넣지 말 것.
- 공식 인증처럼 보이는 로고/마크 금지.
- 의료적 치료/완치/질병 개선 표현 금지.
- 한국어 깨짐/의미 없는 글자 금지.

최종 비율은 780:1360 세로형. 나중에 780×1360으로 정규화해도 잘리지 않도록 안전 여백을 둔다.`;

await fs.writeFile(path.join(outDir, 'prompts/05-ingredients-to-skin-results-submitted.txt'), prompt);
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
