#!/usr/bin/env python3
"""Extract public Naver integrated-search shopping data for 유어스킨플러스.

This does not fetch SmartStore detail pages. It only parses the public initial
state embedded in Naver integrated search results.
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

QUERY = sys.argv[1] if len(sys.argv) > 1 else "유어스킨플러스"
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("data/naver/search-products.json")


def extract_js_obj(text: str, start: int) -> str:
    depth = 0
    in_str = False
    esc = False
    for i, ch in enumerate(text[start:], start):
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return text[start : i + 1]
    raise RuntimeError("Could not find balanced JS object")


def parse_state(html: str, key: str):
    pat = f'naver.search.ext.newshopping["{key}"]._INITIAL_STATE='
    idx = html.find(pat)
    if idx < 0:
        return None
    raw = extract_js_obj(html, idx + len(pat))
    raw = re.sub(r":undefined(?=[,}])", ":null", raw)
    raw = re.sub(r'new Date\("([^"]*)"\)', r'"\1"', raw)
    return json.loads(raw)


def clean_name(name: str) -> str:
    return re.sub(r"<[^>]*>", "", name or "")


url = "https://search.naver.com/search.naver?query=" + urllib.parse.quote(QUERY)
req = urllib.request.Request(
    url,
    headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    },
)
html = urllib.request.urlopen(req, timeout=15).read().decode("utf-8", "ignore")

results = {"query": QUERY, "sourceUrl": url, "nstore": [], "shopping": []}

nstore = parse_state(html, "nstore")
if nstore:
    for p in nstore.get("initProps", {}).get("products", []):
        extra = p.get("nStoreExtraInfo") or {}
        results["nstore"].append(
            {
                "channelProductId": p.get("channelProductId"),
                "nvMid": p.get("nvMid"),
                "productName": clean_name(p.get("productName")),
                "salePrice": p.get("salePrice"),
                "discountedSalePrice": p.get("discountedSalePrice"),
                "discountedRatio": p.get("discountedRatio"),
                "mallName": p.get("mallName"),
                "reviewCount": extra.get("totalReviewCount6Month") or p.get("totalReviewCount"),
                "averageReviewScore": extra.get("averageReviewScore6Month") or p.get("averageReviewScore"),
                "productUrl": (p.get("productUrl") or {}).get("pcUrl") or (p.get("productClickUrl") or {}).get("pcUrl"),
                "imageUrl": ((p.get("images") or [{}])[0] or {}).get("imageUrl"),
            }
        )

shopping = parse_state(html, "shopping")
if shopping:
    slots = ((shopping.get("initProps", {}).get("pagedSlot") or [{}])[0]).get("slots", [])
    for slot in slots:
        if slot.get("slotType") != "CARD":
            continue
        p = slot.get("data") or {}
        results["shopping"].append(
            {
                "channelProductId": p.get("channelProductId"),
                "nvMid": p.get("nvMid"),
                "productName": clean_name(p.get("productName")),
                "salePrice": p.get("salePrice"),
                "discountedSalePrice": p.get("discountedSalePrice"),
                "mallName": p.get("mallName"),
                "productUrl": (p.get("productUrl") or {}).get("pcUrl") or (p.get("productClickUrl") or {}).get("pcUrl"),
                "imageUrl": ((p.get("images") or [{}])[0] or {}).get("imageUrl"),
            }
        )

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2))
print(f"wrote {OUT} — nstore={len(results['nstore'])}, shopping={len(results['shopping'])}")
