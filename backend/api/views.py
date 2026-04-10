
from rest_framework                 import generics, permissions, status
from rest_framework.decorators      import api_view, permission_classes
from rest_framework.response        import Response
from rest_framework.authtoken.models import Token
from django.db.models               import Sum, Count
from .models                        import Product, Order, Category
from .serializers                   import (
    LoginSerializer, StatsSerializer,
    ProductSerializer, OrderSerializer, CategorySerializer
)
import requests
import json
from django.conf import settings

#fbv1
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user  = serializer.validated_data['user']
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token':    token.key,
        'username': user.username,
    })

#fbv2
@api_view(['POST'])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'detail': 'Вы вышли из системы'})

#fbv3
@api_view(['GET'])
def dashboard_stats(request):
    from django.db.models import F
    
    total_revenue = Order.objects.filter(
        status__in=['confirmed', 'delivered']
    ).aggregate(total=Sum('total'))['total'] or 0

    total_orders = Order.objects.count()
    new_orders   = Order.objects.filter(status='new').count()

    low_stock_count = Product.objects.filter(stock__lte=5).count()

    top_products = (
        Product.objects
        .annotate(sold=Sum('order_items__quantity'))
        .filter(sold__isnull=False)
        .order_by('-sold')[:5]
        .values('id', 'name', 'sold')
    )

    data = {
        'total_revenue':   total_revenue,
        'total_orders':    total_orders,
        'new_orders':      new_orders,
        'low_stock_count': low_stock_count,
        'top_products':    list(top_products),
    }

    serializer = StatsSerializer(data)
    return Response(serializer.data)

# fbv 4 - ai search
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def ai_search(request):
    query = request.data.get('query', '').strip()
    
    if not query:
        return Response(
            {'error': 'Введите поисковый запрос'},
            status=status.HTTP_400_BAD_REQUEST
        )

    products = Product.objects.select_related('category').filter(stock__gt=0)
    products_list = [
        {
            'id':       p.id,
            'name':     p.name,
            'price':    float(p.price),
            'stock':    p.stock,
            'category': p.category.name if p.category else '',
            'description': p.description,
        }
        for p in products
    ]

    # Промпт для Gemini
    prompt = f"""
Ты — помощник в магазине. Тебе дан список товаров и запрос покупателя.
Верни ТОЛЬКО валидный JSON без лишнего текста, без markdown, без блоков кода.
Запрос покупателя: "{query}"
Список товаров:
{json.dumps(products_list, ensure_ascii=False)}
Ответ должен быть строго в таком формате:
{{
  "ids": [1, 2, 3],
  "message": "Короткий комментарий на русском почему эти товары подходят"
}}
Если ничего не подходит:
{{
  "ids": [],
  "message": "Не нашёл подходящих товаров"
}}
"""
    try:
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={settings.GEMINI_API_KEY}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{'parts': [{'text': prompt}]}],
                'generationConfig': {
                    'temperature': 0.3, 
                }
            },
            timeout=15
        )
        response.raise_for_status()
        data = response.json()
        raw_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
        result = json.loads(raw_text)
        found_ids     = result.get('ids', [])
        found_products = Product.objects.filter(id__in=found_ids).select_related('category')
        return Response({
            'message':  result.get('message', ''),
            'products': ProductSerializer(found_products, many=True).data
        })

    except json.JSONDecodeError:
        return Response(
            {'error': 'Gemini вернул неожиданный формат'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except requests.exceptions.Timeout:
        return Response(
            {'error': 'Gemini не ответил вовремя'},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
#cbv1
class ProductListCreateView(generics.ListCreateAPIView):
    queryset           = Product.objects.select_related('category').all()
    serializer_class   = ProductSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

#cbv2
class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset         = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


#cbv3
class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]  
        return [permissions.IsAuthenticated()]  
    def get_queryset(self):
        return Order.objects.prefetch_related('items__product').all()


#cbv4
class OrderDetailView(generics.RetrieveUpdateAPIView):
    queryset         = Order.objects.prefetch_related('items__product').all()
    serializer_class = OrderSerializer

#cbv5
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset         = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    