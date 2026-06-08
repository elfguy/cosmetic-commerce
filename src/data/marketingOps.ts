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
    detailStatus: '현재 상세를 유화 장면 중심으로 보강 필요',
    assetStatus: '현재 적용 상세 확인',
    claimRisk: 'high',
    nextAction: '블랙헤드 제거 단정 없이 세정 관리 메시지로 상세 첫 3컷 설계',
  },
  {
    slug: 'cleansing-gel',
    priority: 'support',
    campaignRole: '약산성 2차 세안 보조 상품',
    detailStatus: '현재 상세에 클렌징 듀오 구성 필요',
    assetStatus: '현재 적용 상세 확인',
    claimRisk: 'medium',
    nextAction: '클렌징 오일과 듀오 루틴으로 묶는 비교 섹션 만들기',
  },
  {
    slug: 'whitening-cream',
    priority: 'focus',
    campaignRole: '기능성 전환 상품',
    detailStatus: '현재 상세의 기능성 근거 재배치 필요',
    assetStatus: '현재 적용 상세 확인',
    claimRisk: 'high',
    nextAction: '미백 기능성 고시와 나이아신아마이드 근거를 CTA 근처로 이동',
  },
  {
    slug: 'all-in-one-lotion',
    priority: 'support',
    campaignRole: '남성 간편 루틴 확장',
    detailStatus: '현재 상세와 네이버 노출 확인 필요',
    assetStatus: '현재 적용 상세 확인',
    claimRisk: 'high',
    nextAction: '면도 후 올인원, 미백/주름개선 기능성 표현 범위 정리',
  },
  {
    slug: 'rose-essence',
    priority: 'support',
    campaignRole: '향/감성 보조 상품',
    detailStatus: '현재 스토리형 상세 유지',
    assetStatus: '현재 적용 상세 확인',
    claimRisk: 'medium',
    nextAction: '장미수 원료 컨셉을 효능 단정 없이 라이프스타일 소재로 정리',
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
      summary: '쿠팡 반영용 V1 정리본입니다. 대표 6장과 상세 13컷을 사이트 현재 적용 버전으로 사용합니다.',
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
