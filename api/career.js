/* career.js — Mô hình sự nghiệp: tạo nhân vật, tuần, mùa, giải đấu, sự kiện, mục tiêu. Không phụ thuộc DOM. */
const Career=(()=>{
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[ri(0,a.length-1)];
const pois=l=>{const L=Math.exp(-l);let k=0,p=1;do{k++;p*=Math.random()}while(p>L);return k-1};
const simScore=(rh,ra)=>[pois(cl(1.4*Math.pow(rh/ra,2.4),.2,4.5)),pois(cl(1.1*Math.pow(ra/rh,2.4),.2,4))];

/* ---- Chỉ số tổng, giá trị, lương ---- */
function ovr(c){const s=c.st,p=c.pos;return Math.round(p==='FW'?s.sht*.32+s.spd*.2+s.drb*.2+s.pas*.1+s.sta*.1+s.mnt*.08:p==='MF'?s.pas*.3+s.drb*.2+s.sta*.18+s.spd*.1+s.sht*.1+s.mnt*.12:s.sta*.22+s.spd*.22+s.mnt*.2+s.pas*.16+s.drb*.1+s.sht*.1)}
function value(c){const o=ovr(c),a=c.age;return Math.round(Math.pow(Math.max(.02,(o-30)/50),3)*60*(.6+c.pot/100)*(a<20?1.5:a<24?1.2:a<30?1:a<33?.6:.3)*10)/10} // triệu €
function wage(c){return Math.max(.3,Math.round(value(c)*.6*CFG.leagues[c.lgId].w*10)/10)} // nghìn € mỗi tuần

/* ---- Giải đấu: vòng tròn hai lượt, bảng xếp hạng ---- */
function buildLeague(lgId,prev){const T=CFG.leagues[lgId].clubs.map(([n,r],i)=>({n,r:prev?cl(prev.teams[i].r+ri(-2,2),40,94):r,r0:r})),N=T.length,ids=[...Array(N).keys()],R=[];
 for(let k=0;k<N-1;k++){const rd=[];for(let i=0;i<N/2;i++){const a=ids[i],b=ids[N-1-i];rd.push(k%2?[b,a]:[a,b])}R.push(rd);ids.splice(1,0,ids.pop())}
 return{teams:T,fx:R.concat(R.map(rd=>rd.map(([a,b])=>[b,a]))),round:0,tb:T.map(()=>({p:0,w:0,d:0,l:0,gf:0,ga:0,pt:0}))}}
function addRes(L,h,a,gh,ga){const H=L.tb[h],A=L.tb[a];H.p++;A.p++;H.gf+=gh;H.ga+=ga;A.gf+=ga;A.ga+=gh;if(gh>ga){H.w++;A.l++;H.pt+=3}else if(gh<ga){A.w++;H.l++;A.pt+=3}else{H.d++;A.d++;H.pt++;A.pt++}}
function ranking(L){return L.tb.map((t,i)=>({i,n:L.teams[i].n,...t})).sort((a,b)=>b.pt-a.pt||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf)}
function fixture(c){const L=c.lg,m=L.fx[L.round].find(x=>x.includes(c.club)),home=m[0]===c.club,opp=home?m[1]:m[0];return{home,opp,oppT:L.teams[opp],myT:L.teams[c.club]}}

/* ---- Tạo nhân vật ---- */
function create(o){const st={};Object.keys(CFG.stats).forEach(k=>st[k]=CFG.rules.baseStat+(o.alloc[k]||0));
 const lg=buildLeague(o.lg),low=lg.teams.map((t,i)=>[t.r,i]).sort((a,b)=>a[0]-b[0]).slice(0,6),
 c={v:2,name:o.name,nat:o.nat,pos:o.pos,age:CFG.rules.startAge,season:1,st,pot:ri(68,94),club:pick(low)[1],lgId:o.lg,lg,energy:100,form:55,morale:60,fame:1,money:20,
  rel:{coach:50,team:50,fans:30},flags:{},bench:0,inj:0,queue:[],seen:[],ct:{wage:0,yrs:3},stat:{ap:0,g:0,a:0,rat:[],min:0},hist:[],tot:{ap:0,g:0,a:0,trophies:0},obj:[],log:[],news:[]};
 c.ct.wage=wage(c);genObjectives(c);return c}

/* ---- Vai trò trong đội, chỉ số khi vào trận ---- */
function role(c){if(c.inj>0)return'out';const T=c.lg.teams[c.club],edge=ovr(c)-(T.r-14)+(c.rel.coach-50)/6+(c.form-50)/8-(c.bench>0?40:0)-(c.age<18?3:0);return edge>0?'start':edge>-10?'sub':'out'}
function matchStats(c){const f=.86+.14*c.energy/100+(c.form-50)/500,s={};Object.keys(c.st).forEach(k=>s[k]=Math.round(cl(c.st[k]*f,20,99)));return s}

/* ---- Tập luyện ---- */
function train(c,f){
 if(f==='rest'){c.energy=cl(c.energy+35,0,100);c.morale=cl(c.morale+3,0,100);return'Nghỉ ngơi hồi sức: thể lực +35'}
 const room=Math.min(99,c.pot+(f==='sta'?5:0))-c.st[f],age=c.age<19?1.3:c.age<24?1:c.age<30?.6:.25,fat=.5+c.energy/200,p=cl(.35*age*fat*(room/25)+.12,0,.85);
 c.energy=cl(c.energy-18,0,100);let g=0;if(Math.random()<p)g=1+(Math.random()<.18*age?1:0);c.st[f]=Math.min(99,c.st[f]+g);
 return g?`Tập ${CFG.stats[f].toLowerCase()}: +${g}`:`Tập ${CFG.stats[f].toLowerCase()} nhưng chưa thấy tiến bộ`}

/* ---- Sự kiện ---- */
function pickEvent(c){const due=c.queue.find(q=>q.at<=c.lg.round);
 if(due){c.queue=c.queue.filter(q=>q!==due);return EVENTS.find(e=>e.id===due.id)||null}
 if(Math.random()>.55)return null;const pool=EVENTS.filter(e=>!e.chainOnly&&(!e.when||e.when(c))&&!c.seen.includes(e.id));if(!pool.length)return null;
 let x=Math.random()*pool.reduce((s,e)=>s+(e.w||1),0);for(const e of pool){x-=(e.w||1);if(x<=0){c.seen.push(e.id);if(c.seen.length>8)c.seen.shift();return e}}return pool[0]}
const LBL={morale:'Tinh thần',energy:'Thể lực',form:'Phong độ',fame:'Danh tiếng',fans:'Fan',coach:'Lòng tin HLV',team:'Quan hệ đồng đội'};
function applyFx(c,fx){const out=[],sg=v=>(v>0?'+':'')+v;
 for(const k in fx){const v=fx[k];
  if(CFG.stats[k]){c.st[k]=cl(c.st[k]+v,20,99);out.push(CFG.stats[k]+' '+sg(v))}
  else if(k==='bench'){c.bench+=v;out.push('Dự bị '+v+' trận')}
  else if(k==='inj'){c.inj=Math.max(c.inj,v);out.push('Chấn thương '+v+' tuần')}
  else if(k==='money'){c.money+=v;out.push('Tiền '+sg(v)+'k')}
  else if(k==='coach'||k==='team'){c.rel[k]=cl(c.rel[k]+v,0,100);out.push(LBL[k]+' '+sg(v))}
  else if(k==='fans'){c.rel.fans=cl(c.rel.fans+v,0,100);out.push('Fan '+sg(v))}
  else{c[k]=cl(c[k]+v,0,100);out.push(LBL[k]+' '+sg(v))}}
 return out}
function choose(c,ev,i){const ch=ev.ch[i],out=applyFx(c,ch.fx);if(ch.flag)c.flags[ch.flag]=1;if(ch.next)c.queue.push({id:ch.next.id,at:c.lg.round+ch.next.in});
 c.log.unshift(`${ev.t}: ${ch.t}`);if(c.log.length>40)c.log.length=40;return{m:ch.m,out}}

/* ---- Kết thúc trận, sang tuần ---- */
function finishMatch(c,r){const L=c.lg,fx=fixture(c),mine=fx.home?[r.gf,r.ga]:[r.ga,r.gf],played=r.min>=8;
 L.fx[L.round].forEach(([h,a])=>{if(h===c.club||a===c.club)addRes(L,h,a,mine[0],mine[1]);else{const s=simScore(L.teams[h].r,L.teams[a].r);addRes(L,h,a,s[0],s[1])}});
 const win=r.gf>r.ga,loss=r.gf<r.ga;let note='';
 if(played){const s=c.stat,rt=r.rating||6;s.ap++;s.g+=r.g;s.a+=r.a;s.rat.push(rt);s.min+=r.min;c.tot.ap++;c.tot.g+=r.g;c.tot.a+=r.a;
  c.form=cl(c.form+(rt-6.5)*6,15,100);c.morale=cl(c.morale+(win?4:loss?-4:0),0,100);c.rel.coach=cl(c.rel.coach+(rt>=7?2:rt<5.5?-2:0),0,100);
  c.fame=cl(c.fame+r.g*1.2+r.a*.6+(rt>=8?1.5:0)+(win?.3:0),0,100);c.rel.fans=cl(c.rel.fans+(rt>=7.5?2:rt<5?-2:0),0,100);
  c.energy=cl(c.energy-(r.start?14:7),0,100);
  if(Math.random()<.03+(c.energy<30?.1:0)){c.inj=ri(1,5);note=`Bạn dính chấn thương, nghỉ ${c.inj} tuần.`}
  if(r.g>0)c.news.unshift(`Vòng ${L.round+1}: bạn ghi ${r.g} bàn vào lưới ${fx.oppT.n}.`)}
 else{c.morale=cl(c.morale+(win?2:loss?-2:0),0,100);if(r.role==='out'&&c.inj===0)c.rel.coach=cl(c.rel.coach-.5,0,100)}
 if(c.bench>0)c.bench--;if(c.news.length>8)c.news.length=8;
 return note}
function nextWeek(c){const L=c.lg;L.round++;c.money+=c.ct.wage;c.energy=cl(c.energy+8,0,100);if(c.inj>0)c.inj--;c.form+=(55-c.form)*.12;return L.round>=L.fx.length}

/* ---- Mục tiêu mùa ---- */
function genObjectives(c){const rs=c.lg.teams.map(t=>t.r).sort((a,b)=>b-a),exp=rs.indexOf(c.lg.teams[c.club].r)+1,starter=role(c)==='start',top=cl(exp-1,1,10);
 c.obj=[{id:'ap',n:starter?14:7,t:`Ra sân ít nhất ${starter?14:7} trận`,bonus:6},
  c.pos==='DF'?{id:'rat',n:6.8,t:'Điểm trung bình từ 6.8',bonus:6}:{id:c.pos==='FW'?'g':'ga',n:c.pos==='FW'?(starter?8:4):(starter?5:3),t:c.pos==='FW'?`Ghi ít nhất ${starter?8:4} bàn`:`Ghi hoặc kiến tạo ít nhất ${starter?5:3} bàn`,bonus:8},
  {id:'rank',n:top,t:`Đội kết thúc trong top ${top}`,bonus:10}]}
function checkObj(c,o,rank,avg){const s=c.stat;return o.id==='ap'?s.ap>=o.n:o.id==='g'?s.g>=o.n:o.id==='ga'?s.g+s.a>=o.n:o.id==='rat'?avg>=o.n:rank<=o.n}
function objProgress(c,o){const s=c.stat,avg=s.rat.length?s.rat.reduce((a,b)=>a+b,0)/s.rat.length:0,rank=ranking(c.lg).findIndex(x=>x.i===c.club)+1;
 return o.id==='ap'?[s.ap,o.n]:o.id==='g'?[s.g,o.n]:o.id==='ga'?[s.g+s.a,o.n]:o.id==='rat'?[+avg.toFixed(1),o.n]:[rank,o.n]}

/* ---- Kết thúc mùa: phát triển, lưu hồ sơ, mùa mới ---- */
function endSeason(c){const rk=ranking(c.lg),rank=rk.findIndex(x=>x.i===c.club)+1,s=c.stat,avg=s.rat.length?s.rat.reduce((a,b)=>a+b,0)/s.rat.length:0;
 const objRes=c.obj.map(o=>({...o,ok:checkObj(c,o,rank,avg)}));let bonus=0;
 objRes.forEach(o=>{if(o.ok){bonus+=o.bonus;c.fame=cl(c.fame+3,0,100);c.morale=cl(c.morale+4,0,100)}else c.morale=cl(c.morale-2,0,100)});c.money+=bonus;
 const grow=[];Object.keys(c.st).forEach(k=>{let d=c.age<=20?ri(0,3):c.age<=25?ri(0,2):c.age<=30?ri(-1,1):ri(-3,0);if(k==='sta'&&c.age>30)d-=1;const n=cl(c.st[k]+d,20,Math.min(99,c.pot+4));if(n!==c.st[k])grow.push([k,n-c.st[k]]);c.st[k]=n});
 const champ=rank===1;if(champ)c.tot.trophies++;
 c.hist.push({season:c.season,age:c.age,club:c.lg.teams[c.club].n,lg:CFG.leagues[c.lgId].n,rank,ap:s.ap,g:s.g,a:s.a,rat:+avg.toFixed(2),ovr:ovr(c),champ});
 const sum={season:c.season,age:c.age,rank,champ,avg,s:{...s},objRes,bonus,grow,club:c.lg.teams[c.club].n,table:rk.slice(0,4),oldOvr:0};
 c.age++;c.season++;c.ct.yrs--;if(c.ct.yrs<=0){c.ct.yrs=ri(2,4);c.ct.wage=wage(c);sum.contract=`Hợp đồng mới ${c.ct.yrs} năm, lương ${c.ct.wage}k mỗi tuần.`}
 c.stat={ap:0,g:0,a:0,rat:[],min:0};c.lg=buildLeague(c.lgId,c.lg);c.energy=100;c.bench=0;c.inj=0;genObjectives(c);
 sum.ovr=ovr(c);sum.value=value(c);sum.retired=c.age>=CFG.rules.retireAge;return sum}

return{create,ovr,value,wage,role,matchStats,train,pickEvent,choose,fixture,ranking,finishMatch,nextWeek,endSeason,objProgress,simScore,buildLeague}})();
if(typeof module!=='undefined')module.exports=Career;
