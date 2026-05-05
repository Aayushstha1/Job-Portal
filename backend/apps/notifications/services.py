from apps.notifications.models import Notification


def create_notification(recipient, notification_type, title, message, payload=None):
    return Notification.objects.create(
        recipient=recipient,
        type=notification_type,
        title=title,
        message=message,
        payload=payload or {},
    )
