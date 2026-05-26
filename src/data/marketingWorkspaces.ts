export type AssetVersion = {
  id: string;
  label: string;
  status: 'draft' | 'review' | 'candidate' | 'archive';
  date: string;
  summary: string;
  preview: string;
  primaryUrl: string;
  links: Array<{
    label: string;
    href: string;
    kind: 'page' | 'image' | 'source';
  }>;
  metrics: Array<{
    label: string;
    value: string;
  }>;
};

export type MarketingWorkspace = {
  slug: string;
  title: string;
  productName: string;
  category: string;
  status: 'active' | 'planned' | 'archive';
  objective: string;
  pageUrl: string;
  thumbnail: string;
  nextAction: string;
  versions: AssetVersion[];
};

export const marketingWorkspaces: MarketingWorkspace[] = [
  {
    slug: 'aqua-lotion',
    title: '아쿠아 로션 상세 이미지 개선',
    productName: '유어스킨플러스 히알루론산 아쿠아 로션',
    category: '수분 루틴 / 상세 이미지',
    status: 'active',
    objective: '300ml 대용량 로션을 수분 루틴 세트의 보조 전환 상품으로 만들기 위해 대표 이미지와 상세 이미지 흐름을 비교합니다.',
    pageUrl: '/marketing/aqua-lotion-detail-images/',
    thumbnail: '/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png',
    nextAction: 'V8 Fresh Set을 대표 후보로 두고 V7 광고형 컷과 첫 화면 설득력을 비교',
    versions: [
      {
        id: 'original-v1-v2-compare',
        label: 'Original / V1 / V2 Compare',
        status: 'candidate',
        date: '2026-05-26',
        summary: '기존 원본, V1, 현재 활성 V2의 대표 이미지와 상세 이미지 흐름을 한 화면에서 비교하는 기준 페이지입니다.',
        preview: '/coupang/images/aqua-lotion/versions/v2/representative/01.png',
        primaryUrl: '/marketing/aqua-lotion-version-compare/',
        links: [
          { label: '비교 페이지', href: '/marketing/aqua-lotion-version-compare/', kind: 'page' },
          { label: 'V2 대표 1번', href: '/coupang/images/aqua-lotion/versions/v2/representative/01.png', kind: 'image' },
          { label: '원본 상세 1번', href: '/coupang/images/aqua-lotion/versions/original/detail/01.png', kind: 'image' },
        ],
        metrics: [
          { label: '버전', value: '3' },
          { label: '대표', value: '17' },
          { label: '상세', value: '34' },
        ],
      },
      {
        id: 'v8-fresh-set',
        label: 'V8 Fresh Set',
        status: 'candidate',
        date: '2026-05-25',
        summary: '대표 이미지 후보, 제조 신선도, 히알루론산 보습 컨셉, 데일리 사용 루틴, 표현 검수까지 5장으로 압축한 최신 후보입니다.',
        preview: '/coupang/images/aqua-lotion/renewal-2026-05-25-v8-fresh-set/preview/v8-fresh-contact-sheet.jpg',
        primaryUrl: '/coupang/images/aqua-lotion/renewal-2026-05-25-v8-fresh-set/preview/v8-fresh-contact-sheet.jpg',
        links: [
          { label: '대표 후보', href: '/coupang/images/aqua-lotion/renewal-2026-05-25-v8-fresh-set/cuts/01-main-fresh-hero.jpg', kind: 'image' },
          { label: '제조 신선도', href: '/coupang/images/aqua-lotion/renewal-2026-05-25-v8-fresh-set/cuts/02-fresh-manufacture-proof.jpg', kind: 'image' },
          { label: '컨택시트', href: '/coupang/images/aqua-lotion/renewal-2026-05-25-v8-fresh-set/preview/v8-fresh-contact-sheet.jpg', kind: 'image' },
        ],
        metrics: [
          { label: '컷 수', value: '5' },
          { label: '형식', value: '780x1360' },
          { label: '용도', value: '최신 후보' },
        ],
      },
      {
        id: 'v7-ad',
        label: 'V7 Ad Direction',
        status: 'review',
        date: '2026-05-25',
        summary: '광고 컷처럼 보이도록 제품, 사용 장면, 물방울 질감을 크게 쓰고 텍스트 박스 비중을 줄인 15장 버전입니다.',
        preview: '/coupang/images/aqua-lotion/renewal-2026-05-25-v7/preview/v7-contact-sheet.jpg',
        primaryUrl: '/coupang/images/aqua-lotion/renewal-2026-05-25-v7/view-all.html',
        links: [
          { label: '전체 보기', href: '/coupang/images/aqua-lotion/renewal-2026-05-25-v7/view-all.html', kind: 'page' },
          { label: '풀스택', href: '/coupang/images/aqua-lotion/renewal-2026-05-25-v7/detail-v7-full-stack.jpg', kind: 'image' },
          { label: '컨택시트', href: '/coupang/images/aqua-lotion/renewal-2026-05-25-v7/preview/v7-contact-sheet.jpg', kind: 'image' },
        ],
        metrics: [
          { label: '컷 수', value: '15' },
          { label: '번들', value: '5' },
          { label: '용도', value: '광고형' },
        ],
      },
      {
        id: 'v6-detail',
        label: 'V6 Detail Stack',
        status: 'archive',
        date: '2026-05-25',
        summary: '후킹, 추천 대상, 8가지 근거, 성분 근거, 제조 신뢰, 고시정보까지 전통적인 상세페이지 흐름을 갖춘 긴 버전입니다.',
        preview: '/coupang/images/aqua-lotion/renewal-2026-05-25-v6/preview/v6-contact-sheet.jpg',
        primaryUrl: '/coupang/images/aqua-lotion/renewal-2026-05-25-v6/view-all.html',
        links: [
          { label: '전체 보기', href: '/coupang/images/aqua-lotion/renewal-2026-05-25-v6/view-all.html', kind: 'page' },
          { label: '풀스택', href: '/coupang/images/aqua-lotion/renewal-2026-05-25-v6/detail-v6-full-stack.jpg', kind: 'image' },
          { label: '컨택시트', href: '/coupang/images/aqua-lotion/renewal-2026-05-25-v6/preview/v6-contact-sheet.jpg', kind: 'image' },
        ],
        metrics: [
          { label: '컷 수', value: '15' },
          { label: '번들', value: '5' },
          { label: '용도', value: '상세형' },
        ],
      },
      {
        id: 'v5-slices',
        label: 'V5 Long Detail',
        status: 'archive',
        date: '2026-05-24',
        summary: '초기 롱폼 상세 이미지와 1360px 슬라이스, 미리보기 상/중/하단 컷을 보관한 버전입니다.',
        preview: '/coupang/images/aqua-lotion/renewal-2026-05-24-v5/preview-top.png',
        primaryUrl: '/coupang/images/aqua-lotion/renewal-2026-05-24-v5/05-aqua-lotion-full-detail-v5.png',
        links: [
          { label: '전체 이미지', href: '/coupang/images/aqua-lotion/renewal-2026-05-24-v5/05-aqua-lotion-full-detail-v5.png', kind: 'image' },
          { label: '상단 미리보기', href: '/coupang/images/aqua-lotion/renewal-2026-05-24-v5/preview-top.png', kind: 'image' },
          { label: '슬라이스 01', href: '/coupang/images/aqua-lotion/renewal-2026-05-24-v5/slices-1360/v5-1360-01.png', kind: 'image' },
        ],
        metrics: [
          { label: '슬라이스', value: '14' },
          { label: '형식', value: '롱폼' },
          { label: '용도', value: '초안' },
        ],
      },
      {
        id: 'v1-original',
        label: 'V1 First Draft',
        status: 'archive',
        date: '2026-05-24',
        summary: '아쿠아로션 상세 개선의 첫 번째 디자인 방향입니다. 현재 후보와 비교하기 위한 기준 버전으로 보관합니다.',
        preview: '/coupang/images/aqua-lotion/renewal-2026-05-24-v1/preview-top.png',
        primaryUrl: '/coupang/images/aqua-lotion/renewal-2026-05-24-v1/01-aqua-lotion-full-detail-v1.png',
        links: [
          { label: '전체 이미지', href: '/coupang/images/aqua-lotion/renewal-2026-05-24-v1/01-aqua-lotion-full-detail-v1.png', kind: 'image' },
          { label: '상단 미리보기', href: '/coupang/images/aqua-lotion/renewal-2026-05-24-v1/preview-top.png', kind: 'image' },
          { label: '중단 미리보기', href: '/coupang/images/aqua-lotion/renewal-2026-05-24-v1/preview-middle.png', kind: 'image' },
        ],
        metrics: [
          { label: '형식', value: '롱폼' },
          { label: '상태', value: '초안' },
          { label: '용도', value: '비교' },
        ],
      },
    ],
  },
];

export const activeMarketingWorkspaces = marketingWorkspaces.filter((workspace) => workspace.status === 'active');
