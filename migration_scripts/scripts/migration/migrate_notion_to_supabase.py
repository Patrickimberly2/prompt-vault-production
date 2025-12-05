"""
PromptVault Migration Script
Extract prompts from Notion and migrate to Supabase PostgreSQL database
"""

import os
import json
import re
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from supabase import create_client, Client
import requests
from time import sleep

# ================================================================
# CONFIGURATION
# ================================================================

# Notion Configuration
NOTION_API_VERSION = "2022-06-28"
NOTION_BASE_URL = "https://api.notion.com/v1"

# Supabase Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY"

# Rate limiting
NOTION_RATE_LIMIT_DELAY = 0.33  # 3 requests per second

# ================================================================
# DATA MODELS
# ================================================================

@dataclass
class Prompt:
    """Data model for a prompt"""
    name: str
    prompt_text: str
    prompt_type: Optional[str] = None
    ai_model: Optional[str] = "Universal"
    use_case: Optional[str] = None
    source: Optional[str] = None
    source_page_url: Optional[str] = None
    status: str = "active"
    priority: Optional[str] = None
    rating: Optional[int] = None
    notes: Optional[str] = None
    categories: List[str] = None
    
    def __post_init__(self):
        if self.categories is None:
            self.categories = []

# ================================================================
# NOTION API CLIENT
# ================================================================

