# Web-project

Our team members:
1.Amangeldi Dinmukhammed
2.Tulebayeva Tomiris
3.Yerdauit Yerlanuly


#  Inventory Shop — Полная документация

> Fullstack-система управления магазином с клиентской витриной, админ-панелью и AI-функциями.

---

## Содержание

1. [Обзор проекта](#обзор)
2. [Стек технологий](#стек)
3. [Быстрый старт](#старт)
4. [Backend — Django](#backend)
5. [Frontend — Angular](#frontend)
6. [API Reference](#api)
7. [Фичи](#фичи)


---

## Обзор

Inventory Shop — система управления магазином с двумя интерфейсами:

- **Клиентская витрина** — каталог товаров, корзина, оформление заказа, отслеживание
- **Админ-панель** — управление товарами, заказами, аналитика, журнал действий

## Стек

### Backend
| Технология | Версия | Назначение |
|-----------|--------|-----------|
| Python | 3.10+ | Язык |
| Django | 4.x | Web-фреймворк |
| Django REST Framework | 3.x | REST API |
| django-cors-headers | — | CORS |
| python-dotenv | — | Переменные окружения |
| Pillow | — | Загрузка изображений |
| openpyxl | — | Экспорт в Excel |
| requests | — | HTTP-запросы к Gemini и Telegram |
| python-telegram-bot | — | Telegram-бот |

### Frontend
| Технология | Версия | Назначение |
|-----------|--------|-----------|
| Angular | 17 | SPA-фреймворк |
| TypeScript | 5.x | Язык |
| SCSS | — | Стили |
| Chart.js | — | Графики |
| qrcode | — | QR-коды |
| intro.js | — | Онбординг-тур |

---

## Быстрый старт

### Требования

```bash
python --version   # 3.10+
node --version     # 18+
ng version         # 17+

# Установить Angular CLI если нет
npm install -g @angular/cli
```

### 1. Клонировать репо

```bash
git clone https://github.com/ТВОЙ_ЮЗЕР/inventory-shop.git
cd inventory-shop
```

### 2. Запуск Backend

```bash
cd backend

# Виртуальное окружение
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Зависимости
pip install django djangorestframework django-cors-headers python-dotenv requests pillow openpyxl python-telegram-bot

# Создай .env файл (см. раздел Переменные окружения)

# Миграции
python manage.py migrate

# Суперпользователь
python manage.py createsuperuser

# Запуск
python manage.py runserver
```

### 3. Запуск Frontend

```bash
# Новый терминал
cd frontend
npm install
ng serve
```

### Готово

| Адрес | Что |
|-------|-----|
| http://localhost:4200 | Клиентская витрина |
| http://localhost:4200/login | Вход в админку |
| http://127.0.0.1:8000/api/ | Backend API |

---

## Backend — Django

### Структура

```
backend/
├── api/
│   ├── models.py         # Все модели данных
│   ├── serializers.py    # Сериализаторы
│   ├── views.py          # FBV и CBV
│   ├── urls.py           # Маршруты API
│   ├── telegram_bot.py   # Отправка уведомлений в Telegram
│   └── utils.py          # Вспомогательные функции (логирование)
├── config/
│   ├── settings.py       # Настройки Django
│   └── urls.py           # Корневые маршруты
├── media/                # Загруженные изображения товаров
├── .env                  # Секретные ключи (не в репо)
└── manage.py
```

### Модели

#### Category
```
id          AutoField
name        CharField(100)
```

#### Product
```
id              AutoField
name            CharField(200)
description     TextField
price           DecimalField(10, 2)
stock           PositiveIntegerField
category        ForeignKey → Category
image           ImageField(upload_to='products/')
created_at      DateTimeField(auto_now_add)

# Computed properties
average_rating  → среднее значение оценок (float)
rating_count    → количество оценок (int)
```

#### Order
```
id              AutoField
customer_name   CharField(200, blank, null)
customer_phone  CharField(20, blank, null)
status          CharField: new | confirmed | delivered | cancelled
total           DecimalField(10, 2)
tracking_code   CharField(12, unique) — авто-генерируется
created_at      DateTimeField(auto_now_add)
```

#### OrderItem
```
id              AutoField
order           ForeignKey → Order
product         ForeignKey → Product
quantity        PositiveIntegerField
price_at_order  DecimalField(10, 2)
```

#### ProductRating
```
id              AutoField
product         ForeignKey → Product
session_key     CharField(100) — анонимный идентификатор
score           PositiveSmallIntegerField (1–5)
created_at      DateTimeField(auto_now_add)

Meta: unique_together = ('product', 'session_key')
```

#### AuditLog
```
id          AutoField
user        ForeignKey → User (null)
action      CharField(50) — product_created, order_status_changed, login...
entity      CharField(50) — Product, Order...
entity_id   PositiveIntegerField (null)
description TextField
ip_address  GenericIPAddressField (null)
created_at  DateTimeField(auto_now_add)
```

### Сериализаторы

| Класс | Тип | Что делает |
|-------|-----|-----------|
| `LoginSerializer` | Serializer | Валидация логина/пароля |
| `StatsSerializer` | Serializer | Ручная сборка статистики |
| `ProductSerializer` | ModelSerializer | Товары + average_rating, rating_count, image_url |
| `OrderSerializer` | ModelSerializer | Заказы с вложенными OrderItem |
| `ProductRatingSerializer` | ModelSerializer | Оценки товаров |
| `AuditLogSerializer` | ModelSerializer | Записи журнала действий |

### Views

#### FBV (Function-Based Views)
| Функция | Метод | URL | Auth |
|---------|-------|-----|------|
| `login_view` | POST | /api/auth/login/ | 
| `logout_view` | POST | /api/auth/logout/ |
| `dashboard_stats` | GET | /api/stats/ | 
| `chart_stats` | GET | /api/stats/chart/ | 
| `export_orders` | GET | /api/orders/export/ | 
| `ai_search` | POST | /api/ai-search/ | 
| `ai_search_by_image` | POST | /api/ai-search-by-image/ | 
| `rate_product` | POST | /api/products/:id/rate/ | 
| `track_order` | GET | /api/orders/track/:code/ | 
| `get_recommendations` | GET | /api/products/:id/recommendations/ | 

#### CBV (Class-Based Views)
| Класс | URL | Методы |
|-------|-----|--------|
| `ProductListCreateView` | /api/products/ | GET (public), POST (auth) |
| `ProductDetailView` | /api/products/:id/ | GET (public), PATCH/DELETE (auth) |
| `OrderListCreateView` | /api/orders/ | GET (auth), POST (public) |
| `OrderDetailView` | /api/orders/:id/ | GET/PATCH (auth) |
| `CategoryListCreateView` | /api/categories/ | GET (public), POST (auth) |
| `AuditLogListView` | /api/audit-logs/ | GET (auth) |

---

## Frontend — Angular

### Структура

```
frontend/src/app/
├── core/
│   ├── interceptors/
│   │   └── auth.interceptor.ts       # Добавляет Token в каждый запрос
│   ├── guards/
│   │   └── auth.guard.ts             # Защита /admin/** роутов
│   └── services/
│       ├── auth.service.ts           # Логин, логаут, токен
│       ├── product.service.ts        # CRUD товаров, фильтрация
│       ├── order.service.ts          # Заказы, отслеживание
│       ├── stats.service.ts          # Статистика, график
│       ├── cart.service.ts           # Корзина 
│       ├── ai-search.service.ts      # Текстовый и фото AI-поиск
│       ├── rating.service.ts         # Оценка товаров
│       ├── voice-search.service.ts   # Web Speech API
│       ├── onboarding.service.ts     # Тур для новых пользователей
│       ├── audit.service.ts          # Журнал действий
│       └── theme.service.ts          # Тёмная/светлая тема
│
├── shared/
│   ├── interfaces/
│   │   ├── product.interface.ts
│   │   ├── order.interface.ts
│   │   ├── stats.interface.ts
│   │   └── audit.interface.ts
│   └── components/
│       ├── star-rating/              # Звёздный рейтинг (интерактивный/статичный)
│       ├── skeleton/                 # Базовый skeleton-блок
│       └── product-card-skeleton/   # Skeleton карточки товара
│
├── admin/
│   ├── layout/                       # Сайдбар + router-outlet
│   ├── dashboard/                    # Статистика + график продаж
│   ├── products/                     # CRUD товаров + изображения
│   ├── orders/                       # Заказы + смена статуса + экспорт
│   └── audit/                        # Журнал действий
│
├── shop/
│   ├── layout/                       # Хедер + футер + тема
│   ├── catalog/                      # Каталог + AI-поиск + голос + фото + фильтры
│   ├── cart/                         # Корзина + анонимный заказ + QR
│   ├── product/                      # Страница товара + рекомендации
│   └── track/                        # Отслеживание заказа по коду
│
├── login/                            # Страница авторизации
├── app.routes.ts                     # Все маршруты
└── app.config.ts                     # HttpClient + Interceptor
```

### Роутинг

```
/                       → редирект на /shop/catalog
/login                  → LoginComponent

/shop                   → ShopLayoutComponent
  /shop/catalog         → CatalogComponent
  /shop/cart            → CartComponent
  /shop/product/:id     → ProductComponent
  /shop/track           → TrackComponent
  /shop/track/:code     → TrackComponent (авто-поиск)

/admin                  → AdminLayoutComponent [AuthGuard]
  /admin/dashboard      → DashboardComponent
  /admin/products       → ProductsComponent
  /admin/orders         → OrdersComponent
  /admin/audit          → AuditComponent
```

### CSS-переменные (темизация)

```scss
/* Светлая тема */
:root {
  --primary:       #2563EB;
  --primary-hover: #1D4ED8;
  --primary-light: #EFF6FF;
  --success:       #16A34A;
  --warning:       #D97706;
  --danger:        #DC2626;
  --bg:            #F1F5F9;
  --surface:       #FFFFFF;
  --border:        #E2E8F0;
  --text:          #0F172A;
  --text-muted:    #64748B;
  --radius:        12px;
  --sidebar-w:     240px;
}

/* Тёмная тема */
:root.dark {
  --bg:            #0F172A;
  --surface:       #1E293B;
  --border:        #334155;
  --text:          #F1F5F9;
  --text-muted:    #94A3B8;
  --primary-light: #1E3A5F;
}
```

---

## API Reference

### Авторизация

```http
POST /api/auth/login/
Content-Type: application/json

{ "username": "admin", "password": "password" }

→ { "token": "abc123...", "username": "admin" }
```

```http
POST /api/auth/logout/
Authorization: Token abc123...
```

---

### Товары

```http
# Список с фильтрацией
GET /api/products/?category=1&min_price=1000&max_price=50000&in_stock=true&ordering=-price

# Создать (multipart/form-data для изображения)
POST /api/products/
Authorization: Token ...
Content-Type: multipart/form-data

name, description, price, stock, category, image(file)

# Обновить
PATCH /api/products/:id/
Authorization: Token ...

# Удалить
DELETE /api/products/:id/
Authorization: Token ...
```

---

### Рейтинг товаров

```http
POST /api/products/:id/rate/
Content-Type: application/json

{ "score": 4 }

→ обновлённый Product с average_rating и rating_count
```

---

### Рекомендации

```http
GET /api/products/:id/recommendations/

→ { "recommendations": [Product, Product, Product, Product] }
```

---

### Категории

```http
GET  /api/categories/           # публичный
POST /api/categories/           # admin
     { "name": "Электроника" }
```

---

### Заказы

```http
# Создать заказ (анонимный — поля необязательны)
POST /api/orders/
Content-Type: application/json

{
  "customer_name": "Димаш",     # опционально
  "customer_phone": "+77001234567",  # опционально
  "items": [
    { "product": 1, "quantity": 2, "price_at_order": "3500.00" }
  ]
}

→ { "id": 1, "tracking_code": "X7K2-9QMN", "total": "7000.00", ... }

# Список (admin)
GET /api/orders/
Authorization: Token ...

# Обновить статус
PATCH /api/orders/:id/
Authorization: Token ...
{ "status": "confirmed" }

# Отследить по коду (публичный)
GET /api/orders/track/X7K2-9QMN/

# Экспорт в Excel
GET /api/orders/export/
Authorization: Token ...
→ orders.xlsx файл
```

Статусы: `new` → `confirmed` → `delivered` / `cancelled`

---

### Статистика

```http
# Дашборд
GET /api/stats/
Authorization: Token ...

→ {
    "total_revenue": "157000.00",
    "total_orders": 12,
    "new_orders": 3,
    "low_stock_count": 2,
    "top_products": [{ "id": 1, "name": "Ноутбук", "sold": 5 }]
  }

# График продаж за 30 дней
GET /api/stats/chart/
Authorization: Token ...

→ [{ "date": "2024-04-01", "revenue": 15000.00 }, ...]
```

---

### AI-поиск

```http
# Текстовый поиск
POST /api/ai-search/
Content-Type: application/json

{ "query": "что-то для офиса недорогое" }

→ { "message": "Эти товары подойдут...", "products": [...] }

# Поиск по фото
POST /api/ai-search-by-image/
Content-Type: application/json

{ "image_base64": "base64строка..." }

→ { "message": "На фото похоже на...", "products": [...] }
```

---

### Журнал действий

```http
GET /api/audit-logs/
Authorization: Token ...

# Фильтр по типу объекта
GET /api/audit-logs/?entity=Product
GET /api/audit-logs/?entity=Order

→ [{ "id": 1, "action": "product_created", "entity": "Product", "description": "...", "created_at": "..." }]
```

Типы действий:
- `product_created` / `product_updated` / `product_deleted`
- `order_status_changed`
- `login`

---

## Фичи

### 1. AI Текстовый поиск
Покупатель описывает товар словами → Gemini анализирует список товаров → возвращает подходящие.
- Модель: `gemini-2.5-flash-preview`
- Эндпоинт: `POST /api/ai-search/`

### 2. AI Поиск по фото
Покупатель загружает фото → конвертируется в base64 → Gemini Vision определяет объект → находит похожие товары.
- Эндпоинт: `POST /api/ai-search-by-image/`

### 3. Голосовой поиск
Кнопка микрофона → Web Speech API (нативный браузерный) → распознаёт речь на русском → передаёт в AI-поиск.
- Только в браузерах с поддержкой SpeechRecognition (Chrome, Edge)
- Автоматически скрывается если браузер не поддерживает

### 4. Анонимный заказ + Отслеживание
Покупатель может заказать без имени и телефона.
- Система присваивает: `Аноним #4821`
- Генерируется уникальный код: `X7K2-9QMN`
- QR-код ведёт на страницу отслеживания `/shop/track/X7K2-9QMN`
- Страница `/shop/track` — поле для ввода кода → показывает статус и состав заказа

### 5. Рейтинг товаров
- 5 звёзд, интерактивные на витрине и странице товара
- Анонимный (по session_key)
- Одна оценка на товар с одного браузера (localStorage)
- Статичные звёзды в админке
- Сортировка по рейтингу в каталоге

### 6. Рекомендации
На странице товара → "Похожие товары":
1. Ищет товары которые чаще всего покупают вместе с этим
2. Добирает из той же категории
3. Добирает случайные если мало
- Горизонтальный скролл, 4 карточки

### 7. Telegram-бот
При каждом новом заказе → бот отправляет сообщение в Telegram:
```
🛍 Новый заказ #15
👤 Клиент: Димаш
📞 Телефон: +77001234567
💰 Сумма: 157 000 ₸
📦 Ноутбук x1, Мышь x2
🔑 Код: X7K2-9QMN
```
Настройка: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` в `.env`

### 8. График продаж
На дашборде — линейный график выручки за последние 30 дней.
- Chart.js, синяя линия с заливкой
- Все дни включая нулевые

### 9. Экспорт в Excel
Кнопка "Экспорт Excel" в разделе заказов → скачивается `orders.xlsx`.
- Колонки: ID, Клиент, Телефон, Статус, Сумма, Дата, Состав
- Синяя шапка, жирный текст

### 10. Страница товара
`/shop/product/:id` — детальная страница:
- Большое изображение
- Описание, категория, рейтинг
- Выбор количества
- Рекомендации внизу

### 11. Фильтрация и сортировка
В каталоге и админке:
- По категории
- По цене (мин/макс)
- Только в наличии
- Сортировка: цена ↑↓, новинки, рейтинг

### 12. Тёмная тема
Переключатель в шапке витрины и в сайдбаре админки.
- Сохраняется в localStorage
- Все цвета через CSS-переменные — работает везде

### 13. Skeleton загрузка
Анимированные заглушки пока грузятся данные.
- Каталог: 8 skeleton-карточек
- Дашборд: skeleton stat-карточки
- Заказы: skeleton строки таблицы

### 14. Онбординг-тур
При первом визите на витрину — автоматический тур через intro.js.
- 5 шагов с подсказками
- Можно перезапустить через кнопку `?` в хедере
- Запоминается в localStorage

### 15. Журнал действий (Аудит)
`/admin/audit` — все действия в системе:
- Создание/редактирование/удаление товаров
- Смена статусов заказов
- Входы в систему
- IP-адрес, пользователь, время
- Авто-обновление каждые 30 секунд

---

## Критерии проекта — покрытие

| Критерий | Реализация |
|----------|-----------|
| 4+ модели | Category, Product, Order, OrderItem, ProductRating, AuditLog |
| 2+ ForeignKey | Product→Category, OrderItem→Order, OrderItem→Product, ProductRating→Product, AuditLog→User |
| 2 Serializer | LoginSerializer, StatsSerializer |
| 2 ModelSerializer | ProductSerializer, OrderSerializer |
| 2 FBV | login_view, dashboard_stats (+ ai_search, chart_stats, export_orders, rate_product, track_order, recommendations) |
| 2 CBV | ProductListCreateView, OrderListCreateView (+ ProductDetailView, OrderDetailView, CategoryListCreateView, AuditLogListView) |
| JWT auth | DRF TokenAuthentication |
| request.user | AuditLog, logout |
| CORS | django-cors-headers |
| Angular 3+ routes | 8 роутов |
| 4+ ngModel | login, product form, order form, search, filters, rating |
| 4+ API events | GET products, POST login, POST order, GET stats, AI search, rating, recommendations |
| JWT interceptor | auth.interceptor.ts |
| Error handling | все запросы с error callback |
| price_at_order | DecimalField |
