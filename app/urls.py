from django.urls import path
from .views import dashboard, students, staffs, login, logout, registration
from . import views

urlpatterns = [
    path('', login, name='login'),
    path('registration/', registration, name='registration'),
    path('logout/', logout, name='logout'),
    path('dashboard/', dashboard, name='dashboard'),
    path('students/', students, name='students'),
    path('staffs/', staffs, name='staffs')
]