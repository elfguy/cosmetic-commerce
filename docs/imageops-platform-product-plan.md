# ImageOps 플랫폼 기획·아키텍처 초안

작성일: 2026-06-25 KST  
대상: 쿠팡/네이버 쇼핑용 AI 상품 이미지 제작·수정·검수·버전관리 SaaS  
초기 범위: 쿠팡 메인이미지/상세이미지 제작·수정 플랫폼  
검토 방식: 아키텍처 / 수익화·과금 / 마켓플레이스·AI Provider 확장성 관점의 병렬 에이전트 리뷰 반영

---

## 1. 한 줄 정의

**ImageOps**는 쿠팡 상품 데이터를 가져와서 메인이미지와 상세이미지를 AI로 생성·수정·검수하고, 사용자 요청 원문·LLM 가공 프롬프트·AI API payload·결과 이미지·승인/반려/업로드 이력을 모두 버전 관리하는 이커머스 이미지 운영 플랫폼이다.

초기에는 쿠팡 이미지 제작/수정에 집중하고, 이후 네이버 쇼핑, 스마트스토어, 11번가, 자사몰, 글로벌 마켓플레이스로 확장한다.

---

## 2. 핵심 목표

1. **빠른 개발**
   - 최신 SaaS 스택으로 MVP를 빠르게 만든다.
   - 초기에는 Modular Monolith 구조로 개발 속도를 확보한다.
   - 이미지 생성/수정처럼 오래 걸리는 작업은 처음부터 Worker/Queue로 분리한다.

2. **빠른 성능**
   - UI는 즉시 반응하고, 무거운 AI 작업은 비동기로 처리한다.
   - 이미지 파일은 Object Storage + CDN으로 제공한다.
   - 썸네일, WebP 변환, 리사이즈, 캐싱을 기본 지원한다.

3. **쉬운 기능 추가**
   - AI Provider Adapter 구조로 Kie.ai보다 저렴한 Provider를 쉽게 교체/추가한다.
   - Marketplace Adapter 구조로 쿠팡 이후 네이버 쇼핑 등을 쉽게 추가한다.
   - Prompt Template, Validation Rule, Preview Renderer도 플러그인처럼 추가 가능하게 설계한다.

4. **정확한 비용/사용량 추적**
   - 사용자/워크스페이스/프로젝트/Job 단위로 토큰, 이미지 생성 비용, 크레딧 차감을 기록한다.
   - LLM 비용과 이미지 Provider 비용을 분리해 원가/마진을 계산한다.

5. **운영 안정성**
   - 모든 이미지와 상품 데이터는 버전 관리한다.
   - 쿠팡 업로드 전 rollback snapshot을 저장한다.
   - 모든 주요 액션은 Audit/Event Log로 남긴다.

---

## 3. 주요 사용자 시나리오

### 3.1 쿠팡 상품 가져오기

1. 사용자가 쿠팡 상품 ID 또는 판매자 상품 목록에서 상품을 선택한다.
2. Coupang OpenAPI로 상품 데이터를 가져온다.
3. 플랫폼 내부 표준 상품 모델로 변환한다.
4. 원본 메인이미지/상세이미지를 다운로드해 `original` 버전으로 저장한다.
5. 상품별 이미지 작업 프로젝트가 생성된다.

저장 대상:

- 상품명
- 브랜드/제조사
- 옵션/아이템 정보
- 판매자 상품 ID / 상품 ID / vendor item ID
- 대표이미지
- 상세이미지
- 고시정보
- 카테고리
- 쿠팡 원본 raw JSON

---

### 3.2 이미지 한 장 수정

사용자 입력:

```text
제품은 그대로 두고 배경을 더 프리미엄하게 만들어줘.
문구는 줄이고 신선제조 느낌을 강조해줘.
```

처리 흐름:

```text
사용자 요청 원문 저장
→ GPT가 이미지 API용 프롬프트로 가공
→ 브랜드/상품/마켓플레이스 규칙 적용
→ Kie.ai 또는 선택된 Image Provider payload 생성
→ 비동기 Job 등록
→ 결과 이미지 저장
→ 사용자 검토
→ 승인/반려/재수정
```

반드시 저장할 것:

- 사용자 요청 원문
- LLM system prompt
- Prompt Template 버전
- LLM이 가공한 프롬프트
- 최종 negative prompt
- 최종 Provider API payload
- Provider raw response
- 사용 모델
- 입력/출력 토큰
- Provider 원가
- 사용자에게 차감한 크레딧
- 결과 이미지 파일
- 승인/반려 사유

---

### 3.3 이미지 세트 관리

