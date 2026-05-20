# 유어스킨플러스 브랜드 로고 방향 정리

확인일: 2026-05-19

## 목적

유어스킨플러스 제품을 단순 저가 화장품이 아니라 자연 성분 기반의 프리미엄 클린 뷰티 브랜드로 보이게 만드는 로고 방향을 정리한다. 현재 단계의 산출물은 웹과 내부 검토에 바로 사용할 수 있는 SVG 벡터 자산이며, 인쇄용 최종 CI 원본은 선택 폰트 확정 후 문자 아웃라인 변환과 최소 크기 테스트를 거쳐 마감한다.

## 핵심 방향

- 브랜드명: `YOURSKIN PLUS`
- 인상: 자연 성분, 신선한 추출, 순한 사용감, 건강한 피부 장벽, 신뢰감 있는 한국형 프리미엄 코스메틱
- 디자인 톤: 절제된 서울 뷰티 감성, 스칸디나비아식 여백, 세리프 워드마크 중심의 차분한 프리미엄
- 심볼: YSP 원형 실, 이슬방울 외곽, 한 장의 잎, 얇은 잎맥, 작은 플러스 포인트로 압축
- 배제할 것: 장식적인 잎사귀, 스파 로고처럼 보이는 곡선, 과한 금색, 저가형 뷰티 로고, 만화적 표현

## 추천 콘셉트

Open Design MCP에서 확인한 방향을 바탕으로 다시 설계한 5개 SVG 중 `Signature Wordmark`를 1순위, `YSP Botanical Seal`을 2순위로 잡는다.

이유:
- `Signature Wordmark`는 브랜드명이 가장 또렷하게 읽혀 자사몰 헤더, 쿠팡 대표 이미지, 박스 전면에 바로 쓰기 좋다.
- 40대 이상 고객에게 얇은 산세리프보다 세리프 워드마크가 더 차분하고 고급스러운 신뢰감을 줄 수 있다.
- `YSP Botanical Seal`은 캡 상단, 봉인 스티커, 금박 엠보싱 같은 패키지 포인트 자산으로 확장하기 좋다.
- 드롭, 잎, 플러스 심볼은 보조 배지나 제품 라인별 마크에서만 절제해 사용하는 편이 고급감 유지에 유리하다.

## 로고 구조

| 요소 | 방향 |
| --- | --- |
| 워드마크 | 세리프 기반의 `YOURSKIN`과 작은 `PLUS` 보조 워드마크를 사용 |
| 심볼 | YSP 원형 실을 기본 심볼로 두고, 드롭과 잎은 보습/천연 라인에서만 보조 사용 |
| 플러스 | 의료/기능성처럼 강하게 쓰지 않고 작은 골드 포인트로 절제 |
| 기본 조합 | 가로형 워드마크 중심. 웹 헤더와 상세 첫 화면에 우선 적용 |
| 보조 조합 | 심볼 단독, 흑백 버전, 패키지용 라벨 락업 |

## 컬러 팔레트

| 이름 | HEX | 용도 |
| --- | --- | --- |
| Deep Forest | `#143D2E` | 로고 메인, 헤드라인, 패키지 딥그린 |
| Sage Vein | `#8AA38F` | 심볼 잎, 보조 면, 자연 성분 포인트 |
| Warm Ivory | `#F8F1E7` | 배경, 박스, 상세 페이지 기본 톤 |
| Soft Beige | `#D9D1BE` | 서브 배경, 제품 정보 영역 |
| Champagne Gold | `#C7A670` | 작은 플러스, 얇은 라인, 프리미엄 포인트 |
| Clean Charcoal | `#171B18` | 흑백 로고, 본문 텍스트 |

## 생성 시안 리뷰

| 파일 | 방향 | 평가 |
| --- | --- | --- |
| `public/brand/logo-concepts/01-botanical-dew-seal.png` | 드롭, 잎맥, 순환선이 명확한 프리미엄 보드 | 실제 로고로는 요소가 많아 제외 |
| `public/brand/logo-concepts/02-calm-leaf-drop.png` | 더 단순한 잎과 드롭, 플러스 포인트가 분명한 방향 | 1순위. 작은 라벨에서 읽히기 좋음 |
| `public/brand/logo-concepts/03-seoul-barrier-flow.png` | 피부 장벽 곡선과 잎을 결합한 방향 | 감성은 좋지만 심볼이 다소 복잡해질 수 있어 보조 후보 |
| `public/brand/logo-concepts/04-minimal-circulation.png` | 순환선과 잎을 가장 절제한 방향 | 미니멀 패키지에 적합. 다만 차별 포인트가 약해질 수 있음 |

