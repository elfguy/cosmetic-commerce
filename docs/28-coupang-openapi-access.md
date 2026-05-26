# Coupang Seller OpenAPI Access

확인일: 2026-05-24

이 문서는 이 프로젝트에서 쿠팡 셀러 OpenAPI를 접속할 때 사용할 고정 절차를 기록한다. 실제 키 값은 문서, README, 코드, 채팅에 남기지 않는다.

## 목적

- 쿠팡 셀러 상품 목록 조회와 상품 단건 조회를 서버/로컬 스크립트에서 안전하게 실행한다.
- 쿠팡 API 키를 브라우저로 노출하지 않는다.
- 이후 사용자가 쿠팡 상품 조회, 상품 데이터 수집, 상품 상세 확인을 요청하면 이 문서의 방식으로 접근한다.

## 로컬 환경변수

실제 접속 정보는 프로젝트 루트의 `.env.local`에만 저장한다. 이 파일은 `.gitignore`에 포함되어 있으며 커밋하지 않는다.

```env
COUPANG_API_BASE_URL=https://api-gateway.coupang.com
COUPANG_ACCESS_KEY=
COUPANG_SECRET_KEY=
COUPANG_VENDOR_ID=
```

주의:

- `COUPANG_ACCESS_KEY`, `COUPANG_SECRET_KEY`, `COUPANG_VENDOR_ID`에는 실제 값을 입력한다.
- `PUBLIC_` 접두사를 붙이지 않는다. Astro에서 `PUBLIC_` 변수는 브라우저에 노출될 수 있다.
- 검증이나 오류 확인이 필요해도 키 값은 출력하지 않는다.

## 공식 문서

- OpenAPI Key 발급: https://developers.coupangcorp.com/hc/ko/articles/20288952179993-OpenAPI-Key-%EB%B0%9C%EA%B8%89%EB%B0%9B%EA%B8%B0
- HMAC Signature 생성: https://developers.coupangcorp.com/hc/ko/articles/360033461914-HMAC-Signature-%EC%83%9D%EC%84%B1

## 인증 방식

쿠팡 OpenAPI 요청은 HMAC SHA256 서명을 사용한다.

요청마다 다음 값을 만든다.

```text
signedDate = YYMMDDTHHMMSSZ
message = signedDate + HTTP_METHOD + REQUEST_PATH + QUERY_STRING_WITHOUT_QUESTION_MARK
signature = HMAC_SHA256(message, COUPANG_SECRET_KEY)
```

요청 헤더:

```text
Authorization: CEA algorithm=HmacSHA256, access-key={COUPANG_ACCESS_KEY}, signed-date={signedDate}, signature={signature}
Content-Type: application/json;charset=UTF-8
```

## 검증된 상품 조회 엔드포인트

상품 목록 조회:

```text
GET /v2/providers/seller_api/apis/api/v1/marketplace/seller-products?vendorId={COUPANG_VENDOR_ID}&nextToken=1&maxPerPage=10
```

상품 단건 조회:

```text
GET /v2/providers/seller_api/apis/api/v1/marketplace/seller-products/{sellerProductId}
```

2026-05-24 검증 결과:

- 상품 목록 조회: `200 OK`, `SUCCESS`, 10건 반환
- 상품 단건 조회: `200 OK`, `SUCCESS`, 목록에서 받은 `sellerProductId`와 상세 응답 ID 일치

## 재검증 명령

키와 상품 원문을 출력하지 않는 안전한 확인 스크립트를 사용한다.

```bash
node scripts/check-coupang-openapi.mjs
```

옵션:

```bash
node scripts/check-coupang-openapi.mjs --max=5
node scripts/check-coupang-openapi.mjs --seller-product-id=1234567890
```

출력에는 다음만 포함한다.

- API 성공 여부
- HTTP 상태 코드
- 쿠팡 응답 코드
- 상품 수
- 마스킹된 `vendorId`, `sellerProductId`
- 응답 필드 이름 일부

## 상품 정보/상세 이미지 로컬 동기화

쿠팡에 등록된 현재 상품 정보와 상세 이미지를 로컬 프로젝트 데이터로 갱신할 때는 다음 스크립트를 사용한다.

```bash
node scripts/sync-coupang-openapi-products.mjs
```

이 스크립트는 조회 전용이다. 쿠팡 상품 등록 정보는 생성, 수정, 삭제하지 않는다.

생성/갱신 파일:

- `data/coupang/openapi-products.json`: 쿠팡 OpenAPI 기준 현재 상품 상세 정보
- `data/coupang/openapi-sync-report.json`: 기존 Chrome 저장 데이터와 API 데이터 차이, 이미지 다운로드 결과
- `data/coupang/downloaded-products.json`: 화면에서 사용하는 상품 아카이브 데이터
- `public/coupang-detail/{productId}/`: API 상세 이미지 다운로드 파일

2026-05-24 실행 결과:

- API 등록 상품: 11개
- Chrome 저장 HTML로 확인된 상품: 8개
- API에는 있으나 Chrome HTML 저장본이 없는 상품: 3개
- API 상세 이미지 다운로드: 147장
- 다운로드 실패: 0건

## 향후 작업 규칙

사용자가 쿠팡 API 조회를 요청하면 다음 순서로 처리한다.

1. `.env.local`을 로드한다.
2. 필수 환경변수 존재 여부만 확인한다.
3. HMAC 서명을 생성해서 쿠팡 API를 호출한다.
4. 기본 검증은 `scripts/check-coupang-openapi.mjs`를 사용한다.
5. 결과를 공유할 때 키, Authorization 헤더, Secret Key, 원본 상품 상세 JSON 전체를 출력하지 않는다.

## 변경 작업 승인 규칙

상품정보 변경 작업은 반드시 사용자에게 명시적으로 승인받은 뒤 실행한다.

승인 대상에는 다음 작업이 포함된다.

- 상품 생성, 수정, 삭제
- 판매상태 변경, 일시중지, 재개
- 가격, 재고, 옵션, 카테고리 변경
- 대표이미지, 상세이미지, 상세설명 변경
- 쿠팡 API 또는 관리자 도구를 통한 상품 등록 정보 변경

승인 전에는 조회, 검증, 초안 작성, 변경 계획 작성까지만 수행한다.