상품별로 다음 단위로 관리한다.

```text
상품
 ├─ 메인이미지 세트
 │   ├─ 01 original / v1 / v2 / approved
 │   ├─ 02 original / v1 / v2 / approved
 │   └─ ...
 └─ 상세이미지 세트
     ├─ 01 original / v1 / v2 / approved
     ├─ 02 original / v1 / v2 / approved
     └─ ...
```

각 이미지는 독립적으로 수정 가능해야 한다.

예:

- 대표 01만 수정
- 상세 03만 재생성
- 상세 14 법정표시는 원본 유지
- 상세 05는 제품 없이 정보 카드로 변경
- V1 전체 세트에서 07번만 V2 후보로 교체

---

### 3.4 미리보기와 검수

초기 MVP부터 필요한 화면:

- 원본 / V1 / V2 비교
- 메인이미지 6장 비교
- 상세이미지 전체 흐름 비교
- 모바일 쿠팡 상세페이지 미리보기
- 이미지별 승인/반려
- 검수 코멘트
- 위험 문구/금지 문구 경고
- 이미지 사이즈/비율/용량 검증

추후:

- 쿠팡 실제 PDP 스타일 미리보기
- 네이버 쇼핑 썸네일/상세 미리보기
- A/B 후보 비교
- 상품별 작업 진행률

---

## 4. 추천 기술 스택

### 4.1 MVP 추천 스택

| 영역 | 추천 기술 | 이유 |
|---|---|---|
| Frontend | Next.js 15+, React, TypeScript | SaaS 대시보드/서버 액션/API 개발 속도 빠름 |
| UI | Tailwind CSS, shadcn/ui | 빠른 UI 개발, 일관된 컴포넌트 |
| Server | Next.js API Routes 또는 Server Actions | 초기 개발 속도 우선 |
| Worker | BullMQ + Redis | 이미지 생성/후처리/업로드 비동기 처리 |
| DB | PostgreSQL | SaaS, 버전, 이력, 과금 데이터에 적합 |
| ORM | Prisma 또는 Drizzle | TypeScript 기반 빠른 개발 |
| Auth | Clerk 또는 Auth.js | 빠른 인증/조직/권한 구현 |
| Storage | Cloudflare R2 또는 AWS S3 | 이미지 파일 대량 저장/저비용/CDN 연동 |
| CDN | Cloudflare CDN 또는 CloudFront | 빠른 이미지 제공 |
| Image Processing | Sharp | 리사이즈, WebP, 썸네일, 메타데이터 제거 |
| Payment | Stripe, 추후 Toss/PortOne | 글로벌/국내 과금 확장 |
| Monitoring | Sentry, PostHog | 에러/제품 분석 |
| Deployment | Vercel + Railway/Fly.io Worker | 빠른 배포와 분리된 Worker 운영 |

### 4.2 성장 단계 스택

- API/Worker: NestJS 또는 Fastify로 분리
- Infra: AWS ECS Fargate 또는 Kubernetes
- DB: AWS RDS PostgreSQL
- Redis: ElastiCache
- Storage: S3 + CloudFront
- Observability: OpenTelemetry + Grafana/Datadog
- IaC: Terraform 또는 Pulumi

---

## 5. 전체 아키텍처

```text
[Next.js Web App]
  ├─ Dashboard
  ├─ Product Import UI
  ├─ Image Workspace
  ├─ Prompt/History UI
  ├─ Preview/Review UI
  └─ Billing/Admin UI

[API Layer]
  ├─ Auth & Workspace Service
  ├─ Product Service
  ├─ Asset Service
  ├─ Prompt Orchestration Service
  ├─ AI Provider Router
  ├─ Marketplace Service
  ├─ Workflow Service
  ├─ Billing/Metering Service
  └─ Audit Log Service

[Worker Layer]
  ├─ prompt.queue
  ├─ image-generation.queue
  ├─ image-edit.queue
  ├─ asset-processing.queue
  ├─ marketplace-import.queue
  ├─ marketplace-publish.queue
  └─ billing-metering.queue

[External Services]
  ├─ OpenAI GPT 기본 LLM
  ├─ Kie.ai 초기 Image Provider
  ├─ 대체 Image Provider: Fal / Replicate / OpenAI Images / Stability / 자체 ComfyUI 등
  ├─ Coupang OpenAPI
  ├─ Naver Shopping API
  ├─ R2/S3 Storage
  ├─ Redis
  └─ Stripe/Toss/PortOne

[Data Layer]
  ├─ PostgreSQL
  ├─ Redis
  └─ Object Storage
```

---

## 6. 모듈 설계

