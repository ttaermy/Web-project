
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Category, Product, Order, OrderItem, ProductRating, AuditLog
import random


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


class ProductRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductRating
        fields = ['id', 'product', 'score', 'created_at']


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AuditLog
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name  = serializers.CharField(source='category.name', read_only=True)
    image_url      = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    rating_count   = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'description',
            'price', 'stock',
            'category', 'category_name',
            'image', 'image_url',
            'average_rating', 'rating_count',
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

    def get_average_rating(self, obj):
        return obj.average_rating

    def get_rating_count(self, obj):
        return obj.rating_count

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
            'status', 'total', 'created_at', 'tracking_code', 'items'
        ]
        extra_kwargs = {
            'customer_name':  {'required': False, 'allow_null': True, 'allow_blank': True},
            'customer_phone': {'required': False, 'allow_null': True, 'allow_blank': True},
            'tracking_code':  {'read_only': True},
        }

    def create(self, validated_data):
        items_data = validated_data.pop('items')

        if not validated_data.get('customer_name'):
            validated_data['customer_name'] = f'Аноним #{random.randint(1000, 9999)}'

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