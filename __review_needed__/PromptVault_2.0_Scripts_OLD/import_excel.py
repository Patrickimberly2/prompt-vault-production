"""
Excel/CSV Import Script for 20,000+ ChatGPT Prompts
Handles large files with smart categorization and deduplication
"""

import pandas as pd
import requests
import os
from datetime import datetime
import time

# Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY')

supabase_headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Category mapping for intelligent categorization
CATEGORY_KEYWORDS = {
    'Content Marketing': ['content', 'blog', 'article', 'seo', 'marketing content'],
    'Social Media': ['social', 'facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'],
    'Email Marketing': ['email', 'newsletter', 'subject line', 'campaign'],
    'Copywriting': ['copy', 'headline', 'sales copy', 'ad copy', 'landing page'],
    'Business Strategy': ['strategy', 'business', 'plan', 'growth', 'analysis'],
    'Product Development': ['product', 'feature', 'development', 'innovation'],
    'Customer Service': ['customer', 'support', 'service', 'help'],
    'Sales': ['sales', 'pitch', 'proposal', 'closing'],
    'Writing': ['write', 'writing', 'author', 'story', 'novel'],
    'Education': ['teach', 'learn', 'education', 'training', 'tutorial'],
    'Technical': ['code', 'programming', 'technical', 'debug', 'api'],
    'Creative': ['creative', 'idea', 'brainstorm', 'innovative'],
    'Analysis': ['analyze', 'analysis', 'data', 'research', 'report'],
    'Personal': ['personal', 'self', 'goal', 'motivation', 'productivity']
}

def detect_category(text: str) -> str:
    """Intelligently detect category based on text content"""
    text_lower = text.lower()
    
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                return category
    
    return 'General'

def detect_prompt_type(text: str) -> str:
    """Detect prompt type based on content"""
    if '[' in text and ']' in text:
        return 'fill-in-blank'
    elif '?' in text:
        return 'question-based'
    elif 'act as' in text.lower() or 'you are' in text.lower():
        return 'role-play'
    else:
        return 'template'

def clean_text(text: str) -> str:
    """Clean and normalize text"""
    if pd.isna(text):
        return ''
    return str(text).strip()

