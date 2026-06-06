import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const promptsDir = path.join(base, 'prompts');
const detailDir = path.join(base, 'detail');
const rawDir = path.join(base, 'raw');
await fs.mkdir(promptsDir, { recursive: true });
await fs.mkdir(detailDir, { recursive: true });
await fs.mkdir(rawDir, { recursive: true });

const shared = `\n\nGlobal style and safety rules for every cut:\n- Create ONE premium Korean Coupang mobile detail-page image, vertical 780:1360 composition with safe margins.\n- Match approved toner V1 sibling cuts: clean white base, soft aqua/mint green accents, rounded cards, airy Korean skincare ad quality.\n- Use watery transparent toner visuals, not creamy lotion.\n- Korean text must be large, clean, naturally spelled, not garbled.\n- No visible version markers: no V1/V2/V3/V4, no renewal/proof/candidate, no CUT/DETAIL CUT, no POINT/STEP, no big numeric badges.\n- Avoid medical/absolute claims. Do NOT use: 피부 깊은 곳까지, 속부터 충전, 피부 장벽 강화, 진정 효과, 민감 피부도 안심, 안전한 성분만, 트러블 완화, 치료, 재생, 회복.\n- Do not invent fake certificates, fake official logos, fake boxes, or fake packaging.\n- If the product appears, preserve YOURSKIN+ HYALURONIC ACID TONER 500ml identity and do not redesign the label.\n`;

