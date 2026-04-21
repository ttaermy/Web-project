# Token:   message @BotFather on Telegram → /newbot
# Chat ID: message @userinfobot on Telegram
import requests
from django.conf import settings


def send_order_notification(order):
    token   = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    chat_id = getattr(settings, 'TELEGRAM_CHAT_ID', None)
    if not token or not chat_id:
        return

    items_text = ', '.join(
        f'{item.product.name} x{item.quantity}'
        for item in order.items.all()
        if item.product
    )

    text = (
        f'🛍 Новый заказ #{order.id}\n'
        f'👤 Клиент: {order.customer_name}\n'
        f'📞 Телефон: {order.customer_phone}\n'
        f'💰 Сумма: {order.total} ₸\n'
        f'📦 Состав: {items_text}\n'
        f'🔑 Код: {order.tracking_code}'
    )

    try:
        requests.post(
            f'https://api.telegram.org/bot{token}/sendMessage',
            json={'chat_id': chat_id, 'text': text},
            timeout=5,
        )
    except Exception:
        pass
