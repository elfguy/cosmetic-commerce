import comparisonData from '../../data/yourskinplus-8-product-comparison.json';
import fs from 'node:fs';
import path from 'node:path';

export type PriorityLevel = 'focus' | 'support' | 'watch' | 'archive';

export type ProductOpsStatus = {
  slug: string;
  priority: PriorityLevel;
  campaignRole: string;
  detailStatus: string;
  assetStatus: string;
  claimRisk: 'low' | 'medium' | 'high';
  nextAction: string;
  workspaceUrl?: string;
  salesNote?: string;
};

export const productOpsStatuses: ProductOpsStatus[] = [
  {
    slug: 'hyaluronic-toner',
    priority: 'focus',
    campaignRole: '수분 루틴 진입 상품',
    detailStatus: 'V1 대표 6장 + 상세 13컷 사이트 현재 적용',
    assetStatus: 'V1 사이트/쿠팡 현재 적용',
    claimRisk: 'medium',
    nextAction: '판매 페이지 캐시와 상세 컷 표시 상태 확인',
    workspaceUrl: '/marketing/hyaluronic-toner-version-compare/',
    salesNote: '최근 판매량 1위. 유입 상품으로 먼저 밀기 좋음',
  },
  {
    slug: 'aqua-lotion',
    priority: 'focus',
    campaignRole: '토너와 묶는 수분 루틴 세트',
    detailStatus: 'V4 대표 6장 + 상세 15컷 쿠팡 반영 완료',
    assetStatus: 'V4 사이트/쿠팡 현재 적용',
    claimRisk: 'medium',
    nextAction: '광고/판매 데이터 관찰 후 토너와 수분 루틴 세트 구성 검토',
    workspaceUrl: '/marketing/aqua-lotion-version-compare/',
    salesNote: '토너와 세트 제안하면 객단가 보강 가능',
  },
  {
    slug: 'cleansing-oil',
    priority: 'focus',
    campaignRole: '모공/선크림 세정 검색 대응',
    detailStatus: 'V1 상세 01~14 제작/검수 완료',
    assetStatus: 'V1 후보 제작 완료 — 쿠팡 미반영',
    claimRisk: 'medium',
    nextAction: 'Leo 최종 검수 후 쿠팡 업로드 여부 결정',
    workspaceUrl: '/marketing/cleansing-oil-version-compare/',
  },
  {
    slug: 'cleansing-gel',
    priority: 'support',
    campaignRole: '약산성 2차 세안 보조 상품',
    detailStatus: 'V1 상세 01 신규 제작, 02~14 원본 유지로 순차 제작 시작',
    assetStatus: 'V1 로컬 후보 제작 중 — 쿠팡 미반영',
    claimRisk: 'medium',
    nextAction: '상세 02 추천대상 컷부터 클렌징 듀오 루틴 흐름으로 순차 리뉴얼',
    workspaceUrl: '/marketing/cleansing-gel-version-compare/',
  },
  {
    slug: 'whitening-cream',
    priority: 'focus',
    campaignRole: '기능성 전환 상품',
    detailStatus: 'V1 상세 14컷 후보 비교 중 — 13/14 제외, 원본 성분표 마지막 배치',
    assetStatus: 'V1 후보 검수 중 — 쿠팡 미반영',
    claimRisk: 'high',
    nextAction: 'V1 흐름에서 공식 판매처 컷 뒤 원본 성분표가 자연스러운지 확인',
    workspaceUrl: '/marketing/whitening-cream-version-compare/',
  },
  {
    slug: 'all-in-one-lotion',
    priority: 'support',
    campaignRole: '남성 간편 루틴 확장',
    detailStatus: 'V1 대표 6장 + 상세 15컷 후보 생성 완료 — 상세 13 공식 판매처 / 상세 14 원본 법정표 보존',
    assetStatus: 'V1 후보 제작 완료 — 쿠팡 미반영',
    claimRisk: 'high',
    nextAction: 'Leo 오전 검수 후 쿠팡 업로드 여부 결정',
    workspaceUrl: '/marketing/all-in-one-lotion-version-compare/',
  },
  {
    slug: 'rose-essence',
    priority: 'support',
    campaignRole: '향/감성 보조 상품',
    detailStatus: 'V1 상세 14컷 후보 생성/검수 완료 — 05a/05b는 화면상 10번 미니멀 포장 위 배치',
    assetStatus: 'V1 상세 후보 제작 완료 — 쿠팡 미반영',
    claimRisk: 'medium',
    nextAction: 'Leo 최종 검수 후 쿠팡 업로드 여부 결정',
    workspaceUrl: '/marketing/rose-essence-version-compare/',
  },
  {
    slug: 'moisture-lip-balm',
    priority: 'watch',
    campaignRole: '객단가 보조 상품',
    detailStatus: '현재 상세와 네이버 노출 확인 필요',
    assetStatus: '현재 적용 상세 확인',
    claimRisk: 'low',
    nextAction: '비건 표현 금지, 휴대용 보습 보조 상품으로 카피 정리',
  },
  {
    slug: 'white-glow-tone-up-cream',
    priority: 'watch',
    campaignRole: '톤업 라인 보류 상품',
    detailStatus: '고시정보 추가 확인 필요',
    assetStatus: '현재 적용 상세 확인',
    claimRisk: 'high',
    nextAction: '기능성 여부와 고시정보 확인 후 미백/톤업 표현 사용 범위 확정',
  },
  {
    slug: 'soothing-cream',
    priority: 'watch',
    campaignRole: 'PDRN 수딩 라인 보류 상품',
    detailStatus: '신규 상품 데이터 검수 필요',
    assetStatus: '현재 적용 상세 확인',
    claimRisk: 'medium',
    nextAction: 'PDRN 원료 컨셉을 효능 단정 없이 수분/진정 보조 표현으로 정리',
  },
  {
    slug: 'pdrn-hyaluronic-ampoule',
    priority: 'watch',
    campaignRole: '앰플 라인 보류 상품',
    detailStatus: '고시정보 추가 확인 필요',
    assetStatus: '현재 적용 상세 확인',
    claimRisk: 'high',
    nextAction: '고시정보와 대표 이미지 문구 확인 후 상세 개선 대상 여부 결정',
  },
];

