import os
from io import BytesIO
from azure.storage.blob import BlobServiceClient
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime, timedelta
from azure.storage.blob import BlobServiceClient,BlobSasPermissions,generate_blob_sas
from django.contrib import messages


class AzureConnection:
    def __init__(self,connection_string) -> None:
        self.connection_string = connection_string
        self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)

    def upload_to_blob(self,azure_file,azure_file_name,location):
        # takeing blob for store
        location = os.environ[location]
        try:
            # read file and convert it into bytes
            file_io = BytesIO( azure_file.read())
            # creating container in which we will save our files
            container_client = self.blob_service_client.get_container_client(container=location)
            # Creating a new block blob client using the local file name as the name to be used when uploaded
            blob_name = f"{azure_file_name}"
            # Upload the file to the blob
            blob_client = container_client.get_blob_client(blob=blob_name)
            # assigning blob_file and if blob_file is their it will overwrite
            blob_client.upload_blob(file_io, overwrite=True)
            return blob_client.url
        except Exception as e:
            print(f"Error uploading file to Azure Blob Storage: {e}")
            
    def download_blob(self,filename,location):
        location = os.environ[location]
        # takeing blob for store
        blob_service_client = self.blob_service_client
        # creating container in which we will saved our files
        container_client = blob_service_client.get_container_client(container=location)
        # getting blob data by its name
        blob_client = container_client.get_blob_client(blob=filename)
        # downloading blob and saving it locally
        blob_content = blob_client.download_blob()
        # returning downloaded content
        return blob_content.readall()

    def get_blob_sas(self,blob_name, location):
        client = self.blob_service_client
        location = os.environ[location]
        token = generate_blob_sas(
            account_name=client.account_name,
            account_key=client.credential.account_key,
            container_name=location,
            blob_name=blob_name,
            permission=BlobSasPermissions(read=True), 
            expiry=datetime.utcnow() + timedelta(hours=1),
        )
        azure_link =f'{client.account_name}.blob.core.windows.net'
        sas_url = f"https://{azure_link}/{location}/{blob_name}?{token}"
        return sas_url