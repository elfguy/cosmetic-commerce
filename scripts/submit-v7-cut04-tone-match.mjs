import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/01.png'), path.join(outDir, 'reference/cut04-tone-ref-01.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/02.png'), path.join(outDir, 'reference/cut04-tone-ref-02.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/03.png'), path.join(outDir, 'reference/cut04-tone-ref-03.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/04.png'), path.join(outDir, 'reference/cut04-structure-ref-current-blue.png')],
  ['/Users/elfguy/.hermes/image_cache/img_401f63c08793.jpeg', path.join(outDir, 'reference/cut04-structure-ref-user-v1.jpeg')],
  ['/Users/elfguy/.hermes/image_cache/img_456aa1629fa7.png', path.join(outDir, 'reference/cut04-ref-product-transparent-bottle-white-lotion.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 04번 이미지를 다시 생성한다. 이전 04번의 전문적인 8종 히알루론산 설명 구조는 유지하되, 색감과 톤앤매너를 V7 01/02/03 이미지와 맞춘다. 설명만 하지 말고 실제 이미지를 생성한다.

[참조 이미지 역할]
- cut04-tone-ref-01.png, cut04-tone-ref-02.png, cut04-tone-ref-03.png: 최우선 톤앤매너 기준. 밝은 화이트 배경, 부드러운 연아쿠아 물결, 민트/그린 포인트, 검정+그린 제목, 둥근 흰색 카드 느낌을 그대로 따른다.
- cut04-structure-ref-current-blue.png: 정보 구조 참고용. 하지만 이 이미지처럼 진한 네이비/강한 파랑/차가운 연구소 느낌은 피한다.
- cut04-structure-ref-user-v1.jpeg: 전문적인 8종 히알루론산 설명 구조 참고. POINT 같은 라벨은 넣지 않는다.
- cut04-ref-product-transparent-bottle-white-lotion.png: 제품 병 표현 기준.

[이번 수정의 핵심]
- 현재 04번은 파란 계열이 너무 강해서 1~3과 톤이 안 맞는다.
- 진파랑, 딥 네이비, 강한 코발트 블루, 차가운 실험실 느낌을 줄인다.
- 1~3처럼 밝고 부드러운 화이트/연아쿠아/민트그린 톤으로 만든다.
- 전문적인 내용은 유지하지만, 의학/연구소 포스터처럼 보이지 말고 프리미엄 스킨케어 상세페이지처럼 보이게 한다.

[상단 문구]
8종 히알루론산 함유
한 방울로 겉부터 속까지
수분을 채웁니다.

[텍스트 색상 규칙]
- 큰 제목은 검정 + 민트그린 강조를 사용한다. 1~3번처럼 검정/초록 중심.
- 진한 네이비 제목 금지.
- 파란 캡션 바 대신 연한 민트/아쿠아 라운드 칩을 사용한다.
- 전체 파란 면적을 줄이고, 흰 여백을 충분히 둔다.

[중단 제목]
8종 히알루론산 레이어 보습

[중단 3단계 그래픽]
가로 3개 수분층 단면 그래픽:
- 겉 수분 보호
- 속수분 충전
- 깊은 수분 전달
단, 그래픽은 현재 04번처럼 짙은 파랑 덩어리로 만들지 말고, 연한 하늘색/투명 물방울/민트 라인으로 부드럽게 표현한다.

[하단 8층 리스트]
1층 고분자 히알루론산
2층 중분자 히알루론산
3층 중·저분자 히알루론산
4층 저분자 히알루론산
5층 초저분자 히알루론산
6층 하이드롤라이즈드 히알루론산
7층 아세틸 히알루론산
8층 소듐하이알루로네이트
- 리스트 배지는 진파랑 원형이 아니라 민트/연아쿠아 라운드 칩으로 표현.
- 오른쪽 수분층 단면도는 연한 투명 아쿠아로, 너무 파랗게 꽉 차지 않게.

[제품 배치]
- 제품 병은 오른쪽 상단/중상단에 1개만 배치.
- 제품을 여러 개 반복하지 않는다.
- 제품 병은 정보 그래픽을 방해하지 않게 자연스럽게.

[제품 병 표현]
- 투명 PET/투명 플라스틱 용기 + 내부 우유빛 흰 로션.
- 병 전체가 통흰색 플라스틱처럼 보이면 안 된다.
- 상단 어깨/목 부분은 투명 공간과 반사광이 보여야 한다.
- 흰색 펌프, 라벨은 YOURSKIN+, HYALURONIC ACID AQUA LOTION, 300ml 느낌 유지.

[배경/장식]
- 1~3번과 같은 하단 연한 물결, 부드러운 물방울, 병풀잎 그린 포인트 사용.
- 전체적으로 깨끗한 흰 여백이 많아야 한다.
- 차갑고 어두운 과학 실험실 배경 금지.

[절대 금지]
- POINT, Point 1, POINT 04, CUT, DETAIL CUT, STEP, 독립 숫자 배지, 페이지 번호, 편집 가이드 라벨 금지.
- 단, 1층~8층 리스트와 8HA 표기는 성분 설명이므로 허용.
- 강한 딥블루/네이비/코발트 톤 금지.
- 의료적 치료/완치/질병 개선 표현 금지.
- 한국어 깨짐/의미 없는 글자 금지.
- 제품명 변형 금지: 데일리 수분 아쿠아 로션 금지, 데일리 아쿠아 로션 금지.

위 조건으로 04번 상세페이지 이미지를 새로 생성해줘.`;

await fs.writeFile(path.join(outDir, 'prompts/04-hyaluronic-tone-match-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/04-tone-match-before-estuary-ids.json'), JSON.stringify(before.map(getId), null, 2));
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
await page.screenshot({ path: path.join(root, 'tmp-v7-cut04-tone-match-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/04-tone-match-chat-url.txt'), page.url() + '\n');