export const opsBySlug = new Map(productOpsStatuses.map((item) => [item.slug, item]));

export const products = comparisonData.products.map((product) => ({
  ...product,
  ops: opsBySlug.get(product.slug) ?? {
    slug: product.slug,
    priority: 'watch' as const,
    campaignRole: '상태 확인 필요',
    detailStatus: '검토 전',
    assetStatus: '자료 확인 필요',
    claimRisk: 'medium' as const,
    nextAction: '상품 마스터와 상세 이미지 상태 확인',
  },
}));

export const focusProducts = products.filter((product) => product.ops.priority === 'focus');
export const supportProducts = products.filter((product) => product.ops.priority === 'support');
export const watchProducts = products.filter((product) => product.ops.priority === 'watch');

export const navGroups = [
  {
    label: '운영',
    links: [
      { href: '/', label: '대시보드', note: 'Home' },
      { href: '/products/', label: '상품상세', note: 'Detail' },
      { href: '/competitor-comparison/', label: '경쟁상품', note: 'Market' },
    ],
  },
];

export const commandTasks = [
  {
    label: '상세 첫 화면',
    title: '히알루론산 토너 첫 3컷 재구성',
    product: '히알루론산 토너',
    href: '/products/hyaluronic-toner/',
    state: '우선',
  },
  {
    label: 'V4',
    title: '아쿠아로션 V4 상세 15컷 검수',
    product: '아쿠아 로션',
    href: '/marketing/aqua-lotion-version-compare/',
    state: '검토',
  },
  {
    label: '세트 구성',
    title: '토너 + 아쿠아 로션 수분 루틴 묶기',
    product: '수분 라인',
    href: '/products/',
    state: '기획',
  },
  {
    label: '표현 검수',
    title: '화이트닝/올인원 기능성 문구 허용 범위 정리',
    product: '기능성 라인',
    href: '/products/whitening-cream/',
    state: '주의',
  },
  {
    label: '경쟁상품',
    title: '클렌징 오일 블랙헤드 표현을 세정 관리 문구로 전환',
    product: '클렌징 오일',
    href: '/products/cleansing-oil/',
    state: '주의',
  },
];

