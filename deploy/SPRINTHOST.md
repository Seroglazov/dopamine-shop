# Публикация через GitHub Actions на Спринтхост

Workflow `.github/workflows/deploy-sprinthost.yml` запускается вручную из GitHub Actions. Он устанавливает Node.js 22 на runner GitHub, выполняет тесты, проверку TypeScript, production-сборку и синхронизирует приложение по SSH. Зависимости на Спринтхосте не устанавливаются: серверный entrypoint использует только встроенные модули Node.js. Автоматический запуск после каждого push намеренно не включён до проверки путей на сервере. Локальная папка не является источником публикации.

В GitHub открой `Settings → Environments → New environment`, создай окружение `production`, затем добавь в его Secrets:

- `SPRINTHOST_HOST` — SSH-хост Спринтхоста;
- `SPRINTHOST_PORT` — обычно `22`;
- `SPRINTHOST_USER` — логин SSH;
- `SPRINTHOST_SSH_KEY` — приватный ключ, соответствующий добавленному на Спринтхост публичному ключу;
- `SPRINTHOST_APP_ROOT` — абсолютная директория приложения внутри корня домена, например `/home/LOGIN/domains/dopamine-shop.ru/public_html/dopamine-app`.

Секрет `SPRINTHOST_APP_ROOT` должен указывать на отдельную папку приложения, например `/home/LOGIN/domains/dopamine-shop.ru/public_html/dopamine-app`. Сам домен обычно использует родительский `public_html`; workflow автоматически создаёт там `.htaccess` и направляет запросы в `PassengerAppRoot`. Для Node.js-приложения настрой в панели Спринтхоста веб-сервер Node.js 22 и SSH-доступ. Файл `.env` создай только в папке приложения, вне GitHub; добавь в него `SHOP_ORIGIN`, `SHIPPING_*`, `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY`.

После первой публикации проверь:

В разделе «Сайты → Веб-серверы» создай веб-сервер с Node.js 22 и подключи к нему `dopamine-shop.ru`. Наличие команды `node22` в SSH не означает, что Passenger включён для сайта. Если модуль Passenger не загружен в Apache, директивы `PassengerAppRoot` в `.htaccess` вызывают ошибку 500 ещё до запуска приложения. Инструкция хостинга: https://help.sprinthost.ru/howto/nodejs.

Workflow закрывает прямой HTTP-доступ к папке приложения через её собственный `.htaccess`. Домен обрабатывает родительский `.htaccess`. В нём не должно быть перенаправления `RewriteRule ^ app.cjs`: стартовый файл лежит в `PassengerAppRoot`, а Passenger сам передаёт ему запросы.

```text
https://dopamine-shop.ru/api/health
```

Ожидаемый ответ: `{"status":"ok","checkoutEnabled":false}`. Это означает, что приложение запущено, но заказы и платежи ещё не включены.

В workflow используется синхронизация без удаления удалённых файлов. Перед первым запуском проверь `SPRINTHOST_APP_ROOT` и сделай резервную копию текущего каталога. После успешной ручной публикации можно отдельно включить запуск по push, если путь подтверждён.

Если workflow не может подключиться, проверь SSH-доступ вручную у себя и попроси поддержку Спринтхоста подтвердить Node.js 22, Passenger, путь `PassengerAppRoot` и возможность запуска `app.cjs`. Не добавляй пароли или ключи в файлы репозитория.
