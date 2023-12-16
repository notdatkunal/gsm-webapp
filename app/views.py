# myapp/views.py
from django.shortcuts import render
from django.conf import settings
from classlibrary.page_one_module import PageOneClass
from classlibrary.page_two_module import PageTwoClass

def index(request):
    my_instance = PageOneClass(10,20)
    result = my_instance.get_submission()
    api_endpoint = settings.API_ENDPOINT
    return render(request, 'page1.html',{'result': result,"api_endpoint": api_endpoint})

def page1(request):
    my_instance = PageOneClass(10,20)
    result = my_instance.get_submission()
    return render(request, 'page1.html',{'result': result})

def page2(request):
    x=40
    y=20
    my_instance = PageTwoClass(x,y)
    result = my_instance.get_multiplication()
    return render(request, 'page2.html',{'result': result})

def page3(request):
    return render(request, 'page3.html')

def page4(request):
    return render(request, 'page4.html')