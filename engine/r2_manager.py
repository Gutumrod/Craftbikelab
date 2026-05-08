"""
r2_manager.py
Cloudflare R2 Storage Manager for Product Images

Features:
- Async image downloads with aiohttp
- Sync S3 uploads via run_in_executor
- Retry logic (3 attempts)
- Correct public URL generation
- Memory-efficient streaming
"""

import os
import uuid
import io
import asyncio
import logging
from typing import Optional, List
from functools import wraps

import aiohttp
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def retry_sync(max_retries=3, delay=1):
    """Decorator for retrying sync functions"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        logger.error(f"{func.__name__} failed after {max_retries} attempts: {e}")
                        raise
                    logger.warning(f"{func.__name__} attempt {attempt + 1} failed: {e}. Retrying...")
                    import time
                    time.sleep(delay * (attempt + 1))
            return None
        return wrapper
    return decorator


class R2Manager:
    """
    Cloudflare R2 Storage Manager
    Handles image uploads with retry logic and async downloads
    """
    
    def __init__(self):
        # R2 credentials
        self.endpoint = os.getenv("R2_ENDPOINT")
        self.access_key = os.getenv("R2_ACCESS_KEY")
        self.secret_key = os.getenv("R2_SECRET_KEY")
        self.bucket = os.getenv("R2_BUCKET")
        self.public_domain = os.getenv("R2_PUBLIC_DOMAIN")
        
        # Validate required env vars
        required = {
            "R2_ENDPOINT": self.endpoint,
            "R2_ACCESS_KEY": self.access_key,
            "R2_SECRET_KEY": self.secret_key,
            "R2_BUCKET": self.bucket,
            "R2_PUBLIC_DOMAIN": self.public_domain
        }
        
        missing = [k for k, v in required.items() if not v]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        
        # Initialize S3 client for R2
        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.endpoint,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            config=Config(
                signature_version='s3v4',
                retries={'max_attempts': 3, 'mode': 'adaptive'}
            )
        )
        
        logger.info(f"R2Manager initialized: bucket={self.bucket}, domain={self.public_domain}")
    
    def _generate_object_name(self, product_id: int, index: int, ext: str = 'jpg') -> str:
        """
        Generate unique object name for R2
        Format: products/{product_id}/{uuid}_{index}.{ext}
        """
        unique_id = uuid.uuid4().hex[:8]
        return f"products/{product_id}/{unique_id}_{index}.{ext}"
    
    def _get_extension_from_url(self, url: str, content_type: str = None) -> str:
        """Extract file extension from URL or content-type"""
        # Try from URL
        if '.' in url.split('/')[-1]:
            ext = url.split('.')[-1].split('?')[0].lower()
            if ext in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                return ext
        
        # Try from content-type
        if content_type:
            type_map = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'image/gif': 'gif',
                'image/webp': 'webp'
            }
            return type_map.get(content_type, 'jpg')
        
        return 'jpg'
    
    @retry_sync(max_retries=3, delay=2)
    def _upload_bytes_to_r2(
        self, 
        content: bytes, 
        object_name: str, 
        content_type: str = 'image/jpeg'
    ) -> str:
        """
        Upload bytes to R2 (sync function, call via run_in_executor)
        Returns: object_name on success
        """
        try:
            self.s3_client.upload_fileobj(
                io.BytesIO(content),
                self.bucket,
                object_name,
                ExtraArgs={
                    'ContentType': content_type,
                    'CacheControl': 'public, max-age=31536000'  # 1 year cache
                }
            )
            logger.debug(f"Uploaded to R2: {object_name}")
            return object_name
        except ClientError as e:
            logger.error(f"S3 ClientError uploading {object_name}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error uploading {object_name}: {e}")
            raise
    
    async def upload_from_url(
        self, 
        image_url: str, 
        product_id: int, 
        index: int = 0,
        timeout: int = 15
    ) -> Optional[str]:
        """
        Download image from URL and upload to R2 (async)
        
        Args:
            image_url: Source image URL
            product_id: Product ID for organizing files
            index: Image index (0 for main image, 1+ for additional)
            timeout: Download timeout in seconds
        
        Returns:
            Public URL on success, None on failure
        """
        try:
            # Download image async
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    image_url, 
                    timeout=aiohttp.ClientTimeout(total=timeout)
                ) as response:
                    if response.status != 200:
                        logger.warning(f"Failed to download {image_url}: HTTP {response.status}")
                        return None
                    
                    content = await response.read()
                    content_type = response.headers.get('Content-Type', 'image/jpeg')
                    
                    # Check if content is actually an image
                    if not content_type.startswith('image/'):
                        logger.warning(f"Invalid content type {content_type} for {image_url}")
                        return None
                    
                    # Check file size (max 10 MB)
                    if len(content) > 10 * 1024 * 1024:
                        logger.warning(f"Image too large ({len(content)/1024/1024:.1f} MB): {image_url}")
                        return None
            
            # Generate object name
            ext = self._get_extension_from_url(image_url, content_type)
            object_name = self._generate_object_name(product_id, index, ext)
            
            # Upload to R2 in thread pool (S3 client is sync)
            loop = asyncio.get_event_loop()
            uploaded_name = await loop.run_in_executor(
                None,
                self._upload_bytes_to_r2,
                content,
                object_name,
                content_type
            )
            
            # Generate public URL
            public_url = f"https://{self.public_domain}/{uploaded_name}"
            logger.info(f"Uploaded image {index} for product {product_id}: {public_url}")
            
            return public_url
            
        except asyncio.TimeoutError:
            logger.error(f"Timeout downloading {image_url}")
            return None
        except aiohttp.ClientError as e:
            logger.error(f"HTTP error downloading {image_url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error processing {image_url}: {e}")
            return None
    
    async def upload_multiple_from_urls(
        self, 
        image_urls: List[str], 
        product_id: int
    ) -> List[str]:
        """
        Upload multiple images concurrently
        
        Args:
            image_urls: List of source image URLs
            product_id: Product ID
        
        Returns:
            List of public URLs (successful uploads only)
        """
        tasks = [
            self.upload_from_url(url, product_id, idx) 
            for idx, url in enumerate(image_urls)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out None and exceptions
        public_urls = [
            url for url in results 
            if isinstance(url, str) and url is not None
        ]
        
        logger.info(f"Uploaded {len(public_urls)}/{len(image_urls)} images for product {product_id}")
        return public_urls
    
    def delete_image(self, object_name: str) -> bool:
        """Delete image from R2"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket, Key=object_name)
            logger.info(f"Deleted from R2: {object_name}")
            return True
        except ClientError as e:
            logger.error(f"Failed to delete {object_name}: {e}")
            return False
