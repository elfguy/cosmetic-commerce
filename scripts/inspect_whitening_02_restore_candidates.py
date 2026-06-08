from pathlib import Path
from PIL import Image, ImageDraw
import shutil, datetime
root=Path('/Users/elfguy/alba/cosmetic-commerce')
base=root/'public/coupang/images/whitening-cream/versions/v1'
rep=base/'representative'
rej=base/'rejected'
raw=base/'agent-representative-raw'
# backup current broken 02
cur=rep/'02.png'
backup=rej/f"02-broken-overwritten-original-product-{datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}.png"
if cur.exists(): shutil.copy2(cur, backup)
print('backed_current', backup)
paths=[
 ('CURRENT_BROKEN_02', cur),
 ('ORIGINAL_REF', base/'reference/whitening-cream-original-product-do-not-change.png'),
 ('BEFORE_STRICT_PRESERVE_REJECTED', rej/'02-rejected-product-changed-before-strict-preserve-20260607T205519Z.png'),
 ('ORIGINAL_JAR_REFRESH_RAW', raw/'02-original-jar-ratio-refresh-agent.png'),
 ('KEY_INGREDIENTS_RAW_OLD', raw/'02-key-ingredients-agent.png'),
 ('GPT_STRICT_V3_CANDIDATE', rep/'02-strict-attached-product-retouch-only-v3-candidate.png'),
 ('ORIGINAL_PRODUCT_CARD', rep/'02-original-product-clean-card-candidate.png'),
]
W=360; H=360; label_h=56
canvas=Image.new('RGB',(W*len(paths),H+label_h),'white')
d=ImageDraw.Draw(canvas)
for i,(label,p) in enumerate(paths):
    x=i*W
    if p.exists():
        im=Image.open(p).convert('RGB')
        im.thumbnail((W,H),Image.Resampling.LANCZOS)
        canvas.paste(im,(x+(W-im.width)//2,(H-im.height)//2))
        info=f'{label}\n{p.name} {p.stat().st_size}'
    else:
        info=f'{label}\nMISSING'
    d.rectangle((x,H,x+W,H+label_h), fill=(245,245,245))
    d.text((x+8,H+6),info,fill=(20,20,20))
out=rep/'02-restore-candidates-contact.png'
canvas.save(out,optimize=True)
print('contact',out,out.stat().st_size)
