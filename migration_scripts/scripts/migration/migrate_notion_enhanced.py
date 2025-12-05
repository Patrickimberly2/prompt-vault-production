"""
Enhanced Notion to Supabase Migration Script
Extracts ALL accessible content with smart categorization
"""

import requests
import os
from datetime import datetime
from typing import List, Dict, Optional
import time

# Configuration
NOTION_TOKEN = os.getenv('NOTION_TOKEN', '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')
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY')

# Notion headers
notion_headers = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

# Supabase headers
supabase_headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

class PromptExtractor:
    def __init__(self):
        self.stats = {
            'total_extracted': 0,
            'total_inserted': 0,
            'duplicates_skipped': 0,
            'errors': 0
        }
        self.existing_prompts = set()
        self.load_existing_prompts()
    
    def load_existing_prompts(self):
        """Load existing prompt names to avoid duplicates"""
        print("📥 Loading existing prompts...")
        try:
            url = f"{SUPABASE_URL}/rest/v1/prompts?select=name"
            response = requests.get(url, headers=supabase_headers, timeout=10)
            if response.status_code == 200:
                prompts = response.json()
                self.existing_prompts = {p['name'] for p in prompts if p.get('name')}
                print(f"   Found {len(self.existing_prompts)} existing prompts")
        except Exception as e:
            print(f"   ⚠️  Could not load existing prompts: {e}")
    
    def extract_text_from_blocks(self, blocks: List[Dict]) -> str:
        """Extract text content from Notion blocks"""
        text_parts = []
        
        for block in blocks:
            block_type = block.get('type')
            
            if block_type == 'paragraph':
                rich_text = block.get('paragraph', {}).get('rich_text', [])
                text = ''.join([rt.get('plain_text', '') for rt in rich_text])
                if text.strip():
                    text_parts.append(text)
            
            elif block_type in ['heading_1', 'heading_2', 'heading_3']:
                rich_text = block.get(block_type, {}).get('rich_text', [])
                text = ''.join([rt.get('plain_text', '') for rt in rich_text])
                if text.strip():
                    text_parts.append(f"\n{text}\n")
            
            elif block_type == 'bulleted_list_item':
                rich_text = block.get('bulleted_list_item', {}).get('rich_text', [])
                text = ''.join([rt.get('plain_text', '') for rt in rich_text])
                if text.strip():
                    text_parts.append(f"• {text}")
            
            elif block_type == 'numbered_list_item':
                rich_text = block.get('numbered_list_item', {}).get('rich_text', [])
                text = ''.join([rt.get('plain_text', '') for rt in rich_text])
                if text.strip():
                    text_parts.append(text)
            
            elif block_type == 'quote':
                rich_text = block.get('quote', {}).get('rich_text', [])
                text = ''.join([rt.get('plain_text', '') for rt in rich_text])
                if text.strip():
                    text_parts.append(f"> {text}")
            
            elif block_type == 'code':
                rich_text = block.get('code', {}).get('rich_text', [])
                text = ''.join([rt.get('plain_text', '') for rt in rich_text])
                if text.strip():
                    text_parts.append(f"```\n{text}\n```")
        
        return '\n'.join(text_parts)
    
    def get_block_children(self, block_id: str, max_retries: int = 3) -> List[Dict]:
        """Get children blocks with retry logic"""
        for attempt in range(max_retries):
            try:
                url = f"https://api.notion.com/v1/blocks/{block_id}/children"
                response = requests.get(url, headers=notion_headers, timeout=15)
                
                if response.status_code == 200:
                    return response.json().get('results', [])
                elif response.status_code == 429:  # Rate limit
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
                elif response.status_code == 503:  # Service unavailable
                    time.sleep(5)
                    continue
                else:
                    return []
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"   ⚠️  Error getting blocks: {e}")
                    return []
                time.sleep(1)
        return []
    
    def extract_prompts_from_page(self, page_id: str, category: str, source: str) -> List[Dict]:
        """Extract prompts from a Notion page"""
        prompts = []
        blocks = self.get_block_children(page_id)
        
        current_prompt = None
        current_text = []
        
        for block in blocks:
            block_type = block.get('type')
            
            # Questions are prompts
            if block_type in ['heading_2', 'heading_3', 'bulleted_list_item']:
                # Save previous prompt if exists
                if current_prompt and current_text:
                    current_prompt['prompt_text'] = '\n'.join(current_text)
                    if len(current_prompt['prompt_text']) > 20:  # Min length
                        prompts.append(current_prompt)
                
                # Start new prompt
                rich_text = block.get(block_type, {}).get('rich_text', [])
                text = ''.join([rt.get('plain_text', '') for rt in rich_text]).strip()
                
                if text and '?' in text:  # Question-based prompt
                    current_prompt = {
                        'name': text[:200],  # Limit title length
                        'prompt_text': text,
                        'prompt_type': 'question-based',
                        'category': category,
                        'source': source,
                        'ai_model': 'Universal'
                    }
                    current_text = []
                elif text and '[' in text and ']' in text:  # Fill-in-blank
                    current_prompt = {
                        'name': text[:200],
                        'prompt_text': text,
                        'prompt_type': 'fill-in-blank',
                        'category': category,
                        'source': source,
                        'ai_model': 'Universal'
                    }
                    current_text = []
            
            # Accumulate content for current prompt
            elif current_prompt and block_type in ['paragraph', 'quote', 'code']:
                rich_text = block.get(block_type, {}).get('rich_text', [])
                text = ''.join([rt.get('plain_text', '') for rt in rich_text]).strip()
                if text:
                    current_text.append(text)
        
        # Don't forget the last prompt
        if current_prompt and current_text:
            current_prompt['prompt_text'] = '\n'.join(current_text)
            if len(current_prompt['prompt_text']) > 20:
                prompts.append(current_prompt)
        
        return prompts
    
    def extract_from_database(self, database_id: str, source: str) -> List[Dict]:
        """Extract prompts from a Notion database"""
        prompts = []
        has_more = True
        start_cursor = None
        
        print(f"   📊 Querying database...")
        
        while has_more:
            try:
                url = f"https://api.notion.com/v1/databases/{database_id}/query"
                body = {"page_size": 100}
                if start_cursor:
                    body["start_cursor"] = start_cursor
                
                response = requests.post(url, headers=notion_headers, json=body, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    for item in results:
                        props = item.get('properties', {})
                        
                        # Extract title/name
                        name = ''
                        for prop_name, prop_value in props.items():
                            if prop_value.get('type') == 'title':
                                title_content = prop_value.get('title', [])
                                name = title_content[0].get('plain_text', '') if title_content else ''
                                break
                        
                        # Extract prompt text
                        prompt_text = ''
                        for prop_name in ['Prompt', 'prompt', 'Content', 'content', 'Text', 'text']:
                            if prop_name in props:
                                rich_text = props[prop_name].get('rich_text', [])
                                prompt_text = rich_text[0].get('plain_text', '') if rich_text else ''
                                if prompt_text:
                                    break
                        
                        # Extract type/category
                        prompt_type = 'template'
                        for prop_name in ['Type', 'type', 'Category', 'category']:
                            if prop_name in props:
                                select = props[prop_name].get('select')
                                if select:
                                    prompt_type = select.get('name', 'template')
                                    break
                        
                        if name and prompt_text and len(prompt_text) > 20:
                            prompts.append({
                                'name': name[:200],
                                'prompt_text': prompt_text,
                                'prompt_type': prompt_type.lower(),
                                'category': prompt_type if prompt_type != 'template' else 'General',
                                'source': source,
                                'ai_model': 'ChatGPT'
                            })
                    
                    has_more = data.get('has_more', False)
                    start_cursor = data.get('next_cursor')
                    print(f"   📥 Extracted {len(results)} items (Total: {len(prompts)})")
                else:
                    print(f"   ❌ Database query failed: {response.status_code}")
                    break
                    
            except Exception as e:
                print(f"   ❌ Error querying database: {e}")
                break
        
        return prompts
    
    def insert_prompts(self, prompts: List[Dict]) -> int:
        """Insert prompts into Supabase with deduplication"""
        inserted = 0
        
        for prompt in prompts:
            # Check for duplicates
            if prompt['name'] in self.existing_prompts:
                self.stats['duplicates_skipped'] += 1
                continue
            
            try:
                url = f"{SUPABASE_URL}/rest/v1/prompts"
                response = requests.post(url, headers=supabase_headers, json=prompt, timeout=10)
                
                if response.status_code in [200, 201]:
                    inserted += 1
                    self.existing_prompts.add(prompt['name'])
                else:
                    self.stats['errors'] += 1
                    
            except Exception as e:
                self.stats['errors'] += 1
        
        return inserted

def main():
    print("="*70)
    print("🚀 ENHANCED NOTION MIGRATION - FULL AUTO MODE")
    print("="*70)
    
    extractor = PromptExtractor()
    
    # Source definitions
    sources = [
        {
            'name': 'Ultimate ChatGPT Bible 2.0',
            'id': '2a9a3b31e4478058ae57fa3e7e3c121b',
            'type': 'page_with_children'
        },
        {
            'name': 'ChatGPT Prompts Manager',
            'id': '02002d9e-a8f6-4a08-908e-0d1468344e9a',
            'type': 'database'
        }
    ]
    
    for source in sources:
        print(f"\n{'='*70}")
        print(f"📚 Processing: {source['name']}")
        print('='*70)
        
        if source['type'] == 'page_with_children':
            # Get child pages
            blocks = extractor.get_block_children(source['id'])
            child_pages = [b for b in blocks if b.get('type') == 'child_page']
            
            print(f"   Found {len(child_pages)} categories")
            
            for child in child_pages:
                title = child.get('child_page', {}).get('title', 'Unknown')
                
                # Skip educational content
                skip_keywords = ['BONUS', 'Challenge', 'Tutorial', 'Guide', 'Bot Creation', 'Course']
                if any(keyword.lower() in title.lower() for keyword in skip_keywords):
                    print(f"   ⏭️  Skipping: {title}")
                    continue
                
                print(f"   📄 {title}")
                child_id = child['id']
                
                prompts = extractor.extract_prompts_from_page(child_id, title, source['name'])
                extractor.stats['total_extracted'] += len(prompts)
                
                if prompts:
                    inserted = extractor.insert_prompts(prompts)
                    extractor.stats['total_inserted'] += inserted
                    print(f"      ✅ Extracted {len(prompts)} → Inserted {inserted}")
                else:
                    print(f"      ⚠️  No prompts found")
        
        elif source['type'] == 'database':
            prompts = extractor.extract_from_database(source['id'], source['name'])
            extractor.stats['total_extracted'] += len(prompts)
            
            if prompts:
                inserted = extractor.insert_prompts(prompts)
                extractor.stats['total_inserted'] += inserted
                print(f"   ✅ Extracted {len(prompts)} → Inserted {inserted}")
    
    # Final summary
    print(f"\n{'='*70}")
    print("📊 MIGRATION SUMMARY")
    print('='*70)
    print(f"Total Extracted:      {extractor.stats['total_extracted']}")
    print(f"Total Inserted:       {extractor.stats['total_inserted']}")
    print(f"Duplicates Skipped:   {extractor.stats['duplicates_skipped']}")
    print(f"Errors:               {extractor.stats['errors']}")
    print('='*70)
    print("✅ Phase 1 Complete! Run view_stats.py to see results")
    print("➡️  Next: Run import_excel.py for 20,000+ more prompts")

if __name__ == "__main__":
    main()
