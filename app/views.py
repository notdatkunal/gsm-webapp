# myapp/views.py
from django.shortcuts import render
from django.conf import settings

def dashboard(request):
    return render(request, 'dashboard.html')

def students(request):
    return render(request, 'students.html')

def staffs(request):
    return render(request, 'staffs.html')
