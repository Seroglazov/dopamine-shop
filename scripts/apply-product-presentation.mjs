import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const presentation = JSON.parse(await fs.readFile(new URL('../src/data/product-presentation.json', import.meta.url), 'utf8'));
export function applyProductPresentation(catalog) {
  for (const p of catalog.products) {
    const copy = presentation[p.id];
    if (!copy) continue;
    p.description = copy.description;
    p.variants = p.variants.map((v, index) => ({ ...v, ...(index === 0 ? { color: copy.color, ...(copy.label ? { label: copy.label } : {}) } : {}) }));
    p.images = p.images.map((image, i) => ({ ...image, alt: `${p.title}${i ? ` — ракурс ${i + 1}` : ''}` }));
    p.specifications = Object.fromEntries(Object.entries(p.specifications || {})
      .filter(([key, value]) => !['Фото', 'Изображение', 'Статус', 'Цена и наличие в Dopamine', 'Габариты и электрика'].includes(key) && !/визуализац|концепт|уточня|добавлен только логотип/i.test(value))
      .map(([key, value]) => [key.replace(' по источнику', '').replace(' источника', '').replace(' на фото', ''), value]));
  }
  const thermo = catalog.categories.find(c => c.id === 'thermo-merch');
  if (thermo) thermo.description = 'Вещи, которые меняют цвет от тепла.';
  return catalog;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = new URL('../src/data/catalog.json', import.meta.url);
  const catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  await fs.writeFile(file, JSON.stringify(applyProductPresentation(catalog), null, 2) + '\n');
}
