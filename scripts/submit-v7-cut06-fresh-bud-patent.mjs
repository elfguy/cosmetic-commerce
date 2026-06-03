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
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/06.png'), path.join(outDir, 'reference/cut06-ref-v2-detail-06-patent-bud.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/01.png'), path.join(outDir, 'reference/cut06-tone-ref-01.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/03.png'), path.join(outDir, 'reference/cut06-tone-ref-03.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/04.png'), path.join(outDir, 'reference/cut06-tone-ref-04.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/05.png'), path.join(outDir, 'reference/cut06-tone-ref-05.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 06번 이미지를 1장 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[가장 중요한 참조]
- cut06-ref-v2-detail-06-patent-bud.png: 구성과 내용의 최우선 참조. Fresh Bud No.6, 6가지 새싹 원료, 원형 접시/페트리디쉬, 중앙 특허 원료, 하단 특허증서 느낌을 참고한다. 단, POINT 3 라벨은 절대 넣지 않는다.
- V7 01/03/04/05 이미지는 톤앤매너 기준: 화이트 배경, 연아쿠아, 민트그린, 깨끗한 카드, 부드러운 물방울/병풀잎. V2처럼 진한 블루가 너무 강하지 않게 V7 톤으로 정리한다.

[이번 컷 주제]
06 성분 특허 / Fresh Bud No.6 특허 진정 원료
- 상품 병/제품 이미지는 넣지 않는다.
- 주인공은 6가지 새싹 원료와 특허 원료 정보다.

[큰 문구 — 반드시 포함]
Fresh Bud No.6
민감 피부를 위한
특허 진정 원료

[보조 문구]
6가지 새싹에서 찾은 자연의 진정 에너지로
민감해진 피부를 편안하게 케어

[상단 아이콘 칩 3개]
새싹 유래 복합 성분
민감 피부 케어
특허 원료

[6가지 새싹 원료 — 반드시 포함]
알팔파 새싹
브로콜리 새싹
적양배추 새싹
밀 새싹
청경채 새싹
무 새싹

[중앙 원형 문구]
특허 원료
Fresh Bud No.6

[하단 설명]
Fresh Bud No.6는
민감 피부 진정에 도움을 주는
특허 받은 6가지 새싹 복합 성분으로
피부 본연의 균형을 지켜줍니다.

[하단 특허증서 표현]
- 왼쪽 하단 또는 하단에 작은 특허증서/문서 그래픽을 넣는다.
- 공식 인증 로고처럼 과장하지 말고, '특허 원료'를 설명하는 보조 이미지처럼 작고 은은하게 표현한다.
- 실제 정부 로고나 공식 인증 마크를 크게 만들지 않는다.

[레이아웃]
- 상단: 큰 제목과 보조 문구.
- 중상단: 3개 아이콘 칩.
- 중앙: 물결/수분 배경 위에 6개의 투명 원형 접시 또는 원료 버블을 둥글게 배치. 중앙에는 Fresh Bud No.6 원형 배지.
- 하단: 작은 특허증서 느낌 + 설명 문구.
- 전체적으로 V2 06의 구성을 따르되 V7 톤에 맞게 더 부드럽고 프리미엄하게 정리.

[톤앤매너]
- V7 01~05와 맞는 화이트 + 연아쿠아 + 민트그린 톤.
- 진한 네이비/딥블루 과다 사용 금지. 제목의 Fresh Bud No.6는 짙은 그린 또는 검정+그린 조합 권장.
- 배경은 깨끗한 흰색, 연한 아쿠아 물결, 투명한 물방울, 식물 잎 포인트.
- 모바일 쿠팡 상세페이지에서 읽기 쉽게 한국어는 크게.
- 상품 패키지/제품 병은 넣지 않는다.

[금지]
- POINT, Point 3, CUT, DETAIL CUT, STEP, 페이지 번호, 독립 숫자 배지 금지.
- 상품 병/제품 이미지/펌프/라벨/패키지 넣지 말 것.
- EWG VERIFIED 같은 공식 인증 로고/마크 금지.
- 특허청 로고/정부기관 로고를 크게 공식 인증처럼 보이게 만들지 말 것.
- 의료적 치료/완치/질병 개선 표현 금지.
- 한국어 깨짐/의미 없는 글자 금지.

최종 비율은 780:1360 세로형. 나중에 780×1360으로 정규화해도 잘리지 않도록 안전 여백을 둔다.`;

await fs.writeFile(path.join(outDir, 'prompts/06-fresh-bud-patent-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/06-before-estuary-ids.json'), JSON.stringify(before.map(getId), null, 2));
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
await page.screenshot({ path: path.join(root, 'tmp-v7-cut06-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/06-chat-url.txt'), page.url() + '\n');