## 6.1 Auth & Workspace Module

기능:

- 회원가입/로그인
- 워크스페이스/조직 관리
- 멤버 초대
- 역할/권한 관리
- 플랜/구독 연결
- API Key 관리
- Audit Log

권한 예시:

| Role | 권한 |
|---|---|
| Owner | 결제, 멤버, 모든 프로젝트 관리 |
| Admin | 멤버/프로젝트 관리 |
| Manager | 프로젝트 생성, 사용량 조회 |
| Creator | 이미지 생성/수정 |
| Viewer | 조회만 가능 |

---

## 6.2 Product & Marketplace Module

역할:

- 외부 마켓 상품 데이터를 가져온다.
- 내부 표준 Product 모델로 변환한다.
- 외부 ID와 내부 ID를 매핑한다.

초기:

- Coupang Adapter

추후:

- Naver Shopping Adapter
- SmartStore Adapter
- 11번가 Adapter
- Shopify/Amazon Adapter

Marketplace Adapter 인터페이스 예시:

```ts
interface MarketplaceAdapter {
  id: string; // coupang, naver-shopping
  fetchProduct(input: FetchProductInput): Promise<MarketplaceProduct>;
  mapToInternalProduct(product: MarketplaceProduct): Promise<InternalProduct>;
  validatePublishDraft(draft: PublishDraft): Promise<ValidationResult>;
  renderPreview(input: PreviewInput): Promise<MarketplacePreview>;
  publishAssets(input: PublishAssetsInput): Promise<PublishResult>;
  rollbackPublish(input: RollbackPublishInput): Promise<RollbackResult>;
  getPublishStatus(input: PublishStatusInput): Promise<PublishStatus>;
}
```

핵심 원칙:

- Coupang 전용 필드를 core model에 직접 넣지 않는다.
- marketplace별 raw 데이터는 JSONB metadata로 보관한다.
- 외부 API 실패 코드는 내부 표준 에러 코드로 변환한다.

---

## 6.3 Asset Management Module

역할:

- 원본 이미지, 생성 이미지, 편집 이미지, 썸네일, 마스크, 캔버스 JSON 관리
- 파일 해시 기반 중복 제거
- 이미지 리사이즈/포맷 변환
- CDN URL 관리
- Presigned upload/download

Storage path 예시:

```text
/orgs/{orgId}/products/{productId}/original/{assetId}.png
/orgs/{orgId}/projects/{projectId}/versions/{versionId}/output.png
/orgs/{orgId}/jobs/{jobId}/provider-response.json
```

처리:

- PNG/JPEG/WebP 변환
- 썸네일 생성
- EXIF 제거
- 색공간 정규화
- 해상도/비율 검증
- 파일 용량 최적화

---

## 6.4 Image Project & Version Module

핵심 개념:

- Product
- ImageSet
- ImageSlot
- Asset
- AssetVersion
- ProjectVersion
- CanvasDocument

버전 관리 원칙:

- 원본은 절대 덮어쓰지 않는다.
- 생성/수정 결과는 항상 새 AssetVersion으로 저장한다.
- 승인본은 특정 version을 가리키는 pointer로 관리한다.
- 되돌리기/복제/비교가 가능해야 한다.

AssetVersion 예시:

```ts
type AssetVersion = {
  id: string;
  assetId: string;
  storageUrl: string;
  checksum: string;
  width: number;
  height: number;
  format: string;
  source: 'original' | 'ai_generated' | 'ai_edited' | 'uploaded' | 'manual_edit';
  providerId?: string;
  promptSessionId?: string;
  parentVersionId?: string;
  createdBy: string;
  createdAt: Date;
};
```

---

## 6.5 Prompt Orchestration Module

역할:

- 사용자 요청을 LLM으로 이미지 Provider용 프롬프트로 변환한다.
- 상품/브랜드/마켓플레이스 규칙을 적용한다.
- Prompt Template 버전을 관리한다.
- 결과 프롬프트와 API payload를 모두 저장한다.

처리 흐름:

```text
User Prompt
→ Product Context 결합
→ Brand Rule 적용
→ Marketplace Rule 적용
→ Prompt Template 적용
→ GPT로 이미지 API prompt 생성
→ Safety/Compliance 검사
→ Provider Payload 생성
→ Job Queue 등록
```

저장해야 할 로그:

- user raw prompt
- normalized prompt
- system prompt
- template ID/version
- product context snapshot
- LLM processed prompt
- negative prompt
- provider payload
- provider response
- token usage
- latency
- cost

---

## 6.6 LLM Provider Module