생성형 이미지 보드는 이전 참고 시안으로 보관하되, 현재 웹 페이지의 우선 검토 대상에서는 제외한다. 패키지 목업의 문자와 세부 로고는 왜곡될 수 있으므로 현재 우선 검토 대상은 재설계한 실사용 SVG 5종으로 전환한다.

## 재설계한 실사용 SVG 로고 시안

2026-05-18에 `open-design` MCP로 활성 Open Design 보드 `Live artifact · 5/18/2026`의 로고 방향을 확인했다. 2026-05-19에는 해당 방향을 바탕으로 실제 웹과 패키지 검토에 사용할 수 있도록 SVG 자산을 다시 설계했다. 콘셉트는 40대 이상 남녀를 타깃으로 한 고급 천연화장품이며, 포슬린 아이보리, 딥 그린 블랙, 절제된 샴페인 골드, 세리프 워드마크를 핵심 톤으로 둔다.

| 파일 | 방향 | 마케팅 용도 |
| --- | --- | --- |
| `public/brand/open-design-concepts/01-pure-serif-wordmark.svg` | `Signature Wordmark`: 브랜드명이 가장 또렷하게 읽히는 세리프 워드마크 | 프리미엄 라인 전체, 웹사이트 헤더, 박스 전면 |
| `public/brand/open-design-concepts/02-ysp-monogram-seal.svg` | `YSP Botanical Seal`: YSP를 원형 실 안에 정리한 패키지 심볼 | 뚜껑, 봉인 스티커, 금박 엠보싱, 고급 세트 |
| `public/brand/open-design-concepts/03-botanical-cut.svg` | `Botanical Cut Wordmark`: 식물 잎을 커팅 형태로 절제해 표현 | 천연 성분 라인, 상세페이지 섹션 로고 |
| `public/brand/open-design-concepts/04-skin-dew-mark.svg` | `Skin Dew Lockup`: 물방울 실루엣으로 보습과 광채를 강조 | 세럼, 크림, 보습 라인 |
| `public/brand/open-design-concepts/05-apothecary-label.svg` | 고급 약국형 라벨 구조 | 박스 라벨, 세트 구성, 상세페이지 키비주얼 |

현재 우선 검토 후보는 `Signature Wordmark`와 `YSP Botanical Seal`이다. 전자는 자사몰과 상세페이지에서 가장 안정적으로 읽히고, 후자는 패키지 봉인/캡/금박 포인트 같은 고급 브랜드 자산으로 확장하기 좋다.

## 웹 적용 자산

- 로고 방향성 페이지: `/brand-logo/`
- 컬러 메인 로고 SVG: `public/brand/yourskin-plus-logo-primary.svg`
- 흑백 메인 로고 SVG: `public/brand/yourskin-plus-logo-mono.svg`
- YSP 심볼 단독 SVG: `public/brand/yourskin-plus-symbol.svg`
- 생성 보드 이미지: `public/brand/logo-concepts/` 이전 로고 후보 시안. 현재는 보조 참고 자료로만 사용
- 재설계한 40대 이상 프리미엄 타깃 SVG 시안: `public/brand/open-design-concepts/`

## 사용 가이드

- 상세 페이지 첫 화면에서는 컬러 로고보다 심볼 단독을 작게 쓰고, 제품명과 효능 근거를 더 크게 둔다.
- 자사몰 헤더에서는 워드마크 중심, 패키지 전면에서는 심볼 중심으로 쓰는 것이 좋다.
- 골드는 5% 이하로 제한하고, 딥그린과 아이보리를 기본 조합으로 둔다.
- 기능성/의료 느낌이 과해지지 않게 하려면 플러스를 크게 키우지 말고, 신뢰 배지나 성분 섹션에서 보조적으로 사용한다.

## 다음 작업

1. `Signature Wordmark`와 `YSP Botanical Seal` 중 최종 메인/보조 역할을 확정한다.
2. 24px, 48px, 96px 작은 크기에서 식별성을 테스트한다.
3. 선택 폰트를 확정하고 인쇄용 원본에서는 문자를 아웃라인으로 변환한다.
4. 쿠팡 상세 첫 화면, 네이버 대표 이미지, 자사몰 헤더에서 각각 적용 샘플을 만든다.
5. 패키지에는 로고보다 제품명과 용량 정보가 먼저 읽히도록 계층을 조정한다.
