"""
Cleanup and Organization Script
Final polish for beautiful site display
"""

import requests
import os
from collections import Counter
import re

SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def get_all_prompts():
    """Fetch all prompts from database"""
    print("📥 Loading all prompts...")
    url = f"{SUPABASE_URL}/rest/v1/prompts?select=*"
    response = requests.get(url, headers=headers, timeout=30)
    
    if response.status_code == 200:
        prompts = response.json()
        print(f"   Loaded {len(prompts)} prompts")
        return prompts
    else:
        print(f"   ❌ Error loading prompts: {response.status_code}")
        return []

def update_prompt(prompt_id: str, updates: dict):
    """Update a single prompt"""
    url = f"{SUPABASE_URL}/rest/v1/prompts?id=eq.{prompt_id}"
    response = requests.patch(url, headers=headers, json=updates, timeout=10)
    return response.status_code in [200, 204]

def remove_duplicates(prompts):
    """Remove duplicate prompts"""
    print("\n🔍 Checking for duplicates...")
    
    seen = {}
    duplicates = []
    
    for prompt in prompts:
        # Create hash from prompt text
        text_hash = hash(prompt.get('prompt_text', '')[:500])
        
        if text_hash in seen:
            duplicates.append(prompt['id'])
        else:
            seen[text_hash] = prompt['id']
    
    if duplicates:
        print(f"   Found {len(duplicates)} duplicates")
        print("   🗑️  Deleting duplicates...")
        
        for dup_id in duplicates:
            url = f"{SUPABASE_URL}/rest/v1/prompts?id=eq.{dup_id}"
            requests.delete(url, headers=headers, timeout=10)
        
        print(f"   ✅ Deleted {len(duplicates)} duplicates")
    else:
        print("   ✅ No duplicates found")
    
    return len(duplicates)

def fix_categories(prompts):
    """Standardize and fix categories"""
    print("\n📁 Fixing categories...")
    
    # Standard categories
    category_mapping = {
        'content marketing': 'Content Marketing',
        'social media': 'Social Media',
        'email marketing': 'Email Marketing',
        'copywriting': 'Copywriting',
        'business': 'Business Strategy',
        'sales': 'Sales',
        'writing': 'Writing',
        'creative': 'Creative',
        'technical': 'Technical',
        'coding': 'Technical',
        'analysis': 'Analysis',
        'personal': 'Personal Development',
        'education': 'Education',
        'marketing': 'Content Marketing'
    }
    
    updated = 0
    
    for prompt in prompts:
        category = prompt.get('category', 'General')
        
        if not category or category == 'null':
            # Try to detect from content
            text = (prompt.get('name', '') + ' ' + prompt.get('prompt_text', '')).lower()
            
            for key, standard_cat in category_mapping.items():
                if key in text:
                    if update_prompt(prompt['id'], {'category': standard_cat}):
                        updated += 1
                    break
        else:
            # Standardize existing category
            category_lower = category.lower().strip()
            if category_lower in category_mapping:
                standard_cat = category_mapping[category_lower]
                if category != standard_cat:
                    if update_prompt(prompt['id'], {'category': standard_cat}):
                        updated += 1
    
    print(f"   ✅ Updated {updated} categories")
    return updated

def add_use_cases(prompts):
    """Add use_case field based on content"""
    print("\n🎯 Adding use cases...")
    
    use_case_keywords = {
        'Business': ['business', 'strategy', 'management', 'finance', 'startup'],
        'Creative': ['creative', 'idea', 'brainstorm', 'design', 'art'],
        'Learning': ['learn', 'teach', 'education', 'study', 'tutorial'],
        'Technical': ['code', 'programming', 'technical', 'api', 'debug'],
        'Personal': ['personal', 'productivity', 'goal', 'motivation'],
        'Marketing': ['marketing', 'campaign', 'advertising', 'seo', 'social'],
        'Writing': ['write', 'content', 'blog', 'article', 'copy']
    }
    
    updated = 0
    
    for prompt in prompts:
        if not prompt.get('use_case'):
            text = (prompt.get('name', '') + ' ' + prompt.get('prompt_text', '')).lower()
            
            for use_case, keywords in use_case_keywords.items():
                if any(keyword in text for keyword in keywords):
                    if update_prompt(prompt['id'], {'use_case': use_case}):
                        updated += 1
                    break
    
    print(f"   ✅ Updated {updated} use cases")
    return updated