기본 LLM은 GPT를 사용하되, Provider Adapter로 분리한다.

```ts
interface LLMProvider {
  id: string;
  generateText(input: LLMRequest): Promise<LLMResponse>;
  countTokens(input: LLMRequest): Promise<TokenUsage>;
  estimateCost(usage: TokenUsage): Money;
}
```

지원 후보:

- OpenAI GPT
- Anthropic Claude
- Google Gemini
- DeepSeek
- Groq
- Together AI
- Local LLM via Ollama/vLLM

---

## 6.7 Image Provider Module

초기 Provider는 Kie.ai를 사용한다. 단, 비즈니스 로직에서 Kie SDK/API를 직접 호출하지 않는다.

```ts
interface ImageProvider {
  id: string;
  capabilities(): ProviderCapabilities;
  estimateCost(input: ImageGenerationRequest): Promise<Money>;
  generate(input: ImageGenerationRequest): Promise<ImageGenerationResult>;
  edit(input: ImageEditRequest): Promise<ImageEditResult>;
  upscale?(input: UpscaleRequest): Promise<UpscaleResult>;
  removeBackground?(input: RemoveBgRequest): Promise<RemoveBgResult>;
  getJobStatus(providerJobId: string): Promise<ImageJobStatus>;
  cancelJob?(providerJobId: string): Promise<void>;
}
```

ProviderCapabilities 예시:

```ts
type ProviderCapabilities = {
  textToImage: boolean;
  imageToImage: boolean;
  inpainting: boolean;
  productPreservation: boolean;
  koreanTextQuality: 'low' | 'medium' | 'high';
  transparentBackground: boolean;
  maxResolution: string;
  pricingModel: 'per_image' | 'per_token' | 'per_second';
};
```

대체 Provider 후보:

- Fal.ai
- Replicate
- OpenAI Images
- Stability AI
- Ideogram
- Leonardo
- ComfyUI self-hosted
- RunPod 기반 자체 모델
- 추후 중국/한국 저가 Provider

Provider Router 기능:

- 가격 기반 선택
- 품질 기반 선택
- 사용자가 지정한 Provider 우선
- 실패 시 fallback
- 조직별 허용 Provider 제한
- 모델별 latency/success rate 기록
- A/B 테스트

---

## 6.8 Workflow & Job Module

이미지 생성/수정/검수/게시를 상태 머신으로 관리한다.

상태 예시:

```text
imported
→ draft_created
→ prompt_processing
→ ai_generation_queued
→ ai_generation_processing
→ ai_generation_completed
→ user_reviewing
→ approved
→ preview_generated
→ validation_passed
→ publish_requested
→ published
```

실패/복구 상태:

```text
ai_generation_failed
validation_failed
publish_failed
rollback_requested
rolled_back
cancelled
```

Job Queue 예시:

```text
prompt.queue
image-generation.queue
image-edit.queue
asset-processing.queue
marketplace-import.queue
marketplace-publish.queue
billing-metering.queue
```

원칙:

- 이미지 생성은 동기 HTTP 요청에서 직접 처리하지 않는다.
- Job은 retry, timeout, cancellation을 지원한다.
- idempotency key로 중복 과금을 방지한다.
- JobAttempt를 기록해 실패 원인을 추적한다.

---

## 6.9 Usage & Cost Tracking Module

필수 요구사항:

- 사용자별 토큰 사용량
- 사용자별 이미지 생성 비용
- 워크스페이스별 월 사용량
- 프로젝트별 비용
- Provider별 원가
- 모델별 성공률/실패율
- 크레딧 차감/환급 이력

UsageEvent 예시:

```ts
type UsageEvent = {
  id: string;
  workspaceId: string;
  userId: string;
  projectId?: string;
  jobId?: string;
  provider: string;
  model: string;
  operation: 'llm_prompt' | 'image_generate' | 'image_edit' | 'upscale' | 'remove_bg';
  inputTokens?: number;
  outputTokens?: number;
  imageCount?: number;
  providerCostUsd: number;
  fxRateSnapshot: number;
  providerCostKrw: number;
  chargedCredits: number;
  status: 'reserved' | 'captured' | 'released' | 'refunded';
  createdAt: Date;
};
```

과금 원칙:

- 작업 시작 전 예상 크레딧 reserve
- 성공 시 capture
- Provider 오류 시 release/refund
- 부분 성공 시 부분 capture
- 모든 이벤트는 append-only ledger로 저장
- 잔액은 ledger 합산 또는 materialized balance로 관리

---

## 6.10 Billing & Monetization Module

초기 결제:

- Stripe

국내 결제 확장:

