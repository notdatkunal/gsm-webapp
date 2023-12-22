import os
from django.core.wsgi import get_wsgi_application

settings_module = 'main.deployment' if 'WEBSITE_HOSTNAME' in os.environ else 'main.settings'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

application = get_wsgi_application()
