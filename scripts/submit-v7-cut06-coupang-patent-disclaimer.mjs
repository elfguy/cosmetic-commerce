import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  ['/Users/elfguy/.hermes/image_cache/img_a046351bc9bd.jpeg', path.join(outDir, 'reference/cut06-ref-coupang-original-patent.jpeg')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/06.png'), path.join(outDir, 'reference/cut06-current-blurred.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/05.png'), path.join(outDir, 'reference/cut06-tone-ref-05.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 06번 이미지를 다시 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[가장 중요한 참조]
- cut06-ref-coupang-original-patent.jpeg: 사용자가 보낸 쿠팡 원본 참조. 브라우저 주소창/휴대폰 UI/검정 바/안드로이드 내비게이션은 절대 포함하지 말고, 상세페이지 본문 구성만 참고한다.
- cut06-current-blurred.png: 현재 V7 톤앤매너와 블러 처리 방향 참고.
- cut06-tone-ref-05.png: V7 세트 색감 참고.

[이번 수정 핵심]
- 쿠팡 원본처럼 특허증과 특허 보유 카드 구성을 최대한 비슷하게 만든다.
- 단, 특허증/문서 안의 회사명, 권리자명, 출원인명, 등록권자명, 등록번호, 상세 문서 내용은 흐릿하게 블루밍/블러 처리해서 읽히지 않게 한다.
- 반드시 아래 문구를 넣는다: *상기내용은 원료적 특성에 한함
- POINT 3 같은 라벨은 절대 넣지 않는다.

[상단 문구]
Fresh Bud No.6 함유
민감한 피부를 위해 설계된
특허 진정 원료

[보조 문구]
새싹이 자라나는 순간의 핵심 영양만 담았습니다.

[체크 칩 3개]
민감 피부 적합
새싹 유래 복합 성분
특허 원료 사용

[6가지 새싹 원료 — 원본처럼 새싹 이미지와 함께]
브로콜리
알팔파
양배추
새싹밀
청경채
무순

[중단 특허 영역 — 원본처럼]
- 배경은 밝은 실험실/식물 연구실 느낌의 흐릿한 사진 분위기.
- 왼쪽에는 흰 카드: Fresh Bud No.6 / 특허 보유
- 왼쪽 카드 안 하단 상세 회사명/권리자명/번호처럼 보이는 부분은 흐리게 블루밍 처리.
- 오른쪽에는 원본 특허증과 최대한 비슷한 세로 특허증 문서.
- 특허증 상단 장식/테두리/붉은 도장 느낌은 가능하지만, 회사명/권리자/출원인/등록번호/문서 상세 내용은 블러 처리해 읽을 수 없게 한다.
- 특허증 하단에 정부기관/특허청 로고가 공식 인증처럼 선명하게 보이면 안 된다. 작고 흐릿하게, 분위기만 남긴다.

[반드시 들어갈 주의 문구]
*상기내용은 원료적 특성에 한함

[하단 큰 문구]
Fresh Bud No.6는 피부 진정 효능으로 특허 등록된 원료 조성물입니다.

[톤앤매너]
- V7 01~06과 맞는 화이트 + 연아쿠아 + 민트그린 톤.
- 너무 진한 블루/네이비 금지.
- 쿠팡 원본의 레이아웃은 따르되 색감은 V7 세트처럼 깨끗하고 부드럽게.
- 상품 병/제품 패키지는 넣지 않는다.

[금지]
- 브라우저 주소창, 휴대폰 상태바, 안드로이드 내비게이션 바, 검정 UI 바 포함 금지.
- Point 3, POINT, CUT, DETAIL CUT, STEP, 페이지 번호, 독립 숫자 배지 금지.
- 회사명, YOURSKIN+, 제조사명, 판매사명, 권리자명, 등록권자명, 출원인명, 등록번호를 선명하게 표시 금지.
- 특허청/정부기관 로고를 선명한 공식 인증 마크처럼 표시 금지.
- 문서 안 상세 내용이 읽히는 것 금지. 내부는 블러/블루밍 처리.
- 상품 병/제품 이미지 금지.
- 의료적 치료/완치/질병 개선 표현 금지.
- 한국어 깨짐/의미 없는 글자 금지.

최종 비율은 780:1360 세로형. 나중에 780×1360으로 정규화해도 잘리지 않도록 안전 여백을 둔다.`;

await fs.writeFile(path.join(outDir, 'prompts/06-coupang-patent-disclaimer-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/06-disclaimer-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length, uploadFiles);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
console.log('submitted', { url: page.url(), title: await page.title() });
await page.screenshot({ path: path.join(root, 'tmp-v7-cut06-disclaimer-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/06-disclaimer-chat-url.txt'), page.url() + '\n');
