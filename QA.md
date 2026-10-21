# Проверка фронтенда — 20 октября 2026

## Original supplier photos — 2026-10-21

- Added six original products from Printesso and VELUR.ME, with eight downloaded source photographs. Four earlier concepts are preserved and remain labelled separately. Prices are null and sellable stock is zero until the owner confirms them.
- Deterministic original-logo overlay only, lossless WebP, unchanged dimensions. Pixel comparison for all eight images found zero modified pixels outside the logo rectangle. Original files and SHA-256 hashes retained in source-assets/original-products.
- Safe HTTPS supplier credit validation added. All 20 commerce tests and TypeScript checks passed; production export generated 24 static pages.
- Browser QA: desktop 1280 px, mobile 390 and 320 px. Full photo composition preserved with contain, no horizontal overflow. Search returns the neon cord; socket category returns two original covers and one existing concept. Favorites update, second image selection works, and zoom closes with Escape. Unpriced purchase is disabled and supplier source links are visible. No browser errors observed.
- Moved the original-photo zoom affordance to the opposite corner so it does not obscure the logo. Core Web Vitals were not measured in this catalog update.

## Пройдено

- Next.js production static export: 21 генерируемая страница/служебный маршрут, включая главную и 15 внутренних страниц.
- Строгая проверка TypeScript.
- 16/16 тестов: схема каталога, категории и циклы parentId, характеристики, варианты, целые копейки, остатки, корзина, восстановление/слияние localStorage, сортировка, поиск, фильтры, необязательные метаданные.
- Проверка browser console на главной и покупательском сценарии: ошибок/warn не обнаружено.
- Desktop 1280×900: оригинальные SVG, oversized hero, меню, переход к каталогу, промежуточная розовая фаза storytelling с появлением объектов.
- Mobile 390×844 и узкая ширина 320: главная, каталог, PDP, корзина, черновик заказа без горизонтального переполнения.
- Tablet 768×1024: страница бренда без горизонтального переполнения.
- Escape закрывает fullscreen menu; фокус возвращается на «Открыть меню».
- Mobile filters: открываются с фокусом на закрытии и доступны с клавиатуры.
- На изолированном fixture origin 4174: карточки, PDP, выбор варианта 2500/3000 тестовых рублей, корректный запрет добавления сверх остатка, корзина, увеличение количества и итог 5000 тестовых рублей.
- Checkout: валидация полей, явное согласие сохранить в браузере, успешное сохранение черновика, восстановление после reload, удаление через UI. Никаких заказов/платежей/POST.
- Гостевой профиль: локальное сохранение. Auth: формы email/телефона; отсутствующая серверная авторизация обозначена явно.
- Next client navigation в preview: `.txt` ответы имеют text/plain; состояние корзины сохраняется между страницами.

## Реализовано, требует проверки на настоящем контенте/устройствах

- Плавающие product compositions, горизонтальная витрина, новинки, дополнительные категории, реальные интерьеры/hotspots включаются данными каталога.
- Responsive srcSet поддерживается при предоставлении вариантов изображений.
- Reduced motion: CSS и GSAP lifecycle предусмотрены; системная настройка пользователя во время проверки не изменялась.
- Нет утверждения о достигнутых production LCP ≤2.5s, CLS ≤0.1, INP ≤200ms. Измерение на реальных устройствах и наполненном каталоге остаётся отдельным этапом.
- Полный внешний аудит доступности не выполнялся.
- Figma: после получения design/node ссылок интегрированы 4 элемента из 3D Cool Shapes и Brutalist Shape Elements. Источники, слои и файлы описаны в FIGMA-ASSETS.md. Остальные исходные Community ресурсы требуют доступных node-ссылок.

## Материалы и честные состояния

Production каталог: 0 настоящих товаров. Тестовые записи находятся только в tests/ и не включаются в dist/data/catalog.json. Контакты, доставка и возврат не выдуманы. Иллюстрация комнаты обозначена как иллюстрация.

## Проверка интеграции Figma
- Все 4 слота и 6 локальных ассетов проверены: файлы непустые, изображения успешно загружены, SVG-маски подключены с собственного origin.
- Геометрия SVG 324.802, 107, 426, 389.6 сохранена; адаптивный масштаб применяется к родительским контейнерам.
- Desktop 1280px: hero и footer проверены визуально; все четыре изображения загружены. Mobile 390px и 320px: переполнения нет, 3D-форма не перекрывает текст.
- Суммарный размер ассетов компонентов — 19 494 байта; исходные 2560px текстуры не публикуются.
- Production build и TypeScript после интеграции проходят.

## Hero и Footer7
- Hero использует ровно тот же /assets/logo-wordmark.svg, что и шапка; h1 имеет доступное имя Dopamine.
- Canvas ink использует прозрачный силуэт SVG вместо шрифтового fillText, загрузка изображения и reduced motion учтены.
- Footer7 из предоставленного компонента адаптирован в src/components/ui/footer-7.tsx: три группы реальных ссылок, бренд, CTA, правовая информация, возврат наверх. Неопубликованные социальные адреса не подставляются.
- TypeScript и production build проходят; browser console error/warn отсутствуют. Desktop 1280px и mobile 390px проверены визуально.

## Additional 3D Cool Shapes — 2026-10-21

- Four additional original Figma nodes (1:17, 1:8, 1:20, 1:70), six placements across the brand panel, catalog teaser, room background and FAQ.
- Native 200 × 200 exports and original SVG masks retained locally; colors, silhouettes and aspect ratios preserved. New runtime assets total about 30 KB including masks.
- Production build and TypeScript validation passed after a clean Next.js rebuild; static output exported to dist.
- Browser QA: desktop 1280 px and mobile 390/320 px. All six images loaded, no persistent horizontal overflow, no overlap between the mobile catalog shape and sticker. Mobile drift transforms are absent.
- FAQ expands via keyboard. New decoration is aria-hidden, lazy-loaded and does not intercept pointer events. Existing GSAP context owns desktop scroll drift and cleanup; reduced-motion setup returns before animations are created.
- No browser warnings or errors observed. Core Web Vitals were not measured in this visual change.

## Blog, cooperation and branded product concepts — 2026-10-21

- Added /blog/, /article/?slug=... and /cooperation/ to static routes, navigation and footer. Three original editorial articles, topic filtering, article contents and related concept links.
- Four user-authorized Dopamine concept entries: switch cover, socket cover, thermochromic hoodie and mug. Original branded visuals generated with the built-in ImageGen tool; inputs, final prompts and runtime paths are documented in PRODUCT-ASSETS.md.
- All entries have status preview, nullable unknown price and zero sellable stock. No supplier prices, inventory, reviews or unconfirmed material/temperature specifications are invented. Images are labelled as visualizations.
- New business checks enforce preview validation, exclusion from bounded price/inventory filters and cart rejection, including tampered local cart entries. All 19 tests passed; TypeScript and production static export passed.
- Browser QA: category filter narrows thermochromic merch to two entries; favorite persists in product detail; preview purchase is disabled; blog topic filter and article navigation work. Local collaboration draft saves, survives reload and deletes through UI. Test draft removed. No external submission is implemented.
- Responsive checks cover 1280, 390 and 320 px. A long collaboration heading was adjusted to avoid grid overflow. Menu closes with Escape and restores focus.
- Prices and availability await the owner. Before activating an entry, confirm actual pricing, stock, variants and specifications and set status active with numeric prices in kopecks.
- Final mobile home check: long category labels use a bounded grid. Horizontal clipping on the main route prevents tilted offscreen reveal sections from creating a horizontal scrollbar while preserving normal vertical/sticky scrolling.
