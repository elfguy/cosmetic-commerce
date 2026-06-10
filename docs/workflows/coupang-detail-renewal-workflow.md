---
name: coupang-detail-renewal-workflow
description: "Use when renewing Korean Coupang cosmetic representative/detail images end-to-end: compare against the original listing, generate or revise GPT Images cuts, QA legal/content risk, preserve product identity and ingredient tables, update local comparison pages, build, commit, and push only scoped runtime files."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [ecommerce, coupang, cosmetics, detail-page, qa, git]
    related_skills: [gpt-images-korean-ecommerce-detail, cosmetic-product-only-replacement, ecommerce-operations, github-pr-workflow]
---

# Coupang Detail Renewal Workflow

## Overview

This workflow captures the proven process used for Korean cosmetics Coupang detail-page renewal work: start from the live/original listing, generate new representative/detail assets, iterate on tone and content, then verify against the original before committing or pushing.

The goal is not just “pretty images.” The deliverable is a safe, source-checked, build-verified asset set that preserves SKU identity, legal/product facts, ingredient names, official seller language, and the intended image order.

## When to Use

Use this when the user asks to:

- Renew or rewrite Coupang 대표이미지 / 상세이미지 for a cosmetics product.
- Compare a new V1/V2 candidate against the original Coupang listing.
- Fix text, font tone, density, or layout of detail cuts.
- Check whether new image content is legally/content-wise safe before upload.
- Push approved image/version changes to GitHub.
- Keep legal/product-information/전성분 tables at the bottom of the detail flow.

Do **not** use this for:

- A one-off image generation with no source comparison requirement.
- Non-cosmetic marketplaces where cosmetic claims/ingredient risk do not apply.
- Uploading to live Coupang Wing without explicit user instruction.

## Core Principles

1. **Original listing is the source of truth.**
   - Use `public/coupang-main/<slug>/` and `public/coupang-detail/<productId>/` as the baseline when available.
   - Never invent ingredient names, test results, certifications, capacity, seller names, or legal tables.

2. **Generated images are candidates until QA passes.**
   - Promote only after visual/text/content QA.
   - Keep rejected/wrong versions out of final runtime paths.

3. **Product identity must survive.**
   - Bottle/jar shape, pump/cap, label structure, capacity impression, SKU color, and package silhouette must match the original.
   - For strict SKU representative cuts, prefer product-preserving compositing or exact product references.

4. **Legal/product information belongs at the end if the user placed it there.**
   - If the user says the 전성분/제품정보 table was intentionally moved down, keep it last.
   - Do not “correct” the order back to numeric filename order without asking.

5. **Push only scoped runtime files.**
   - Repos often contain many temporary screenshots, rejected candidates, raw ChatGPT outputs, and unrelated product work.
   - Stage only the approved product runtime assets and required source code/data changes.

## Recommended Directory Pattern

Typical runtime files:

```text
public/coupang/images/<slug>/versions/manifest.json
public/coupang/images/<slug>/versions/v1/representative/01.png
public/coupang/images/<slug>/versions/v1/representative/02.png
...
public/coupang/images/<slug>/versions/v1/detail/01.png
public/coupang/images/<slug>/versions/v1/detail/02.png
...
src/data/marketingOps.ts
src/pages/marketing/<slug>-version-compare.astro
src/pages/products/[slug].astro      # only if product-page navigation/label needs changing
```

Common working/support files that should usually **not** be staged unless intentionally needed:

```text
tmp-*.png
tmp/**
public/coupang/images/<slug>/versions/v1/agent-*/
public/coupang/images/<slug>/versions/v1/*prompts*/
public/coupang/images/<slug>/versions/v1/rejected/
public/coupang/images/<slug>/versions/v1/backup*/
public/coupang/images/<slug>/versions/v1/*candidate*.png
```

## End-to-End Workflow

### 1. Scope the product and current state

Identify product slug, Coupang product ID, original main/detail images, candidate version path, active branch, and repo state.

```bash
git status --short
python3 - <<'PY'
from pathlib import Path
for p in [
  'public/coupang-main/<slug>',
  'public/coupang-detail/<productId>',
  'public/coupang/images/<slug>/versions/v1/detail',
  'public/coupang/images/<slug>/versions/v1/representative',
]:
    pp = Path(p)
    print('\n', p, pp.exists())
    if pp.exists():
        for f in sorted(pp.glob('*.png'))[:30]:
            print(f.name, f.stat().st_size)
PY
```