- Toss Payments
- PortOne
- 세금계산서/사업자 정보 지원

주요 테이블:

- plans
- subscriptions
- credit_wallets
- credit_transactions
- invoices
- payments
- refunds
- model_pricing
- provider_costs

---

## 6.11 Audit/Event Log Module

모든 주요 액션은 append-only event로 저장한다.

AuditEvent 예시:

```ts
type AuditEvent = {
  id: string;
  workspaceId: string;
  actorType: 'user' | 'system' | 'ai_provider' | 'marketplace';
  actorId?: string;
  eventType: string;
  productId?: string;
  assetId?: string;
  workflowRunId?: string;
  previousState?: unknown;
  nextState?: unknown;
  payload: Record<string, unknown>;
  createdAt: Date;
};
```

기록 이벤트:

- 상품 import
- 원본 이미지 저장
- 사용자 프롬프트 입력
- LLM 프롬프트 가공
- AI Provider 선택
- 이미지 생성 요청
- 이미지 생성 성공/실패
- 사용량/비용 차감
- 이미지 승인/반려
- 미리보기 생성
- 검수 실패/통과
- 쿠팡 업로드 요청
- 쿠팡 업로드 성공/실패
- 롤백 요청/성공/실패

---

## 7. 데이터베이스 초안

### 7.1 SaaS Core

```text
users
workspaces
workspace_members
roles
api_keys
audit_events
```

### 7.2 Billing

```text
plans
subscriptions
credit_wallets
credit_transactions
usage_events
provider_costs
model_pricing
invoices
payments
refunds
```

### 7.3 Product / Marketplace

```text
products
product_variants
marketplace_accounts
marketplace_listings
marketplace_product_snapshots
marketplace_validation_results
publish_records
```

### 7.4 Asset / Image Project

```text
assets
asset_versions
image_projects
image_sets
image_slots
project_versions
canvas_documents
review_events
```

### 7.5 AI / Prompt / Job

```text
prompt_sessions
prompt_messages
llm_request_logs
image_request_logs
provider_payloads
provider_responses
generation_jobs
job_attempts
workflow_runs
workflow_steps
```

---

## 8. 파일/이미지 관리 전략

### 8.1 파일 분류

| 분류 | 설명 |
|---|---|
| original | 쿠팡/네이버에서 가져온 원본 |
| user_upload | 사용자가 업로드한 참조 이미지 |
| ai_generated | AI 생성 결과 |
| ai_edited | AI 수정 결과 |
| manual_edit | 캔버스/로컬 편집 결과 |
| approved | 사용자가 승인한 버전 pointer |
| published | 외부 마켓에 반영된 버전 |
| rejected | 반려된 후보 |

### 8.2 저장 원칙

- 원본은 절대 덮어쓰지 않는다.
- 새 결과는 항상 새 version으로 저장한다.
- 파일 hash를 저장해 중복을 줄인다.
- CDN URL과 storage key를 분리한다.
- 삭제는 soft delete를 기본으로 한다.
- 유료 고객 데이터 보존 정책을 플랜별로 둔다.

---

## 9. AI Provider 교체 전략

Kie.ai를 초기 Provider로 사용하지만, 다음 구조를 반드시 지킨다.

### 9.1 비즈니스 로직의 금지사항

- 특정 Provider SDK를 직접 호출하지 않는다.
- Kie payload 형태를 core DB schema로 고정하지 않는다.
- 가격표를 코드에 하드코딩하지 않는다.

### 9.2 Provider Router

```text
ImageGenerationRequest
→ ProviderRouter
→ CostOptimizer
→ CapabilityMatcher
→ ProviderAdapter
→ Result Normalizer
→ AssetVersion 저장
```

### 9.3 Router 정책 예시

| 목적 | Provider 선택 기준 |
|---|---|
| 빠른 시안 | 저비용/저지연 Provider |
| 제품 보존 중요 | productPreservation high Provider |
| 한글 텍스트 중요 | koreanTextQuality high Provider |
| 대량 생성 | 비용 최적화 Provider |
| 실패 복구 | fallback Provider |
| 프리미엄 고객 | 고품질 Provider 우선 |

---

## 10. 마켓플레이스 확장 전략

### 10.1 Coupang 우선 구현

초기 기능:

- 상품 데이터 import
- 원본 이미지 다운로드
- 메인/상세 이미지 작업
- 쿠팡 이미지 규격 검증
- 쿠팡 스타일 미리보기
- 승인본 upload payload 생성
- OpenAPI PUT 전 rollback snapshot 저장
- 업로드 후 상태 재조회

### 10.2 Naver Shopping 확장

