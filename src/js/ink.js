// Independent Canvas 2D implementation. No paid MotionSites code is used.
export function initInk(){
 const word=document.querySelector('.ink-word'),text=word?.querySelector('.ink-text'),canvas=word?.querySelector('canvas');
 if(!canvas||!text)return()=>{};
 const ctx=canvas.getContext('2d');if(!ctx)return()=>{};
 const mask=document.createElement('canvas'),maskCtx=mask.getContext('2d');
 const layer=document.createElement('canvas'),layerCtx=layer.getContext('2d');
 const color=document.createElement('canvas'),colorCtx=color.getContext('2d');
 if(!maskCtx||!layerCtx||!colorCtx)return()=>{};
 const media=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const controller=new AbortController(),signal=controller.signal;
 let frame=0,points=[],last=null,bounds,width=0,height=0,pad=45,fontSize=0,dpr=1,visible=true,disposed=false;
 function resize(){
  if(disposed)return;
  if(media.matches){points=[];ctx.clearRect(0,0,width,height);cancelAnimationFrame(frame);frame=0;return;}
  const style=getComputedStyle(text);fontSize=parseFloat(style.fontSize);pad=innerWidth<=760?24:45;
  width=Math.ceil(word.offsetWidth+pad*2);height=Math.ceil(word.offsetHeight+pad*2);dpr=Math.min(devicePixelRatio||1,1.5);
  for(const c of [canvas,mask,layer,color]){c.width=Math.ceil(width*dpr);c.height=Math.ceil(height*dpr);}
  for(const c of [ctx,maskCtx,layerCtx,colorCtx])c.setTransform(dpr,0,0,dpr,0,0);
  maskCtx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  if('letterSpacing' in maskCtx)maskCtx.letterSpacing=style.letterSpacing;
  const baseline=pad+text.querySelector('.ink-baseline').offsetTop;
  maskCtx.fillStyle='#fff';maskCtx.fillText(text.textContent,pad,baseline);
  const gradient=colorCtx.createLinearGradient(0,0,width,height);gradient.addColorStop(0,'#ff008c');gradient.addColorStop(.45,'#ff008c');gradient.addColorStop(.55,'#c7ff00');gradient.addColorStop(1,'#c7ff00');colorCtx.fillStyle=gradient;colorCtx.fillRect(0,0,width,height);
  colorCtx.strokeStyle='#ffffff55';colorCtx.lineWidth=Math.max(2,fontSize*.018);colorCtx.beginPath();colorCtx.moveTo(0,height*.9);colorCtx.bezierCurveTo(width*.28,-height*.25,width*.64,height*1.3,width,height*.15);colorCtx.stroke();
  points=[];last=null;ctx.clearRect(0,0,width,height);bounds=null;
 }
 function paint(time){
  frame=0;if(disposed||media.matches||!visible)return;
  ctx.clearRect(0,0,width,height);layerCtx.clearRect(0,0,width,height);points=points.filter(p=>time-p.time<1050);
  for(const p of points){
   const age=(time-p.time)/1050,life=Math.max(0,1-age),radius=p.radius*(.8+age*.25);
   layerCtx.globalAlpha=Math.min(1,life*2.5);layerCtx.fillStyle='#fff';layerCtx.beginPath();layerCtx.ellipse(p.x,p.y,radius,radius*(.66+Math.sin(p.phase)*.14),p.angle+age*.4,0,Math.PI*2);layerCtx.fill();
   // Small ink bleeds beyond the text silhouette, then settles away.
   if(p.bleed){ctx.globalAlpha=life*.9;ctx.fillStyle='#101010';ctx.beginPath();ctx.ellipse(p.x,p.y+fontSize*.12*age,radius*.24,radius*(.14+age*.15),p.angle,0,Math.PI*2);ctx.fill();}
  }
  layerCtx.globalAlpha=1;layerCtx.globalCompositeOperation='source-in';layerCtx.drawImage(color,0,0,width,height);layerCtx.globalCompositeOperation='destination-in';layerCtx.drawImage(mask,0,0,width,height);layerCtx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.drawImage(layer,0,0,width,height);
  if(points.length)frame=requestAnimationFrame(paint);
 }
 function pointer(e){
  if(media.matches||!visible||(!fine.matches&&e.type==='pointermove'&&e.buttons===0))return;
  if(!bounds)bounds=word.getBoundingClientRect();
  const x=e.clientX-bounds.left+pad,y=e.clientY-bounds.top+pad,time=performance.now(),dx=last?x-last.x:0,dy=last?y-last.y:0,distance=Math.hypot(dx,dy),steps=Math.min(8,Math.max(1,Math.ceil(distance/18)));
  for(let i=1;i<=steps;i++){const t=i/steps;points.push({x:last?last.x+dx*t:x,y:last?last.y+dy*t:y,time,radius:fontSize*(.30+Math.min(distance,80)*.0018),angle:Math.atan2(dy,dx),phase:time*.012+i,bleed:i===steps&&y>pad+fontSize*.58});}
  if(points.length>100)points=points.slice(-100);last={x,y};if(!frame)frame=requestAnimationFrame(paint);
 }
 word.addEventListener('pointerenter',()=>{bounds=word.getBoundingClientRect();last=null;},{signal});
 word.addEventListener('pointermove',pointer,{passive:true,signal});word.addEventListener('pointerdown',pointer,{passive:true,signal});word.addEventListener('pointerleave',()=>{last=null;bounds=null;},{signal});
 window.addEventListener('scroll',()=>{bounds=null;last=null;},{passive:true,signal});
 const observer=new ResizeObserver(resize);observer.observe(word);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){points=[];cancelAnimationFrame(frame);frame=0;ctx.clearRect(0,0,width,height);}});intersection.observe(word);
 media.addEventListener('change',resize,{signal});document.fonts.ready.then(resize);resize();
 const cleanup=()=>{disposed=true;controller.abort();observer.disconnect();intersection.disconnect();cancelAnimationFrame(frame);};
 window.addEventListener('pagehide',cleanup,{once:true,signal});return cleanup;
}
