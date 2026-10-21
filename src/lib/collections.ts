export const collections = [
  { id: 'bedroom', title: 'Спальня', note: 'Мягкий свет и цветные детали', color: '#e2d9f5', productIds: ['mosaic-lamp-small-pearl', 'mosaic-lamp-large-orange', 'printesso-waves'], coverId: 'mosaic-lamp-small-pearl' },
  { id: 'kitchen', title: 'Кухня', note: 'Для любимых ежедневных ритуалов', color: '#f8cbaa', productIds: ['dopamine-warm-cup', 'printesso-stripes'], coverId: 'dopamine-warm-cup' },
  { id: 'bathroom', title: 'Ванная', note: 'Акценты для входной зоны', color: '#d8e7d5', productIds: ['printesso-polka', 'printesso-checker'], coverId: 'printesso-polka' },
  { id: 'decor', title: 'Декор', note: 'Маленькие вещи с характером', color: '#f4c4d9', productIds: ['printesso-stripes', 'printesso-waves', 'printesso-checker', 'printesso-polka', 'dopamine-wave-switch', 'dopamine-flow-socket', 'mosaic-lamp-large-orange'], coverId: 'printesso-waves' },
  { id: 'gifts', title: 'Подарки', note: 'То, что хочется подарить', color: '#e2eea9', productIds: ['velur-thermo-kit', 'velur-neon-cord', 'dopamine-heat-hoodie', 'dopamine-warm-cup', 'mosaic-lamp-small-pearl'], coverId: 'velur-thermo-kit' },
];

export function findCollection(id: string | null) {
  return collections.find(collection => collection.id === id);
}