Naver 추가 시 새로 구현할 것:

- Naver marketplace adapter
- Naver credential/account 연결
- Naver 상품 import mapping
- Naver image policy validator
- Naver preview renderer
- Naver publish adapter

Core 변경 없이 adapter/renderer/validator 추가로 확장하는 것이 목표다.

### 10.3 Preview Renderer

```ts
interface MarketplacePreviewRenderer {
  marketplaceId: string;
  renderProductPreview(input: RenderProductPreviewInput): Promise<RenderedPreview>;
  renderImageSlotPreview(input: RenderImageSlotPreviewInput): Promise<RenderedPreview>;
  validateVisualRules(input: VisualValidationInput): Promise<VisualValidationResult>;
}
```

미리보기 유형:

- 쿠팡 검색 썸네일
- 쿠팡 상품상세 모바일
- 쿠팡 상품상세 PC
- 네이버 쇼핑 검색 썸네일
- 스마트스토어 상세페이지

---

## 11. 검수/Validation 전략

Validation Rule은 마켓플레이스별로 분리한다.

```ts
interface ValidationRule {
  id: string;
  marketplaceId?: string;
  assetType?: 'main' | 'detail' | 'thumbnail';
  validate(input: ValidationInput): Promise<ValidationResult>;
}
```

검수 항목:

- 이미지 사이즈
- 비율
- 파일 용량
- 확장자
- 배경 정책
- 텍스트 포함 여부
- 금지 문구
- 과장 광고 표현
- 화장품 법정 표현 위험
- 상품명/용량/라벨 변형 가능성
- 전성분/고시정보 원본 보존 여부

ValidationIssue 예시:

```ts
type ValidationIssue = {
  severity: 'info' | 'warning' | 'error';
  code: string;
  message: string;
  blocking: boolean;
};
```

---

## 12. 유료화 전략

### 12.1 가격 정책 원칙

- 단순 이미지 장수 과금보다 **크레딧 기반 과금**이 적합하다.
- LLM, 이미지 생성, 편집, 업스케일, 배경 제거 등 작업별 원가가 다르기 때문이다.
- 사용자는 크레딧만 보고 쓰고, 내부적으로는 Provider 원가와 마진을 계산한다.

```text
사용자 차감 크레딧 = LLM 원가 + 이미지 Provider 원가 + 인프라 비용 + 마진 + 리스크 버퍼
```

### 12.2 플랜 초안

| 플랜 | 월 가격 | 포함 크레딧 | 대상 |
|---|---:|---:|---|
| Free | 0원 | 30 credits | 체험 |
| Starter | 29,000원 | 700 credits | 개인 셀러 |
| Pro | 89,000원 | 3,000 credits | 성장 셀러/브랜드 |
| Team | 299,000원 | 15,000 credits | 대행사/팀 |
| Enterprise | 별도 견적 | 맞춤 | 대형 고객 |

추가 크레딧:

| 크레딧 팩 | 가격 |
|---|---:|
| 1,000 credits | 19,000원 |
| 5,000 credits | 85,000원 |
| 20,000 credits | 300,000원 |
| 100,000 credits | 별도 견적 |

### 12.3 크레딧 차감 예시

| 작업 | 예상 크레딧 |
|---|---:|
| 상품 카피/프롬프트 생성 | 1~10 |
| 기본 이미지 생성 1장 | 20~50 |
| 고품질 이미지 생성 1장 | 80~200 |
| 이미지 편집/inpainting | 40~150 |
| 업스케일 | 20~80 |
| 배경 제거 | 5~30 |
| 상세페이지 이미지 세트 생성 | 300~1,500 |

### 12.4 원가/마진 관리

관리자 화면에서 다음을 볼 수 있어야 한다.

- provider별 원가
- 모델별 원가
- 사용자별 원가
- 워크스페이스별 원가
- 작업별 마진
- 무료 체험 원가
- 실패 작업 원가
- 월별 gross margin

권장 마진 목표:

- Starter: 50~65%
- Pro: 60~75%
- Team: 65~80%
- Enterprise: 계약별 조정

---

## 13. 무료 체험과 남용 방지

무료 체험은 이미지 API 원가가 발생하므로 강한 제한이 필요하다.

필수:

- 이메일 인증
- 휴대폰 인증 옵션
- 동일 IP 대량 가입 제한
- disposable email 차단
- 무료 플랜 일일 생성 제한
- 동시 Job 제한
- 고해상도 제한
- API 사용 제한
- 의심 계정 큐 우선순위 하향

선택:

- 무료 결과 워터마크
- 카드 등록형 trial
- 사업자 인증 후 추가 무료 크레딧

