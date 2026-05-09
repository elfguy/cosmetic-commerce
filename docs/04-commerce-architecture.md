# 04. Commerce Architecture

## 기본 구조

- Public pages: Astro 정적 페이지
- Interactive parts: React islands
- Data: Supabase
- Hosting: Cloudflare Pages

## 데이터 모델 초안

### products

- id
- slug
- name
- subtitle
- description
- price
- compare_at_price
- main_image
- ingredients
- benefits
- how_to_use
- is_active

### leads

- id
- name
- phone
- email
- interest_product
- message
- source
- created_at

### orders_lite

초기에는 완전 결제 전 주문/상담 신청 저장용.

- id
- customer_name
- phone
- product_id
- quantity
- memo
- status
- created_at

### reviews

- id
- product_id
- author_name
- rating
- content
- image_url
- is_public
- created_at

## 결제 전략

### 1안: 스마트스토어/카카오 연결

- 가장 빠름
- PG/배송/정산 부담 적음
- 자사몰 데이터 확보는 약함

### 2안: Toss Payments/PortOne 자사몰 결제

- 브랜드 경험/데이터 확보 좋음
- 사업자/통신판매/PG 심사 필요
- 초기 개발/운영 부담 증가

## 추천

MVP는 **랜딩 + 문의/샘플 신청 + 스마트스토어/카카오 연결**로 시작. 전환이 보이면 자사몰 결제 연동으로 확장.
