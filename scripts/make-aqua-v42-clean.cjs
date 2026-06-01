const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const sharp = require('sharp');

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/aqua-lotion');
const outRoot = path.join(base, 'versions/v42-clean');
const outDetail = path.join(outRoot, 'detail');
const outRep = path.join(outRoot, 'representative');
fs.mkdirSync(outDetail, { recursive: true });
fs.mkdirSync(outRep, { recursive: true });

const srcV4Web = path.join(base, 'versions/v4-gpt-web');
for (const n of ['01','02','03','04','05','06']) {
  fs.copyFileSync(path.join(srcV4Web, 'representative', `${n}.png`), path.join(outRep, `${n}.png`));
}
// Keep only the approved first detail cut from V4 GPT Web.
fs.copyFileSync(path.join(srcV4Web, 'detail/01.png'), path.join(outDetail, '01.png'));

const product = path.join(base, 'versions/original/representative/01.png');
const productAlt = path.join(base, 'assets/drive/aqua-lotion-transparent-main.png');
const hand = path.join(base, 'assets/stock/pexels-hand-pump-lotion-5563659.jpg');
const water = path.join(base, 'assets/stock/unsplash-water-droplets-9w5T19x1Y74.jpg');
const packshot = path.join(base, 'assets/drive/aqua-lotion-packshot.png');

function fileUrl(p) { return 'file://' + p; }

const commonCss = `
@font-face{font-family:AppleSD;src:local('Apple SD Gothic Neo');}
*{box-sizing:border-box} body{margin:0;font-family:AppleSD,'Pretendard','Noto Sans KR',Arial,sans-serif;color:#142f43;background:white;}
.page{width:876px;height:1796px;position:relative;overflow:hidden;background:linear-gradient(180deg,#fbfeff 0%,#eff9ff 48%,#ffffff 100%);}
.bg{position:absolute;inset:0;background:radial-gradient(circle at 15% 15%,rgba(102,198,245,.23),transparent 34%),radial-gradient(circle at 85% 74%,rgba(115,213,166,.22),transparent 34%);} 
.wave{position:absolute;left:-90px;right:-90px;bottom:-110px;height:470px;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.95),rgba(199,236,255,.72) 35%,rgba(112,190,238,.42) 72%,transparent 73%);filter:blur(.2px)}
.bubble{position:absolute;border-radius:50%;background:rgba(255,255,255,.56);border:1px solid rgba(63,171,224,.26);box-shadow:inset 0 0 18px rgba(93,188,232,.18),0 10px 24px rgba(49,124,156,.08)}
.brand{position:absolute;left:70px;top:72px;font-size:24px;font-weight:900;letter-spacing:.02em;color:#163447}.leaf{color:#2b9a55}.heroTitle{position:absolute;left:70px;right:70px;top:130px;font-size:64px;line-height:1.12;letter-spacing:-.06em;font-weight:900;color:#11304a}.heroTitle .blue{color:#0876ca}.heroTitle .green{color:#24915b}.sub{position:absolute;left:70px;right:70px;top:306px;font-size:29px;line-height:1.55;letter-spacing:-.035em;color:#3d5d70;font-weight:650}.product{position:absolute;filter:drop-shadow(0 26px 42px rgba(31,98,132,.18));}.card{background:rgba(255,255,255,.9);border:1px solid rgba(111,185,213,.25);box-shadow:0 16px 46px rgba(55,131,166,.13);border-radius:34px}.pill{display:inline-flex;align-items:center;gap:12px;border-radius:999px;padding:16px 22px;background:#eefaf3;border:1px solid #c9ecd7;color:#247a55;font-weight:900;font-size:23px}.mini{font-size:21px;line-height:1.42;color:#577080;letter-spacing:-.025em}.note{position:absolute;left:70px;right:70px;bottom:54px;font-size:18px;color:#78909d;line-height:1.45;letter-spacing:-.02em}.icon{width:76px;height:76px;border-radius:26px;background:linear-gradient(135deg,#e9fbff,#eaf8ef);display:flex;align-items:center;justify-content:center;font-size:39px;color:#1594cc;margin-bottom:16px}.greenText{color:#24915b}.blueText{color:#0876ca}.dark{color:#11304a}.center{text-align:center}h3,h4,p{margin:0}
`;

