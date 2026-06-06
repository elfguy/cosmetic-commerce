from pathlib import Path
from collections import deque
import shutil, time, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

ROOT = Path('/Users/elfguy/alba/cosmetic-commerce')
VER = ROOT/'public/coupang/images/hyaluronic-acid-toner/versions/v1'
BG = VER/'agent-representative-raw/02-gpt-background-only-1000.png'
PRODUCT = ROOT/'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'
OUT_RAW = VER/'agent-representative-raw/02-bg-real-product-natural-composite.png'
OUT = VER/'representative/02.png'
REJECTED = VER/'rejected'
PROMPTS = VER/'agent-representative-prompts'
FONT = '/System/Library/Fonts/AppleSDGothicNeo.ttc'

for p in [OUT_RAW.parent, OUT.parent, REJECTED, PROMPTS]:
    p.mkdir(parents=True, exist_ok=True)

# Archive previous live candidate
if OUT.exists():
    ts = time.strftime('%Y%m%dT%H%M%S')
    shutil.copy2(OUT, REJECTED/f'02-before-natural-composite-{ts}.png')

W=H=1000
bg = Image.open(BG).convert('RGBA').resize((W,H), Image.LANCZOS)
canvas = bg.copy()

# ---------- Extract product from black studio background using border flood-fill ----------
prod = Image.open(PRODUCT).convert('RGBA')
arr = np.array(prod)
rgb = arr[..., :3]
# black-ish background; include compression/noise around black
blackish = (rgb[...,0] < 42) & (rgb[...,1] < 42) & (rgb[...,2] < 42)
h,w = blackish.shape
visited = np.zeros((h,w), dtype=bool)
q = deque()
# seed all border black pixels
for x in range(w):
    if blackish[0,x]: q.append((0,x)); visited[0,x]=True
    if blackish[h-1,x]: q.append((h-1,x)); visited[h-1,x]=True
for y in range(h):
    if blackish[y,0] and not visited[y,0]: q.append((y,0)); visited[y,0]=True
    if blackish[y,w-1] and not visited[y,w-1]: q.append((y,w-1)); visited[y,w-1]=True
while q:
    y,x=q.popleft()
    for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ny,nx=y+dy,x+dx
        if 0<=ny<h and 0<=nx<w and (not visited[ny,nx]) and blackish[ny,nx]:
            visited[ny,nx]=True; q.append((ny,nx))
alpha = (~visited).astype(np.uint8)*255
# expand a little to retain translucent bottle edges, then feather
alpha_img = Image.fromarray(alpha, 'L').filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.4))
prod.putalpha(alpha_img)
# crop transparent margin
bbox = prod.getbbox()
prod = prod.crop(bbox)
# slight brightness/contrast for ad scene, preserving label
prod = ImageEnhance.Brightness(prod).enhance(1.03)
prod = ImageEnhance.Contrast(prod).enhance(1.04)
prod = ImageEnhance.Sharpness(prod).enhance(1.08)

# Resize product: product-realistic, no fat redraw, large enough but not cropped
target_h = 820
ratio = target_h / prod.height
prod = prod.resize((int(prod.width*ratio), target_h), Image.LANCZOS)

# Defringe: remove black studio-background halo only around the product boundary.
# This avoids the pasted/cutout look while keeping inner black label text intact.
pa = np.array(prod).astype(np.float32)
alpha_r = pa[..., 3]
edge_alpha = Image.fromarray(alpha_r.astype(np.uint8), 'L')
inner_min = np.array(edge_alpha.filter(ImageFilter.MinFilter(17)))
boundary = (alpha_r > 0) & (inner_min < 245)
# Only neutralize the black matte/fringe lightly. Avoid creating a white sticker outline.
lum = pa[...,0]*0.299 + pa[...,1]*0.587 + pa[...,2]*0.114
contaminated = boundary & (lum < 170)
strength = np.clip((255 - inner_min) / 255.0, 0, 1) * 0.36
edge_target = np.array([205, 212, 205], dtype=np.float32)
for c in range(3):
    pa[..., c] = np.where(contaminated, pa[..., c] * (1-strength) + edge_target[c] * strength, pa[..., c])
prod = Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8), 'RGBA')
# micro-feather final alpha
prod.putalpha(prod.getchannel('A').filter(ImageFilter.GaussianBlur(0.25)))

px = 592
py = 98