const cuts = [
  ['03', '03-detail-500ml-solution', `# 상세 03 — 500ml 해결 컷\n\nTopic: 500ml 대용량 가치. Show why 500ml matters after the empathy cut.\n\nRequired Korean copy:\nHeadline: 닦토, 흡토, 스킨팩까지 아낌없이\nSubheadline: 매일 쓰는 수분 토너는 넉넉한 용량이 실사용 가치입니다\nCards/chips: 500ml 대용량 / 화장솜에도 충분히 / 스킨팩도 부담 적게 / 데일리 수분 루틴\nSmall bottom line: 1개 500ml\n\nVisual: large but clean product + cotton pads + watery aqua scene + usage icons/cards. Make it practical and premium, not cluttered.`],
  ['05', '05-detail-first-moisture', `# 상세 05 — 세안 후 첫 수분\n\nTopic: toner as the first moisture step after cleansing.\n\nRequired Korean copy:\nHeadline: 세안 후 첫 단계, 물처럼 가볍게\nSubheadline: 다음 스킨케어 전에 산뜻하게 수분감을 더하는 토너 루틴\nChips: 워터리 사용감 / 끈적임 적은 마무리 / 화장 전 피부결 정돈 / 데일리 첫 수분\nSmall disclaimer: 사용감에 대한 설명입니다\n\nVisual: clean woman after washing, transparent watery splash/drops, palms pressing toner lightly, soft bathroom/vanity mood. No heavy cream texture.`],
  ['06', '06-detail-8-ha-ingredients', `# 상세 06 — 8종 히알루론산 보습 성분\n\nTopic: ingredient proof, but safe cosmetic wording.\n\nRequired Korean copy:\nHeadline: 8종 히알루론산 보습 성분\nSubheadline: 피부에 수분감을 더하는 보습 성분을 토너 한 병에\nCards: 소듐하이알루로네이트 / 하이드롤라이즈드하이알루로닉애씨드 / 하이알루로닉애씨드 / 보습 보조 성분\nResult band: 그래서 피부는 촉촉하게, 사용감은 산뜻하게\nDisclaimer: 원료적 특성에 한함\n\nVisual: elegant aqua molecular/water-layer cards, transparent droplets, ingredient spheres, no lab-heavy dark blue poster. Product optional small.`],
  ['07', '07-detail-comfort-ingredients', `# 상세 07 — 편안한 사용감 보조 성분\n\nTopic: 병풀, 판테놀, 알란토인, 해양심층수 등 supporting ingredients tied to toner feel.\n\nRequired Korean copy:\nHeadline: 데일리 토너에 어울리는 편안한 사용감\nSubheadline: 병풀추출물, 판테놀, 알란토인, 해양심층수로 산뜻한 수분 루틴\nCards: 병풀추출물 / 판테놀 / 알란토인 / 해양심층수\nBottom: 피부결 정돈에 도움을 주는 산뜻한 사용감\nDisclaimer: 원료적 특성에 한함\n\nVisual: soft botanical + aqua ingredient cards, watery toner drops, clean face/skin texture. Do not claim 진정 효과.`],
  ['08', '08-detail-weak-acidic-ph', `# 상세 08 — 약산성 pH\n\nTopic: weak-acidic pH design for first step after cleansing.\n\nRequired Korean copy:\nHeadline: 세안 후 첫 단계에 부담 적은 약산성 설계\nSubheadline: pH 5.0~6.5 약산성 토너로 데일리 루틴을 산뜻하게\nVisual labels: pH 5.0~6.5 / 세안 후 첫 단계 / 데일리 수분 토너\nSmall line: 피부 pH와 유사한 약산성 범위\n\nVisual: simple pH scale in soft aqua/mint, clean rounded card, water ripple, no medical barrier claims, no scary science poster.`],
  ['09', '09-detail-fragrance-ewg', `# 상세 09 — 향료 무첨가 / EWG 그린 등급 원료 구성\n\nTopic: daily-use reassurance without absolute safety claims.\n\nRequired Korean copy:\nHeadline: 매일 쓰는 토너라 더 담백하게\nSubheadline: 향료 무첨가, EWG 그린 등급 원료 구성으로 데일리 루틴에 맞췄습니다\nCards: 향료 무첨가 / EWG 그린 등급 원료 구성 / 산뜻한 워터리 사용감\nDisclaimer: 원료 등급은 원료사 기준 정보에 따름\n\nVisual: clean green ingredient cards, no official EWG logo unless generic text only, no “안전한 성분만”.`],
  ['10', '10-detail-irritation-test', `# 상세 10 — 피부자극 테스트\n\nTopic: irritation test evidence, conservative wording.\n\nRequired Korean copy:\nHeadline: 피부자극 테스트 비자극 판정\nSubheadline: 데일리 토너로 사용할 수 있도록 사용감과 테스트 결과를 함께 고려했습니다\nMain badge text: 비자극 판정\nSmall disclaimer: 시험 결과는 해당 시험 조건에 한함\n\nVisual: premium blurred test report/document in background, aqua cards, check icon allowed but not numbered, sensitive document details blurred/unreadable. Do not say 민감 피부도 안심 or 무자극 제품.`],
  ['11', '11-detail-fresh-shipping', `# 상세 11 — 신선 출고 / 제조 6개월 이내\n\nTopic: directly manufactured and fresh shipping trust, tied to daily high-use toner.\n\nRequired Korean copy:\nHeadline: 매일 넉넉히 쓰는 토너라 더 신선하게\nSubheadline: 제조 6개월 이내 제품을 기준으로 신선 출고합니다\nCards: 직접 제조 / 최근 제조 제품 / 제조일자 확인 / 신선 출고 기준\nSmall disclaimer: 출고 시점 재고 상황에 따라 제조일자는 달라질 수 있습니다\n\nVisual: product-bottom/manufacture-date closeup style, shipping/fresh aqua warehouse hint, not a fake official certificate.`],
  ['12', '12-detail-direct-sale-packaging', `# 상세 12 — 직접 판매 / 포장 신뢰\n\nTopic: brand trust, direct sale and careful packaging, not the main product reason.\n\nRequired Korean copy:\nHeadline: 유어스킨플러스가 직접 관리합니다\nSubheadline: 제조부터 포장, 출고까지 제품 상태를 꼼꼼히 확인합니다\nCards: 직접 제조 / 직접 판매 / 꼼꼼한 포장 / 신선한 출고 관리\nBottom: 과한 유통 단계를 줄인 합리적인 데일리 케어\n\nVisual: brand-free clean packaging materials, aqua/kraft/leaf mood, no fake branded box. Product can appear as real bottle only, no invented package.`],
  ['13', '13-detail-product-info-ingredients', `# 상세 13 — 제품 정보 / 전성분\n\nTopic: readable product info and ingredient information. Text-heavy but must still look designed, not plain table only.\n\nRequired Korean copy:\nHeadline: 제품 정보와 전성분을 확인하세요\nProduct info rows:\n제품명: 유어스킨플러스 히알루론산 토너\n용량: 500ml\n사용방법: 세안 후 손 또는 화장솜에 적당량을 덜어 피부결을 따라 사용하세요\n판매·제조: (주)유어스킨\n\nIngredient section title: 전성분\nInclude a compact readable ingredient block impression, not necessarily every tiny ingredient perfectly, but Korean must not be garbled.\n\nVisual: premium info card layout with soft aqua background, clean typography, small product/water motif. Avoid overcrowding.`],
  ['14', '14-detail-official-seller-notice', `# 상세 14 — 공식 판매처 / 리셀러 주의\n\nTopic: final notice with minimal warning feeling.\n\nRequired Korean copy:\nHeadline: 공식 판매처에서 신선하게 받아보세요\nSubheadline: 유어스킨플러스는 제품 상태와 출고 이력을 직접 관리합니다\nNotice cards: 공식 판매처 확인 / 무단 재판매 제품 주의 / 제품 상태 확인 어려움 / 신선 출고 관리\nBottom: 구매 전 판매자를 꼭 확인해 주세요\n\nVisual: calm trust notice, official storefront/checklist mood, aqua/mint, not scary red warning poster. No fake legal seal or certificate.`],
];

