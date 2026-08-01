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
  generation?: string;
  creditSummary?: string;
  poster: string;
  videoSrc?: string;
  masterSrc?: string;
  createdAt: string;
  updatedAt: string;
  storyboard: StoryboardShot[];
};

export type SceneAttempt = {
  id: string;
  scene: string;
  title: string;
  status: 'reference' | 'pending' | 'review' | 'selected' | 'rejected';
  model: string;
  duration?: string;
  creditCost: string;
  poster?: string;
  videoSrc?: string;
  summary: string;
  issues: string[];
  createdAt: string;
};

export const campaignModels: CampaignModel[] = [
  {
    id: 'A-SEO-YUNA-V2', code: 'A', name: '서윤아', role: '청순·맑은 수분광 화장품 모델형', status: 'active',
    age: 25, heightCm: 167, weightKg: 50, bodyType: '자연스럽고 균형 잡힌 슬림 체형',
    job: '뷰티 브랜드 룩북과 라이프스타일 콘텐츠를 병행하는 가상 모델', personality: '맑고 차분하며 편안한 미소가 자연스러움',
    voice: '모델은 무언 연기 · 최종본은 실제 한국인 여성 나레이션', hook: '가볍고 깨끗한 아침 수분 루틴을 밝은 표정과 손동작으로 보여줌',
    styling: '아이보리 실크 블라우스 · 파우더블루 A라인 미디스커트 · 누드 펌프스',
    strengths: ['20대 성인으로 보이는 맑고 환한 얼굴', '청순한 수분광 화장품 캠페인 적합', '손·발·전신 비율 안정'],
    risks: ['현재 의상이 오피스룩처럼 보일 수 있어 영상에서는 생활형 질감으로 낮춰야 함', '스튜디오 피부 보정을 실제 UGC 수준으로 낮춰야 함'],
    image: '/marketing/aqua-lotion-video-studio/models/casting-2026/a-seo-yuna.webp',
  },
  {
    id: 'B-MIN-CHAERIN-V2', code: 'B', name: '민채린', role: '성숙·세련된 프리미엄 화장품 모델형', status: 'active',
    age: 27, heightCm: 169, weightKg: 51, bodyType: '길고 자연스러운 슬림 체형',
    job: '패션·뷰티 에디토리얼을 병행하는 가상 모델', personality: '자신감 있고 세련됐지만 과하게 포즈를 잡지 않음',
    voice: '모델은 무언 연기 · 최종본은 실제 한국인 여성 나레이션', hook: '성숙한 저녁 수분 루틴을 시선과 절제된 손동작으로 보여줌',
    styling: '딥네이비 비대칭 보트넥 니트 · 버건디 슬림 미디스커트 · 블랙 슬링백',
    strengths: ['밝고 환한 프리미엄 뷰티 얼굴', '노출 없이 성숙하고 세련된 분위기', '목선·헤어·치마 실루엣의 광고 주목도'],
    risks: ['조명과 포즈가 과해지면 생활 UGC보다 에디토리얼처럼 보일 수 있음', '오프숄더 라인은 영상 생성에서 의상 형태를 고정해야 함'],
    image: '/marketing/aqua-lotion-video-studio/models/casting-2026/b-min-chaerin.webp',
  },
  {
    id: 'D-HAN-CHAEWON', code: 'C', name: '한채원', role: '기존 D · V2 제작 비교 기준형', status: 'selected',
    age: 29, heightCm: 170, weightKg: 51, bodyType: '자연스럽게 길고 슬림한 체형',
    job: '독립영화·라이프스타일 콘텐츠를 병행하는 가상 배우', personality: '세련되고 자신감 있지만 거리감이 없음',
    voice: '최종본은 실제 한국인 여성 나레이션, 모델은 무언 연기', hook: '기존 D의 영상·표정·제품 테스트 이력을 새 A·B와 비교하는 기준',
    styling: '파우더블루 비대칭 보트넥 · 웜아이보리 와이드 팬츠 · 실버 후프',
    strengths: ['기존 영상 제작 이력이 있는 비교 기준', '최신 릴스형 스타일링', '긴 레이어드 헤어와 자연스러운 피부결'],
    risks: ['화면 표시는 새 캐스팅 C지만 과거 제작 이력의 내부 ID는 D로 보존', '표정을 지시하면 과장된 걱정 연기로 변함'],
    image: '/marketing/aqua-lotion-video-studio/revisions/v2/model-d-modern-style.webp',
  },
];

