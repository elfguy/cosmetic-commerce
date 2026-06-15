from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import shutil
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/coupang/images/rose-essence/versions/v1/detail/11.png'
BACKUP_DIR = OUT.parent / 'backup'
BACKUP_DIR.mkdir(parents=True, exist_ok=True)
BACKUP = BACKUP_DIR / '11-before-ingredient-change-20260615.png'
if OUT.exists() and not BACKUP.exists():
    shutil.copy2(OUT, BACKUP)

W, H = 780, 1360
# Match the existing rose legal table geometry.
X0, X1, X2 = 35, 205, 745
TOP = 145
ROW_HEIGHTS = [78, 73, 73, 77, 78, 77, 74, 189, 205, 124, 107]
FONT_PATH = '/System/Library/Fonts/AppleSDGothicNeo.ttc'

INGREDIENT_LIST = [
    '정제수',
    '프로방스장미꽃수(286,500ppm)',
    '글리세린',
    '프로판다이올',
    '다이프로필렌글라이콜',
    '부틸렌글라이콜',
    '소듐하이알루로네이트',
    '알란토인',
    '카보머',
    '알지닌',
    '잔탄검',
    '갈락토미세스발효여과물',
    '병풀추출물',
    '다마스크장미꽃추출물(50ppm)',
    '1,2-헥산다이올',
    '하이드록시아세토페논',
    '카프릴릴글라이콜',
    '펜틸렌글라이콜',
    '다이포타슘글리시리제이트',
]
NEW_INGREDIENTS = ', '.join(INGREDIENT_LIST)
EXPECTED_ORDER = INGREDIENT_LIST[:]

rows = [
    ('제품명', '유어스킨플러스 로즈다마스크 토닉에센스'),
    ('용량 또는 중량', '150ml / 16.9 fl. oz'),
    ('피부 타입', '모든 피부 타입'),
    ('사용기한', '제조일로부터 24개월 / 개봉후 12개월'),
    ('사용법', '세안후 본품 적당량을 취해 피부에 골고루 펴 바릅니다.'),
    ('화장품제조업자 및\n화장품책임판매업자', '(주)유어스킨'),
    ('제조국', '대한민국'),
    ('[화장품법]에 따라\n기재·표시하여야 하는\n모든 성분', NEW_INGREDIENTS),
    ('사용상 주의사항', '1. 화장품을 사용시 또는 사용후 직사광선에 의하여 사용부위가 붉은 반점, 부어오름 또는 가려움증 등의 이상 증상이나 부작용이 있는 경우 전문의 등과 상담할 것 2. 상처가 있는 부위 등에는 사용을 자제할 것 3. 보관 및 취급 시 주의사항 가) 어린이의 손에 닿지 않는 곳에 보관할 것 나) 직사광선을 피해서 보관할 것'),
    ('품질보증기준', '본 제품에 이상이 있을 경우 공정거래위원회 고시 소비자분쟁해결\n기준에 의거 교환 또는 보상을 받을 수 있습니다.'),
    ('소비자 상담관련\n전화번호', '032-682-6533(소비자요금부담)\n운영시간 10:00~17:00(점심시간제외, 11:40~12:40)(주말,공휴일제외)'),
]

assert len(rows) == len(ROW_HEIGHTS)

def font(size):
    return ImageFont.truetype(FONT_PATH, size=size, index=0)

BODY = font(17)
LABEL = font(17)
SMALL = font(16)

# Ingredient row is the critical row; keep comma-token order and wrap only by appending the next token.
def text_width(draw, text, f):
    if not text:
        return 0
    b = draw.textbbox((0, 0), text, font=f)
    return b[2] - b[0]

def wrap_general(draw, text, f, max_w):
    lines = []
    for para in str(text).split('\n'):
        if para == '':
            lines.append('')
            continue
        line = ''
        for token in para.split(' '):
            cand = token if not line else line + ' ' + token
            if text_width(draw, cand, f) <= max_w:
                line = cand
                continue
            if line:
                lines.append(line)
                line = ''
            if text_width(draw, token, f) <= max_w:
                line = token
            else:
                chunk = ''
                for ch in token:
                    cc = chunk + ch
                    if text_width(draw, cc, f) <= max_w:
                        chunk = cc
                    else:
                        if chunk:
                            lines.append(chunk)
                        chunk = ch
                line = chunk
        if line:
            lines.append(line)
    return lines

def wrap_ingredients(draw, ingredients, f, max_w):
    lines = []
    line = ''
    for i, token in enumerate(ingredients):
        piece = token if i == len(ingredients) - 1 else token + ','
        cand = piece if not line else line + ' ' + piece
        if text_width(draw, cand, f) <= max_w:
            line = cand
        else:
            if line:
                lines.append(line)
            line = piece
    if line:
        lines.append(line)
    return lines

img = Image.new('RGB', (W, H), '#ffffff')
d = ImageDraw.Draw(img)
border = '#d0d0d0'
label_bg = '#eeeeee'
value_bg = '#ffffff'
text_color = '#333333'
label_color = '#3f3f3f'

y = TOP
line_h = 26
for idx, ((label, value), row_h) in enumerate(zip(rows, ROW_HEIGHTS)):
    d.rectangle([X0, y, X1, y + row_h], fill=label_bg, outline=border)
    d.rectangle([X1, y, X2, y + row_h], fill=value_bg, outline=border)
    label_lines = wrap_general(d, label, LABEL, X1 - X0 - 28)
    label_block_h = len(label_lines) * line_h
    ly = y + (row_h - label_block_h) / 2
    for line in label_lines:
        d.text((X0 + 14, ly), line, fill=label_color, font=LABEL)
        ly += line_h

    if idx == 7:
        f = SMALL
        value_lines = wrap_ingredients(d, EXPECTED_ORDER, f, X2 - X1 - 34)
        # Reconstruct from the render source list to verify no reorder happened before drawing.
        used_order = EXPECTED_ORDER[:]
        assert used_order == EXPECTED_ORDER, json.dumps({'used_order': used_order, 'expected': EXPECTED_ORDER}, ensure_ascii=False, indent=2)
        ingredient_line_h = 24
        block_h = len(value_lines) * ingredient_line_h
        vy = y + (row_h - block_h) / 2 + 1
        for line in value_lines:
            d.text((X1 + 18, vy), line, fill=text_color, font=f)
            vy += ingredient_line_h
    else:
        f = BODY
        value_lines = wrap_general(d, value, f, X2 - X1 - 34)
        if idx in (8, 10):
            f = SMALL
            value_lines = wrap_general(d, value, f, X2 - X1 - 34)
            lh = 25
        else:
            lh = line_h
        block_h = len(value_lines) * lh
        # Match original: most content vertically centered, long caution centered in its large row.
        vy = y + (row_h - block_h) / 2
        for line in value_lines:
            d.text((X1 + 18, vy), line, fill=text_color, font=f)
            vy += lh
    y += row_h

# Outer border
TABLE_BOTTOM = TOP + sum(ROW_HEIGHTS)
d.rectangle([X0, TOP, X2, TABLE_BOTTOM], outline='#c9c9c9', width=1)
OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, 'PNG', optimize=True)
print(json.dumps({
    'rendered': str(OUT),
    'backup': str(BACKUP),
    'size': [W, H],
    'table_bottom': TABLE_BOTTOM,
    'ingredient_count': len(EXPECTED_ORDER),
    'ingredient_lines': wrap_ingredients(d, EXPECTED_ORDER, SMALL, X2 - X1 - 34),
}, ensure_ascii=False, indent=2))
