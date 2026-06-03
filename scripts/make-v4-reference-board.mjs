import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/reference');
await fs.mkdir(outDir, { recursive: true });

const refs = [
  ['V2 detail 01', '베이스 후보: 전체 톤은 좋지만 첫 페이지는 V3 01이 더 좋음', 'versions/v2/detail/01.png'],
  ['V3 detail 01', '첫 페이지 방향: V2 01보다 더 좋은 히어로/프리미엄 톤', 'versions/v3/detail/01.png'],
  ['V2 detail 02', '목표 길이 기준: 모든 상세 컷은 이 정도 길이로 통일', 'versions/v2/detail/02.png'],
  ['V2 detail 05', '특허성분 설명 1: V2 06 느낌으로 한 페이지 통합 필요', 'versions/v2/detail/05.png'],
  ['V2 detail 06', '특허성분 설명 2: 전체 느낌은 이 컷이 더 좋음', 'versions/v2/detail/06.png'],
  ['V2 detail 07', '발효성분 페이지: 가운데가 비어 보이고 성분명이 부족함', 'versions/v2/detail/07.png'],
  ['V3 detail 06', '추가 필요: 전성분 EWG 그린 + 약산성 pH 내용', 'versions/v3/detail/06.png'],
  ['V3 detail 07', '추가/교체 필요: 그림 있는 하단 정보, EWG/pH 흐름 참고', 'versions/v3/detail/07.png'],
  ['V2 detail 09', '중간 이하 내용이 어려움 → V3 07 하단 그림식 설명으로 교체', 'versions/v2/detail/09.png'],
  ['V3 detail 08', '사용법 사진 흐름 + 친환경포장 + 제조사 직접판매 내용 참고', 'versions/v3/detail/08.png'],
  ['V2 representative 01', '대표 이미지는 V2 대표이미지 유지', 'versions/v2/representative/01.png'],
  ['Original representative 01', '실제품 참고: 내용물은 흰색, 용기 맨 윗부분은 투명하게 보여야 함', 'versions/original/representative/01.png'],
  ['Original detail 01', '원본 상세: 제품/성분/실물 정보 참고', 'versions/original/detail/01.png'],
  ['Original detail 06', '원본에서 발효성분 시각자료가 있으면 참고', 'versions/original/detail/06.png'],
  ['Original detail 07', '원본에서 발효성분 시각자료가 있으면 참고', 'versions/original/detail/07.png'],
  ['Original detail 08', '원본에서 발효성분/성분 설명 시각자료 참고', 'versions/original/detail/08.png'],
];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box} body{margin:0;background:#f5f1eb;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#1d1b18}.page{width:1800px;padding:40px}h1{font-size:42px;margin:0 0 12px}.summary{font-size:24px;line-height:1.45;margin:0 0 32px;color:#4a4037}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.card{background:white;border-radius:24px;padding:18px;box-shadow:0 8px 24px #0001;border:1px solid #e6ddd2}.title{font-size:24px;font-weight:800;margin-bottom:8px}.note{font-size:18px;line-height:1.35;color:#5f5145;min-height:72px}.imgwrap{margin-top:14px;height:680px;background:#eee7dd;border-radius:16px;display:flex;align-items:flex-start;justify-content:center;overflow:hidden}.imgwrap.square{height:430px;align-items:center}.imgwrap img{width:100%;height:100%;object-fit:contain;display:block}.footer{font-size:20px;margin-top:28px;color:#6a5b4e;line-height:1.5}
</style></head><body><div class="page"><h1>아쿠아로션 V4 생성 참조 보드</h1><p class="summary">V2 전체 톤을 베이스로 하되, 첫 페이지/성분 검증/사용법/친환경·직접판매 정보는 V3 장점을 합쳐 새 V4를 만든다. 최종 이미지는 ChatGPT 웹 GPT Images Pro 모드 생성본을 사용하고, 한국어 텍스트/제품 표현/컷 번호 금지 여부를 개별 검수한다.</p><div class="grid">${refs.map(([title,note,rel])=>{const isSq=rel.includes('/representative/');return `<div class="card"><div class="title">${title}</div><div class="note">${note}</div><div class="imgwrap ${isSq?'square':''}"><img src="file://${root}/public/coupang/images/aqua-lotion/${rel}"></div></div>`}).join('')}</div><div class="footer">필수 보정: 제품 내용물은 흰색, 용기 상단은 투명하게 보이게. 특허성분은 1페이지로 통합. 발효성분명: 효모/겨우살이추출물, 효모/띠뿌리발효추출물, 락토바실러스/콩발효추출물. V3의 EWG 그린·약산성 pH·친환경포장·제조사 직접판매 정보를 V2 흐름에 추가. STOP/펌프 잠금 설명 금지.</div></div></body></html>`;

const htmlPath = path.join(outDir, 'v4-reference-board.html');
const pngPath = path.join(outDir, 'v4-reference-board.png');
await fs.writeFile(htmlPath, html);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1800, height: 3600 }, deviceScaleFactor: 1 });
await page.goto('file://' + htmlPath);
await page.screenshot({ path: pngPath, fullPage: true });
await browser.close();
console.log(pngPath);
