# -*- coding: utf-8 -*-
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, textwrap

root = Path('/Users/elfguy/alba/cosmetic-commerce')
out_dir = root / 'public/coupang/images/aqua-lotion/versions/v4/detail'
out_dir.mkdir(parents=True, exist_ok=True)
source_path = root / 'public/coupang/images/aqua-lotion/versions/v4/prompts/12-legal-table-source.json'

rows = [
    ("제품명", "유어스킨플러스 히알루론산 아쿠아 로션"),
    ("용량 또는 중량", "300ml / 10.14 fl. oz"),
    ("제품 주요 사항", "모든 피부 타입"),
    ("사용기한", "제조일로부터 24개월 / 개봉후 12개월"),
    ("사용법", "적당량을 덜어 얼굴에 골고루 펴 바른 후 두드리 듯이 흡수시켜 줍니다."),
    ("화장품제조업자 및\n화장품책임판매업자", "(주)유어스킨"),
    ("제조국", "대한민국"),
    ("[화장품법]에 따라 기재.표시해야 하는 모든 성분", "정제수, 글리세린, 카프릴릭/카프릭트라이글리세라이드, 프로판다이올, 마카다미아씨오일, 글리세릴스테아레이트에스이, 다이프로필렌글라이콜, 해바라기씨오일, 하이드록시아세토페논, 솔비탄스테아레이트, 카보머, 카프릴릴글라이콜, 세테아릴알코올, 시어버터, 소듐하이알루로네이트(2,050ppm), 알지닌, 해수, 부틸렌글라이콜, 로즈힙열매오일, 1,2-헥산다이올, 토코페롤, 병풀추출물, 효모/겨우살이발효추출물, 효모/띠뿌리발효추출물, 락토바실러스/콩발효추출물, 다이포타슘글리시리제이트, 밀싹추출물, 브로콜리추출물, 양배추추출물, 자주개자리추출물, 하이드록시프로필트라이모늄하이알루로네이트, 무씨추출물, 유채추출물, 소듐아세틸레이티드하이알루로네이트(0.5ppm), 하이드롤라이즈드하이알루로닉애씨드(0.5ppm), 하이알루로닉애씨드(0.125ppm), 소듐하이알루로네이트크로스폴리머(0.05ppm), 하이드롤라이즈드소듐하이알루로네이트(0.05ppm), 포타슘하이알루로네이트(0.01ppm)"),
    ("사용상 주의사항", "1. 화장품을 사용시 또는 사용후 직사광선에 의하여 사용부위가 붉은 반점, 부어오름 또는 가려움증 등의 이상 증상이나 부작용이 있는 경우 전문의 등과 상담할 것 2. 상처가 있는 부위 등에는 사용을 자제할 것 3. 보관 및 취급시 주의사항 가) 어린이의 손이 닿지 않는 곳에 보관할 것 나)직사광선을 피해서 보관할 것"),
    ("품질보증기준", "본 제품에 이상이 있을 경우 공정거래위원회 고시 소비자분쟁해결기준에 의거 교환 또는 보상을 받을수 있습니다."),
    ("소비자 상담관련\n전화번호", "032-682-6533(소비자요금부담)\n운영시간 10:00~17:00(점심시간제외, 11:40~12:40)(주말,공휴일제외)"),
]

source_path.write_text(json.dumps({"rows": rows}, ensure_ascii=False, indent=2), encoding='utf-8')

W = 950
margin_x = 42
top = 150
bottom = 95
table_w = W - margin_x * 2
left_w = 205
right_w = table_w - left_w
line_color = (207, 207, 207)
left_bg = (238, 238, 238)
text_color = (34, 34, 34)

font_path = '/System/Library/Fonts/AppleSDGothicNeo.ttc'
font_body = ImageFont.truetype(font_path, 25)
font_body_small = ImageFont.truetype(font_path, 23)
font_label = ImageFont.truetype(font_path, 24)
font_label_small = ImageFont.truetype(font_path, 23)

probe = Image.new('RGB', (10, 10), 'white')
d = ImageDraw.Draw(probe)

def measure(text, font):
    if not text:
        return 0
    box = d.textbbox((0, 0), text, font=font)
    return box[2] - box[0]

def wrap_text(text, font, max_w):
    lines = []
    for para in str(text).split('\n'):
        if not para:
            lines.append('')
            continue
        cur = ''
        for ch in para:
            test = cur + ch
            if measure(test, font) <= max_w or not cur:
                cur = test
            else:
                lines.append(cur)
                cur = ch
        if cur:
            lines.append(cur)
    return lines

def row_height(label, value):
    lf = font_label_small if len(label) > 18 else font_label
    vf = font_body_small if len(value) > 240 else font_body
    label_lines = wrap_text(label, lf, left_w - 24)
    value_lines = wrap_text(value, vf, right_w - 32)
    lh_l = int(lf.size * 1.22)
    lh_v = int(vf.size * 1.23)
    h = max(72, len(label_lines) * lh_l + 34, len(value_lines) * lh_v + 34)
    if len(value) > 900:
        h += 8
    return h, label_lines, value_lines, lf, vf, lh_l, lh_v

prepared = [(*row_height(label, value), label, value) for label, value in rows]
table_h = sum(item[0] for item in prepared)
H = top + table_h + bottom
img = Image.new('RGB', (W, H), 'white')
draw = ImageDraw.Draw(img)

x0 = margin_x
y = top
x1 = x0 + table_w
# outer border and rows
for h, label_lines, value_lines, lf, vf, lh_l, lh_v, label, value in prepared:
    draw.rectangle([x0, y, x0 + left_w, y + h], fill=left_bg)
    draw.rectangle([x0 + left_w, y, x1, y + h], fill='white')
    # borders
    draw.line([x0, y, x1, y], fill=line_color, width=2)
    draw.line([x0, y, x0, y + h], fill=line_color, width=2)
    draw.line([x0 + left_w, y, x0 + left_w, y + h], fill=line_color, width=2)
    draw.line([x1, y, x1, y + h], fill=line_color, width=2)
    # label vertically centered, except long legal label use center too
    label_total = len(label_lines) * lh_l
    ly = y + (h - label_total) / 2 - 2
    for line in label_lines:
        draw.text((x0 + 14, ly), line, font=lf, fill=text_color)
        ly += lh_l
    # value: center for short rows, top aligned for long rows
    value_total = len(value_lines) * lh_v
    if h <= 100:
        vy = y + (h - value_total) / 2 - 2
    else:
        vy = y + 30
    for line in value_lines:
        draw.text((x0 + left_w + 16, vy), line, font=vf, fill=text_color)
        vy += lh_v
    y += h
# bottom border
draw.line([x0, y, x1, y], fill=line_color, width=2)

candidate = out_dir / '12-13-combined-legal-table-candidate.png'
img.save(candidate, quality=95)
print(candidate)
print(f'{W}x{H}', candidate.stat().st_size)
print('rows', len(rows))
print('ingredients_count', len(rows[7][1].split(', ')))
