from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math

root = Path('/Users/elfguy/alba/cosmetic-commerce')
out_dir = root/'public/coupang/images/aqua-lotion/versions/v7-sequential-780'
out = out_dir/'detail/11.png'
archive = out_dir/'rejected/11-local-typography-overlap-rejected.png'
out_dir.joinpath('rejected').mkdir(parents=True, exist_ok=True)
if out.exists():
    Image.open(out).save(archive)

W,H = 780,1360
img = Image.new('RGB',(W,H),(248,253,254))
d = ImageDraw.Draw(img)
font_path = '/System/Library/Fonts/AppleSDGothicNeo.ttc'
def font(size): return ImageFont.truetype(font_path, size=size)
F_title=font(64); F_sub=font(25); F_card=font(31); F_small=font(24); F_note=font(21); F_open=font(28); F_num=font(23)

# soft background
for y in range(H):
    shade=int(y/H*12)
    d.line([(0,y),(W,y)], fill=(248-shade,253-shade//2,254))
for base, amp, col, width in [(190,14,(171,225,238),3),(220,10,(211,241,248),2),(1172,24,(184,232,242),4),(1228,18,(215,244,249),3)]:
    pts=[(x, base+math.sin(x/76)*amp+math.sin(x/33)*3) for x in range(-20,W+21,8)]
    d.line(pts, fill=col, width=width)
for x,y,r in [(64,170,5),(680,115,7),(710,150,4),(252,1244,14),(615,1250,13),(670,1290,8)]:
    d.ellipse((x-r,y-r,x+r,y+r), outline=(158,224,237), width=2)

# title
for text,y,f,fill in [('사용 방법',72,F_title,(42,48,52)),('HOW TO USE',166,F_sub,(78,181,187))]:
    bb=d.textbbox((0,0),text,font=f)
    d.text(((W-bb[2]+bb[0])/2,y),text,font=f,fill=fill)

# utility rounded card
def add_card(base,x,y,w,h,r=28):
    sh=Image.new('RGBA',(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sh)
    sd.rounded_rectangle((x+3,y+7,x+w+3,y+h+7),radius=r,fill=(70,130,145,32))
    sh=sh.filter(ImageFilter.GaussianBlur(11))
    rgba=base.convert('RGBA'); rgba.alpha_composite(sh)
    cd=ImageDraw.Draw(rgba)
    cd.rounded_rectangle((x,y,x+w,y+h),radius=r,fill=(255,255,255,255),outline=(224,244,247,255),width=2)
    return rgba.convert('RGB')

# two info cards
for y in [300,530]: img=add_card(img,44,y,692,170,26)
d=ImageDraw.Draw(img)
# simple icons
for idx,(cy,typ) in enumerate([(385,'face'),(615,'drop')],1):
    cx=126
    d.ellipse((cx-58,cy-58,cx+58,cy+58),fill=(232,250,251),outline=(160,224,228),width=2)
    if typ=='face':
        d.ellipse((cx-22,cy-16,cx+22,cy+34),outline=(82,172,176),width=3)
        d.arc((cx-26,cy-43,cx+26,cy-4),180,360,fill=(82,172,176),width=3)
        d.arc((cx-36,cy-6,cx-4,cy+44),240,80,fill=(82,172,176),width=3)
        d.arc((cx+4,cy-6,cx+36,cy+44),100,300,fill=(82,172,176),width=3)
    else:
        d.line([(cx,cy-42),(cx-34,cy+12),(cx,cy+48),(cx+34,cy+12),(cx,cy-42)],fill=(120,191,194),width=3)
        d.ellipse((cx-28,cy+22,cx+28,cy+34),outline=(160,218,222),width=3)
for num,y in [('1',334),('2',564)]:
    d.ellipse((240,y,278,y+38),fill=(84,184,188))
    bb=d.textbbox((0,0),num,font=F_num)
    d.text((240+(38-(bb[2]-bb[0]))/2,y+4),num,font=F_num,fill='white')
d.text((305,348),'얼굴에 골고루 펴 바른 후',font=F_card,fill=(45,48,50))
d.text((305,396),'부드럽게 흡수시켜 주세요.',font=F_card,fill=(45,48,50))
d.text((305,578),'건조한 부위에는',font=F_card,fill=(45,48,50))
d.text((305,626),'한 번 더 덧발라 주세요.',font=F_card,fill=(45,48,50))

# pump card
img=add_card(img,44,760,692,330,28)
d=ImageDraw.Draw(img)
# left text
x0,y0=82,815
d.text((x0,y0),'펌프 헤드를 ',font=F_small,fill=(45,48,50))
w1=d.textlength('펌프 헤드를 ',font=F_small)
d.text((x0+w1,y0),'OPEN',font=F_open,fill=(38,172,178))
w2=d.textlength('OPEN',font=F_open)
d.text((x0+w1+w2+6,y0),' 방향으로',font=F_small,fill=(45,48,50))
d.text((x0,y0+42),'살짝 돌려 올린 후 눌러 사용하세요.',font=F_small,fill=(45,48,50))
d.text((x0,y0+104),'무리하게 돌리거나 분리하지 마세요.',font=F_note,fill=(112,116,118))

# product / pump source: use current GPT only for photo crops; cover all source text by crop selection
src=Image.open(out_dir/'raw/11-refroles-gpt.png').convert('RGBA')
# pump crop tightly, excluding built-in open labels as much as possible
pump=src.crop((570,930,900,1370))
pump.thumbnail((250,360),Image.LANCZOS)
mask=Image.new('L',pump.size,0); ImageDraw.Draw(mask).rounded_rectangle((0,0,pump.size[0],pump.size[1]),radius=20,fill=255)
rgba=img.convert('RGBA'); rgba.paste(pump,(475,790),mask); img=rgba.convert('RGB'); d=ImageDraw.Draw(img)
# Remove any source-generated OPEN/PEN residue on the pump crop, then add one clean OPEN label.
# Wide white patch is intentional: the source image had AI-baked OPEN/PEN text around the pump.
d.rounded_rectangle((455,890,710,1015), radius=18, fill=(255,255,255))
d.text((555,928),'OPEN',font=F_open,fill=(38,172,178))
d.arc((505,978,690,1063),205,350,fill=(38,172,178),width=5)
d.polygon([(684,1019),(708,1011),(693,1035)],fill=(38,172,178))

# Do not paste the small bottle here: the AI source crop carried stray text. Keep the cut clean.
# clean base water/bubbles
for x,y,r in [(250,1242,14),(310,1262,7),(610,1250,13),(674,1290,8)]:
    d.ellipse((x-r,y-r,x+r,y+r),fill=(233,251,253),outline=(158,224,237),width=2)

img.save(out)
print(out)
print(img.size)
