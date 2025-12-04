"""
Local Notion Export Processor
Processes markdown and CSV files from your ChatGPT Bible export
Much faster than API calls!
"""

import os
import re
import csv
import requests
from pathlib import Path
from typing import List, Dict
from collections import defaultdict

# Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

class LocalExportProcessor:
    def __init__(self, export_folder: str):
        self.export_folder = Path(export_folder)
        self.stats = {
            'files_processed': 0,
            'prompts_extracted': 0,
            'prompts_inserted': 0,
            'duplicates_skipped': 0,
            'errors': 0
        }
        self.existing_prompts = set()
        self.load_existing_prompts()
    
    def load_existing_prompts(self):
        """Load existing prompt names"""
        print("📥 Loading existing prompts...")
        try:
            url = f"{SUPABASE_URL}/rest/v1/prompts?select=name,prompt_text"
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                prompts = response.json()
                for p in prompts:
                    if p.get('name'):
                        self.existing_prompts.add(p['name'][:200])
                    if p.get('prompt_text'):
                        self.existing_prompts.add(hash(p['prompt_text'][:500]))
                print(f"   Found {len(self.existing_prompts)} existing prompts")
        except Exception as e:
            print(f"   ⚠️  Could not load existing: {e}")
    
    def is_duplicate(self, name: str, prompt_text: str) -> bool:
        """Check if prompt is duplicate"""
        if name[:200] in self.existing_prompts:
            return True
        if hash(prompt_text[:500]) in self.existing_prompts:
            return True
        return False
    
    def detect_category(self, filepath: str, content: str) -> str:
        """Detect category from file path and content"""
        path_str = str(filepath).lower()
        content_lower = content.lower()
        
        # Category mapping from file paths
        if 'marketing' in path_str or 'marketing' in content_lower:
            if 'email' in path_str or 'email' in content_lower:
                return 'Email Marketing'
            elif 'social' in path_str or 'social' in content_lower:
                return 'Social Media'
            else:
                return 'Content Marketing'
        
        if 'business' in path_str or 'business' in content_lower:
            return 'Business Strategy'
        
        if 'copywriting' in path_str or 'copy' in content_lower:
            return 'Copywriting'
        
        if 'sales' in path_str or 'sales' in content_lower:
            return 'Sales'
        
        if 'writing' in path_str or 'write' in content_lower:
            return 'Writing'
        
        if 'creative' in path_str or 'creative' in content_lower:
            return 'Creative'
        
        if 'technical' in path_str or 'code' in content_lower:
            return 'Technical'
        
        if 'education' in path_str or 'learn' in content_lower:
            return 'Education'
        
        if 'personal' in path_str or 'productivity' in content_lower:
            return 'Personal Development'
        
        return 'General'
    
    def detect_prompt_type(self, text: str) -> str:
        """Detect prompt type"""
        if '[' in text and ']' in text:
            return 'fill-in-blank'
        elif '?' in text:
            return 'question-based'
        elif 'act as' in text.lower() or 'you are' in text.lower():
            return 'role-play'
        else:
            return 'template'
    
    def extract_prompts_from_markdown(self, filepath: Path) -> List[Dict]:
        """Extract prompts from a markdown file"""
        prompts = []
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Skip files that are clearly not prompts
            skip_keywords = ['bonus', 'challenge', 'tutorial', 'guide', 'course', 'setup']
            if any(kw in filepath.name.lower() for kw in skip_keywords):
                return []
            
            # Get category from path
            category = self.detect_category(filepath, content)
            
            # Split by headers (# or ##)
            sections = re.split(r'\n#{1,2}\s+', content)
            
            for section in sections:
                section = section.strip()
                if len(section) < 30:  # Too short
                    continue
                
                # Get title (first line)
                lines = section.split('\n')
                title = lines[0].strip()
                
                # Get content (rest)
                prompt_text = '\n'.join(lines[1:]).strip()
                
                # Must have reasonable content
                if len(prompt_text) < 20:
                    continue
                
                # Skip if it's a table of contents or navigation
                if 'table of contents' in title.lower():
                    continue
                if title.lower().startswith('page '):
                    continue
                
                # Create prompt
                prompt = {
                    'name': title[:200],
                    'prompt_text': prompt_text[:10000],
                    'prompt_type': self.detect_prompt_type(prompt_text),
                    'category': category,
                    'source': 'Ultimate ChatGPT Bible 2.0',
                    'ai_model': 'ChatGPT'
                }
                
                # Check for duplicates
                if not self.is_duplicate(prompt['name'], prompt['prompt_text']):
                    prompts.append(prompt)
                else:
                    self.stats['duplicates_skipped'] += 1
            
        except Exception as e:
            self.stats['errors'] += 1
            print(f"   ⚠️  Error reading {filepath.name}: {e}")
        
        return prompts
    
    def extract_prompts_from_csv(self, filepath: Path) -> List[Dict]:
        """Extract prompts from a CSV file"""
        prompts = []
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                # Try to detect delimiter
                sample = f.read(1024)
                f.seek(0)
                
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
                
                reader = csv.DictReader(f, delimiter=delimiter)
                
                for row in reader:
                    # Find prompt column
                    prompt_text = None
                    title = None
                    category_col = None
                    
                    for key, value in row.items():
                        key_lower = key.lower()
                        
                        if 'prompt' in key_lower or 'content' in key_lower:
                            prompt_text = value
                        elif 'title' in key_lower or 'name' in key_lower:
                            title = value
                        elif 'category' in key_lower or 'type' in key_lower:
                            category_col = value
                    
                    if not prompt_text or len(prompt_text) < 20:
                        continue
                    
                    if not title:
                        title = prompt_text[:50] + "..."
                    
                    category = category_col if category_col else self.detect_category(filepath, prompt_text)
                    
                    prompt = {
                        'name': title[:200],
                        'prompt_text': prompt_text[:10000],
                        'prompt_type': self.detect_prompt_type(prompt_text),
                        'category': category,
                        'source': 'Ultimate ChatGPT Bible 2.0',
                        'ai_model': 'ChatGPT'
                    }
                    
                    if not self.is_duplicate(prompt['name'], prompt['prompt_text']):
                        prompts.append(prompt)
                    else:
                        self.stats['duplicates_skipped'] += 1
        
        except Exception as e:
            self.stats['errors'] += 1
            print(f"   ⚠️  Error reading CSV {filepath.name}: {e}")
        
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
                    self.existing_prompts.add(prompt['name'])
                    self.existing_prompts.add(hash(prompt['prompt_text'][:500]))
                else:
                    self.stats['errors'] += 1
            except Exception as e:
                self.stats['errors'] += 1
        
        return inserted
    
    def process_all_files(self):
        """Process all files in the export folder"""
        print(f"\n📂 Scanning folder: {self.export_folder}")
        
        # Find all markdown and CSV files
        md_files = list(self.export_folder.rglob('*.md'))
        csv_files = list(self.export_folder.rglob('*.csv'))
        
        print(f"   Found {len(md_files)} markdown files")
        print(f"   Found {len(csv_files)} CSV files")
        
        total_files = len(md_files) + len(csv_files)
        
        if total_files == 0:
            print("   ❌ No markdown or CSV files found!")
            return
        
        print(f"\n🔄 Processing files...")
        
        batch = []
        batch_size = 50
        
        # Process markdown files
        for i, md_file in enumerate(md_files, 1):
            prompts = self.extract_prompts_from_markdown(md_file)
            
            if prompts:
                batch.extend(prompts)
                self.stats['prompts_extracted'] += len(prompts)
            
            self.stats['files_processed'] += 1
            
            # Insert batch
            if len(batch) >= batch_size:
                inserted = self.insert_batch(batch)
                self.stats['prompts_inserted'] += inserted
                print(f"   📝 Processed {i}/{len(md_files)} MD files | Extracted: {self.stats['prompts_extracted']} | Inserted: {self.stats['prompts_inserted']}")
                batch = []
        
        # Process CSV files
        for csv_file in csv_files:
            print(f"\n   📊 Processing CSV: {csv_file.name}")
            prompts = self.extract_prompts_from_csv(csv_file)
            
            if prompts:
                batch.extend(prompts)
                self.stats['prompts_extracted'] += len(prompts)
                print(f"      Found {len(prompts)} prompts")
            
            self.stats['files_processed'] += 1
        
        # Insert remaining
        if batch:
            inserted = self.insert_batch(batch)
            self.stats['prompts_inserted'] += inserted
        
        # Final summary
        print(f"\n{'='*70}")
        print("📊 PROCESSING COMPLETE")
        print('='*70)
        print(f"Files Processed:      {self.stats['files_processed']}")
        print(f"Prompts Extracted:    {self.stats['prompts_extracted']}")
        print(f"Prompts Inserted:     {self.stats['prompts_inserted']}")
        print(f"Duplicates Skipped:   {self.stats['duplicates_skipped']}")
        print(f"Errors:               {self.stats['errors']}")
        print('='*70)