### 2. Create comparison/contact sheets

Create original-vs-candidate contact sheets for representative and detail groups. Use groups like representative `01-05`, detail `01-04`, `05-08`, `09-14`. These sheets are the main evidence for visual OCR/content QA.

### 3. Generate or revise images with verified GPT Images workflow

Load and follow `gpt-images-korean-ecommerce-detail` whenever using ChatGPT Images.

Minimum requirements:

- Start from `https://chatgpt.com/images/`.
- Verify attached reference thumbnails are visible before send.
- Save upload evidence and before-send screenshots.
- Reject outputs with product drift, broken Korean, wrong text, wrong legal claims, or wrong layout role.
- Normalize dimensions only after download. Do not locally patch final text unless the user explicitly asks.

### 4. Sequential cut-by-cut production rule

Do **not** batch-generate all representative/detail cuts and inspect them later.

For each slot, work in this strict order:

1. Generate only **one** image/cut for the current slot.
2. Run visual QA immediately.
3. Compare it against the original listing and adjacent cuts.
4. If it passes, promote/copy it to the final runtime path.
5. If it fails, move it to `rejected/` or keep it as a backup candidate, restore the prior final file if needed, and regenerate.
6. Only after the current slot is approved, move to the next slot.

Never proceed to the next image while the current image is unverified. This rule applies to both representative images and detail images.

Proven examples from the cleansing-oil workflow:

- Detail 02: first regeneration became a product close-up instead of an information card, so it was rejected and regenerated with product references removed.
- Detail 03: density improved, but the font tone looked too serif/casual, so it was regenerated with a strong gothic/sans-serif instruction.
- Detail 05: QA found ingredient names that did not match the original, so it was regenerated with exact original extract names.

### 5. QA every candidate before promotion

For each new cut, ask vision QA against the user’s requested criteria:

- Product identity / SKU match.
- Korean text accuracy.
- Font tone and visual density.
- Whether the cut’s role is correct.
- Forbidden expressions.
- Compatibility with adjacent cuts.

Useful QA prompts:

```text
이 후보가 원본 상품명/용량/라벨/SKU와 충돌하는지, 한국어 문구 오타/깨짐이 있는지, 과장 표현이나 인증 오인이 있는지, 최종 승격 가능한지 판정해줘.
```

```text
상세 02~04 contact sheet입니다. 새 상세 03의 글씨체가 02/04와 톤앤매너가 맞는지, 정보 밀도가 과하거나 비지 않는지 판정해줘.
```

### 6. Content and legal-risk QA against the original

Before final commit/push, compare the full new set against the original listing.

Check all new content for:

- Wrong ingredient names.
- Claims not present in the original.
- Certification/test claims not present in the original.
- Seller names and official-store wording.
- Manufacturing/fresh-shipping claims.
- Product information/legal table distortion.
- Order of final legal/ingredient cuts.

Cosmetics risk terms to avoid unless explicitly present and legally safe:

```text
완벽 제거
한 번에 제거
블랙헤드 제거
모공 축소
모공 속까지
의학적 효능
피부 질환 개선
인증 완료
```

Safer wording patterns:

```text
세정 관리
노폐물 케어
산뜻한 사용감
부드러운 클렌징 루틴
원료 특성에 대한 설명이며, 효능·효과를 보장하는 표현이 아닙니다.
```

### 7. Ingredient and legal table rules

For ingredient/formula cuts:

- Copy ingredient names from the original exactly.
- Do not substitute extract names with oil names.
- Do not infer ingredients from product category.

Example correction from the proven workflow:

```text
Wrong candidate:
올리브오일 / 해바라기씨오일 / 호호바씨오일 / 포도씨오일

Original-corrected:
버지니아풍년화추출물 / 녹차추출물 / 바다포도추출물 / 올리브추출물
```

For final legal/ingredient table order:

- Preserve the user’s intended order.
- If the user intentionally moved the 전성분/제품정보 table to the bottom, configure version arrays as:

```ts
detailImages: [
  ...Array.from({ length: 12 }, (_, i) => '/coupang/images/<slug>/versions/v1/detail/' + String(i + 1).padStart(2, '0') + '.png'),
  '/coupang/images/<slug>/versions/v1/detail/14.png', // official seller / 안내
  '/coupang/images/<slug>/versions/v1/detail/13.png', // 제품정보/전성분 table last
]
```

Mirror the same order in `manifest.json` labels.

