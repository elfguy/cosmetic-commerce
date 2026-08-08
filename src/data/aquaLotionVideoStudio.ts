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
    styling: '펄화이트 비대칭 디테일 니트 · 아이스블루 구조적 A라인 미니스커트 · 실버 메시 발레 플랫',
    strengths: ['20대 성인으로 보이는 맑고 환한 얼굴', '교복 느낌 없는 성인용 미니스커트 스타일', '손·다리·무릎·신발 비율 안정'],
    risks: ['스튜디오 피부 보정을 실제 UGC 수준으로 낮춰야 함', '영상에서는 치마 길이와 내장 안감 형태를 시작 프레임에 고정해야 함'],
    image: '/marketing/aqua-lotion-video-studio/models/casting-2026/a-seo-yuna.webp',
  },
  {
    id: 'B-MIN-CHAERIN-V2', code: 'B', name: '민채린', role: '성숙·세련된 프리미엄 화장품 모델형', status: 'active',
    age: 27, heightCm: 169, weightKg: 51, bodyType: '길고 자연스러운 슬림 체형',
    job: '패션·뷰티 에디토리얼을 병행하는 가상 모델', personality: '자신감 있고 세련됐지만 과하게 포즈를 잡지 않음',
    voice: '모델은 무언 연기 · 최종본은 실제 한국인 여성 나레이션', hook: '성숙한 저녁 수분 루틴을 시선과 절제된 손동작으로 보여줌',
    styling: '미드나이트 네이비 원숄더 니트 · 딥체리 비대칭 드레이프 미니스커트 · 버건디 키튼힐 슬링백',
    strengths: ['밝고 환한 프리미엄 뷰티 얼굴', '과도한 노출 없는 성숙한 미니스커트 스타일', '손·다리·무릎·신발 비율 안정'],
    risks: ['조명과 포즈가 과해지면 생활 UGC보다 에디토리얼처럼 보일 수 있음', '영상 생성에서 원숄더와 비대칭 치마 형태를 시작 프레임에 고정해야 함'],
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
    id: 'A-TV-STORY-15S-V13-MODEL-IMAGE-VOICE', scene: 'A 모델 15초', title: '모델 얼굴 기반 한국어 보이스 캐스팅 · Seed Audio V13', status: 'review',
    model: 'V10 GPT 제품 잠금 영상 + Kie Suno V5.5 오리지널 음악 + ByteDance Seed Audio 1.0 모델 이미지 보이스 큐', duration: '15초 · 모델 이미지 기반 한국어 나레이션', creditCost: '1.4 Higgsfield credits · 기존 Kie 음악 유지',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v13-model-image-seed-voice-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v13-model-image-seed-voice.mp4',
    summary: '모델이 직접 낼 것 같은 예쁜 목소리 요청을 반영해 해외 이름 프리셋 캐스팅을 중단. 배우 결과 장면의 얼굴 이미지를 Seed Audio 1.0 image_references로 전달해 인물의 나이대·맑은 인상·차분한 뷰티 무드에 맞는 음성을 생성했다. 구어체 대본으로 줄이고 생성 속도를 그대로 사용했다.',
    issues: ['사용자 요청: 모델이 낼 것 같은 예쁜 목소리로 재캐스팅', '리서치 결과 Seed Audio 1.0의 image_references 보이스 큐 채택', '레퍼런스: A 모델 창가 결과 장면 720×1280 얼굴 클로즈업', 'Seed Audio job a4b46392-3637-4b54-b216-8e3985cdbfea', '긴 16.09초 첫 테이크는 발음만 검증하고 영상에서 제외', '최종 대본을 8.8초 구어체로 축약해 재생 속도 조절 없음', '나레이션: 크림은 무겁고 토너만으로는 아쉬울 때 / 아쿠아 로션으로 가볍게 한 번 더 / 여덟 가지 히알루론산, 무향 설계 / 유어스킨플러스', '300ml 펌프형은 화면 자막으로 유지하고 음성에서 제외', 'Whisper 최종 믹스에서 핵심 문장 전체 식별', '음성 0.3초 시작 · 약 9.1초 종료 · 이후 약 5.9초 음악/제품 여운', '최종 MP4 H.264 1080×1920 · AAC 48kHz · 15.000초', '최종 통합 음량 -16.4 LUFS · True Peak -4.9dBFS', 'Seed Audio 두 번 생성 총 1.4 Higgsfield credits'], createdAt: '2026-08-08',
  },
  {
    id: 'A-TV-STORY-15S-V12-KIE-PRO-VOICE', scene: 'A 모델 15초', title: 'Kie Pro 한국어 나레이션 · 자연 속도 · V12', status: 'rejected',
    model: 'V10 GPT 제품 잠금 영상 + Kie Suno V5.5 오리지널 음악 + Kie Gemini 2.5 Pro TTS Aoede 여성 음성', duration: '15초 · Kie Pro 한국어 나레이션', creditCost: '0.88 Kie credits 추가 · 음악 기존 자산',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v12-kie-pro-voice-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v12-kie-pro-voice.mp4',
    summary: 'Kie Gemini 2.5 Pro Aoede로 개선했지만 모델이 직접 낼 것 같은 목소리 캐스팅 요구를 위해 대체. 배우 얼굴 이미지를 직접 보이스 큐로 사용하는 Seed Audio V13으로 교체했다.',
    issues: ['사용자 평가 우선: V11 Kore Flash 음성 폐기', 'Kie Gemini 2.5 Pro TTS + Aoede 여성 음성으로 교체', '채택 tasks: e5074a2daa1a643bdeaf72b7116f2e61 / 3a14493a4c05d7825a2da4d83c441aa6', '대본을 3테이크에서 2테이크로 축약해 억양 일관성 개선', '15% 속도 증가 제거 · 원래 생성 속도 그대로 사용', '나레이션: 크림은 무겁고, 토너만으로는 아쉬울 때. 가볍게 한 번 더 / 여덟 가지 히알루론산 아쿠아 로션. 무향, 300ml. 유어스킨플러스', '발음이 어색했던 펌프 타입은 음성에서 제외하고 화면 자막으로만 유지', 'Whisper 최종 믹스에서 전체 문장 식별', '실제 음성 종료 11.79초 · 마지막 2.94초 음악 여운', '최종 MP4 H.264 1080×1920 · AAC 48kHz · 15.000초', '최종 통합 음량 -16.9 LUFS · True Peak -3.8dBFS', 'V12 추가 비용 0.88 Kie credits · 잔액 6028.85'], createdAt: '2026-08-08',
  },
  {
    id: 'A-TV-STORY-15S-V11-KIE-AUDIO', scene: 'A 모델 15초', title: 'Kie 오리지널 음악 · 한국어 Kore 음성 · V11', status: 'rejected',
    model: 'V10 GPT 정량 제품 잠금 영상 + Kie Suno V5.5 오리지널 인스트루멘털 + Kie Gemini 3.1 Flash TTS Kore 여성 음성', duration: '15초 · Kie 음악/나레이션', creditCost: '18.27 Kie credits · Higgsfield 0 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v11-kie-audio-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v11-kie-audio.mp4',
    summary: '사용자 평가에서 한국어 나레이션이 매우 이상하다고 판정되어 폐기. 음악은 유지하고 Kore Flash 음성만 Gemini 2.5 Pro Aoede 자연 속도 음성으로 교체한 V12를 제작했다.',
    issues: ['최종 MP4 H.264 1080×1920 · AAC 48kHz 스테레오 · 15.000초', 'Kie Suno V5.5 music task defb21cbee138e3e5a9b4cf7fed291a5', '오리지널 instrumental=true · 기존 곡/아티스트/상표 참조 없음', 'Whisper 음악 보컬·말소리 감지 0개', 'Kie Gemini 3.1 Flash TTS · Kore 여성 음성 · 자연스러운 한국어 뷰티 내레이터 프로필', '채택 음성 tasks: 4de9cd911640f6ec51e3ac57dcbacac4 / 0d3fa289a62bdcf51fce705a36867cbb / 16a7ba3766879380bc0b8828590a45ce', '나레이션 3테이크 분리 녹음 및 개별 Whisper 발화 QA', '나레이션: 크림은 무겁고, 토너만으로는 아쉬울 때 / 여덟 가지 히알루론산을 담은 가벼운 아쿠아 로션 / 무향·300ml·펌프 타입·유어스킨 플러스', '음성 -17 LUFS 기반 · 음악 -25 LUFS 기반 · sidechain 자동 덕킹', '최종 통합 음량 -16.5 LUFS · True Peak -4.1dBFS', '실제 음성 종료 13.54초 · 마지막 1.46초 음악 엔드', 'Kie 총 18.27 credits 사용 · 실패/검증 거절 작업은 0 credits', '절대적인 Content ID 무클레임을 보증할 수는 없으나 오리지널 프롬프트·무보컬·비참조 생성으로 저작권 위험 최소화'], createdAt: '2026-08-08',
  },
  {
    id: 'A-TV-STORY-15S-V10-GPT-LOCK', scene: 'A 모델 15초', title: 'GPT 정량 제품 잠금 · 자연광 통합 · 무음 V10', status: 'rejected',
    model: 'Seedance 2.0 배우컷 + ChatGPT Images 제품 원본 2장/배경 참조 + 정량 bbox 제품 잠금 + Pretendard Bold', duration: '15초 · 오디오 없음', creditCost: '0 Higgsfield credits · ChatGPT Images 생성 및 후반 타이포',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v10-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v10-silent.mp4',
    summary: 'V10 무음 기준본. GPT 정량 제품 잠금과 자연광 통합은 유지한 채 Kie 오리지널 음악·자연스러운 한국어 여성 나레이션을 추가한 V11로 대체.',
    issues: ['영상·제품·타이포 기준본으로 보존', '사용자 요청에 따라 Kie 음악·나레이션이 포함된 V11로 대체', 'V11에서 영상 스트림은 재인코딩하지 않고 그대로 사용', '오디오 없는 버전이 필요한 경우 V10 자산 사용 가능'], createdAt: '2026-08-08',
  },
  {
    id: 'A-TV-STORY-15S-V9-EXACT-SKU', scene: 'A 모델 15초', title: '실제 SKU 비율 · GPT 물빛 배경 · 무음 V9', status: 'rejected',
    model: 'Seedance 2.0 배우컷 + ChatGPT Images background-only + 실제 판매 제품 PNG 원본 픽셀 + Pretendard Bold', duration: '15초 · 오디오 없음', creditCost: '0 Higgsfield credits · ChatGPT 배경 생성 및 로컬 정밀 합성',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v9-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v9-silent.mp4',
    summary: '실제 SKU 원본 픽셀로 제품 비율은 보존했지만 사용자가 마지막 제품의 합성 티를 지적. 제품 원본 두 장을 직접 첨부해 GPT Images에서 자연광 통합한 V10으로 대체.',
    issues: ['사용자 피드백: 마지막 제품이 합성한 티가 남음', '원본 형태는 유지했으나 제품과 배경의 광학 통합이 부족', 'V10에서 투명 제품 원본·펌프 클로즈업·제품 없는 배경을 fresh GPT Images에 첨부', 'V10의 정량 비율 교정 및 자연광 통합본으로 대체', 'V9 배우 장면과 흰 자막은 V10에 유지'], createdAt: '2026-08-07',
  },
  {
    id: 'A-TV-STORY-15S-V8-GPT-HERO', scene: 'A 모델 15초', title: '강화 흰색 타이포 · GPT 물빛 팩샷 · 무음 V8', status: 'rejected',
    model: 'Seedance 2.0 Standard 배우컷 + ChatGPT Images 제품 잠금 V3 팩샷 + Pretendard Bold 흰색 타이포', duration: '15초 · 오디오 없음', creditCost: '0 Higgsfield credits · ChatGPT 구독 이미지 생성 및 후반 수정',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v8-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v8-silent.mp4',
    summary: 'V7 기반 자막·하단 물빛 연출 강화본. 사용자가 마지막 제품이 너무 길고 주변과 잘 어울리지 않는다고 평가해 실제 제품 원본 비율 기반 V9으로 대체.',
    issues: ['사용자 피드백: 마지막 제품이 너무 길게 보임', '사용자 피드백: 제품과 주변 물·유리 배경 통합감 부족', 'GPT 제품 자체 생성은 비율과 라벨 drift가 반복돼 중단', 'V9에서 GPT background-only + 실제 판매 제품 PNG 원본 픽셀 합성으로 교정', 'V8의 배우 장면·강화 흰 자막은 V9에 유지'], createdAt: '2026-08-07',
  },
  {
    id: 'A-TV-STORY-15S-V7-WHITE', scene: 'A 모델 15초', title: '원본 배경 · 흰색 직접 자막 · 무음 V7', status: 'rejected',
    model: 'Seedance 2.0 Standard 배우컷 + ChatGPT Images 제품 팩샷 + Pretendard 흰색 타이포', duration: '15초 · 오디오 없음', creditCost: '0 credits · V6 배경 scrim 제거 및 자막 색상만 수정',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v7-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v7-silent.mp4',
    summary: '사용자가 가장 낫다고 평가한 원본 배경·흰색 직접 자막 방향. 주목도와 엔드 제품 글자 크기, 하단 팩샷 연출을 강화한 V8로 대체.',
    issues: ['사용자 평가: 제일 나은 것 같음', '추가 요청: 자막을 조금 더 눈에 띄게', '추가 요청: 마지막 제품 글씨 확대', '추가 요청: 심심한 하단 이미지를 GPT Images로 강화', 'V8에서 배경·흰색 방향은 유지하고 Bold 타이포와 신규 물빛 팩샷 적용'], createdAt: '2026-08-07',
  },
  {
    id: 'A-TV-STORY-15S-V6-BENCHMARKED', scene: 'A 모델 15초', title: '공식 광고 벤치마크 타이포 · GPT 팩샷 · 무음 V6', status: 'rejected',
    model: 'Seedance 2.0 Standard 배우컷 + ChatGPT Images 제품 팩샷 + Pretendard 직접 타이포', duration: '15초 · 오디오 없음', creditCost: '0 credits · 공식 광고 리서치 후 V5 타이포 재설계',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v6-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v6-silent.mp4',
    summary: '공식 광고 문법을 반영한 직접 타이포였지만 사용자 요청에 따라 배경 tonal scrim을 제거하고 흰색 자막만 사용하는 V7로 대체.',
    issues: ['사용자 지시: 배경을 변경하지 말고 흰색으로만', '아이보리/딥틸 tonal scrim이 원본 배경 명도를 바꿈', '장면·제품·Pretendard 타이포 구조는 유지', '배경 무변경·흰색 직접 자막 V7로 대체'], createdAt: '2026-08-07',
  },
  {
    id: 'A-TV-STORY-15S-V5-CAPTIONS', scene: 'A 모델 15초', title: '고가독성 프로스트 자막 · GPT 팩샷 · 무음 V5', status: 'rejected',
    model: 'Seedance 2.0 Standard 배우컷 + ChatGPT Images 2.0 제품 팩샷 + 고대비 프로스트 타이포', duration: '15초 · 오디오 없음', creditCost: '0 credits · V4 자막만 후반 개선',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v5-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v5-silent.mp4',
    summary: '가독성은 개선됐지만 둥근 프로스트 플레이트가 쇼핑앱 UI처럼 보여 촌스럽다는 사용자 평가로 공식 광고 벤치마크 V6로 대체.',
    issues: ['사용자 평가: 너무 촌스러움', '둥근 아이보리/딥틸 카드와 엔드 글라스 패널이 화장품 광고보다 UI 배너처럼 보임', '공식 브랜드 광고는 박스보다 네거티브 스페이스와 직접 타이포를 사용', 'Pretendard + 경계 없는 tonal scrim V6로 대체'], createdAt: '2026-08-07',
  },
  {
    id: 'A-TV-STORY-15S-V4-GPT', scene: 'A 모델 15초', title: 'GPT Images 팩샷 · 미니멀 자막 · 무음 V4', status: 'rejected',
    model: 'Seedance 2.0 Standard 배우컷 + ChatGPT Images 2.0 제품 잠금 팩샷 + 후반 한글 타이포', duration: '15초 · 오디오 없음', creditCost: '0 Higgsfield credits · ChatGPT 구독 이미지 생성',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v4-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v4-silent.mp4',
    summary: 'GPT 팩샷과 미니멀 자막 방향은 승인됐지만 자막이 밝은 욕실 배경에서 잘 보이지 않는다는 사용자 평가로 V5에서 가독성을 강화.',
    issues: ['사용자 평가: 많이 좋아졌지만 자막이 잘 안 보임', '얇은 68px 글자와 배경판 없는 구간의 대비 부족', '제품 팩샷·장면 구조·무음은 유지', '74px 프로스트 플레이트 자막 V5로 대체'], createdAt: '2026-08-07',
  },
  {
    id: 'A-TV-STORY-15S-V3', scene: 'A 모델 15초', title: '합성 제거 · 고대비 타이포 · 무음 V3', status: 'rejected',
    model: 'Seedance 2.0 Standard 배우컷 + 모델 장면 무제품 + 실제 제품 전용 아크릴 팩샷', duration: '15초 · 오디오 없음', creditCost: '0 credits · 기존 고급 장면 재편집',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v3-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v3-silent.mp4',
    summary: '모델 장면 합성은 제거했지만 로컬 아크릴 팩샷과 두 줄 대형 자막이 여전히 어색하다는 사용자 평가로 GPT Images V4로 대체.',
    issues: ['사용자 평가: 마지막 상품 이미지가 너무 어색함', '대형 두 줄 헤드라인과 장식선이 TV 광고보다 템플릿형 자막처럼 보임', '제품 팩샷을 ChatGPT Images 제품 잠금 결과로 교체', '한 줄 미니멀 타이포와 무자막 결과 구간을 적용한 V4로 대체'], createdAt: '2026-08-06',
  },
  {
    id: 'A-TV-STORY-15S-PRODUCT-V2', scene: 'A 모델 15초', title: '실제품 재질 통합 · 무음 TV 스타일 광고 · V2', status: 'rejected',
    model: 'Seedance 2.0 Standard 배우컷 + 실제 pump-closeup 제품 원본 + 창광·접지 후반 합성', duration: '15초 · 오디오 없음', creditCost: '0 credits · 기존 고급 장면 재합성',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-product-v2-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-15s-product-v2-silent.mp4',
    summary: '제품 재질은 개선됐지만 모델 영상에 제품을 합성한 장면과 마지막 모델·제품·화이트 패널 구성이 여전히 어색해 V3로 대체.',
    issues: ['사용자 평가: 상품 이미지 합성과 마지막 이미지가 너무 어색함', '작은 텍스트가 배경에 묻혀 주목도 부족', '모델과 제품의 초점·공간 관계가 후반 합성처럼 보임', '마지막 화이트 패널과 CTA 버튼의 정보 위계가 어색함', '모델 장면 합성 제거·고대비 타이포 V3로 대체'], createdAt: '2026-08-06',
  },
  {
    id: 'A-TV-STORY-15S', scene: 'A 모델 15초', title: '행동 인과형 TV 스타일 광고 · V1', status: 'rejected',
    model: 'Seedance 2.0 Standard 1080p High Bitrate + 실제 제품 후반 합성', duration: '15초', creditCost: '조립 무료 · 고급 장면 생성 180 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-v1-poster.jpg',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/aqua-lotion-a-tv-story-15s-v1-with-music.mp4',
    summary: '행동 서사는 통과했지만 정면 transparent-main 제품이 평면적인 흰 플라스틱처럼 보여 제품 사실감 목표에 미달한 V1.',
    issues: ['사용자 평가: 상품 이미지가 완전히 가짜처럼 보임', '제품 누끼의 병 투명도·펌프 재질·환경광 부족', '제품과 배경의 선명도 차이', '프로그램 음악은 사용자 후반 가공을 위해 제거 필요', '실제품 재질 통합 무음 V2로 대체'], createdAt: '2026-08-06',
  },
  {
    id: 'TV-S01', scene: 'TV 01 · DECISION', title: '크림 앞에서 손이 멈추는 선택 순간', status: 'selected', model: 'Seedance 2.0 Standard · 1080p High Bitrate', duration: '4초', creditCost: '36 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/TV-S01-poster.jpg', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/TV-S01.mp4',
    summary: '토너 후 무지 크림 용기에 손을 뻗다가 멈추는 미세 연기로 문제를 행동으로 보여주는 첫 장면.', issues: ['성인 A 얼굴·닫힌 입 유지', '손·용기 물리 정상', '과장된 걱정 표정·패션 포즈 없음'], createdAt: '2026-08-06',
  },
  {
    id: 'TV-S02', scene: 'TV 02 · CHOICE', title: '아쿠아 로션으로 이동하는 시선', status: 'selected', model: 'Seedance 2.0 Standard · 1080p High Bitrate + 실제 제품 합성', duration: '4초', creditCost: '36 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/TV-S02-poster.jpg', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/TV-S02.mp4',
    summary: '같은 욕실에서 모델 시선이 왼쪽 화장대로 이동하며 실제 아쿠아 로션 선택으로 연결되는 장면.', issues: ['생성 무지 용기는 최종본에서 제거', '실제 제품은 후반 합성', '손이 제품 합성 영역을 가리지 않음'], createdAt: '2026-08-06',
  },
  {
    id: 'TV-S03A', scene: 'TV 03A · APPLY', title: '흰 제형 스머어 실패본', status: 'rejected', model: 'Seedance 2.0 Standard · 1080p High Bitrate', duration: '4초', creditCost: '36 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/TV-S03A-poster.jpg', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/TV-S03A.mp4',
    summary: '얼굴과 손은 안정적이지만 과도한 흰 로션이 볼에 줄무늬처럼 남아 실제 도포로 보이지 않아 탈락.', issues: ['제형 양 과다', '흰 줄무늬가 끝까지 잔존', '패팅 대신 스머어처럼 보여 TV 사실감 미달'], createdAt: '2026-08-06',
  },
  {
    id: 'TV-S03B', scene: 'TV 03B · APPLY', title: '투명 소량 두 번 패팅', status: 'selected', model: 'Seedance 2.0 Standard · 1080p High Bitrate', duration: '4초', creditCost: '36 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/TV-S03B-poster.jpg', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/TV-S03B.mp4',
    summary: '거의 보이지 않는 소량의 로션을 중지·약지로 한쪽 볼에 두 번 가볍게 눌러 흡수시키는 자연스러운 수정본.', issues: ['손가락·손목 구조 정상', '흰 제형 줄무늬 없음', '입 닫힘·자연스러운 거울 시선'], createdAt: '2026-08-06',
  },
  {
    id: 'TV-S04', scene: 'TV 04 · RESULT', title: '창가 빛으로 얼굴을 돌리는 결과', status: 'selected', model: 'Seedance 2.0 Standard · 1080p High Bitrate', duration: '4초', creditCost: '36 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/TV-S04-poster.jpg', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-tv-story/TV-S04.mp4',
    summary: '루틴 후 손을 내리고 창가 빛으로 얼굴을 천천히 돌리며 작은 만족감을 눈과 닫힌 입으로 표현.', issues: ['후반 닫힌 입 구간 사용', '과장된 광고 미소 없음', '피부결·헤어·광원 연속성 통과'], createdAt: '2026-08-06',
  },
  {
    id: 'A-PREMIUM-15S', scene: 'A 모델 15초', title: '욕실 × 블루글라스 전환형 광고', status: 'rejected',
    model: '실제 제품 PNG 고정 합성 + A 모델 컷 + 로컬 모션그래픽', duration: '15초', creditCost: '0 credits · 기존 자산 재편집',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-premium/poster.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-premium/aqua-lotion-model-a-premium-15s.mp4',
    summary: '제품 합성은 개선됐지만 사용자 목표인 TV 광고 수준의 행동 인과와 사실감에 미달해 새 서사형 광고로 대체.',
    issues: ['사용자 평가 기준: 해상도가 아니라 내용·연기·사실감 미달', '제품과 배우가 물리적으로 선택·사용되는 인과 부족', '블루글라스 별도 세계가 욕실 서사를 끊음', '새 Seedance Standard 서사형 광고로 대체'], createdAt: '2026-08-06',
  },
  {
    id: 'A-CUTS-PREVIEW', scene: 'A 모델 30초', title: 'A · 10컷 무음 콘티 프리뷰', status: 'rejected',
    model: 'Seedance 2.0 Fast + 실제 제품 PNG 모션', duration: '30초', creditCost: '조립 무료 · 생성 70 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S01-poster.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/aqua-model-a-10cut-silent-preview.mp4',
    summary: 'A 서윤아의 무언 욕실 연기 5컷과 실제 제품 픽셀 보존 모션 5컷을 콘티 순서대로 하드컷 조립한 무음 프리뷰.',
    issues: ['사용자 평가: 광고 같지 않고 중간 상품 이미지 품질이 낮음', '모델 포즈와 흰 배경 제품 줌의 인과관계 부족', '동일 3초 컷 반복으로 기계적 리듬', '새 15초 전환형 구조로 대체'], createdAt: '2026-08-06',
  },
  {
    id: 'A-S01', scene: 'S01 · HOOK', title: '거울 피부 확인', status: 'selected', model: 'Higgsfield MCP · Seedance 2.0 Fast', duration: '3초', creditCost: '14 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S01-poster.webp', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S01.mp4',
    summary: 'A 모델이 거울을 보며 피부 상태를 조용히 확인하는 무언 훅.', issues: ['얼굴·헤어·미니스커트 유지', '입 닫힘', '생성 텍스트·제품 없음'], createdAt: '2026-08-06',
  },
  {
    id: 'A-S02', scene: 'S02 · PROBLEM', title: '한 손 볼 터치', status: 'selected', model: 'Higgsfield MCP · Seedance 2.0 Fast', duration: '3초', creditCost: '14 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S02-poster.webp', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S02.mp4',
    summary: '거울을 보며 한쪽 볼을 한 번 가볍게 확인하는 자연스러운 생활 동작.', issues: ['한 손·손가락 구조 정상', '과장된 고민 표정 없음', '립싱크·자막 없음'], createdAt: '2026-08-06',
  },
  {
    id: 'A-S03', scene: 'S03 · BRIDGE', title: '실제품 펀치인', status: 'rejected', model: '실제 제품 PNG · 픽셀 보존 모션', duration: '3초', creditCost: '0 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S03-poster.webp', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S03.mp4',
    summary: '실제 원본 제품은 정확하지만 흰 배경·단순 펀치인으로 공간감이 없어 광고 컷으로 탈락.', issues: ['제품 정확성만 통과', '접촉 그림자·반사·환경 시차 없음', '상세페이지 PNG처럼 보임'], createdAt: '2026-08-06',
  },
  {
    id: 'A-S04', scene: 'S04 · SOLUTION', title: '실제품 미세 줌', status: 'rejected', model: '실제 제품 PNG · 픽셀 보존 모션', duration: '3초', creditCost: '0 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S04-poster.webp', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S04.mp4',
    summary: '실제 라벨은 유지했지만 동일한 흰 배경 제품을 다시 확대해 정보와 리듬 변화가 없어 탈락.', issues: ['단순 선형 줌', '제품과 모델의 공간 단절', 'S03과 화면 정보 중복'], createdAt: '2026-08-06',
  },
  {
    id: 'A-S05', scene: 'S05 · NAME', title: '빈 제품 자리 확인', status: 'selected', model: 'Higgsfield MCP · Seedance 2.0 Fast', duration: '3초', creditCost: '14 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S05-poster.webp', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S05.mp4',
    summary: 'A 모델이 양손을 카운터에 두고 실제 제품을 합성할 빈 공간을 바라본다.', issues: ['양손 구조 정상', '가짜 제품 생성 없음', '동일 욕실·의상 유지'], createdAt: '2026-08-06',
  },
  {
    id: 'A-S06', scene: 'S06 · FACT 01', title: '머리 귀 뒤로 넘김', status: 'selected', model: 'Higgsfield MCP · Seedance 2.0 Fast', duration: '3초', creditCost: '14 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S06-poster.webp', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S06.mp4',
    summary: '한 가닥 머리를 귀 뒤로 넘기며 거울로 루틴을 이어가는 짧은 생활 장면.', issues: ['한 행동만 수행', '얼굴·헤어 일관성 유지', '입 닫힘·자막 없음'], createdAt: '2026-08-06',
  },
  {
    id: 'A-S07', scene: 'S07 · FACT 02', title: '실제품 펌프 매크로', status: 'rejected', model: '실제 사용자 촬영·팩샷 픽셀 보존 모션', duration: '3초', creditCost: '0 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S07-poster.webp', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S07.mp4',
    summary: '실제 흰 펌프 원본이지만 평면 이미지를 과도하게 확대해 재질과 공간감이 사라져 탈락.', issues: ['실제 펌핑·토출 증거 없음', '평면 PNG 매크로', '배경·조명 상호작용 없음'], createdAt: '2026-08-06',
  },
  {
    id: 'A-S08', scene: 'S08 · ROUTINE', title: '300ml 라벨 확대', status: 'rejected', model: '실제 제품 PNG · 픽셀 보존 모션', duration: '3초', creditCost: '0 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S08-poster.webp', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S08.mp4',
    summary: '라벨·300ml 표기는 정확하지만 흰 배경 초근접 확대가 상세페이지 이미지처럼 보여 탈락.', issues: ['라벨 정확성만 통과', '제품 외곽 명도 분리 부족', 'S07과 시각 정보 중복'], createdAt: '2026-08-06',
  },
  {
    id: 'A-S09', scene: 'S09 · RESULT', title: '양손 볼 감싸기', status: 'selected', model: 'Higgsfield MCP · Seedance 2.0 Fast', duration: '3초', creditCost: '14 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S09-poster.webp', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S09.mp4',
    summary: '양손을 볼 옆에 가볍게 대고 닫힌 입으로 작은 만족 미소를 보이는 결과 장면.', issues: ['정확히 두 손', '손가락·얼굴 가림 없음', '입 닫힘·립싱크 없음'], createdAt: '2026-08-06',
  },
  {
    id: 'A-S10', scene: 'S10 · CTA', title: '실제품 CTA 여백', status: 'rejected', model: '실제 제품 PNG · 픽셀 보존 모션', duration: '3초', creditCost: '0 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S10-poster.webp', videoSrc: '/marketing/aqua-lotion-video-studio/revisions/model-a-cuts/S10.mp4',
    summary: 'CTA 여백은 확보했지만 앞선 제품 컷과 같은 흰 배경·정면 PNG라 구매 엔드컷의 긴장감이 없어 탈락.', issues: ['손·모델과 함께 있지 않음', '접지·반사·랙포커스 없음', '새 블루글라스 히어로로 대체'], createdAt: '2026-08-06',
  },
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
    issues: ['흰 펌프는 실제 사용자 촬영 원본과 일치', '실제 라벨 문구·레이아웃 불일치', '반투명 300ml 병 비율이 달라짐', '손 도포는 자연스럽지만 제품 증거로는 사용 불가'],
    createdAt: '2026-08-01',
  },
  {
    id: 'SITE-KF-01', scene: '웹사이트 키프레임', title: 'Nano Banana Pro · 2레퍼런스 펌핑 직전', status: 'review',
    model: 'Higgsfield 사이트 · Nano Banana Pro', creditCost: '4 credits · 2회',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/site/pump-keyframe-01.webp',
    summary: '사이트에서 모델 D와 실제 제품 팩샷을 직접 넣어 만든 펌핑 직전 키프레임. 기존 통합 키프레임보다 흰 펌프·손·제품 비율이 안정적이다.',
    issues: ['AQUA LOTION 큰 라벨은 유지', '상단 라벨 일부가 손에 가려짐', '영상에서 실제 펌프 눌림과 토출을 별도 검증해야 함', '첫 사이트 제출 오류·중복 재시도로 이미지 2회 차감'],
    createdAt: '2026-08-01',
  },
  {
    id: 'SITE-PUMP-01', scene: '웹사이트 펌핑', title: 'Kling 3.0 Turbo · 펌핑 테스트 01', status: 'rejected',
    model: 'Higgsfield 사이트 · Kling 3.0 Turbo', duration: '5초 · 1080p', creditCost: '10 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/site/pump-keyframe-01.webp',
    videoSrc: '/marketing/aqua-lotion-video-studio/revisions/v2/site/pump-kling-01.mp4',
    summary: '제품·모델·흰 펌프는 유지됐지만 펌프 이동이 작고 로션이 토출되기보다 손바닥에 나타나는 느낌이라 증거 장면으로 탈락.',
    issues: ['펌프의 완전 눌림·복귀가 명확하지 않음', '약 2.25초에 로션이 갑자기 나타남', '허리 위 구도라 핵심 동작이 작음', '라벨과 병은 기존 MCP 영상보다 안정적'],
    createdAt: '2026-08-01',
  },
  {
    id: 'SITE-KF-MACRO', scene: '웹사이트 키프레임', title: 'Nano Banana Pro · 손·펌프 매크로', status: 'rejected',
    model: 'Higgsfield 사이트 · Nano Banana Pro', creditCost: '2 credits',
    poster: '/marketing/aqua-lotion-video-studio/revisions/v2/site/pump-macro-keyframe-rejected.webp',
    summary: '펌프와 양손을 크게 잡는 구도는 좋아졌지만 제품 라벨에 존재하지 않는 영문이 생성되어 영상 입력에서 제외.',
    issues: ['가짜 영문 라벨 생성', '반투명 병이 불투명하게 변형', '흰 펌프와 손 구조는 개선', 'SKU 신뢰 장면으로 사용 불가'],
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
