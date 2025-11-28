"""
Fix Issues with the Clone
1. Fix stuck migration logs
2. Associate existing prompts with categories
3. Test migration with better error reporting
"""

from supabase import create_client, Client
import sys

# Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY"

def fix_stuck_migrations(client: Client):
    """Fix stuck migration logs"""
    print("\n🔧 Fixing stuck migration logs...")
    
    # Find processing migrations
    stuck = client.table("migration_log") \
        .select("*") \
        .eq("status", "processing") \
        .execute()
    
    if not stuck.data:
        print("   ✅ No stuck migrations found")
        return
    
    print(f"   Found {len(stuck.data)} stuck migrations")
    
    for log in stuck.data:
        # Update to failed status
        client.table("migration_log") \
            .update({
                "status": "failed",
                "error_message": "Migration interrupted - marked as failed for cleanup",
                "completed_at": "now()"
            }) \
            .eq("id", log["id"]) \
            .execute()
        
        print(f"   ✅ Marked '{log['collection_name']}' as failed")

def associate_prompts_with_categories(client: Client):
    """Associate existing prompts with categories based on source field"""
    print("\n📁 Associating prompts with categories...")
    
    # Get all categories
    categories = client.table("categories").select("id, name").execute()
    category_map = {cat["name"]: cat["id"] for cat in categories.data}
    
    # Get all prompts without categories
    prompts = client.table("prompts").select("id, source").execute()
    
    # Map sources to categories (best guess based on source names)
    source_to_category = {
        "Business Idea Generation": "Creative Brainstorming",
        "Problem-Solving Technique Development": "Consulting",
        "Creative Metaphor Generation": "Writing",
        "Conceptual Framework Creation": "Innovation & Product Development"
    }
    
    associations_added = 0
    
    for prompt in prompts.data:
        source = prompt.get("source")
        if not source:
            continue
        
        # Try to find matching category
        category_name = source_to_category.get(source)
        if not category_name or category_name not in category_map:
            continue
        
        category_id = category_map[category_name]
        
        # Check if association already exists
        existing = client.table("prompt_categories") \
            .select("*") \
            .eq("prompt_id", prompt["id"]) \
            .eq("category_id", category_id) \
            .execute()
        
        if existing.data:
            continue
        
        # Add association
        try:
            client.table("prompt_categories") \
                .insert({
                    "prompt_id": prompt["id"],
                    "category_id": category_id
                }) \
                .execute()
            associations_added += 1
        except Exception as e:
            print(f"   ⚠️  Error associating prompt {prompt['id']}: {e}")
    
    print(f"   ✅ Added {associations_added} category associations")

def test_notion_connection():
    """Test Notion API connection"""
    print("\n🔗 Testing Notion API connection...")
    
    import os
    notion_token = os.getenv("NOTION_TOKEN")
    
    if not notion_token:
        print("   ❌ NOTION_TOKEN not found in environment")
        return False
    
    import requests
    
    headers = {
        "Authorization": f"Bearer {notion_token}",
        "Notion-Version": "2022-06-28"
    }
    
    # Test with a simple request
    try:
        response = requests.get(
            "https://api.notion.com/v1/users/me",
            headers=headers
        )
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"   ✅ Connected as: {user_data.get('name', 'Bot User')}")
            return True
        else:
            print(f"   ❌ API returned status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Connection error: {e}")
        return False

def test_page_access():
    """Test access to migration pages"""
    print("\n📄 Testing access to Notion pages...")
    
    import os
    import requests
    
    notion_token = os.getenv("NOTION_TOKEN")
    
    if not notion_token:
        print("   ❌ NOTION_TOKEN not found")
        return False
    
    headers = {
        "Authorization": f"Bearer {notion_token}",
        "Notion-Version": "2022-06-28"
    }
    
    # Test pages from migration config
    test_pages = {
        "Ultimate ChatGPT Bible 2.0": "2b0a3b31e44780ffa1cbccd08b96957a",
        "AI Ultimate Collection": "2aaa3b31e44780df9ff0f7db9c071a0b",
    }
    
    for name, page_id in test_pages.items():
        try:
            response = requests.get(
                f"https://api.notion.com/v1/pages/{page_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                print(f"   ✅ Can access: {name}")
            elif response.status_code == 404:
                print(f"   ❌ Not found: {name} (page may have been deleted or moved)")
            elif response.status_code == 403:
                print(f"   ❌ No permission: {name} (share the page with your integration)")
            else:
                print(f"   ⚠️  {name}: Status {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error accessing {name}: {e}")
    
    return True

def show_summary(client: Client):
    """Show current database summary"""
    print("\n📊 Current Database Summary:")
    
    # Count prompts
    prompts = client.table("prompts").select("*", count="exact").execute()
    print(f"   Prompts: {prompts.count}")
    
    # Count category associations
    associations = client.table("prompt_categories").select("*", count="exact").execute()
    print(f"   Category Associations: {associations.count}")
    
    # Count collections
    collections = client.table("collections").select("*", count="exact").execute()
    print(f"   Collections: {collections.count}")
    
    # Count migration logs by status
    completed = client.table("migration_log").select("*", count="exact").eq("status", "completed").execute()
    failed = client.table("migration_log").select("*", count="exact").eq("status", "failed").execute()
    processing = client.table("migration_log").select("*", count="exact").eq("status", "processing").execute()
    
    print(f"   Migration Logs:")
    print(f"     - Completed: {completed.count}")
    print(f"     - Failed: {failed.count}")
    print(f"     - Processing: {processing.count}")

def main():
    """Main fix routine"""
    print("\n" + "="*70)
    print("🛠️  FIX ISSUES WITH PROMPT ORGANIZER CLONE".center(70))
    print("="*70)
    
    # Connect to Supabase
    try:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("\n✅ Connected to Supabase")
    except Exception as e:
        print(f"\n❌ Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    # Run fixes
    fix_stuck_migrations(client)
    associate_prompts_with_categories(client)
    test_notion_connection()
    test_page_access()
    show_summary(client)
    
    print("\n" + "="*70)
    print("✅ FIX COMPLETE!".center(70))
    print("="*70)
    print("\nNext steps:")
    print("1. If Notion connection works, run: python migrate_notion_to_supabase.py")
    print("2. If Notion connection fails, check your NOTION_TOKEN in .env")
    print("3. If pages not accessible, share them with your Notion integration")
    print("\n")

if __name__ == "__main__":
    main()
