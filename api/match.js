/* match.js — Trận đấu 2D thời gian thực. Logic thuần (không DOM) nên test được bằng Node.
   Toạ độ tính bằng mét (sân 105x68). Đội 0 là đội của mình, tấn công về +x. Đội 1 tấn công về -x. */
const Match=(()=>{
const L=105,W=68,GW=7.32;
// Sơ đồ 4-4-2 theo tỉ lệ (x từ khung thành nhà, y theo chiều rộng)
const F=[[.05,.5,'GK'],[.2,.14,'DF'],[.18,.38,'DF'],[.18,.62,'DF'],[.2,.86,'DF'],[.42,.14,'MF'],[.38,.38,'MF'],[.38,.62,'MF'],[.42,.86,'MF'],[.62,.36,'FW'],[.62,.64,'FW']];
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),hyp=Math.hypot;
const dirOf=t=>t?-1:1,atkX=t=>t?0:L,ownX=t=>t?L:0;
const segD=(a,b,c)=>{const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1e-9;let u=((c.x-a.x)*dx+(c.y-a.y)*dy)/l;u=cl(u,0,1);return hyp(a.x+u*dx-c.x,a.y+u*dy-c.y)};

/* o: {my:{r,n}, opp:{r,n}, pos:'FW|MF|DF', st:{spd,sht,pas,drb,sta,mnt}, start:true/false, mode:'play'|'moments'|'sim', dur:giây} */
function create(o){
 const m={t:0,dur:o.dur||150,half:1,phase:'play',score:[0,0],mode:o.mode||'play',auto:o.mode!=='play',my:o.my,opp:o.opp,pos:o.pos,st:o.st,
  ball:{x:L/2,y:W/2,vx:0,vy:0,own:-1,last:-1,lastT:-9,team:0,pass:null,shot:null,prev:null},A:[],rs:0,rsTeam:0,rsSpot:null,frz:0,log:[],
  inp:{mx:0,my:0,sprint:0,pass:0,shoot:0,call:0},charge:0,prevShoot:0,stm:1,nextM:3,mEnd:0,
  stat:{sh:0,sot:0,g:0,a:0,pa:0,pc:0,tk:0,tl:0,min:0,touch:0},cnt:{sh:[0,0],ps:[0,0],tk:[0,0],out:0,own:[0,0],sv:0,sot:0}};
 for(let t=0;t<2;t++){const r=t?o.opp.r:o.my.r,q=cl((r-40)/50,.1,1.2);
  F.forEach((f,i)=>m.A.push({id:t*11+i,t,i,role:f[2],hx:t?L-f[0]*L:f[0]*L,hy:f[1]*W,x:t?L-f[0]*L:f[0]*L,y:f[1]*W,vx:0,vy:0,q,dec:rnd(0,.6),me:false}))}
 m.me=({FW:9,MF:6,DF:2})[o.pos]||9;m.A[m.me].me=true;
 m.meOn=o.start!==false;m.subT=m.dur*rnd(.52,.64);
 kickoff(m,Math.random()<.5?0:1);
 return m}

function give(m,j){const B=m.ball,a=m.A[j];B.own=j;B.vx=B.vy=0;B.last=j;B.team=a.t;B.pass=null;B.shot=null;a.dec=m.t+rnd(.45,1.0)}
function kickoff(m,t){m.A.forEach(a=>{a.x=a.hx;a.y=a.hy;a.vx=a.vy=0});const B=m.ball;B.x=L/2;B.y=W/2;B.vx=B.vy=0;B.own=-1;B.pass=null;B.shot=null;
 let j=m.A.findIndex(a=>a.t===t&&a.i===9);m.A[j].x=L/2-dirOf(t)*1;m.A[j].y=W/2;give(m,j)}

/* ---- Hành động kicks ---- */
function pass(m,a,j,acc,pw){const B=m.ball,r=m.A[j],d=hyp(r.x-a.x,r.y-a.y),lead=cl(d/38,.1,.8);
 let tx=r.x+r.vx*lead,ty=r.y+r.vy*lead;const ang=Math.atan2(ty-a.y,tx-a.x)+(1-acc)*rnd(-.3,.3);
 const sp=cl(d*1.3+10,18,pw||40);B.vx=Math.cos(ang)*sp;B.vy=Math.sin(ang)*sp;B.own=-1;B.last=a.id;B.lastT=m.t;B.team=a.t;B.pass={from:a.id,to:j,t:m.t};B.shot=null;m.cnt.ps[a.t]++;
 if(a.me&&m.meOn)m.stat.pa++}
function shoot(m,a,pw,acc,aim){const B=m.ball,gx=atkX(a.t),ty=W/2+aim+rnd(-1,1)*(1-acc)*7*(1.15-.45*pw);
 const ang=Math.atan2(ty-a.y,gx-a.x),sp=24+16*acc*pw+6*pw;B.vx=Math.cos(ang)*sp;B.vy=Math.sin(ang)*sp;B.own=-1;B.last=a.id;B.lastT=m.t;B.team=a.t;B.pass=null;B.shot={by:a.id,t:m.t,sp,chk:false};m.cnt.sh[a.t]++;
 if(a.me&&m.meOn){m.stat.sh++}}

/* ---- AI chọn hành động cho người đang cầm bóng ---- */
function decide(m,a){const A=m.A,d=dirOf(a.t),dg=Math.abs(atkX(a.t)-a.x),opp=A.filter(o=>o.t!==a.t),q=a.q;
 const press=opp.filter(o=>o.role!=='GK'&&hyp(o.x-a.x,o.y-a.y)<5.5).length;a.dec=m.t+rnd(.5,1.15)*(1.2-.35*cl(q,0,1));
 if(dg<30&&Math.abs(a.y-W/2)<21&&(a.role!=='DF'||dg<18)&&Math.random()<(.7+.2*cl(q,0,1))*cl(1.3-dg/30,.35,1))return shoot(m,a,rnd(.6,1),cl(.45+.4*q,.3,.95),rnd(-2.6,2.6));
 let best=-1,bs=-9;A.forEach((r,j)=>{if(r.t!==a.t||r===a)return;const dist=hyp(r.x-a.x,r.y-a.y);if(dist<6||dist>45)return;
  const lane=Math.min(...opp.map(o=>segD(a,r,o))),open=Math.min(...opp.map(o=>hyp(o.x-r.x,o.y-r.y)));
  let s=(r.x-a.x)*d*(press?.03:.06)+Math.min(open,12)*.14+Math.min(lane,6)*.25-dist*.02+rnd(-.3,.3)+(r.me&&m.meOn&&!m.auto?.9+(m.inp.call?1.4:0):0);
  if(r.role==='GK')s-=1.3;if(s>bs){bs=s;best=j}});
 if(best>=0&&(press||Math.random()<.6))return pass(m,a,best,cl(.5+.4*q,.3,.95)*(press?.9:1),34)}

/* ---- Một bước mô phỏng ---- */
function step(m,dt){
 if(m.phase!=='play')return;
 const B=m.ball,A=m.A,U=A[m.me];
 if(m.frz>0){m.frz-=dt;if(m.frz<=0&&m.kick!=null){kickoff(m,m.kick);m.kick=null}}
 else{m.t+=dt;
  if(m.half===1&&m.t>=m.dur/2){m.phase='ht';return}
  if(m.t>=m.dur){m.phase='ft';return}
  if(!m.meOn&&m.t>=m.subT){m.meOn=true;m.log.push({k:'sub',t:m.t})}
  if(m.meOn)m.stat.min=m.t/m.dur*90}
 const own=B.own>=0?A[B.own]:null,poss=own?own.t:B.team;
 // người đuổi bóng khi bóng tự do
 const chase=[null,null];
 if(!own)for(let t=0;t<2;t++){let bd=1e9;A.forEach(a=>{if(a.t!==t||a.role==='GK')return;const d=hyp(a.x-(B.x+B.vx*.3),a.y-(B.y+B.vy*.3));if(d<bd){bd=d;chase[t]=a}})}
 const press=[],supp=[];
 if(own){const op=A.filter(a=>a.t!==own.t&&a.role!=='GK').sort((a,b)=>hyp(a.x-own.x,a.y-own.y)-hyp(b.x-own.x,b.y-own.y));press.push(op[0],op[1]);
  const tm=A.filter(a=>a.t===own.t&&a!==own&&a.role!=='GK').sort((a,b)=>hyp(a.x-own.x,a.y-own.y)-hyp(b.x-own.x,b.y-own.y));supp.push(tm[0],tm[1])}
 const userCtl=m.meOn&&!m.auto;
 A.forEach(a=>{
  let ms=a.me?9.5+7*m.st.spd/100:10+4.5*cl(a.q,0,1.2),tx,ty,sp=.8;
  if(a.me&&userCtl){const i=m.inp,mag=hyp(i.mx,i.my),spr=i.sprint&&m.stm>.05?1.28:1;
   const f=(.72+.28*m.stm)*spr,tvx=mag>.08?i.mx/Math.max(1,mag)*ms*f:0,tvy=mag>.08?i.my/Math.max(1,mag)*ms*f:0;
   a.vx+=(tvx-a.vx)*Math.min(1,dt*8);a.vy+=(tvy-a.vy)*Math.min(1,dt*8);
   m.stm=cl(m.stm+(i.sprint&&mag>.1?-dt*.14*(1.3-.6*m.st.sta/100):dt*.05),0,1);
  }else{
   const d=dirOf(a.t),att=poss===a.t;
   tx=a.hx+(B.x-L/2)*.32+(a.role==='GK'?0:d*(att?(a.role==='FW'?15:a.role==='MF'?8:4):(a.role==='FW'?-3:a.role==='MF'?-8:-12)));
   ty=W/2+(a.hy-W/2)*(att?1.1:.8)+(B.y-W/2)*.12;
   if(a.role==='GK'){tx=ownX(a.t)+d*3.2;ty=cl(W/2+(B.y-W/2)*.3,W/2-5.5,W/2+5.5);sp=.55;
    if(B.shot&&B.shot.by>=0&&A[B.shot.by].t!==a.t){const tt=(tx-B.x)/(B.vx||1e-3);if(tt>0&&tt<2)ty=cl(B.y+B.vy*tt,W/2-GW/2-1,W/2+GW/2+1)}}
   else if(a===own){tx=atkX(a.t);ty=a.y+(W/2-a.y)*.35;const nd=A.filter(o=>o.t!==a.t&&o.role!=='GK').sort((p,q)=>hyp(p.x-a.x,p.y-a.y)-hyp(q.x-a.x,q.y-a.y))[0];if(nd&&hyp(nd.x-a.x,nd.y-a.y)<9)ty+=(a.y>nd.y?1:-1)*7;sp=.95}
   else if(!own){if(B.pass&&B.pass.to===a.id){tx=B.x+B.vx*.32;ty=B.y+B.vy*.32;sp=1}else if(chase[a.t]===a){tx=B.x+B.vx*.3;ty=B.y+B.vy*.3;sp=1}}
   else if(att){if(supp.includes(a)){tx=own.x-d*5;ty=own.y+(a===supp[0]?-1:1)*11;sp=.95}else if(a.role==='FW'||(a.role==='MF'&&a.i%2===0)){tx=own.x+d*16;sp=.9}}
   else if(press.includes(a)){tx=own.x;ty=own.y;sp=1}
   if(m.rs>0&&a===own)sp=0;
   const dx=tx-a.x,dy=ty-a.y,D=hyp(dx,dy)||1,v=Math.min(ms*sp,D*3);
   a.vx+=((dx/D)*v-a.vx)*Math.min(1,dt*6);a.vy+=((dy/D)*v-a.vy)*Math.min(1,dt*6)}
 });
 // tách nhau
 for(let i=0;i<22;i++)for(let j=i+1;j<22;j++){const a=A[i],b=A[j],dx=a.x-b.x,dy=a.y-b.y,D=hyp(dx,dy);if(D<1.6&&D>0){const f=(1.6-D)*3;a.vx+=dx/D*f*dt*6;a.vy+=dy/D*f*dt*6;b.vx-=dx/D*f*dt*6;b.vy-=dy/D*f*dt*6}}
 A.forEach(a=>{a.x=cl(a.x+a.vx*dt,.5,L-.5);a.y=cl(a.y+a.vy*dt,.5,W-.5)});
 // AI cầm bóng quyết định
 if(own&&m.rs<=0&&m.frz<=0){
  if(own.me&&userCtl){ // người chơi điều khiển
   const i=m.inp,mag=hyp(i.mx,i.my);
   if(i.pass){i.pass=0;userPass(m,own)}
   if(i.shoot){m.charge=Math.min(1,m.charge+dt/.8)}
   if(!i.shoot&&m.prevShoot){const aim=cl(i.my,-1,1)*(own.t?-1:1)*3.2;shoot(m,own,.55+.45*m.charge,cl(.35+.6*m.st.sht/100,.3,.97)*(1-.2*(1-m.st.mnt/100)*pressureOf(m,own)),aim);m.charge=0}
   m.prevShoot=i.shoot?1:0;
  }else if(m.t>=own.dec)decide(m,own);
 }else if(!own&&userCtl){m.prevShoot=m.inp.shoot?1:0;if(m.inp.pass){m.inp.pass=0;userTackle(m)}}
 // bóng
 if(own){const sp=hyp(own.vx,own.vy)||1;B.x=own.x+own.vx/sp*.7*(sp>1?1:0);B.y=own.y+own.vy/sp*.7*(sp>1?1:0);
  // tắc bóng
  const pr=A.filter(o=>o.t!==own.t&&o.role!=='GK'&&hyp(o.x-own.x,o.y-own.y)<1.7);
  if(pr.length&&m.rs<=0&&m.frz<=0){const t=pr[0],ctl=own.me?m.st.drb/100:cl(own.q*.7,.2,.9),tk=t.me?m.st.drb/100*.6+.3:cl(t.q*.7,.2,.9);
   const rate=(own.me&&userCtl?.7:1.0)*(.55+.9*(tk-ctl))*(poss===0?1:1);
   if(Math.random()<dt*Math.max(.1,rate)){m.cnt.tk[t.t]++;if(own.me&&m.meOn)m.stat.tl++;if(t.me&&m.meOn)m.stat.tk++;give(m,A.indexOf(t))}}
 }else{
  B.x+=B.vx*dt;B.y+=B.vy*dt;const f=Math.exp(-(B.shot?.12:.7)*dt);B.vx*=f;B.vy*=f;
  if(m.rs>0){B.vx=B.vy=0}
  // thủ môn cản phá
  if(B.shot&&!B.shot.chk){const gk=A.find(a=>a.role==='GK'&&a.t!==A[B.shot.by].t);if(gk&&hyp(gk.x-B.x,gk.y-B.y)<2.4){B.shot.chk=true;m.cnt.sot++;
   const sv=cl(.6+.5*cl(gk.q,0,1.1)-(B.shot.sp-26)*.012,.1,.92);if(Math.random()<sv){m.cnt.sv++;if(Math.random()<.55)give(m,A.indexOf(gk));else{B.vx=-B.vx*.3+rnd(-6,6);B.vy=rnd(-9,9);B.shot=null;B.team=gk.t}}}}
  // nhặt bóng
  if(m.rs<=0&&m.frz<=0){const sp=hyp(B.vx,B.vy);let bj=-1,bd=1e9;A.forEach((a,j)=>{const r=a.role==='GK'?2.1:(a.me?1.7+.6*m.st.drb/100:1.6),d=hyp(a.x-B.x,a.y-B.y);if(d<r&&d<bd&&!(j===B.last&&m.t-B.lastT<.3)&&(sp<24||(a.role==='GK'&&!B.shot)||(B.pass&&B.pass.to===j&&a.t===A[B.pass.from].t&&sp<46)||(B.pass&&a.t!==A[B.pass.from].t&&sp<30))){bd=d;bj=j}});
   if(bj>=0){const a=A[bj],ps=B.pass;if(ps){if(a.t===A[ps.from].t&&bj!==ps.from){B.prev={by:ps.from,to:bj,t:m.t};if(A[ps.from].me&&m.meOn)m.stat.pc++}}
    if(B.shot&&a.t===A[B.shot.by].t&&bj!==B.shot.by){/* đồng đội chạm bóng */}
    give(m,bj)}}
  // bàn thắng / ra biên
  if(m.rs<=0&&m.frz<=0){
   if((B.x<=0||B.x>=L)&&Math.abs(B.y-W/2)<GW/2){const t=B.x>=L?0:1;m.score[t]++;const sc=A[B.last];
    if(t===0&&B.last===m.me&&m.meOn){m.stat.g++;m.stat.sot++}else if(t===0&&B.shot&&B.shot.by===m.me&&m.meOn){m.stat.g++}
    if(B.prev&&B.prev.to===B.last&&m.t-B.prev.t<6&&A[B.prev.by].t===t&&B.prev.by===m.me&&m.meOn)m.stat.a++;
    m.log.push({k:'goal',t:m.t,team:t,by:B.last});B.vx=B.vy=0;m.frz=2.6;m.kick=1-t;B.x=cl(B.x,.5,L-.5)}
   else if(B.x<0||B.x>L||B.y<0||B.y>W){const lastT=B.team;let rt,sx,sy;
    if(B.y<0||B.y>W){rt=1-lastT;sx=cl(B.x,2,L-2);sy=B.y<0?.4:W-.4}
    else{const def=B.x>L/2?0:1; if(lastT===def){rt=1-def;sx=B.x>L/2?L-.4:.4;sy=B.y<W/2?.4:W-.4}else{rt=def;sx=ownX(def)+dirOf(def)*5.5;sy=W/2}}
    if(B.shot&&A[B.shot.by].me&&m.meOn&&Math.abs(B.y-W/2)<GW*1.6)m.stat.sot+=0;
    m.cnt.out++;m.rs=.9;m.rsTeam=rt;m.rsSpot={x:sx,y:sy};B.x=sx;B.y=sy;B.vx=B.vy=0;B.shot=null;B.pass=null}}
 }
 if(m.rs>0){m.rs-=dt;if(m.rs<=0&&m.rsSpot){const sp=m.rsSpot,t=m.rsTeam;let j=-1,bd=1e9;A.forEach((a,k)=>{if(a.t!==t)return;if(sp.x<3||sp.x>L-3){if(a.role!=='GK'&&(sp.x<6||sp.x>L-6)&&Math.abs(sp.y-W/2)<12)return}const d=hyp(a.x-sp.x,a.y-sp.y);if(d<bd){bd=d;j=k}});
  const gkk=A.findIndex(a=>a.t===t&&a.role==='GK'),near=Math.abs(sp.x-ownX(t))<8&&Math.abs(sp.y-W/2)<10?gkk:j;m.A[near].x=sp.x;m.A[near].y=sp.y;give(m,near);m.rsSpot=null}}
}
function pressureOf(m,a){return m.A.filter(o=>o.t!==a.t&&o.role!=='GK'&&hyp(o.x-a.x,o.y-a.y)<5).length?1:0}
/* ---- Người chơi: chuyền hỗ trợ ngắm, tắc bóng ---- */
function userPass(m,a){const i=m.inp,mag=hyp(i.mx,i.my);let best=-1,bs=-9;
 m.A.forEach((r,j)=>{if(r.t!==a.t||r===a)return;const dx=r.x-a.x,dy=r.y-a.y,d=hyp(dx,dy);if(d<4||d>55)return;
  let s;if(mag>.25){const cos=(dx*i.mx+dy*i.my)/(d*mag);if(cos<.45)return;s=cos*3-d*.03}else s=(dx*dirOf(a.t))*.05-d*.02+(r.role==='GK'?-2:0);
  s+=Math.min(...m.A.filter(o=>o.t!==a.t).map(o=>hyp(o.x-r.x,o.y-r.y)))*.05;if(s>bs){bs=s;best=j}});
 if(best<0){const ang=mag>.2?Math.atan2(i.my,i.mx):(a.t?Math.PI:0),B=m.ball;B.vx=Math.cos(ang)*22;B.vy=Math.sin(ang)*22;B.own=-1;B.last=a.id;B.lastT=m.t;B.team=a.t;B.pass={from:a.id,to:-1,t:m.t};B.shot=null;m.stat.pa++;return}
 pass(m,a,best,cl(.35+.6*m.st.pas/100,.3,.97)*(1-.25*(1-m.st.mnt/100)*pressureOf(m,a)),40)}
function userTackle(m){const U=m.A[m.me],B=m.ball,o=B.own>=0?m.A[B.own]:null;if(!o||o.t===0||hyp(o.x-U.x,o.y-U.y)>2.8||m.tcool>m.t)return;m.tcool=m.t+.9;
 const p=cl(.28+.5*m.st.drb/100+.15*m.st.mnt/100-.2*o.q*.5,.15,.85);if(Math.random()<p){m.stat.tk++;give(m,m.me)}else m.stat.tl+=0}
/* ---- Chế độ khoảnh khắc: tua nhanh bằng AI, dừng lại cho mình chơi ---- */
function momentCheck(m){if(m.t<m.nextM||!m.meOn)return false;const U=m.A[m.me],B=m.ball,o=B.own>=0?m.A[B.own]:null;if(!o)return false;
 if(o===U&&U.x>L*.62)return true;
 if(o.t===0&&o!==U&&o.x>L*.7&&hyp(o.x-U.x,o.y-U.y)<15)return true;
 if(o.t===1&&o.x<L*.32&&hyp(o.x-U.x,o.y-U.y)<17)return true;return false}
/* Tiến trận theo thời gian thực dt (giây). Trả về true khi vừa vào/ra khoảnh khắc */
function advance(m,dt){
 if(m.phase!=='play')return;
 if(m.mode==='play'||(m.mode==='moments'&&!m.auto)){let n=Math.max(1,Math.round(dt*60));for(let i=0;i<n;i++)step(m,1/60);
  if(m.mode==='moments'&&!m.auto&&m.t>=m.mEnd){m.auto=true;m.nextM=m.t+m.dur/90*6;m.log.push({k:'momentEnd',t:m.t})}}
 else{for(let i=0;i<14;i++){step(m,1/30);if(m.phase!=='play')break;if(m.mode==='moments'&&momentCheck(m)){m.auto=false;m.mEnd=m.t+6.5;m.log.push({k:'moment',t:m.t});break}}}
}
/* Điểm số cá nhân 3–10 */
function rating(m){const s=m.stat;if(s.min<8)return null;let r=6+s.g*1.1+s.a*.8+s.sot*.1+(s.pa>=4?(s.pc/s.pa-.72)*2:0)+s.tk*.25-s.tl*.1;
 r+=m.score[0]>m.score[1]?.4:m.score[0]<m.score[1]?-.3:0;r+=rnd(-.25,.25);return cl(Math.round(r*10)/10,3,10)}
return{create,step,advance,rating,L,W,GW,F,momentCheck,give}})();
if(typeof module!=='undefined')module.exports=Match;
