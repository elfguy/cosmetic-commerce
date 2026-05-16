# 07. Coupang Product Analysis Plan

확인일: 2026-05-09

쿠팡에 등록된 `유어스킨플러스` 상품별 내용을 확인하고, 대표 이미지/상세 이미지/상세 컨텐츠를 내려받아 분석하기 위한 실행 계획.

## 결론

가장 안정적인 방법은 **쿠팡 Wing/OpenAPI에서 판매자 상품 데이터를 조회하는 것**이다.

공개 상품 페이지를 직접 스크래핑하는 방식은 다음 문제가 있다.

- Codex 실행 환경에서 쿠팡 페이지가 `Access Denied` 또는 `net::ERR_BLOCKED_BY_CLIENT`로 차단됨.
- 쿠팡 상세 페이지는 세션, 광고 파라미터, 브라우저 환경에 따라 노출이 달라질 수 있음.
- 공개 페이지에서 보이는 정보는 쿠팡 카탈로그/아이템위너/리뷰 영역과 섞일 수 있어 판매자 등록 원문과 다를 수 있음.

반면 쿠팡 OpenAPI의 상품 조회는 판매자가 등록한 상품 전문을 반환하므로, 대표 이미지, 기타 이미지, 상세 컨텐츠 HTML, 상품고시정보, 옵션, 가격, 재고, 노출명 등을 구조화해서 받을 수 있다.

## 권장 방법: Wing/OpenAPI 기반 수집

### 필요한 값

- Coupang Wing 판매자 계정
- OpenAPI access key
- OpenAPI secret key
- vendorId
- sellerProductId 목록

이미 알고 있는 공개 URL의 `productId`, `itemId`, `vendorItemId`와 OpenAPI의 `sellerProductId`는 같은 값이 아니다. API 상세 조회에는 `sellerProductId`가 필요하다.

### 사용할 API

1. 상품 목록 페이징 조회
   - 목적: 판매자 계정에 등록된 상품 목록에서 `sellerProductId`, `productId`, `statusName`, `sellerProductName` 확보
   - Endpoint:

```text
GET /v2/providers/seller_api/apis/api/v1/marketplace/seller-products
```

2. 상품 조회
   - 목적: 상품별 전체 등록 전문 확보
   - Endpoint:

```text
GET /v2/providers/seller_api/apis/api/v1/marketplace/seller-products/{sellerProductId}
```

3. 상품 요약 정보 조회
   - 목적: 판매자 상품코드 `externalVendorSku`가 정리되어 있을 때 `sellerProductId` 역조회
   - Endpoint:

```text
GET /v2/providers/seller_api/apis/api/v1/marketplace/seller-products/external-vendor-sku-codes/{externalVendorSkuCode}
```

### API 응답에서 볼 핵심 필드

- `data.sellerProductId`
- `data.productId`
- `data.sellerProductName`
- `data.displayProductName`
- `data.brand`
- `data.generalProductName`
- `data.statusName`
- `data.items[].vendorItemId`
- `data.items[].itemId`
- `data.items[].itemName`
- `data.items[].originalPrice`
- `data.items[].salePrice`
- `data.items[].maximumBuyCount`
- `data.items[].images[]`
  - `imageType`: `REPRESENTATION`, `DETAIL` 등
  - `cdnPath`
  - `vendorPath`
- `data.items[].contents[]`
  - `contentsType`: `IMAGE`, `TEXT`, `HTML` 등
  - `contentDetails[].content`: 상세 HTML 또는 텍스트
  - `contentDetails[].detailType`: `IMAGE`, `TEXT`
- `data.items[].notices[]`
- `data.items[].attributes[]`
- `data.items[].searchTags[]`

특히 상세페이지 이미지는 두 군데에 있을 수 있다.

1. `items[].images[]`의 `DETAIL` 이미지
2. `items[].contents[].contentDetails[].content` 안의 HTML `<img src="...">`

두 경로를 모두 파싱해야 한다.

## 산출물 구조

수집 결과는 아래 구조로 저장한다.

```text
data/coupang/
  products.json
  products.csv
  raw/
    {sellerProductId}.json
  images/
    {product-slug-or-productId}/
      representation/
      detail/
      content/
  analysis/
    {product-slug-or-productId}.md
```

### `products.csv` 권장 컬럼

```text
status, product_name, coupang_url, seller_product_id, product_id, item_id, vendor_item_id, sale_price, original_price, stock, image_count, detail_image_count, content_image_count, notes
```

### 상품별 분석 문서 항목