---

## 14. 관리자/운영 리포트

### 14.1 매출 리포트

- MRR / ARR
- 신규 구독
- 업그레이드/다운그레이드
- 해지
- 크레딧 팩 매출
- 환불
- VAT
- PG 수수료

### 14.2 사용량 리포트

- 이미지 생성 수
- 이미지 편집 수
- LLM 호출 수
- 토큰 사용량
- provider별 요청 수
- 모델별 성공률/실패율
- 평균 처리 시간
- 큐 대기 시간

### 14.3 비용/마진 리포트

- provider별 비용
- 모델별 비용
- workspace별 원가
- user별 원가
- job별 원가
- 무료 체험 원가
- gross margin
- 마진 낮은 작업 유형

---

## 15. 보안·시크릿·운영 안정성

### 15.1 시크릿 관리

마켓플레이스/AI Provider 연동은 고객별 API Key를 다루므로 처음부터 분리 저장한다.

필수 원칙:

- Coupang/Naver/OpenAI/Kie 등 외부 credential은 평문 저장 금지
- workspace별 credential 격리
- API Key 암호화 저장
- key rotation 지원
- 권한 있는 관리자만 연결/해제 가능
- 로그와 에러 메시지에 secret/token 출력 금지

추천:

- 초기: DB 암호화 컬럼 + 앱 레벨 encryption key
- 성장: AWS KMS / GCP KMS / Vault 사용
- provider credential 접근은 Worker에서만 허용

### 15.2 데이터 보존/삭제 정책

- 원본 상품 이미지와 생성 이미지는 플랜별 보존 기간을 둔다.
- 사용자가 프로젝트 삭제 시 soft delete 후 보존 기간 만료 시 hard delete한다.
- 결제/세금 관련 데이터는 법적 보존 기간을 따른다.
- 로그 내 개인정보/시크릿은 마스킹한다.
- Enterprise는 별도 보존/삭제 정책을 지원한다.

### 15.3 장애 대응

운영 도구로 다음이 필요하다.

- Queue backlog 모니터링
- Dead-letter queue
- 실패 Job 재시도
- Provider 장애 시 fallback 전환
- 크레딧 오차 수동 보정
- Publish 실패 rollback 도구
- Storage/CDN URL 재검증 도구
- 관리자용 Job timeline 조회

알림 기준:

- 특정 Provider 실패율 급증
- 평균 이미지 생성 시간 급증
- 무료 체험 비용 급증
- workspace별 비정상 사용량
- marketplace publish 실패율 급증

---

## 16. MVP 범위

### Phase 0 — 설계/기반

- Next.js 프로젝트 생성
- DB schema 1차
- Auth/Workspace
- Storage 연결
- Queue/Worker 연결
- Provider Adapter skeleton
- Marketplace Adapter skeleton

### Phase 1 — 이미지 제작 MVP

- 상품 수동 등록
- 원본 이미지 업로드
- 이미지 슬롯 관리
- 사용자 요청 입력
- GPT 프롬프트 가공
- Kie.ai 이미지 생성
- 결과 이미지 저장
- 원본/V1 비교
- 승인/반려
- Prompt/API/결과 히스토리 저장
- 사용자별 usage/cost 기록

### Phase 2 — 쿠팡 데이터 연동

- Coupang OpenAPI credential 연결
- 상품 목록/상품 상세 import
- 원본 메인/상세 이미지 다운로드
- 쿠팡 raw data snapshot 저장
- 쿠팡 이미지 규격 validation
- 쿠팡 미리보기 1차

### Phase 3 — 작업 품질/검수 강화

- 상품명/용량/라벨 변형 검수
- OCR 기반 한글 오타 검수
- 위험 문구/과장 표현 검수
- 법정표시/전성분 원본 유지 체크
- 이미지 세트 진행률
- 검수 코멘트/승인 워크플로우

### Phase 4 — 쿠팡 업로드

- 승인본 upload payload 생성
- rollback snapshot 저장
- Coupang OpenAPI PUT
- 업로드 상태 polling
- CDN URL 검증
- 실패 시 rollback

### Phase 5 — 확장

- Naver Shopping Adapter
- Naver Preview Renderer
- Provider Router 고도화
- 저가 Provider 추가
- 대량 생성
- 팀/클라이언트별 비용 정산
- 템플릿 마켓
- API 제공

---

## 17. 빠른 개발을 위한 추천 폴더 구조

