import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const detailDir = path.join(outDir, 'detail');
const rawDir = path.join(outDir, 'agent-detail-raw');
const promptDir = path.join(outDir, 'agent-detail-prompts');
const rejectedDir = path.join(outDir, 'rejected');
const aquaDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/detail');
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(rejectedDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '');
const backupDir = path.join(rejectedDir, `detail09-13-before-no-product-back-${stamp}`);
await fs.mkdir(backupDir, { recursive: true });
for (const n of ['09','10','11','12','13']) {
  const p = path.join(detailDir, `${n}.png`);
  if (existsSync(p)) await fs.copyFile(p, path.join(backupDir, `${n}.png`));
}

const commonStyle = `
[공통 스타일]
- 쿠팡 모바일 상세페이지용 세로 이미지 1장, 780 x 1360 비율.
- 반드시 ChatGPT Images 이미지 생성 결과물 안에 한국어 텍스트까지 자연스럽게 포함해 주세요. 배경만 만들지 마세요.
- 현재 토너 V1 07~08번 및 아쿠아 로션 v4 후반부처럼 흰색/아쿠아/연한 민트/그린 포인트, 깨끗한 rounded card, 물방울/부드러운 물결, 여백 있는 고급 화장품 상세페이지 톤.
- 아쿠아 로션 후반부의 카드형 정보 흐름과 톤앤매너를 참고하되, 제품명/문구는 아래 토너 내용만 사용하세요.
- 실제 제품병, 제품 라벨, 패키지, 박스, 목업, 병 실루엣을 절대 넣지 마세요. 이번 후반부는 제품 반복을 줄이는 정보 중심 컷입니다.
- 가짜 인증 로고, 공식 기관 로고처럼 보이는 마크, 공장 사진, 택배박스 실사, 과한 경고 포스터 느낌 금지.
- 폰트는 기존 컷과 맞는 깔끔한 한국어 산세리프. 제목은 굵고 크게, 본문은 모바일에서 읽히게.
- 컷 번호, POINT/STEP 숫자, V1/V4 같은 버전 표기를 이미지 안에 넣지 마세요.
- 한국어가 깨지거나 임의로 다른 문구/제품명으로 바뀌면 실패입니다.`;

