"""
supabase_manager.py
Supabase Database Manager for 500K+ Products
"""

import os
import logging
from typing import List, Dict, Any, Optional, Tuple
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class SupabaseManager:
    """Production-ready Supabase manager"""
    
    BATCH_SIZE = 500
    FREE_TIER_LIMIT_MB = 500
    WARNING_THRESHOLD = 0.85
    
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
        
        self.supabase: Client = create_client(url, key)
        logger.info("SupabaseManager initialized")
    
    def bulk_upsert_products(self, products: List[Dict[str, Any]]) -> Tuple[int, List[Dict]]:
        """Bulk upsert with on_conflict on shopee_link"""
        if not products:
            return 0, []
        
        inserted = []
        total = len(products)
        
        for i in range(0, total, self.BATCH_SIZE):
            batch = products[i:i + self.BATCH_SIZE]
            batch_num = i // self.BATCH_SIZE + 1
            
            try:
                result = self.supabase.table("affiliate_products").upsert(
                    batch,
                    on_conflict="shopee_link"
                ).execute()
                
                if result.data:
                    inserted.extend(result.data)
                    logger.info(f"✓ Batch {batch_num}: {len(result.data)} products")
            except Exception as e:
                logger.error(f"✗ Batch {batch_num} failed: {e}")
                for item in batch:
                    try:
                        res = self.supabase.table("affiliate_products").upsert([item], on_conflict="shopee_link").execute()
                        if res.data:
                            inserted.extend(res.data)
                    except Exception as inner_e:
                        logger.error(f"Failed: {inner_e}")
        
        logger.info(f"Total: {len(inserted)}/{total}")
        return len(inserted), inserted
    
    def add_product_model_mappings(self, product_id: int, model_slugs: List[str]) -> bool:
        """Add many-to-many mappings"""
        if not model_slugs:
            return True
        
        mappings = [{"product_id": product_id, "model_slug": slug} for slug in set(model_slugs)]
        
        try:
            self.supabase.table("product_model_mapping").upsert(mappings).execute()
            return True
        except Exception as e:
            logger.error(f"Mapping failed: {e}")
            return False
    
    def estimate_storage_usage(self) -> Dict[str, Any]:
        """Estimate DB size using row counting"""
        try:
            result = self.supabase.rpc("estimate_database_size").execute()
            
            if result.data:
                data = result.data[0]
                estimated_mb = float(data.get('estimated_mb', 0))
                product_count = data.get('product_count', 0)
            else:
                product_res = self.supabase.table("affiliate_products").select("id", count="exact").execute()
                product_count = product_res.count or 0
                estimated_mb = ((product_count * 5) * 1.3) / 1024
            
            usage_percent = (estimated_mb / self.FREE_TIER_LIMIT_MB) * 100
            
            stats = {
                'product_count': product_count,
                'estimated_mb': round(estimated_mb, 2),
                'usage_percent': round(usage_percent, 1),
                'needs_upgrade': usage_percent >= 85
            }
            
            if stats['needs_upgrade']:
                logger.warning(f"⚠️  DB NEAR LIMIT: {stats['estimated_mb']} MB ({stats['usage_percent']}%)")
            
            return stats
        except Exception as e:
            logger.error(f"Estimation failed: {e}")
            return {'product_count': 0, 'estimated_mb': 0, 'usage_percent': 0, 'needs_upgrade': False}
