(() => {
 'use strict';
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const body=document.body,story=$('.story'),stage=$('.story-stage'),position=$('#photo-position'),portrait=$('#portrait-object'),face=$('.portrait-face'),back=$('.portrait-back'),title=$('.name-title'),left=$('.intro-left'),right=$('.intro-right'),field=$('.panel-field'),systems=$('.panel-systems'),shadow=$('.photo-shadow'),toggle=$('#motion-switch'),canvas=$('#network'),ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer:coarse)');
 let enabled=!reduced.matches,progress=0,targetProgress=0,raf=0,last=0,t=0,w=0,h=0,px=0,py=0,sx=0,sy=0;
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,v)=>a+(b-a)*v;
 const dots=$$('.chapter-dots span');
 let networkRgb='36,73,235';
 function setTheme(theme){
  if(!['light','dark','neon'].includes(theme))theme='light';
  body.dataset.theme=theme;
  $$('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===theme)));
  networkRgb=theme==='neon'?'131,255,197':theme==='dark'?'140,175,255':'36,73,235';
  $('meta[name="theme-color"]').content=theme==='neon'?'#080d10':theme==='dark'?'#101723':'#edf0f3';
  try{localStorage.setItem('irtza-portfolio-theme',theme);}catch{}
  if(!enabled)draw();
 }
 $$('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>setTheme(button.dataset.themeChoice)));
 let savedTheme='light';try{savedTheme=localStorage.getItem('irtza-portfolio-theme')||'light';}catch{}
 function visibility(el,opacity,transform){el.style.opacity=opacity;el.style.visibility=opacity>.02?'visible':'hidden';if(transform)el.style.transform=transform;el.setAttribute('aria-hidden',String(opacity<.5));}
 function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=w*dpr;canvas.height=h*dpr;if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);readScroll();}
 function readScroll(){const rect=story.getBoundingClientRect();targetProgress=clamp(-rect.top/Math.max(1,rect.height-stage.offsetHeight));const max=document.documentElement.scrollHeight-innerHeight;$('.page-progress').style.width=`${max>0?scrollY/max*100:0}%`;if(!enabled)progress=0;}
 function renderPhoto(){
  const mobile=innerWidth<=760,p=enabled?progress:0;
  const a=smooth((p-.07)/.25),b=smooth((p-.50)/.27);
  const introOpacity=1-smooth((p-.035)/.13),fieldOpacity=smooth((p-.18)/.13)*(1-smooth((p-.48)/.12)),systemsOpacity=smooth((p-.64)/.13);
  const x=mobile?mix(0,innerWidth*.12,a)-innerWidth*.24*b:mix(0,innerWidth*.255,a)-innerWidth*.50*b;
  const y=mobile?(-stage.offsetHeight*.18*a+stage.offsetHeight*.015*b):(-12*a+7*b);
  const scale=mobile?1-.20*a+.015*b:1+.06*a-.05*b;
  const ry=-13-12*a+45*b+sx*5,rz=-5+13*a-15*b+sx*1.5;
  position.style.transform=`translate(-50%,${mobile?'-28%':'-40%'}) translate3d(${x}px,${y}px,0) scale(${scale})`;
  portrait.style.transform=`rotateX(${-sy*4}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
  const radius=22+110*b;face.style.borderRadius=`${radius}px ${radius}px 22px 22px`;back.style.borderRadius=`${radius+5}px ${radius+5}px 28px 28px`;
  visibility(title,introOpacity,`translateY(${-a*80}px) scale(${1-a*.05})`);
  visibility(left,introOpacity,`translateY(${mobile?0:-15-a*30}%)`);visibility(right,introOpacity,`translateY(${mobile?0:-5-a*30}%)`);
  visibility(field,fieldOpacity,mobile?`translateY(${(1-fieldOpacity)*22}px)`:`translateY(-38%) translateX(${(1-fieldOpacity)*-30}px)`);
  visibility(systems,systemsOpacity,mobile?`translateY(${(1-systemsOpacity)*22}px)`:`translateY(-38%) translateX(${(1-systemsOpacity)*30}px)`);
  shadow.style.transform=`translateX(calc(-50% + ${x}px)) scale(${scale})`;shadow.style.opacity=mobile?.6:1;
  const chapter=systemsOpacity>.5?2:fieldOpacity>.5?1:0;dots.forEach((d,i)=>d.classList.toggle('active',i===chapter));$('.stage-count').innerHTML=`0${chapter+1} <span>/ 03</span>`;
 }
 const points=Array.from({length:58},(_,i)=>{const y=1-i/57*2,r=Math.sqrt(1-y*y),a=i*Math.PI*(3-Math.sqrt(5));return{x:Math.cos(a)*r,y,z:Math.sin(a)*r};});
 function project(p,angle,r){const x=p.x*Math.cos(angle)+p.z*Math.sin(angle),z=-p.x*Math.sin(angle)+p.z*Math.cos(angle),y=p.y*.78-z*.35;return{x:w/2+x*r,y:h*.55+y*r*.78,z};}
 function draw(){if(!ctx||!w)return;ctx.clearRect(0,0,w,h);const radius=Math.min(w*.34,h*.50),angle=t*.00010+progress*2;const coords=points.map(p=>project(p,angle,radius));
  for(let i=0;i<coords.length;i++){const a=coords[i];for(let j=i+1;j<coords.length;j++){const d=Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y,points[i].z-points[j].z);if(d>.52)continue;ctx.strokeStyle=`rgba(${networkRgb},${(.52-d)*.22})`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(coords[j].x,coords[j].y);ctx.stroke();}ctx.fillStyle=`rgba(${networkRgb},${.07+(a.z+1)*.08})`;ctx.beginPath();ctx.arc(a.x,a.y,1.4,0,Math.PI*2);ctx.fill();}
  for(let k=0;k<2;k++){ctx.beginPath();for(let i=0;i<=110;i++){const a=i/110*Math.PI*2,tilt=.65+k;const p=project({x:Math.cos(a)*1.22,y:Math.sin(a)*Math.cos(tilt)*1.22,z:Math.sin(a)*Math.sin(tilt)*1.22},angle*.5+k,radius);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);}ctx.strokeStyle=`rgba(${networkRgb},${k?.06:.12})`;ctx.lineWidth=1;ctx.stroke();}}
 function tick(now){if(document.hidden||!enabled){raf=0;return;}if(now-last>25){t+=Math.min(40,now-last);last=now;progress+=(targetProgress-progress)*.16;sx+=(px-sx)*.08;sy+=(py-sy)*.08;if(story.getBoundingClientRect().bottom>0){renderPhoto();draw();}}raf=requestAnimationFrame(tick);}
 function start(){if(enabled&&!document.hidden&&!raf)raf=requestAnimationFrame(tick);}
 function setMotion(value){enabled=value;body.classList.toggle('motion-on',enabled);body.classList.toggle('motion-off',!enabled);toggle.setAttribute('aria-pressed',String(!enabled));toggle.setAttribute('aria-label',enabled?'Pause animations':'Enable animations');toggle.innerHTML=`Motion ${enabled?'on':'off'} <span aria-hidden="true">${enabled?'Ⅱ':'▷'}</span>`;if(!enabled){cancelAnimationFrame(raf);raf=0;targetProgress=progress=0;}resize();progress=targetProgress;renderPhoto();draw();start();}
 toggle.addEventListener('click',()=>setMotion(!enabled));reduced.addEventListener('change',e=>setMotion(!e.matches));
 stage.addEventListener('pointermove',e=>{if(!enabled||coarse.matches)return;const r=stage.getBoundingClientRect();px=(e.clientX-r.left)/r.width*2-1;py=(e.clientY-r.top)/r.height*2-1;});stage.addEventListener('pointerleave',()=>{px=py=0;});
 $$('.tool-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(!enabled||coarse.matches)return;const r=card.getBoundingClientRect();card.style.transform=`rotateY(${((e.clientX-r.left)/r.width-.5)*10}deg) rotateX(${((e.clientY-r.top)/r.height-.5)*-8}deg) translateY(-8px)`;});card.addEventListener('pointerleave',()=>card.style.transform='');});
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el));
 let pending=false;addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(()=>{readScroll();pending=false;});}},{passive:true});addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
 body.classList.add('js-ready');setMotion(enabled);setTheme(savedTheme);
 // Refresh the local live preview when its files change. Never runs on hosting.
 if(['127.0.0.1','localhost'].includes(location.hostname)){
  let version='';
  async function watchPreview(){
   try{const parts=await Promise.all(['index.html','layout.css','motion.js'].map(async path=>{const response=await fetch(path,{method:'HEAD',cache:'no-store'});return response.ok?response.headers.get('Last-Modified')+'|'+response.headers.get('Content-Length'):'';}));const next=parts.join(';');if(version&&next!==version){location.reload();return;}version=next;}catch{/* Preview may be restarting. */}
  }
  watchPreview();setInterval(watchPreview,2500);
 }
})();
