# Coupang sales analysis reports

이 폴더는 `/sales-analysis/` 페이지가 읽는 매출 분석 원본 데이터 저장소입니다.

## HTML 페이지

- Route: `/sales-analysis/`
- Astro source: `src/pages/sales-analysis.astro`
- Import pattern: `monthly-sales-image-lift-*.json`

## 새 리포트 추가 방법

1. 쿠팡 ordersheets 데이터를 조회해서 아래 패턴의 JSON을 생성합니다.
   - `data/coupang/analysis/monthly-sales-image-lift-YYYYMMDD.json`
2. 같은 구조의 JSON이면 `/sales-analysis/`에 자동으로 누적 표시됩니다.
3. 빌드 확인:
   ```bash
   npm run build
   ```

## 현재 생성 스크립트

```bash
node scripts/generate-coupang-sales-analysis.mjs --from=YYYY-MM-DD --to=YYYY-MM-DD
```

주의:
- `.env.local`의 Coupang API 키를 사용합니다.
- 주문/매출 조회 전용입니다. 상품 정보 변경은 하지 않습니다.
- 키/Authorization/원본 주문 개인정보는 출력하지 않습니다.
