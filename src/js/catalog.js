import {filterProducts,money,startingVariant,parsePriceInput} from './commerce.js';
import {el,icon,image,button} from './dom.js';
export function createCatalog(data,{onAdd,onProduct,onZoom,onRendered}){
 let favoriteIds=new Set();try{const saved=JSON.parse(localStorage.getItem('dopamine-favorites-v1')||'[]');if(Array.isArray(saved))favoriteIds=new Set(saved.filter(id=>data.products.some(p=>p.id===id)));}catch{}
 const state={category:'all',query:'',sort:'featured',minPrice:null,maxPrice:null,inStock:false,favoritesOnly:false,favoriteIds};
 const grid=document.querySelector('.product-grid');
 const categoryName=id=>data.categories.find(c=>c.id===id)?.title||'';
 function productCard(p){
  const card=el('article','product-card');card.dataset.productId=p.id;const media=el('div','product-media');const link=el('a','product-image');link.href=`#product/${p.slug}`;link.dataset.cursor='СМОТРЕТЬ';link.setAttribute('aria-label',`Смотреть ${p.title}`);link.style.setProperty('--product-transition',`product-${p.slug}`);link.append(image(p.images[0]));
  if(p.images[1]){const second=image(p.images[1]);second.className='second-image';second.alt='';link.append(second);}
  const favorite=button('','favorite-button');favorite.dataset.favoriteId=p.id;favorite.append(icon('heart'));favorite.setAttribute('aria-pressed',String(favoriteIds.has(p.id)));favorite.setAttribute('aria-label',`${favoriteIds.has(p.id)?'Убрать':'Добавить'} ${p.title} ${favoriteIds.has(p.id)?'из избранного':'в избранное'}`);
  favorite.addEventListener('click',()=>{const hadFocus=document.activeElement===favorite;if(favoriteIds.has(p.id))favoriteIds.delete(p.id);else favoriteIds.add(p.id);try{localStorage.setItem('dopamine-favorites-v1',JSON.stringify([...favoriteIds]));}catch{}render();for(const b of document.querySelectorAll('.favorite-button')){const selected=favoriteIds.has(b.dataset.favoriteId),product=data.products.find(item=>item.id===b.dataset.favoriteId);b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',`${selected?'Убрать':'Добавить'} ${product.title} ${selected?'из избранного':'в избранное'}`);}if(hadFocus){const next=favorite.isConnected?favorite:[...grid.querySelectorAll('.favorite-button')].find(b=>b.dataset.favoriteId===p.id);(next||document.querySelector('#favorites-only')).focus();}});
  media.append(link,favorite);if(p.featured)media.append(el('span','card-badge','Выбор Dopamine'));
  const pages=el('div','image-pages');pages.setAttribute('aria-hidden','true');if(p.images.length>1)p.images.slice(0,5).forEach(()=>pages.append(el('i')));media.append(pages);
  const info=el('div','product-info'),title=el('h3'),titleLink=el('a','',p.title);titleLink.href=link.href;title.append(titleLink);
  const variant=startingVariant(p),prices=el('div','card-price-row');prices.append(el('span','price',`${new Set(p.variants.filter(v=>v.stock>0).map(v=>v.price)).size>1?'от ':''}${money(variant.price)}`));
  if(variant.compareAtPrice){prices.append(el('span','card-old-price',money(variant.compareAtPrice)));const discount=Math.round((1-variant.price/variant.compareAtPrice)*100);if(discount>0)prices.append(el('span','card-discount',`−${discount}%`));}
  info.append(prices,el('p','card-brand',p.brand||categoryName(p.categoryId)),title);
  if(p.rating!==undefined){const rating=el('div','card-rating');rating.append(el('span','rating-star','★'),el('span','',p.rating.toLocaleString('ru-RU',{maximumFractionDigits:1})));if(p.reviewCount!==undefined)rating.append(el('span','review-count',`· оценок: ${p.reviewCount}`));info.append(rating);}
  const available=p.variants.some(v=>v.stock>0);info.append(el('p',`card-stock${available?'':' unavailable'}`,available?'В наличии':'Нет в наличии'));const buy=button('','quick-add');buy.append(icon('bag'),document.createTextNode(available?(p.variants.length>1?'Выбрать вариант':'В корзину'):'Нет в наличии'));buy.disabled=!available;
  buy.addEventListener('click',()=>{if(p.variants.length>1)onProduct(p);else onAdd(p,p.variants[0],buy);});
  const delivery=el('p','card-delivery',p.deliveryLabel||'');if(!p.deliveryLabel)delivery.setAttribute('aria-hidden','true');card.append(media,info,buy,delivery);return card;
 }
 function render(){
  const products=filterProducts(data.products,state);grid.replaceChildren(...products.map(productCard));grid.setAttribute('aria-busy','false');
  document.querySelector('.catalog-empty').hidden=data.products.length!==0;
  document.querySelector('.no-results').hidden=!data.products.length||!!products.length;
  grid.hidden=!products.length;
  document.querySelector('.results-status').textContent=`Найдено товаров: ${products.length}`;
  document.querySelector('.favorites-total').textContent=favoriteIds.size;
  const count=Number(state.category!=='all')+Number(state.minPrice!==null||state.maxPrice!==null)+Number(state.inStock)+Number(state.favoritesOnly);
  document.querySelector('.filter-applied-count').textContent=count;document.querySelector('.filter-applied-count').hidden=count===0;
  document.querySelector('.active-filters-summary').textContent=state.favoritesOnly?'Твоё избранное':count?`Фильтров: ${count}`:'';
  document.querySelectorAll('[data-category]').forEach(b=>{const active=b.dataset.category===state.category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});onRendered?.();
 }
 const filters=document.querySelector('.category-filters');
 for(const c of data.categories){const b=button('','filter');b.append(document.createTextNode(c.title),el('span','',data.products.filter(p=>p.categoryId===c.id).length));b.dataset.category=c.id;b.setAttribute('aria-pressed','false');filters.append(b);}
 filters.addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;state.category=b.dataset.category;render();});
 document.querySelector('.product-total').textContent=data.products.length;
 document.querySelector('#catalog-search').addEventListener('input',e=>{state.query=e.target.value;render();});
 document.querySelector('#sort').addEventListener('change',e=>{state.sort=e.target.value;render();});
 document.querySelector('.search-clear').addEventListener('click',()=>{state.query='';document.querySelector('#catalog-search').value='';render();document.querySelector('#catalog-search').focus();});
 for(const reset of document.querySelectorAll('.reset-filters'))reset.addEventListener('click',()=>{Object.assign(state,{category:'all',query:'',sort:'featured',minPrice:null,maxPrice:null,inStock:false,favoritesOnly:false});for(const id of ['catalog-search','price-min','price-max'])document.getElementById(id).value='';for(const id of ['in-stock','favorites-only'])document.getElementById(id).checked=false;document.querySelector('#sort').value='featured';document.querySelector('.filter-error').hidden=true;for(const id of ['price-min','price-max'])document.getElementById(id).removeAttribute('aria-invalid');render();});
 let priceTimer;
 function applyPrice(){const error=document.querySelector('.filter-error');try{const min=parsePriceInput(document.querySelector('#price-min').value),max=parsePriceInput(document.querySelector('#price-max').value);if(min!==null&&max!==null&&min>max)throw new Error('Цена «от» должна быть меньше цены «до».');Object.assign(state,{minPrice:min,maxPrice:max});error.hidden=true;for(const id of ['price-min','price-max'])document.getElementById(id).removeAttribute('aria-invalid');render();}catch(e){error.textContent=e.message;error.hidden=false;for(const id of ['price-min','price-max'])document.getElementById(id).setAttribute('aria-invalid','true');}}
 for(const id of ['price-min','price-max'])document.getElementById(id).addEventListener('input',()=>{clearTimeout(priceTimer);priceTimer=setTimeout(applyPrice,220);});
 document.querySelector('#in-stock').addEventListener('change',e=>{state.inStock=e.target.checked;render();});document.querySelector('#favorites-only').addEventListener('change',e=>{state.favoritesOnly=e.target.checked;render();});
 const toggle=document.querySelector('.mobile-filter-toggle');function toggleFilters(open){document.querySelector('.catalog').classList.toggle('filters-open',open);toggle.setAttribute('aria-expanded',String(open));if(open)document.querySelector('.close-catalog-filters').focus();else toggle.focus();}toggle.addEventListener('click',()=>toggleFilters(toggle.getAttribute('aria-expanded')!=='true'));document.querySelector('.close-catalog-filters').addEventListener('click',()=>toggleFilters(false));
 document.querySelector('.catalog-toolbar').addEventListener('submit',e=>{e.preventDefault();clearTimeout(priceTimer);applyPrice();});
 window.addEventListener('pagehide',()=>clearTimeout(priceTimer),{once:true});
 function renderProduct(p){
  const root=document.querySelector('.product-detail');root.replaceChildren();const layout=el('div','pdp-layout'),gallery=el('div','pdp-gallery'),main=button('','pdp-image-button'),mainImg=image(p.images[0],{lazy:false});mainImg.style.setProperty('--product-transition',`product-${p.slug}`);main.append(mainImg);main.setAttribute('aria-label',`Увеличить изображение ${p.title}`);let selectedImage=p.images[0];main.addEventListener('click',()=>onZoom(selectedImage));gallery.append(main);
  if(p.images.length>1){const thumbs=el('div','pdp-thumbnails');p.images.forEach((im,i)=>{const b=button('');b.append(image(im));b.setAttribute('aria-label',`Фото ${i+1}: ${im.alt}`);b.setAttribute('aria-pressed',String(i===0));b.addEventListener('click',()=>{selectedImage=im;mainImg.src=im.src;mainImg.alt=im.alt;mainImg.width=im.width;mainImg.height=im.height;thumbs.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));});thumbs.append(b);});gallery.append(thumbs);}
  const info=el('div','pdp-info'),title=el('h2','',p.title);title.id='product-title';const price=el('div','pdp-price'),stock=el('p','stock-status'),description=el('p','pdp-description',p.description);let selected=startingVariant(p);const buy=button('','button button-dark pdp-add');
  const update=()=>{price.textContent=money(selected.price);stock.textContent=selected.stock>0?'В наличии':'Нет в наличии';buy.textContent=selected.stock>0?'ДОБАВИТЬ В КОРЗИНУ +':'НЕТ В НАЛИЧИИ';buy.disabled=selected.stock<1;};
  info.append(el('span','eyebrow',categoryName(p.categoryId)),title,price,stock);
  if(p.variants.length>1){const variants=el('fieldset','variant-options');variants.append(el('legend','','Выбери свой вариант'));for(const v of p.variants){const label=el('label'),radio=el('input');radio.type='radio';radio.name='variant';radio.value=v.id;radio.checked=v.id===selected.id;radio.disabled=v.stock===0;radio.addEventListener('change',()=>{selected=v;update();});label.append(radio,document.createTextNode(v.label));variants.append(label);}info.append(variants);}
  buy.addEventListener('click',()=>onAdd(p,selected,buy));info.append(buy,description);layout.append(gallery,info);root.append(layout);update();
  const related=data.products.filter(other=>other.id!==p.id&&other.categoryId===p.categoryId).slice(0,3);if(related.length){const section=el('section','pdp-related'),relatedGrid=el('div','product-grid');relatedGrid.append(...related.map(productCard));section.append(el('h3','','Больше хорошего рядом.'),relatedGrid);root.append(section);}onRendered?.();
 }
 const featured=data.products.filter(p=>p.featured).slice(0,5);if(featured.length){document.querySelector('.featured-section').hidden=false;const track=document.querySelector('.featured-track');for(const p of featured){const article=el('article','featured-item'),info=el('div'),link=el('a','button button-dark');link.href=`#product/${p.slug}`;link.append(el('span','','СМОТРЕТЬ ТОВАР'),icon('arrow'));info.append(el('span','eyebrow',categoryName(p.categoryId)),el('h3','',p.title),el('p','',p.description),el('span','price',money(Math.min(...p.variants.map(v=>v.price)))),link);article.append(image(p.images[0]),info);track.append(article);}}
 render();return{renderProduct};
}
