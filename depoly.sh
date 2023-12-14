# create all command which required to deploy the application
#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
gunicorn GSM_Webapp.wsgi:application --bind 0.0.0.0:8000 --workers 3
