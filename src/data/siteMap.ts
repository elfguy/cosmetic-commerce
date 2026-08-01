// 전체 페이지를 섹션별로 묶는 단일 소스.
// 허브(index)와 공유 네비게이션이 모두 이 파일을 참조한다.

export type SiteLink = {
  href: string;
  title: string;
  desc: string;
  /** 우측 상단 태그(상태/유형) */
  tag?: string;
  /** 카드 커버 그라데이션 (이미지가 없을 때) */
  cover?: string;
  /** 실제 썸네일 경로 (있을 때만) */
  thumb?: string;
  /** 새 탭 여부 */
  external?: boolean;
};

export type SiteSection = {
  id: string;
  label: string;
  eyebrow: string;
  desc: string;
  links: SiteLink[];
};

/** 상단 공유 네비게이션에 항상 노출되는 핵심 메뉴 */
export const primaryNav: { href: string; label: string }[] = [
  { href: '/', label: '홈' },
  { href: '/products/', label: '상품상세' },
  { href: '/competitor-comparison/', label: '경쟁상품' },
  { href: '/sales-analysis/', label: '매출분석' },
  { href: '/global-sales/', label: '해외판매' },
  { href: '/workspaces/', label: '작업실' },
  { href: '/drive-originals/', label: '원본이미지' },
];

