import fs from 'node:fs/promises';
import { validateCatalog } from '../src/js/commerce.js';

const catalog = JSON.parse(await fs.readFile('src/data/catalog.json', 'utf8'));
const photos = JSON.parse(await fs.readFile('source-assets/original-products/verification.json', 'utf8'));
const categories = [
  { id: 'ceramics-tableware', title: 'Керамика и посуда', description: 'Для любимых завтраков, ужинов и красивых повседневных ритуалов.' },
  { id: 'dopamine-light', title: 'Дофаминовый свет', description: 'Необычные лампы, которые добавляют цвет и настроение.' },
  { id: 'tactile-textiles', title: 'Тактильный текстиль', description: 'Мягкие фактуры и детали, к которым хочется прикоснуться.' },
  { id: 'accent-furniture-decor', title: 'Акцентная мебель и декор', description: 'Выразительные предметы для интерьера с характером.' },
];
for (const category of categories) {
  const index = catalog.categories.findIndex(c => c.id === category.id);
  if (index < 0) catalog.categories.push(category);
  else catalog.categories[index] = category;
}
const lamps = [
  { id: 'mosaic-lamp-large-orange', title: 'Настольная лампа ручной работы из мозаики — большая, оранжевая', color: 'Оранжевый', size: 'Большая',
    description: 'Большая настольная лампа ручной работы из оранжевой мозаики. Геометрический рисунок плиток и насыщенное свечение делают её выразительным акцентом на столе или тумбе. На фото — оригинальный предмет из подборки Dopamine. Размеры в сантиметрах, тип лампочки, питание и комплектацию уточним перед началом продаж.' },
  { id: 'mosaic-lamp-small-pearl', title: 'Настольная лампа ручной работы из мозаики — маленькая, перламутровая', color: 'Перламутровый', size: 'Маленькая',
    description: 'Маленькая настольная лампа ручной работы из перламутровой мозаики. Свет подчёркивает переливы плиток; компактный предмет легко представить на прикроватной тумбе или полке. На фото — оригинальный предмет из подборки Dopamine. Размеры в сантиметрах, тип лампочки, питание и комплектацию уточним перед началом продаж.' },
].map(({ color, size, ...lamp }) => {
  const photo = photos.find(p => p.id === lamp.id);
  if (!photo) throw new Error(`Missing original photo: ${lamp.id}`);
  return { ...lamp, slug: lamp.id, categoryId: 'dopamine-light', brand: 'Dopamine', status: 'preview', visualization: false,
    photoSource: { name: 'Коллекция Dopamine' },
    images: [{ src: photo.output, alt: `${lamp.title} — оригинальное фото, логотип Dopamine в углу`, width: photo.width, height: photo.height }],
    variants: [{ id: `${lamp.id}-pending`, label: `${size} / ${color.toLocaleLowerCase('ru-RU')}`, price: null, stock: 0 }],
    specifications: { 'Изготовление': 'Ручная работа', 'Отделка': 'Мозаика', 'Цвет': color, 'Размерная версия': size, 'Габариты и электрика': 'Уточняются перед запуском продаж', 'Фото': 'Оригинал из подборки; добавлен только логотип Dopamine' } };
});
catalog.products = [...lamps, ...catalog.products.filter(p => !lamps.some(lamp => lamp.id === p.id))];
validateCatalog(catalog);
await fs.writeFile('src/data/catalog.json', JSON.stringify(catalog, null, 2) + '\n');
console.log(`${catalog.categories.length} categories; ${catalog.products.length} products, including 2 mosaic lamps.`);
