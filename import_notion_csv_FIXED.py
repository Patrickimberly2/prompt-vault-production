#!/usr/bin/env python3
"""
PromptVault 2.0 - Notion CSV Importer (No .env needed)
Imports prompts from chatgpt_bible_subpages.csv
"""

import os
import csv
import time
from datetime import datetime
from supabase import create_client, Client

# Supabase configuration (HARDCODED - No .env file needed!)
SUPABASE_URL = 'https://zqkcoyoknddubrobhfrp.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY'

# CSV file path
CSV_PATH = r"C:\Users\KLHst\OneDrive\Documents\GitHub\prompt-vault-production\chatgpt_bible_subpages.csv"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Statistics
stats = {
    'total_rows': 0,
    'imported': 0,
    'skipped': 0,
    'errors': 0,
    'start_time': None,
    'end_time': None
}

# Category mappings
CATEGORY_MAPPING = {
    'Content Marketing': 'Content Marketing',
    'Social Media': 'Social Media',
    'Email Marketing': 'Email Marketing',
    'Social Media Management': 'Social Media Management',
    'Copywriting': 'Copywriting',
    'Conversion Rate Optimization (CRO)': 'Conversion Rate Optimization',
    'Growth Hacking': 'Growth Hacking',
    'Budget-Friendly Marketing': 'Budget-Friendly Marketing',
    'Customer Relationship Management (CRM)': 'Customer Relationship Management',
    'Financial Marketing': 'Financial Marketing',
    'Personal Branding for Entrepreneurs': 'Personal Branding',
    'Operations and Process Management': 'Operations Management',
    'Innovation and Product Development': 'Product Development',
    'Writing': 'Writing',
    'Productivity & Virtual Assistance': 'Productivity & Virtual Assistance',
    'Consulting': 'Consulting',
    'Human Resources': 'Human Resources',
    'Legal & Compliance': 'Legal & Compliance',
    'Creative Brainstorming': 'Creative Brainstorming',
    'General': 'General'
}

def normalize_category(category):
    """Normalize category name"""
    return CATEGORY_MAPPING.get(category, category)

def create_prompt_from_row(row):
    """Create a prompt object from CSV row"""
    category = row.get('Category', '').strip()
    subpage_title = row.get('Subpage Title', '').strip()
    page_id = row.get('Page ID', '').strip()
    page_url = row.get('Page URL', '').strip()
    
    # Skip BONUS pages
    if 'BONUS' in subpage_title or 'Perfect AI Partner' in subpage_title:
        return None
    
    # Skip empty rows
    if not category or not subpage_title:
        return None
    
    # Normalize category
    normalized_category = normalize_category(category)
    
    # Create prompt object
    prompt = {
        'title': subpage_title,
        'name': subpage_title,
        'content': f"Prompts and templates for {subpage_title}",
        'prompt_text': f"[{subpage_title}]: Use ChatGPT to assist with {subpage_title.lower()}. This includes strategies, templates, and best practices for effective implementation.",
        'prompt_type': 'template',
        'ai_model': 'ChatGPT',
        'status': 'active',
        'source': 'ChatGPT Bible (Notion)',
        'source_page_url': page_url if page_url else None,
        'tried': False,
        'times_used': 0,
        'migrated_date': datetime.utcnow().isoformat(),
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    return prompt, normalized_category

def check_duplicate(title):
    """Check if prompt already exists"""
    try:
        result = supabase.table('prompts').select('id').eq('title', title).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"   ⚠️  Error checking duplicate: {str(e)}")
        return False

def insert_prompt(prompt):
    """Insert prompt into Supabase"""
    try:
        result = supabase.table('prompts').insert(prompt).execute()
        return True
    except Exception as e:
        print(f"   ❌ Error inserting prompt: {str(e)}")
        return False

