from django.db import models
from django.conf import settings
import random
import string

class Category(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name


class Product(models.Model):
    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    stock       = models.PositiveIntegerField(default=0)
    category    = models.ForeignKey(
                    Category,
                    on_delete=models.SET_NULL,
                    null=True,
                    related_name='products'
                  )
    image       = models.ImageField(upload_to='products/', blank=True, null=True)  # ← новое
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'

    def __str__(self):
        return self.name

    @property
    def average_rating(self):
        avg = self.ratings.aggregate(avg=models.Avg('score'))['avg']
        return round(float(avg), 1) if avg else 0.0

    @property
    def rating_count(self):
        return self.ratings.count()


class Order(models.Model):
    STATUS_CHOICES = [
        ('new',       'Новый'),
        ('confirmed', 'Подтверждён'),
        ('delivered', 'Доставлен'),
        ('cancelled', 'Отменён'),
    ]

    customer_name  = models.CharField(max_length=200, blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    status         = models.CharField(
                       max_length=20,
                       choices=STATUS_CHOICES,
                       default='new'
                     )
    total          = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at     = models.DateTimeField(auto_now_add=True)
    tracking_code  = models.CharField(max_length=12, unique=True, blank=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.tracking_code:
            chars = string.ascii_uppercase + string.digits
            part1 = ''.join(random.choices(chars, k=4))
            part2 = ''.join(random.choices(chars, k=4))
            self.tracking_code = f'{part1}-{part2}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Заказ #{self.id} — {self.customer_name}'


class OrderItem(models.Model):
    order          = models.ForeignKey(
                       Order,
                       on_delete=models.CASCADE,
                       related_name='items'
                     )
    product        = models.ForeignKey(
                       Product,
                       on_delete=models.SET_NULL,
                       null=True,
                       related_name='order_items'
                     )
    quantity       = models.PositiveIntegerField()
    price_at_order = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'


class ProductRating(models.Model):
    product     = models.ForeignKey(
                    Product,
                    on_delete=models.CASCADE,
                    related_name='ratings'
                  )
    session_key = models.CharField(max_length=100)
    score       = models.PositiveSmallIntegerField()
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'session_key')

    def __str__(self):
        return f'{self.product.name} — {self.score}/5'


class AuditLog(models.Model):
    user        = models.ForeignKey(
                    settings.AUTH_USER_MODEL,
                    on_delete=models.SET_NULL,
                    null=True, blank=True
                  )
    action      = models.CharField(max_length=50)
    entity      = models.CharField(max_length=50)
    entity_id   = models.PositiveIntegerField(null=True)
    description = models.TextField()
    ip_address  = models.GenericIPAddressField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering     = ['-created_at']
        verbose_name = 'Лог'
        verbose_name_plural = 'Логи'

    def __str__(self):
        return f'{self.action} — {self.entity} #{self.entity_id}'