
from django.urls import path
from . import views

urlpatterns = [
    #auth
    path('auth/login/',  views.login_view,  name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    #dashboard
    path('stats/', views.dashboard_stats, name='stats'),
    #products
    path('products/',     views.ProductListCreateView.as_view(), name='products'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(),  name='product-detail'),
    #orders
    path('orders/',          views.OrderListCreateView.as_view(), name='orders'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(),     name='order-detail'),
    #categories
    path('categories/', views.CategoryListCreateView.as_view(), name='categories'),
    #ai
    path('ai-search/', views.ai_search, name='ai-search'),
]