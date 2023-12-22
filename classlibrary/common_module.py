import requests
from django.http import HttpResponse
import os
from io import BytesIO
from azure.storage.blob import BlobServiceClient
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime, timedelta
from azure.storage.blob import BlobServiceClient,BlobSasPermissions,generate_blob_sas

def azure_connection():
    # from env take AZURE_STORAGE_CONNECTION_STRING
    connect_string = os.environ['AZURE_STORAGE_CONNECTION_STRING']
    # createing connecction for azure blob
    blob_service_client = BlobServiceClient.from_connection_string(connect_string)
    # return blob 
    return blob_service_client

class Data:
    def __init__(self,api_link) -> None:
        self.api_link = api_link

    def get_data_by_institute_id(self,url="",jwt="",params = {}):
        self.heared = {
            'accept': 'application/json',
            'Authorization': f'Bearer {jwt}'
        }
        self.total_url = self.api_link + url
        self.responce = requests.get(url=self.total_url ,params=params,headers=self.heared)
        if self.responce.status_code == 200:
            return self.responce.json()
        else:
            return HttpResponse("Something went wrong")


