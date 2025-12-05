"""
Advanced Excel Importer - Handles Multiple Files & Sheets
Processes:
1. ChatGPT Prompt Learning Library (78 sheets, ~15,000-20,000 prompts)
2. Midjourney AI Art Prompts (51 sheets, ~10,000 prompts)

Total Expected: ~25,000-30,000 prompts
"""

import pandas as pd
import requests
import os
from typing import List, Dict
import time

# Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

class UniversalExcelImporter:
    def __init__(self):
        self.stats = {
            'files_processed': 0,
            'sheets_processed': 0,
            'prompts_extracted': 0,
            'prompts_inserted': 0,
            'duplicates_skipped': 0,
            'errors': 0
        }
        self.existing_prompts = set()
        self.load_existing_prompts()
    
    def load_existing_prompts(self):
        """Load existing prompts to avoid duplicates"""
        print("📥 Loading existing prompts...")
        try:
            url = f"{SUPABASE_URL}/rest/v1/prompts?select=name,prompt_text"
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 200:
                prompts = response.json()
                for p in prompts:
                    if p.get('name'):
                        self.existing_prompts.add(p['name'][:200])
                    if p.get('prompt_text'):
                        self.existing_prompts.add(hash(p['prompt_text'][:500]))
                print(f"   Found {len(self.existing_prompts)} existing prompts")
        except Exception as e:
            print(f"   ⚠️ Warning: {e}")
    
    def is_duplicate(self, name: str, prompt_text: str) -> bool:
        """Check if prompt already exists"""
        if name[:200] in self.existing_prompts:
            return True
        if hash(prompt_text[:500]) in self.existing_prompts:
            return True
        return False
    
    def detect_prompt_type(self, text: str, ai_model: str) -> str:
        """Detect prompt type based on content and AI model"""
        if ai_model == 'Midjourney':
            return 'image-generation'
        
        text_lower = text.lower()
        if '[' in text and ']' in text:
            return 'fill-in-blank'
        elif '?' in text:
            return 'question-based'
        elif 'act as' in text_lower or 'you are' in text_lower or 'i want you to act' in text_lower:
            return 'role-play'
        else:
            return 'template'
    
    def map_category_chatgpt(self, sheet_name: str) -> str:
        """Map ChatGPT sheet name to category"""
        sheet_lower = sheet_name.lower()
        
        # Social Media platforms
        if any(word in sheet_lower for word in ['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'tiktok', 'youtube', 'social media']):
            return 'Social Media'
        
        # Marketing
        if any(word in sheet_lower for word in ['email marketing', 'seo', 'advertising', 'google ads', 'facebook ads', 'smm', 'marketing']):
            return 'Email Marketing' if 'email' in sheet_lower else 'Content Marketing'
        
        # Sales
        if any(word in sheet_lower for word in ['sales', 'b2b', 'b2c', 'cold calling', 'lead generation', 'objections']):
            return 'Sales'
        
        # Business
        if any(word in sheet_lower for word in ['business', 'entrepreneur', 'saas', 'e-commerce', 'startup', 'small business']):
            return 'Business Strategy'
        
        # Copywriting
        if 'copywriting' in sheet_lower or 'copy' in sheet_lower:
            return 'Copywriting'
        
        # Technical
        if any(word in sheet_lower for word in ['excel', 'google sheets', 'no-coding', 'coding']):
            return 'Technical'
        
        # Career/Personal
        if any(word in sheet_lower for word in ['career', 'resume', 'time management', 'stress', 'sleep', 'personal']):
            return 'Personal Development'
        
        # Customer Service
        if 'customer service' in sheet_lower:
            return 'Customer Service'
        
        # Crypto/Trading
        if any(word in sheet_lower for word in ['crypto', 'nft', 'defi', 'trading']):
            return 'Finance & Crypto'
        
        return 'General'
    
    def map_category_midjourney(self, sheet_name: str) -> str:
        """Map Midjourney sheet name to category"""
        # All Midjourney prompts are image generation
        return 'Image Generation'
    
    def extract_prompts_chatgpt(self, df: pd.DataFrame, sheet_name: str) -> List[Dict]:
        """Extract ChatGPT prompts from a sheet"""
        prompts = []
        category = self.map_category_chatgpt(sheet_name)
        
        # Skip table of contents
        if 'table of contents' in sheet_name.lower():
            return []
        
        # Get all non-null text from the dataframe
        for col in df.columns:
            for idx, value in df[col].items():
                if pd.isna(value):
                    continue
                
                text = str(value).strip()
                
                # Skip empty, too short, or header-like text
                if len(text) < 20:
                    continue
                if text.lower() in ['nan', 'page', 'unnamed']:
                    continue
                
                # Create prompt
                if len(text) > 100:
                    name = text[:50] + "..."
                    prompt_text = text
                else:
                    name = text
                    prompt_text = text
                
                prompt = {
                    'name': name[:200],
                    'prompt_text': prompt_text[:10000],
                    'prompt_type': self.detect_prompt_type(prompt_text, 'ChatGPT'),
                    'category': category,
                    'source': f'Excel: {sheet_name}',
                    'ai_model': 'ChatGPT',
                    'use_case': category,
                    'tags': [sheet_name, category]
                }
                
                # Check duplicates
                if not self.is_duplicate(prompt['name'], prompt['prompt_text']):
                    prompts.append(prompt)
                    self.existing_prompts.add(prompt['name'])
                    self.existing_prompts.add(hash(prompt['prompt_text'][:500]))
                else:
                    self.stats['duplicates_skipped'] += 1
        
        return prompts
    
    def extract_prompts_midjourney(self, df: pd.DataFrame, sheet_name: str) -> List[Dict]:
        """Extract Midjourney prompts from a sheet"""
        prompts = []
        category = self.map_category_midjourney(sheet_name)
        
        # Skip home/index sheets
        if 'home' in sheet_name.lower():
            return []
        
        # Midjourney format: first column usually has the prompt
        for col in df.columns:
            for idx, value in df[col].items():
                if pd.isna(value):
                    continue
                
                text = str(value).strip()
                
                # Skip empty, too short, or header-like text
                if len(text) < 10:
                    continue
                if any(skip in text.lower() for skip in ['category:', 'midjourney', 'prompt collection', 'unnamed']):
                    continue
                
                # Create prompt
                if len(text) > 80:
                    name = text[:50] + "..."
                    prompt_text = text
                else:
                    name = text
                    prompt_text = text
                
                prompt = {
                    'name': name[:200],
                    'prompt_text': prompt_text[:10000],
                    'prompt_type': 'image-generation',
                    'category': category,
                    'source': f'Midjourney: {sheet_name}',
                    'ai_model': 'Midjourney',
                    'use_case': 'Image Generation',
                    'tags': [sheet_name, 'Midjourney', 'Art']
                }
                
                # Check duplicates
                if not self.is_duplicate(prompt['name'], prompt['prompt_text']):
                    prompts.append(prompt)
                    self.existing_prompts.add(prompt['name'])
                    self.existing_prompts.add(hash(prompt['prompt_text'][:500]))
                else:
                    self.stats['duplicates_skipped'] += 1
        
        return prompts
    
    def insert_batch(self, prompts: List[Dict]) -> int:
        """Insert prompts in batch"""
        inserted = 0
        
        for prompt in prompts:
            try:
                url = f"{SUPABASE_URL}/rest/v1/prompts"
                response = requests.post(url, headers=headers, json=prompt, timeout=10)
                
                if response.status_code in [200, 201]:
                    inserted += 1
                else:
                    self.stats['errors'] += 1
            except Exception as e:
                self.stats['errors'] += 1
        
        return inserted
    
    def process_file(self, file_path: str, file_type: str):
        """Process a single Excel file"""
        print(f"\n{'='*70}")
        print(f"📂 PROCESSING: {os.path.basename(file_path)}")
        print(f"   Type: {file_type}")
        print('='*70)
        
        try:
            xl = pd.ExcelFile(file_path)
            sheet_names = xl.sheet_names
            
            print(f"   Found {len(sheet_names)} sheets")
            
            # Skip certain sheets
            if file_type == 'ChatGPT':
                sheet_names = [s for s in sheet_names if 'table of contents' not in s.lower()]
                extractor = self.extract_prompts_chatgpt
            else:  # Midjourney
                sheet_names = [s for s in sheet_names if 'home' not in s.lower()]
                extractor = self.extract_prompts_midjourney
            
            print(f"   Processing {len(sheet_names)} sheets")
            print()
            
            batch = []
            batch_size = 100
            
            for i, sheet_name in enumerate(sheet_names, 1):
                print(f"   📄 [{i}/{len(sheet_names)}] {sheet_name[:50]}...", end=' ')
                
                try:
                    # Read sheet
                    df = pd.read_excel(file_path, sheet_name=sheet_name)
                    
                    # Extract prompts
                    prompts = extractor(df, sheet_name)
                    
                    if prompts:
                        batch.extend(prompts)
                        self.stats['prompts_extracted'] += len(prompts)
                        print(f"✅ {len(prompts)} prompts")
                    else:
                        print("⭐ Empty")
                    
                    self.stats['sheets_processed'] += 1
                    
                    # Insert batch
                    if len(batch) >= batch_size:
                        inserted = self.insert_batch(batch)
                        self.stats['prompts_inserted'] += inserted
                        batch = []
                        time.sleep(0.1)  # Rate limiting
                
                except Exception as e:
                    print(f"❌ Error: {e}")
                    self.stats['errors'] += 1
            
            # Insert remaining batch
            if batch:
                inserted = self.insert_batch(batch)
                self.stats['prompts_inserted'] += inserted
            
            self.stats['files_processed'] += 1
            
        except Exception as e:
            print(f"\n❌ Error reading Excel file: {e}")
    
    def process_all_files(self):
        """Process all Excel files"""
        files = [
            ('ChatGPT_Prompt_Learning_Library.xlsx', 'ChatGPT'),
            ('10000_Midjourney_AI_Art_Prompt_Collection.xlsx', 'Midjourney')
        ]
        
        print("="*70)
        print("🚀 UNIVERSAL EXCEL IMPORTER")
        print("   ChatGPT Prompts + Midjourney Art Prompts")
        print("="*70)
        print("\nLooking for Excel files...")
        
        found_files = []
        for file_path, file_type in files:
            if os.path.exists(file_path):
                print(f"   ✅ Found: {file_path}")
                found_files.append((file_path, file_type))
            else:
                print(f"   ⚠️  Not found: {file_path}")
        
        if not found_files:
            print("\n❌ No Excel files found!")
            print("\nPlease make sure these files are in the current directory:")
            print("   - ChatGPT_Prompt_Learning_Library.xlsx")
            print("   - 10000_Midjourney_AI_Art_Prompt_Collection.xlsx")
            return
        
        # Process each file
        for file_path, file_type in found_files:
            self.process_file(file_path, file_type)
        
        # Final summary
        print(f"\n{'='*70}")
        print("🎉 IMPORT COMPLETE")
        print('='*70)
        print(f"Files Processed:      {self.stats['files_processed']}/{len(files)}")
        print(f"Sheets Processed:     {self.stats['sheets_processed']}")
        print(f"Prompts Extracted:    {self.stats['prompts_extracted']}")
        print(f"Prompts Inserted:     {self.stats['prompts_inserted']}")
        print(f"Duplicates Skipped:   {self.stats['duplicates_skipped']}")
        print(f"Errors:               {self.stats['errors']}")
        print('='*70)
        print(f"\n✨ Your database now has ~{self.stats['prompts_inserted']:,} prompts!")

def main():
    importer = UniversalExcelImporter()
    importer.process_all_files()
    
    print("\n✅ Done! Run view_stats.py to see detailed results")
    print("➡️  Next: Run cleanup_and_organize.py for final polish")

if __name__ == "__main__":
    main()
