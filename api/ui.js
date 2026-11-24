/* ui.js — Giao diện: các màn hình, điều khiển cảm ứng/bàn phím, vẽ sân. */
const UI=(()=>{
const $=id=>document.getElementById(id),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const S={slot:0,c:null,tab:'hub',tr:'sht',cr:null,mt:null,sum:null};
const bar=(v,col)=>`<div class="bar"><i style="width:${cl(Math.round(v),0,100)}%;background:${col||'var(--b)'}"></i></div>`;
const app=h=>{$('app').innerHTML=h};
const save=()=>{if(S.c&&!Save.put(S.slot,S.c))toast('⚠️ Không lưu được game (bộ nhớ trình duyệt đầy hoặc bị chặn).')};
function toast(t){const e=$('toast');if(!e)return;e.textContent=t;e.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>{e.className=''},3200)}

/* ===== Màn hình chính và tạo nhân vật ===== */
function title(){stopMatch();S.c=null;let h='<div class="hero"><div class="logo">⚽</div><h1>LEGEND</h1><p class="mu">Một cầu thủ. Cả một đời bóng đá.</p></div>';
 for(let i=1;i<=3;i++){const c=Save.get(i);h+=`<div class="card"><b>Slot ${i}</b>`+(c?`<p class="mu">${esc(c.name)} · ${c.age} tuổi · ${CFG.pos[c.pos]} · ${esc(c.lg.teams[c.club].n)}</p><div class="grid"><button class="pri" onclick="UI.load(${i})">Tiếp tục</button><button onclick="UI.del(${i})">Xóa</button></div>`:`<p class="mu">Trống</p><button class="ok" onclick="UI.newGame(${i})">Tạo cầu thủ mới</button>`)+'</div>'}
 app(h)}
function load(i){const c=Save.get(i);if(!c)return;S.slot=i;S.c=c;S.tab='hub';hub()}
function del(i){if(confirm('Xóa save này?')){Save.del(i);title()}}
function newGame(i){S.slot=i;S.cr={name:'',nat:'VN',pos:'FW',lg:'vn',alloc:{spd:0,sht:0,pas:0,drb:0,sta:0,mnt:0},left:CFG.rules.pointsToSpend};create()}
function create(){const r=S.cr,k=Object.keys(CFG.stats);
 app(`<h2>Tạo cầu thủ</h2><div class="card"><input id="nm" placeholder="Tên cầu thủ" maxlength="24" value="${esc(r.name)}" oninput="UI.cr.name=this.value">
 <label class="mu">Quốc tịch</label><select onchange="UI.pickNat(this.value)">${CFG.nations.map(n=>`<option value="${n[0]}" ${r.nat===n[0]?'selected':''}>${n[2]} ${n[1]}</option>`).join('')}</select>
 <label class="mu">Giải khởi đầu (nơi bạn vào lò đào tạo)</label><select onchange="UI.cr.lg=this.value">${Object.keys(CFG.leagues).map(l=>`<option value="${l}" ${r.lg===l?'selected':''}>${CFG.leagues[l].f} ${CFG.leagues[l].n}</option>`).join('')}</select>
 <label class="mu">Vị trí</label><div class="grid3">${Object.keys(CFG.pos).map(p=>`<button class="${r.pos===p?'sel':''}" onclick="UI.cr.pos='${p}';UI.create()">${CFG.pos[p]}</button>`).join('')}</div></div>
 <div class="card"><div class="row"><h3>Chỉ số</h3><span class="chip">Còn ${r.left} điểm</span></div>${k.map(s=>`<div class="row stat"><span>${CFG.stats[s]}</span><span><button class="sm" onclick="UI.adj('${s}',-1)">−</button> <b>${CFG.rules.baseStat+r.alloc[s]}</b> <button class="sm" onclick="UI.adj('${s}',1)">+</button></span></div>${bar(CFG.rules.baseStat+r.alloc[s],'var(--y)')}`).join('')}
 <p class="mu">Bạn 16 tuổi, bắt đầu ở lò đào tạo của một CLB nửa dưới bảng. Tiềm năng của bạn được giấu kín: chỉ tuyển trạch viên mới đoán được.</p></div>
 <button class="pri big" onclick="UI.start()">Bắt đầu sự nghiệp</button><button onclick="UI.title()">Quay lại</button>`)}
function pickNat(id){const n=CFG.nations.find(x=>x[0]===id);S.cr.nat=id;S.cr.lg=n[3];create()}
function adj(k,d){const r=S.cr;if(d>0&&(r.left<=0||CFG.rules.baseStat+r.alloc[k]>=80))return;if(d<0&&r.alloc[k]<=0)return;r.alloc[k]+=d;r.left-=d;create()}
function start(){const r=S.cr;r.name=(r.name||'').replace(/[<>"'&`]/g,'').trim()||'Tân binh';S.c=Career.create({name:r.name,nat:r.nat,pos:r.pos,lg:r.lg,alloc:r.alloc});S.tab='hub';save();hub()}

/* ===== Điều hướng ===== */
function nav(){return`<nav>${[['hub','🏠','Tuần'],['prof','👤','Hồ sơ'],['tab','🏆','BXH'],['set','⚙','Menu']].map(t=>`<button class="${S.tab===t[0]?'on':''}" onclick="UI.go('${t[0]}')">${t[1]}<small>${t[2]}</small></button>`).join('')}</nav>`}
function go(t){S.tab=t;({hub,prof:profile,tab:table,set:menu})[t]()}
function head(){const c=S.c,T=c.lg.teams[c.club],n=CFG.nations.find(x=>x[0]===c.nat);return`<header><div><b>${n?n[2]:''} ${esc(c.name)}</b><small>${c.age} tuổi · ${CFG.pos[c.pos]} · OVR ${Career.ovr(c)}</small></div><div style="text-align:right"><b>${esc(T.n)}</b><small>Mùa ${c.season} · Vòng ${Math.min(c.lg.round+1,c.lg.fx.length)}/${c.lg.fx.length}</small></div></header>`}

/* ===== Tuần: tập luyện, trận kế tiếp ===== */
function hub(){const c=S.c,f=Career.fixture(c),role=Career.role(c),rl={start:'Đá chính',sub:'Dự bị (có thể vào sân hiệp 2)',out:c.inj>0?'Đang chấn thương':'Không có tên trong danh sách'}[role];
 app(head()+`<main>${c.news.length?`<div class="card">📰 ${esc(c.news[0])}</div>`:''}
 <div class="card"><div class="row"><h3>Trận tuần này</h3><span class="chip">${f.home?'Sân nhà':'Sân khách'}</span></div><p><b>${esc(f.myT.n)}</b> gặp <b>${esc(f.oppT.n)}</b> <span class="mu">(sức mạnh ${f.oppT.r})</span></p><p>Vai trò của bạn: <b>${rl}</b></p>
  <div class="grid"><div>Thể lực${bar(c.energy,'var(--g)')}</div><div>Phong độ${bar(c.form,'var(--y)')}</div><div>Tinh thần${bar(c.morale,'#a78bfa')}</div><div>Lòng tin HLV${bar(c.rel.coach,'var(--b)')}</div></div></div>
 <div class="card"><h3>Tập luyện tuần này</h3><div class="grid">${Object.keys(CFG.stats).map(k=>`<button class="${S.tr===k?'sel':''}" onclick="UI.tr='${k}';UI.hub()">${CFG.stats[k]}<small>${c.st[k]}</small></button>`).join('')}<button class="${S.tr==='rest'?'sel':''}" onclick="UI.tr='rest';UI.hub()">Nghỉ ngơi<small>+35 thể lực</small></button></div></div>
 <div class="card"><h3>Mục tiêu mùa này</h3>${c.obj.map(o=>{const p=Career.objProgress(c,o);return`<div class="row"><span>${esc(o.t)}</span><b>${p[0]} / ${o.id==='rank'?'top '+p[1]:p[1]}</b></div>`}).join('')}</div>
 <h3>Vào trận</h3>${role==='out'?`<button class="pri big" onclick="UI.play('sim')">⏩ Qua tuần (xem kết quả)</button>`:`<button class="pri big" onclick="UI.play('play')">🎮 Chơi cả trận (2,5 phút)</button><button class="big" onclick="UI.play('moments')">⚡ Chỉ chơi khoảnh khắc quyết định</button><button class="big" onclick="UI.play('sim')">⏩ Mô phỏng nhanh</button>`}</main>`+nav())}
function play(mode){const c=S.c;S.mode=mode;const msg=Career.train(c,S.tr);S.tmsg=msg;const ev=Career.pickEvent(c);save();if(ev){S.ev=ev;event()}else launch()}
function event(){const e=S.ev;app(head()+`<main><div class="card modal"><h3>${esc(e.t)}</h3><p>${esc(e.d)}</p>${e.ch.map((x,i)=>`<button onclick="UI.pick(${i})">${esc(x.t)}</button>`).join('')}</div></main>`)}
function pick(i){const r=Career.choose(S.c,S.ev,i);save();app(head()+`<main><div class="card"><h3>${esc(S.ev.t)}</h3><p>${esc(r.m)}</p><p>${r.out.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</p><button class="pri big" onclick="UI.launch()">Tiếp tục vào trận</button></div></main>`)}

/* ===== Trận đấu ===== */
function launch(){const c=S.c,f=Career.fixture(c),role=Career.role(c),mode=S.mode;
 const m=Match.create({my:{r:f.myT.r},opp:{r:f.oppT.r},pos:c.pos,st:Career.matchStats(c),start:role==='start',mode:role==='out'&&mode!=='sim'?'sim':mode,dur:150});
 if(role==='out')m.meOn=false,m.subT=1e9;
 S.mt={m,f,role,mode:m.mode,t0:0,banner:0};
 if(mode==='sim'){while(m.phase!=='ft'){if(m.phase==='ht'){m.phase='play';m.half=2}Match.step(m,1/30)}return finish()}
 app(`<div id="mhud"><div class="sb"><b>${esc(f.myT.n)}</b><span id="sc">0 : 0</span><b>${esc(f.oppT.n)}</b></div><div class="clk"><span id="clk">0'</span><div class="bar"><i id="stm" style="width:100%;background:var(--g)"></i></div></div></div>
 <div id="cvw"><canvas id="cv"></canvas><div id="ban"></div><div id="ovl"></div></div>
 <div id="ctl"><div id="joy"><i id="knob"></i></div><div id="bts"><button id="bC" class="cb">NƯỚC<br>RÚT</button><button id="bA" class="cb">CHUYỀN<br><small>tắc bóng</small></button><button id="bB" class="cb">SÚT<br><small>giữ lấy lực</small></button></div></div>`);
 bindControls();S.mt.last=0;S.mt.raf=requestAnimationFrame(loop)}
function stopMatch(){if(S.mt&&S.mt.raf)cancelAnimationFrame(S.mt.raf);if(S.mt)S.mt.raf=0;if(S.kd){document.removeEventListener('keydown',S.kd);document.removeEventListener('keyup',S.ku);S.kd=null}}
function loop(ts){const t=S.mt;if(!t||!t.raf)return;const m=t.m,dt=Math.min(.05,t.last?(ts-t.last)/1000:.016);t.last=ts;
 m.inp.call=(m.inp.shoot&&m.ball.own!==m.me)?1:0;
 if(m.phase==='play')Match.advance(m,dt);
 if(m.phase==='ht'&&!t.ht){t.ht=true;$('ovl').innerHTML=`<div class="card"><h3>Hết hiệp 1</h3><p>Tỉ số ${m.score[0]} - ${m.score[1]}</p><button class="pri" onclick="UI.second()">Hiệp 2</button></div>`}
 if(m.phase==='ft'){t.raf=0;return finish()}
 hudUpdate();draw();t.raf=requestAnimationFrame(loop)}
function second(){const m=S.mt.m;$('ovl').innerHTML='';m.phase='play';m.half=2}
function hudUpdate(){const t=S.mt,m=t.m;$('sc').textContent=m.score[0]+' : '+m.score[1];$('clk').textContent=Math.min(90,Math.floor(m.t/m.dur*90))+"'";$('stm').style.width=Math.round(m.stm*100)+'%';
 const man=m.mode==='moments'&&!m.auto,b=$('ban');b.textContent=m.mode==='moments'?(man?'⚡ KHOẢNH KHẮC QUYẾT ĐỊNH · bạn điều khiển':'⏩ Đang tua nhanh…'):(!m.meOn?'🪑 Bạn đang ngồi dự bị, sẽ vào sân hiệp 2':'');b.className=man?'on':''}
function finish(){stopMatch();const t=S.mt,m=t.m,c=S.c,r={gf:m.score[0],ga:m.score[1],g:m.stat.g,a:m.stat.a,min:m.stat.min,rating:Match.rating(m),start:t.role==='start',role:t.role};
 if(t.role==='out'||t.mode==='sim'&&t.role==='out'){r.min=0}
 const f=t.f,note=Career.finishMatch(c,r);t.r=r;t.note=note;save();
 const res=r.gf>r.ga?'THẮNG 🎉':r.gf<r.ga?'THUA':'HÒA',played=r.min>=8;
 app(head()+`<main><div class="card"><h2>${res}</h2><p class="score">${esc(f.myT.n)} ${f.home?r.gf:r.ga} - ${f.home?r.ga:r.gf} ${esc(f.oppT.n)}</p>${played?`<p>Điểm của bạn: <b>${r.rating.toFixed(1)}</b> · ${r.g} bàn · ${r.a} kiến tạo · ${m.stat.sh} cú sút · chuyền ${m.stat.pc}/${m.stat.pa}</p>`:'<p class="mu">Bạn không ra sân trận này.</p>'}${note?`<p style="color:var(--r)">${esc(note)}</p>`:''}<p class="mu">${esc(S.tmsg||'')}</p></div><button class="pri big" onclick="UI.after()">Tiếp tục</button></main>`)}
function after(){const c=S.c;if(Career.nextWeek(c)){const sum=Career.endSeason(c);S.sum=sum;save();return seasonView()}save();hub()}

/* ===== Điều khiển ===== */
function bindControls(){const m=S.mt.m,inp=m.inp,joy=$('joy'),kn=$('knob');let id=null;
 const set=(e)=>{const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const R=r.width/2,d=Math.hypot(dx,dy);if(d>R){dx=dx/d*R;dy=dy/d*R}inp.mx=dx/R;inp.my=dy/R;kn.style.transform=`translate(${dx}px,${dy}px)`};
 joy.onpointerdown=e=>{id=e.pointerId;joy.setPointerCapture&&joy.setPointerCapture(id);set(e);e.preventDefault()};
 joy.onpointermove=e=>{if(e.pointerId===id)set(e)};
 const rel=e=>{if(e.pointerId===id){id=null;inp.mx=inp.my=0;kn.style.transform='translate(0,0)'}};joy.onpointerup=rel;joy.onpointercancel=rel;
 const hold=(el,k)=>{el.onpointerdown=e=>{inp[k]=1;e.preventDefault()};el.onpointerup=el.onpointerleave=el.onpointercancel=()=>{if(k!=='pass')inp[k]=0}};
 hold($('bA'),'pass');hold($('bB'),'shoot');hold($('bC'),'sprint');
 const key={};S.kd=e=>{const k=e.key.toLowerCase();if(key[k])return;key[k]=1;if(k==='j')inp.pass=1;if(k==='k')inp.shoot=1;if(k==='shift'||k==='l')inp.sprint=1;kv()};
 S.ku=e=>{const k=e.key.toLowerCase();key[k]=0;if(k==='k')inp.shoot=0;if(k==='shift'||k==='l')inp.sprint=0;kv()};
 const kv=()=>{const x=(key.d||key.arrowright?1:0)-(key.a||key.arrowleft?1:0),y=(key.s||key.arrowdown?1:0)-(key.w||key.arrowup?1:0),d=Math.hypot(x,y)||1;inp.mx=x/d;inp.my=y/d};
 document.addEventListener('keydown',S.kd);document.addEventListener('keyup',S.ku)}

/* ===== Vẽ sân (camera bám theo người chơi) ===== */
function draw(){const t=S.mt,m=t.m,cv=$('cv');if(!cv)return;const W=cv.clientWidth,H=cv.clientHeight,dpr=window.devicePixelRatio||1;if(!W||!H)return;
 if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
 const g=cv.getContext('2d'),U=m.A[m.me],f=m.meOn?U:m.ball;t.cx=t.cx==null?f.x:t.cx+(f.x-t.cx)*.12;t.cy=t.cy==null?f.y:t.cy+(f.y-t.cy)*.12;
 const s=W*dpr/56,ox=W*dpr/2-t.cx*s,oy=H*dpr/2-t.cy*s,X=x=>x*s+ox,Y=y=>y*s+oy,L=Match.L,Wd=Match.W;g.setTransform(1,0,0,1,0,0);
 g.fillStyle='#14702f';g.fillRect(0,0,cv.width,cv.height);for(let i=0;i<14;i++){g.fillStyle=i%2?'#177a35':'#136a2c';g.fillRect(X(i*L/14),Y(0),L/14*s+1,Wd*s)}
 g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2*dpr;g.strokeRect(X(0),Y(0),L*s,Wd*s);g.beginPath();g.moveTo(X(L/2),Y(0));g.lineTo(X(L/2),Y(Wd));g.stroke();g.beginPath();g.arc(X(L/2),Y(Wd/2),9.15*s,0,7);g.stroke();
 [[0,1],[L,-1]].forEach(([x,d])=>{g.strokeRect(d>0?X(0):X(L-16.5),Y(13.84),16.5*s,40.32*s);g.strokeRect(d>0?X(0):X(L-5.5),Y(24.84),5.5*s,18.32*s);g.fillStyle='rgba(255,255,255,.9)';g.fillRect(d>0?X(-1.2):X(L),Y(Wd/2-Match.GW/2),1.2*s,Match.GW*s)});
 m.A.forEach((a,i)=>{const me=i===m.me&&m.meOn,x=X(a.x),y=Y(a.y),r=Math.max(7*dpr,1.15*s);g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=me?'#ffd24a':a.role==='GK'?(a.t?'#fb923c':'#34d399'):a.t?'#ef4444':'#38bdf8';g.fill();g.lineWidth=(me?3:1.5)*dpr;g.strokeStyle=me?'#fff':'rgba(0,0,0,.5)';g.stroke();
  if(me){g.beginPath();g.moveTo(x,y-r-14*dpr);g.lineTo(x-6*dpr,y-r-4*dpr);g.lineTo(x+6*dpr,y-r-4*dpr);g.closePath();g.fillStyle='#ffd24a';g.fill()}});
 const B=m.ball;g.beginPath();g.arc(X(B.x),Y(B.y),Math.max(3.5*dpr,.55*s),0,7);g.fillStyle='#fff';g.fill();g.strokeStyle='#000';g.lineWidth=1.5*dpr;g.stroke();
 const rw=96*dpr,rh=rw*Wd/L;g.fillStyle='rgba(0,0,0,.45)';g.fillRect(cv.width-rw-8*dpr,8*dpr,rw,rh);m.A.forEach((a,i)=>{g.fillStyle=i===m.me?'#ffd24a':a.t?'#ef4444':'#38bdf8';g.fillRect(cv.width-rw-8*dpr+a.x/L*rw-1.5*dpr,8*dpr+a.y/Wd*rh-1.5*dpr,3*dpr,3*dpr)});
 g.fillStyle='#fff';g.fillRect(cv.width-rw-8*dpr+B.x/L*rw-2*dpr,8*dpr+B.y/Wd*rh-2*dpr,4*dpr,4*dpr)}

/* ===== Tổng kết mùa, hồ sơ, bảng xếp hạng, menu ===== */
function seasonView(){const s=S.sum,c=S.c;app(`<main><h2>Tổng kết mùa ${s.season}</h2><div class="card"><p><b>${esc(s.club)}</b> về đích hạng <b>${s.rank}</b>${s.champ?' 🏆 VÔ ĐỊCH':''}. Bạn ${s.age} tuổi.</p><p>Ra sân ${s.s.ap} trận · ${s.s.g} bàn · ${s.s.a} kiến tạo · điểm TB ${s.avg?s.avg.toFixed(1):'-'}</p></div>
 <div class="card"><h3>Mục tiêu</h3>${s.objRes.map(o=>`<div class="row"><span>${o.ok?'✅':'❌'} ${esc(o.t)}</span>${o.ok?`<span class="chip up">+${o.bonus}k</span>`:''}</div>`).join('')}</div>
 <div class="card"><h3>Bạn lớn lên</h3><p>${s.grow.length?s.grow.map(g=>`<span class="chip ${g[1]>0?'up':'dn'}">${CFG.stats[g[0]]} ${g[1]>0?'+':''}${g[1]}</span>`).join(''):'Không có thay đổi đáng kể.'}</p><p>OVR hiện tại <b>${s.ovr}</b> · giá trị <b>${s.value}M €</b></p>${s.contract?`<p class="mu">${esc(s.contract)}</p>`:''}</div>
 ${s.retired?`<button class="pri big" onclick="UI.endCareer()">Giải nghệ</button>`:`<button class="pri big" onclick="UI.go('hub')">Sang mùa ${c.season}</button>`}</main>`)}
function endCareer(){const c=S.c;app(`<main><div class="hero"><div class="logo">🏁</div><h1>Giải nghệ</h1></div><div class="card"><p><b>${esc(c.name)}</b> khép lại sự nghiệp ở tuổi ${c.age}.</p><p>${c.tot.ap} trận · ${c.tot.g} bàn · ${c.tot.a} kiến tạo · ${c.tot.trophies} chức vô địch</p><p class="mu">Chế độ HLV sẽ mở ở bản sau.</p></div><button class="pri big" onclick="UI.title()">Về màn hình chính</button></main>`)}
function profile(){const c=S.c,T=c.lg.teams[c.club];app(head()+`<main><div class="card"><h3>Chỉ số</h3>${Object.keys(CFG.stats).map(k=>`<div class="row"><span>${CFG.stats[k]}</span><b>${c.st[k]}</b></div>${bar(c.st[k],'var(--y)')}`).join('')}<p class="mu">Tiềm năng: ${c.age<19?'chưa rõ':c.pot>=88?'rất cao':c.pot>=78?'cao':'trung bình'}</p></div>
 <div class="card"><h3>Hợp đồng và tiền</h3><p>Lương ${c.ct.wage}k €/tuần · còn ${c.ct.yrs} năm · giá trị ${Career.value(c)}M € · tiền ${Math.round(c.money)}k €</p></div>
 <div class="card"><h3>Quan hệ</h3>${[['HLV',c.rel.coach,'var(--b)'],['Đồng đội',c.rel.team,'var(--g)'],['Fan',c.rel.fans,'#a78bfa'],['Danh tiếng',c.fame,'var(--y)']].map(r=>`<div class="row"><span>${r[0]}</span><b>${Math.round(r[1])}</b></div>${bar(r[1],r[2])}`).join('')}</div>
 <div class="card"><h3>Sự nghiệp</h3><p>${c.tot.ap} trận · ${c.tot.g} bàn · ${c.tot.a} kiến tạo · ${c.tot.trophies} chức vô địch</p>${c.hist.length?`<table><tr><th>Mùa</th><th>CLB</th><th>Hạng</th><th>Trận</th><th>Bàn</th><th>KT</th><th>ĐTB</th></tr>${c.hist.map(h=>`<tr><td>${h.age}t</td><td>${esc(h.club)}</td><td>${h.rank}${h.champ?'🏆':''}</td><td>${h.ap}</td><td>${h.g}</td><td>${h.a}</td><td>${h.rat}</td></tr>`).join('')}</table>`:'<p class="mu">Chưa có mùa nào hoàn thành.</p>'}</div></main>`+nav())}
function table(){const c=S.c,R=Career.ranking(c.lg);app(head()+`<main><div class="card"><h3>${CFG.leagues[c.lgId].f} ${CFG.leagues[c.lgId].n}</h3><table><tr><th>#</th><th>Đội</th><th>Tr</th><th>T</th><th>H</th><th>B</th><th>HS</th><th>Đ</th></tr>${R.map((t,i)=>`<tr class="${t.i===c.club?'me':''}"><td>${i+1}</td><td>${esc(t.n)}</td><td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.gf-t.ga}</td><td><b>${t.pt}</b></td></tr>`).join('')}</table></div></main>`+nav())}
function menu(){app(head()+`<main><div class="card"><h3>Menu</h3><button class="big" onclick="UI.title()">Về màn hình chính (đã tự lưu)</button><p class="mu">Điều khiển trong trận: cần trái để chạy, CHUYỀN để chuyền (khi không có bóng là tắc bóng), SÚT giữ để lấy lực rồi thả, NƯỚC RÚT để chạy nhanh. Bàn phím: WASD, J chuyền, K sút, Shift nước rút.</p></div></main>`+nav())}

return{title,load,del,newGame,create,pickNat,adj,start,go,hub,play,pick,launch,second,after,endCareer,get cr(){return S.cr},get tr(){return S.tr},set tr(v){S.tr=v},S}})();