def calculate_popularity(prompts):
    """Calculate initial popularity scores"""
    print("\n⭐ Calculating popularity scores...")
    
    updated = 0
    
    for prompt in prompts:
        # Base score
        score = 50
        
        # Bonus for complete information
        if prompt.get('category') and prompt.get('category') != 'General':
            score += 10
        if prompt.get('use_case'):
            score += 10
        if len(prompt.get('prompt_text', '')) > 100:
            score += 10
        if '[' in prompt.get('prompt_text', '') and ']' in prompt.get('prompt_text', ''):
            score += 5  # Fill-in-blank are popular
        if '?' in prompt.get('name', ''):
            score += 5  # Questions are popular
        
        # Length bonus (not too short, not too long)
        text_len = len(prompt.get('prompt_text', ''))
        if 100 < text_len < 500:
            score += 10
        
        if update_prompt(prompt['id'], {'times_used': score}):
            updated += 1
    
    print(f"   ✅ Updated {updated} popularity scores")
    return updated

def generate_statistics(prompts):
    """Generate final statistics"""
    print("\n" + "="*70)
    print("📊 FINAL DATABASE STATISTICS")
    print("="*70)
    
    # Total counts
    print(f"\n📝 Total Prompts: {len(prompts)}")
    
    # By category
    categories = Counter(p.get('category', 'Unknown') for p in prompts)
    print(f"\n📁 Top 10 Categories:")
    for cat, count in categories.most_common(10):
        print(f"   {cat}: {count}")
    
    # By AI model
    models = Counter(p.get('ai_model', 'Unknown') for p in prompts)
    print(f"\n🤖 By AI Model:")
    for model, count in models.most_common():
        print(f"   {model}: {count}")
    
    # By type
    types = Counter(p.get('prompt_type', 'Unknown') for p in prompts)
    print(f"\n📋 By Type:")
    for ptype, count in types.most_common():
        print(f"   {ptype}: {count}")
    
    # By source
    sources = Counter(p.get('source', 'Unknown') for p in prompts)
    print(f"\n📚 By Source:")
    for source, count in sources.most_common():
        print(f"   {source}: {count}")
    
    # Quality metrics
    with_use_case = sum(1 for p in prompts if p.get('use_case'))
    with_category = sum(1 for p in prompts if p.get('category') and p.get('category') != 'General')
    
    print(f"\n✅ Quality Metrics:")
    print(f"   With Use Case: {with_use_case} ({with_use_case/len(prompts)*100:.1f}%)")
    print(f"   With Category: {with_category} ({with_category/len(prompts)*100:.1f}%)")
    
    # Recommendations
    print(f"\n💡 Recommendations for Your Site:")
    print(f"   - Feature top 10-20 prompts from each category")
    print(f"   - Create 'Popular' section with prompts scoring 70+")
    print(f"   - Add search by AI model filter")
    print(f"   - Create beginner-friendly section for short prompts")
    
    print("="*70)

def main():
    print("="*70)
    print("🔧 CLEANUP & ORGANIZATION")
    print("="*70)
    
    # Load all prompts
    prompts = get_all_prompts()
    
    if not prompts:
        print("❌ No prompts found!")
        return
    
    # Run cleanup operations
    stats = {
        'duplicates_removed': remove_duplicates(prompts),
        'categories_fixed': fix_categories(prompts),
        'use_cases_added': add_use_cases(prompts),
        'popularity_calculated': calculate_popularity(prompts)
    }
    
    # Reload for final stats
    prompts = get_all_prompts()
    
    # Generate final statistics
    generate_statistics(prompts)
    
    print(f"\n{'='*70}")
    print("✅ CLEANUP COMPLETE!")
    print('='*70)
    print(f"Duplicates Removed:    {stats['duplicates_removed']}")
    print(f"Categories Fixed:      {stats['categories_fixed']}")
    print(f"Use Cases Added:       {stats['use_cases_added']}")
    print(f"Popularity Calculated: {stats['popularity_calculated']}")
    print('='*70)
    print("\n🎉 Your database is ready for your site!")
    print("📊 Run view_stats.py anytime to see current statistics")

if __name__ == "__main__":
    main()
