"""
Clean Database and Re-run Migration
This script will:
1. Clean up test/partial data
2. Run a fresh migration with better error handling
"""

from supabase import create_client, Client
import sys
import os

# Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY"

def clean_database(client: Client):
    """Clean up existing data"""
    print("\n🧹 Cleaning database...")
    
    response = input("\n⚠️  This will delete ALL prompts and start fresh. Continue? (yes/no): ")
    
    if response.lower() != "yes":
        print("   ❌ Cleanup cancelled")
        return False
    
    try:
        # Delete in correct order (respect foreign keys)
        print("   Deleting category associations...")
        client.table("prompt_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("   Deleting tag associations...")
        client.table("prompt_tags").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("   Deleting favorites...")
        client.table("favorites").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("   Deleting usage tracking...")
        client.table("usage_tracking").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("   Deleting prompt history...")
        client.table("prompt_history").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("   Deleting prompts...")
        client.table("prompts").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("   Deleting collections...")
        client.table("collections").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("   Deleting migration logs...")
        client.table("migration_log").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("   ✅ Database cleaned successfully!")
        return True
        
    except Exception as e:
        print(f"   ❌ Error cleaning database: {e}")
        return False

def verify_stats(client: Client):
    """Show current stats"""
    print("\n📊 Current Statistics:")
    
    prompts = client.table("prompts").select("*", count="exact").execute()
    categories = client.table("prompt_categories").select("*", count="exact").execute()
    collections = client.table("collections").select("*", count="exact").execute()
    
    print(f"   Prompts: {prompts.count}")
    print(f"   Category Associations: {categories.count}")
    print(f"   Collections: {collections.count}")

def main():
    """Main cleanup routine"""
    print("\n" + "="*70)
    print("🧹 CLEAN DATABASE & PREPARE FOR MIGRATION".center(70))
    print("="*70)
    
    # Connect to Supabase
    try:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("\n✅ Connected to Supabase")
    except Exception as e:
        print(f"\n❌ Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    # Show current stats
    verify_stats(client)
    
    # Clean database
    if clean_database(client):
        verify_stats(client)
        
        print("\n" + "="*70)
        print("✅ CLEANUP COMPLETE!".center(70))
        print("="*70)
        print("\nDatabase is clean and ready for migration.")
        print("\nTo run migration, use:")
        print("  $env:NOTION_TOKEN='your_notion_token_here'")
        print("  python migrate_notion_to_supabase.py")
        print("\n")
    else:
        print("\n❌ Cleanup failed or was cancelled")
        sys.exit(1)

if __name__ == "__main__":
    main()
