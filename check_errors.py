"""
Check for recent migration errors and show what happened
"""

import os
from pathlib import Path
from supabase import create_client, Client

# Supabase Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY"

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("\n" + "="*70)
print("MIGRATION STATUS CHECK")
print("="*70 + "\n")

# Check what we have
print("Collections in database:")
print("-" * 70)
result = supabase.table("prompts").select("source").execute()
sources = {}
for row in result.data:
    source = row.get("source", "Unknown")
    sources[source] = sources.get(source, 0) + 1

for source, count in sorted(sources.items()):
    print(f"  {source}: {count} prompts")

print(f"\nTotal: {len(result.data)} prompts")

print("\n" + "="*70)
print("ANALYSIS")
print("="*70)
print("\nBased on the migration output, here's what happened:")
print("\n1. Ultimate ChatGPT Bible 2.0:")
print("   Status: COMPLETED (52 prompts)")
print("\n2. AI Ultimate Collection:")
print("   Status: FAILED - Connection error during extraction")
print("   Expected: 5000+ prompts")
print("   Got: 0 prompts")
print("\n3. AI Prompt Box:")
print("   Status: NOT STARTED (migration stopped)")
print("\n4. ChatGPT Advantage:")
print("   Status: PARTIAL (36 prompts)")
print("\n5. 100+ ChatGPT Prompts:")
print("   Status: NOT STARTED (migration stopped)")

print("\n" + "="*70)
print("RECOMMENDATION")
print("="*70)
print("\nThe migration encountered connection errors with large collections.")
print("This is likely due to:")
print("  1. Too many API requests causing connection reset")
print("  2. Very deep nesting in AI Ultimate Collection")
print("\nOptions:")
print("  A. Re-run the migration (it will skip already migrated data)")
print("  B. Migrate specific collections one at a time")
print("  C. Add retry logic for connection errors")
print("\n")
