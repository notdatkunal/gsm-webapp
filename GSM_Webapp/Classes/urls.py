
from django.contrib import admin
from django.urls import path,include
from Classes import views

urlpatterns = [
   path('classes/',views.classes,name='classes'),
   
]