export const archivedModels: CampaignModel[] = [
  {
    id: 'A-YOON-SEOJIN', code: 'A · OLD', name: '윤서진', role: '현실적인 직장인 후기형', status: 'archived',
    age: 31, heightCm: 165, weightKg: 52, bodyType: '자연스러운 평균-슬림 체형',
    job: '생활용품 브랜드 콘텐츠 운영 실무자', personality: '차분하고 솔직하며 결론을 짧게 전달',
    voice: '짧고 담백한 존댓말', hook: '토너만으론 아쉽고 크림은 무거울 때 있잖아요.',
    styling: '파우더블루 라운드 니트 · 오트밀 커브드 팬츠 · 초콜릿 메리제인', strengths: ['광고 티가 적은 현실감'],
    risks: ['사용자 지시로 2026-08-01 탈락 · 새 A로 교체'],
    image: '/marketing/aqua-lotion-video-studio/models/a-yoon-seojin-full.webp',
  },
  {
    id: 'B-PARK-JIHYUN', code: 'B · OLD', name: '박지현', role: '실용적인 단발 리뷰어형', status: 'archived',
    age: 35, heightCm: 161, weightKg: 55, bodyType: '건강한 평균 체형',
    job: '중소기업 총무·구매 담당자', personality: '생활력이 있고 직접 써보고 판단',
    voice: '경험 중심의 담백한 해요체', hook: '매일 쓰는 건 결국 펌프가 편하더라고요.',
    styling: '그레이 스웨트셔츠 · 블랙 팬츠', strengths: ['생활 신뢰감'],
    risks: ['사용자 의상·캐스팅 검토에서 탈락'],
    image: '/marketing/aqua-lotion-video-studio/models/b-park-jihyun-archived.webp',
  },
  {
    id: 'C-KIM-HARIN', code: 'C · OLD', name: '김하린', role: '캐주얼한 액티브 사용자형', status: 'archived',
    age: 27, heightCm: 168, weightKg: 54, bodyType: '현실적인 슬림 애슬레틱 체형',
    job: '모바일 서비스 UX 디자이너', personality: '복잡한 루틴을 싫어하고 결론부터 말함',
    voice: '반박자 빠른 자연스러운 해요체', hook: '복잡하게 여러 개 바르기 싫은 날 있죠?',
    styling: '버터옐로 컴팩트 티 · 라이트 중청 커브드 데님 · 크림실버 스니커즈', strengths: ['빠른 훅과 생활 루틴'],
    risks: ['사용자 지시로 2026-08-01 탈락 · 새 캐스팅 C 슬롯으로 교체'],
    image: '/marketing/aqua-lotion-video-studio/models/c-kim-harin-full.webp',
  },
];

