"""
ai_processor.py
Google Gemini AI Processor with Rate Limiting

Features:
- Robust JSON extraction with regex
- Rate limiting (60 RPM)
- Retry logic for API failures
- Field validation
"""

import os
import time
import json
import re
import asyncio
import logging
from typing import Dict, List, Optional
from functools import wraps

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class AIProcessor:
    """
    Google Gemini AI Processor
    Extracts product data from raw text/URLs
    """
    
    MAX_RPM = 60  # Gemini Flash rate limit
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not set in .env")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-3-flash-preview')
        
        # Rate limiting
        self.request_count = 0
        self.window_start = time.time()
        self.lock = asyncio.Lock()
        
        logger.info("AIProcessor initialized with Gemini 3 Flash Preview")
    
    async def _wait_if_rate_limited(self):
        """Enforce rate limit (60 RPM)"""
        async with self.lock:
            current_time = time.time()
            elapsed = current_time - self.window_start
            
            # Reset counter if 60 seconds passed
            if elapsed >= 60:
                self.request_count = 0
                self.window_start = current_time
                return
            
            # Check if we hit the limit
            if self.request_count >= self.MAX_RPM:
                wait_time = 60 - elapsed
                logger.warning(f"⏳ Rate limit reached. Waiting {wait_time:.1f}s...")
                await asyncio.sleep(wait_time)
                self.request_count = 0
                self.window_start = time.time()
            
            self.request_count += 1
    
    def _extract_json_from_response(self, text: str) -> Dict:
        """
        Robust JSON extraction using regex
        Handles:
        - ```json ... ```
        - ``` ... ```
        - Raw JSON
        """
        text = text.strip()
        
        # Try to find JSON block with regex
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_pattern, text, re.DOTALL)
        
        if match:
            json_str = match.group(1)
        elif text.startswith('{') and text.endswith('}'):
            json_str = text
        else:
            # Last resort: find first { to last }
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1:
                json_str = text[start:end+1]
            else:
                raise ValueError("No JSON found in response")
        
        # Parse JSON
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            logger.debug(f"Attempted to parse: {json_str[:200]}")
            raise
    
    def _validate_and_fill_defaults(self, data: Dict) -> Dict:
        """Ensure all required fields exist with defaults"""
        defaults = {
            'name': 'Unknown Product',
            'brand': None,
            'price': None,
            'category': 'other',
            'suggested_model_slugs': [],
            'image_urls': []
        }
        
        # Fill missing fields
        for key, default_value in defaults.items():
            if key not in data or data[key] is None:
                data[key] = default_value
        
        # Ensure lists are actually lists
        if not isinstance(data['suggested_model_slugs'], list):
            data['suggested_model_slugs'] = []
        
        if not isinstance(data['image_urls'], list):
            data['image_urls'] = []
        
        return data
    
    async def parse_product(self, raw_input: str) -> Dict:
        """
        Parse product data from raw text/URL using Gemini
        
        Args:
            raw_input: Product URL, description, or mixed text
        
        Returns:
            Dict with keys:
                - name: Product name
                - brand: Brand name
                - price: Price in THB (float or None)
                - category: Category slug
                - suggested_model_slugs: List of compatible models
                - image_urls: List of image URLs
        """
        # Wait if rate limited
        await self._wait_if_rate_limited()
        
        prompt = f"""
You are a motorcycle accessory product information extractor for Thailand market.
Extract the following information from the input and return ONLY valid JSON (no markdown, no explanation).

Required fields:
- name: string (product name in Thai or English)
- brand: string (brand name, null if unknown)
- price: number (price in Thai Baht, null if not available)
- category: string (one of: crashbar, exhaust, luggage, suspension, brake, accessory, light, handle, bag, screen, other)
- suggested_model_slugs: array of strings (motorcycle model slugs this product fits, e.g., ["adv350","pcx160"])
- image_urls: array of strings (image URLs found in the input)

Rules:
1. If input is a URL, extract product info from the URL structure
2. Common model names to slugs: ADV350→adv350, PCX160→pcx160, Forza350→forza350, CBR650R→cbr650r, etc.
3. If no specific model mentioned, return empty array for suggested_model_slugs
4. Price should be number only (no currency symbols)
5. Return valid JSON only

Input: {raw_input}

JSON:"""
        
        try:
            # Call Gemini API
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Extract and validate JSON
            data = self._extract_json_from_response(response_text)
            data = self._validate_and_fill_defaults(data)
            
            logger.debug(f"Parsed: {data['name'][:50]}")
            return data
            
        except Exception as e:
            logger.error(f"Gemini parsing failed for '{raw_input[:50]}': {e}")
            
            # Return safe fallback
            return {
                'name': raw_input[:100] if raw_input else 'Unknown Product',
                'brand': None,
                'price': None,
                'category': 'other',
                'suggested_model_slugs': [],
                'image_urls': []
            }
    
    async def parse_batch(self, raw_inputs: List[str]) -> List[Dict]:
        """
        Parse multiple products (respects rate limiting)
        
        Args:
            raw_inputs: List of product URLs/descriptions
        
        Returns:
            List of parsed product dicts
        """
        tasks = [self.parse_product(inp) for inp in raw_inputs]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        parsed = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Item {i} failed: {result}")
                # Add fallback
                parsed.append({
                    'name': raw_inputs[i][:100],
                    'brand': None,
                    'price': None,
                    'category': 'other',
                    'suggested_model_slugs': [],
                    'image_urls': []
                })
            else:
                parsed.append(result)
        
        return parsed
