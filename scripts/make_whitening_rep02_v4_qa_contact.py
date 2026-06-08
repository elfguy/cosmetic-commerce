from pathlib import Path
from PIL import Image, ImageDraw
root=Path('/Users/elfguy/alba/cosmetic-commerce')
base=root/'public/coupang/images/whitening-cream/versions/v1'
items=[
 ('ORIGINAL PRODUCT\n원본 제품 기준', base/'reference/whitening-cream-original-product-do-not-change.png'),
 ('CURRENT 02\n현재 복구본', base/'representative/02.png'),
 ('NEW GPT V4 CANDIDATE\n원본 첨부+제품변경 금지 프롬프트', base/'representative/02-gpt-product-locked-v4-candidate.png'),
]
W,H=520,520
label_h=76
canvas=Image.new('RGB',(W*len(items),H+label_h),'white')
d=ImageDraw.Draw(canvas)
for i,(label,p) in enumerate(items):
    im=Image.open(p).convert('RGB')
    im.thumbnail((W,H),Image.Resampling.LANCZOS)
    x=i*W+(W-im.width)//2
    y=(H-im.height)//2
    canvas.paste(im,(x,y))
    d.rectangle((i*W,H,i*W+W,H+label_h),fill=(245,245,245))
    d.text((i*W+14,H+12),label,fill=(20,20,20))
out=base/'representative/02-gpt-product-locked-v4-qa-contact.png'
canvas.save(out,optimize=True)
print(out, out.stat().st_size)
