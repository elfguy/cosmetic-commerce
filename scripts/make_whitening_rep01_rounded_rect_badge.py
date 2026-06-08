from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math

root = Path('/Users/elfguy/alba/cosmetic-commerce')
rep = root / 'public/coupang/images/whitening-cream/versions/v1/representative'
base_path = root / 'public/drive-originals/whitening-tone-care-cream/downloaded/톤케어크림.png'
canvas = Image.open(base_path).convert('RGBA')

# Font choices on macOS. Fall back gracefully.
def font(size, weight='regular'):
    candidates = []
    if weight == 'bold':
        candidates += [
            '/System/Library/Fonts/AppleSDGothicNeo.ttc',
            '/System/Library/Fonts/Supplemental/AppleGothic.ttf',
        ]
    else:
        candidates += [
            '/System/Library/Fonts/AppleSDGothicNeo.ttc',
            '/System/Library/Fonts/Supplemental/AppleGothic.ttf',
        ]
    for c in candidates:
        try:
            return ImageFont.truetype(c, size)
        except Exception:
            pass
    return ImageFont.load_default()

bold = font(31, 'bold')
regular = font(19, 'regular')
small = font(16, 'regular')

# Build rounded-rectangle badge itself, no separate backing card.
w, h = 235, 152
badge = Image.new('RGBA', (w, h), (0,0,0,0))
d = ImageDraw.Draw(badge)

# soft white fill inside the mark, but this is the mark body, not an extra card
outer = [3, 3, w-4, h-4]
# shadow-like antialias base
shadow = Image.new('RGBA', (w, h), (0,0,0,0))
sd = ImageDraw.Draw(shadow)
sd.rounded_rectangle([6,7,w-3,h-2], radius=42, fill=(70,160,145,22))
shadow = shadow.filter(ImageFilter.GaussianBlur(3))
badge.alpha_composite(shadow)

# two-tone rounded border: aqua upper/right + green lower/left by drawing arcs/lines
# base filled shape
shape = Image.new('RGBA', (w, h), (0,0,0,0))
s = ImageDraw.Draw(shape)
s.rounded_rectangle(outer, radius=38, fill=(255,255,255,246), outline=(90,194,178,255), width=5)
# overlay greener lower/left border by drawing another rounded rect partially masked
border2 = Image.new('RGBA', (w, h), (0,0,0,0))
b2 = ImageDraw.Draw(border2)
b2.rounded_rectangle(outer, radius=38, outline=(79,178,88,255), width=5)
mask = Image.new('L', (w,h), 0)
md = ImageDraw.Draw(mask)
md.rectangle([0, h//2-5, w, h], fill=180)
md.rectangle([0, 0, w//2+5, h], fill=150)
badge.alpha_composite(shape)
badge.alpha_composite(Image.composite(border2, Image.new('RGBA',(w,h),(0,0,0,0)), mask))

# simple leaf mark, same green identity
leaf_c = (63, 166, 86, 255)
leaf2 = (89, 197, 175, 255)
d = ImageDraw.Draw(badge)
d.ellipse([22, 28, 48, 54], fill=leaf_c)
d.ellipse([44, 24, 72, 52], fill=leaf2)
d.line([42, 55, 58, 34], fill=(55,135,92,255), width=3)

# centered Korean text
main = '신선 제품'
sub = '제조 6개월 이내'
mini = 'Fresh made'
def center_text(y, text, fnt, fill):
    bbox = d.textbbox((0,0), text, font=fnt)
    tw = bbox[2]-bbox[0]
    d.text(((w-tw)//2, y), text, font=fnt, fill=fill)
center_text(47, main, bold, (45, 145, 84, 255))
center_text(87, sub, regular, (58, 155, 139, 255))
center_text(116, mini, small, (116, 174, 159, 220))

# Place so the rounded badge itself has spacing, no product overlap. Product bbox top is ~282.
canvas.alpha_composite(badge, (38, 28))
out = rep / '01-rounded-rect-badge-variant.png'
canvas.convert('RGB').save(out, quality=95)

# smaller alternative: closer to original mark scale
canvas2 = Image.open(base_path).convert('RGBA')
badge_small = badge.resize((210, round(h*210/w)), Image.Resampling.LANCZOS)
canvas2.alpha_composite(badge_small, (43, 32))
out2 = rep / '01-rounded-rect-badge-variant-small.png'
canvas2.convert('RGB').save(out2, quality=95)

# QA compare with original mark-only and rounded-card rejected idea
panes=[]
for p,label in [
    (rep/'01.png','CURRENT CIRCLE MARK'),
    (out,'ROUNDED RECT BADGE'),
    (out2,'ROUNDED RECT SMALL'),
    (rep/'01-rounded-badge-card-variant-v2.png','WRONG: OUTER CARD'),
]:
    im=Image.open(p).convert('RGB')
    im.thumbnail((320,320), Image.Resampling.LANCZOS)
    pane=Image.new('RGB',(340,370),'white')
    pane.paste(im,((340-im.width)//2,32+(320-im.height)//2))
    ImageDraw.Draw(pane).text((10,10),label,fill=(20,20,20))
    panes.append(pane)
qa=Image.new('RGB',(340*len(panes),370),'white')
for i,p in enumerate(panes):
    qa.paste(p,(340*i,0))
qa_path=rep/'01-rounded-rect-badge-qa.png'
qa.save(qa_path, quality=95)
print(out, out.stat().st_size)
print(out2, out2.stat().st_size)
print(qa_path, qa_path.stat().st_size)