function run(cmd, env) {
  console.log('RUN', cmd, env);
  const r = spawnSync(cmd, { shell: true, cwd: root, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 1000 * 60 * 15 });
  process.stdout.write(r.stdout || '');
  process.stderr.write(r.stderr || '');
  if (r.status !== 0) throw new Error(`command failed ${cmd} status=${r.status}`);
}

for (const [cut, key, body] of cuts) {
  const out = path.join(detailDir, `${cut}.png`);
  try { await fs.access(out); console.log('SKIP existing', cut, out); continue; } catch {}
  await fs.writeFile(path.join(promptsDir, `${key}.md`), `${body}${shared}`);
  run('node scripts/submit-toner-v1-detail-cut.mjs', { CUT: cut, KEY: key });
  run('node scripts/poll-download-toner-v1-detail-cut.mjs', { CUT: cut, KEY: key });
  run('node scripts/normalize-toner-v1-detail-cut.mjs', { CUT: cut, KEY: key });
}

// Update parent manifest with explicit detail image array for all generated cuts.
const parentManifestPath = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/manifest.json');
const manifest = JSON.parse(await fs.readFile(parentManifestPath, 'utf8'));
const v1 = manifest.versions.find(v => v.id === 'v1');
if (v1) {
  v1.detailImages = [];
  for (let i=1; i<=14; i++) {
    const nn = String(i).padStart(2, '0');
    const p = path.join(detailDir, `${nn}.png`);
    try { await fs.access(p); v1.detailImages.push({ src: `public/coupang/images/hyaluronic-acid-toner/versions/v1/detail/${nn}.png` }); } catch {}
  }
  v1.detailCount = v1.detailImages.length;
  v1.status = 'candidate';
  v1.note = `토너 V1 상세 ${v1.detailCount}컷 순차 생성본`;
  await fs.writeFile(parentManifestPath, JSON.stringify(manifest, null, 2));
}

// Contact sheet for review.
const files = [];
for (let i=1; i<=14; i++) {
  const nn = String(i).padStart(2, '0');
  const p = path.join(detailDir, `${nn}.png`);
  try { await fs.access(p); files.push({ nn, p }); } catch {}
}
const thumbW = 195, thumbH = 340, gap = 16, labelH = 34, cols = 4;
const rows = Math.ceil(files.length / cols);
const W = cols * thumbW + (cols + 1) * gap;
const H = rows * (thumbH + labelH + gap) + gap;
const composites = [];
for (let idx=0; idx<files.length; idx++) {
  const { nn, p } = files[idx];
  const x = gap + (idx % cols) * (thumbW + gap);
  const y = gap + Math.floor(idx / cols) * (thumbH + labelH + gap);
  const buf = await sharp(p).resize(thumbW, thumbH, { fit: 'cover' }).png().toBuffer();
  composites.push({ input: buf, left: x, top: y + labelH });
  const label = Buffer.from(`<svg width="${thumbW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" rx="12" fill="#e9f8f4"/><text x="${thumbW/2}" y="23" font-size="18" font-weight="700" text-anchor="middle" fill="#168567" font-family="Arial, Apple SD Gothic Neo, sans-serif">상세 ${nn}</text></svg>`);
  composites.push({ input: label, left: x, top: y });
}
await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } }).composite(composites).jpeg({ quality: 88 }).toFile(path.join(base, 'v1-detail-contact.jpg'));

run('npm run build', {});
console.log('ALL_DONE', { detailCount: files.length, contact: path.join(base, 'v1-detail-contact.jpg') });