### 8. Update data and comparison pages

Update:

- `public/coupang/images/<slug>/versions/manifest.json`
- `src/data/marketingOps.ts`
- `src/pages/marketing/<slug>-version-compare.astro`
- Product page link labels only if needed.

For comparison pages, ensure original and V1 are both visible, labels match the visual role, and detail order matches the user’s intended order.

### 9. Build and URL verification

Always run:

```bash
npm run build
```

Then verify local served URLs if the dev/static server is available:

```python
import urllib.request
base = 'http://192.168.50.100:8898'
paths = [
  '/marketing/<slug>-version-compare/',
  '/products/<slug>/',
  '/coupang/images/<slug>/versions/v1/detail/13.png',
  '/coupang/images/<slug>/versions/v1/detail/14.png',
]
for path in paths:
    with urllib.request.urlopen(base + path, timeout=10) as r:
        data = r.read()
        print(path, r.status, r.headers.get_content_type(), len(data))
```

If order matters, inspect HTML ordering:

```python
html = urllib.request.urlopen(base + '/marketing/<slug>-version-compare/', timeout=10).read().decode('utf-8', 'ignore')
i14 = html.find('/coupang/images/<slug>/versions/v1/detail/14.png')
i13 = html.find('/coupang/images/<slug>/versions/v1/detail/13.png')
print('detail14 before detail13', i14 != -1 and i13 != -1 and i14 < i13)
```

### 10. Stage only scoped runtime files

Use explicit `git add`, not broad `git add .`, because the repo may contain unrelated product work and temporary evidence.

```bash
git diff --cached --stat
git diff --cached --name-only
git status --short | head -80
```

Do not stage unrelated product changes, temporary ChatGPT screenshots, rejected candidates, or raw/backup/prompt directories unless the user explicitly wants them committed.

### 11. Commit and push

Commit after build and QA pass:

```bash
git commit -m "Add <product> V1 assets and comparison page"
git push origin main
```

For small follow-up order fixes:

```bash
git commit -m "Place <product> ingredient table last"
git push origin main
```

Report the short SHA and what was pushed.

## Common Pitfalls

1. **Mistaking filename order for intended detail order.**
   - The user may intentionally place product information / 전성분 at the very bottom even if the file is `13.png`.

2. **Generating wrong ingredient names.**
   - GPT often swaps extracts for oils or common cosmetic ingredients. Always compare against the original detail cut.

3. **Over-correcting safe original claims.**
   - If the original already says a similar freshness or seller-management claim, a V1 version may be acceptable. Still avoid stronger guarantee wording.

4. **Accepting pretty but wrong product images.**
   - A polished image is not acceptable if bottle ratio, label, cap, pump, or capacity impression changed.

5. **Trusting automation logs instead of visual evidence.**
   - ChatGPT Images upload can appear to succeed while references are not attached to the active composer.

6. **Committing the whole dirty worktree.**
   - Use explicit `git add` and inspect staged files before commit.

7. **Skipping build because only images changed.**
   - Data arrays, comparison pages, and labels can break even if images are valid.

## Verification Checklist

Before reporting completion:

- [ ] Original representative and detail images were compared against V1.
- [ ] Product name, SKU, capacity, label, and seller wording are consistent.
- [ ] Ingredient names match the original exactly.
- [ ] Test/certification/freshness claims are present in the original or softened.
- [ ] Forbidden expressions are absent or replaced with safer wording.
- [ ] Font/tone/density QA was done against adjacent cuts.
- [ ] User-intended final order is preserved, especially 전성분/제품정보 table last.
- [ ] `manifest.json` labels match the actual order.
- [ ] `marketingOps.ts` image arrays match the actual order.
- [ ] `npm run build` succeeds.
- [ ] Local comparison/product URLs return 200.
- [ ] Staged files are scoped to this product and exclude tmp/rejected/raw files.
- [ ] Commit and push completed, with short SHA reported.

## Reporting Template

```text
완료했어 Leo.

확인한 것:
- 원본 대표/상세와 V1 전체 대조
- 성분명/전성분/제품정보/공식판매 문구 확인
- 위험 문구 수정 여부 확인
- 전성분 표 마지막 순서 유지
- npm run build 성공
- 비교 페이지/상품 페이지/이미지 URL 200

수정한 것:
- 상세 NN: <이유>
- manifest/marketingOps: <순서/라벨>

푸시:
<short-sha> <commit message>
```
