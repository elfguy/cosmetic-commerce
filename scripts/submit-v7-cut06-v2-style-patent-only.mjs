import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/06.png'), path.join(outDir, 'reference/cut06-v2-style-base.png')],
  ['/Users/elfguy/.hermes/image_cache/img_3562a89bc64b.jpeg', path.join(outDir, 'reference/cut06-user-screenshot-v2-style.jpeg')],
  ['/Users/elfguy/.hermes/image_cache/img_a046351bc9bd.jpeg', path.join(outDir, 'reference/cut06-coupang-patent-certificate-ref.jpeg')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 06번 이미지를 다시 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[핵심 방향]
- cut06-v2-style-base.png / cut06-user-screenshot-v2-style.jpeg의 기존 이미지 방식이 가장 좋다.
- 이 기존 방식의 전체 구성, 밝은 물결 배경, 유리 접시 6개 새싹 원료, 중앙 Fresh Bud No.6 원형 접시, 상단 타이틀 스타일, 부드러운 아쿠아/그린 톤을 최대한 유지한다.
- 절대 새로운 카드형/좌우 문서형 레이아웃으로 크게 바꾸지 않는다.
- 수정은 최소한으로 한다: 특허 인증서와 원료에 대한 특허 문구만 추가/개선한다.

[반드시 유지할 기존 구성]
- 상단: Fresh Bud No.6 / 민감 피부를 위한 / 특허 진정 원료
- 설명: 6가지 새싹에서 찾은 자연의 진정 에너지로 민감해진 피부를 편안하게 케어
- 칩 3개: 새싹 유래 복합 성분 / 민감 피부 케어 / 특허 원료
- 유리 접시 새싹 6종: 알팔파 새싹, 브로콜리 새싹, 적양배추 새싹, 밀 새싹, 청경채 새싹, 무 새싹
- 중앙 원형 접시: 특허 원료 Fresh Bud No.6
- 제품 병/패키지는 넣지 않는다.

[이번에 추가/개선할 부분]
- 하단 왼쪽에 특허 인증서를 넣되, cut06-coupang-patent-certificate-ref.jpeg처럼 실제 특허증서 느낌에 최대한 가깝게 만든다.
- 특허증서는 종이 질감, 얇은 장식 테두리, 도장/직인 같은 디테일이 있는 실사 문서처럼 보이게 한다.
- 하지만 회사명, 권리자명, 출원인명, 등록권자명, 등록번호, 주소, 세부 문서 내용은 모두 블러/블루밍 처리하여 절대 읽히지 않게 한다.
- 특허청/정부기관 로고가 선명한 공식 인증처럼 보이면 안 된다. 분위기만 흐릿하게 남긴다.
- 특허증 제목은 아주 크게 공식 문서처럼 보이되, 세부 식별정보는 읽히지 않게 한다.

[하단 원료 특허 문구]
- 하단에는 아래 취지의 문구를 자연스럽게 넣는다:
  Fresh Bud No.6는 민감 피부 진정에 도움을 주는 특허 받은 6가지 새싹 복합 성분으로 피부 본연의 균형을 지켜줍니다.
- 반드시 작은 주의 문구를 넣는다:
  *상기내용은 원료적 특성에 한함
- 문구는 한국어가 깨지지 않고 또렷해야 한다.

[중요 금지]
- POINT 3, Point 3, POINT, CUT, DETAIL CUT, STEP, 페이지 번호, 독립 숫자 배지 금지.
- 브라우저/휴대폰 UI, 상태바, 검정바, Discord UI, 안드로이드 내비게이션 금지.
- 회사명, YOURSKIN+, 제조사명, 판매사명, 권리자명, 출원인명, 등록번호를 선명하게 표시 금지.
- 과한 공식 인증/정부 보증처럼 보이는 표현 금지.
- 의료적 치료/완치/질병 개선 표현 금지.
- 기존 v2 방식에서 벗어난 큰 레이아웃 변경 금지.

[톤앤매너]
- 밝고 깨끗한 화이트 + 연아쿠아 + 민트그린.
- 물결과 수분감, 새싹의 생기, 프리미엄 화장품 상세페이지 느낌.
- 모바일 상세페이지 세로형. 최종 비율 780:1360에 맞게 안전 여백 확보.`;

await fs.writeFile(path.join(outDir, 'prompts/06-v2-style-patent-only-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/06-v2-style-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
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
await page.screenshot({ path: path.join(root, 'tmp-v7-cut06-v2-style-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/06-v2-style-chat-url.txt'), page.url() + '\n');
