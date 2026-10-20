import {validateCatalog,restoreCart,addItem,setQuantity,cartSummary,money,assetURL} from './commerce.js';
import {createCatalog} from './catalog.js';
import {renderRooms} from './room.js';
import {el,icon,image,button} from './dom.js';
import {initMotion,feedback} from './motion.js';
import {initInk} from './ink.js';
const $=s=>document.querySelector(s);
let data={version:1,products:[],categories:[],rooms:[]},settings={},lines=[],catalog,productReturnHash='#catalog',toastTimer;
const cleanupMotion=initMotion();
const cleanupInk=initInk();
function toast(message){clearTimeout(toastTimer);$('.toast').textContent=message;$('.toast').classList.add('visible');toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),3300);}
function showDialog(dialog){if(!dialog.open){dialog.classList.remove('closing');dialog.showModal();}if(dialog=== $('.menu-dialog'))$('.menu-open').setAttribute('aria-expanded','true');}
function closeDialog(dialog,{route=true,instant=false}={}){
 if(!dialog.open||dialog.classList.contains('closing'))return;
 const done=()=>{dialog.classList.remove('closing');dialog.close();if(dialog===$('.menu-dialog'))$('.menu-open').setAttribute('aria-expanded','false');if(dialog===$('.product-dialog')&&route&&location.hash.startsWith('#product/'))history.replaceState(null,'',productReturnHash);};
 if(instant||matchMedia('(prefers-reduced-motion: reduce)').matches)done();else{dialog.classList.add('closing');setTimeout(done,220);}
}
for(const dialog of document.querySelectorAll('dialog')){
 dialog.querySelector('.close-dialog')?.addEventListener('click',()=>closeDialog(dialog));
 dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog(dialog);});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog);});
}
$('.menu-open').setAttribute('aria-expanded','false');$('.menu-open').addEventListener('click',()=>{showDialog($('.menu-dialog'));});
$('.menu-dialog nav').addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();const href=a.getAttribute('href');closeDialog($('.menu-dialog'),{instant:true});location.hash=href;requestAnimationFrame(()=>$(href)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));});
$('.cart-open').addEventListener('click',()=>{renderCart();showDialog($('.cart-dialog'));});
function openSearch(){location.hash='#catalog';$('.search-field').hidden=false;requestAnimationFrame(()=>{$('#catalog-search').focus({preventScroll:true});$('#catalog').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});}
$('.search-open').addEventListener('click',openSearch);
function save(){try{localStorage.setItem('dopamine-cart-v1',JSON.stringify({version:1,lines}));}catch{toast('Корзина сохранена на время этой сессии.');}renderCart();}
function add(product,variant,source){try{lines=addItem(lines,data.products,product.id,variant.id);save();feedback(source);document.querySelectorAll('.cart-count').forEach(feedback);toast(`${product.title} — в твоей корзине`);}catch(error){toast(error.message);}}
function updateQuantity(line,quantity){try{lines=setQuantity(lines,data.products,line.productId,line.variantId,quantity);save();}catch(error){toast(error.message);}}
function renderCart(){
 const focusLabel=$('.cart-dialog').open&&$('.cart-body').contains(document.activeElement)?document.activeElement.getAttribute('aria-label'):null;
 const summary=cartSummary(lines,data.products);document.querySelectorAll('.cart-count').forEach(n=>n.textContent=summary.count);$('.cart-open').setAttribute('aria-label',`Открыть корзину, товаров: ${summary.count}`);const body=$('.cart-body');body.replaceChildren();$('.cart-summary').hidden=summary.count===0;
 if(!summary.items.length){const empty=el('div','cart-empty');const link=el('a','button button-dark');link.href='#catalog';link.append(el('span','','НАЙТИ СВОЙ ДОФАМИН'),icon('arrow'));link.addEventListener('click',()=>closeDialog($('.cart-dialog'),{instant:true}));empty.append(icon('smile'),el('h3','','Здесь скоро будет радость.'),el('p','','Добавляй вещи с характером — пусть дома станет чуть больше тебя.'),link);body.append(empty);if(focusLabel)$('.cart-dialog .close-dialog').focus();return;}
 for(const line of summary.items){const row=el('article','cart-line');row.append(image(line.product.images[0]));const copy=el('div');copy.append(el('h3','',line.product.title),el('p','',line.variant.label));const info=el('div','cart-line-info'),qty=el('div','quantity'),minus=button('−'),plus=button('+');minus.setAttribute('aria-label',`Уменьшить количество ${line.product.title}`);plus.setAttribute('aria-label',`Увеличить количество ${line.product.title}`);plus.disabled=line.quantity>=line.variant.stock;minus.addEventListener('click',()=>updateQuantity(line,line.quantity-1));plus.addEventListener('click',()=>updateQuantity(line,line.quantity+1));qty.append(minus,el('span','',line.quantity),plus);info.append(qty,el('strong','price',money(line.total)));const remove=button('Убрать','remove-line');remove.setAttribute('aria-label',`Убрать ${line.product.title}`);remove.addEventListener('click',()=>updateQuantity(line,0));copy.append(info,remove);row.append(copy);body.append(row);}
 $('.cart-total').textContent=money(summary.total);$('.checkout-status').textContent=settings.checkoutEndpoint?'':'Оформление заказов пока не открыто.';$('.checkout-button').disabled=!settings.checkoutEndpoint;
 if(focusLabel){const next=[...body.querySelectorAll('button[aria-label]')].find(n=>n.getAttribute('aria-label')===focusLabel&&!n.disabled);(next||$('.cart-dialog .close-dialog')).focus();}
}
async function route(){
 if(!catalog)return;const hash=location.hash;
 if(hash.startsWith('#product/')){let slug;try{slug=decodeURIComponent(hash.slice(9));}catch{slug='';}const product=data.products.find(p=>p.slug===slug);if(!product){toast('Этот товар пока недоступен.');history.replaceState(null,'','#catalog');closeDialog($('.product-dialog'),{route:false,instant:true});return;}
  const reveal=()=>{catalog.renderProduct(product);showDialog($('.product-dialog'));$('.product-dialog').scrollTop=0;};
  if(document.startViewTransition&&!$('.product-dialog').open&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.startViewTransition(reveal);else reveal();document.title=`${product.title} — Dopamine`;
 }else{productReturnHash=hash||'#catalog';closeDialog($('.product-dialog'),{route:false,instant:true});document.title='Dopamine — дом, в котором живет дофамин';}
}
window.addEventListener('hashchange',route);
function openProduct(product){if(!location.hash.startsWith('#product/'))productReturnHash=location.hash||'#catalog';if(location.hash===`#product/${product.slug}`)route();else location.hash=`#product/${product.slug}`;}
function zoom(im){$('.zoom-dialog img').src=im.src;$('.zoom-dialog img').alt=im.alt;showDialog($('.zoom-dialog'));}
const moods={lime:['ACID LIME / #C7FF00','Кислотный лайм'],pink:['ELECTRIC PINK / #FF008C','Электрический розовый'],white:['PURE WHITE / #FFFFFF','Чистый белый']};
function setMood(mood){$('.color-stage').dataset.mood=mood;$('.mood-name').textContent=moods[mood][0];$('.mood-announcement').textContent=`Настроение: ${moods[mood][1]}`;document.querySelectorAll('.swatch').forEach(b=>{const active=b.dataset.mood===mood;b.setAttribute('aria-pressed',String(active));b.classList.toggle('active',active);});if(!matchMedia('(prefers-reduced-motion: reduce)').matches)window.gsap?.fromTo('.color-object',{rotation:-18,scale:.93},{rotation:-10,scale:1,duration:.8,ease:'elastic.out(1,.65)',overwrite:true});}
document.querySelectorAll('.swatch').forEach(b=>b.addEventListener('click',()=>setMood(b.dataset.mood)));
let stickerState=0;$('.mood-sticker').addEventListener('click',()=>{stickerState++;feedback($('.mood-sticker'));const sculpture=$('.brand-sculpture');sculpture.style.borderRadius=stickerState%2?'38% 62% 61% 39% / 47% 38% 62% 53%':'';if(!matchMedia('(prefers-reduced-motion: reduce)').matches)window.gsap?.to(sculpture,{rotation:stickerState%2?6:-9,duration:.9,ease:'back.out(1.4)'});toast(stickerState%2?'Радость принимает разные формы.':'Больше цвета. Больше тебя.');});
for(const details of document.querySelectorAll('.faq details')){const summary=details.querySelector('summary'),content=details.querySelector('div');summary.addEventListener('click',e=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||!window.gsap)return;e.preventDefault();if(details.dataset.animating)return;details.dataset.animating='true';const finish=()=>{content.style.height='';delete details.dataset.animating;window.ScrollTrigger?.refresh();};if(details.open){window.gsap.to(content,{height:0,duration:.3,ease:'power2.inOut',onComplete:()=>{details.open=false;finish();}});}else{details.open=true;window.gsap.fromTo(content,{height:0},{height:content.scrollHeight,duration:.4,ease:'power3.out',onComplete:finish});}});}
$('.checkout-button').addEventListener('click',async()=>{
 if(!settings.checkoutEndpoint)return;const btn=$('.checkout-button'),status=$('.checkout-status');btn.disabled=true;status.textContent='Проверяем наличие и готовим оформление…';
 try{const endpoint=new URL(settings.checkoutEndpoint,location.origin);if(endpoint.origin!==location.origin&&endpoint.protocol!=='https:')throw new Error('Оформление временно недоступно.');const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currency:'RUB',lines:restoreCart({version:1,lines},data.products)}),signal:AbortSignal.timeout(15000)});if(!res.ok)throw new Error('Не удалось оформить заказ. Проверьте наличие товаров и попробуйте ещё раз.');const result=await res.json();if(typeof result.checkoutUrl!=='string'||!result.checkoutUrl.startsWith('https://'))throw new Error('Сервис оформления вернул некорректную ссылку.');const url=new URL(result.checkoutUrl);if(url.protocol!=='https:'||url.username||url.password)throw new Error('Сервис оформления вернул некорректную ссылку.');location.assign(url.href);
 }catch(error){status.textContent=error.name==='TimeoutError'?'Сервис не ответил вовремя. Попробуй ещё раз.':error.message;btn.disabled=false;}
});
window.addEventListener('storage',e=>{if(e.key==='dopamine-cart-v1'){lines=restoreCart(e.newValue,data.products);renderCart();}});
$('#year').textContent=new Date().getFullYear();
try{
 const [catalogRes,settingsRes]=await Promise.all([fetch('/data/catalog.json'),fetch('/data/settings.json')]);
 if(!catalogRes.ok||!settingsRes.ok)throw new Error('Данные магазина сейчас недоступны.');
 data=validateCatalog(await catalogRes.json());settings=await settingsRes.json();
 if(settings.currency!=='RUB')throw new Error('Для этого каталога необходима валюта RUB.');
 if(settings.checkoutEndpoint&&!assetURL(settings.checkoutEndpoint))throw new Error('Некорректный адрес оформления заказа.');
 let stored;try{stored=localStorage.getItem('dopamine-cart-v1');}catch{}lines=restoreCart(stored,data.products);
 catalog=createCatalog(data,{onAdd:add,onProduct:openProduct,onZoom:zoom,onRendered:()=>requestAnimationFrame(()=>window.ScrollTrigger?.refresh())});renderRooms(data);renderCart();
 for(const c of settings.contacts||[]){const url=assetURL(c.url);if(!url||typeof c.label!=='string')continue;const a=el('a','',c.label);a.href=url;a.rel='noopener noreferrer';$('.contact-links').append(a);}
 if(settings.deliveryText)$('#delivery-help').textContent=settings.deliveryText;
 if(settings.returnsText)$('#delivery-help').append(document.createTextNode(` ${settings.returnsText}`));
 if(data.products.length)$('#order-help').textContent='Открой карточку, выбери доступный вариант и добавь его в корзину. Итоговая стоимость и условия доставки подтверждаются при оформлении заказа.';
 await route();if(data.products.length)window.dispatchEvent(new Event('dopamine:catalog-ready'));
}catch(error){$('.product-grid').replaceChildren();$('.product-grid').hidden=true;$('.product-grid').setAttribute('aria-busy','false');$('.catalog-empty').hidden=false;$('.empty-copy h3').textContent='Небольшая пауза.';$('.empty-copy p').textContent='Каталог сейчас недоступен. Обнови страницу чуть позже.';console.error('Dopamine catalog:',error.message);renderCart();}
