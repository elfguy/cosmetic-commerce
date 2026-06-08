from PIL import Image, ImageFilter, ImageDraw
from pathlib import Path
import numpy as np

root = Path('/Users/elfguy/alba/cosmetic-commerce')
rep = root / 'public/coupang/images/whitening-cream/versions/v1/representative'
base_path = root / 'public/drive-originals/whitening-tone-care-cream/downloaded/톤케어크림.png'
badge_src_path = root / 'public/coupang/images/aqua-lotion/versions/v4/representative/01.png'
canvas = Image.open(base_path).convert('RGBA')
src = Image.open(badge_src_path).convert('RGBA')

crop_box = (30, 30, 415, 405)
badge = src.crop(crop_box).convert('RGBA')
arr = np.array(badge)
r = arr[:, :, 0].astype(float); g = arr[:, :, 1].astype(float); b = arr[:, :, 2].astype(float)
mx = np.maximum.reduce([r, g, b]); mn = np.minimum.reduce([r, g, b])
sat = np.where(mx == 0, 0, (mx - mn) / mx)
mask = np.logical_and.reduce([
    sat > 0.16,
    mx < 252,
    np.logical_or(np.logical_and(g > r + 8, g > b * 0.70), np.logical_and(b > r + 8, g > r + 8))
])
alpha = Image.fromarray((mask * 255).astype('uint8'), 'L').filter(ImageFilter.GaussianBlur(0.45))
badge.putalpha(alpha)
badge = badge.crop(badge.getbbox())

# Smaller card: keep bottom safely above original jar bbox top (~282px).
scale = 204 / badge.width
badge = badge.resize((round(badge.width * scale), round(badge.height * scale)), Image.Resampling.LANCZOS)
card_w, card_h = badge.width + 34, badge.height + 30
card_x, card_y = 28, 14
# card bottom should stay clearly above original jar bbox top (~282px)
assert card_y + card_h < 260, (card_y + card_h)

shadow = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.rounded_rectangle([card_x + 3, card_y + 5, card_x + card_w + 3, card_y + card_h + 5], radius=28, fill=(67, 148, 140, 16))
shadow = shadow.filter(ImageFilter.GaussianBlur(8))
canvas.alpha_composite(shadow)

d = ImageDraw.Draw(canvas)
d.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=28, fill=(255, 255, 255, 226), outline=(181, 229, 218, 105), width=2)
canvas.alpha_composite(badge, (card_x + 18, card_y + 16))

out = rep / '01-rounded-badge-card-variant-v2.png'
canvas.convert('RGB').save(out, quality=95)

# QA compare: current mark only / v1 / v2 / original
panes=[]
for p,label in [
    (rep/'01.png','CURRENT MARK ONLY'),
    (rep/'01-rounded-badge-card-variant.png','CARD V1 TOO BIG'),
    (out,'CARD V2 SMALL'),
    (base_path,'DRIVE ORIGINAL'),
]:
    im=Image.open(p).convert('RGB')
    im.thumbnail((330,330), Image.Resampling.LANCZOS)
    pane=Image.new('RGB',(350,380),'white')
    pane.paste(im,((350-im.width)//2,30+(330-im.height)//2))
    ImageDraw.Draw(pane).text((10,10),label,fill=(20,20,20))
    panes.append(pane)
qa=Image.new('RGB',(350*len(panes),380),'white')
for i,pane in enumerate(panes): qa.paste(pane,(i*350,0))
qa_path=rep/'01-rounded-badge-card-v2-qa.png'
qa.save(qa_path, quality=95)
print(out, out.stat().st_size)
print(qa_path, qa_path.stat().st_size)