const jobs = [
  {
    n: '09',
    name: 'irritation-test-no-product',
    refs: ['07','08'].map(n => path.join(detailDir, `${n}.png`)).concat([path.join(aquaDir, '08.png'), path.join(aquaDir, '09.png')]),
    prompt: `${commonStyle}

[컷의 역할]
아쿠아 로션 v4 08번처럼 신뢰감 있는 테스트/판정 정보 컷입니다. 단, 제품 이미지는 없이 토너의 피부자극 테스트 결과를 차분한 카드형으로 보여주세요.

[반드시 들어갈 한국어 텍스트 — 그대로 사용]
제목:
피부자극 테스트
비자극 판정

서브 문장:
매일 쓰는 토너라서
사용감과 순한 루틴을 함께 고려했습니다

큰 결과 카드:
비자극 판정
피부자극지수 0.00

보조 카드 1:
매일 사용을 고려한 테스트
세안 후 첫 단계 토너 루틴에 맞춰 설계

보조 카드 2:
향료 무첨가 처방
부담을 줄인 담백한 데일리 케어

하단 작은 문구:
테스트 결과는 시험 조건에 따른 결과이며, 모든 피부에 동일하게 적용되는 것은 아닙니다.

[검수 기준]
- 시험성적서 느낌은 있어도 세부 문서번호/기관명/공식 로고는 흐릿하거나 추상적으로만 표현.
- 제품병/박스/라벨이 나오면 실패.`
  },
  {
    n: '10',
    name: 'fresh-date-no-product',
    refs: ['08','09'].map(n => path.join(detailDir, `${n}.png`)).concat([path.join(aquaDir, '10.png')]),
    prompt: `${commonStyle}

[컷의 역할]
아쿠아 로션 v4 10번의 제조일자/신선함 안내 톤을 참고해, 토너도 제품 사진 없이 달력·체크카드·물방울 그래픽으로 신선 제품 관리 메시지를 보여주세요.

[반드시 들어갈 한국어 텍스트 — 그대로 사용]
제목:
제조일자는
신선함의 기준입니다

서브 문장:
오래 보관된 제품보다
최근 제조 제품을 더 안심하고 선택하세요

중앙 비교 카드 왼쪽:
유어스킨플러스
제조일자 확인 후 발송

중앙 비교 카드 오른쪽:
일부 타사 제품
제조일자 확인이 어려운 경우

하단 강조 문장:
제조일로부터 6개월 이내 제품만 출고

하단 작은 문구:
재고 상황에 따라 제조일자는 달라질 수 있으며, 상세 기준은 판매 안내를 확인해 주세요.

[시각 아이디어]
- 제품 바닥 사진 대신 날짜 카드, 캘린더 아이콘, 체크 스탬프, 투명한 물방울 그래픽.
- 차분한 비교 카드 2개, 왼쪽은 민트 체크, 오른쪽은 연한 회색 톤.

[검수 기준]
- 실제 제품병/제품 바닥/패키지/박스가 나오면 실패.`
  },
  {
    n: '11',
    name: 'direct-management-no-product',
    refs: ['09','10'].map(n => path.join(detailDir, `${n}.png`)).concat([path.join(aquaDir, '12.png'), path.join(aquaDir, '14.png')]),
    prompt: `${commonStyle}

[컷의 역할]
기존 11번의 택배박스+제품병 느낌을 제거하고, 아쿠아 로션 후반부처럼 깔끔한 아이콘 카드형으로 유어스킨플러스 직접 관리/배송/품질관리 메시지를 정리합니다.

[반드시 들어갈 한국어 텍스트 — 그대로 사용]
제목:
유어스킨플러스가
직접 관리합니다

서브 문장:
제조부터 포장, 출고까지
제품 컨디션을 꼼꼼하게 확인합니다

카드 1:
직접 관리
제품 상태와 재고 흐름을 확인

카드 2:
꼼꼼한 포장
배송 중 흔들림을 줄이도록 준비

카드 3:
신선 출고
최근 제조 제품 위주로 출고 관리

카드 4:
상담 응대
구매 전후 문의를 빠르게 확인

하단 작은 문구:
제품별 출고 일정은 주문 및 재고 상황에 따라 달라질 수 있습니다.

[시각 아이디어]
- 박스 실사 대신 선 아이콘: 체크리스트, 보호 패드, 트럭, 상담 말풍선.
- 중앙에 큰 관리 프로세스 카드 4개.

[검수 기준]
- 택배 상자 실사, 제품병, 제품 라벨, 가짜 패키지가 나오면 실패.`
  },
  {
    n: '12',
    name: 'product-info-ingredients-no-product',
    refs: ['10','11'].map(n => path.join(detailDir, `${n}.png`)).concat([path.join(aquaDir, '13.png'), path.join(aquaDir, '12.png')]),
    prompt: `${commonStyle}

[컷의 역할]
아쿠아 로션 v4 13번의 전성분/상품정보 카드 구조를 참고해, 제품 사진 없이 토너의 제품 정보와 전성분을 정리합니다. 글자가 너무 작지 않게 핵심 정보와 전성분 박스를 균형 있게 배치하세요.

[반드시 들어갈 한국어 텍스트 — 그대로 사용]
제목:
제품 정보와
전성분을 확인하세요

제품 정보 카드:
제품명: 히알루론산 수분광채 토너
용량: 500ml
피부타입: 모든 피부
판매·제조: (주)유어스킨
제조국: 대한민국

전성분 카드 제목:
전성분

전성분 본문:
정제수, 다이프로필렌글라이콜, 글리세린, 부틸렌글라이콜, 나이아신아마이드, 베타인, 판테놀, 소듐하이알루로네이트, 하이드롤라이즈드하이알루로닉애씨드, 하이알루로닉애씨드, 소듐아세틸레이티드하이알루로네이트, 하이드록시프로필트라이모늄하이알루로네이트, 포타슘하이알루로네이트, 소듐하이알루로네이트크로스폴리머, 하이드롤라이즈드소듐하이알루로네이트, 알란토인, 카보머, 알지닌, 1,2-헥산다이올, 에틸헥실글리세린

하단 작은 문구:
전성분 정보는 제공 자료 기준이며, 구매 전 제품 라벨을 함께 확인해 주세요.

[시각 아이디어]
- 상단 제품 정보 카드, 하단 전성분 박스 또는 2단 텍스트 카드.
- 물방울/투명 카드 배경으로 딱딱한 표 느낌을 부드럽게.

[검수 기준]
- 제품병/라벨/박스 없음.
- 제품명과 500ml가 바뀌면 실패.
- 전성분을 너무 많이 생략하면 실패.`
  },
  {
    n: '13',
    name: 'official-seller-no-product',
    refs: ['11','12'].map(n => path.join(detailDir, `${n}.png`)).concat([path.join(aquaDir, '14.png'), path.join(aquaDir, '15.png')]),
    prompt: `${commonStyle}

[컷의 역할]
마지막 안내 컷입니다. 아쿠아 로션 v4 15번처럼 차분한 공식 판매자 확인/구매 전 확인 안내를 토너 톤으로 맞추되, 제품병 이미지는 빼고 카드와 아이콘 중심으로 구성합니다.

[반드시 들어갈 한국어 텍스트 — 그대로 사용]
제목:
공식 판매처에서
신선하게 받아보세요

서브 문장:
유어스킨플러스 제품 상태와
출고 이력을 직접 관리합니다

중앙 큰 카드:
(주)유어스킨
공식 판매자 여부를 확인 후 구매해 주세요

카드 1:
공식 판매처 확인
판매자 정보를 꼭 확인하세요

카드 2:
무료 재판매 제품 주의
출처가 불분명한 상품은 피해주세요

카드 3:
제품 상태 확인 어려움
비공식 판매 상품은 관리 이력을 알기 어렵습니다

카드 4:
신선 출고 관리
최근 제조 제품 위주로 꼼꼼히 관리합니다

하단 강조 문구:
좋은 제품은 안전하게 받아보실 수 있도록
공식 판매 경로를 권장합니다

[시각 아이디어]
- 상점, 방패 체크, 배송, 상담 아이콘을 부드러운 민트 라인으로.
- 마지막 컷답게 여백 있고 안정적인 마무리.

[검수 기준]
- 실제 제품병/제품 라벨/가짜 박스가 나오면 실패.
- 경고 포스터처럼 과격한 노랑/검정 스타일 금지.`
  }
];

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) {
  const ids = new Set(fileIdsFromText(src));
  try {
    const u = new URL(src);
    const id = u.searchParams.get('id');
    for (const x of fileIdsFromText(id || '')) ids.add(x);
    if (id?.startsWith('file_')) ids.add(id);
  } catch {}
  return [...ids];
}
function hasKnownId(src, known) { return candidateIds(src).some(id => known.has(id)); }
function primaryId(src) { return candidateIds(src).find(id => id.startsWith('file_')) || src; }
async function state(page) {
  return page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images)
      .map(img => ({ alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight }))
      .filter(x => x.src.includes('backend-api/estuary/content')),
  }));
}

