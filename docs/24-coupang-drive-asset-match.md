# 24. 쿠팡 등록 상품과 Google Drive 이미지 폴더 매칭

확인일: 2026-05-21

원본 Google Drive 폴더: https://drive.google.com/drive/folders/1JHfueX2yODQ4X2BOOcsA3GlUfEkmyaQc

## 요약

- Google Drive 폴더 접근 상태: 공개 뷰어 접근 확인.
- Drive 루트명: yourskin.
- 현재 쿠팡 등록 기준 상품: 기존 정리 8개 + Leo 제공 수딩크림 링크 1개.
- Drive에서 확인된 제품 폴더/대표 파일: 9개.
- 매칭 완료: 9개.
- 수딩크림은 Chrome 확인으로 정확한 상품명, itemId, vendorItemId까지 확인됨.

## 매칭표

| 상태 | 작업 폴더 | 쿠팡 등록 상품 | Coupang URL | Drive 폴더명 | Drive 루트 파일 |
|---|---|---|---|---|---|
| 매칭 | hyaluronic-acid-toner | 유어스킨플러스 히알루론산 토너 | https://www.coupang.com/vp/products/9025733014 | 히알루론산토너 | 히알루론산토너.png |
| 매칭 | aqua-lotion | 유어스킨플러스 히알루론산 아쿠아 로션 | https://www.coupang.com/vp/products/9218811640 | 아쿠아로션 | 아쿠아로션.png |
| 매칭 | cleansing-oil | 유어스킨플러스 퓨어 딥 클렌징 오일 | https://www.coupang.com/vp/products/9221762154 | 클렌징오일 | 클렌징오일.png |
| 매칭 | low-ph-cleansing-gel | 유어스킨플러스 로우 피에이치 클렌징 젤 | https://www.coupang.com/vp/products/9025751494 | 클렌징젤 | 클렌징젤.png |
| 매칭 | rose-damascus-tonic-essence | 유어스킨플러스 로즈 다마스쿠스 토닉 에센스 | https://www.coupang.com/vp/products/9025775541 | 로즈에센스 | 로즈에센스.jpg |
| 매칭 | younger-than-all-in-one-lotion | 유어스킨플러스 영거 댄 올인원 로션 | https://www.coupang.com/vp/products/9025793946 | 올인원로션 | 올인원로션.png |
| 매칭 | moisture-lip-balm | 유어스킨플러스 모이스춰 립밤 | https://www.coupang.com/vp/products/9025810298 | 립밤 | 모이수춰립밤.png |
| 매칭 | whitening-tone-care-cream | 유어스킨플러스 화이트닝 톤 케어 크림 | https://www.coupang.com/vp/products/9264527939?itemId=27414863570&vendorItemId=94380449351 | 톤케어크림 | 톤케어크림.png |
| 매칭 | unmatched-soothing-cream | 유어스킨플러스 피디알엔 히알루론산 수딩 크림 | https://www.coupang.com/vp/products/9402735935?itemId=27931591582&vendorItemId=94889995486 | 수딩크림 | 수딩크림.png |

## 작업 폴더

작업용 폴더는 data/source-assets/yourskin-drive/ 아래에 만들었다.

원본 Drive 구조를 직접 바꾸지는 않았다. 현재 권한은 공개 열람 기준이라 Drive에 쓰기/이동/이름 변경을 하려면 Google Drive API 인증 또는 Leo 계정의 편집 권한 연결이 필요하다.

Folder tree:

data/source-assets/yourskin-drive/
  hyaluronic-acid-toner/
  aqua-lotion/
  cleansing-oil/
  low-ph-cleansing-gel/
  rose-damascus-tonic-essence/
  younger-than-all-in-one-lotion/
  moisture-lip-balm/
  whitening-tone-care-cream/
  unmatched-soothing-cream/

## 판단 기준

- 쿠팡 등록 상품 기준: docs/06-coupang-product-urls.md, data/yourskinplus-8-product-comparison.json.
- Drive 목록 기준: 2026-05-21 공개 폴더 조회 결과.
- 2026-05-21 웹 검색 스팟체크에서 기존 쿠팡 8개 상품 URL은 다시 확인됐다.
- 이후 Leo가 수딩크림 단축 URL을 제공했고, OpenClaw Chrome 확인 결과 상품명은 유어스킨플러스 피디알엔 히알루론산 수딩 크림이다.
- 확인 URL: https://www.coupang.com/vp/products/9402735935?itemId=27931591582&vendorItemId=94889995486
- 일반 fetch 환경에서는 여전히 Akamai Access Denied 403이 발생하므로 상세 본문 점검은 Chrome 또는 Wing 기준으로 진행한다.

## 다음 작업 메모

- 실제 이미지 파일을 제작에 투입할 때는 Drive에서 원본을 내려받아 위 작업 폴더에 복사한다.
- 수딩크림은 이후 상세 이미지/고시정보를 Chrome 또는 Wing 기준으로 추가 수집한다.
- 립밤 파일명 모이수춰립밤.png는 Drive 표기를 그대로 기록했다. 이후 내부 작업명은 moisture-lip-balm으로 통일한다.
