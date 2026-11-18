// ===== SPRITE =====
const PAL={g:'#c8c8c8',s:'#f0b48a',k:'#222',m:'#4a3a30',w:'#dfe9f5',b:'#1c1c1c',o:'#5a3a1e',a:'#b3c4dc',c:'#7a4a22',r:'#ff9a1f'};
const HEAD=["...gggggg.....","..gggggggg....","..gssssssss...","..gsskssksss..","..gsssssssss..","..gmmmmmmssccccr","...sssssss...."];
const SW=16;
const BODY=[".awwwwwwwwwwa.",".awbwwwwwwbwa.",".awbwwwwwwbwa.",".awbwwwwwwbwa.",".abbbbbbbbbba.",".sbbbbbbbbbbs.","...bbbbbbbb..."];
const LEGS={0:["...bbb..bbb...","...bbb..bbb...","..oooo..oooo.."],1:["....bbbbbb....","....bbbbbb....","...oooooooo..."],2:["..bbb....bbb..","..oooo...oooo."]};
function desenharMascara(rows,pal,x,y,s,flip,w){
 rows.forEach((row,j)=>{for(let i=0;i<row.length;i++){const ch=row[i];if(ch==='.')continue;
  ctx.fillStyle=pal[ch];ctx.fillRect(x+(flip?w-1-i:i)*s,y+j*s,s,s)}});
}
function desenharSprite(x,y,frame,flip,s){desenharMascara(frame===3?[...HEAD,...BODY.slice(0,5),"..oooooooooo.."]:[...HEAD,...BODY,...LEGS[frame]],PAL,x,y,s,flip,SW)}
// Inimigo: globo terrestre com antena de TV (arte genérica)
const GP={b:'#2a6fd6',g:'#3aa655',w:'#fff',k:'#222',r:'#e53935'};
const GLOBE=[".r........r.","..r......r..","..rrbbbbrr..","..bbbbbbbb..",".bbgbbbbggb.",".bgggbbbggb.","bbbwkbwkbbbb","bbgbbbbbbgbb","bbgbkkkkbgbb",".bbbbbbbbbb.",".bbggbbgbbb.","..bbbbbbbb..","...bbbbbb..."];
const BP={k:'#161616',r:'#c62828',y:'#e8d9a0'};
const BIRD=[["kk..........kk",".kkk......kkk.","..kkkkkkkkkk..","...kkkkkkkkrr.","....kkkkkkkrry",".....kkkkk....","......kk......"],["..............","...kkkkkkkkrr.","..kkkkkkkkkrry","kkkkkkkkkkkkr.","kk.kkkkkkkk...","k...kkkkkk....","......kk......"]];
const LG=document.createElement('canvas');LG.width=16;LG.height=20;
(function(){const g=LG.getContext('2d'),R=['#0536f0','#0a82f5','#08b8c8','#10b050','#a8b800','#f0a000','#ff6a00','#ff2e0a'];
 for(let y=4;y<20;y++)for(let x=0;x<16;x++){const dx=x+.5-8,dy=y+.5-12;if(dx*dx+dy*dy>64)continue;
  let c=dy>3?'#b9a6dd':dy<-3?'#efe6fc':'#d9c9f5';
  if(x>=1&&x<=14&&y>=8&&y<=15){c=R[y-8];if(dx*dx+dy*dy<=11.5)c=dy>1.5?'#d9b8ea':dy<-1?'#f1eafc':'#e2d4f6'}
  g.fillStyle=c;g.fillRect(x,y,1,1)}
 g.fillStyle='#e53935';[[4,5],[3,5],[3,4],[2,3],[2,2],[1,1],[11,5],[12,5],[12,4],[13,3],[13,2],[14,1]].forEach(([x,y])=>g.fillRect(x,y,1,1));
})();
// ===== JOGO =====
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const S=2,W=SW*S,H=17*S,G=0.35,WORLD=2700,GY=180;
const ground=[[0,520],[580,1040],[1100,1560],[1620,2700]];
const plats=[[180,138,64],[300,104,48],[420,138,48],[640,138,64],[760,104,64],[900,138,48],[1180,138,64],[1300,104,64],[1420,138,48],[1700,138,64],[1820,104,64],[1960,138,64]];
const tops=[...ground.map(([a,b])=>[a,b,GY]),...plats.map(([x,y,w])=>[x,x+w,y])];
let coins,enemies,birds,p,cam,smoke,score,lives,state,st,endT=0,newRec=false,best=0,t=0;
try{best=+localStorage.getItem('cartolaBest')||0}catch(e){}
function reiniciar(){
 p={x:40,y:GY-H,vx:0,vy:0,flip:false,air:false,inv:0};cam=0;smoke=[];score=0;lives=10;state='play';endT=0;newRec=false;st={c:0,b:0,t:0,e:0,m:0};
 coins=[];
 plats.forEach(([x,y,w],i)=>coins.push({x:x+w/2-6,y:y-14,t:[1,7,10].includes(i)?'trophy':(i%2?'bill':'cigar'),on:1}));
 coins.push({x:2150,y:GY-22,t:'trophy',on:1});
 [[150,'silver'],[400,'bronze'],[600,'gold'],[780,'silver'],[950,'bronze'],[1120,'gold'],[1250,'silver'],[1450,'bronze'],[1660,'gold'],[1900,'silver'],[2100,'bronze'],[2250,'gold']].forEach(([x,t])=>coins.push({x,y:GY-16,t,on:1}));
 [100,250,360,700,820,1000,1150,1380,1500,1650,1800,2050,2150].forEach((x,i)=>coins.push({x,y:GY-16,t:i%3?'cigar':'bill',on:1}));
 enemies=[[300,250,480],[700,620,1000],[1250,1120,1500],[1800,1650,2000],[2050,1900,2250],[450,380,510],[650,590,800],[900,820,1030],[1150,1110,1250],[1400,1330,1550],[1700,1630,1800],[2150,2100,2290]].map(([x,a,b])=>({x,a,b,y:GY-30,vx:.6,on:1}));
 birds=[[350,250,500],[640,540,760],[950,900,1100],[1200,1100,1400],[1480,1400,1700],[1750,1650,1900],[2000,1900,2150],[2100,2000,2250]].map(([x,a,b])=>({x,a,b,y:132,vx:1,ph:Math.random(),on:1}));
}
reiniciar();
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=false);
function segurarBotao(id,code){const b=document.getElementById(id);
 const on=e=>{e.preventDefault();keys[code]=true},off=e=>{e.preventDefault();keys[code]=false};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);}
