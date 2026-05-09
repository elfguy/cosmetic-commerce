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

## 문서

- `docs/01-product-brief.md` — 제품/사업 브리프
- `docs/02-mvp-scope.md` — MVP 범위
- `docs/03-marketing-plan.md` — 마케팅/콘텐츠 전략
- `docs/04-commerce-architecture.md` — 쇼핑몰 구조/DB/결제 방향
- `docs/05-discord.md` — Discord 채널/운영 메모