# ---------- Natural scene integration: glow + contact shadow, not white card ----------
# soft light halo behind bottle to separate from pale background
halo = Image.new('RGBA', (W,H), (0,0,0,0))
hd = ImageDraw.Draw(halo)
hd.ellipse((px-65, py+10, px+prod.width+50, py+prod.height-5), fill=(255,255,255,118))
halo = halo.filter(ImageFilter.GaussianBlur(42))
canvas.alpha_composite(halo)
# subtle ground shadow matching water surface
shadow = Image.new('RGBA', (W,H), (0,0,0,0))
sd = ImageDraw.Draw(shadow)
sd.ellipse((px+30, py+prod.height-70, px+prod.width-10, py+prod.height-8), fill=(50,95,95,50))
shadow = shadow.filter(ImageFilter.GaussianBlur(22))
canvas.alpha_composite(shadow)
# faint reflection/glass base
reflection = prod.crop((0, int(prod.height*0.62), prod.width, prod.height)).transpose(Image.FLIP_TOP_BOTTOM)
reflection.putalpha(reflection.getchannel('A').point(lambda a: int(a*0.10)))
reflection = reflection.resize((int(reflection.width*0.92), int(reflection.height*0.20)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.0))
canvas.alpha_composite(reflection, (px+18, py+prod.height-55))
# product
canvas.alpha_composite(prod, (px, py))

# ---------- Copy layout: clean Korean typography, no local patching over bad generated text ----------
d = ImageDraw.Draw(canvas)
# Try TTC indices: 0 regular, 8/9/10 often bold on mac; fallback to same if unavailable
def font(size, idx=0):
    try: return ImageFont.truetype(FONT, size=size, index=idx)
    except Exception: return ImageFont.truetype(FONT, size=size)
regular = font(32, 0)
medium = font(32, 4)
bold = font(32, 8)
brand_f = font(25, 4)
title_f = font(54, 8)
sub_f = font(28, 0)
chip_f = font(24, 4)
num_f = font(56, 8)
card_f = font(28, 4)
small_f = font(20, 0)
ink=(25,42,48,255)
teal=(0,128,116,255)
soft_teal=(0,145,132,255)
muted=(72,91,99,255)

# Brand + hook
x0=70
d.text((x0,120), 'YOURSKIN+', font=brand_f, fill=(0,92,88,255))
d.multiline_text((x0,190), '매일 쓰는\n산뜻 수분 토너', font=title_f, fill=ink, spacing=10)
d.multiline_text((x0,345), '끈적임 없이 가볍게,\n세안 후 촉촉한 첫 루틴', font=sub_f, fill=muted, spacing=12)

# Benefit chips
chip_y=455
for label in ['산뜻한 사용감', '피부결 정돈', '500ml 대용량']:
    tw = d.textlength(label, font=chip_f)
    box=(x0, chip_y, x0+tw+42, chip_y+50)
    d.rounded_rectangle(box, radius=25, fill=(232,255,251,220), outline=(109,211,199,180), width=1)
    d.text((x0+21, chip_y+12), label, font=chip_f, fill=teal)
    chip_y += 66

# Bottom card, positioned away from product
card=(68,736,500,862)
d.rounded_rectangle(card, radius=28, fill=(255,255,255,235))
# tiny shadow via translucent lower line
# Main number and copy
baseline=770
d.text((98, baseline), '500ml', font=num_f, fill=teal)
d.text((272, baseline+17), '넉넉한 대용량', font=card_f, fill=ink)
d.text((102, baseline+77), '원본 상품 이미지 기준 구성', font=small_f, fill=(92,112,118,255))

# Save
canvas = canvas.convert('RGB')
canvas.save(OUT_RAW, quality=95)
canvas.save(OUT, quality=95)

# Contact sheet representative 01~06
imgs=[]
for i in range(1,7):
    p=VER/f'representative/{i:02d}.png'
    if p.exists():
        im=Image.open(p).convert('RGB').resize((240,240), Image.LANCZOS)
        imgs.append((i,im))
if imgs:
    sheet=Image.new('RGB',(240*3, 285*((len(imgs)+2)//3)), 'white')
    sd=ImageDraw.Draw(sheet)
    labelf=ImageFont.truetype(FONT, size=22, index=8)
    for idx,(i,im) in enumerate(imgs):
        x=(idx%3)*240; y=(idx//3)*285
        sheet.paste(im,(x,y+32))
        sd.text((x+12,y+5), f'대표 {i:02d}', font=labelf, fill=(20,40,45))
    sheet.save(VER/'v1-representative-contact.jpg', quality=92)

meta={
  'createdAt': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
  'method': 'GPT Images background-only + original owned product flood-fill cutout + natural shadow/reflection composite',
  'background': str(BG.relative_to(ROOT)),
  'product': str(PRODUCT.relative_to(ROOT)),
  'output': str(OUT.relative_to(ROOT)),
  'notes': 'Removed white rounded product card look; preserved real product shape/label/fill; added soft halo, ground shadow, faint reflection.'
}
(PROMPTS/'02-natural-composite-meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(meta, ensure_ascii=False, indent=2))