export type ProductVersion = {
  id: string;
  label: string;
  status: 'live' | 'candidate' | 'review' | 'draft' | 'archive';
  date: string;
  summary: string;
  mainImages: string[];
  detailImages: string[];
  links?: Array<{ label: string; href: string }>;
  metrics?: Array<{ label: string; value: string }>;
};

export const productVersions: Record<string, ProductVersion[]> = {
  'hyaluronic-toner': [
    {
      id: 'v1',
      label: 'V1',
      status: 'live',
      date: '2026-06-07',
      summary: '쿠팡 반영용 V1 정리본입니다. 대표 6장과 상세 13컷을 사이트 현재 적용 버전으로 사용합니다. 공식 판매 안내 컷을 12번으로 이동하고, 첨부 표시정보/전성분 표를 13번에 배치했습니다.',
      mainImages: Array.from({ length: 6 }, (_, i) => '/coupang/images/hyaluronic-acid-toner/versions/v1/representative/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: Array.from({ length: 13 }, (_, i) => '/coupang/images/hyaluronic-acid-toner/versions/v1/detail/' + String(i + 1).padStart(2, '0') + '.png'),
      links: [
        { label: '토너 V1 비교 페이지 열기', href: '/marketing/hyaluronic-toner-version-compare/' },
        { label: '첫 대표 이미지 열기', href: '/coupang/images/hyaluronic-acid-toner/versions/v1/representative/01.png' },
        { label: '첫 상세 이미지 열기', href: '/coupang/images/hyaluronic-acid-toner/versions/v1/detail/01.png' },
      ],
      metrics: [
        { label: '대표', value: '6' },
        { label: '상세', value: '13' },
        { label: '상태', value: 'V1' },
      ],
    },
  ],
  'aqua-lotion': [
    {
      id: 'v4',
      label: 'V4',
      status: 'live',
      date: '2026-06-05',
      summary: '쿠팡 승인완료 반영본입니다. 미니멀 포장 컷은 기존 12번을 유지하고, 법정표는 마지막 컷으로 배치합니다.',
      mainImages: Array.from({ length: 6 }, (_, i) => '/coupang/images/aqua-lotion/versions/v4/representative/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: [
        ...Array.from({ length: 12 }, (_, i) => '/coupang/images/aqua-lotion/versions/v4/detail/' + String(i + 1).padStart(2, '0') + '.png'),
        '/coupang/images/aqua-lotion/versions/v4/detail/14.png',
        '/coupang/images/aqua-lotion/versions/v4/detail/15.png',
        '/coupang/images/aqua-lotion/versions/v4/detail/16.png',
      ],
      links: [
        { label: '작업하던 비교 페이지 열기', href: '/marketing/aqua-lotion-version-compare/' },
        { label: '첫 대표 이미지 열기', href: '/coupang/images/aqua-lotion/versions/v4/representative/01.png' },
        { label: '첫 상세 이미지 열기', href: '/coupang/images/aqua-lotion/versions/v4/detail/01.png' },
      ],
      metrics: [
        { label: '대표', value: '6' },
        { label: '상세', value: '15' },
        { label: '상태', value: 'V4' },
      ],
    },
  ],
  'cleansing-oil': [
    {
      id: 'original',
      label: '원본 등록본',
      status: 'live',
      date: '-',
      summary: '현재 쿠팡/로컬 기준 원본 등록본입니다. 대표 5장과 상세 14컷을 기준점으로 둡니다.',
      mainImages: Array.from({ length: 5 }, (_, i) => '/coupang-main/cleansing-oil/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: Array.from({ length: 14 }, (_, i) => '/coupang-detail/9221762154/' + String(i + 1).padStart(2, '0') + '.png'),
      links: [
        { label: '원본 첫 상세 열기', href: '/coupang-detail/9221762154/01.png' },
        { label: '원본 대표 1번 열기', href: '/coupang-main/cleansing-oil/01.png' },
      ],
      metrics: [
        { label: '대표', value: '5' },
        { label: '상세', value: '14' },
        { label: '상태', value: '원본' },
      ],
    },
    {
      id: 'v1',
      label: 'V1 후보',
      status: 'candidate',
      date: '2026-06-10',
      summary: '클렌징오일 V1 후보입니다. 대표 01~05 전체를 새 흐름으로 구성했습니다. 01은 신선제품 마크 중심 메인, 02는 딥 클렌징 포인트, 03은 사람 사용감, 04는 손 펌핑 제형, 05는 산뜻한 마무리/공식 신뢰 컷입니다. 상세 01~14 전체를 새 흐름으로 정리했습니다. 쿠팡에는 아직 미반영입니다.',
      mainImages: Array.from({ length: 5 }, (_, i) => '/coupang/images/cleansing-oil/versions/v1/representative/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: [
        ...Array.from({ length: 12 }, (_, i) => '/coupang/images/cleansing-oil/versions/v1/detail/' + String(i + 1).padStart(2, '0') + '.png'),
        '/coupang/images/cleansing-oil/versions/v1/detail/14.png',
        '/coupang/images/cleansing-oil/versions/v1/detail/13.png',
      ],
      links: [
        { label: '원본/V1 비교 페이지 열기', href: '/marketing/cleansing-oil-version-compare/' },
        { label: 'V1 첫 상세 열기', href: '/coupang/images/cleansing-oil/versions/v1/detail/01.png' },
      ],
      metrics: [
        { label: '대표', value: '5 신규/재구성' },
        { label: '상세', value: '14 신규/재정리' },
        { label: '상태', value: '쿠팡 미반영 후보' },
      ],
    },
  ],
  'cleansing-gel': [
    {
      id: 'original',
      label: '원본 등록본',
      status: 'live',
      date: '-',
      summary: '현재 쿠팡/로컬 기준 원본 상세 14컷입니다. V1 제작의 기준점으로 둡니다.',
      mainImages: [],
      detailImages: [
        ...Array.from({ length: 12 }, (_, i) => '/coupang-detail/9025751494/' + String(i + 1).padStart(2, '0') + '.png'),
        '/coupang-detail/9025751494/14.png',
        '/coupang-detail/9025751494/13.png',
      ],
      links: [
        { label: '원본/V1 비교 페이지 열기', href: '/marketing/cleansing-gel-version-compare/' },
        { label: '원본 첫 상세 열기', href: '/coupang-detail/9025751494/01.png' },
      ],
      metrics: [
        { label: '상세', value: '14' },
        { label: '상태', value: '원본' },
      ],
    },
    {
      id: 'v1',
      label: 'V1 후보',
      status: 'candidate',
      date: '2026-06-10',
      summary: '클렌징 젤 V1 후보입니다. 대표 이미지 5장을 ChatGPT Images로 한 장씩 생성했고, 기존 상세 11은 복원했으며, 기존 3번과 4번 사이에 사람 사용감 컷을 추가했습니다. 제품정보·전성분·법정 표시 표는 가장 마지막 15번으로 유지했습니다. 쿠팡에는 아직 미반영입니다.',
      mainImages: Array.from({ length: 5 }, (_, i) => '/coupang/images/cleansing-gel/versions/v1/representative/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: [
        '/coupang/images/cleansing-gel/versions/v1/detail/01.png',
        '/coupang/images/cleansing-gel/versions/v1/detail/02.png',
        '/coupang/images/cleansing-gel/versions/v1/detail/03.png',
        '/coupang/images/cleansing-gel/versions/v1/detail/03a.png',
        ...Array.from({ length: 9 }, (_, i) => '/coupang/images/cleansing-gel/versions/v1/detail/' + String(i + 4).padStart(2, '0') + '.png'),
        '/coupang/images/cleansing-gel/versions/v1/detail/14.png',
        '/coupang/images/cleansing-gel/versions/v1/detail/13.png',
      ],
      links: [
        { label: '원본/V1 비교 페이지 열기', href: '/marketing/cleansing-gel-version-compare/' },
        { label: 'V1 첫 상세 열기', href: '/coupang/images/cleansing-gel/versions/v1/detail/01.png' },
      ],
      metrics: [
        { label: '대표', value: '5컷 GPT Images 후보' },
        { label: '상세', value: '15컷 구성 · 표 마지막' },
        { label: '상태', value: '쿠팡 미반영 후보' },
      ],
    },
  ],
  'all-in-one-lotion': [
    {
      id: 'original',
      label: '원본 등록본',
      status: 'live',
      date: '-',
      summary: '현재 쿠팡/로컬 기준 원본입니다. 대표 2장과 상세 14컷을 V1 제작의 기준점으로 둡니다.',
      mainImages: Array.from({ length: 2 }, (_, i) => '/coupang-main/all-in-one-lotion/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: Array.from({ length: 14 }, (_, i) => '/coupang-detail/9025793946/' + String(i + 1).padStart(2, '0') + '.png'),
      links: [
        { label: '원본/V1 비교 페이지 열기', href: '/marketing/all-in-one-lotion-version-compare/' },
        { label: '원본 대표 1번 열기', href: '/coupang-main/all-in-one-lotion/01.png' },
        { label: '원본 첫 상세 열기', href: '/coupang-detail/9025793946/01.png' },
      ],
      metrics: [
        { label: '대표', value: '2' },
        { label: '상세', value: '14' },
        { label: '상태', value: '원본' },
      ],
    },
    {
      id: 'v1',
      label: 'V1 후보',
      status: 'candidate',
      date: '2026-06-15',
      summary: '영거댄 올인원 로션 V1 후보입니다. 대표 01은 가상 제품 드리프트를 수정해 구글 드라이브 원본 상품 기준으로 교체했고, 하단 큰 상품명 텍스트를 제거했으며 신선제품 마크를 약간 키웠습니다. Leo 요청대로 상세 03과 04 사이에 남성 사용감 컷 03a를 추가했고, 상세 13은 미니멀 포장 중복컷을 제거하고 공식 판매처 안내 컷으로 복원해 마지막 상세 14 제품정보 표 바로 앞에 배치했습니다. 상세 14 제품정보 표는 `피부 타입 / 모든 피부 타입` 라벨과 패딩을 보정했습니다. 대표 01~06도 로컬 검수 후보로 유지합니다. 쿠팡에는 아직 미반영입니다.',
      mainImages: Array.from({ length: 6 }, (_, i) => '/coupang/images/all-in-one-lotion/versions/v1/representative/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: [
        '/coupang/images/all-in-one-lotion/versions/v1/detail/01.png',
        '/coupang/images/all-in-one-lotion/versions/v1/detail/02.png',
        '/coupang/images/all-in-one-lotion/versions/v1/detail/03.png',
        '/coupang/images/all-in-one-lotion/versions/v1/detail/03a.png',
        ...Array.from({ length: 11 }, (_, i) => '/coupang/images/all-in-one-lotion/versions/v1/detail/' + String(i + 4).padStart(2, '0') + '.png'),
      ],
      links: [
        { label: '원본/V1 비교 페이지 열기', href: '/marketing/all-in-one-lotion-version-compare/' },
        { label: 'V1 대표 1번 열기', href: '/coupang/images/all-in-one-lotion/versions/v1/representative/01.png' },
        { label: 'V1 첫 상세 열기', href: '/coupang/images/all-in-one-lotion/versions/v1/detail/01.png' },
      ],
      metrics: [
        { label: '대표', value: '6컷 생성/검수' },
        { label: '상세', value: '15컷 생성/검수' },
        { label: '특징', value: '상세 03a 남성 사용감 추가 · 상세 13 공식 판매처 복원 · 상세 14 표 보정' },
      ],
    },
  ],
  'rose-essence': [
    {
      id: 'original',
      label: '원본 등록본',
      status: 'live',
      date: '-',
      summary: '현재 쿠팡/로컬 기준 원본입니다. 대표 5장과 상세 12컷을 V1 제작의 기준점으로 둡니다.',
      mainImages: Array.from({ length: 5 }, (_, i) => '/coupang-main/rose-essence/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: Array.from({ length: 12 }, (_, i) => '/coupang-detail/9025775541/' + String(i + 1).padStart(2, '0') + '.png'),
      links: [
        { label: '원본/V1 비교 페이지 열기', href: '/marketing/rose-essence-version-compare/' },
        { label: '원본 대표 1번 열기', href: '/coupang-main/rose-essence/01.png' },
        { label: '원본 첫 상세 열기', href: '/coupang-detail/9025775541/01.png' },
      ],
      metrics: [
        { label: '대표', value: '5' },
        { label: '상세', value: '12' },
        { label: '상태', value: '원본' },
      ],
    },
    {
      id: 'v1',
      label: 'V1 후보',
      status: 'candidate',
      date: '2026-06-13',
      summary: '로즈 다마스쿠스 토닉 에센스 V1 후보입니다. 대표 01~06번을 신규 생성했습니다: 01 상품 히어로, 02 로즈워터 286,500ppm 성분 소구, 03 성인 여성 사용감, 04 워터리 제형/화장솜, 05 저자극 테스트·EWG 그린 등급·무향 신뢰, 06 제조사 직접 관리/신선 출고 안내 컷입니다. 상세 01~11을 신규 흐름으로 정리했고, 01번과 02번 사이에 성인 여성 사용감 컷 01a를 추가했습니다. 원본 06/07에 있던 피부 저자극 테스트 완료와 전성분 100% EWG 그린 등급/무향(또는 미향) 내용을 05a/05b로 보강했고, Leo 요청에 따라 화면상 현재 10번 미니멀 포장 컷 바로 위에 배치했습니다. 07번에도 손/화장솜 중심 사람 사용 컷을 포함했습니다. 09번은 원본 친환경 포장 의미를 유지하도록 재생성했고, 11번 제품 표시정보/전성분은 표 형태를 유지한 상태에서 `피부 타입 / 모든 피부 타입` 라벨로 정렬했습니다. 쿠팡에는 아직 미반영입니다.',
      mainImages: Array.from({ length: 6 }, (_, i) => '/coupang/images/rose-essence/versions/v1/representative/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: [
        '/coupang/images/rose-essence/versions/v1/detail/01.png',
        '/coupang/images/rose-essence/versions/v1/detail/01a.png',
        ...Array.from({ length: 7 }, (_, i) => '/coupang/images/rose-essence/versions/v1/detail/' + String(i + 2).padStart(2, '0') + '.png'),
        '/coupang/images/rose-essence/versions/v1/detail/05a.png',
        '/coupang/images/rose-essence/versions/v1/detail/05b.png',
        '/coupang/images/rose-essence/versions/v1/detail/09.png',
        '/coupang/images/rose-essence/versions/v1/detail/10.png',
        '/coupang/images/rose-essence/versions/v1/detail/11.png',
      ],
      links: [
        { label: '원본/V1 비교 페이지 열기', href: '/marketing/rose-essence-version-compare/' },
        { label: 'V1 대표 1번 열기', href: '/coupang/images/rose-essence/versions/v1/representative/01.png' },
        { label: 'V1 첫 상세 열기', href: '/coupang/images/rose-essence/versions/v1/detail/01.png' },
      ],
      metrics: [
        { label: '대표', value: '6컷 생성/검수' },
        { label: '상세', value: '14컷 생성/검수' },
        { label: '특징', value: '05a·05b는 화면상 10번 위 배치' },
      ],
    },
  ],
  'whitening-cream': [
    {
      id: 'original',
      label: '원본',
      status: 'live',
      date: '-',
      summary: '현재 쿠팡/로컬에 적용된 원본입니다. 대표 5장과 상세 14컷을 기준점으로 둡니다.',
      mainImages: Array.from({ length: 5 }, (_, i) => '/coupang-main/whitening-cream/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: Array.from({ length: 14 }, (_, i) => '/coupang-detail/9264527939/' + String(i + 1).padStart(2, '0') + '.png'),
      links: [
        { label: '원본 첫 상세 열기', href: '/coupang-detail/9264527939/01.png' },
        { label: '원본 대표 1번 열기', href: '/coupang-main/whitening-cream/01.png' },
      ],
      metrics: [
        { label: '대표', value: '5' },
        { label: '상세', value: '14' },
        { label: '상태', value: '원본' },
      ],
    },
    {
      id: 'v1',
      label: 'V1 후보',
      status: 'candidate',
      date: '2026-06-07',
      summary: '화이트닝 톤 케어 크림 V1 후보입니다. 대표 01~05번 신규 컷과 상세 14컷으로 정리했습니다. 기존 V1 상세 13/14는 제외하고, 공식 판매처 컷 뒤 마지막에 원본 상세 13번 성분/표 이미지를 배치했습니다.',
      mainImages: Array.from({ length: 5 }, (_, i) => '/coupang/images/whitening-cream/versions/v1/representative/' + String(i + 1).padStart(2, '0') + '.png'),
      detailImages: [
        ...Array.from({ length: 12 }, (_, i) => '/coupang/images/whitening-cream/versions/v1/detail/' + String(i + 1).padStart(2, '0') + '.png'),
        '/coupang/images/whitening-cream/versions/v1/detail/15.png',
        '/coupang/images/whitening-cream/versions/v1/detail/16-original-ingredient-table.png',
      ],
      links: [
        { label: 'V1 대표 1번 열기', href: '/coupang/images/whitening-cream/versions/v1/representative/01.png' },
        { label: 'V1 첫 상세 열기', href: '/coupang/images/whitening-cream/versions/v1/detail/01.png' },
        { label: '원본 대표 1번 열기', href: '/coupang-main/whitening-cream/01.png' },
      ],
      metrics: [
        { label: '대표', value: '5 신규' },
        { label: '상세', value: '14' },
        { label: '교체', value: '상세 13/14 제외 + 원본 성분표 마지막' },
      ],
    },
  ],
};

export function getVersions(slug: string, productId: string): ProductVersion[] {
  const custom = productVersions[slug];
  if (custom) return custom;
  // Default: main images from /coupang-main/, detail from /coupang-detail/
  // Probe actual files. Some folders contain mixed png/jpg exports or duplicate
  // numeric cuts (for example 02.png and 02.jpg). Do not infer `01..N.png`
  // from a raw file count; that creates broken 404 image URLs.
  const mainDir = path.join(process.cwd(), 'public', 'coupang-main', slug);
  const detailDir = path.join(process.cwd(), 'public', 'coupang-detail', productId);

  const listImageUrls = (dir: string, publicBase: string) => {
    try {
      const byNumber = new Map<number, string>();
      const priority: Record<string, number> = { png: 4, webp: 3, jpg: 2, jpeg: 1 };
      fs.readdirSync(dir).forEach((file) => {
        const match = file.match(/^(\d+)\.(png|jpg|jpeg|webp)$/i);
        if (!match) return;
        const index = Number(match[1]);
        const current = byNumber.get(index);
        const ext = match[2].toLowerCase();
        const currentExt = current?.split('.').pop()?.toLowerCase() ?? '';
        if (!current || (priority[ext] ?? 0) > (priority[currentExt] ?? 0)) {
          byNumber.set(index, file);
        }
      });
      return [...byNumber.entries()]
        .sort(([a], [b]) => a - b)
        .map(([, file]) => publicBase + '/' + file);
    } catch {
      return [];
    }
  };

  const mainImages = listImageUrls(mainDir, '/coupang-main/' + slug);
  const detailImages = listImageUrls(detailDir, '/coupang-detail/' + productId);

  return [{
    id: 'live',
    label: '현재 적용',
    status: 'live',
    date: '-',
    summary: '현재 쿠팡에 적용된 메인 + 상세 이미지',
    mainImages,
    detailImages,
  }];
}

export const statusLabel: Record<string, string> = {
  live: '적용 중',
  candidate: '후보',
  review: '검토',
  draft: '초안',
  archive: '보관',
};

export const copyGuardrails = [
  '미백, 주름개선 표현은 고시된 기능성 상품에만 사용',
  '블랙헤드 제거 단정 대신 블랙헤드가 신경 쓰이는 부위의 세정 관리로 표현',
  'PDRN, 발효, 글루타티온은 원료 컨셉으로 설명하고 개선 효과 단정 금지',
  '립밤은 비즈왁스 포함 제품이라 비건 표현 사용 금지',
];

export const formatWon = (value: number) => Number(value).toLocaleString('ko-KR') + '원';