각 상품은 `data/coupang/analysis/{product}.md`로 정리한다.

```text
# 상품명

## 기본 정보
- Coupang URL:
- sellerProductId:
- productId:
- itemId:
- vendorItemId:
- 판매상태:
- 가격:
- 재고:

## 이미지
- 대표 이미지:
- 기타 이미지:
- 상세 컨텐츠 이미지:

## 상세페이지 구성
- 핵심 문구:
- 성분/효능 주장:
- 사용법:
- 상품고시정보:

## 개선/활용 메모
- 자사몰 상세페이지에 재사용할 내용:
- 보완 필요한 내용:
- 이미지 품질/사이즈 이슈:
```

## 구현 흐름

1. `docs/06-coupang-product-urls.md`의 URL 목록을 기준으로 상품 매니페스트를 만든다.
2. Wing/OpenAPI 상품 목록 조회로 `sellerProductId`를 확보한다.
3. 상품 조회 API로 상품별 JSON 전문을 저장한다.
4. JSON에서 대표 이미지, 기타 이미지, 상세 HTML 안의 이미지 URL을 모두 추출한다.
5. 이미지 URL을 `data/coupang/images/` 아래에 다운로드한다.
6. 상세 HTML은 원본 HTML과 텍스트 추출본을 함께 저장한다.
7. 이미지 OCR이 필요하면 상세 이미지별 텍스트를 별도 추출한다.
8. 상품별 분석 Markdown을 생성한다.

## 대안: 사용자가 접근 가능한 브라우저에서 추출

OpenAPI 키 접근이 당장 어렵다면, 사용자가 쿠팡 페이지에 접근 가능한 브라우저에서 직접 추출하는 방법을 쓴다.

### 방식 A: 브라우저 개발자도구 Network/HAR 저장

1. 사용자가 쿠팡 상품 상세 페이지를 연다.
2. 개발자도구 Network 탭을 연다.
3. 페이지를 새로고침한다.
4. Network 로그를 HAR로 저장한다.
5. HAR 파일에서 이미지 URL, 상품 JSON, 상세 HTML 요청을 추출한다.

장점:

- 사용자의 정상 브라우저 세션을 사용하므로 Codex 인앱 브라우저 차단을 피할 수 있다.
- 페이지가 실제로 내려받은 이미지와 API 응답을 그대로 확인할 수 있다.

단점:

- 상품별로 수동 작업이 필요하다.
- 쿠팡 내부 API 응답 구조가 바뀔 수 있다.

### 방식 B: 브라우저 콘솔/북마클릿 추출

사용자가 상품 상세 페이지에서 직접 JavaScript를 실행해 현재 DOM의 상품명, 가격, 이미지 URL, 상세 HTML 이미지 URL을 JSON으로 복사한다.

이 방식은 페이지가 이미 사용자 브라우저에서 열린 상태를 활용한다. Codex 환경에서 쿠팡이 막혀도 사용자가 추출한 JSON을 프로젝트에 넣으면 이후 이미지 다운로드/분석은 로컬에서 처리할 수 있다.

## 비권장 방법

- 쿠팡 공개 페이지를 `curl`이나 일반 HTTP 클라이언트로 직접 반복 요청
- 광고/트래킹 파라미터가 붙은 검색 결과 URL을 대량 수집
- 차단 우회를 위해 헤더/프록시를 무리하게 바꾸는 방식

이 방식들은 안정성이 낮고, 차단/오탐/불완전 데이터 가능성이 높다.

## 다음 액션

1. Wing/OpenAPI 키 사용 가능 여부 확인.
2. 가능하면 `vendorId`와 OpenAPI 키를 환경변수로 받아 수집 스크립트를 만든다.
3. OpenAPI 접근이 어렵다면, 먼저 사용자 브라우저에서 상품 1개를 HAR 또는 JSON으로 추출해 샘플 파이프라인을 만든다.
4. 샘플 상품 1개에서 이미지 다운로드/분석 결과가 정상인지 검증한 뒤 9개 전체로 확장한다.

## 참고 문서

- Coupang Marketplace WING: https://globalsellers.coupang.com/en/what-is-wing/
- Coupang OpenAPI 상품 목록 페이징 조회: https://developers.coupangcorp.com/hc/ko/articles/360033645034
- Coupang OpenAPI 상품 조회: https://developers.coupangcorp.com/hc/ko/articles/360033644994
- Coupang OpenAPI 상품 요약 정보 조회: https://developers.coupangcorp.com/hc/ko/articles/360033645094