export const campaignVideos: CampaignVideo[] = [
  {
    id: 'AQUA-UGC-001', sequence: 1, title: '가볍게 한 번 더', subtitle: '모델은 말하지 않고, 나레이션이 이끄는 30초 생활 루틴',
    status: 'review', duration: '30초', ratio: '9:16 · 720×1280', objective: '모델 D의 무언 생활 행동과 실제 제품 원본을 연결하고, 별도 한국어 나레이션으로 사용 상황과 제품 정보를 전달',
    modelId: 'D-HAN-CHAEWON', modelLabel: 'D · 한채원 · Reference Element 고정', product: '유어스킨플러스 히알루론산 아쿠아 로션 300ml',
    hook: '토너만으로는 왠지 아쉽고, 크림은 조금 무겁게 느껴지는 날.', keyMessage: '가볍게 한 번 더', cta: '제품 정보 확인',
    narrationScript: '토너만으로는 왠지 아쉽고, 크림은 조금 무겁게 느껴지는 날. 그 사이엔 복잡한 단계보다, 가볍게 더하는 수분 로션 한 단계. 유어스킨플러스 히알루론산 아쿠아 로션. 8종 히알루론산을 담고, 무향 설계에 300밀리리터 펌프형으로 아침에도 저녁에도 간편하게. 토너 다음, 크림 전. 오늘의 루틴에 가볍게 한 번 더.',
    voiceDirection: '현재 검토본: Higgsfield Hana 한국어 음성 · 명료한 중속. 최종 집행본은 실제 한국인 여성 나레이터 녹음으로 교체 예정',
    generation: 'Higgsfield MCP · Seedance 2.0 Fast 720p 6초 × 3 · Seed Audio 1.0 · 실제 제품 원본 후반 합성',
    creditSummary: '총 64.2 크레딧 사용 · 생성 후 잔액 1,140.3 크레딧',
    poster: '/marketing/aqua-lotion-video-studio/posters/aqua-ugc-001-model-d-higgsfield.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/videos/aqua-ugc-001-model-d-higgsfield-mcp-30s.mp4',
    createdAt: '2026-08-01', updatedAt: '2026-08-01',
    storyboard: [
      { id: 'S01', time: '0–3초', phase: 'HOOK', visual: '모델 D가 거울로 피부를 살핀다. 카메라를 보거나 말하지 않는다.', narration: '토너만으로는 왠지 아쉽고,', subtitle: '토너만으로는 왠지 아쉽고', method: 'Higgsfield Seedance 2.0 · D Reference Element', qa: '자연스러운 호흡만 유지하고 립싱크 동작 금지' },
      { id: 'S02', time: '3–6초', phase: 'PROBLEM', visual: '모델 D가 한쪽 볼에 손을 가볍게 대며 피부 상태를 확인한다.', narration: '크림은 조금 무겁게 느껴지는 날.', subtitle: '크림은 조금 무거운 날', method: 'Higgsfield 무언 연기', qa: '얼굴·머리·의상·손가락 프레임 검수' },
      { id: 'S03', time: '6–9초', phase: 'BRIDGE', visual: '실제 아쿠아 로션 제품 원본으로 빠르게 펀치인한다. 세로 화면 한쪽으로 치우친 생활 구도.', narration: '그 사이엔 복잡한 단계보다,', subtitle: '', method: '실제 제품 PNG · 로컬 모션', qa: '라벨·펌프·병 비율 100% 보존' },
      { id: 'S04', time: '9–12초', phase: 'SOLUTION', visual: '실제 제품 팩샷을 유지한 채 미세한 휴대전화 줌으로 해결책을 강조한다.', narration: '가볍게 더하는 수분 로션 한 단계.', subtitle: '가볍게 더하는 수분 로션', method: '실제 제품 PNG · 후반 모션', qa: '생성 제품 대신 실제 라벨 원본만 사용' },
      { id: 'S05', time: '12–15초', phase: 'NAME', visual: '모델 D가 세면대 양쪽에 손을 두고 제품이 놓일 공간을 바라본다.', narration: '유어스킨플러스 히알루론산 아쿠아 로션.', subtitle: '가볍게 더하는 수분 로션', method: 'Higgsfield Seedance 2.0 · 무언 연기', qa: '손가락·의상·얼굴 일관성 검수' },
      { id: 'S06', time: '15–18초', phase: 'FACT 01', visual: '모델 D가 제품 공간을 확인하고 차분하게 루틴을 이어가는 생활 장면.', narration: '8종 히알루론산을 담고,', subtitle: '', method: 'Higgsfield Seedance 2.0 · 동일 참조 요소', qa: '생성 제품은 노출하지 않고 모델 움직임만 사용' },
      { id: 'S07', time: '18–21초', phase: 'FACT 02', visual: '실제 펌프 헤드와 투명한 병 어깨를 근접 촬영한다. 펌프를 누르는 생성형 동작은 생략한다.', narration: '무향 설계에 300밀리리터 펌프형으로', subtitle: '무향 설계 · 300ml 펌프형', method: '실제 제품 매크로', qa: '펌프 구조와 300ml 표기 검수' },
      { id: 'S08', time: '21–24초', phase: 'ROUTINE', visual: '실제 제품 상단과 라벨을 크게 보여주며 300ml 펌프형 정보를 확인시킨다.', narration: '아침에도 저녁에도 간편하게.', subtitle: '8종 히알루론산 · 무향 설계 · 300ml 펌프형', method: '실제 제품 확대 모션', qa: '같은 병·펌프 방향과 라벨 위치 유지' },
      { id: 'S09', time: '24–27초', phase: 'RESULT', visual: '모델이 양손으로 볼을 가볍게 감싸고 거울을 본다. 카메라에는 말하지 않는다.', narration: '토너 다음, 크림 전.', subtitle: '토너 다음 · 크림 전', method: 'Higgsfield 무언 연기 · 손 프레임 QA', qa: '입술 닫힘·손가락·피부결 프레임별 검수' },
      { id: 'S10', time: '27–30초', phase: 'CTA', visual: '모델이 제품을 세면대에 내려놓고 손이 빠져나간다. 움직이는 화면 위 빈 공간에 CTA를 합성한다.', narration: '오늘의 루틴에, 가볍게 한 번 더.', subtitle: '가볍게 한 번 더 · 제품 정보 확인', method: '실제 제품 원본 · 후반 자막', qa: '정적 엔드카드와 생성 한글 금지, CTA 안전 영역 확인' },
    ],
  },
];

