from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from pathlib import Path

root = Path('/Users/elfguy/alba/cosmetic-commerce')
rep = root/'public/coupang/images/whitening-cream/versions/v1/representative'
ref = root/'public/coupang/images/whitening-cream/versions/v1/reference/whitening-cream-original-product-do-not-change.png'
base = rep/'02-strict-attached-product-retouch-only-v3-candidate.png'
out = rep/'02-product-pixel-preserve-composite-candidate.png'
qa = rep/'02-product-pixel-preserve-composite-qa.png'

im = Image.open(base).convert('RGBA')
prod_src = Image.open(ref).convert('RGBA')

# Crop product from original: product occupies central lower area. Keep exact pixels, trim mostly-white margins.
# Manual crop avoids changing product geometry. This crop includes natural product shadow/white edges.
w,h = prod_src.size
crop = prod_src.crop((120, 245, 890, 760))
# Slightly expand canvas around product kept for soft edge blending, not product deformation.

# Create mask: large rounded-rect/ellipse hybrid matching the low wide jar silhouette.
cw,ch = crop.size
mask = Image.new('L', (cw,ch), 0)
d = ImageDraw.Draw(mask)
# jar body + cap silhouette; keep soft edges
# body
body_box = (20, 150, cw-20, ch-10)
d.rounded_rectangle(body_box, radius=70, fill=255)
# cap
d.rounded_rectangle((25, 10, cw-25, 205), radius=80, fill=255)
# front label area and right side included by silhouette
mask = mask.filter(ImageFilter.GaussianBlur(2.2))

# Remove old generated product in base with a soft cream patch sampled from surrounding background.
patch_layer = Image.new('RGBA', im.size, (0,0,0,0))
pd = ImageDraw.Draw(patch_layer)
# product area approx in candidate
cover = (475, 420, 975, 785)
pd.rounded_rectangle(cover, radius=60, fill=(250,248,240,235))
patch_layer = patch_layer.filter(ImageFilter.GaussianBlur(26))
im = Image.alpha_composite(im, patch_layer)

# Resize product without changing aspect ratio. Original crop aspect retained.
target_w = 500
scale = target_w / crop.width
prod = crop.resize((target_w, round(crop.height*scale)), Image.Resampling.LANCZOS)
pmask = mask.resize(prod.size, Image.Resampling.LANCZOS)

# Very subtle retouch allowed: brightness/contrast only. Do not deform/alter label.
prod_rgb = prod.convert('RGB')
prod_rgb = ImageEnhance.Brightness(prod_rgb).enhance(1.02)
prod_rgb = ImageEnhance.Contrast(prod_rgb).enhance(1.03)
prod = prod_rgb.convert('RGBA')

x,y = 500, 430
# contact shadow below product
shadow = Image.new('RGBA', im.size, (0,0,0,0))
sd = ImageDraw.Draw(shadow)
sd.ellipse((x+35, y+prod.height-35, x+prod.width-35, y+prod.height+30), fill=(80,70,55,55))
shadow = shadow.filter(ImageFilter.GaussianBlur(20))
im = Image.alpha_composite(im, shadow)

layer = Image.new('RGBA', im.size, (0,0,0,0))
layer.paste(prod, (x,y), pmask)
im = Image.alpha_composite(im, layer)

im.convert('RGB').save(out, optimize=True)

# QA contact: original, GPT candidate, pixel-preserve composite
W,H=1000,1000
canvas=Image.new('RGB',(W*3, H+70),'white')
items=[('ORIGINAL PRODUCT', Image.open(ref).convert('RGB').resize((W,H), Image.Resampling.LANCZOS)), ('GPT STRICT CANDIDATE', Image.open(base).convert('RGB')), ('PIXEL-PRESERVE COMPOSITE', Image.open(out).convert('RGB'))]
d=ImageDraw.Draw(canvas)
for i,(label,img) in enumerate(items):
    canvas.paste(img,(i*W,0))
    d.rectangle((i*W,H,i*W+W,H+70), fill=(245,245,245))
    d.text((i*W+20,H+24), label, fill=(30,30,30))
canvas.save(qa, optimize=True)
print(out, out.stat().st_size)
print(qa, qa.stat().st_size)
