from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/coupang/images/whitening-cream/versions/v1/detail/16-original-ingredient-table.png'
BACKUP_DIR = ROOT / 'public/coupang/images/whitening-cream/versions/v1/detail/backup'
BACKUP_DIR.mkdir(parents=True, exist_ok=True)
if OUT.exists():
    shutil.copy2(OUT, BACKUP_DIR / '16-original-ingredient-table.before-clean-render.png')

W, H = 780, 1360
MARGIN_X = 32
TOP = 72
TABLE_W = W - MARGIN_X * 2
LABEL_W = 165
VALUE_W = TABLE_W - LABEL_W
FONT_PATH = '/System/Library/Fonts/AppleSDGothicNeo.ttc'

rows = [
    ('제품명', '유어스킨플러스 화이트닝 톤 케어 크림'),
    ('용량 또는 중량', '200ml / 6.76 fl. oz'),
    ('피부 타입', '모든 피부 타입'),
    ('사용기한', '제조일로부터 24개월 / 개봉후 12개월'),
    ('사용방법', '기초케어 마지막 단계에 얼굴 전체에 고르게 펴 발라줍니다.'),
    ('효과 효능', '피부의 미백에 도움을 줍니다.'),
    ('효능성분', '나이아신아마이드'),
    ('용법용량', '본 품 적당량을 취해 피부에 골고루 펴 바릅니다.'),
    ('화장품제조업자 및\n화장품책임판매업자', '(주)유어스킨'),
    ('제조국', '대한민국'),
    ('[화장품법]에 따라\n기재·표시하여야 하는\n모든 성분', '정제수, 카프릴릭/카프릭트라이글리세라이드, 글리세린, 시어버터, 나이아신아마이드, 폴리글리세릴-3다이스테아레이트, 세테아릴올리베이트, 프로판다이올, 세테아릴알코올, 솔비탄올리베이트, 비타민나무열매추출물, 다이프로필렌글라이콜, 해바라기씨오일, 마카다미아씨오일, 아르간커넬오일, 하이드록시에틸셀룰로오스, 카보머, 카프릴릴글라이콜, 글리세릴스테아레이트시트레이트, 판테놀, 알지닌, 부틸렌글라이콜, 밀싹추출물, 브로콜리추출물, 양배추추출물, 자주개자리추출물, 무씨추출물, 유채추출물, 펜틸렌글라이콜, 글루타티온, 다이포타슘글리시리제이트, 다이소듐이디티에이, 토코페롤, 1,2-헥산다이올'),
    ('사용상 주의사항', '1. 화장품을 사용시 또는 사용후 직사광선에 의하여 사용부위가 붉은 반점, 부어오름 또는 가려움증 등의 이상 증상이나 부작용이 있는 경우 전문의 등과 상담할 것  2. 상처가 있는 부위 등에는 사용을 자제할 것  3. 보관 및 취급 시 주의사항  가) 어린이의 손에 닿지 않는 곳에 보관할 것  나) 직사광선을 피해서 보관할 것'),
    ('품질보증기준', '본 제품에 이상이 있을 경우 공정거래위원회 고시 소비자분쟁해결기준에 의거 교환 또는 보상을 받을 수 있습니다.'),
    ('소비자 상담관련\n전화번호', '032-682-6533(소비자요금부담)\n운영시간 10:00~17:00(점심시간제외, 11:40~12:40)(주말,공휴일제외)'),
]


def load_font(size, index=0):
    return ImageFont.truetype(FONT_PATH, size=size, index=index)


def text_w(draw, text, font):
    if not text:
        return 0
    b = draw.textbbox((0, 0), text, font=font)
    return b[2] - b[0]


def wrap_text(draw, text, font, max_width):
    out = []
    for para in str(text).split('\n'):
        if not para:
            out.append('')
            continue
        line = ''
        tokens = para.split(' ')
        # Korean text often has long chunks; split char-wise when a token is too long.
        for token in tokens:
            candidate = token if not line else line + ' ' + token
            if text_w(draw, candidate, font) <= max_width:
                line = candidate
                continue
            if line:
                out.append(line)
                line = ''
            if text_w(draw, token, font) <= max_width:
                line = token
            else:
                chunk = ''
                for ch in token:
                    cand = chunk + ch
                    if text_w(draw, cand, font) <= max_width:
                        chunk = cand
                    else:
                        if chunk:
                            out.append(chunk)
                        chunk = ch
                line = chunk
        if line:
            out.append(line)
    return out


def calculate(font_size):
    dummy = Image.new('RGB', (W, H), 'white')
    draw = ImageDraw.Draw(dummy)
    font = load_font(font_size)
    label_font = load_font(font_size)
    title_font = load_font(30)
    line_h = int(font_size * 1.45)
    pad_y = 13
    computed = []
    for label, value in rows:
        label_lines = wrap_text(draw, label, label_font, LABEL_W - 22)
        value_lines = wrap_text(draw, value, font, VALUE_W - 24)
        h = max(len(label_lines), len(value_lines)) * line_h + pad_y * 2
        h = max(h, 50)
        computed.append((label_lines, value_lines, h))
    title_h = 52
    total_h = TOP + title_h + sum(h for _, _, h in computed)
    return total_h, computed, font, label_font, title_font, line_h, pad_y

font_size = 20
while font_size >= 17:
    total_h, computed, font, label_font, title_font, line_h, pad_y = calculate(font_size)
    if total_h <= H - 54:
        break
    font_size -= 1

total_h, computed, font, label_font, title_font, line_h, pad_y = calculate(font_size)
img = Image.new('RGB', (W, H), '#ffffff')
d = ImageDraw.Draw(img)

# subtle title
title = '제품 정보 및 전성분'
tw = text_w(d, title, title_font)
d.text(((W - tw) / 2, TOP), title, fill='#222222', font=title_font)
subtitle = '유어스킨플러스 화이트닝 톤 케어 크림'
sub_font = load_font(18)
sw = text_w(d, subtitle, sub_font)
d.text(((W - sw) / 2, TOP + 38), subtitle, fill='#777777', font=sub_font)

x0 = MARGIN_X
y = TOP + 82
x1 = x0 + LABEL_W
x2 = x0 + TABLE_W
border = '#d8d8d8'
label_bg = '#f1f1f1'
value_bg = '#ffffff'
text_color = '#333333'
label_color = '#3f3f3f'

for idx, ((label, value), (label_lines, value_lines, row_h)) in enumerate(zip(rows, computed)):
    d.rectangle([x0, y, x1, y + row_h], fill=label_bg, outline=border)
    d.rectangle([x1, y, x2, y + row_h], fill=value_bg, outline=border)
    # label vertical center
    label_block_h = len(label_lines) * line_h
    ly = y + (row_h - label_block_h) / 2
    for line in label_lines:
        d.text((x0 + 12, ly), line, fill=label_color, font=label_font)
        ly += line_h
    vy = y + pad_y
    for line in value_lines:
        d.text((x1 + 14, vy), line, fill=text_color, font=font)
        vy += line_h
    y += row_h

# outer border slightly darker
d.rectangle([x0, TOP + 82, x2, y], outline='#cfcfcf', width=1)

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, 'PNG', optimize=True)
print(f'rendered={OUT}')
print(f'font_size={font_size} table_bottom={y} file_size={OUT.stat().st_size}')