def ensure_category_exists(category_name):
    """Ensure category exists"""
    try:
        result = supabase.table('categories').select('id').eq('name', category_name).execute()
        
        if not result.data:
            category = {
                'name': category_name,
                'description': f'Prompts related to {category_name}',
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            supabase.table('categories').insert(category).execute()
            print(f"   ✅ Created category: {category_name}")
    except Exception as e:
        print(f"   ⚠️  Error ensuring category: {str(e)}")

def link_prompt_to_category(prompt_title, category_name):
    """Link prompt to category"""
    try:
        # Get prompt ID
        prompt_result = supabase.table('prompts').select('id').eq('title', prompt_title).execute()
        if not prompt_result.data:
            return False
        
        prompt_id = prompt_result.data[0]['id']
        
        # Get category ID
        category_result = supabase.table('categories').select('id').eq('name', category_name).execute()
        if not category_result.data:
            return False
        
        category_id = category_result.data[0]['id']
        
        # Check if link exists
        existing = supabase.table('prompt_categories').select('id').eq('prompt_id', prompt_id).eq('category_id', category_id).execute()
        
        if not existing.data:
            link = {
                'prompt_id': prompt_id,
                'category_id': category_id,
                'created_at': datetime.utcnow().isoformat()
            }
            supabase.table('prompt_categories').insert(link).execute()
        
        return True
    except Exception as e:
        print(f"   ⚠️  Error linking to category: {str(e)}")
        return False

def import_csv():
    """Import prompts from CSV file"""
    print("=" * 70)
    print("🚀 NOTION CSV IMPORT - ChatGPT Bible")
    print("=" * 70)
    print()
    
    # Check if CSV exists
    if not os.path.exists(CSV_PATH):
        print(f"❌ CSV file not found: {CSV_PATH}")
        print()
        print("Please make sure chatgpt_bible_subpages.csv is in the folder:")
        print("C:\\Users\\KLHst\\OneDrive\\Documents\\GitHub\\prompt-vault-production\\")
        return
    
    print(f"📄 Reading CSV: {CSV_PATH}")
    print()
    
    stats['start_time'] = time.time()
    
    # Read CSV
    try:
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            stats['total_rows'] = len(rows)
            
            print(f"📊 Found {len(rows)} rows in CSV")
            print()
            print("=" * 70)
            print("PROCESSING PROMPTS")
            print("=" * 70)
            print()
            
            # Process each row
            for i, row in enumerate(rows, 1):
                try:
                    result = create_prompt_from_row(row)
                    
                    if result is None:
                        stats['skipped'] += 1
                        continue
                    
                    prompt, category = result
                    title = prompt['title']
                    
                    # Check for duplicates
                    if check_duplicate(title):
                        print(f"⏩ [{i}/{len(rows)}] Skipped (duplicate): {title}")
                        stats['skipped'] += 1
                        continue
                    
                    # Ensure category exists
                    ensure_category_exists(category)
                    
                    # Insert prompt
                    if insert_prompt(prompt):
                        link_prompt_to_category(title, category)
                        print(f"✅ [{i}/{len(rows)}] Imported: {title} → {category}")
                        stats['imported'] += 1
                    else:
                        stats['errors'] += 1
                    
                    # Rate limiting
                    time.sleep(0.1)
                    
                except Exception as e:
                    print(f"❌ [{i}/{len(rows)}] Error: {str(e)}")
                    stats['errors'] += 1
                    continue
    
    except Exception as e:
        print(f"❌ Error reading CSV: {str(e)}")
        return
    
    stats['end_time'] = time.time()
    
    # Print summary
    print()
    print("=" * 70)
    print("📊 IMPORT SUMMARY")
    print("=" * 70)
    print(f"Total Rows:       {stats['total_rows']}")
    print(f"✅ Imported:      {stats['imported']}")
    print(f"⏩ Skipped:       {stats['skipped']}")
    print(f"❌ Errors:        {stats['errors']}")
    print(f"⏱️  Time:          {stats['end_time'] - stats['start_time']:.2f}s")
    print()
    
    print("=" * 70)
    print("🎉 IMPORT COMPLETE!")
    print("=" * 70)
    print()
    print("Next steps:")
    print("1. Run: python view_stats.py")
    print("2. Verify your data in Supabase")
    print("3. Test your frontend!")
    print()

if __name__ == '__main__':
    import_csv()
