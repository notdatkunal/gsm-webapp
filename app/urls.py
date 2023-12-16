# myapp/urls.py
from django.urls import path
from .views import page1, page2
from . import views

urlpatterns = [
    path('page1/', page1, name='page1'),
    path('page2/', page2, name='page2'),
    path('', views.index, name='page1')
]
