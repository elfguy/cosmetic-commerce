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
  narration: string;
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
  narrationScript: string;
  voiceDirection: string;
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
    id: 'AQUA-UGC-001', sequence: 1, title: '가볍게 한 번 더', subtitle: '모델은 말하지 않고, 나레이션이 이끄는 30초 생활 루틴',
    status: 'casting', duration: '30초', ratio: '9:16 · 720×1280', objective: '말하는 모델 대신 조용한 생활 행동과 실제 제품 증거를 연결하고, 나레이션으로 사용 상황과 제품 정보를 전달',
    modelLabel: 'A · C · D 중 선정 대기', product: '유어스킨플러스 히알루론산 아쿠아 로션 300ml',
    hook: '토너만으로는 왠지 아쉽고, 크림은 조금 무겁게 느껴지는 날.', keyMessage: '가볍게 한 번 더', cta: '제품 정보 확인',
    narrationScript: '토너만으로는 왠지 아쉽고, 크림은 조금 무겁게 느껴지는 날. 그 사이엔 복잡한 단계보다, 가볍게 더하는 수분 로션 한 단계. 유어스킨플러스 히알루론산 아쿠아 로션. 8종 히알루론산을 담고, 무향 설계에 300밀리리터 펌프형으로 아침에도 저녁에도 간편하게. 토너 다음, 크림 전. 오늘의 루틴에 가볍게 한 번 더.',
    voiceDirection: '실제 한국인 여성 나레이터 · 20대 후반~30대 초반 · 명료한 중속 · 담백한 정보 전달 · 느린 소프트톤과 AI 성우 억양 금지',
    poster: '/marketing/aqua-lotion-video-studio/storyboards-30s/01-problem-silent.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/videos/aqua-ugc-001-narration-animatic-v2.mp4',
    createdAt: '2026-08-01', updatedAt: '2026-08-01',
    storyboard: [
      { id: 'S01', time: '0–3초', phase: 'HOOK', visual: '선택 모델이 토너 사용 직후 거울로 피부를 살피며 한쪽 볼에 손을 댄다. 카메라를 보거나 말하지 않는다.', narration: '토너만으로는 왠지 아쉽고,', subtitle: '토너만으로는 왠지 아쉽고', method: 'Higgsfield 무언 연기 · 동일 Soul ID', qa: '입술을 닫고 자연스럽게 호흡, 립싱크 동작 금지' },
      { id: 'S02', time: '3–6초', phase: 'PROBLEM', visual: '토너병과 크림 용기가 놓인 선반을 바라보며 잠시 망설이는 오버숄더 컷.', narration: '크림은 조금 무겁게 느껴지는 날.', subtitle: '크림은 조금 무겁게 느껴지는 날', method: '실제 욕실 B-roll', qa: '제품 혼동을 막기 위해 경쟁 라벨은 보이지 않게 처리' },
      { id: 'S03', time: '6–9초', phase: 'BRIDGE', visual: '실제 아쿠아 로션 제품 원본으로 빠르게 펀치인한다. 세로 화면 한쪽으로 치우친 생활 구도.', narration: '그 사이엔 복잡한 단계보다,', subtitle: '', method: '실제 제품 PNG · 로컬 모션', qa: '라벨·펌프·병 비율 100% 보존' },
      { id: 'S04', time: '9–12초', phase: 'SOLUTION', visual: '모델이 말없이 제품 쪽으로 손을 뻗는다. 손은 라벨을 가리지 않고 제품과 접촉하기 직전에 컷한다.', narration: '가볍게 더하는 수분 로션 한 단계.', subtitle: '가볍게 더하는 수분 로션', method: 'Product Placement · 무언 연기', qa: '입 모양 변화와 손가락·라벨 겹침 금지' },
      { id: 'S05', time: '12–15초', phase: 'NAME', visual: '세면대 위 실제 제품 단독 컷. 휴대전화 자동 노출처럼 미세한 밝기 변화만 준다.', narration: '유어스킨플러스 히알루론산 아쿠아 로션.', subtitle: '히알루론산 아쿠아 로션', method: '실제 제품 원본 · 짧은 돌리인', qa: '생성형 제품 회전과 물 스플래시 금지' },
      { id: 'S06', time: '15–18초', phase: 'FACT 01', visual: '제품 주변에 옅은 아쿠아 레이어가 겹치는 추상 그래픽. 물방울이 튀는 연출은 사용하지 않는다.', narration: '8종 히알루론산을 담고,', subtitle: '8종 히알루론산', method: '후반 모션그래픽', qa: '제품 근거 문구만 사용, 효능 보장 표현 금지' },
      { id: 'S07', time: '18–21초', phase: 'FACT 02', visual: '실제 펌프 헤드와 투명한 병 어깨를 근접 촬영한다. 펌프를 누르는 생성형 동작은 생략한다.', narration: '무향 설계에 300밀리리터 펌프형으로', subtitle: '무향 설계 · 300ml 펌프형', method: '실제 제품 매크로', qa: '펌프 구조와 300ml 표기 검수' },
      { id: 'S08', time: '21–24초', phase: 'ROUTINE', visual: '아침 자연광에서 제품을 내려놓는 손과 저녁 조명에서 같은 제품을 잡는 손을 빠르게 교차한다.', narration: '아침에도 저녁에도 간편하게.', subtitle: '아침에도 · 저녁에도', method: '실촬영 2컷 매치컷', qa: '같은 병·펌프 방향과 라벨 위치 유지' },
      { id: 'S09', time: '24–27초', phase: 'RESULT', visual: '모델이 양손으로 볼을 가볍게 감싸고 거울을 본다. 카메라에는 말하지 않는다.', narration: '토너 다음, 크림 전.', subtitle: '토너 다음 · 크림 전', method: 'Higgsfield 무언 연기 · 손 프레임 QA', qa: '입술 닫힘·손가락·피부결 프레임별 검수' },
      { id: 'S10', time: '27–30초', phase: 'CTA', visual: '모델이 제품을 세면대에 내려놓고 손이 빠져나간다. 움직이는 화면 위 빈 공간에 CTA를 합성한다.', narration: '오늘의 루틴에, 가볍게 한 번 더.', subtitle: '가볍게 한 번 더 · 제품 정보 확인', method: '실제 제품 원본 · 후반 자막', qa: '정적 엔드카드와 생성 한글 금지, CTA 안전 영역 확인' },
    ],
  },
];

export const productionGates = [
  ['01', '캐스팅 승인', 'A·C·D 중 한 명을 선택하고 의상·헤어를 고정'],
  ['02', 'Soul ID 세트', '정면·3/4·프로필·반신·전신 20장 이상 검수'],
  ['03', '제품 키프레임', '라벨·펌프·병 비율이 맞는 정지 컷 3장 승인'],
  ['04', '8초 무언 테스트', '입술 닫힘·얼굴·손·제품 접촉과 나레이션 톤을 확인'],
  ['05', '30초 마스터', '승인된 무언 연기와 실제 제품 컷만 조합해 완성'],
  ['06', '파생 소재', '15초 압축·8초 훅·다른 나레이션 첫 문장 제작'],
] as const;
