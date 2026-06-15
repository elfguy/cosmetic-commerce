import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const promptDir=path.join(root,'public/coupang/images/moisture-lip-balm/versions/v1/agent-representative-prompts');
const slots={
 '01-product-hero': {
  role:'대표 01. 쿠팡 첫 메인 이미지. 제품 원본 비율을 가장 정확하게 보여주는 상품 중심 컷.',
  text:['유어스킨플러스 모이스춰 립밤','무색 데일리 립케어','4g / 0.14 oz','제조 6개월 이내 신선 제품','2개'],
  comp:'흰색/아주 연한 민트 배경. 원본 비율의 닫힌 립밤 2개를 크게 세움. 왼쪽/오른쪽 제품 모두 원본처럼 슬림한 흰 원통, 검정 세로 라벨. 작은 신선 제품 배지는 보조 요소로만 배치. 과한 광고문구 없이 상품 중심.',
  refs:['drive-lipbalm-closed-product.png','drive-lipbalm-closed-clean.png','drive-lipbalm-closed-duo.png','drive-lipbalm-product-ratio-guide.jpg','fresh-badge-ref.png','01-product-hero-current-layout.png']
 },
 '02-oil-butter-point': {
  role:'대표 02. 오일·왁스·버터 보습막 핵심 소구. 제품은 1개만 원본 비율로 배치.',
  text:['오일·왁스·버터 보습막','건조한 입술에 부드러운 보호감','해바라기씨오일 · 비즈왁스 · 야자씨버터','무색 스틱형 립밤'],
  comp:'제품 1개와 립밤 텍스처/오일 방울/버터 조각 느낌의 깨끗한 오브젝트. 제품은 원본 닫힌 립밤처럼 슬림한 흰 원통으로, 뚜껑/하단 회전부 비율을 왜곡하지 말 것. 현재 02는 레이아웃 참고만 하고 제품 모양은 참고하지 않음.',
  refs:['drive-lipbalm-closed-product.png','drive-lipbalm-closed-clean.png','drive-lipbalm-product-ratio-guide.jpg','02-oil-butter-point-current-layout.png','v1-detail-05.png']
 },
 '03-human-use': {
  role:'대표 03. 성인 모델 1명의 자연스러운 사용감 컷. 손에 든 제품도 원본 비율로 보여야 함.',
  text:['입술이 건조할 때마다','가볍게 수시 보습','무색이라 남녀 모두 자연스럽게'],
  comp:'성인 모델 1명, 입술에 립밤을 바르는 자연스러운 장면. 손에 들린 립밤은 실제 원본처럼 슬림한 흰 원통/검정 세로 라벨/짧은 하단 회전부. 사람 얼굴은 깨끗하고 과한 메이크업/치료 느낌 금지. 현재 03은 장면 참고만 하고 제품 비율은 참고하지 않음.',
  refs:['drive-lipbalm-closed-product.png','drive-lipbalm-closed-clean.png','drive-lipbalm-scene-03.jpg','drive-lipbalm-product-ratio-guide.jpg','03-human-use-current-layout.png']
 },
 '04-texture-open-stick': {
  role:'대표 04. 열린 스틱과 텍스처/발림감. 열린 제품의 구조 비율이 핵심.',
  text:['버터처럼 부드러운 발림','끈적임은 덜고, 보습감은 편안하게','립 메이크업 전에도 부담 없이'],
  comp:'뚜껑 열린 흰색 립밤 스틱 클로즈업. 업로드한 open-stick 원본처럼 아래 흰색 회전/손잡이 영역은 짧고 안정적, 가운데 흰색 슬림 스틱이 올라오며, 위 베이지 립밤 내용물이 자연스럽게 보임. 손잡이 영역이 너무 길거나 컵처럼 뚱뚱해지면 실패. 제품 옆에는 립밤 스와치/부드러운 텍스처만 배치.',
  refs:['drive-lipbalm-open-stick.png','drive-lipbalm-closed-product.png','drive-lipbalm-product-ratio-guide.jpg','04-texture-open-stick-current-layout.png','v1-detail-06.png']
 },
 '05-portable-daily': {
  role:'대표 05. 휴대성/데일리 루틴 컷. 오브젝트 중심이며 제품 1개를 원본 비율로.',
  text:['작은 스틱 하나로','언제 어디서나 데일리 립케어','사무실 · 가방 · 외출 전','무색 휴대용 립밤'],
  comp:'가방/파우치/책상 위 소품과 제품 1개. 사람 얼굴 없음. 제품은 작은 휴대용 립밤으로 보이되 원본처럼 슬림한 흰 원통과 검정 세로 라벨 유지. 현재 05는 배치/톤만 참고, 제품 비율은 원본 Drive 이미지를 따름.',
  refs:['drive-lipbalm-closed-product.png','drive-lipbalm-closed-clean.png','drive-lipbalm-scene-01.jpg','drive-lipbalm-product-ratio-guide.jpg','05-portable-daily-current-layout.png']
 },
 '06-official-fresh': {
  role:'대표 06. 신선 제조/공식 판매처 신뢰 컷. 제품을 넣는 경우 원본 비율로 작게만.',
  text:['공식 판매처에서 안심 구매','제조일자 확인 가능','제조 6개월 이내 신선 제품 발송','(주)유어스킨 직접 관리'],
  comp:'차분한 신뢰 카드형 대표 이미지. 제품은 작게 1개만 넣거나, 카드 중심으로 구성. 제품을 넣을 경우 원본처럼 슬림한 흰 원통/검정 세로 라벨/짧은 하단 회전부. 특정 리셀러 공격 금지. 현재 06은 톤/카드 구성만 참고.',
  refs:['drive-lipbalm-closed-product.png','drive-lipbalm-closed-clean.png','drive-lipbalm-product-ratio-guide.jpg','06-official-fresh-current-layout.png','fresh-badge-ref.png']
 }
};
const common=(role,text,comp)=>`쿠팡 대표/메인 이미지용 정사각형 1장, 1000 x 1000 비율로 제작해 주세요.\n중요: 반드시 ChatGPT Images 결과물 안에 한국어 텍스트까지 자연스럽게 포함해 주세요. 배경만 만들지 마세요.\n\n[상품]\n유어스킨플러스 모이스춰 립밤 / 4g / 0.14 oz / 무색 스틱형 / 남녀공용 / 기능성 화장품 해당 없음\n전성분 핵심: 해바라기씨오일, 비즈왁스, 야자씨버터, 호호바씨오일, 토코페롤\n\n[원본 제품 비율 — 반드시 준수]\n- 업로드한 Google Drive 원본 제품 사진이 제품 모양의 최우선 기준입니다.\n- 닫힌 제품: 슬림한 흰색 원통형 립밤. 전체 폭:높이 비율은 약 0.24, 즉 높이가 폭의 약 4.1배입니다.\n- 검정 세로 라벨: YOURSKIN+ / MOISTURE LIP BALM / 4g / 0.14 oz 느낌을 유지합니다.\n- 뚜껑/바디는 길고 매끈한 흰 원통이며, 하단 회전 손잡이/베이스 영역은 짧습니다.\n- 제품이 옆으로 뚱뚱해지거나, 손잡이 영역이 과하게 길거나, 뚜껑과 바디 비율이 원본과 달라지면 실패입니다.\n- 열린 제품이 필요한 경우: 업로드한 open-stick 원본처럼 아래 손잡이 영역은 짧고, 가운데 흰색 슬림 스틱과 위 베이지 립밤 내용물 비율을 유지합니다.\n- 현재 기존 메인 이미지는 레이아웃/톤 참고용일 뿐이며, 그 안의 제품 비율은 따라 하지 마세요.\n\n[스타일]\n- 쿠팡 모바일 대표 이미지 세트: 깨끗한 흰색/민트/베이지 K-뷰티 톤.\n- 한국어는 굵고 읽기 쉬운 산세리프. 명조/손글씨/캘리그래피 금지.\n- 제품 라벨을 엉뚱한 브랜드/문구로 바꾸지 마세요.\n- 비건, 치료, 재생, 염증 개선, 각질 제거 보장, 완벽 개선 같은 표현 금지.\n- 원본에 없는 인증/테스트 마크를 새로 만들지 마세요.\n\n[역할]\n${role}\n\n[텍스트 — 그대로 사용]\n${text.join('\n')}\n\n[구성]\n${comp}\n\n[검수 기준]\n- 1000x1000 정사각 대표 이미지로 자연스럽게 보일 것.\n- 한국어 오타/깨짐이 있으면 실패.\n- 제품명/라벨/SKU가 완전히 다른 상품처럼 보이면 실패.\n- 닫힌 제품은 원본처럼 폭:높이 약 0.24의 슬림 원통이어야 합니다.\n- 열린 제품은 원본처럼 짧은 하단 손잡이 + 슬림 스틱 + 베이지 립밤 내용물 구조여야 합니다.\n- 비건/치료/재생/완벽개선 등 위험 문구가 있으면 실패.\n`;
for (const [key,v] of Object.entries(slots)) {
 const [slot,...rest]=key.split('-'); const k=rest.join('-');
 await fs.writeFile(path.join(promptDir,`${slot}-${k}-prompt.txt`), common(v.role,v.text,v.comp));
 await fs.writeFile(path.join(promptDir,`${slot}-${k}-refs.json`), JSON.stringify(v.refs,null,2));
}
console.log('updated prompts');
