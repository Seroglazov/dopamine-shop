# Dopamine Marketplace frontend

Next.js 15 / React 19 / TypeScript / Tailwind CSS 3 / GSAP + ScrollTrigger.
Статический экспорт: backend, оплата и серверная авторизация не подключены.

## Запуск

- `npm ci` — установка зафиксированных зависимостей.
- `npm run dev` — Next.js на 127.0.0.1:3000.
- `npm run typecheck` — строгая проверка TypeScript.
- `npm test` — проверки бизнес-логики и валидации.
- `npm run build` — валидация каталога, Next.js export, копирование `out/` в `dist/`.
- `npm run preview` — production preview на 127.0.0.1:4173.
- `node scripts/serve.mjs --fixture` — изолированные синтетические товары на 4174. В публикацию не включаются.
- Публикация на Спринтхост — через GitHub Actions; см. `deploy/SPRINTHOST.md`.

## Маршруты

`/`, `/catalog/`, `/category/?id=…`, `/product/?slug=…`, `/favorites/`, `/cart/`, `/checkout/`, `/account/`, `/orders/`, `/login/`, `/register/`, `/about/`, `/contacts/`, `/delivery/`, `/faq/`, `/privacy/`.
Каждая страница имеет собственный HTML-файл; переходы работают через Next App Router. Query-параметры товара/категории позволяют подключать каталог без сервера маршрутизации. Предыдущие ссылки `#catalog`, `#about`, `#contacts`, `#product/slug` перенаправляются на новые страницы.

## Архитектура

- `src/app/` — маршрутизация, SEO, страницы ошибок, глобальный дизайн.
- `src/components/home.tsx` — hero, самостоятельный Hover Ink, оригинальный SVG, категории, плавающие товары, горизонтальная витрина, storytelling, маркированные комнаты.
- `src/components/shop.tsx` — каталог, поиск с подсказками, категории/подкатегории, цены, сортировка, наличие, новинки, пагинация, карточки, PDP и zoom.
- `src/components/buyer.tsx` — корзина, черновик заказа, локальный профиль, история заказов и интерфейсы входа/регистрации.
- `src/components/store.tsx` — общее состояние, сохранение корзины/избранного, синхронизация вкладок и уведомления.
- `src/components/motion-system.tsx` — GSAP lifecycle, cursor, magnets, scroll progress, storytelling, галерея, reduced motion.
- `src/lib/models.ts` — типы каталога, вариантов, комнат и покупательских данных.
- `src/lib/service.ts` — заменяемый адаптер каталога и настроек.
- `src/lib/api-contracts.ts` — контракты будущих auth/checkout/orders API и продавцов. Реализаций и фиктивных успешных ответов нет.
- `src/js/commerce.js` — сохранённая и расширенная проверенная бизнес-логика. Деньги в целых копейках.
- `src/js/ink.js` — авторский Canvas 2D эффект; платный исходный код MotionSites не использовался.
- `public/assets/logo-original.svg`, `logo-wordmark.svg` — предоставленные пользователем SVG.

## Реальные товары

Источник истины — `src/data/catalog.json`. `prebuild` валидирует и копирует его в `public/data/`.

```json
{
  "version": 1,
  "categories": [{"id": "real-category", "title": "Реальная категория"}],
  "products": [],
  "rooms": []
}
```

Product: `id`, `slug` (латиница с дефисами), `title`, `description`, `categoryId`, `images: [{src, alt, width, height, srcSet?}]`, `variants: [{id, label, price, stock, compareAtPrice?}]`.
Необязательно: `featured`, `isNew`, `brand`, `rating`, `reviewCount`, `deliveryLabel`, `specifications: {характеристика: значение}`, `sellerId`.
Category: `id`, `title`, необязательно `parentId`, `description`.
Room: `id`, `title`, `image: {src, alt, width, height}`, `markers: [{productId, x, y}]`; координаты 0–100 в процентах.

Публиковать только реальные фотографии, цены, наличие и подтверждённые рейтинги. `featured` включает товар в витрины; `isNew` — в новинки. Секции комнаты появляются только с настоящими сценами.

Настройки контактов/доставки/возврата — `src/data/settings.json`. Пустые значения отображаются как отсутствие опубликованных условий.

## Локальное хранение

- `dopamine-cart-v1`, `dopamine-favorites-v1` совместимы с предыдущей версией.
- Черновики: `dopamine-profile-draft`, `dopamine-checkout-draft`.
- Профиль не является аккаунтом. Код входа не отправляется. Заказы не создаются, оплата отсутствует.
- Черновик заказа сохраняется только по явному выбору пользователя и удаляется через интерфейс.

## Границы готовности

Реальный ассортимент и интерьерные фото ещё не предоставлены; production каталог пустой. Фронтенд не подменяет их тестовыми данными. Storytelling использует собственную абстрактную CSS-иллюстрацию, обозначенную как иллюстрация.
Core Web Vitals на production и реальные телефоны требуют отдельного измерения после наполнения. Целевые LCP/CLS/INP не заявлены как достигнутые.

## Figma
Четыре декоративных элемента из предоставленных 3D Cool Shapes и Brutalist Shape Elements встроены в hero, manifesto и footer. Используются локальные исходные SVG-маски и оптимизированные градиентные текстуры. Карта источников: FIGMA-ASSETS.md. Остальные Community ресурсы ожидают доступных design/node ссылок.

## Footer7 и hero
Футер на основе предоставленного Footer7: src/components/ui/footer-7.tsx. Сохранена модель props, данные адаптированы к магазину. Папка компонентов UI соответствует принятому пути @/components/ui. TypeScript и Tailwind уже настроены; дополнительные библиотеки и shadcn CLI не требуются для этого компонента.
Hero использует оригинальный SVG-логотип; цветная canvas-маска строится по его альфа-каналу.

### First collection and editorial sections

Blog content lives in src/lib/journal.ts; blog/article and collaboration views use the existing static section router. Collaboration proposals remain browser-local drafts until a real contact or backend is connected.

src/data/catalog.json contains four branded preview entries authorized by the owner. A preview variant uses price: null and stock: 0; status: preview blocks cart actions and price/inventory filtering. To launch a confirmed item, provide numeric prices in kopecks, real stock and status: active. Keep visualization labels for generated imagery. See PRODUCT-ASSETS.md for references, prompts and asset paths.
