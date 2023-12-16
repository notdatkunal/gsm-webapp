# myapp/views.py
from django.shortcuts import render
from classlibrary.page_one_module import PageOneClass
from classlibrary.page_two_module import PageTwoClass

def index(request):
    x=10
    y=20
    my_instance = PageOneClass(x,y)
    result = my_instance.get_submission()
    return render(request, 'page1.html',{'result': result})

def page1(request):
    x=40
    y=20
    my_instance = PageOneClass(x,y)
    result = my_instance.get_submission()
    return render(request, 'page1.html',{'result': result})

def page2(request):
    x=40
    y=20
    my_instance = PageTwoClass(x,y)
    result = my_instance.get_multiplication()
    return render(request, 'page2.html',{'result': result})
