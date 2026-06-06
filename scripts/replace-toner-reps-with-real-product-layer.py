from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path('/Users/elfguy/alba/cosmetic-commerce')
V1 = ROOT / 'public/coupang/images/hyaluronic-acid-toner/versions/v1'
SRC = ROOT / 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'

# Exact owned product cutout from source transparent PNG.
prod = Image.open(SRC).convert('RGBA')
bbox = prod.getchannel('A').getbbox()
prod = prod.crop(bbox)

try:
    font_title = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 66)
    font_sub = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 34)
    font_chip = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 31)
    font_small = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 26)
except Exception:
    font_title = font_sub = font_chip = font_small = ImageFont.load_default()

CONFIG = {
    '02': {
        'title': ['매일 쓰는', '산뜻 수분 토너'],
        'sub': ['끈적임 없이 가볍게,', '세안 후 촉촉한 첫 루틴'],
        'chips': ['산뜻한 사용감', '피부결 정돈', '500ml 대용량'],
        'accent': (27, 147, 158), 'bg': (237, 250, 250),
        'prod_h': 775, 'prod_xy': (650, 118), 'left_w': 585,
    },
    '03': {
        'title': ['500ml', '넉넉한 수분 루틴'],
        'sub': ['아침저녁 부담 없이 쓰는', '대용량 데일리 토너'],
        'chips': ['500ml', '데일리', '넉넉한 용량'],
        'accent': (37, 156, 167), 'bg': (239, 250, 251),
        'prod_h': 790, 'prod_xy': (638, 115), 'left_w': 570,
    },
    '04': {
        'title': ['세안 후', '첫 수분'],
        'sub': ['건조해지기 전,', '가장 먼저 채우는 토너 케어'],
        'chips': ['첫 단계 수분', '산뜻한 시작', '피부결 정돈'],
        'accent': (31, 146, 159), 'bg': (241, 250, 249),
        'prod_h': 795, 'prod_xy': (636, 110), 'left_w': 575,
    },
    '05': {
        'title': ['하나로 4가지', '토너 케어'],
        'sub': ['닦토 · 흡토 · 스킨팩 · 레이어링', '데일리 루틴을 한 병으로'],
        'chips': ['닦토', '흡토', '스킨팩', '레이어링'],
        'accent': (33, 148, 154), 'bg': (238, 249, 248),
        'prod_h': 780, 'prod_xy': (660, 125), 'left_w': 590,
    },
    '06': {
        'title': ['수분', '레이어링'],
        'sub': ['겹겹이 가볍게 쌓는', '촉촉한 토너 루틴'],
        'chips': ['흡수감', '물방울 레이어', '데일리 보습'],
        'accent': (38, 153, 169), 'bg': (238, 249, 251),
        'prod_h': 800, 'prod_xy': (640, 103), 'left_w': 575,
    },
}

def rounded_rect(draw, xy, r, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)

def fit_product(height):
    w, h = prod.size
    nw = int(w * height / h)
    return prod.resize((nw, height), Image.LANCZOS)

def draw_bg(draw, cfg):
    # subtle aqua background, still inspired by agent-generated direction but product is exact real layer.
    bg = cfg['bg']
    for y in range(1000):
        t = y / 999
        col = tuple(int(bg[i]*(1-t) + 255*t) for i in range(3))
        draw.line([(0,y),(1000,y)], fill=col)
    # water/skin-care decorations
    accent = cfg['accent']
    for i,(x,y,r,a) in enumerate([(70,92,95,30),(880,130,135,26),(95,820,120,25),(815,870,105,28)]):
        draw.ellipse((x-r,y-r,x+r,y+r), fill=accent+(a,))
    for x in [40, 165, 285, 765, 875, 940]:
        draw.line((x, 0, x+30, 1000), fill=(255,255,255,90), width=10)
    # bottom water line
    pts = [(0,860),(130,835),(260,870),(420,842),(580,875),(740,846),(1000,870),(1000,1000),(0,1000)]
    draw.polygon(pts, fill=(205,239,242,145))

def compose(n, cfg):
    img = Image.new('RGBA', (1000,1000), (255,255,255,255))
    overlay = Image.new('RGBA', (1000,1000), (0,0,0,0))
    d = ImageDraw.Draw(overlay)
    draw_bg(d, cfg)
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # left copy block
    x0 = 62
    y = 110
    accent = cfg['accent']
    for idx,line in enumerate(cfg['title']):
        fill = (33,33,33) if idx == 0 else accent
        d.text((x0, y), line, font=font_title, fill=fill)
        y += 78
    y += 18
    for line in cfg['sub']:
        d.text((x0, y), line, font=font_sub, fill=(57,62,65))
        y += 50
    y += 28
    for chip in cfg['chips']:
        rounded_rect(d, (x0, y, x0+cfg['left_w']-55, y+62), 31, (143,228,224,235))
        d.text((x0+42, y+13), chip, font=font_chip, fill=(24,94,99))
        # simple droplet/spark icon circle
        d.ellipse((x0+13,y+18,x0+33,y+38), outline=(255,255,255), width=3)
        y += 82

    # product white/very-light panel to ensure old/redrawn product cannot leak through.
    px, py = cfg['prod_xy']
    ph = cfg['prod_h']
    pimg = fit_product(ph)
    pw, _ = pimg.size
    # soft shadow
    shadow = Image.new('RGBA', (pw+90, ph+80), (0,0,0,0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((30, ph-30, pw+80, ph+45), fill=(0,0,0,45))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    img.alpha_composite(shadow, (px-25, py+25))
    img.alpha_composite(pimg, (px, py))

    # bottom/right small cotton pad line for cosmetic context, not touching product
    d = ImageDraw.Draw(img)
    for i in range(5):
        d.ellipse((835+i*12, 850+i*5, 1015+i*12, 940+i*5), outline=(223,235,235,180), width=3)

    # save
    out = V1 / 'representative' / f'{n}.png'
    img.convert('RGB').save(out, quality=95)
    # keep raw audit copy
    raw_out = V1 / 'agent-representative-raw' / f'{n}-real-product-overlay.png'
    img.convert('RGB').save(raw_out, quality=95)
    print(n, out, pimg.size, 'product-source', SRC)

for n,cfg in CONFIG.items():
    compose(n,cfg)

# contact sheet
thumbs=[]
for n in ['01','02','03','04','05','06']:
    p=V1/'representative'/f'{n}.png'
    im=Image.open(p).resize((300,300), Image.LANCZOS).convert('RGB')
    tile=Image.new('RGB',(336,380),'white')
    td=ImageDraw.Draw(tile)
    td.text((12,12),f'대표 {n}',font=font_small,fill=(20,20,20))
    tile.paste(im,(18,60))
    thumbs.append(tile)
canvas=Image.new('RGB',(1008,760),(238,245,246))
for i,t in enumerate(thumbs):
    canvas.paste(t,((i%3)*336,(i//3)*380))
canvas.save(V1/'v1-representative-contact.jpg', quality=92)
print('contact', V1/'v1-representative-contact.jpg')
