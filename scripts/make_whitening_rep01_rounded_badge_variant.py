from PIL import Image, ImageFilter, ImageDraw
from pathlib import Path
import numpy as np

root = Path('/Users/elfguy/alba/cosmetic-commerce')
rep = root / 'public/coupang/images/whitening-cream/versions/v1/representative'
base_path = root / 'public/drive-originals/whitening-tone-care-cream/downloaded/톤케어크림.png'
badge_src_path = root / 'public/coupang/images/aqua-lotion/versions/v4/representative/01.png'

canvas = Image.open(base_path).convert('RGBA')
src = Image.open(badge_src_path).convert('RGBA')

# Extract approved badge colored pixels from aqua-lotion v4.
crop_box = (30, 30, 415, 405)
badge = src.crop(crop_box).convert('RGBA')
arr = np.array(badge)
r = arr[:, :, 0].astype(float)
g = arr[:, :, 1].astype(float)
b = arr[:, :, 2].astype(float)
mx = np.maximum.reduce([r, g, b])
mn = np.minimum.reduce([r, g, b])
sat = np.where(mx == 0, 0, (mx - mn) / mx)
cond_sat = sat > 0.16
cond_not_white = mx < 252
cond_green = np.logical_and(g > r + 8, g > b * 0.70)
cond_blue = np.logical_and(b > r + 8, g > r + 8)
mask = np.logical_and(np.logical_and(cond_sat, cond_not_white), np.logical_or(cond_green, cond_blue))
alpha = Image.fromarray((mask * 255).astype('uint8'), 'L').filter(ImageFilter.GaussianBlur(0.45))
badge.putalpha(alpha)
badge = badge.crop(badge.getbbox())
scale = 250 / badge.width
badge = badge.resize((round(badge.width * scale), round(badge.height * scale)), Image.Resampling.LANCZOS)

# Rounded card behind badge. Soft white/mint, subtle border/shadow, no product overlap.
card_w, card_h = badge.width + 48, badge.height + 42
card_x, card_y = 26, 20
shadow = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.rounded_rectangle(
    [card_x + 4, card_y + 6, card_x + card_w + 4, card_y + card_h + 6],
    radius=34,
    fill=(72, 155, 145, 20),
)
shadow = shadow.filter(ImageFilter.GaussianBlur(10))
canvas.alpha_composite(shadow)

d = ImageDraw.Draw(canvas)
d.rounded_rectangle(
    [card_x, card_y, card_x + card_w, card_y + card_h],
    radius=34,
    fill=(255, 255, 255, 232),
    outline=(186, 229, 219, 120),
    width=2,
)
# very subtle mint tint overlay inside card
# Paste badge centered in card.
pos = (card_x + 24, card_y + 20)
canvas.alpha_composite(badge, pos)

out = rep / '01-rounded-badge-card-variant.png'
canvas.convert('RGB').save(out, quality=95)

# comparison: current / rounded variant / source original
panes=[]
for p,label in [
    (rep/'01.png','CURRENT MARK ONLY'),
    (out,'ROUNDED CARD VARIANT'),
    (base_path,'DRIVE ORIGINAL'),
]:
    im=Image.open(p).convert('RGB')
    im.thumbnail((360,360), Image.Resampling.LANCZOS)
    pane=Image.new('RGB',(380,410),'white')
    pane.paste(im,((380-im.width)//2,30+(360-im.height)//2))
    ImageDraw.Draw(pane).text((12,10),label,fill=(20,20,20))
    panes.append(pane)
qa=Image.new('RGB',(380*len(panes),410),'white')
for i,pane in enumerate(panes): qa.paste(pane,(i*380,0))
qa_path=rep/'01-rounded-badge-card-qa.png'
qa.save(qa_path, quality=95)
print(out, out.stat().st_size)
print(qa_path, qa_path.stat().st_size)
