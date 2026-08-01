export type ModelStatus = 'active' | 'archived' | 'selected';

export type CampaignModel = {
  id: string;
  code: string;
  name: string;
  role: string;
  status: ModelStatus;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyType: string;
  job: string;
  personality: string;
  voice: string;
  hook: string;
  styling: string;
  strengths: string[];
  risks: string[];
  image: string;
};

export type StoryboardShot = {
  id: string;
  time: string;
  phase: string;
  visual: string;
  dialogue: string;
  subtitle: string;
  method: string;
  qa: string;
};

export type CampaignVideo = {
  id: string;
  sequence: number;
  title: string;
  subtitle: string;
  status: 'concept' | 'casting' | 'producing' | 'review' | 'approved' | 'published' | 'archived';
  duration: string;
  ratio: string;
  objective: string;
  modelId?: string;
  modelLabel: string;
  product: string;
  hook: string;
  keyMessage: string;
  cta: string;
  poster: string;
  videoSrc?: string;
  masterSrc?: string;
  createdAt: string;
  updatedAt: string;
  storyboard: StoryboardShot[];
};

export const campaignModels: CampaignModel[] = [
  {
    id: 'A-YOON-SEOJIN', code: 'A', name: '윤서진', role: '현실적인 직장인 후기형', status: 'active',
    age: 31, heightCm: 165, weightKg: 52, bodyType: '자연스러운 평균-슬림 체형',
    job: '생활용품 브랜드 콘텐츠 운영 실무자', personality: '차분하고 솔직하며 결론을 짧게 전달',
    voice: '짧고 담백한 존댓말', hook: '토너만으론 아쉽고 크림은 무거울 때 있잖아요.',
    styling: '파우더블루 라운드 니트 · 오트밀 커브드 팬츠 · 초콜릿 메리제인',
    strengths: ['25~34세 직장인 전환', '광고 티가 적은 현실감', '담백한 비교 설명'],
    risks: ['표정이 정적이면 초반 주목도가 약해질 수 있음', '조명에 따라 실제 나이보다 성숙해 보일 수 있음'],
    image: '/marketing/aqua-lotion-video-studio/models/a-yoon-seojin-full.webp',
  },
  {
    id: 'C-KIM-HARIN', code: 'C', name: '김하린', role: '캐주얼한 액티브 사용자형', status: 'active',
    age: 27, heightCm: 168, weightKg: 54, bodyType: '현실적인 슬림 애슬레틱 체형',
    job: '모바일 서비스 UX 디자이너', personality: '복잡한 루틴을 싫어하고 결론부터 말함',
    voice: '반박자 빠른 자연스러운 해요체', hook: '복잡하게 여러 개 바르기 싫은 날 있죠?',
    styling: '버터옐로 컴팩트 티 · 라이트 중청 커브드 데님 · 크림실버 스니커즈',
    strengths: ['20대 후반 릴스 적합', '빠른 훅과 생활 루틴', '자연 게시물 같은 캐주얼함'],
    risks: ['피부 보정이 강하면 인플루언서 광고처럼 보임', '대사가 빠르면 AI 립싱크 오류가 커질 수 있음'],
    image: '/marketing/aqua-lotion-video-studio/models/c-kim-harin-full.webp',
  },
  {
    id: 'D-HAN-CHAEWON', code: 'D', name: '한채원', role: '프리미엄 배우 비주얼형', status: 'active',
    age: 29, heightCm: 170, weightKg: 51, bodyType: '자연스럽게 길고 슬림한 체형',
    job: '독립영화·라이프스타일 콘텐츠를 병행하는 가상 배우', personality: '세련되고 자신감 있지만 거리감이 없음',
    voice: '차분하고 선명한 개인 기준형 존댓말', hook: '아침에는 제형이 잘 맞는 한 단계가 중요하더라고요.',
    styling: '미스트블루 드레이프 블라우스 · 웜아이보리 플루이드 팬츠 · 버건디 플랫',
    strengths: ['브랜드 첫인상과 주목도', '프리미엄 비주얼', '제품을 고급스럽게 보이게 함'],
    risks: ['연출이 정돈되면 전형적인 화장품 CF가 될 수 있음', '실제 욕실·휴대전화 조명으로 자연스럽게 낮춰야 함'],
    image: '/marketing/aqua-lotion-video-studio/models/d-han-chaewon-full.webp',
  },
];

export const archivedModels: CampaignModel[] = [
  {
    id: 'B-PARK-JIHYUN', code: 'B', name: '박지현', role: '실용적인 단발 리뷰어형', status: 'archived',
    age: 35, heightCm: 161, weightKg: 55, bodyType: '건강한 평균 체형',
    job: '중소기업 총무·구매 담당자', personality: '생활력이 있고 직접 써보고 판단',
    voice: '경험 중심의 담백한 해요체', hook: '매일 쓰는 건 결국 펌프가 편하더라고요.',
    styling: '그레이 스웨트셔츠 · 블랙 팬츠', strengths: ['생활 신뢰감'],
    risks: ['사용자 의상·캐스팅 검토에서 탈락'],
    image: '/marketing/aqua-lotion-video-studio/models/b-park-jihyun-archived.webp',
  },
];

