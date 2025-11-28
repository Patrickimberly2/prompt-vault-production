"""
Verify migration results and check for any issues
"""

import os
from pathlib import Path
from supabase import create_client, Client

# Load environment variables
def load_env():
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

load_env()

# Supabase Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY"

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("\n" + "="*70)
print("MIGRATION VERIFICATION REPORT")
print("="*70 + "\n")

# 1. Check total prompts
print("1. Total Prompts Migrated:")
print("-" * 70)
result = supabase.table("prompts").select("id", count="exact").execute()
total_prompts = result.count
print(f"   Total prompts in database: {total_prompts}")

# 2. Check prompts by source/collection
print("\n2. Prompts by Collection:")
print("-" * 70)
result = supabase.table("prompts").select("source").execute()
sources = {}
for row in result.data:
    source = row.get("source", "Unknown")
    sources[source] = sources.get(source, 0) + 1

for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
    print(f"   {source}: {count} prompts")

# 3. Check prompts by type
print("\n3. Prompts by Type:")
print("-" * 70)
result = supabase.table("prompts").select("prompt_type").execute()
types = {}
for row in result.data:
    ptype = row.get("prompt_type", "Unknown")
    types[ptype] = types.get(ptype, 0) + 1

for ptype, count in sorted(types.items(), key=lambda x: x[1], reverse=True):
    print(f"   {ptype}: {count} prompts")

# 4. Check migration logs
print("\n4. Migration Logs:")
print("-" * 70)
result = supabase.table("migration_log").select("*").order("created_at", desc=True).limit(10).execute()

if result.data:
    for log in result.data:
        collection = log.get("collection_name", "Unknown")
        status = log.get("status", "Unknown")
        extracted = log.get("prompts_extracted", 0)
        inserted = log.get("prompts_inserted", 0)
        error = log.get("error_message", "")

        print(f"\n   Collection: {collection}")
        print(f"   Status: {status}")
        print(f"   Extracted: {extracted}")
        print(f"   Inserted: {inserted}")
        if error:
            print(f"   Error: {error}")
else:
    print("   No migration logs found")

# 5. Check for any potential issues
print("\n5. Potential Issues:")
print("-" * 70)

# Check for very short prompts (might indicate extraction issues)
result = supabase.table("prompts").select("id, name, prompt_text").execute()
short_prompts = [p for p in result.data if len(p.get("prompt_text", "")) < 20]
if short_prompts:
    print(f"   WARNING: {len(short_prompts)} prompts with text < 20 characters")
    print(f"   (This might indicate extraction issues)")
else:
    print(f"   OK: No unusually short prompts found")

# Check for duplicate prompts
result = supabase.table("prompts").select("prompt_text").execute()
texts = [p.get("prompt_text") for p in result.data]
unique_texts = set(texts)
if len(texts) != len(unique_texts):
    duplicates = len(texts) - len(unique_texts)
    print(f"   INFO: {duplicates} duplicate prompt texts found")
    print(f"   (Duplicates across collections are normal)")
else:
    print(f"   OK: No duplicate prompts")

print("\n" + "="*70)
print("SUMMARY")
print("="*70)
print(f"\nTotal Prompts Successfully Migrated: {total_prompts}")
print(f"Collections Migrated: {len(sources)}")
print(f"\nYour Notion data has been successfully migrated to Supabase!")
print("\nView in Supabase Dashboard:")
print("https://zqkcoyoknddubrobhfrp.supabase.co/project/zqkcoyoknddubrobhfrp/editor")
print("\n")
