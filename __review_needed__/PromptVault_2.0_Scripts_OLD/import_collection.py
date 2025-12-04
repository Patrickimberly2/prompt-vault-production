import os
import re
from supabase import create_client, Client

# ================================================================
# CONFIGURATION
# ================================================================
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
# REPLACE WITH YOUR SERVICE_ROLE KEY (Admin Key)
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY" 
COLLECTION_NAME = "AI Ultimate Collection"

# LIST OF FILES TO IMPORT
SOURCE_FILES = ["source_data.md", "source_info.md"] 

def connect_db():
    print("🔗 Connecting to Supabase...")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def slugify(text):
    """Converts 'Social Media Marketing' to 'social-media-marketing'"""
    return text.lower().strip().replace(" ", "-").replace("&", "and").replace(",", "")

def get_or_create_collection(supabase, name):
    """Creates the parent collection entry"""
    print(f"📂 Checking Collection: {name}...")
    res = supabase.table("collections").select("id").eq("name", name).execute()
    if res.data:
        return res.data[0]['id']
    
    data = {
        "name": name,
        "description": "Imported from AI Ultimate Collection Markdown",
        "total_prompts": 0
    }
    res = supabase.table("collections").insert(data).execute()
    return res.data[0]['id']

def get_or_create_category(supabase, name):
    """Ensures category exists and returns ID"""
    slug = slugify(name)
    res = supabase.table("categories").select("id").eq("slug", slug).execute()
    if res.data:
        return res.data[0]['id']
    
    data = {
        "name": name,
        "slug": slug,
        "description": f"Category imported from {COLLECTION_NAME}"
    }
    try:
        res = supabase.table("categories").insert(data).execute()
        return res.data[0]['id']
    except Exception as e:
        print(f"   ⚠️ Category warning: {e}")
        return None

def parse_and_import(supabase, collection_id, filename):
    print(f"\n📖 Reading file: {filename}...")
    
    try:
        with open(filename, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"   ❌ Error: File '{filename}' not found. Skipping.")
        return 0

    current_section = None # "Midjourney" or "ChatGPT"
    current_category = "General"
    current_subcategory = None
    
    prompts_to_insert = []
    
    # Regex patterns
    bold_list_pattern = re.compile(r'^\d+\. \*\*(.+)\*\*') # Matches 1. **Topic**
    
    for line in lines:
        line = line.strip()
        if not line: continue

        # 1. DETECT SECTION HEADERS (Critical for parser to know what mode to use)
        if "Midjourney AI Art Prompts" in line:
            current_section = "Midjourney"
            print(f"   Found section: Midjourney in {filename}")
            continue
        elif "10,000 ChatGPT Prompts" in line:
            current_section = "ChatGPT"
            print(f"   Found section: ChatGPT in {filename}")
            continue

        # 2. PARSE MIDJOURNEY PROMPTS
        if current_section == "Midjourney":
            if line.startswith("###"):
                current_category = line.replace("###", "").replace("Prompts", "").strip()
            elif (line.startswith("Capture") or line.startswith("Imagine") or line.startswith("Depict")) and "--ar" in line:
                prompts_to_insert.append({
                    "name": f"{current_category} Concept",
                    "prompt_text": line,
                    "ai_model": "Midjourney",
                    "category": current_category,
                    "prompt_type": "image-generation"
                })

        # 3. PARSE CHATGPT PROMPTS
        if current_section == "ChatGPT":
            if line.startswith("## "):
                current_category = line.replace("##", "").replace("Prompts", "").strip()
            elif bold_list_pattern.match(line):
                match = bold_list_pattern.match(line)
                current_subcategory = match.group(1).split(":")[0]
            elif line[0].isdigit() and "." in line and ("[" in line or ":" in line):
                clean_prompt = re.sub(r'^\d+\.\s+', '', line)
                prompts_to_insert.append({
                    "name": current_subcategory if current_subcategory else current_category,
                    "prompt_text": clean_prompt,
                    "ai_model": "ChatGPT",
                    "category": current_category,
                    "prompt_type": "text-generation"
                })

    print(f"   ⚡ Found {len(prompts_to_insert)} prompts in {filename}")
    
    # 4. INSERT PROCESS
    print("   🚀 Importing to Supabase...")
    category_cache = {}
    count = 0
    
    for p in prompts_to_insert:
        cat_name = p['category']
        if cat_name not in category_cache:
            cat_id = get_or_create_category(supabase, cat_name)
            category_cache[cat_name] = cat_id
        
        cat_id = category_cache[cat_name]
        if not cat_id: continue

        prompt_payload = {
            "name": p['name'],
            "prompt_text": p['prompt_text'],
            "ai_model": p['ai_model'],
            "prompt_type": p['prompt_type'],
            "status": "active",
            "source": COLLECTION_NAME
        }
        
        try:
            res = supabase.table("prompts").insert(prompt_payload).execute()
            if res.data:
                new_prompt_id = res.data[0]['id']
                supabase.table("prompt_categories").insert({
                    "prompt_id": new_prompt_id,
                    "category_id": cat_id
                }).execute()
                count += 1
        except Exception as e:
            print(f"   Error inserting prompt: {e}")

    return count

if __name__ == "__main__":
    try:
        client = connect_db()
        coll_id = get_or_create_collection(client, COLLECTION_NAME)
        
        total_imported = 0
        for filename in SOURCE_FILES:
            total_imported += parse_and_import(client, coll_id, filename)
            
        # Update total count
        supabase.table("collections").update({"total_prompts": total_imported}).eq("id", coll_id).execute()
        print(f"\n✅ BATCH IMPORT COMPLETE! Total prompts imported: {total_imported}")
        
    except Exception as e:
        print(f"❌ Fatal Error: {e}")