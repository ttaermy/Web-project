
from django.urls import path
from . import views

urlpatterns = [
    #auth
    path('auth/login/',  views.login_view,  name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    #dashboard
    path('stats/',       views.dashboard_stats, name='stats'),
    path('stats/chart/', views.sales_chart,     name='stats-chart'),
    #products
    path('products/',                              views.ProductListCreateView.as_view(),  name='products'),
    path('products/<int:pk>/',                     views.ProductDetailView.as_view(),      name='product-detail'),
    path('products/<int:pk>/rate/',                views.rate_product,                     name='product-rate'),
    path('products/<int:pk>/recommendations/',     views.product_recommendations,          name='product-recommendations'),
    #orders
    path('orders/',                              views.OrderListCreateView.as_view(), name='orders'),
    path('orders/<int:pk>/',                     views.OrderDetailView.as_view(),     name='order-detail'),
    path('orders/export/',                       views.export_orders,                 name='orders-export'),
    path('orders/track/<str:tracking_code>/',    views.track_order,                   name='order-track'),
    #categories
    path('categories/', views.CategoryListCreateView.as_view(), name='categories'),
    #ai
    path('ai-search/',          views.ai_search,          name='ai-search'),
    path('ai-search-by-image/', views.ai_search_by_image, name='ai-search-by-image'),
    #audit
    path('audit-logs/', views.AuditLogListView.as_view(), name='audit-logs'),
]