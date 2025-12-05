#!/usr/bin/env python3
"""
Notion Markdown Export to PostgreSQL CSV Converter
Processes a directory of Notion markdown files and generates prompts.csv
"""

import os
import csv
import re
from pathlib import Path
from datetime import datetime
import frontmatter

# Configuration
NOTION_EXPORT_DIR = r"C:\Users\KLHst\prompt-vault-production\notion_export\ExportBlock"  # Update this path
OUTPUT_CSV = "prompts.csv"
ERROR_LOG = "import_errors.log"

def clean_content(text):
    """Remove excessive whitespace and clean markdown content"""
    # Remove multiple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Strip leading/trailing whitespace
    text = text.strip()
    # Escape quotes for CSV
    text = text.replace('"', '""')
    return text

def parse_tags(frontmatter_data):
    """Extract tags from frontmatter"""
    tags = frontmatter_data.get('tags', [])
    if isinstance(tags, str):
        # Handle comma-separated string
        tags = [t.strip() for t in tags.split(',')]
    elif not isinstance(tags, list):
        tags = []
    return tags

def format_postgres_array(items):
    """Format list as PostgreSQL array string: {"item1","item2"}"""
    if not items:
        return "{}"
    # Escape quotes and format
    escaped = ['"{}"'.format(str(item).replace('"', '\\"')) for item in items]
    return "{" + ",".join(escaped) + "}"

def process_markdown_file(file_path, base_dir):
    """Process a single markdown file and return row data"""
    try:
        # Extract title from filename
        title = file_path.stem
        
        # Determine category from parent directory
        relative_path = file_path.relative_to(base_dir)
        if len(relative_path.parts) > 1:
            category = relative_path.parts[-2]
        else:
            category = "Uncategorized"
        
        # Read file with frontmatter support
        with open(file_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
            content = clean_content(post.content)
            tags = parse_tags(post.metadata)
        
        # Get file modification time
        mod_time = datetime.fromtimestamp(file_path.stat().st_mtime)
        created_at = mod_time.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        return {
            'title': title,
            'content': content,
            'category': category,
            'tags': format_postgres_array(tags),
            'created_at': created_at
        }
    
    except Exception as e:
        return None, f"Error processing {file_path}: {str(e)}"

def main():
    """Main execution function"""
    base_path = Path(NOTION_EXPORT_DIR)
    
    if not base_path.exists():
        print(f"Error: Directory '{NOTION_EXPORT_DIR}' not found")
        return
    
    # Find all markdown files
    md_files = list(base_path.rglob("*.md"))
    print(f"Found {len(md_files)} markdown files")
    
    rows = []
    errors = []
    
    # Process each file
    for i, file_path in enumerate(md_files, 1):
        if i % 1000 == 0:
            print(f"Processed {i}/{len(md_files)} files...")
        
        result = process_markdown_file(file_path, base_path)
        
        if isinstance(result, tuple):  # Error occurred
            errors.append(result[1])
        else:
            rows.append(result)
    
    # Write CSV
    print(f"\nWriting {len(rows)} prompts to {OUTPUT_CSV}...")
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['title', 'content', 'category', 'tags', 'created_at']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        
        writer.writeheader()
        writer.writerows(rows)
    
    # Write error log
    if errors:
        print(f"\nWriting {len(errors)} errors to {ERROR_LOG}...")
        with open(ERROR_LOG, 'w', encoding='utf-8') as logfile:
            for error in errors:
                logfile.write(error + '\n')
    
    print(f"\n✓ Complete!")
    print(f"  - Successfully processed: {len(rows)} prompts")
    print(f"  - Errors logged: {len(errors)} files")
    print(f"  - Output: {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
