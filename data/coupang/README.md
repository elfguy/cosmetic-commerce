# Coupang Product Collection

수집일: 2026-05-09

## 산출물

- `products.json`: 상품별 구조화 데이터
- `products.csv`: 상품별 요약 CSV
- `summary.json`: 수집 결과 요약
- `raw/*.html`: Cafe24 상품 상세 원본 HTML
- `images/*/product/*`: 상품 대표/상품 이미지
- `images/*/detail/*`: 상세페이지 이미지
- `contact-sheets/*.jpg`: 상품별 상세 이미지 확인용 contact sheet
- `analysis/*.md`: 상품별 분석 메모

## 현재 수집 결과

- 총 상품 행: 9개
- Cafe24 상세페이지 원본/이미지 수집 완료: 5개
- 상품 이미지: 10개
- 상세 이미지: 40개
- contact sheet: 5개
- 메타데이터만 수집: 4개

## 수집 완료 상품

- 유어스킨플러스 히알루론산 토너
- 유어스킨플러스 로우 피에이치 클렌징 젤
- 유어스킨플러스 로즈 다마스쿠스 토닉 에센스
- 유어스킨플러스 영거 댄 올인원 로션
- 유어스킨플러스 모이스춰 립밤

## 메타데이터만 있는 상품

- 유어스킨플러스 히알루론산 아쿠아 로션
- 유어스킨플러스 퓨어 딥 클렌징 오일
- 유어스킨플러스 화이트닝 톤 케어 크림
- 미확인 쿠팡 등록 상품 1개

위 4개는 현재 Codex 실행 환경에서 쿠팡 상세 페이지가 `Access Denied` 또는 `net::ERR_BLOCKED_BY_CLIENT`로 차단되고, Cafe24 공식몰 상세 페이지도 확인되지 않아 상세 이미지 다운로드가 불가능했다.

정확한 쿠팡 상세 이미지까지 수집하려면 다음 중 하나가 필요하다.

1. Coupang Wing/OpenAPI `sellerProductId`와 API 키
2. 사용자가 접근 가능한 브라우저에서 저장한 HAR 파일
3. 쿠팡 Wing 상품 수정/미리보기 화면에서 확인 가능한 상세 이미지 URL 또는 상품 등록 JSON

2026-05-24 기준 쿠팡 셀러 OpenAPI 접속 정보는 `.env.local`에 등록되어 있고, 상품 목록/상세 조회는 정상 동작을 확인했다. 이후 API 접근은 `docs/28-coupang-openapi-access.md`의 HMAC 방식과 `scripts/check-coupang-openapi.mjs`를 기준으로 한다.

같은 날 `scripts/sync-coupang-openapi-products.mjs`로 현재 등록 상품 11개를 조회해 `data/coupang/openapi-products.json`, `data/coupang/openapi-sync-report.json`, `data/coupang/downloaded-products.json`를 갱신했고, API 상세 이미지 147장을 `public/coupang-detail/{productId}/` 아래에 다운로드했다. 쿠팡 상품 자체를 변경하지 않고 조회 전용으로 실행했다.

## 재수집

```bash
node scripts/collect-yourskinplus-products.mjs
```

## OpenAPI 동기화

```bash
node scripts/sync-coupang-openapi-products.mjs
```