def main():
    print("="*70)
    print("📂 LOCAL NOTION EXPORT PROCESSOR")
    print("="*70)
    
    # Ask for folder path
    print("\n📁 Where is your 'Chatgpt Bible' folder?")
    print("   (The folder with 1,700 markdown files)")
    print()
    
    folder_path = input("Enter full path: ").strip()
    
    # Remove quotes if present
    folder_path = folder_path.strip('"').strip("'")
    
    if not os.path.exists(folder_path):
        print(f"\n❌ Folder not found: {folder_path}")
        print("\nTip: On Mac/Linux, you can drag the folder into the terminal")
        print("Tip: On Windows, right-click folder > Copy as path")
        return
    
    # Verify it looks right
    path = Path(folder_path)
    md_count = len(list(path.rglob('*.md')))
    csv_count = len(list(path.rglob('*.csv')))
    
    print(f"\n✅ Found folder!")
    print(f"   Markdown files: {md_count}")
    print(f"   CSV files: {csv_count}")
    
    if md_count == 0 and csv_count == 0:
        print("\n❌ No markdown or CSV files found in this folder!")
        print("   Make sure you pointed to the correct export folder.")
        return
    
    confirm = input(f"\nProcess {md_count + csv_count} files? (y/n): ")
    if confirm.lower() != 'y':
        return
    
    # Process
    processor = LocalExportProcessor(folder_path)
    processor.process_all_files()
    
    print("\n✅ Done! Run view_stats.py to see your results")

if __name__ == "__main__":
    main()
