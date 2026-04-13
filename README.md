# Web-project

Our team members:
1.Amangeldi Dinmukhammed
2.Tulebayeva Tomiris
3.Yerdauit Yerlanuly


#  Inventory Shop

Fullstack-система управления магазином с клиентской витриной, админ-панелью и AI-поиском товаров.

---

## Стек

| Слой | Технология |
|------|-----------|
| Backend | Django 4 + Django REST Framework |
| Авторизация | DRF Token Authentication |
| Frontend | Angular 17 (standalone components, signals) |
| Стили | SCSS + CSS Custom Properties |
| AI | Google Gemini 2.0 Flash API |
| Загрузка файлов | Django MediaFiles + FormData |

---

## Структура проекта

```
inventory-shop/
├── backend/
│   ├── api/
│   │   ├── models.py         # Category, Product, Order, OrderItem
│   │   ├── serializers.py    # 2 Serializer + 2 ModelSerializer
│   │   ├── views.py          # 3 FBV + 4 CBV
│   │   └── urls.py
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── .env                  # GEMINI_API_KEY (не в репо)
│   └── manage.py
│
└── frontend/
    └── src/app/
        ├── core/
        │   ├── services/     # auth, product, order, stats, cart, ai-search
        │   ├── interceptors/ # auth.interceptor.ts
        │   └── guards/       # auth.guard.ts
        ├── shared/
        │   └── interfaces/   # product, order, stats
        ├── admin/
        │   ├── layout/       # сайдбар + router-outlet
        │   ├── dashboard/    # статистика
        │   ├── products/     # CRUD товаров
        │   └── orders/       # управление заказами
        ├── shop/
        │   ├── layout/       # хедер + footer
        │   ├── catalog/      # витрина + AI-поиск
        │   └── cart/         # корзина + оформление
        └── login/            # авторизация
```

---

## Быстрый старт

### Требования

- Python 3.10+
- Node.js 18+
- Angular CLI 17+

```bash
npm install -g @angular/cli
```

---

### Backend

```bash
cd backend

# Виртуальное окружение
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac / Linux

# Зависимости
pip install django djangorestframework django-cors-headers python-dotenv requests pillow

# .env файл
echo GEMINI_API_KEY=твой_ключ > .env

# Миграции и суперпользователь
python manage.py migrate
python manage.py createsuperuser

# Запуск
python manage.py runserver
```

Backend: `http://127.0.0.1:8000`

---

### Frontend

```bash
cd frontend
npm install
ng serve
```

Frontend: `http://localhost:4200`

---

## Страницы

### Клиентская часть (без авторизации)

| Роут | Описание |
|------|---------|
| `/shop/catalog` | Каталог товаров + AI-поиск |
| `/shop/cart` | Корзина + оформление заказа |

### Админ-панель (требует авторизацию)

| Роут | Описание |
|------|---------|
| `/login` | Вход в систему |
| `/admin/dashboard` | Статистика: выручка, заказы, топ товары |
| `/admin/products` | CRUD товаров, загрузка изображений, фильтрация |
| `/admin/orders` | Просмотр заказов, смена статуса |

---

## API

### Авторизация

```http
POST /api/auth/login/
Content-Type: application/json

{ "username": "admin", "password": "password" }
```

```http
POST /api/auth/logout/
Authorization: Token <token>
```

---

### Товары

```http
GET  /api/products/          # список (публичный)
POST /api/products/          # создать (admin)
GET  /api/products/:id/      # один товар (публичный)
PATCH /api/products/:id/     # обновить (admin)
DELETE /api/products/:id/    # удалить (admin)
```

---

### Категории

```http
GET  /api/categories/        # список (публичный)
POST /api/categories/        # создать (admin)
```

---

### Заказы

```http
POST /api/orders/            # создать (публичный — клиент)
GET  /api/orders/            # список (admin)
GET  /api/orders/:id/        # один заказ (admin)
PATCH /api/orders/:id/       # обновить статус (admin)
```

Пример создания заказа:

```json
{
  "customer_name": "Димаш",
  "customer_phone": "+77001234567",
  "items": [
    { "product": 1, "quantity": 2, "price_at_order": "3500.00" }
  ]
}
```

Статусы заказа: `new` → `confirmed` → `delivered` / `cancelled`

---

### Статистика

```http
GET /api/stats/
Authorization: Token <token>
```

Ответ:

```json
{
  "total_revenue": "157000.00",
  "total_orders": 5,
  "new_orders": 2,
  "low_stock_count": 1,
  "top_products": [
    { "id": 1, "name": "Ноутбук", "sold": 3 }
  ]
}
```

---

### AI-поиск

```http
POST /api/ai-search/
Content-Type: application/json

{ "query": "что-то для офиса недорогое" }
```

Ответ:

```json
{
  "message": "Эти товары подойдут для офисной работы",
  "products": [ ... ]
}
```

---

## Модели

### Category
| Поле | Тип |
|------|-----|
| id | AutoField |
| name | CharField |

### Product
| Поле | Тип |
|------|-----|
| id | AutoField |
| name | CharField |
| description | TextField |
| price | DecimalField |
| stock | PositiveIntegerField |
| category | ForeignKey → Category |
| image | ImageField |
| created_at | DateTimeField |

### Order
| Поле | Тип |
|------|-----|
| id | AutoField |
| customer_name | CharField |
| customer_phone | CharField |
| status | CharField (new/confirmed/delivered/cancelled) |
| total | DecimalField |
| created_at | DateTimeField |

### OrderItem
| Поле | Тип |
|------|-----|
| id | AutoField |
| order | ForeignKey → Order |
| product | ForeignKey → Product |
| quantity | PositiveIntegerField |
| price_at_order | DecimalField |

---

## Переменные окружения

Создай файл `backend/.env`:

```env
GEMINI_API_KEY=получи на aistudio.google.com
```

## Критерии проекта

| Критерий | Реализация |
|----------|-----------|
| 4+ модели | Category, Product, Order, OrderItem |
| 2+ ForeignKey | Product→Category, OrderItem→Order, OrderItem→Product |
| 2 Serializer | LoginSerializer, StatsSerializer |
| 2 ModelSerializer | ProductSerializer, OrderSerializer |
| 2 FBV | login_view, dashboard_stats |
| 2 CBV | ProductListCreateView, OrderListCreateView + др. |
| JWT auth | DRF TokenAuthentication |
| request.user | logout привязан к пользователю |
| CORS | django-cors-headers |
| Postman collection | /postman/ в репо |
| Angular 3+ routes | 6 роутов |
| 4+ ngModel | login, product form, order form, search |
| 4+ API events | GET products, POST login, POST order, GET stats, AI search |
| JWT interceptor | auth.interceptor.ts |
| Error handling | все запросы обёрнуты в try/catch + error callback |
