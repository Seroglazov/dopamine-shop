import fs from 'node:fs/promises';
import { validateCatalog } from '../src/js/commerce.js';

const photos = JSON.parse(await fs.readFile('source-assets/original-products/verification.json', 'utf8'));
const manifest = JSON.parse(await fs.readFile('source-assets/original-products/manifest.json', 'utf8'));
const catalog = JSON.parse(await fs.readFile('src/data/catalog.json', 'utf8'));
const products = [
  { id: 'printesso-stripes', title: 'Розово-жёлтая накладка на выключатель', categoryId: 'switch-covers', label: 'Розовый / жёлтый, два переключателя',
    description: 'Фигурная накладка Printesso с розово-жёлтыми волнами и двумя переключателями. На оригинальном фото — сочетание с тёплой стеной и зеленью. Размеры и совместимость для заказа в Dopamine уточняются.',
    specifications: { 'Производитель накладки': 'Printesso', 'Цвет на фото': 'Розовый / жёлтый', 'Конфигурация на фото': 'Два переключателя' } },
  { id: 'printesso-waves', title: 'Волнистая накладка на выключатель', categoryId: 'switch-covers', label: 'Бордовый / розовый',
    description: 'Накладка Printesso с волнистым краем и контрастными полосами. Оригинальное интерьерное фото показывает бордово-розовое сочетание над диваном. Размеры и совместимость для заказа в Dopamine уточняются.',
    specifications: { 'Производитель накладки': 'Printesso', 'Цвет на фото': 'Бордовый / розовый', 'Конфигурация на фото': 'Один переключатель' } },
  { id: 'printesso-checker', title: 'Накладка на розетки «Шахматы»', categoryId: 'socket-covers', label: 'Бордовый / бежевый, две розетки',
    description: 'Прямоугольная накладка Printesso с шахматным рисунком вокруг двух розеток. На фото сохранены интерьер, провода и освещение. Размеры и совместимость для заказа в Dopamine уточняются.',
    specifications: { 'Производитель накладки': 'Printesso', 'Рисунок': 'Шахматный', 'Конфигурация на фото': 'Две розетки' } },
  { id: 'printesso-polka', title: 'Накладка на розетку «Горошек»', categoryId: 'socket-covers', label: 'Красный / белый, круглая',
    description: 'Круглая красная накладка Printesso в белый горошек. Оригинальное фото крупным планом показывает форму, рисунок и фактуру в интерьере. Размеры и совместимость для заказа в Dopamine уточняются.',
    specifications: { 'Производитель накладки': 'Printesso', 'Рисунок': 'Белый горошек на красном фоне', 'Конфигурация на фото': 'Одна розетка' } },
  { id: 'velur-thermo-kit', title: 'Термохромный бланковый набор, розовый / белый', categoryId: 'thermo-merch', label: 'Бланковый набор', images: ['velur-thermo-kit', 'velur-thermo-kit-2'],
    description: 'Оригинальный термохромный набор с сайта VELUR.ME: бейсболка и термохромная плёнка 10 × 10 см. Розовая ткань светлеет при нагревании примерно до 32 °C. Два фото показывают бейсболку с проявившимся эффектом и в розовом состоянии. Логотип Dopamine добавлен в угол фотографии; это не нанесение на саму бейсболку.',
    specifications: { 'Артикул источника': '26061010', 'Состав основной ткани': '100% хлопок', 'Размер': 'One size', 'Комплектация по источнику': 'Бейсболка и термохромная плёнка 10 × 10 см', 'Температура реакции по источнику': 'Около 32 °C' } },
  { id: 'velur-neon-cord', title: 'Шнур салатовый неон с чёрно-оранжевыми кончиками', categoryId: 'accessories', label: 'Плоский, 125 см × 10 мм', images: ['velur-neon-cord', 'velur-neon-cord-2'],
    description: 'Плоский салатовый шнур с чёрными и оранжевыми наконечниками из каталога VELUR.ME. Длина по источнику — 125 см, ширина — 10 мм. Оба оригинальных фото сохранены полностью; добавлен только логотип Dopamine в свободном углу.',
    specifications: { 'Артикул источника': '10052052', 'Длина по источнику': '125 см', 'Ширина по источнику': '10 мм', 'Цвет': 'Салатовый неон, чёрные и оранжевые кончики' } },
].map(({ label, images, ...p }) => {
  const source = manifest.find(photo => photo.id === p.id);
  return { ...p, slug: p.id, brand: source.supplier, status: 'preview', visualization: false,
    photoSource: { name: source.supplier, url: source.source },
    images: (images || [p.id]).map(id => { const photo = photos.find(photo => photo.id === id); return { src: photo.output, alt: `${p.title} — оригинальное фото ${source.supplier}, логотип Dopamine в углу`, width: photo.width, height: photo.height }; }),
    variants: [{ id: `${p.id}-pending`, label, price: null, stock: 0 }],
    specifications: { ...p.specifications, 'Фото': 'Оригинал источника; добавлен только логотип Dopamine', 'Цена и наличие в Dopamine': 'Уточняются' } };
});
if (!catalog.categories.some(c => c.id === 'accessories')) catalog.categories.push({ id: 'accessories', title: 'Шнуры и аксессуары', description: 'Неоновые детали для вещей с характером.' });
catalog.categories.find(c => c.id === 'thermo-merch').description = 'Вещи с эффектом смены цвета и идеи будущей коллекции.';
catalog.products = [...products, ...catalog.products.filter(p => !products.some(newProduct => newProduct.id === p.id))];
validateCatalog(catalog);
await fs.writeFile('src/data/catalog.json', JSON.stringify(catalog, null, 2) + '\n');
console.log(`Added ${products.length} original products; ${catalog.products.length} total.`);
