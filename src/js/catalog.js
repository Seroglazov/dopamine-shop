import {filterProducts,money} from './commerce.js';
import {el,icon,image,button} from './dom.js';
export function createCatalog(data,{onAdd,onProduct,onZoom,onRendered}){
 const state={category:'all',query:'',sort:'featured'};
 const grid=document.querySelector('.product-grid');
 const categoryName=id=>data.categories.find(c=>c.id===id)?.title||'';
 function productCard(p){
  const card=el('article','product-card');const link=el('a','product-image');link.href=`#product/${p.slug}`;link.dataset.cursor='СМОТРЕТЬ';link.setAttribute('aria-label',`Смотреть ${p.title}`);link.style.setProperty('--product-transition',`product-${p.slug}`);link.append(image(p.images[0]));
  if(p.images[1]){const second=image(p.images[1]);second.className='second-image';second.alt='';link.append(second);}
  const info=el('div','product-info'),copy=el('div'),title=el('h3'),titleLink=el('a','',p.title);titleLink.href=link.href;title.append(titleLink);copy.append(title,el('p','',categoryName(p.categoryId)));
  const price=el('span','price',`${new Set(p.variants.map(v=>v.price)).size>1?'от ':''}${money(Math.min(...p.variants.map(v=>v.price)))}`);info.append(copy,price);
  const available=p.variants.some(v=>v.stock>0);const buy=button(available?(p.variants.length>1?'ВЫБРАТЬ ВАРИАНТ ↗':'В КОРЗИНУ +'):'НЕТ В НАЛИЧИИ','quick-add');buy.disabled=!available;
  buy.addEventListener('click',()=>{if(p.variants.length>1)onProduct(p);else onAdd(p,p.variants[0],buy);});
  card.append(link,info,buy);return card;
 }
 function render(){
  const products=filterProducts(data.products,state);grid.replaceChildren(...products.map(productCard));grid.setAttribute('aria-busy','false');
  document.querySelector('.catalog-empty').hidden=data.products.length!==0;
  document.querySelector('.no-results').hidden=!data.products.length||!!products.length;
  grid.hidden=!products.length;
  document.querySelector('.results-status').textContent=`Найдено товаров: ${products.length}`;
  document.querySelectorAll('[data-category]').forEach(b=>{const active=b.dataset.category===state.category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});onRendered?.();
 }
 const filters=document.querySelector('.category-filters');
 for(const c of data.categories){const b=button(c.title,'filter');b.dataset.category=c.id;b.setAttribute('aria-pressed','false');filters.append(b);}
 filters.addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;state.category=b.dataset.category;render();});
 document.querySelector('.product-total').textContent=data.products.length;
 document.querySelector('#catalog-search').addEventListener('input',e=>{state.query=e.target.value;render();});
 document.querySelector('#sort').addEventListener('change',e=>{state.sort=e.target.value;render();});
 document.querySelector('.search-clear').addEventListener('click',()=>{state.query='';document.querySelector('#catalog-search').value='';render();document.querySelector('#catalog-search').focus();});
 document.querySelector('.reset-filters').addEventListener('click',()=>{Object.assign(state,{category:'all',query:'',sort:'featured'});document.querySelector('#catalog-search').value='';document.querySelector('#sort').value='featured';render();});
 document.querySelector('.catalog-toolbar').addEventListener('submit',e=>e.preventDefault());
 function renderProduct(p){
  const root=document.querySelector('.product-detail');root.replaceChildren();const layout=el('div','pdp-layout'),gallery=el('div','pdp-gallery'),main=button('','pdp-image-button'),mainImg=image(p.images[0],{lazy:false});mainImg.style.setProperty('--product-transition',`product-${p.slug}`);main.append(mainImg);main.setAttribute('aria-label',`Увеличить изображение ${p.title}`);let selectedImage=p.images[0];main.addEventListener('click',()=>onZoom(selectedImage));gallery.append(main);
  if(p.images.length>1){const thumbs=el('div','pdp-thumbnails');p.images.forEach((im,i)=>{const b=button('');b.append(image(im));b.setAttribute('aria-label',`Фото ${i+1}: ${im.alt}`);b.setAttribute('aria-pressed',String(i===0));b.addEventListener('click',()=>{selectedImage=im;mainImg.src=im.src;mainImg.alt=im.alt;mainImg.width=im.width;mainImg.height=im.height;thumbs.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));});thumbs.append(b);});gallery.append(thumbs);}
  const info=el('div','pdp-info'),title=el('h2','',p.title);title.id='product-title';const price=el('div','pdp-price'),stock=el('p','stock-status'),description=el('p','pdp-description',p.description);let selected=p.variants.find(v=>v.stock>0)||p.variants[0];const buy=button('','button button-dark pdp-add');
  const update=()=>{price.textContent=money(selected.price);stock.textContent=selected.stock>0?'В наличии':'Нет в наличии';buy.textContent=selected.stock>0?'ДОБАВИТЬ В КОРЗИНУ +':'НЕТ В НАЛИЧИИ';buy.disabled=selected.stock<1;};
  info.append(el('span','eyebrow',categoryName(p.categoryId)),title,price,stock);
  if(p.variants.length>1){const variants=el('fieldset','variant-options');variants.append(el('legend','','Выбери свой вариант'));for(const v of p.variants){const label=el('label'),radio=el('input');radio.type='radio';radio.name='variant';radio.value=v.id;radio.checked=v.id===selected.id;radio.disabled=v.stock===0;radio.addEventListener('change',()=>{selected=v;update();});label.append(radio,document.createTextNode(v.label));variants.append(label);}info.append(variants);}
  buy.addEventListener('click',()=>onAdd(p,selected,buy));info.append(buy,description);layout.append(gallery,info);root.append(layout);update();
  const related=data.products.filter(other=>other.id!==p.id&&other.categoryId===p.categoryId).slice(0,3);if(related.length){const section=el('section','pdp-related'),relatedGrid=el('div','product-grid');relatedGrid.append(...related.map(productCard));section.append(el('h3','','Больше хорошего рядом.'),relatedGrid);root.append(section);}onRendered?.();
 }
 const featured=data.products.filter(p=>p.featured).slice(0,5);if(featured.length){document.querySelector('.featured-section').hidden=false;const track=document.querySelector('.featured-track');for(const p of featured){const article=el('article','featured-item'),info=el('div'),link=el('a','button button-dark');link.href=`#product/${p.slug}`;link.append(el('span','','СМОТРЕТЬ ТОВАР'),icon('arrow'));info.append(el('span','eyebrow',categoryName(p.categoryId)),el('h3','',p.title),el('p','',p.description),el('span','price',money(Math.min(...p.variants.map(v=>v.price)))),link);article.append(image(p.images[0]),info);track.append(article);}}
 render();return{renderProduct};
}
