from django.shortcuts import redirect, render
from datetime import datetime
import requests
from faker import Faker
fake = Faker()
import random
# Create your views here.
def create_fake_students(num):
    url = "http://127.0.0.1:8000/Students/"
    for _ in range(num):
      data = {
          "first_name": fake.name(),
          "last_name":"",
          "age":random.randint(5,20),
          "address": fake.address()[0:10],
          'email':fake.email(),
          'blood_group':'O+ve',
          "city": fake.city(),
          "state": fake.state(),
          "country": fake.country(),
          "pincode": "500080",
          "phone_number": "8080808080"
      }
      response = requests.post(url, json=data)
      if response.status_code == 200:
          print(f"Student created successfully: {response.json()}")
      else:
          print(f"Failed to create student. Status code: {response.status_code}, Response: {response.text}")
          print("")
          print("")
def student(request):
  print("start",datetime.now())
  url = 'http://127.0.0.1:8000/Students/'
  response = requests.get(url)
  if response.status_code == 200:
    data = response.json()
    payload = {
      'student_data': data
    }
    print("End",datetime.now())
    return render(request, 'students.html', payload)
  else:
        print("error End",datetime.now())
        # Handle the error case, e.g., return an error page or redirect
        return redirect("/students/")
  
