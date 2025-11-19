#!/usr/bin/env python3
"""
Convert Notion database export to prompts.csv
Handles the specific structure where Name = prompt content
"""

import csv
import json
from datetime import datetime

# Configuration
INPUT_FILE = "extract_27ba3b31_20251117_084625.json"  # Your JSON file
OUTPUT_CSV = "prompts.csv"

def generate_title(content, max_words=8):
    """Generate a short title from content (first N words)"""
    words = content.split()[:max_words]
    title = ' '.join(words)
    if len(content.split()) > max_words:
        title += "..."
    return title

def parse_categories(category_str):
    """Parse comma-separated categories, return first one"""
    if not category_str or category_str == '':
        return "Uncategorized"
    categories = [c.strip() for c in category_str.split(',')]
    return categories[0] if categories else "Uncategorized"

def parse_tags(category_str, subcategory_str):
    """Combine Category and Sub-Category into tags array"""
    tags = []
    
    # Add all categories as tags
    if category_str and category_str != '':
        categories = [c.strip() for c in category_str.split(',')]
        tags.extend(categories)
    
    # Add subcategory as tag
    if subcategory_str and subcategory_str != '':
        tags.append(subcategory_str)
    
    return tags

def format_postgres_array(items):
    """Format list as PostgreSQL array string: {"item1","item2"}"""
    if not items:
        return "{}"
    # Escape quotes and format
    escaped = ['"{}"'.format(str(item).replace('"', '\\"')) for item in items]
    return "{" + ",".join(escaped) + "}"

def convert_timestamp(iso_timestamp):
    """Convert ISO timestamp to PostgreSQL format"""
    if not iso_timestamp:
        return datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
    # Remove .000Z and add Z
    return iso_timestamp.replace('.000Z', 'Z')

def extract_notion_property(properties, prop_name):
    """Extract value from Notion property based on type"""
    if prop_name not in properties:
        return None
    
    prop = properties[prop_name]
    prop_type = prop.get('type')
    
    if prop_type == 'title':
        title_array = prop.get('title', [])
        return ' '.join([t.get('plain_text', '') for t in title_array])
    elif prop_type == 'rich_text':
        text_array = prop.get('rich_text', [])
        return ' '.join([t.get('plain_text', '') for t in text_array])
    elif prop_type == 'multi_select':
        items = prop.get('multi_select', [])
        return ', '.join([item.get('name', '') for item in items])
    elif prop_type == 'select':
        select = prop.get('select')
        return select.get('name', '') if select else ''
    elif prop_type == 'checkbox':
        return 'Yes' if prop.get('checkbox', False) else 'No'
    
    return None

def main():
    """Main conversion function"""
    print(f"Reading {INPUT_FILE}...")
    
    # Read JSON file
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Found {len(data)} records")
    
    rows = []
    
    for record in data:
        properties = record.get('properties', {})
        
        # Extract fields from Notion API format
        content = extract_notion_property(properties, 'Name')
        if not content or content.strip() == '':
            continue
        
        content = content.strip()
        
        # Generate title from first few words of content
        title = generate_title(content)
        
        # Get category (first one if multiple)
        category_raw = extract_notion_property(properties, 'Category') or ''
        category = parse_categories(category_raw)
        
        # Get subcategory
        subcategory = extract_notion_property(properties, 'Sub-Category') or ''
        
        # Combine Category and Sub-Category into tags
        tags = parse_tags(category_raw, subcategory)
        
        # Get timestamp
        created_at = convert_timestamp(record.get('created_time', ''))
        
        rows.append({
            'title': title,
            'content': content,
            'category': category,
            'tags': format_postgres_array(tags),
            'created_at': created_at
        })
    
    # Write CSV
    print(f"\nWriting {len(rows)} prompts to {OUTPUT_CSV}...")
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['title', 'content', 'category', 'tags', 'created_at']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✓ Success!")
    print(f"  - Processed: {len(rows)} prompts")
    print(f"  - Output: {OUTPUT_CSV}")
    print(f"\nSample row:")
    if rows:
        print(f"  Title: {rows[0]['title']}")
        print(f"  Content: {rows[0]['content'][:60]}...")
        print(f"  Category: {rows[0]['category']}")
        print(f"  Tags: {rows[0]['tags']}")

if __name__ == "__main__":
    main()
