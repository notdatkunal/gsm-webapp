# myapp/urls.py
from django.urls import path
from .views import dashboard, students, staffs
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('dashboard/', dashboard, name='dashboard'),
    path('students/', students, name='students'),
    path('staffs/', staffs, name='staffs')
]