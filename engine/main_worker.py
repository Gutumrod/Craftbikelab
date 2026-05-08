"""
main_worker.py
Master Orchestrator for 500K Product Processing

Features:
- Async processing with asyncio.gather
- Semaphore (10) for concurrency control
- Batch processing (500 products per batch)
- Progress tracking and error handling
- Storage monitoring
"""

import asyncio
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv

from r2_manager import R2Manager
from supabase_manager import SupabaseManager
from ai_processor import AIProcessor

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class MainWorker:
    """
    Production-ready orchestrator for processing 500K+ products
    Combines AI extraction, R2 image uploads, and Supabase storage
    """
    
    def __init__(self):
        self.supabase = SupabaseManager()
        self.r2 = R2Manager()
        self.ai = AIProcessor()
        
        # Concurrency control
        self.semaphore = asyncio.Semaphore(10)  # Max 10 concurrent tasks
        
        logger.info("MainWorker initialized")
    
    async def process_single_item(self, raw_input: str, index: int) -> Dict[str, Any]:
        """
        Process one product:
        1. AI extraction
        2. Image upload to R2
        3. Prepare data for Supabase
        
        Args:
            raw_input: Product URL or description
            index: Item index (for logging)
        
        Returns:
            Product data dict ready for upsert
        """
        async with self.semaphore:
            try:
                # Step 1: AI extraction
                product_info = await self.ai.parse_product(raw_input)
                
                # Step 2: Upload images to R2 (if any)
                image_urls_from_ai = product_info.pop('image_urls', [])
                uploaded_urls = []
                
                if image_urls_from_ai:
                    # Use a temporary product_id (will be replaced after insert)
                    temp_product_id = 999000000 + index
                    uploaded_urls = await self.r2.upload_multiple_from_urls(
                        image_urls_from_ai, 
                        temp_product_id
                    )
                
                # Step 3: Prepare data for Supabase
                product_data = {
                    'name': product_info.get('name'),
                    'brand': product_info.get('brand'),
                    'category': product_info.get('category', 'other'),
                    'price': product_info.get('price'),
                    'status': 'active',
                    
                    # Platform links (infer from raw_input)
                    'shopee_link': raw_input if 'shopee' in raw_input.lower() else None,
                    'lazada_link': raw_input if 'lazada' in raw_input.lower() else None,
                    'tiktok_link': raw_input if 'tiktok' in raw_input.lower() else None,
                    
                    # Images from R2
                    'image_urls': uploaded_urls,
                    
                    # Metadata
                    'metadata': {
                        'raw_input': raw_input,
                        'ai_extracted': product_info
                    }
                }
                
                # Store model_slugs separately for mapping later
                suggested_slugs = product_info.get('suggested_model_slugs', [])
                product_data['_suggested_slugs'] = suggested_slugs
                
                logger.debug(f"[{index}] Processed: {product_data['name'][:40]}")
                return product_data
                
            except Exception as e:
                logger.error(f"[{index}] Failed to process '{raw_input[:50]}': {e}")
                # Return minimal fallback
                return {
                    'name': raw_input[:100] if raw_input else 'Error Product',
                    'category': 'other',
                    'status': 'active',
                    'shopee_link': raw_input if 'shopee' in raw_input.lower() else None,
                    'metadata': {'error': str(e)},
                    '_suggested_slugs': []
                }
    
    async def process_batch(
        self, 
        raw_inputs: List[str], 
        batch_size: int = 500
    ):
        """
        Process products in batches
        
        Args:
            raw_inputs: List of product URLs/descriptions
            batch_size: Batch size for Supabase upsert (default 500)
        """
        total = len(raw_inputs)
        logger.info(f"🚀 Starting processing: {total} items")
        
        for batch_start in range(0, total, batch_size):
            batch_end = min(batch_start + batch_size, total)
            batch = raw_inputs[batch_start:batch_end]
            batch_num = batch_start // batch_size + 1
            total_batches = (total + batch_size - 1) // batch_size
            
            logger.info(f"📦 Batch {batch_num}/{total_batches}: Processing {len(batch)} items...")
            
            # Step 1: Process all items in batch concurrently
            tasks = [
                self.process_single_item(item, batch_start + idx) 
                for idx, item in enumerate(batch)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Step 2: Filter successful results
            product_list = []
            mapping_data = []  # (link, slugs) pairs
            
            for result in results:
                if isinstance(result, Exception):
                    logger.error(f"Task failed: {result}")
                    continue
                
                # Extract model_slugs before upsert
                suggested_slugs = result.pop('_suggested_slugs', [])
                link = result.get('shopee_link') or result.get('lazada_link') or result.get('tiktok_link')
                
                product_list.append(result)
                if link and suggested_slugs:
                    mapping_data.append((link, suggested_slugs))
            
            # Step 3: Bulk upsert to Supabase
            if product_list:
                count, upserted = self.supabase.bulk_upsert_products(product_list)
                logger.info(f"✅ Batch {batch_num}: Upserted {count}/{len(product_list)} products")
                
                # Step 4: Create model mappings
                # Map links to product_ids from upserted results
                link_to_id = {}
                for p in upserted:
                    link = p.get('shopee_link') or p.get('lazada_link') or p.get('tiktok_link')
                    if link:
                        link_to_id[link] = p['id']
                
                # Add mappings
                for link, slugs in mapping_data:
                    if link in link_to_id:
                        product_id = link_to_id[link]
                        self.supabase.add_product_model_mappings(product_id, slugs)
                
                logger.info(f"🔗 Created mappings for {len(mapping_data)} products")
            
            # Step 5: Check storage usage
            stats = self.supabase.estimate_storage_usage()
            
            if stats['needs_upgrade']:
                logger.warning("⚠️  Consider upgrading to Supabase Pro!")
        
        logger.info(f"🎉 Processing complete: {total} items processed")
    
    async def run(
        self, 
        input_file: str = None, 
        input_list: List[str] = None
    ):
        """
        Main entry point
        
        Args:
            input_file: Path to file with one URL/description per line
            input_list: Or provide list directly
        """
        if input_file:
            with open(input_file, 'r', encoding='utf-8') as f:
                raw_inputs = [line.strip() for line in f if line.strip()]
            logger.info(f"📄 Loaded {len(raw_inputs)} items from {input_file}")
        elif input_list:
            raw_inputs = input_list
        else:
            raise ValueError("Provide either input_file or input_list")
        
        await self.process_batch(raw_inputs)
        
        # Final storage check
        final_stats = self.supabase.estimate_storage_usage()
        logger.info(f"📊 Final stats: {final_stats}")


# ══════════════════════════════════════════════════════════════════════════════
# EXAMPLE USAGE
# ══════════════════════════════════════════════════════════════════════════════

async def main():
    """Example usage"""
    worker = MainWorker()
    
    # Test with sample data
    test_inputs = [
        "https://shopee.co.th/SW-Motech-EVO-Crash-Bar-Honda-ADV350",
        "Yoshimura R77 Full Exhaust System CBR650R",
        "กระเป๋าข้าง SW-Motech BLAZE สำหรับ Yamaha XMAX 300"
    ]
    
    await worker.run(input_list=test_inputs)
    
    # Or from file:
    # await worker.run(input_file="products.txt")


if __name__ == "__main__":
    asyncio.run(main())