segurarBotao('L','ArrowLeft');segurarBotao('R','ArrowRight');segurarBotao('J','Space');segurarBotao('D','ArrowDown');
cv.addEventListener('pointerdown',()=>{if(state!=='play'&&endT>45)reiniciar()});
function salvarRecorde(){if(score>best){best=score;newRec=true;try{localStorage.setItem('cartolaBest',String(best))}catch(e){}}}
function morrer(){lives--;if(lives<=0){state='over';return}p.x=40;p.y=GY-H;p.vy=0;p.inv=90}
function atualizar(){
 if(state!=='play'){if(++endT===1)salvarRecorde();if(endT>45&&(keys.Space||keys.Enter)){keys.Space=false;reiniciar()}return}
 t++;
 const l=keys.ArrowLeft||keys.KeyA,r=keys.ArrowRight||keys.KeyD;
 const sp=p.cr?.8:2.2;p.vx=l?-sp:r?sp:0;if(l)p.flip=true;if(r)p.flip=false;
 if((keys.Space||keys.ArrowUp||keys.KeyW)&&!p.air){p.vy=-7.2;p.air=true}
 p.x=Math.max(0,Math.min(WORLD-W,p.x+p.vx));
 const pb=p.y+H;p.vy+=G;p.y+=p.vy;p.air=true;
 const hx=p.x+4,hw=W-8;
 if(p.vy>=0)for(const [a,b,top] of tops){if(hx+hw>a&&hx<b&&pb<=top+1&&p.y+H>=top){p.y=top-H;p.vy=0;p.air=false;break}}
 if(p.y>260){morrer();return}
 p.cr=!p.air&&!!(keys.ArrowDown||keys.KeyS);const ty=p.y+(p.cr?8:0);
 if(p.inv>0)p.inv--;
 for(const e of enemies){if(!e.on)continue;
  e.x+=e.vx;if(e.x<e.a||e.x>e.b)e.vx*=-1;
  if(hx+hw>e.x&&hx<e.x+24&&p.y+H>e.y&&ty<e.y+30){
   if(p.vy>0&&pb<=e.y+11){e.on=0;p.vy=-5;score+=100;st.e++}
   else if(p.inv===0){lives--;if(lives<=0){state='over';return}p.inv=90;p.vy=-4}
  }}
 for(const b of birds){if(!b.on)continue;
  b.x+=b.vx;if(b.x<b.a||b.x>b.b)b.vx*=-1;b.y=132+Math.sin(t/20+b.ph*6)*8;
  if(hx+hw>b.x&&hx<b.x+28&&p.y+H>b.y&&ty<b.y+14){
   if(p.vy>0&&pb<=b.y+8){b.on=0;p.vy=-5;score+=100;st.e++}
   else if(p.inv===0){lives--;if(lives<=0){state='over';return}p.inv=90;p.vy=-4}
  }}
 for(const c of coins){if(c.on&&hx+hw>c.x&&hx<c.x+12&&p.y+H>c.y&&ty<c.y+8){c.on=0;if(c.t==='bill'){score+=50;st.b++}else if(c.t==='trophy'){score+=200;st.t++}else if(c.t==='silver'||c.t==='bronze'||c.t==='gold'){score+={silver:10,bronze:20,gold:30}[c.t];st.m++}else{score+=10;st.c++}}}
 if(p.x>2560)state='win';
 cam=Math.max(0,Math.min(WORLD-cv.width,p.x-120));
 if(t%6===0)smoke.push({x:p.flip?p.x:p.x+15*S,y:p.y+(p.cr?8:0)+5*S,a:1,dx:(Math.random()-.5)*.4});
 smoke.forEach(s=>{s.y-=.6;s.x+=s.dx;s.a-=.015});smoke=smoke.filter(s=>s.a>0);
}
function desenharFinal(){
 ctx.fillStyle='#ddd';ctx.fillRect(2330,88,3,92);
 ctx.fillStyle='#fff';ctx.fillRect(2333,90,42,30);
 ctx.fillStyle='#111';ctx.beginPath();ctx.moveTo(2333,90);ctx.lineTo(2349,90);ctx.lineTo(2375,120);ctx.lineTo(2359,120);ctx.closePath();ctx.fill();
 ctx.fillStyle='#d02b2b';ctx.fillRect(2349,104,10,3);ctx.fillRect(2352,100,3,11);
 ctx.strokeStyle='#111';ctx.lineWidth=1;ctx.strokeRect(2333.5,90.5,41,29);
 ctx.fillStyle='#ddd';ctx.fillRect(2395,78,3,102);
 ctx.fillStyle='#f4f1ea';ctx.fillRect(2398,82,142,74);
 ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.strokeRect(2399,83,140,72);
 ctx.fillStyle='#111';ctx.font='bold 9px monospace';ctx.textAlign='left';
 ['Você realizou o','sonho de Eurico Miranda','de um Vasco forte','e Olímpico.','Parabéns!'].forEach((l,i)=>ctx.fillText(l,2406,98+i*12));
}
function desenharItem(c){
 const y=c.y+Math.sin(t/12+c.x)*2;
 if(c.t==='trophy'){ctx.fillStyle='#ffd23c';ctx.fillRect(c.x+1,y,10,5);ctx.fillRect(c.x+4,y+5,4,3);ctx.fillRect(c.x+2,y+8,8,2);ctx.fillStyle='#e0a800';ctx.fillRect(c.x-1,y+1,2,3);ctx.fillRect(c.x+11,y+1,2,3);ctx.fillRect(c.x+3,y+1,2,3)}
 else if(c.t==='silver'||c.t==='bronze'||c.t==='gold'){const m={silver:['#c0c4cc','#8a8f98'],bronze:['#cd7f32','#8a4f18'],gold:['#ffd23c','#c79a00']}[c.t];ctx.fillStyle='#d03030';ctx.fillRect(c.x+2,y-3,3,4);ctx.fillStyle='#2a6fd6';ctx.fillRect(c.x+5,y-3,3,4);ctx.fillStyle=m[1];ctx.fillRect(c.x+2,y+1,6,8);ctx.fillRect(c.x+1,y+2,8,6);ctx.fillRect(c.x,y+3,10,4);ctx.fillStyle=m[0];ctx.fillRect(c.x+3,y+2,4,6);ctx.fillRect(c.x+2,y+3,6,4)}
 else if(c.t==='cigar'){ctx.fillStyle='#7a4a22';ctx.fillRect(c.x,y+2,12,4);ctx.fillStyle='#d4a017';ctx.fillRect(c.x+3,y+2,2,4);ctx.fillStyle='#ff9a1f';ctx.fillRect(c.x+10,y+2,2,4)}
 else{ctx.fillStyle='#2e7d32';ctx.fillRect(c.x,y,12,8);ctx.fillStyle='#66bb6a';ctx.fillRect(c.x+1,y+1,10,6);ctx.fillStyle='#c8e6a0';ctx.fillRect(c.x+4,y+2,4,4)}
}
function caminhoCruz(x,y,L,wo,wi,n){ctx.beginPath();for(let k=0;k<4;k++){const a=k*Math.PI/2,c=Math.cos(a),s=Math.sin(a);[[-wi,-wi],[-wo,-L],[0,-L+n],[wo,-L],[wi,-wi]].forEach(([px,py],i)=>{const X=x+px*c-py*s,Y=y+px*s+py*c;(k===0&&i===0)?ctx.moveTo(X,Y):ctx.lineTo(X,Y)})}ctx.closePath()}
const GO=document.createElement('canvas');GO.width=384;GO.height=80;
function desenhar(){
 ctx.fillStyle='#6ec6ff';ctx.fillRect(0,0,384,216);
 ctx.fillStyle='#fff';for(let i=0;i<8;i++){const x=((i*170-cam*.5)%1360+1360)%1360-60;ctx.fillRect(x,24+(i%3)*18,32,8);ctx.fillRect(x+6,18+(i%3)*18,18,6)}
 
 
 ctx.save();ctx.translate(-Math.round(cam),0);
 ground.forEach(([a,b])=>{ctx.fillStyle='#3aa655';ctx.fillRect(a,GY,b-a,6);ctx.fillStyle='#8a5a2b';ctx.fillRect(a,GY+6,b-a,40)});
 plats.forEach(([x,y,w])=>{ctx.fillStyle='#d98a2b';ctx.fillRect(x,y,w,12);ctx.fillStyle='#8a4f10';ctx.fillRect(x,y,w,2);for(let i=16;i<w;i+=16)ctx.fillRect(x+i,y,2,12)});
 desenharFinal();
 coins.forEach(c=>c.on&&desenharItem(c));
 enemies.forEach(e=>{if(e.on){ctx.imageSmoothingEnabled=false;ctx.drawImage(LG,Math.round(e.x),e.y,24,30)}});
 birds.forEach(b=>b.on&&desenharMascara(BIRD[Math.floor((t+b.ph*20)/8)%2],BP,Math.round(b.x),Math.round(b.y),2,b.vx<0,14));
 smoke.forEach(s=>{ctx.globalAlpha=Math.max(0,s.a)*.8;ctx.fillStyle='#ddd';const z=2+(1-s.a)*4;ctx.fillRect(s.x,s.y,z,z)});
 ctx.globalAlpha=1;
 if(!(p.inv>0&&Math.floor(p.inv/4)%2)){
  const f=p.cr?3:p.air?2:(p.vx!==0&&Math.floor(t/8)%2?1:0);
  desenharSprite(Math.round(p.x),Math.round(p.y)+(p.cr?8:0),f,p.flip,S);
 }
 ctx.restore();
 ctx.font='bold 12px monospace';ctx.textAlign='left';
 const txt=(s,x,y)=>{ctx.fillStyle='#000';ctx.fillText(s,x+1,y+1);ctx.fillStyle='#fff';ctx.fillText(s,x,y)};
 txt('PONTOS '+score+'  TROFÉUS '+st.t,8,16);txt('VIDAS '+lives,300,16);txt('RECORDE '+Math.max(best,score),8,30);
 if(state!=='play'){
  if(state==='over'){ctx.fillStyle='rgba(0,0,0,.8)';ctx.fillRect(0,0,384,216);ctx.textAlign='center';ctx.font='bold 56px monospace';ctx.lineJoin='round';ctx.lineWidth=7;ctx.strokeStyle='#c62828';ctx.strokeText('GAME OVER',192,110);
  const g=GO.getContext('2d');g.clearRect(0,0,384,80);g.globalCompositeOperation='source-over';g.font='bold 56px monospace';g.textAlign='center';g.fillStyle='#fff';g.fillText('GAME OVER',192,60);
  g.globalCompositeOperation='source-atop';g.fillStyle='#111';g.beginPath();g.moveTo(105,0);g.lineTo(150,0);g.lineTo(279,80);g.lineTo(234,80);g.closePath();g.fill();
  ctx.drawImage(GO,0,50);
  caminhoCruz(192,90,15,8,3,0);ctx.fillStyle='#d02b2b';ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='#fff';ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(191,80,2,20);ctx.fillRect(182,89,20,2);ctx.font='bold 14px monospace';ctx.fillStyle='#fff';ctx.fillText('Pontos: '+score+'   Recorde: '+best,192,140);if(newRec){ctx.fillStyle='#ffd23c';ctx.fillText('NOVO RECORDE!',192,186);ctx.fillStyle='#fff'}ctx.fillText('Toque ou espaço para tentar de novo',192,162);return}
  ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,40,384,140);ctx.textAlign='center';
  ctx.font='bold 20px monospace';ctx.fillStyle='#fff';ctx.fillText(state==='win'?'CAMPEÃO!':'FIM DE JOGO',192,72);
  ctx.font='12px monospace';ctx.fillText('Charutos '+st.c+'   Notas '+st.b+'   Medalhas '+st.m+'   Troféus '+st.t+'/'+coins.filter(c=>c.t==='trophy').length,192,96);ctx.fillText('Inimigos derrotados '+st.e+'/'+(enemies.length+birds.length),192,114);ctx.fillText('Pontos: '+score+(newRec?'  NOVO RECORDE!':'   Recorde: '+best),192,134);ctx.fillText('Toque ou espaço para jogar de novo',192,158);
 }
}
(function laco(){atualizar();desenhar();requestAnimationFrame(laco)})();
