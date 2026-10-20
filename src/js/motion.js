export function initMotion(){
 const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const controller=new AbortController();const {signal}=controller;
 const bar=document.querySelector('.scroll-progress');let progressFrame=0;
 function progress(){if(progressFrame)return;progressFrame=requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${max>0?scrollY/max:0})`;document.querySelector('.header').classList.toggle('compact',scrollY>80);progressFrame=0;});}
 window.addEventListener('scroll',progress,{passive:true,signal});window.addEventListener('resize',progress,{passive:true,signal});progress();
 if(!gsap||!ScrollTrigger){document.querySelector('.story')?.classList.add('motion-unavailable');return()=>controller.abort();}
 gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
 mm.add({motion:'(prefers-reduced-motion: no-preference)',desktop:'(min-width: 761px)',fine:'(hover: hover) and (pointer: fine)'},context=>{
  if(!context.conditions.motion)return;
  const local=new AbortController(),eventOptions={signal:local.signal};
  const loader=document.querySelector('.preloader');let seen=true;try{seen=!!sessionStorage.getItem('dopamine-intro');sessionStorage.setItem('dopamine-intro','1');}catch{}
  const intro=gsap.timeline({defaults:{ease:'power3.out'}});
  if(!seen){loader.hidden=false;intro.to('.loader-blob',{scale:1.8,rotation:40,duration:.55}).fromTo('.preloader .original-logo',{scaleX:.8,scaleY:1.15,opacity:0},{scaleX:1,scaleY:1,opacity:1,duration:.4,ease:'back.out(1.6)'},.15).to(loader,{clipPath:'inset(0 0 100% 0 round 0 0 45% 45%)',duration:.65,ease:'power3.inOut',onComplete:()=>{loader.hidden=true;}},.6);}
  intro.from('.hero-line',{yPercent:35,rotation:2,opacity:0,stagger:.10,duration:.8},seen?0:.85).from('.brand-sculpture',{scale:.78,rotation:14,opacity:0,duration:1.1,ease:'back.out(1.25)'},seen?.05:.9).from('.hero-bottom',{y:20,opacity:0,duration:.7},seen?.3:1.1).from('.mood-sticker',{scale:0,rotation:35,duration:.85,ease:'elastic.out(1,.65)'},seen?.35:1.2);
  gsap.to('.brand-sculpture',{scale:1.08,y:45,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
  document.querySelectorAll('[data-reveal]').forEach(n=>{gsap.from(n,{y:32,rotation:1.1,duration:.85,ease:'power3.out',scrollTrigger:{trigger:n,start:'top 90%',once:true}});});
  const headings=gsap.utils.toArray('.story-heading');const dots=document.querySelectorAll('.story-dots i');
  const story=gsap.timeline({scrollTrigger:{trigger:'.story',start:'top top',end:'bottom bottom',scrub:.6,onUpdate:self=>{const index=Math.min(2,Math.floor(self.progress*3));document.querySelector('.story-counter').textContent=`0${index+1} / 03`;dots.forEach((n,i)=>n.classList.toggle('active',i===index));}}});
  story.to('.story-blob',{backgroundColor:'#ff008c',rotation:15,scale:1.1,borderRadius:'35% 65% 55% 45% / 52% 35% 65% 48%',duration:1},0).to('.story-smile',{color:'#c7ff00',rotation:10,scale:1.1,duration:1},0).to(headings[0],{y:-65,opacity:0,duration:.3},.5).fromTo(headings[1],{y:65,opacity:0},{y:0,opacity:1,duration:.4},.7).to('.story-star',{scale:1,rotation:80,duration:.7},.7).to(headings[1],{y:-65,opacity:0,duration:.3},1.5).fromTo(headings[2],{y:65,opacity:0},{y:0,opacity:1,duration:.4},1.7).to('.story-blob',{backgroundColor:'#c7ff00',rotation:45,scale:1.3,duration:.7},1.6).to('.story-smile',{color:'#101010',rotation:-12,duration:.7},1.6).to('.story-star',{rotation:160,color:'#ffffff',duration:.7},1.6).to({},{duration:.25});
  const marquee=document.querySelector('.marquee-track');const marqueeTrigger=ScrollTrigger.create({trigger:'.marquee',start:'top bottom',end:'bottom top',onUpdate:self=>{const speed=Math.min(2.5,1+Math.abs(self.getVelocity())/1800);marquee.getAnimations().forEach(a=>{a.playbackRate=speed;});}});
  if(context.conditions.fine){
   const cursor=document.querySelector('.cursor');document.body.classList.add('has-custom-cursor');const x=gsap.quickTo(cursor,'x',{duration:.25,ease:'power3.out'}),y=gsap.quickTo(cursor,'y',{duration:.25,ease:'power3.out'});
   document.addEventListener('pointermove',e=>{x(e.clientX);y(e.clientY);cursor.classList.remove('outside');},eventOptions);
   document.addEventListener('pointerover',e=>{const target=e.target.closest('[data-cursor]');cursor.classList.toggle('expanded',!!target);cursor.classList.toggle('button-hover',!target&&!!e.target.closest('button,.button'));cursor.querySelector('span').textContent=target?.dataset.cursor||'';},eventOptions);
   document.addEventListener('pointerleave',()=>cursor.classList.add('outside'),eventOptions);
   for(const b of document.querySelectorAll('.magnetic')){let rect;const bx=gsap.quickTo(b,'x',{duration:.4,ease:'power3.out'}),by=gsap.quickTo(b,'y',{duration:.4,ease:'power3.out'});b.addEventListener('pointerenter',()=>{rect=b.getBoundingClientRect();},eventOptions);b.addEventListener('pointermove',e=>{if(!rect)return;bx((e.clientX-rect.left-rect.width/2)*.13);by((e.clientY-rect.top-rect.height/2)*.2);},eventOptions);b.addEventListener('pointerleave',()=>{bx(0);by(0);},eventOptions);}
   const art=document.querySelector('.hero-art'),sculpture=document.querySelector('.brand-sculpture');let rect;const hx=gsap.quickTo(sculpture,'x',{duration:.9,ease:'power3.out'}),hr=gsap.quickTo(sculpture,'rotation',{duration:1,ease:'power3.out'});art.addEventListener('pointerenter',()=>{rect=art.getBoundingClientRect();},eventOptions);art.addEventListener('pointermove',e=>{if(!rect)return;hx((e.clientX-rect.left-rect.width/2)*.045);hr(-9+(e.clientY-rect.top-rect.height/2)*.015);},eventOptions);art.addEventListener('pointerleave',()=>{hx(0);hr(-9);},eventOptions);
  }
  return()=>{local.abort();document.body.classList.remove('has-custom-cursor');loader.hidden=true;};
 });
 window.addEventListener('dopamine:catalog-ready',()=>{mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)',()=>{const featured=document.querySelector('.featured-section');if(featured.hidden)return;const track=featured.querySelector('.featured-track');gsap.to(track,{x:()=>-Math.max(0,track.scrollWidth-featured.clientWidth+parseFloat(getComputedStyle(featured.querySelector('.featured-pin')).paddingLeft)*2),ease:'none',scrollTrigger:{trigger:'.featured-pin',pin:true,start:'top top',end:()=>`+=${track.scrollWidth}`,scrub:1,invalidateOnRefresh:true}});});},{once:true,signal});
 const cleanup=()=>{mm.revert();controller.abort();cancelAnimationFrame(progressFrame);};
 document.fonts.ready.then(()=>ScrollTrigger.refresh());window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true,signal});
 window.addEventListener('pagehide',()=>mm.revert(),{once:true,signal});
 window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();},{signal});
 return cleanup;
}
export function feedback(element){if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;window.gsap?.fromTo(element,{scaleX:.92,scaleY:1.06},{scaleX:1,scaleY:1,duration:.45,ease:'elastic.out(1,.5)',overwrite:true});}
