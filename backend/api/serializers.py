
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Category, Product, Order, OrderItem


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data['username'],
            password=data['password']
        )
        if not user:
            raise serializers.ValidationError('Неверный логин или пароль')
        data['user'] = user
        return data


class StatsSerializer(serializers.Serializer):
    total_revenue   = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_orders    = serializers.IntegerField()
    new_orders      = serializers.IntegerField()
    low_stock_count = serializers.IntegerField()
    top_products    = serializers.ListField(child=serializers.DictField())


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'description',
            'price', 'stock',
            'category', 'category_name',
            'image', 'image_url',
            'created_at'
        ]
        extra_kwargs = {
            'image': {'required': False}  # ← не обязательное
        }

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_order']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'customer_name', 'customer_phone',
            'status', 'total', 'created_at', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        total = sum(
            item['price_at_order'] * item['quantity']
            for item in items_data
        )
        
        order = Order.objects.create(**validated_data, total=total)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
            product = item_data['product']
            product.stock -= item_data['quantity']
            product.save()

        return order