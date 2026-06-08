from PIL import Image, ImageDraw
from pathlib import Path
root=Path('/Users/elfguy/alba/cosmetic-commerce')
rep=root/'public/coupang/images/whitening-cream/versions/v1/representative'
thumbs=[]
for i in range(1,6):
    p=rep/f'{i:02d}.png'
    im=Image.open(p).convert('RGB')
    im.thumbnail((360,360), Image.Resampling.LANCZOS)
    pane=Image.new('RGB',(360,410),'white')
    pane.paste(im,((360-im.width)//2,30+(360-im.height)//2))
    ImageDraw.Draw(pane).text((12,10),p.name,fill=(20,20,20))
    thumbs.append(pane)
sheet=Image.new('RGB',(360*len(thumbs),410),'white')
for i,im in enumerate(thumbs): sheet.paste(im,(360*i,0))
out=rep/'contact-01-05.png'
sheet.save(out,quality=95)
print(out, out.stat().st_size)