class NotionClient:
    """Client for interacting with Notion API"""
    
    def __init__(self, token: str):
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Notion-Version": NOTION_API_VERSION,
            "Content-Type": "application/json"
        }
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Make rate-limited request to Notion API"""
        url = f"{NOTION_BASE_URL}/{endpoint}"
        
        try:
            response = requests.request(method, url, headers=self.headers, **kwargs)
            response.raise_for_status()
            sleep(NOTION_RATE_LIMIT_DELAY)  # Rate limiting
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error making request to {endpoint}: {e}")
            return None
    
    def get_page(self, page_id: str) -> Dict:
        """Fetch a page by ID"""
        return self._make_request("GET", f"pages/{page_id}")
    
    def get_block_children(self, block_id: str) -> List[Dict]:
        """Fetch all children of a block (with pagination)"""
        children = []
        has_more = True
        start_cursor = None
        
        while has_more:
            params = {"page_size": 100}
            if start_cursor:
                params["start_cursor"] = start_cursor
            
            response = self._make_request(
                "GET", 
                f"blocks/{block_id}/children",
                params=params
            )
            
            if not response:
                break
            
            children.extend(response.get("results", []))
            has_more = response.get("has_more", False)
            start_cursor = response.get("next_cursor")
        
        return children
    
    def extract_text_from_rich_text(self, rich_text_array: List[Dict]) -> str:
        """Extract plain text from Notion rich text array"""
        if not rich_text_array:
            return ""
        
        return "".join([
            text.get("plain_text", "") 
            for text in rich_text_array
        ])
    
    def extract_text_from_block(self, block: Dict) -> str:
        """Extract text content from any block type"""
        block_type = block.get("type")
        
        if not block_type:
            return ""
        
        block_data = block.get(block_type, {})
        
        # Handle rich_text based blocks
        if "rich_text" in block_data:
            return self.extract_text_from_rich_text(block_data["rich_text"])
        
        # Handle code blocks
        if block_type == "code":
            return self.extract_text_from_rich_text(block_data.get("rich_text", []))
        
        # Handle paragraph
        if block_type == "paragraph":
            return self.extract_text_from_rich_text(block_data.get("rich_text", []))
        
        # Handle headings
        if block_type in ["heading_1", "heading_2", "heading_3"]:
            return self.extract_text_from_rich_text(block_data.get("rich_text", []))
        
        # Handle bulleted list items
        if block_type == "bulleted_list_item":
            return self.extract_text_from_rich_text(block_data.get("rich_text", []))
        
        # Handle numbered list items
        if block_type == "numbered_list_item":
            return self.extract_text_from_rich_text(block_data.get("rich_text", []))
        
        return ""

# ================================================================
# SUPABASE CLIENT
# ================================================================

class SupabaseManager:
    """Manager for Supabase database operations"""
    
    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)
    
    def get_category_map(self) -> Dict[str, str]:
        """Get mapping of category names to IDs"""
        response = self.client.table("categories").select("id, name, slug").execute()
        return {
            cat["name"]: cat["id"] 
            for cat in response.data
        }
    
    def get_or_create_collection(self, name: str, description: str = None, 
                                  source_url: str = None, 
                                  notion_page_id: str = None) -> str:
        """Get existing collection or create new one"""
        # Try to find existing
        response = self.client.table("collections").select("id").eq("name", name).execute()
        
        if response.data:
            return response.data[0]["id"]
        
        # Create new
        collection_data = {
            "name": name,
            "description": description,
            "source_url": source_url,
            "notion_page_id": notion_page_id
        }
        
        response = self.client.table("collections").insert(collection_data).execute()
        return response.data[0]["id"]
    
    def insert_prompt(self, prompt: Prompt, category_ids: List[str] = None) -> Optional[str]:
        """Insert a prompt and its categories"""
        try:
            # Prepare prompt data (exclude categories as they go in junction table)
            prompt_dict = asdict(prompt)
            categories = prompt_dict.pop("categories", [])
            
            # Insert prompt
            response = self.client.table("prompts").insert(prompt_dict).execute()
            
            if not response.data:
                print(f"Failed to insert prompt: {prompt.name}")
                return None
            
            prompt_id = response.data[0]["id"]
            
            # Insert category relationships
            if category_ids:
                category_relations = [
                    {"prompt_id": prompt_id, "category_id": cat_id}
                    for cat_id in category_ids
                ]
                self.client.table("prompt_categories").insert(category_relations).execute()
            
            return prompt_id
        
        except Exception as e:
            print(f"Error inserting prompt '{prompt.name}': {e}")
            return None
    
    def log_migration_start(self, collection_name: str, notion_page_id: str, 
                           notion_page_url: str) -> str:
        """Log the start of a migration"""
        log_data = {
            "collection_name": collection_name,
            "notion_page_id": notion_page_id,
            "notion_page_url": notion_page_url,
            "status": "processing"
        }
        
        response = self.client.table("migration_log").insert(log_data).execute()
        return response.data[0]["id"]
    
    def log_migration_complete(self, log_id: str, prompts_extracted: int, 
                               prompts_inserted: int, error_message: str = None):
        """Log the completion of a migration"""
        update_data = {
            "prompts_extracted": prompts_extracted,
            "prompts_inserted": prompts_inserted,
            "status": "completed" if not error_message else "failed",
            "error_message": error_message,
            "completed_at": datetime.utcnow().isoformat()
        }
        
        self.client.table("migration_log").update(update_data).eq("id", log_id).execute()

# ================================================================
# PROMPT EXTRACTORS
# ================================================================

class PromptExtractor:
    """Extract prompts from different Notion page formats"""
    
    def __init__(self, notion_client: NotionClient):
        self.notion = notion_client
    
    def extract_from_page(self, page_id: str, category: str = None) -> List[Prompt]:
        """Extract prompts from a Notion page"""
        prompts = []
        
        # Get page metadata
        page = self.notion.get_page(page_id)
        if not page:
            return prompts
        
        page_title = self._get_page_title(page)
        
        # Get page content
        blocks = self.notion.get_block_children(page_id)
        
        # Extract based on structure
        prompts.extend(self._extract_question_based(blocks, page_title, category))
        prompts.extend(self._extract_javascript_blocks(blocks, page_title, category))
        prompts.extend(self._extract_list_items(blocks, page_title, category))
        
        return prompts
    
    def _get_page_title(self, page: Dict) -> str:
        """Extract title from page properties"""
        properties = page.get("properties", {})
        
        for prop_name, prop_value in properties.items():
            if prop_value.get("type") == "title":
                title_array = prop_value.get("title", [])
                return self.notion.extract_text_from_rich_text(title_array)
        
        return "Untitled"
    
    def _extract_question_based(self, blocks: List[Dict], source: str, 
                                category: str) -> List[Prompt]:
        """Extract question-based prompts (- What are..., - How do...)"""
        prompts = []
        
        for block in blocks:
            if block.get("type") != "bulleted_list_item":
                continue
            
            text = self.notion.extract_text_from_block(block)
            
            # Check if it's a question
            if not text or not any(text.startswith(q) for q in ["What", "How", "Why", "When", "Where", "Who"]):
                continue
            
            # Create prompt
            prompt = Prompt(
                name=text[:100] + "..." if len(text) > 100 else text,
                prompt_text=text,
                prompt_type="question-based",
                source=source,
                categories=[category] if category else []
            )
            prompts.append(prompt)
        
        return prompts
    
    def _extract_javascript_blocks(self, blocks: List[Dict], source: str, 
                                   category: str) -> List[Prompt]:
        """Extract prompts from JavaScript code blocks"""
        prompts = []
        
        for block in blocks:
            if block.get("type") != "code":
                continue
            
            code_data = block.get("code", {})
            language = code_data.get("language")
            
            if language != "javascript":
                continue
            
            text = self.notion.extract_text_from_block(block)
            
            if not text or not text.strip():
                continue
            
            # Create prompt
            prompt = Prompt(
                name=f"Fill-in-blank prompt from {source}",
                prompt_text=text,
                prompt_type="fill-in-blank",
                source=source,
                categories=[category] if category else []
            )
            prompts.append(prompt)
        
        return prompts
    
    def _extract_list_items(self, blocks: List[Dict], source: str, 
                           category: str) -> List[Prompt]:
        """Extract generic list items as prompts"""
        prompts = []
        
        for block in blocks:
            block_type = block.get("type")
            
            if block_type not in ["bulleted_list_item", "numbered_list_item"]:
                continue
            
            text = self.notion.extract_text_from_block(block)
            
            if not text or len(text) < 20:  # Skip very short items
                continue
            
            # Skip if already extracted as question
            if any(text.startswith(q) for q in ["What", "How", "Why", "When", "Where", "Who"]):
                continue
            
            # Create prompt
            prompt = Prompt(
                name=text[:100] + "..." if len(text) > 100 else text,
                prompt_text=text,
                prompt_type="list-item",
                source=source,
                categories=[category] if category else []
            )
            prompts.append(prompt)
        
        return prompts

# ================================================================
# MIGRATION ORCHESTRATOR
# ================================================================

class MigrationOrchestrator:
    """Orchestrate the complete migration process"""
    
    def __init__(self, notion_token: str):
        self.notion = NotionClient(notion_token)
        self.supabase = SupabaseManager(SUPABASE_URL, SUPABASE_KEY)
        self.extractor = PromptExtractor(self.notion)
        self.category_map = self.supabase.get_category_map()
    
    def migrate_ultimate_chatgpt_bible(self, root_page_id: str):
        """Migrate Ultimate ChatGPT Bible 2.0"""
        print("\n" + "="*60)
        print("MIGRATING: Ultimate ChatGPT Bible 2.0")
        print("="*60 + "\n")
        
        # Category structure from Ultimate ChatGPT Bible 2.0
        categories_config = [
            {
                "name": "Content Marketing",
                "subcategories": [
                    "Content Strategy Development",
                    "Blog and Article Writing",
                    "Social Media Content Creation",
                    "Video Content Marketing",
                    "Content Distribution and Promotion",
                    "Designing Quizzes and Assessments",
                    "Creating Interactive Webinars",
                    "Developing ROI Calculators",
                    "Interactive Infographic Strategies"
                ]
            },
            {
                "name": "Social Media",
                "subcategories": [
                    "TikTok Content Strategy Optimization",
                    "Instagram Engagement and Growth Strategy",
                    "Twitter/X Content Strategy Development",
                    "Facebook Community Engagement and Ad Strategy",
                    "YouTube Video Optimization and Growth Strategy",
                    "LinkedIn Personal Branding and Content Strategy"
                ]
            }
            # Add more as needed...
        ]
        
        # Get children of root page
        children = self.notion.get_block_children(root_page_id)
        
        total_prompts_extracted = 0
        total_prompts_inserted = 0
        
        # Process each category page
        for block in children:
            if block.get("type") != "child_page":
                continue
            
            page_id = block.get("id")
            
            # Get page details
            page = self.notion.get_page(page_id)
            if not page:
                continue
            
            page_title = self.extractor._get_page_title(page)
            
            # Skip BONUS pages
            if "BONUS" in page_title:
                print(f"⏭️  Skipping: {page_title}")
                continue
            
            print(f"\n📄 Processing: {page_title}")
            
            # Extract prompts
            prompts = self.extractor.extract_from_page(page_id, category=page_title)
            
            print(f"   Found {len(prompts)} prompts")
            
            # Get category ID
            category_ids = []
            if page_title in self.category_map:
                category_ids.append(self.category_map[page_title])
            
            # Insert prompts
            inserted = 0
            for prompt in prompts:
                if self.supabase.insert_prompt(prompt, category_ids):
                    inserted += 1
            
            print(f"   ✅ Inserted {inserted} prompts")
            
            total_prompts_extracted += len(prompts)
            total_prompts_inserted += inserted
        
        print(f"\n{'='*60}")
        print(f"SUMMARY:")
        print(f"Total Extracted: {total_prompts_extracted}")
        print(f"Total Inserted: {total_prompts_inserted}")
        print(f"{'='*60}\n")
    
    def migrate_collection(self, collection_name: str, root_page_id: str):
        """Generic collection migration"""
        print(f"\n{'='*60}")
        print(f"MIGRATING: {collection_name}")
        print(f"{'='*60}\n")
        
        # Start migration log
        log_id = self.supabase.log_migration_start(
            collection_name,
            root_page_id,
            f"https://www.notion.so/{root_page_id}"
        )
        
        try:
            # Extract prompts
            prompts = self.extractor.extract_from_page(root_page_id)
            
            print(f"Extracted {len(prompts)} prompts")
            
            # Insert prompts
            inserted = 0
            for prompt in prompts:
                prompt.source = collection_name
                if self.supabase.insert_prompt(prompt):
                    inserted += 1
            
            print(f"✅ Inserted {inserted} prompts")
            
            # Log completion
            self.supabase.log_migration_complete(log_id, len(prompts), inserted)
            
        except Exception as e:
            print(f"❌ Error: {e}")
            self.supabase.log_migration_complete(log_id, 0, 0, str(e))

# ================================================================
# MAIN EXECUTION
# ================================================================

def main():
    """Main migration script"""
    print("\n" + "🚀"*30)
    print("PROMPTVAULT MIGRATION SCRIPT")
    print("🚀"*30 + "\n")
    
    # Get Notion token from environment
    notion_token = os.getenv("NOTION_TOKEN")
    
    if not notion_token:
        print("❌ Error: NOTION_TOKEN environment variable not set")
        print("Please set your Notion integration token:")
        print('export NOTION_TOKEN="your_token_here"')
        return
    
    # Initialize orchestrator
    orchestrator = MigrationOrchestrator(notion_token)
    
    # Migration configuration
    MIGRATIONS = {
        "Ultimate ChatGPT Bible 2.0": "2b0a3b31e44780ffa1cbccd08b96957a",
        "AI Ultimate Collection": "2aaa3b31e44780df9ff0f7db9c071a0b",
        "AI Prompt Box": "27ba3b31e44781efb273de412a561baf",
        "ChatGPT Advantage": "293a3b31e447805fb562c0a204f56831",
        "100+ ChatGPT Prompts": "24da3b31e447808aa527ea0d9a2d80ae"
    }
    
    # Run migrations
    for collection_name, page_id in MIGRATIONS.items():
        try:
            if collection_name == "Ultimate ChatGPT Bible 2.0":
                orchestrator.migrate_ultimate_chatgpt_bible(page_id)
            else:
                orchestrator.migrate_collection(collection_name, page_id)
        except Exception as e:
            print(f"❌ Failed to migrate {collection_name}: {e}")
            continue
    
    print("\n" + "✅"*30)
    print("MIGRATION COMPLETE!")
    print("✅"*30 + "\n")

if __name__ == "__main__":
    main()
