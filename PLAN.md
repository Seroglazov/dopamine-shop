# План модернизации и выполненные изменения

## Аудит

Исходная версия — HTML/CSS/ES modules с GSAP, двумя тестируемыми торговыми модулями и пустым реальным каталогом. Дополнительный промт требует многостраничность, Next.js, TypeScript и Tailwind; поэтому заменён слой представления и маршрутизации. Проверенная бизнес-логика и ключи localStorage сохранены.

## По файлам

1. `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `package.json`: Next static export, строгие модели, система сборки.
2. `src/app/layout.tsx`, `[section]/page.tsx`: общая оболочка и 15 внутренних маршрутов, метаданные, SEO, 404/error.
3. `src/app/globals.css`, `floating.css`: молочная основа, типографика, цветовые токены, сетки, органические формы, адаптивные композиции и reduced motion.
4. `public/assets/*.svg`: оригинальные SVG пользователя вместо растровой фильтрации логотипа.
5. `components/home.tsx`, `scramble.tsx`: выразительная главная, ink, палитра, категории, плавающая и горизонтальная витрины, последовательность комнаты, marquee, CTA.
6. `components/motion-system.tsx`: жизненный цикл GSAP, scroll, cursor, magnets, reduced motion, очистка listeners/timelines/tweens.
7. `components/shop.tsx`: каталог WB/Ozon по логике взаимодействия, подсказки, фильтры, пагинация, отдельная PDP, галерея, варианты, zoom и рекомендации.
8. `components/buyer.tsx`: корзина, локальный черновик заказа, гостевой профиль, интерфейсы auth и будущих заказов.
9. `components/store.tsx`, `lib/service.ts`, `models.ts`, `api-contracts.ts`: общее состояние и замена источника данных будущим API без переписывания представлений.
10. `components/information.tsx`: отдельные бренд, доставка/оплата, контакты, FAQ и описание обработки локальных данных.
11. `js/commerce.js`, `tests/commerce.test.mjs`: сохранены точные суммы/остатки/варианты, добавлена валидация иерархии категорий и характеристик.
12. `scripts/prepare-next.mjs`, `export-next.mjs`, `serve.mjs`: валидируемая сборка, статическая публикация, изолированный тестовый каталог.

## Материалы

Товары/цены/комнатные фото отсутствуют и не выдумываются. Получены доступные node-ссылки на 3D Cool Shapes и Brutalist Shape Elements: 4 элемента интегрированы через components/figma-shape.tsx и app/figma-shapes.css. Источники — FIGMA-ASSETS.md. Для оставшихся Community ресурсов нужны design/node ссылки.
