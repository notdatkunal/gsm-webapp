# myapp/urls.py
from django.urls import path
from .views import page1, page2, page3,page4
from . import views

urlpatterns = [
    path('', views.index, name='page1'),
    path('page1/', page1, name='page1'),
    path('page2/', page2, name='page2'),
    path('page3/', page3, name='page3'),
    path('page4/', page4, name='page4'),
]