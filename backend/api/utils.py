from .models import AuditLog


def log_action(request, action, entity, entity_id, description):
    try:
        user      = request.user if request.user.is_authenticated else None
        forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        ip        = forwarded.split(',')[0].strip() if forwarded else request.META.get('REMOTE_ADDR')
        AuditLog.objects.create(
            user=user,
            action=action,
            entity=entity,
            entity_id=entity_id,
            description=description,
            ip_address=ip,
        )
    except Exception:
        pass