function bubbles(){
  return `<div class="bubble" style="left:36px;top:250px;width:92px;height:92px"></div><div class="bubble" style="right:42px;top:190px;width:126px;height:126px"></div><div class="bubble" style="left:720px;top:690px;width:54px;height:54px"></div><div class="bubble" style="left:110px;top:1120px;width:38px;height:38px"></div>`;
}

function page(kind){
  const data = {
    '02': {title:'이런 분께\n추천합니다', sub:'매일 쓰는 데일리 보습 로션\n부담 없이 촉촉한 루틴을 시작해보세요', layout:'recommend'},
    '03': {title:'히알루론산\n레이어 보습', sub:'가볍게 스며드는 수분감이\n피부 표면부터 편안하게 감싸줍니다', layout:'layer'},
    '04': {title:'자연 유래 성분으로\n편안한 데일리 케어', sub:'병풀·해양심층수·새싹 유래 성분을\n균형 있게 담은 촉촉한 수분 루틴', layout:'ingredients'},
    '05': {title:'새싹 유래 원료\n특성 기반 케어', sub:'산뜻하고 편안한 사용감을 위해\n식물 유래 보습 성분을 더했습니다', layout:'sprout'},
    '06': {title:'순하게 덜어낸\n데일리 포뮬러', sub:'강한 향과 무거운 사용감 대신\n얼굴과 바디에 편안한 수분감을 남깁니다', layout:'formula'},
    '07': {title:'피부 밸런스를 지키는\n약산성 데일리 케어', sub:'매일 씻고 바르는 루틴 속에서도\n부담 없이 산뜻한 보습감을 전합니다', layout:'balance'},
    '08': {title:'신선함은\n제조일자에서 시작됩니다', sub:'사용기한만 보지 않고 제조일자까지\n확인할 수 있도록 안내합니다', layout:'fresh'},
    '09': {title:'How to use', sub:'샤워 후 또는 건조함이 느껴질 때\n얼굴과 바디에 부드럽게 펴 발라주세요', layout:'use'},
    '10': {title:'실속 있는 포장,\n제조사 직접 판매', sub:'불필요한 단상자를 줄이고\n제품과 소비자에게 필요한 부분에 집중합니다', layout:'direct'},
  }[kind];
  const [l1,l2=''] = data.title.split('\n');
  const [s1,s2=''] = data.sub.split('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${commonCss}${layoutCss(data.layout)}</style></head><body><div class="page"><div class="bg"></div>${bubbles()}<div class="wave"></div><div class="brand">YOURSKIN<span class="leaf">+</span></div><div class="heroTitle">${l1}<br><span class="${kind==='09'?'blue':'green'}">${l2}</span></div><div class="sub">${s1}<br>${s2}</div>${layoutHtml(data.layout)}<div class="note">*상기 내용은 원료 특성 및 제품 사용감을 설명하기 위한 이미지입니다. 개인에 따라 사용감은 다를 수 있습니다.</div></div></body></html>`;
}

function layoutCss(layout){
  switch(layout){
    case 'recommend': return `.product{left:86px;bottom:130px;width:355px}.list{position:absolute;right:66px;top:570px;width:398px;display:flex;flex-direction:column;gap:24px}.item{min-height:174px;padding:30px 28px;display:grid;grid-template-columns:78px 1fr;gap:18px;align-items:center}.item h3{font-size:32px;line-height:1.25;letter-spacing:-.05em}.item p{font-size:24px;line-height:1.38;color:#2f4e62}`;
    case 'layer': return `.product{right:64px;top:345px;width:250px}.molecule{position:absolute;left:64px;top:500px;width:330px;height:330px;border-radius:50%;background:radial-gradient(circle,#fff 0%,#dff5ff 62%,#9edaf6 100%);display:flex;align-items:center;justify-content:center;font-size:82px;color:#1392d1;box-shadow:0 24px 60px rgba(56,142,183,.18)}.system{position:absolute;left:62px;right:62px;top:900px;padding:40px}.bars{display:grid;gap:20px;margin-top:26px}.bar{height:86px;border-radius:24px;background:linear-gradient(90deg,#e8f7ff,#f7fffb);border:1px solid #d4edf5;display:flex;align-items:center;padding:0 26px;font-size:25px;font-weight:850;color:#1e566f}.cards{position:absolute;left:64px;right:64px;bottom:170px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}.cards .card{padding:26px 14px;text-align:center}.cards h4{font-size:23px;color:#11304a}.cards p{font-size:18px;color:#667e8c;margin-top:8px}`;
    case 'ingredients': return `.product{right:70px;top:310px;width:255px}.grid{position:absolute;left:62px;right:62px;top:600px;display:grid;grid-template-columns:1fr 1fr;gap:20px}.ing{height:235px;padding:24px;text-align:center;overflow:hidden}.ing img{width:100%;height:100px;object-fit:cover;border-radius:22px;margin-bottom:14px}.ing h3{font-size:27px;color:#1672a8}.ing p{font-size:20px;color:#536f80;margin-top:8px}.bottom{position:absolute;left:70px;right:70px;bottom:170px;padding:34px;display:flex;gap:20px;align-items:center}.bottom .icon{margin:0}.bottom h3{font-size:30px}.bottom p{font-size:22px;color:#557282;margin-top:8px;line-height:1.4}`;
    case 'sprout': return `.product{right:72px;top:500px;width:255px}.plantHero{position:absolute;left:60px;top:450px;width:435px;height:570px;border-radius:48px;background:linear-gradient(180deg,#effbf3,#dff4e7);overflow:hidden;border:1px solid #d2ecd8}.plantHero:before{content:'';position:absolute;left:0;right:0;bottom:0;height:130px;background:linear-gradient(180deg,#765338,#3f2b1c)}.stem{position:absolute;bottom:110px;width:10px;background:#50a857;border-radius:99px;transform-origin:bottom}.leafShape{position:absolute;width:78px;height:42px;background:#58b96a;border-radius:100% 8% 100% 8%;transform:rotate(-28deg)}.benefits{position:absolute;left:66px;right:66px;bottom:190px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}.benefits .card{padding:28px 18px;text-align:center;min-height:180px}.benefits h3{font-size:27px;color:#11415b}.benefits p{font-size:20px;color:#557282;margin-top:12px;line-height:1.36}`;
    case 'formula': return `.product{right:55px;bottom:170px;width:310px}.grid{position:absolute;left:64px;top:520px;width:440px;display:grid;gap:22px}.trust{padding:30px;display:grid;grid-template-columns:86px 1fr;gap:20px;align-items:center}.trust .icon{margin:0}.trust h3{font-size:29px;letter-spacing:-.045em}.trust p{font-size:21px;color:#557282;line-height:1.38;margin-top:8px}.doc{position:absolute;left:64px;right:64px;bottom:165px;height:220px;padding:36px}.doc h3{font-size:32px}.line{height:15px;background:#e7f2f6;border-radius:99px;margin:18px 0}.line.short{width:68%}`;
    case 'balance': return `.product{left:300px;top:505px;width:285px}.arc{position:absolute;left:128px;top:435px;width:620px;height:330px;border-radius:330px 330px 0 0;background:conic-gradient(from 250deg,#8bbfe9,#b8dfae,#90c8f0);clip-path:polygon(0 0,100% 0,100% 78%,0 78%);opacity:.82}.arcInner{position:absolute;left:178px;top:490px;width:520px;height:250px;border-radius:260px 260px 0 0;background:#fbfeff}.chips{position:absolute;left:64px;right:64px;top:900px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}.chips .card{padding:28px 18px;text-align:center}.section{position:absolute;left:64px;right:64px;bottom:180px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}.section .card{padding:20px;text-align:center}.section img{width:100%;height:105px;object-fit:cover;border-radius:22px;margin-bottom:14px}.section h4{font-size:22px;color:#145f90}`;
    case 'fresh': return `.product{right:54px;bottom:115px;width:255px}.seal{position:absolute;left:92px;top:510px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,#fff 0%,#e9f9ff 68%,#b7e8ff 100%);border:1px solid #bfe5f4;display:flex;align-items:center;justify-content:center;text-align:center;box-shadow:0 24px 60px rgba(56,142,183,.16)}.seal h3{font-size:40px;line-height:1.28;color:#176a8e}.boxes{position:absolute;right:64px;top:540px;width:345px;display:grid;gap:22px}.box{padding:30px}.box h3{font-size:28px}.box p{font-size:21px;color:#557282;line-height:1.38;margin-top:12px}.flow{position:absolute;left:70px;right:70px;bottom:220px;padding:36px;display:grid;grid-template-columns:82px 1fr;gap:22px;align-items:center}.flow h3{font-size:32px}.flow p{font-size:23px;color:#557282;line-height:1.45;margin-top:8px}`;
    case 'use': return `.product{right:70px;top:345px;width:240px}.photo{position:absolute;left:64px;right:64px;top:610px;height:470px;border-radius:38px;overflow:hidden;border:1px solid #d9edf5;box-shadow:0 18px 44px rgba(49,124,156,.13)}.photo img{width:100%;height:100%;object-fit:cover}.steps{position:absolute;left:64px;right:64px;bottom:185px;display:grid;grid-template-columns:1fr 1fr;gap:22px}.step{padding:32px}.step h3{font-size:31px}.step p{font-size:22px;color:#557282;line-height:1.38;margin-top:10px}.tip{position:absolute;left:64px;right:64px;bottom:82px;padding:22px 28px;border-radius:24px;background:#f1fbff;border:1px solid #d7eef7;font-size:21px;font-weight:800;color:#247197}`;
    case 'direct': return `.product{right:72px;top:490px;width:255px}.pack{position:absolute;left:76px;top:570px;width:250px;height:360px;border-radius:28px;background:linear-gradient(135deg,#e7d4bb,#b69570);box-shadow:0 26px 54px rgba(97,75,43,.18);display:flex;align-items:center;justify-content:center;text-align:center;color:#423323;font-weight:900;font-size:25px;line-height:1.25}.cards{position:absolute;left:64px;right:64px;top:1010px;display:grid;grid-template-columns:1fr 1fr;gap:22px}.cards .card{padding:34px;min-height:220px}.cards h3{font-size:31px}.cards p{font-size:22px;color:#557282;line-height:1.4;margin-top:12px}.official{position:absolute;left:64px;right:64px;bottom:165px;padding:42px;background:linear-gradient(135deg,#12384f,#1d7288);border-radius:42px;color:white}.official h3{font-size:40px}.official p{font-size:24px;line-height:1.45;color:#e7fbff;margin-top:12px}`;
  }
}

function layoutHtml(layout){
  switch(layout){
    case 'recommend': return `<img class="product" src="${fileUrl(product)}"><div class="list"><div class="item card"><div class="icon">💧</div><div><h3><span class="blueText">속건조</span>가 느껴지는 피부</h3><p>가볍고 촉촉한 데일리 수분감</p></div></div><div class="item card"><div class="icon">🌿</div><div><h3><span class="greenText">끈적임 없는</span> 산뜻한 보습</h3><p>얼굴과 바디 모두 편하게</p></div></div><div class="item card"><div class="icon">✨</div><div><h3>부담 없이 쓰는 <span class="greenText">순한 루틴</span></h3><p>온 가족 데일리 로션으로</p></div></div></div>`;
    case 'layer': return `<img class="product" src="${fileUrl(product)}"><div class="molecule">💧</div><div class="system card"><h3 style="font-size:38px">수분을 겹겹이 채우는 느낌</h3><div class="bars"><div class="bar">피부 표면을 촉촉하게 감싸는 수분막</div><div class="bar">건조함이 느껴지는 부위까지 편안하게</div><div class="bar">산뜻하게 마무리되는 데일리 보습</div></div></div><div class="cards"><div class="card"><h4>수분 보습</h4><p>히알루론산 기반</p></div><div class="card"><h4>피부결 정돈</h4><p>매끈한 사용감</p></div><div class="card"><h4>흡수감</h4><p>끈적임 부담 완화</p></div></div>`;
    case 'ingredients': return `<img class="product" src="${fileUrl(product)}"><div class="grid"><div class="ing card"><img src="${fileUrl(water)}"><h3>해양심층수</h3><p>청량한 수분감</p></div><div class="ing card"><img src="${fileUrl(water)}"><h3>병풀추출물</h3><p>편안한 진정 케어</p></div><div class="ing card"><img src="${fileUrl(water)}"><h3>AHA · PHA</h3><p>매끈한 피부결</p></div><div class="ing card"><img src="${fileUrl(water)}"><h3>식물 유래 성분</h3><p>산뜻한 보습감</p></div></div><div class="bottom card"><div class="icon">🌿</div><div><h3>자연 유래 원료를 균형 있게</h3><p>매일 사용하는 로션답게 촉촉함과 산뜻함을 함께 고려했습니다.</p></div></div>`;
    case 'sprout': return `<img class="product" src="${fileUrl(product)}"><div class="plantHero">${Array.from({length:12},(_,i)=>`<div class="stem" style="left:${50+i*30}px;height:${260+(i%4)*38}px;transform:rotate(${-10+i*2}deg)"></div><div class="leafShape" style="left:${34+i*30}px;bottom:${300+(i%4)*38}px"></div>`).join('')}</div><div class="benefits"><div class="card"><h3>민감 피부 고려</h3><p>편안한 데일리 케어</p></div><div class="card"><h3>새싹 유래 성분</h3><p>식물성 보습 포뮬러</p></div><div class="card"><h3>가벼운 마무리</h3><p>산뜻한 사용감</p></div></div>`;
    case 'formula': return `<img class="product" src="${fileUrl(product)}"><div class="grid"><div class="trust card"><div class="icon">✓</div><div><h3>EWG 그린 등급 기준</h3><p>원료 정보를 쉽게 이해할 수 있도록 정리했습니다.</p></div></div><div class="trust card"><div class="icon">○</div><div><h3>무향에 가까운 담백함</h3><p>강한 향보다 매일 쓰기 편한 사용감에 집중했습니다.</p></div></div><div class="trust card"><div class="icon">水</div><div><h3>가볍고 산뜻한 수분감</h3><p>얼굴과 바디 모두 부담 없이 바르기 좋습니다.</p></div></div></div><div class="doc card"><h3>성분 자료와 시험 자료 확인</h3><div class="line"></div><div class="line short"></div><p class="mini">공식 판매처 안내 기준으로 제품 정보를 확인해 주세요.</p></div>`;
    case 'balance': return `<div class="arc"></div><div class="arcInner"></div><img class="product" src="${fileUrl(product)}"><div class="chips"><div class="card center"><div class="icon" style="margin:0 auto 14px">💧</div><h3>촉촉한 밸런스</h3></div><div class="card center"><div class="icon" style="margin:0 auto 14px">🌿</div><h3>편안한 피부 루틴</h3></div><div class="card center"><div class="icon" style="margin:0 auto 14px">🛡️</div><h3>보습막 케어</h3></div></div><div class="section"><div class="card"><img src="${fileUrl(water)}"><h4>자연 유래 보습 성분</h4></div><div class="card"><img src="${fileUrl(water)}"><h4>데일리 수분 케어</h4></div><div class="card"><img src="${fileUrl(water)}"><h4>산뜻한 마무리</h4></div></div>`;
    case 'fresh': return `<div class="seal"><h3>최근 제조분<br>선별 출고</h3></div><div class="boxes"><div class="box card"><h3>제조일자 확인</h3><p>상품 수령 후 제조번호와 제조일자를 함께 확인할 수 있습니다.</p></div><div class="box card"><h3>신선한 제품 약속</h3><p>오래 묵은 재고가 아닌 신선한 제품을 보내드립니다.</p></div></div><div class="flow card"><div class="icon" style="margin:0">✓</div><div><h3>제조부터 배송까지 투명하게</h3><p>공식 판매처 기준으로 제품 정보를 바로 확인할 수 있습니다.</p></div></div><img class="product" src="${fileUrl(product)}">`;
    case 'use': return `<img class="product" src="${fileUrl(product)}"><div class="photo"><img src="${fileUrl(hand)}"></div><div class="steps"><div class="step card"><h3>적당량 덜기</h3><p>펌프를 눌러 손바닥에 적당량을 덜어주세요.</p></div><div class="step card"><h3>부드럽게 펴 바르기</h3><p>건조한 얼굴과 바디에 가볍게 흡수시켜 주세요.</p></div></div><div class="tip">TIP · 샤워 후 물기가 마르기 전에 바르면 더욱 촉촉하게 느껴집니다.</div>`;
    case 'direct': return `<div class="pack">YOURSKIN+<br>AQUA LOTION</div><img class="product" src="${fileUrl(product)}"><div class="cards"><div class="card"><h3>불필요한 포장 부담을 줄이고</h3><p>내용물과 배송 안정성에 집중한 실속 포장입니다.</p></div><div class="card"><h3>제조사가 직접 만들고 판매합니다</h3><p>중간 유통 부담을 줄이고 신선한 제품 공급을 지향합니다.</p></div></div><div class="official"><h3>정품은 공식 판매처에서 구매해 주세요</h3><p>무단 리셀러나 비공식 판매처의 과장 정보에 주의해 주세요.</p></div>`;
  }
}

(async()=>{
  const browser = await chromium.launch({ headless: true });
  for (const kind of ['02','03','04','05','06','07','08','09','10']) {
    const htmlPath = `/tmp/aqua-v42-${kind}.html`;
    fs.writeFileSync(htmlPath, page(kind));
    const pageObj = await browser.newPage({ viewport: { width: 876, height: 1796 }, deviceScaleFactor: 1 });
    await pageObj.goto('file://' + htmlPath);
    await pageObj.screenshot({ path: path.join(outDetail, `${kind}.png`), fullPage: false });
    await pageObj.close();
    console.log('created detail', kind);
  }
  await browser.close();

  // Contact sheet for internal review only. This one has external labels; it is not a marketplace asset.
  const files = fs.readdirSync(outDetail).filter(f => /^\d+\.png$/.test(f)).sort();
  const thumbs = [];
  for (const f of files) {
    const meta = await sharp(path.join(outDetail, f)).metadata();
    const w = 250, h = Math.round(meta.height / meta.width * w);
    const buf = await sharp(path.join(outDetail, f)).resize(w, h).extend({ top: 42, left: 8, right: 8, bottom: 8, background: '#f8fafc' }).composite([{ input: Buffer.from(`<svg width="${w+16}" height="42"><rect width="100%" height="42" fill="#111827"/><text x="12" y="28" font-size="22" font-family="Arial" fill="white">review ${f}</text></svg>`), top: 0, left: 0 }]).png().toBuffer();
    thumbs.push({ buf, w: w + 16, h: h + 50 });
  }
  const cols = 2, gap = 18, cellW = Math.max(...thumbs.map(t => t.w)), cellH = Math.max(...thumbs.map(t => t.h));
  await sharp({ create: { width: cols * cellW + (cols + 1) * gap, height: Math.ceil(thumbs.length / cols) * cellH + (Math.ceil(thumbs.length / cols) + 1) * gap, channels: 4, background: '#e5e7eb' } }).composite(thumbs.map((t, i) => ({ input: t.buf, left: gap + (i % cols) * (cellW + gap), top: gap + Math.floor(i / cols) * (cellH + gap) }))).png().toFile(path.join(outRoot, 'v42-clean-contact-sheet.png'));
  console.log('contact', path.join(outRoot, 'v42-clean-contact-sheet.png'));
})();