class ExcelImporter:
    def __init__(self):
        self.stats = {
            'total_rows': 0,
            'valid_prompts': 0,
            'inserted': 0,
            'duplicates': 0,
            'errors': 0
        }
        self.existing_prompts = set()
        self.load_existing_prompts()
    
    def load_existing_prompts(self):
        """Load existing prompt names"""
        print("📥 Loading existing prompts from database...")
        try:
            url = f"{SUPABASE_URL}/rest/v1/prompts?select=name,prompt_text"
            response = requests.get(url, headers=supabase_headers, timeout=10)
            if response.status_code == 200:
                prompts = response.json()
                # Create set of both names and hashes of prompt text for duplicate detection
                for p in prompts:
                    if p.get('name'):
                        self.existing_prompts.add(p['name'][:200])
                    if p.get('prompt_text'):
                        self.existing_prompts.add(hash(p['prompt_text'][:500]))
                print(f"   Loaded {len(self.existing_prompts)} existing prompts")
        except Exception as e:
            print(f"   ⚠️  Could not load existing: {e}")
    
    def is_duplicate(self, name: str, prompt_text: str) -> bool:
        """Check if prompt is a duplicate"""
        if name[:200] in self.existing_prompts:
            return True
        if hash(prompt_text[:500]) in self.existing_prompts:
            return True
        return False
    
    def import_from_excel(self, file_path: str):
        """Import prompts from Excel file"""
        print(f"📂 Reading file: {file_path}")
        
        try:
            # Try reading as Excel first
            if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
                df = pd.read_excel(file_path)
            else:
                df = pd.read_csv(file_path)
            
            self.stats['total_rows'] = len(df)
            print(f"   Found {len(df)} rows")
            print(f"   Columns: {', '.join(df.columns.tolist())}")
            
        except Exception as e:
            print(f"❌ Error reading file: {e}")
            return
        
        # Detect column names (flexible mapping)
        prompt_col = None
        title_col = None
        category_col = None
        
        for col in df.columns:
            col_lower = str(col).lower()
            if 'prompt' in col_lower or 'text' in col_lower or 'content' in col_lower:
                prompt_col = col
            elif 'title' in col_lower or 'name' in col_lower or 'heading' in col_lower:
                title_col = col
            elif 'category' in col_lower or 'type' in col_lower or 'tag' in col_lower:
                category_col = col
        
        if not prompt_col:
            print("❌ Could not find prompt column!")
            print("   Available columns:", df.columns.tolist())
            return
        
        print(f"\n   Using columns:")
        print(f"   - Prompt: {prompt_col}")
        print(f"   - Title: {title_col if title_col else 'Auto-generated'}")
        print(f"   - Category: {category_col if category_col else 'Auto-detected'}")
        
        # Process prompts in batches
        batch_size = 100
        batch = []
        
        print(f"\n🔄 Processing prompts...")
        
        for idx, row in df.iterrows():
            try:
                prompt_text = clean_text(row[prompt_col])
                
                # Skip empty or too short prompts
                if not prompt_text or len(prompt_text) < 20:
                    continue
                
                # Get or generate title
                if title_col and not pd.isna(row[title_col]):
                    name = clean_text(row[title_col])[:200]
                else:
                    # Generate title from first 50 chars
                    name = prompt_text[:50].strip()
                    if len(prompt_text) > 50:
                        name += "..."
                
                # Check for duplicates
                if self.is_duplicate(name, prompt_text):
                    self.stats['duplicates'] += 1
                    continue
                
                # Get or detect category
                if category_col and not pd.isna(row[category_col]):
                    category = clean_text(row[category_col])
                else:
                    category = detect_category(prompt_text)
                
                # Detect prompt type
                prompt_type = detect_prompt_type(prompt_text)
                
                # Create prompt object
                prompt = {
                    'name': name,
                    'prompt_text': prompt_text[:10000],  # Limit length
                    'prompt_type': prompt_type,
                    'category': category,
                    'source': 'AI Ultimate Collection',
                    'ai_model': 'ChatGPT',
                    'use_case': category
                }
                
                batch.append(prompt)
                self.stats['valid_prompts'] += 1
                
                # Insert batch
                if len(batch) >= batch_size:
                    inserted = self.insert_batch(batch)
                    self.stats['inserted'] += inserted
                    print(f"   ✅ Processed {idx + 1}/{len(df)} | Inserted: {self.stats['inserted']} | Duplicates: {self.stats['duplicates']}")
                    batch = []
                    time.sleep(0.1)  # Rate limiting
                
            except Exception as e:
                self.stats['errors'] += 1
        
        # Insert remaining batch
        if batch:
            inserted = self.insert_batch(batch)
            self.stats['inserted'] += inserted
        
        # Final summary
        print(f"\n{'='*70}")
        print("📊 IMPORT SUMMARY")
        print('='*70)
        print(f"Total Rows:           {self.stats['total_rows']}")
        print(f"Valid Prompts:        {self.stats['valid_prompts']}")
        print(f"Successfully Inserted: {self.stats['inserted']}")
        print(f"Duplicates Skipped:   {self.stats['duplicates']}")
        print(f"Errors:               {self.stats['errors']}")
        print('='*70)
    
    def insert_batch(self, prompts: list) -> int:
        """Insert a batch of prompts"""
        inserted = 0
        
        for prompt in prompts:
            try:
                url = f"{SUPABASE_URL}/rest/v1/prompts"
                response = requests.post(url, headers=supabase_headers, json=prompt, timeout=10)
                
                if response.status_code in [200, 201]:
                    inserted += 1
                    # Add to existing set
                    self.existing_prompts.add(prompt['name'])
                    self.existing_prompts.add(hash(prompt['prompt_text'][:500]))
                else:
                    self.stats['errors'] += 1
                    
            except Exception as e:
                self.stats['errors'] += 1
        
        return inserted

def main():
    print("="*70)
    print("📊 EXCEL/CSV IMPORT - 20,000+ PROMPTS")
    print("="*70)
    
    # Look for Excel file
    possible_files = [
        'ChatGPT Prompt Learning Library.xlsx',
        'ChatGPT_Prompt_Learning_Library.xlsx',
        'prompts.xlsx',
        'prompts.csv'
    ]
    
    file_path = None
    for f in possible_files:
        if os.path.exists(f):
            file_path = f
            break
    
    if not file_path:
        print("\n❌ Excel/CSV file not found!")
        print("\n📥 INSTRUCTIONS:")
        print("1. Download the file from Notion:")
        print("   https://www.notion.so/2aaa3b31e44780df9ff0f7db9c071a0b")
        print("2. Save it in this folder as:")
        print("   ChatGPT Prompt Learning Library.xlsx")
        print("3. Run this script again")
        print("\nOr specify the file path:")
        user_path = input("Enter file path (or press Enter to skip): ").strip()
        if user_path and os.path.exists(user_path):
            file_path = user_path
        else:
            return
    
    importer = ExcelImporter()
    importer.import_from_excel(file_path)
    
    print("\n✅ Phase 2 Complete!")
    print("➡️  Next: Run cleanup_and_organize.py for final cleanup")

if __name__ == "__main__":
    main()