export const siteSections: SiteSection[] = [
  {
    id: 'ops',
    label: '운영 도구',
    eyebrow: 'Operations',
    desc: '판매 중인 상품을 기준으로 상세·경쟁·표현 리스크를 관리하는 핵심 화면입니다.',
    links: [
      {
        href: '/products/',
        title: '상품상세 보드',
        desc: '상품별 가격·리뷰·상세 상태·표현 리스크·다음 작업을 우선순위로 정리.',
        tag: '핵심',
        cover: 'linear-gradient(135deg, #1f2a24, #38493f)',
      },
      {
        href: '/competitor-comparison/',
        title: '경쟁상품 분석',
        desc: '카테고리별 경쟁군, 리뷰 격차, 월 구매 신호, 대응 메시지.',
        tag: '핵심',
        cover: 'linear-gradient(135deg, #8c4830, #b5654a)',
      },
      {
        href: '/sales-analysis/',
        title: '쿠팡 매출·이미지 효과 분석',
        desc: '상품별 1개월 매출과 상세 이미지 개선 전후 판매량을 누적 추적.',
        tag: '매출',
        cover: 'linear-gradient(135deg, #1f2a24, #b5654a)',
      },
      {
        href: '/marketing/coupang-business-insight/',
        title: '비즈니스 인사이트 운영 전략',
        desc: 'Wing 판매·유입·카테고리 분석 기능과 상품별 매출 성장 액션, 무료체험 실행 일정.',
        tag: '마케팅',
        cover: 'linear-gradient(135deg, #8c4830, #1f2a24)',
      },
      {
        href: '/marketing/aqua-lotion-video-studio/',
        title: '아쿠아 로션 영상 스튜디오',
        desc: '광고 모델, 영상 버전, GPT 콘티 스케치와 제작 게이트를 누적 관리.',
        tag: '영상',
        thumb: '/marketing/aqua-lotion-video-studio/models/d-han-chaewon-full.webp',
        cover: 'linear-gradient(135deg, #173c3d, #bfe8e9)',
      },
      {
        href: '/workspaces/',
        title: '상세 버전 랩',
        desc: '제품별 현재 적용 상세, 후보 버전, 최종 업로드 자료를 한 흐름에서 비교.',
        tag: '핵심',
        cover: 'linear-gradient(135deg, #2b3b32, #6f7d63)',
      },
      {
        href: '/drive-originals/',
        title: '구글 드라이브 원본 이미지',
        desc: '드라이브에서 내려받은 상품별 원본 이미지를 확인하고 GPT 웹 제공용으로 다운로드.',
        tag: '원본',
        cover: 'linear-gradient(135deg, #264f55, #86bec0)',
      },
      {
        href: '/product-comparison/',
        title: '상품 데이터·표현 검수표',
        desc: '가격·채널·기능성·표현 리스크를 한 표에서 점검.',
        cover: 'linear-gradient(135deg, #3a3a33, #6c6a60)',
      },
      {
        href: '/coupang-mock/',
        title: '쿠팡 원본 상세 검토실',
        desc: '쿠팡에 등록된 원본 상세 흐름을 보고 개선 작업으로 연결.',
        cover: 'linear-gradient(135deg, #6f2e2e, #b46a55)',
      },
    ],
  },
  {
    id: 'global',
    label: '해외판매',
    eyebrow: 'Global sales',
    desc: 'Amazon US를 시작점으로 K-Beauty 해외판매 시장조사, 준비 체크리스트, 120일 실행 타임라인을 관리합니다.',
    links: [
      {
        href: '/global-sales/',
        title: '해외판매 전략 보드',
        desc: '아마존 분석, 에이전트 활용 조사법, 후보 SKU, 규정·물류·광고 타임라인.',
        tag: '신규',
        cover: 'linear-gradient(135deg, #1f2a24, #8c4830)',
      },
    ],
  },
  {
    id: 'detail',
    label: '상세·이미지 작업',
    eyebrow: 'Detail & assets',
    desc: '상품 상세페이지와 대표/상세 이미지의 버전을 제작·비교하는 작업 공간입니다.',
    links: [
      {
        href: '/marketing/aqua-lotion-detail-images/',
        title: '아쿠아 로션 상세 이미지',
        desc: '수분 루틴 세트용 대표/상세 이미지 버전 후보 관리.',
        tag: '진행',
        cover: 'linear-gradient(135deg, #2f5d6b, #7fb2c0)',
      },
      {
        href: '/marketing/aqua-lotion-version-compare/',
        title: '아쿠아 로션 버전 비교',
        desc: '원본 / V1 / V2 대표·상세 이미지를 한 화면에서 비교.',
        cover: 'linear-gradient(135deg, #2f4f5d, #5d8aa0)',
      },
      {
        href: '/marketing/hyaluronic-toner-version-compare/',
        title: '히알루론산 토너 버전 비교',
        desc: '원본 등록본 / V1 대표·상세 이미지를 비교.',
        tag: '신규',
        cover: 'linear-gradient(135deg, #2f5d57, #8bc7be)',
      },
      {
        href: '/toner-detail-renewal/',
        title: '히알루론산 토너 상세 리뉴얼',
        desc: '신선 출고·자연유래 보습 메시지 기반 대표/상세 시안.',
        tag: '시안',
        cover: 'linear-gradient(135deg, #4a6b54, #93b08c)',
      },
    ],
  },
  {
    id: 'shop',
    label: '쇼핑몰 컨셉 시안',
    eyebrow: 'Storefront concepts',
    desc: '자사몰 방향을 검토하기 위한 4가지 컨셉 목업입니다. 톤과 정보 구성을 비교하세요.',
    links: [
      {
        href: '/shop-concept/',
        title: '내추럴 프리미엄',
        desc: '천연 소재 기반 신선한 스킨케어 브랜드 컨셉.',
        tag: '목업',
        cover: 'linear-gradient(135deg, #3c4a34, #7b8b6f)',
      },
      {
        href: '/shop-clinical/',
        title: 'Fresh Ingredient Chain',
        desc: '원료 수확 → 제조 → 배송 신선 유통 과정 강조.',
        tag: '목업',
        cover: 'linear-gradient(135deg, #234b46, #5d9b91)',
      },
      {
        href: '/shop-editorial/',
        title: '자연 라이프스타일',
        desc: '따뜻하고 감성적인 자연주의 라이프스타일.',
        tag: '목업',
        cover: 'linear-gradient(135deg, #8c5a3a, #d2a273)',
      },
      {
        href: '/shop-luxury/',
        title: '미니멀 클린 뷰티',
        desc: '깨끗하고 세련된 클린 뷰티 미니멀 스타일.',
        tag: '목업',
        cover: 'linear-gradient(135deg, #2b2b2b, #6f6f6f)',
      },
    ],
  },
];

/** 모든 링크를 평면 배열로 (검색/검증용) */
export const allLinks: SiteLink[] = siteSections.flatMap((s) => s.links);
