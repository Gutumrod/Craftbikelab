import boto3
from dotenv import load_dotenv
import os

load_dotenv()

account_id = os.getenv('R2_ACCOUNT_ID')
access_key_id = os.getenv('R2_ACCESS_KEY_ID')
secret_access_key = os.getenv('R2_SECRET_ACCESS_KEY')
bucket_name = os.getenv('R2_BUCKET')

print("="*50)
print("CLOUDFLARE R2 CONNECTION TEST")
print("="*50)
print()

print("Configuration Check:")
print(f"Account ID: {account_id[:8]}..." if account_id else "Account ID: Not found")
print(f"Access Key: {access_key_id[:8]}..." if access_key_id else "Access Key: Not found")
print(f"Bucket: {bucket_name}" if bucket_name else "Bucket: Not found")
print()

try:
    s3_client = boto3.client(
        's3',
        endpoint_url=f'https://{account_id}.r2.cloudflarestorage.com',
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name='auto'
    )

    print("Testing Connection...")
    response = s3_client.list_buckets()
    print("SUCCESS: Connected to Cloudflare R2!")
    print()

    print("Testing Bucket Access...")
    s3_client.head_bucket(Bucket=bucket_name)
    print(f"SUCCESS: Bucket '{bucket_name}' is accessible!")
    print()
    print("ALL TESTS PASSED!")

except Exception as e:
    print(f"ERROR: {e}")
