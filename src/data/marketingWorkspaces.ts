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
    nextAction: '웹 GPT Images로 생성한 V4 상세 10장 후보를 검수하고 쿠팡 업로드용으로 최종 선별',
    versions: [
      {
        id: 'v4',
        label: 'V4',
        status: 'candidate',
        date: '2026-06-01',
        summary: 'ChatGPT 웹/GPT Images로 생성 후 다운로드한 V4 상세 10장 후보입니다. 대표 이미지는 기존 V2 유지본을 사용합니다.',
        preview: '/coupang/images/aqua-lotion/versions/v4-gpt-web/v4-gpt-web-contact-sheet.png',
        primaryUrl: '/marketing/aqua-lotion-version-compare/',
        links: [
          { label: 'V4 보기', href: '/marketing/aqua-lotion-version-compare/', kind: 'page' },
          { label: 'V4 컨택시트', href: '/coupang/images/aqua-lotion/versions/v4-gpt-web/v4-gpt-web-contact-sheet.png', kind: 'image' },
          { label: '상세 01', href: '/coupang/images/aqua-lotion/versions/v4-gpt-web/detail/01.png', kind: 'image' },
          { label: '상세 10', href: '/coupang/images/aqua-lotion/versions/v4-gpt-web/detail/10.png', kind: 'image' },
        ],
        metrics: [
          { label: '대표', value: '6' },
          { label: '상세', value: '10' },
          { label: '생성', value: 'ChatGPT Web' },
        ],
      },
    ],
  },
];

export const activeMarketingWorkspaces = marketingWorkspaces.filter((workspace) => workspace.status === 'active');