```text
src/
  app/
  components/
  modules/
    auth/
    workspace/
    billing/
    product/
    marketplace/
      core/
      providers/
        coupang/
        naver-shopping/
    ai/
      llm/
        providers/
          openai/
          anthropic/
      image/
        providers/
          kie/
          fal/
          replicate/
      router/
    asset/
    image-project/
    prompt/
    workflow/
    audit/
  workers/
    queues/
    processors/
  lib/
  db/
    schema/
    migrations/
```

---

## 18. 핵심 화면 목록

### MVP 화면

1. 로그인/회원가입
2. 워크스페이스 선택
3. 상품 목록
4. 상품 상세
5. 이미지 작업 보드
6. 이미지 한 장 편집/생성 화면
7. 원본/V1 비교 화면
8. 작업 히스토리
9. 사용량/크레딧 화면
10. 관리자 Provider 비용 화면

### 이후 화면

1. 쿠팡 상품 import wizard
2. 쿠팡 미리보기
3. 네이버 쇼핑 미리보기
4. 대량 생성 작업 현황
5. 팀원별 비용 리포트
6. 클라이언트별 프로젝트 리포트
7. 템플릿/브랜드킷 관리

---

## 19. 중요한 설계 원칙 정리

1. **AI 호출은 전부 기록한다.**
2. **사용자 요청 원문과 LLM 가공 프롬프트를 모두 저장한다.**
3. **Provider payload/response는 raw JSONB로 보관한다.**
4. **이미지 원본은 절대 overwrite하지 않는다.**
5. **생성/수정 결과는 항상 새 version이다.**
6. **Kie.ai, OpenAI에 직접 종속되지 않는다.**
7. **Marketplace별 로직은 Adapter에 격리한다.**
8. **미리보기/검수/업로드도 Marketplace별 Renderer/Validator/Publisher로 분리한다.**
9. **비용/크레딧은 append-only ledger로 관리한다.**
10. **쿠팡 업로드 전 rollback snapshot은 필수다.**
11. **MVP는 빠르게 만들되, Adapter/Queue/Usage Ledger는 처음부터 넣는다.**
12. **Dynamic Plugin 시스템은 후순위지만, Registry/Interface는 초기에 잡는다.**

---

## 20. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| Provider 비용 급등 | model_pricing을 DB/관리자 설정으로 관리 |
| 무료 체험 남용 | 이메일/휴대폰/IP/일일 제한/워터마크 |
| Kie 품질/비용 문제 | Provider Router + fallback 구조 |
| Coupang 로직이 core에 섞임 | Marketplace Adapter 강제 |
| 네이버 추가 시 대규모 수정 | metadata namespace + renderer/validator 분리 |
| 이미지 업로드 실패로 상품 손상 | rollback snapshot + publish record |
| 토큰/비용 추적 누락 | UsageEvent append-only 강제 |
| 사용자 불만: 생성 실패에도 과금 | reserve/capture/release 구조 |
| 법정표시/전성분 오류 | 원본 보존 정책 + OCR/검수 rule |

---

## 21. 첫 구현 제안

가장 빠르게 검증하려면 아래 순서가 좋다.

1. Next.js + Postgres + Prisma + Auth + R2 연결
2. Workspace/User/Billing 기본 schema 생성
3. Product/ImageSlot/AssetVersion schema 생성
4. PromptSession + UsageEvent + Job schema 생성
5. OpenAI LLM Adapter 구현
6. Kie Image Provider Adapter 구현
7. BullMQ Worker로 이미지 생성 job 처리
8. 상품 수동 등록 + 이미지 업로드 UI
9. 이미지 한 장 생성/수정 UI
10. 원본/V1 비교 UI
11. 사용량/크레딧 차감 UI
12. Coupang Adapter 1차 import 추가

이 순서면 **플랫폼 구조를 해치지 않으면서도 빠르게 MVP를 만들 수 있다.**

---

## 22. 최종 결론

이 플랫폼은 단순 이미지 생성툴이 아니라 **이커머스 상품 이미지 운영 OS**로 설계해야 한다.

초기에는 쿠팡 메인이미지/상세이미지 제작·수정에 집중하되, 핵심 구조는 다음 4가지를 처음부터 분리한다.

1. **AI Provider Adapter** — Kie, 저가 Provider, 자체 모델 교체 가능
2. **Marketplace Adapter** — 쿠팡, 네이버, 스마트스토어 확장 가능
3. **Asset Versioning** — 이미지 원본/후보/승인/게시/롤백 관리
4. **Usage Ledger** — 사용자별 토큰/비용/크레딧/마진 추적

이 구조로 가면 개발은 빠르게 시작하면서도, 나중에 기능이 늘어날 때 갈아엎지 않고 계속 확장할 수 있다.
