from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('', include('demo.urls')),
    path('demo', include('demo.urls')),
    path('admin/', admin.site.urls),
]