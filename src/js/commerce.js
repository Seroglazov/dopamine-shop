const fail=message=>{throw new Error(message);};
export function assetURL(value){
 if(typeof value!=='string'||!value.trim()||value!==value.trim()||/[\u0000-\u001f\u007f]/.test(value))return null;
 if(value.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\'))return value;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}
}
export function validateCatalog(data){
 if(data?.version!==1||!Array.isArray(data.categories)||!Array.isArray(data.products)||!Array.isArray(data.rooms))fail('Catalog must have version 1, categories, products and rooms arrays.');
 const ids=new Set(),slugs=new Set(),categories=new Set();
 for(const c of data.categories){if(!c?.id||typeof c.id!=='string'||!c.title||typeof c.title!=='string'||categories.has(c.id))fail('Invalid or duplicate category');categories.add(c.id);}
 for(const c of data.categories){
  const seen=new Set([c.id]);let current=c;
  while(current.parentId!==undefined){if(typeof current.parentId!=='string'||!categories.has(current.parentId)||seen.has(current.parentId))fail('Invalid category hierarchy');seen.add(current.parentId);current=data.categories.find(item=>item.id===current.parentId);}
 }
 for(const p of data.products){
  if(!p?.id||typeof p.id!=='string'||ids.has(p.id)||!p.slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||slugs.has(p.slug)||typeof p.title!=='string'||!p.title.trim())fail('Invalid or duplicate product');
  ids.add(p.id);slugs.add(p.slug);
  if(!categories.has(p.categoryId))fail(`Unknown category for ${p.id}`);
  if(!Array.isArray(p.images)||!p.images.length||p.images.some(i=>!assetURL(i.src)||typeof i.alt!=='string'||!i.alt.trim()||!Number.isInteger(i.width)||i.width<1||!Number.isInteger(i.height)||i.height<1))fail(`Invalid images for ${p.id}`);
  if(typeof p.description!=='string')fail(`Missing description for ${p.id}`);
  if(p.specifications!==undefined&&(!p.specifications||Array.isArray(p.specifications)||typeof p.specifications!=='object'||Object.entries(p.specifications).some(([key,value])=>!key.trim()||typeof value!=='string'||!value.trim())))fail(`Invalid specifications for ${p.id}`);
  if(p.isNew!==undefined&&typeof p.isNew!=='boolean')fail(`Invalid new flag for ${p.id}`);
  if(p.status!==undefined&&!['active','preview'].includes(p.status))fail(`Invalid status for ${p.id}`);
  if(p.visualization!==undefined&&typeof p.visualization!=='boolean')fail(`Invalid visualization flag for ${p.id}`);
  if(p.photoSource!==undefined&&(!p.photoSource||typeof p.photoSource.name!=='string'||!p.photoSource.name.trim()||(p.photoSource.url!==undefined&&(typeof p.photoSource.url!=='string'||!p.photoSource.url.startsWith('https://')||!assetURL(p.photoSource.url)))||p.visualization===true))fail(`Invalid photo source for ${p.id}`);
  const variants=new Set();
  if(!Array.isArray(p.variants)||!p.variants.length)fail(`Missing variants for ${p.id}`);
  for(const v of p.variants){const validPrice=p.status==='preview'?v.price===null&&v.stock===0&&v.compareAtPrice===undefined:Number.isSafeInteger(v.price)&&v.price>=0;if(typeof v.id!=='string'||!v.id||variants.has(v.id)||typeof v.label!=='string'||!v.label.trim()||!validPrice||!Number.isSafeInteger(v.stock)||v.stock<0)fail(`Invalid variant for ${p.id}`);if(v.color!==undefined&&(typeof v.color!=='string'||!/^#[0-9a-f]{6}$/i.test(v.color)))fail(`Invalid variant color for ${p.id}`);if(v.imageSrc!==undefined&&(!assetURL(v.imageSrc)||!p.images.some(image=>image.src===v.imageSrc)))fail(`Invalid variant image for ${p.id}`);variants.add(v.id);}
  if(p.rating!==undefined&&(!Number.isFinite(p.rating)||p.rating<0||p.rating>5))fail(`Invalid rating for ${p.id}`);
  if(p.reviewCount!==undefined&&(!Number.isSafeInteger(p.reviewCount)||p.reviewCount<0))fail(`Invalid review count for ${p.id}`);
  if(p.brand!==undefined&&(typeof p.brand!=='string'||!p.brand.trim()))fail(`Invalid brand for ${p.id}`);
  if(p.deliveryLabel!==undefined&&(typeof p.deliveryLabel!=='string'||!p.deliveryLabel.trim()))fail(`Invalid delivery label for ${p.id}`);
  for(const v of p.variants)if(v.compareAtPrice!==undefined&&(!Number.isSafeInteger(v.compareAtPrice)||v.compareAtPrice<=v.price))fail(`Invalid previous price for ${p.id}`);
 }
 for(const r of data.rooms){
  if(typeof r.id!=='string'||!r.id||typeof r.title!=='string'||!r.title||!assetURL(r.image?.src)||typeof r.image.alt!=='string'||!r.image.alt||!Number.isInteger(r.image.width)||r.image.width<1||!Number.isInteger(r.image.height)||r.image.height<1||!Array.isArray(r.markers))fail('Invalid room');
  for(const m of r.markers)if(!ids.has(m.productId)||!Number.isFinite(m.x)||!Number.isFinite(m.y)||m.x<0||m.x>100||m.y<0||m.y>100)fail('Invalid room marker');
 }
 return data;
}
export function startingVariant(product){const available=product.variants.filter(v=>v.stock>0&&v.price!==null);return [...(available.length?available:product.variants)].sort((a,b)=>(a.price??Infinity)-(b.price??Infinity))[0];}
export function parsePriceInput(value){const input=String(value??'').replace(/\s/g,'');if(!input)return null;if(!/^\d+(?:[.,]\d{0,2})?$/.test(input))throw new Error('Укажи цену в рублях: например, 1500 или 1500,50.');const [whole,fraction='']=input.split(/[.,]/);const amount=Number(whole)*100+Number(fraction.padEnd(2,'0'));if(!Number.isSafeInteger(amount))throw new Error('Слишком большая цена.');return amount;}
export function filterProducts(products,{category='all',query='',sort='featured',minPrice=null,maxPrice=null,inStock=false,favoritesOnly=false,favoriteIds=new Set()}={}){
 const q=query.trim().toLocaleLowerCase('ru-RU');
 const price=p=>startingVariant(p).price;
 const result=products.filter(p=>(category==='all'||p.categoryId===category)&&(!q||`${p.title} ${p.description} ${p.brand||''}`.toLocaleLowerCase('ru-RU').includes(q))&&(minPrice===null||(price(p)!==null&&price(p)>=minPrice))&&(maxPrice===null||(price(p)!==null&&price(p)<=maxPrice))&&(!inStock||(p.status!=='preview'&&p.variants.some(v=>v.stock>0&&v.price!==null)))&&(!favoritesOnly||favoriteIds.has(p.id)));
 if(sort==='price-asc'||sort==='price-desc')result.sort((a,b)=>price(a)===null?price(b)===null?0:1:price(b)===null?-1:sort==='price-asc'?price(a)-price(b):price(b)-price(a));
 else if(sort==='name')result.sort((a,b)=>a.title.localeCompare(b.title,'ru'));
 else result.sort((a,b)=>Number(!!b.featured)-Number(!!a.featured));
 return result;
}
export function restoreCart(raw,products){
 let data;try{data=typeof raw==='string'?JSON.parse(raw):raw;}catch{return [];}
 if(data?.version!==1||!Array.isArray(data.lines))return [];
 const lines=[];
 for(const line of data.lines){
  if(!line||typeof line!=='object')continue;
  const p=products.find(p=>p.id===line.productId),v=p?.variants.find(v=>v.id===line.variantId);
  if(!v||p.status==='preview'||v.price===null||!Number.isSafeInteger(line.quantity)||line.quantity<1||v.stock<1)continue;
  const existing=lines.find(l=>l.productId===p.id&&l.variantId===v.id);
  if(existing)existing.quantity=Math.min(existing.quantity+line.quantity,v.stock);
  else lines.push({productId:p.id,variantId:v.id,quantity:Math.min(line.quantity,v.stock)});
 }
 return lines;
}
export function setQuantity(lines,products,productId,variantId,quantity){
 if(!Number.isSafeInteger(quantity)||quantity<0)fail('Количество должно быть целым положительным числом.');
 const p=products.find(p=>p.id===productId),v=p?.variants.find(v=>v.id===variantId);
 if(!v)fail('Этот вариант больше недоступен.');
 if(quantity>0&&(p.status==='preview'||v.price===null))fail('Товар готовится к запуску. Покупка пока недоступна.');
 if(quantity>v.stock)fail(`В наличии: ${v.stock} шт.`);
 const next=lines.filter(l=>l.productId!==productId||l.variantId!==variantId).map(l=>({...l}));
 if(quantity>0)next.push({productId,variantId,quantity});
 return next;
}
export function addItem(lines,products,productId,variantId,quantity=1){
 if(!Number.isSafeInteger(quantity)||quantity<1)fail('Количество должно быть целым положительным числом.');
 const old=lines.find(l=>l.productId===productId&&l.variantId===variantId)?.quantity||0;
 return setQuantity(lines,products,productId,variantId,old+quantity);
}
export function cartSummary(lines,products){
 const valid=restoreCart({version:1,lines},products);
 const items=valid.map(l=>{const product=products.find(p=>p.id===l.productId);const variant=product.variants.find(v=>v.id===l.variantId);return {...l,product,variant,total:variant.price*l.quantity};});
 const total=items.reduce((sum,l)=>sum+l.total,0);
 if(!Number.isSafeInteger(total))fail('Сумма заказа слишком велика.');
 return {items,total,count:items.reduce((sum,l)=>sum+l.quantity,0)};
}
export function money(amount){if(amount===null)return 'Цена уточняется';return new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:amount%100?2:0}).format(amount/100);}
