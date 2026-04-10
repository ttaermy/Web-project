from django.db import models

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
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ('new',       'Новый'),
        ('confirmed', 'Подтверждён'),
        ('delivered', 'Доставлен'),
        ('cancelled', 'Отменён'),
    ]

    customer_name  = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    status         = models.CharField(
                       max_length=20,
                       choices=STATUS_CHOICES,
                       default='new'
                     )
    total          = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

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