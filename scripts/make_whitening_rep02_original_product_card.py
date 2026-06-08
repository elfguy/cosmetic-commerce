from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from pathlib import Path

root=Path('/Users/elfguy/alba/cosmetic-commerce')
rep=root/'public/coupang/images/whitening-cream/versions/v1/representative'
ref=root/'public/coupang/images/whitening-cream/versions/v1/reference/whitening-cream-original-product-do-not-change.png'
base=rep/'02-strict-attached-product-retouch-only-v3-candidate.png'
out=rep/'02-original-product-clean-card-candidate.png'
qa=rep/'02-original-product-clean-card-qa.png'

im=Image.open(base).convert('RGBA')
# Cover GPT product area with soft background panel
cover=Image.new('RGBA', im.size, (0,0,0,0))
d=ImageDraw.Draw(cover)
d.rounded_rectangle((455,390,985,820), radius=64, fill=(250,248,241,235))
cover=cover.filter(ImageFilter.GaussianBlur(22))
im=Image.alpha_composite(im, cover)

# Intentional product card
card=Image.new('RGBA', im.size, (0,0,0,0))
cd=ImageDraw.Draw(card)
card_box=(485,405,975,790)
# shadow
shadow=Image.new('RGBA', im.size, (0,0,0,0))
sd=ImageDraw.Draw(shadow)
sd.rounded_rectangle((card_box[0]+8,card_box[1]+18,card_box[2]+8,card_box[3]+18), radius=46, fill=(70,60,50,50))
shadow=shadow.filter(ImageFilter.GaussianBlur(18))
im=Image.alpha_composite(im, shadow)
# card face
cd.rounded_rectangle(card_box, radius=46, fill=(255,255,255,238), outline=(232,218,185,145), width=2)
im=Image.alpha_composite(im, card)

# Use original product image pixels: crop includes jar + its clean original white background.
prod=Image.open(ref).convert('RGB')
# crop to product with whitespace preserved enough to blend into white card
prod=prod.crop((115,235,900,785))
# Retouch only levels, no geometry change
prod=ImageEnhance.Brightness(prod).enhance(1.02)
prod=ImageEnhance.Contrast(prod).enhance(1.04)
# fit inside card preserving aspect ratio
max_w,max_h=450,310
scale=min(max_w/prod.width, max_h/prod.height)
prod=prod.resize((round(prod.width*scale), round(prod.height*scale)), Image.Resampling.LANCZOS).convert('RGBA')
px=card_box[0]+(card_box[2]-card_box[0]-prod.width)//2
py=card_box[1]+(card_box[3]-card_box[1]-prod.height)//2+15
im.alpha_composite(prod,(px,py))

im.convert('RGB').save(out,optimize=True)
# QA
W,H=1000,1000
canvas=Image.new('RGB',(W*3,H+70),'white')
items=[('ORIGINAL PRODUCT',Image.open(ref).convert('RGB').resize((W,H),Image.Resampling.LANCZOS)),('GPT STRICT',Image.open(base).convert('RGB')),('ORIGINAL PRODUCT CARD',Image.open(out).convert('RGB'))]
d=ImageDraw.Draw(canvas)
for i,(label,img) in enumerate(items):
 canvas.paste(img,(i*W,0)); d.rectangle((i*W,H,i*W+W,H+70),fill=(245,245,245)); d.text((i*W+20,H+24),label,fill=(30,30,30))
canvas.save(qa,optimize=True)
print(out, out.stat().st_size)
print(qa, qa.stat().st_size)