async function generateJob(ctx, job) {
  const refs = job.refs.filter(p => existsSync(p));
  await fs.writeFile(path.join(promptDir, `${job.n}-${job.name}-prompt.txt`), job.prompt);
  await fs.writeFile(path.join(promptDir, `${job.n}-${job.name}-refs.json`), JSON.stringify({ refs, backupDir }, null, 2));
  console.log('start job', job.n, job.name, refs);

  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  console.log('workspace', { n: job.n, url: page.url(), title: await page.title() });
  const create = page.getByText('이미지 만들기', { exact: true }).first();
  if (await create.count()) {
    console.log('click create', job.n);
    await create.click({ timeout: 15000 }).catch(e => console.log('create click fail', e.message));
    await page.waitForTimeout(1500);
  }
  await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
  const before = await state(page);
  const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
  console.log('upload refs', job.n, refs.length);
  await page.setInputFiles('input[type="file"]', refs);
  await page.waitForTimeout(10000);
  for (const text of ['확인', '완료']) {
    const btn = page.getByRole('button', { name: text }).first();
    if (await btn.count()) {
      await btn.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(1000);
    }
  }
  await page.locator('#prompt-textarea').last().click();
  await page.keyboard.insertText(job.prompt);
  await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
  await page.waitForTimeout(8000);
  const chatUrl = page.url();
  await fs.writeFile(path.join(promptDir, `${job.n}-${job.name}-chat-url.txt`), chatUrl + '\n');
  console.log('submitted', job.n, chatUrl);

  for (let i = 1; i <= 150; i++) {
    await page.waitForTimeout(8000);
    const s = await state(page);
    const candidates = [];
    const seen = new Set();
    for (const img of s.imgs) {
      if (img.w < 900 || img.h < 900) continue;
      if (hasKnownId(img.src, beforeIds)) continue;
      if (refs.some(r => img.alt === path.basename(r))) continue;
      const id = primaryId(img.src);
      if (seen.has(id)) continue;
      seen.add(id);
      candidates.push({ ...img, id });
    }
    console.log('poll', job.n, i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
    if (candidates.length && !s.busy) {
      const gen = candidates.filter(c => c.alt.includes('생성된 이미지'));
      const img = (gen.length ? gen : candidates).at(-1);
      const b64 = await page.evaluate(async (src) => {
        const r = await fetch(src, { credentials: 'include' });
        if (!r.ok) throw new Error('fetch ' + r.status);
        const ab = await r.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let s = '';
        for (let j = 0; j < bytes.length; j += 0x8000) s += String.fromCharCode(...bytes.subarray(j, j + 0x8000));
        return btoa(s);
      }, img.src);
      const buf = Buffer.from(b64, 'base64');
      const raw = path.join(rawDir, `${job.n}-${job.name}-agent.png`);
      const final = path.join(detailDir, `${job.n}.png`);
      await fs.writeFile(raw, buf);
      await sharp(buf).resize(780, 1360, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(final);
      const meta = await sharp(final).metadata();
      const result = {
        chatUrl,
        id: img.id,
        natural: `${img.w}x${img.h}`,
        bytes: buf.length,
        raw,
        final,
        finalSize: `${meta.width}x${meta.height}`,
        backupDir,
        refs,
        alt: img.alt,
        rule: 'direct ChatGPT Images output; no local compositing/text overlay; normalized only; no product requested'
      };
      await fs.writeFile(path.join(promptDir, `${job.n}-${job.name}-result.json`), JSON.stringify(result, null, 2));
      console.log('saved', JSON.stringify(result));
      await page.close().catch(() => {});
      return result;
    }
  }
  await page.close().catch(() => {});
  throw new Error(`no generated image for ${job.n}`);
}

async function buildContactSheet() {
  const files = [];
  for (let i = 1; i <= 13; i++) files.push(path.join(detailDir, `${String(i).padStart(2, '0')}.png`));
  const thumbW = 156, thumbH = 272, labelH = 28, gap = 10, cols = 5;
  const items = [];
  for (let i = 0; i < files.length; i++) {
    const n = String(i + 1).padStart(2, '0');
    const img = await sharp(files[i]).resize(thumbW, thumbH, { fit: 'cover' }).png().toBuffer();
    const label = Buffer.from(`<svg width="${thumbW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111827"/><text x="8" y="20" font-family="Arial" font-size="16" fill="#fff">상세 ${n}</text></svg>`);
    const item = await sharp({ create: { width: thumbW, height: thumbH + labelH, channels: 3, background: '#fff' } })
      .composite([{ input: label, left: 0, top: 0 }, { input: img, left: 0, top: labelH }])
      .jpeg({ quality: 88 })
      .toBuffer();
    items.push(item);
  }
  const rows = Math.ceil(items.length / cols);
  const width = cols * thumbW + (cols + 1) * gap;
  const height = rows * (thumbH + labelH) + (rows + 1) * gap;
  const comps = [];
  for (let i = 0; i < items.length; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    comps.push({ input: items[i], left: gap + col * (thumbW + gap), top: gap + row * (thumbH + labelH + gap) });
  }
  const out = path.join(outDir, 'v1-detail-contact.jpg');
  await sharp({ create: { width, height, channels: 3, background: '#f3f4f6' } }).composite(comps).jpeg({ quality: 92 }).toFile(out);
  return out;
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const results = [];
for (const job of jobs) results.push(await generateJob(ctx, job));
const contactSheet = await buildContactSheet();
console.log('contactSheet', contactSheet);
const build = spawnSync('npm', ['run', 'build'], { cwd: root, encoding: 'utf8', timeout: 600000 });
console.log('build exit', build.status);
console.log(build.stdout);
console.error(build.stderr);
if (build.status !== 0) process.exit(build.status ?? 1);
await fs.writeFile(path.join(promptDir, `09-13-no-product-back-summary-${stamp}.json`), JSON.stringify({ backupDir, results, contactSheet }, null, 2));
console.log('DONE', JSON.stringify({ backupDir, contactSheet, count: results.length }, null, 2));
