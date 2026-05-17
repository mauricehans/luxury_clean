import logging
from django.core.mail import EmailMessage
from django.conf import settings
from .models import Setting

logger = logging.getLogger(__name__)

def get_contact_email():
    """Retrieve the contact email from settings, or fallback to default."""
    try:
        contact_email = Setting.objects.get(key_name='contact_email').value
        if contact_email:
            return contact_email
    except Setting.DoesNotExist:
        pass
    return settings.DEFAULT_FROM_EMAIL

def send_notification_email(subject, body, attachments=None):
    """
    Sends an email with optional attachments.
    attachments: list of tuples (filename, content, content_type)
    """
    to_email = get_contact_email()
    
    if not to_email:
        logger.warning("No contact email configured to receive notifications.")
        return False
        
    try:
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        
        # Attach files
        if attachments:
            for filename, content, content_type in attachments:
                email.attach(filename, content, content_type)
                
        email.send(fail_silently=False)
        return True
    except Exception as e:
        logger.error(f"Failed to send email notification: {str(e)}")
        return False