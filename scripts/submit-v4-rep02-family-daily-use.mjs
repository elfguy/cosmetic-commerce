import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
const promptDir = path.join(outDir, 'representative-prompts');
const refDir = path.join(outDir, 'reference');
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(refDir, { recursive: true });

const refs = [];
const candidates = [
  [path.join(outDir, 'representative/01.png'), path.join(refDir, 'rep02-family-01-approved-main-product-blue-badge.png')],
  // Do NOT upload the currently rejected representative/02 as a visual reference here:
  // it has an oversized product, awkward dispensing pose, and cropped people.
  [path.join(root, 'public/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png'), path.join(refDir, 'rep02-family-03-real-product-packshot.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/representative/02.png'), path.join(refDir, 'rep02-family-04-v2-tone-ref.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/detail/02.png'), path.join(refDir, 'rep02-family-05-v4-family-tone-ref.png')],
];
for (const [src, dst] of candidates) {
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); } catch (e) { console.warn('missing ref', src, e.message); }
}

const prompt = `쿠팡 대표이미지 2번으로 사용할 정사각형 이미지 1장을 실제로 생성해 주세요. 설명만 하지 말고 이미지를 만들어 주세요.\n\n[수정 목표]\n이전 후보는 제품이 너무 크게 보이고, 로션을 짜는/펌핑하는 손동작이 부자연스러우며, 사람이 프레임 밖으로 잘려 보였습니다. 이번 이미지는 그 문제를 반드시 고쳐 주세요.\n\n[제품]\nYOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml\n히알루론산 아쿠아 로션\n\n[참고 이미지 역할]\n1) 승인된 대표 1번: 제품/블루톤/깨끗한 쿠팡 대표 이미지 톤 참고.\n2) 실제 제품 팩샷: 제품 형태/흰색 용기/펌프/라벨 기준.\n3) V2 톤 참고: 연아쿠아/화이트/맑은 보습감 참고.\n4) V4 가족 톤 참고: 가족/데일리 사용 분위기 참고.\n\n[이미지 구성]\n- 1:1 정사각형, 1254x1254에 맞는 구도.\n- 깨끗한 욕실/화장대/아침 루틴 느낌의 밝은 실사 광고 이미지.\n- 가족이 함께 사용하는 자연스러운 데일리 보습 장면. 엄마/아빠/아이 2~3명이 화면 안에 여유 있게 들어오고, 얼굴/머리/팔/몸통이 어색하게 잘리지 않게 넓은 안전 여백을 둡니다.\n- 로션을 짜거나 펌프를 누르는 장면은 넣지 마세요. 손에 로션이 길게 짜여 나오는 장면, 공중에 로션 줄기, 과장된 펌프 동작, 손가락으로 억지로 누르는 포즈 모두 금지입니다.\n- 자연스러운 대안 장면: 아이 팔/손등에 부드럽게 발라주는 모습, 가족이 세면대/화장대 앞에서 웃으며 준비하는 모습, 이미 바른 뒤의 편안한 일상 장면.\n- 제품 병은 세면대나 화장대 위에 세워진 작은 보조 소품처럼 배치합니다. 전체 이미지의 10~18% 정도 크기만 차지하게 하세요. 절대 대형 제품컷처럼 만들지 마세요.\n- 제품은 우측 하단 또는 하단 중앙의 배경 소품으로 작지만 식별 가능하게 보이게 합니다.\n- 따뜻하지만 과하지 않은 가족 생활감. 흰색 + 연아쿠아 + 제품 라벨 블루 계열.\n- 제품은 실제 흰색 펌프 로션 용기로 보이게 하고, 가짜 박스는 만들지 마세요.\n\n[넣을 짧은 한국어 카피]\n큰 제목: 온 가족 데일리 보습\n작은 문장: 가볍게, 매일 편안하게\n\n[카피 디자인]\n- 카피는 작고 깔끔하게, 상단 또는 좌측 여백에 자연스럽게 배치.\n- 제품과 가족 장면을 방해하지 않게.\n- 상세페이지처럼 큰 배너 문구로 만들지 마세요.\n- 해시태그/성분 아이콘/3개 원형 아이콘 금지.\n\n[절대 금지]\n- 제품을 크게 확대해서 주인공으로 만들기 금지.\n- 로션 짜는 손, 펌프 누르는 손, 제품을 손에 들고 짜는 장면 금지.\n- 사람 얼굴/머리/팔/몸통이 프레임에 잘리는 구도 금지.\n- 의료/치료/아토피/질병/피부질환 개선 표현 금지.\n- 아기 전용 제품처럼 보이게 만들지 마세요. 온 가족 데일리 보습 느낌입니다.\n- 과한 물결 배경, 성분 카드, 잎사귀 과다, 해시태그, V2/V4/CUT/STEP/POINT/후보번호 금지.\n- 제품명 변경 금지. 데일리 아쿠아 로션 같은 다른 이름 금지.\n- 가짜 패키지/박스/로고 추가 금지.\n- 한국어 오타/깨짐/잘림 금지.\n\n[완성 기준]\n- 쿠팡 대표 2번으로 1번 제품컷 다음에 보여주기 좋은 가족 사용 이미지.\n- 제품은 작고 자연스럽게 보이고, 가족은 잘리지 않으며, 짜는 장면 없이 온 가족이 매일 쓰는 부드러운 데일리 보습 분위기가 느껴져야 합니다.\n- 고급 GPT Images 제품 광고 퀄리티로 보여야 합니다.`;

await fs.writeFile(path.join(promptDir, '02-gpt-family-daily-use-submitted.txt'), prompt);

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
console.log('opened-images-workspace', { url: page.url(), title: await page.title(), uploadFiles: refs.length });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('not Images workspace');
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(()=>{}); await page.waitForTimeout(2000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(promptDir, '02-gpt-family-daily-use-before-ids.json'), JSON.stringify(before.map(src => { try { return new URL(src).searchParams.get('id') || src } catch { return src } }), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(9000);
for (const text of ['확인','완료']) { const btn = page.getByRole('button', { name: text }).first(); if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(()=>{}); await page.waitForTimeout(1000); } }
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-rep02-family-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(10000);
await fs.writeFile(path.join(promptDir, '02-gpt-family-daily-use-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url() });