export const campaignVideos: CampaignVideo[] = [
  {
    id: 'AQUA-UGC-001', sequence: 1, title: '가볍게 한 번 더', subtitle: '토너와 크림 사이, 실제 루틴에서 찾은 한 단계',
    status: 'casting', duration: '15초', ratio: '9:16 · 720×1280', objective: '아쿠아 로션의 사용 상황을 첫 3초 안에 이해시키고 제품 정보 확인으로 연결',
    modelLabel: 'A · C · D 중 선정 대기', product: '유어스킨플러스 히알루론산 아쿠아 로션 300ml',
    hook: '토너만으론 아쉽고, 크림은 무거울 때 있잖아요.', keyMessage: '가볍게 한 번 더', cta: '제품 정보 확인',
    poster: '/marketing/aqua-lotion-video-studio/storyboards/01-hook-problem.webp',
    createdAt: '2026-08-01', updatedAt: '2026-08-01',
    storyboard: [
      { id: 'S01', time: '0.0–1.8초', phase: 'HOOK', visual: '선택 모델의 휴대전화 셀피. 문장 중간에서 바로 시작하고 얼굴을 화면 중앙에 고정하지 않는다.', dialogue: '토너만으론 좀 아쉽고…', subtitle: '토너만으론 아쉽고', method: 'Higgsfield Selfie · 동일 Soul ID', qa: '첫 프레임 얼굴 동일성, 과한 피부 보정 금지' },
      { id: 'S02', time: '1.8–3.2초', phase: 'PROBLEM', visual: '실제 제품 PNG를 짧게 펀치인. 펌프와 300ml 전체 비율을 확인할 수 있게 한다.', dialogue: '크림은 또 무거울 때 있잖아요.', subtitle: '크림은 또 무거울 때', method: '실제 제품 원본 · 로컬 모션', qa: '라벨·펌프·용기 비율 변형 금지' },
      { id: 'S03', time: '3.2–5.7초', phase: 'BRIDGE', visual: '같은 모델이 욕실에서 카메라를 보며 작게 고개를 끄덕이고 자기 루틴을 이어 말한다.', dialogue: '저는 이럴 때…', subtitle: '', method: 'Higgsfield Handheld', qa: '헤어·의상·욕실 색온도 고정' },
      { id: 'S04', time: '5.7–8.5초', phase: 'SOLUTION', visual: '욕실 카운터에 제품이 놓인 키프레임. 모델은 손으로 들지 않고 제품 방향만 가리킨다.', dialogue: '아쿠아 로션을 한 번 더 발라요.', subtitle: '가볍게 한 번 더', method: 'Product Placement · 키프레임 선검수', qa: '제품 개수 1개, 손가락과 라벨 겹침 금지' },
      { id: 'S05', time: '8.5–10.8초', phase: 'PROOF', visual: '실제 제품 펌프와 라벨 근접 컷. 생성형 펌핑 동작 대신 정확한 원본을 사용한다.', dialogue: '', subtitle: '300ml 펌프형', method: '실제 제품 원본 · 효과음', qa: '가짜 제형·가짜 펌프 작동 금지' },
      { id: 'S06', time: '10.8–13.2초', phase: 'PERSONAL', visual: '모델이 한쪽 볼을 가볍게 감싸고 과장 없는 표정으로 개인 결론을 말한다.', dialogue: '복잡한 루틴보다 이 정도가 딱 좋더라고요.', subtitle: '루틴은 단순하게', method: 'Higgsfield · 손 접촉 프레임 QA', qa: '손가락·치아·입 모양 프레임별 검수' },
      { id: 'S07', time: '13.2–15.0초', phase: 'CTA', visual: '제품을 세면대에 내려놓는 움직임 위에 CTA를 합성한다. 정적 엔드카드는 사용하지 않는다.', dialogue: '궁금하면 제품 정보 확인해보세요.', subtitle: '유어스킨플러스 아쿠아 로션 · 제품 정보 확인', method: '실제 제품 원본 · 후반 자막', qa: 'CTA 안전 영역, 생성 한글 사용 금지' },
    ],
  },
];

export const productionGates = [
  ['01', '캐스팅 승인', 'A·C·D 중 한 명을 선택하고 의상·헤어를 고정'],
  ['02', 'Soul ID 세트', '정면·3/4·프로필·반신·전신 20장 이상 검수'],
  ['03', '제품 키프레임', '라벨·펌프·병 비율이 맞는 정지 컷 3장 승인'],
  ['04', '8초 테스트', '한국어 립싱크·얼굴·손·제품 접촉을 확인'],
  ['05', '15초 마스터', '승인된 컷만 조합해 첫 광고 완성'],
  ['06', '파생 소재', '30초 확장·8초 훅·다른 첫 문장 제작'],
] as const;
