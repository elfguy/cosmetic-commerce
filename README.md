# Cosmetic Commerce

화장품 제조/브랜드를 위한 **마케팅 + 쇼핑몰 + 콘텐츠 커머스** 프로젝트.

## 목표

- 소규모 화장품 제조업체가 직접 판매 가능한 브랜드형 쇼핑몰 구축
- 제품 상세페이지, 성분/효능 콘텐츠, 후기/Before-After, 이벤트 랜딩페이지를 빠르게 생성
- 광고/검색/인스타 유입을 구매 전환으로 연결
- 장기적으로 자동화 수익 또는 가족 사업 매출 증대에 기여

## 핵심 방향

- **브랜드 우선:** 단순 쇼핑몰보다 신뢰감 있는 브랜드/스토리/성분 콘텐츠 강화
- **콘텐츠 커머스:** 피부 고민별 콘텐츠 → 제품 추천 → 구매 전환
- **MVP 우선:** 결제/배송 전체 자동화보다 랜딩+문의/주문 흐름부터 빠르게 검증

## Tech Stack 후보

- Astro 5 + React Islands
- Tailwind CSS
- Supabase: 제품/주문/리드/리뷰 데이터
- Cloudflare Pages
- 결제: 초기 Toss Payments 또는 스마트스토어/카카오 채널 연동 검토

## 로컬 실행

```bash
cd ~/alba/cosmetic-commerce
npm install
npm run dev
```

## GitHub

- Repository: https://github.com/elfguy/cosmetic-commerce
- Owner: `elfguy`
- Visibility: `PRIVATE`
- Local remote: `origin` → `git@github.com:elfguy/cosmetic-commerce.git`

Remote 연결 시:

```bash
git remote add origin git@github.com:elfguy/cosmetic-commerce.git
```

## 문서

- `docs/01-product-brief.md` — 제품/사업 브리프
- `docs/02-mvp-scope.md` — MVP 범위
- `docs/03-marketing-plan.md` — 마케팅/콘텐츠 전략
- `docs/04-commerce-architecture.md` — 쇼핑몰 구조/DB/결제 방향
- `docs/05-discord.md` — Discord 채널/운영 메모
- `docs/06-coupang-product-urls.md` — 쿠팡 등록 상품 URL 조사 메모
- `docs/07-coupang-product-analysis-plan.md` — 쿠팡 상품/이미지 수집 및 분석 계획
- `docs/08-naver-shopping-search.md` — 네이버 쇼핑/스마트스토어 검색 노출 확인
- `docs/09-naver-smartstore-access-options.md` — 네이버 스마트스토어 상세페이지 접근 방법 검토
- `docs/10-asset-collection-guide.md` — 유어스킨 상세페이지/상품 이미지 수집 가이드
- `docs/11-product-feature-summary.md` — 상품별 확인 정보와 안전한 특장점 정리
- `docs/12-marketing-strategy-research.md` — 효능 주장 없이 AI를 활용하는 마케팅 운영 전략
- `docs/13-marketing-budget.md` — AI 활용 마케팅 비용/광고 테스트 예산 추정
- `docs/16-yourskinplus-8-product-comparison.md` — 쿠팡 등록 8개 제품 가격/채널/전성분/성분 분석 비교표
- `docs/19-brand-logo-direction.md` — YOURSKIN PLUS 프리미엄 자연주의 로고 방향, 40대 이상 타깃 실사용 SVG 로고 시스템, 웹 검토 페이지 정리
- `docs/20-monthly-10m-sales-plan.md` — 쿠팡/스마트스토어 기반 월 매출 1,000만원 달성 30일 실행 전략
