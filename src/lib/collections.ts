export const collections = [
  { id: 'bedroom', title: 'Спальня', note: 'Твой вечер. Твой мягкий свет.', image: '/assets/collections/bedroom.jpg', position: '50% 50%', categoryIds: ['dopamine-light', 'tactile-textiles'], productIds: ['mosaic-lamp-small-pearl', 'mosaic-lamp-large-orange', 'printesso-waves'] },
  { id: 'kitchen', title: 'Кухня', note: 'Радость в ежедневных ритуалах.', image: '/assets/collections/living-room.jpg', position: '90% 25%', categoryIds: ['ceramics-tableware'], productIds: ['dopamine-warm-cup', 'printesso-stripes'] },
  { id: 'bathroom', title: 'Ванная', note: 'Маленькое место для себя.', image: '/assets/collections/bathroom.jpg', position: '50% 50%', categoryIds: [], productIds: ['printesso-polka', 'printesso-checker'] },
  { id: 'decor', title: 'Декор', note: 'Дом с твоим характером.', image: '/assets/collections/living-room.jpg', position: '25% 65%', categoryIds: ['accent-furniture-decor', 'switch-covers', 'socket-covers', 'dopamine-light'], productIds: ['printesso-stripes', 'printesso-waves', 'printesso-checker', 'printesso-polka', 'dopamine-wave-switch', 'dopamine-flow-socket', 'mosaic-lamp-large-orange'] },
  { id: 'gifts', title: 'Подарки', note: 'Маленькое «я о тебе подумал».', image: '/assets/collections/gifts.png', position: '50% 50%', categoryIds: ['accessories', 'thermo-merch'], productIds: ['velur-thermo-kit', 'velur-neon-cord', 'dopamine-heat-hoodie', 'dopamine-warm-cup', 'mosaic-lamp-small-pearl'] },
];

export function findCollection(id: string | null) {
  return collections.find(collection => collection.id === id);
}