export const sceneAttempts: SceneAttempt[] = [
  {
    id: 'MASTER-V1', scene: '전체 30초', title: '첫 Higgsfield 조립 검토본', status: 'rejected',
    model: 'Seedance 2.0 Fast + Seed Audio', duration: '30초', creditCost: '64.2 credits',
    poster: '/marketing/aqua-lotion-video-studio/posters/aqua-ugc-001-model-d-higgsfield.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/videos/aqua-ugc-001-model-d-higgsfield-mcp-30s.mp4',
    summary: '장면을 한꺼번에 조립한 최초 검토본. 새 V2의 비교 기준으로만 보관한다.',
    issues: ['나레이션이 기계적', '시작 고민 표정이 부자연스러움', '제품 사용 행동 없음', '중간 제품 장면이 부자연스러움', '스타일이 최신 UGC와 거리 있음'],
    createdAt: '2026-08-01',
  },
  {
    id: 'STYLE-D2', scene: '모델 기준', title: 'D · Modern UGC V2', status: 'reference',
    model: 'GPT Image 2 · D Reference Element', creditCost: '7 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/model-d-modern-style.webp',
    summary: '긴 레이어드 헤어, 파우더블루 비대칭 보트넥, 아이보리 와이드 팬츠로 교체한 V2 기준 이미지.',
    issues: ['고급 욕실 배경이 실제 생활 UGC보다 조금 정돈돼 보임', '영상에서는 광고 포즈와 과한 미소를 억제해야 함'],
    createdAt: '2026-08-01',
  },
  {
    id: 'HOOK-A', scene: '0–5초 훅', title: '거울 접근 + 볼 확인', status: 'rejected',
    model: 'Seedance 2.0 Fast', duration: '5초', creditCost: '17.5 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/model-d-modern-style.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/v2/hook-a.mp4',
    summary: '미세한 고민만 요청했지만 표정과 입 벌림이 다시 과장되어 탈락.',
    issues: ['눈썹이 과하게 올라감', '입이 벌어져 무언 연기 조건 위반', '볼을 누르는 손동작이 걱정 연기처럼 보임'],
    createdAt: '2026-08-01',
  },
  {
    id: 'HOOK-B', scene: '0–5초 훅', title: '시선 이동 + 가벼운 볼 터치', status: 'rejected',
    model: 'Seedance 2.0 Fast', duration: '5초', creditCost: '17.5 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/model-d-modern-style.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/v2/hook-b.mp4',
    summary: '표정은 A보다 절제됐지만 요청하지 않은 중국어 자막이 생성되어 탈락.',
    issues: ['중국어 생성 자막', '고민보다 카메라 포즈에 가까움', '손이 입 주변을 지나며 메시지가 모호함'],
    createdAt: '2026-08-01',
  },
  {
    id: 'USE-KEY-01', scene: '제품 사용', title: '펌핑 직전 통합 키프레임', status: 'rejected',
    model: 'GPT Image 2 · 모델+실제품 참조', creditCost: '7 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/product-use-keyframe-rejected.webp',
    summary: '제품을 손에 들고 펌프를 누르기 직전의 구도는 확보했지만 제품 라벨과 용기 세부가 원본에서 변형됨.',
    issues: ['라벨 문구·레이아웃 변형', '제품 병 비율이 실제 원본과 다름', '신뢰 근거 장면으로 사용할 수 없음'],
    createdAt: '2026-08-01',
  },
  {
    id: 'USE-MS-01', scene: '제품 사용', title: 'Marketing Studio Tutorial 테스트', status: 'rejected',
    model: 'Marketing Studio · Tutorial', duration: '12초', creditCost: '60 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/model-d-modern-style.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/v2/use-ms-01.mp4',
    summary: '집기→1회 펌핑→볼 도포 행동은 생성됐지만 실제 SKU의 펌프·라벨·병 구조가 달라져 탈락.',
    issues: ['검정 펌프가 흰색으로 변형됨', '실제 라벨 문구·레이아웃 불일치', '투명 원통형 300ml 병 비율이 달라짐', '손 도포는 자연스럽지만 제품 증거로는 사용 불가'],
    createdAt: '2026-08-01',
  },
  {
    id: 'SITE-KF-01', scene: '웹사이트 키프레임', title: 'Nano Banana Pro · 2레퍼런스 펌핑 직전', status: 'review',
    model: 'Higgsfield 사이트 · Nano Banana Pro', creditCost: '4 credits · 2회',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/site/pump-keyframe-01.webp',
    summary: '사이트에서 모델 D와 실제 제품 팩샷을 직접 넣어 만든 펌핑 직전 키프레임. 기존 통합 키프레임보다 검정 펌프·손·제품 비율이 안정적이다.',
    issues: ['AQUA LOTION 큰 라벨은 유지', '상단 라벨 일부가 손에 가려짐', '영상에서 실제 펌프 눌림과 토출을 별도 검증해야 함', '첫 사이트 제출 오류·중복 재시도로 이미지 2회 차감'],
    createdAt: '2026-08-01',
  },
  {
    id: 'SITE-PUMP-01', scene: '웹사이트 펌핑', title: 'Kling 3.0 Turbo · 펌핑 테스트 01', status: 'rejected',
    model: 'Higgsfield 사이트 · Kling 3.0 Turbo', duration: '5초 · 1080p', creditCost: '10 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/site/pump-keyframe-01.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/v2/site/pump-kling-01.mp4',
    summary: '제품·모델·검정 펌프는 유지됐지만 펌프 이동이 작고 로션이 토출되기보다 손바닥에 나타나는 느낌이라 증거 장면으로 탈락.',
    issues: ['펌프의 완전 눌림·복귀가 명확하지 않음', '약 2.25초에 로션이 갑자기 나타남', '허리 위 구도라 핵심 동작이 작음', '라벨과 병은 기존 MCP 영상보다 안정적'],
    createdAt: '2026-08-01',
  },
  {
    id: 'SITE-KF-MACRO', scene: '웹사이트 키프레임', title: 'Nano Banana Pro · 손·펌프 매크로', status: 'rejected',
    model: 'Higgsfield 사이트 · Nano Banana Pro', creditCost: '2 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/site/pump-macro-keyframe-rejected.webp',
    summary: '펌프와 양손을 크게 잡는 구도는 좋아졌지만 제품 라벨에 존재하지 않는 영문이 생성되어 영상 입력에서 제외.',
    issues: ['가짜 영문 라벨 생성', '투명 병이 불투명하게 변형', '검정 펌프와 손 구조는 개선', 'SKU 신뢰 장면으로 사용 불가'],
    createdAt: '2026-08-01',
  },
  {
    id: 'SITE-PUMP-02', scene: '웹사이트 펌핑', title: 'Kling 3.0 Turbo · 명시적 1회 펌프', status: 'rejected',
    model: 'Higgsfield 사이트 · Kling 3.0 Turbo', duration: '5초 · 1080p', creditCost: '10 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/site/pump-keyframe-01.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/v2/site/pump-kling-02.mp4',
    summary: '완전 눌림→1회 토출→복귀를 명시했지만 사이트가 이전 업로드를 다시 참조했고, 펌프 움직임이 여전히 눈에 띄지 않아 탈락.',
    issues: ['펌프 스트로크가 시각적으로 확인되지 않음', '로션이 토출보다 이미 생긴 것처럼 보임', '새 크롭 대신 이전 입력이 재사용된 흔적', '모델·라벨·병은 안정적이나 사용 증거는 부족'],
    createdAt: '2026-08-01',
  },
];

export const productionGates = [
  ['01', 'V2 스타일 기준', '모델 D 파우더블루 보트넥·레이어드 헤어 기준 이미지 완료'],
  ['02', '고민 표정 훅', 'A 과장 표정·B 중국어 자막으로 2종 모두 탈락'],
  ['03', '제품 사용 키프레임', '구도는 확보했지만 실제 라벨·펌프·병 비율 변형으로 탈락'],
  ['04', 'Marketing Studio 사용 테스트', '집기·펌핑·도포는 생성됐지만 SKU 구조 불일치로 탈락'],
  ['05', '사이트 직접 생성 테스트', 'Nano Banana Pro 키프레임 3회·Kling 3.0 Turbo 2회 검수. 제품 보존은 개선됐지만 펌프 눌림·토출이 불명확해 중단'],
  ['06', '실제 사용 증거', '실제품 집기·1회 펌핑·손등 또는 볼 도포 실촬영 3컷 필요'],
  ['07', 'V2 마스터', '통과한 모델 장면과 실제 제품 사용 컷, 실제 여성 음성을 조립'],
] as const;
