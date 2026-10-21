/**
 * Import public OMI.HOME product facts and unmodified original gallery files.
 * Run from the repository: node scripts/import-omi.mjs
 * Products stay preview-only. Source prices are recorded in docs, never sale prices.
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const api = 'https://store.tildacdn.com/api/getproductslist/';
const parts = [
  ['944243919042', 'Каталог'], ['424726365162', 'Все на главной'],
  ['254180716062', 'Светильники'], ['780249736462', 'Подставки'],
  ['135549648583', 'Столы'],
];
const known = {
  '327611070563': {slug:'book-stand', category:'accessories', description:'PLA-подставка для книг, блокнотов, пластинок и тарелок. Размер — 29 × 12 × 14 см; расстояние между прутками — 3,8 см.', specs:{'Размер':'29 × 12 × 14 см (длина × высота × ширина)','Расстояние между прутками':'3,8 см','Максимальная ширина корешка':'3,5 см','Материал':'PLA-пластик','Тип':'Подставка для книг'}},
  '676931564813': {slug:'origami-lamp', category:'dopamine-light', description:'Оранжевая лампа со складчатым плафоном из PLA-пластика. Верхняя крышка снимается; провод длиной 1,5 м оснащён выключателем.', specs:{'Размер':'18 × 22,5 см','Материал':'Оранжевый PLA-пластик','Цоколь':'E27','Особенности':'Съёмная верхняя крышка; провод 1,5 м с выключателем','Тип':'Светильник'}},
  '272676363263': {slug:'nord-table', category:'accent-furniture-decor', description:'Кофейный стол из PLA высотой 48 см с круглой столешницей шириной 40 см. В исходном каталоге представлены красный и розовый варианты.', specs:{'Материал':'PLA-пластик','Высота':'48 см','Ширина столешницы':'40 см','Толщина столешницы':'3 см','Ширина основания':'26 см','Вес':'2 кг','Тип':'Журнальный стол'}},
  '755195558762': {slug:'marmella-lamp', category:'dopamine-light', description:'Компактная декоративная лампа из PLA-пластика размером 15 × 20 см. Использует цоколь E27 и провод с выключателем.', specs:{'Размер':'15 × 20 см','Материал':'PLA-пластик','Цоколь':'E27','Питание':'210–240 В','Провод':'1,5 м, с выключателем','Тип':'Светильник'}},
  '756908269623': {slug:'lumi-lamp', category:'dopamine-light', description:'Лампа с полупрозрачным плафоном и оранжевым фильтром для тёплого освещения. Корпус выполнен из PLA-пластика; размер — 18 × 17 см.', specs:{'Размер':'18 × 17 см','Материал':'PLA-пластик','Цоколь':'E27','Питание':'210–240 В','Провод':'1,5 м, с выключателем','Плафон':'Полупрозрачный, оранжевый фильтр','Тип':'Светильник'}},
  '782297616102': {slug:'amaris-lamp', category:'dopamine-light', description:'Лампа из PLA-пластика с матовым белым плафоном и розовым световым фильтром. Размер — 18 × 26 см, цоколь — GU5.3.', specs:{'Размер':'18 × 26 см','Материал':'PLA-пластик','Цоколь':'GU5.3','Питание':'210–240 В','Провод':'1,5 м, с выключателем','Плафон':'Матовый белый, розовый фильтр','Тип':'Светильник'}},
  '456535992892': {slug:'okearis-table', category:'accent-furniture-decor', description:'Модульный столик из PLA для напитков, декора или растений. Высоту можно менять за счёт составной конструкции; в каталоге есть розовый и жёлтый варианты.', specs:{'Материал':'PLA-пластик','Высота':'44 см','Ширина столешницы':'39 см','Ширина основания':'25 см','Ширина ножки':'18 см','Вес':'2 кг','Конструкция':'Модульная, с регулировкой высоты','Тип':'Кофейный столик'}},
  '197295234183': {slug:'muar-lamp', category:'dopamine-light', description:'Лампа ручной работы со стеклянной мозаикой и розовой затиркой. Основание из PLA-пластика, размер — 12 × 20 см.', specs:{'Размер':'12 × 20 см','Материал':'PLA-пластик, стеклянная мозаика','Отделка':'Розовая затирка','Изготовление':'Ручная работа','Цоколь':'E27','Питание':'210–240 В','Провод':'1,5 м, с выключателем','Тип':'Светильник'}},
  '195789283392': {slug:'aura-lamp', category:'dopamine-light', description:'Декоративный светильник из PLA-пластика с плавной формой. Размер — 16 × 18 см; предусмотрены цоколь E27 и провод с выключателем.', specs:{'Размер':'16 × 18 см','Материал':'PLA-пластик','Цоколь':'E27','Питание':'210–240 В','Провод':'1,5 м, с выключателем','Тип':'Светильник'}},
  '285277949962': {slug:'tablet-stand', category:'accessories', description:'Настольная подставка для планшета с округлым основанием. Изготовлена из PLA-пластика; размер — 18 × 25 см.', specs:{'Размер':'18 × 25 см','Материал':'PLA-пластик','Тип':'Подставка для планшета'}},
};
const colors = {'Красный':'#e81212','Розовый':'#f2afe1','Желтый':'#fff830','Зеленый':'#317a2e','Фиолетовый':'#ab96e0','Оранжевый':'#ff8500'};

async function fetchBytes(url) {
  for (let attempt=0; attempt<3; attempt++) {
    try {
      const response = await fetch(url, {signal:AbortSignal.timeout(45000)});
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return Buffer.from(await response.arrayBuffer());
    } catch(error) { if (attempt===2) throw error; }
  }
}
const fetchJSON = async url => JSON.parse((await fetchBytes(url)).toString('utf8'));
const originalURL = value => {
  const url = new URL(value);
  if (url.hostname !== 'static.tildacdn.com' || /\/-\//.test(url.pathname) || url.search) throw new Error(`Not an original gallery URL: ${value}`);
  return url.href;
};
function imageSize(b) {
  if (b.subarray(1,4).toString()==='PNG') return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
  if (b[0]===0xff && b[1]===0xd8) {
    let p=2;
    while(p < b.length) {
      if(b[p++]!==0xff) continue;
      while(b[p]===0xff) p++;
      const marker=b[p++];
      if(marker===0xd8 || marker===0xd9) continue;
      const size=b.readUInt16BE(p);
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) return {width:b.readUInt16BE(p+5),height:b.readUInt16BE(p+3)};
      p+=size;
    }
  }
  if (b.subarray(0,4).toString()==='RIFF' && b.subarray(8,12).toString()==='WEBP') {
    const type=b.subarray(12,16).toString();
    if(type==='VP8X') return {width:1+b.readUIntLE(24,3),height:1+b.readUIntLE(27,3)};
    if(type==='VP8 ') return {width:b.readUInt16LE(26)&16383,height:b.readUInt16LE(28)&16383};
    if(type==='VP8L') return {width:1+(((b[22]&63)<<8)|b[21]),height:1+(((b[24]&15)<<10)|(b[23]<<2)|((b[22]&192)>>6))};
  }
  throw new Error('Unknown image format');
}

const all = new Map();
const sectionChecks = [];
for (const [id, title] of parts) {
  const firstURL = `${api}?storepartuid=${id}&getparts=true&getoptions=true&slice=1&size=100`;
  const first = await fetchJSON(firstURL);
  const second = await fetchJSON(`${api}?storepartuid=${id}&slice=2&size=100`);
  if (first.products.length!==first.total || second.products.length!==0) throw new Error(`Unaccounted pagination for ${id}`);
  sectionChecks.push({id,title,total:first.total,firstPage:first.products.length,secondPage:second.products.length,apiURL:firstURL});
  for (const product of first.products) {
    const old=all.get(String(product.uid));
    if (old && JSON.stringify(old)!==JSON.stringify(product)) throw new Error(`Inconsistent product ${product.uid}`);
    all.set(String(product.uid), product);
  }
}
if(all.size!==Object.keys(known).length || [...all.keys()].some(id=>!known[id])) throw new Error('Source catalog changed: review descriptions/specifications before import');

const imageMap = new Map();
for(const product of all.values()) {
  const urls=[...JSON.parse(product.gallery).map(i=>i.img), ...product.editions.map(e=>e.img).filter(Boolean)];
  for(const url of urls) imageMap.set(originalURL(url),null);
}
await mkdir(path.join(root,'public/assets/products/omi'),{recursive:true});
const queue=[...imageMap.keys()];
let completed=0;
await Promise.all(Array.from({length:4}, async ()=>{
  while(queue.length) {
    const url=queue.shift();
    const file=path.basename(new URL(url).pathname);
    const relative=`/assets/products/omi/${file}`;
    const destination=path.join(root,'public',relative);
    let bytes;
    try {await stat(destination);bytes=await readFile(destination);} catch {bytes=await fetchBytes(url);await writeFile(destination,bytes);}
    const dimensions=imageSize(bytes);
    imageMap.set(url,{src:relative,sourceURL:url,...dimensions,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
    console.log(`Original ${++completed}/${imageMap.size}: ${file} (${dimensions.width}×${dimensions.height})`);
  }
}));

const imported=[];
const references=[];
for(const [uid,p] of all) {
  const info=known[uid];
  const sourceURL=p.url.replace(/^http:/,'https:');
  const gallery=[...new Set([...JSON.parse(p.gallery).map(i=>originalURL(i.img)),...p.editions.map(e=>e.img).filter(Boolean).map(originalURL)])];
  const editions=p.editions.map(e=>{
    const label=e['Цвет стола']||e['Цвет']||'Основной вариант';
    return {id:`omi-${uid}-${e.uid}`,label,price:null,stock:0,...(colors[label]?{color:colors[label]}:{}),...(e.img?{imageSrc:imageMap.get(originalURL(e.img)).src}:{})};
  });
  const categories=parts.filter(([id])=>JSON.parse(p.partuids).map(String).includes(id)).map(([,title])=>title).filter(title=>title!=='Все на главной'&&title!=='Каталог');
  imported.push({id:`omi-${uid}`,slug:`omi-${info.slug}`,title:p.title,categoryId:info.category,description:info.description,brand:'OMI.HOME',sourceName:'OMI.HOME',sourceProductId:uid,sourceUrl:sourceURL,status:'preview',visualization:false,photoSource:{name:'OMI.HOME',url:sourceURL},images:gallery.map((url,i)=>{const image=imageMap.get(url);return {src:image.src,alt:`${p.title} — фото ${i+1}`,width:image.width,height:image.height};}),variants:editions,specifications:{...info.specs,...(p.sku?{'Артикул источника':p.sku}:{}),'Исходный каталог':'OMI.HOME','Категория источника':categories.join(', ')||'Декор'}});
  references.push({sourceProductId:uid,title:p.title,sourceURL,sourceSKU:p.sku||null,sourcePriceRUB:p.price,sourceOldPriceRUB:p.priceold||null,sourceCategories:categories,specifications:info.specs,sourceOptions:p.json_options?JSON.parse(p.json_options):[],variants:p.editions.map(e=>({sourceVariantId:String(e.uid),sourceSKU:e.sku||null,sourcePriceRUB:e.price,sourceOldPriceRUB:e.priceold||null,options:Object.fromEntries(Object.entries(e).filter(([key])=>key==='Цвет'||key==='Цвет стола')),imageURL:e.img?originalURL(e.img):null})),images:gallery});
}
const catalogPath=path.join(root,'src/data/catalog.json');
const catalog=JSON.parse(await readFile(catalogPath,'utf8'));
const existing=catalog.products.filter(p=>p.sourceName!=='OMI.HOME'&&!p.id.startsWith('omi-'));
catalog.products=[...existing,...imported];
const serialized=JSON.stringify(catalog,null,2)+'\n';
await writeFile(catalogPath,serialized);
await writeFile(path.join(root,'public/data/catalog.json'),serialized);
await mkdir(path.join(root,'docs'),{recursive:true});
const manifest={importedAt:new Date().toISOString(),source:'https://omi-home.ru/catalog',purpose:'Reference catalog. Products are preview-only; original source prices are not Dopamine prices.',originalFiles:true,imageTransformations:'none',existingProductCount:existing.length,importedProductCount:imported.length,importedVariantCount:imported.reduce((n,p)=>n+p.variants.length,0),uniqueOriginalImages:imageMap.size,totalImageBytes:[...imageMap.values()].reduce((n,i)=>n+i.bytes,0),completeness:sectionChecks,products:references,images:[...imageMap.values()]};
await writeFile(path.join(root,'docs/omi-import-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({existing:existing.length,imported:imported.length,variants:manifest.importedVariantCount,images:imageMap.size,bytes:manifest.totalImageBytes,sections:sectionChecks},null,2));
