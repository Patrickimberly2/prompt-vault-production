"""
Verification script to test Supabase connection and schema setup
"""

from supabase import create_client, Client
import sys

# Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY"

def verify_connection():
    """Verify connection to Supabase"""
    print("🔗 Testing Supabase connection...")
    try:
        client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase successfully!")
        return client
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        sys.exit(1)

def verify_tables(client: Client):
    """Verify all required tables exist"""
    print("\n📊 Verifying database tables...")
    
    required_tables = [
        "prompts",
        "categories",
        "prompt_categories",
        "tags",
        "prompt_tags",
        "collections",
        "favorites",
        "prompt_history",
        "usage_tracking",
        "migration_log"
    ]
    
    for table in required_tables:
        try:
            # Try to query the table
            response = client.table(table).select("*").limit(1).execute()
            print(f"   ✅ Table '{table}' exists")
        except Exception as e:
            print(f"   ❌ Table '{table}' missing or inaccessible: {e}")
            return False
    
    return True

def verify_categories(client: Client):
    """Verify categories are seeded"""
    print("\n📁 Verifying categories...")
    
    try:
        response = client.table("categories").select("name").execute()
        categories = [cat["name"] for cat in response.data]
        
        expected_categories = [
            "Content Marketing",
            "Social Media",
            "Email Marketing",
            "Social Media Management",
            "Copywriting",
            "Conversion Rate Optimization",
            "Growth Hacking",
            "Budget-Friendly Marketing",
            "Customer Relationship Management",
            "Financial Marketing",
            "Personal Branding",
            "Operations Management",
            "Innovation & Product Development",
            "Writing",
            "Productivity & Virtual Assistance",
            "Consulting",
            "Human Resources",
            "Legal & Compliance",
            "Creative Brainstorming"
        ]
        
        print(f"   Found {len(categories)} categories")
        
        missing = [cat for cat in expected_categories if cat not in categories]
        if missing:
            print(f"   ⚠️  Missing categories: {', '.join(missing)}")
            return False
        
        print("   ✅ All 19 main categories present")
        return True
        
    except Exception as e:
        print(f"   ❌ Failed to verify categories: {e}")
        return False

def verify_functions(client: Client):
    """Verify helper functions exist"""
    print("\n⚙️  Verifying helper functions...")
    
    # Test search function
    try:
        result = client.rpc("search_prompts", {"search_query": "test"}).execute()
        print("   ✅ search_prompts() function works")
    except Exception as e:
        print(f"   ⚠️  search_prompts() function issue: {e}")

def test_insert(client: Client):
    """Test inserting a sample prompt"""
    print("\n🧪 Testing sample insert...")
    
    try:
        # Insert test prompt
        test_prompt = {
            "name": "Test Prompt - Delete Me",
            "prompt_text": "This is a test prompt to verify insert functionality",
            "prompt_type": "test",
            "ai_model": "Universal",
            "source": "Verification Script",
            "status": "draft"
        }
        
        response = client.table("prompts").insert(test_prompt).execute()
        
        if response.data:
            prompt_id = response.data[0]["id"]
            print(f"   ✅ Successfully inserted test prompt (ID: {prompt_id})")
            
            # Clean up - delete test prompt
            client.table("prompts").delete().eq("id", prompt_id).execute()
            print(f"   ✅ Successfully deleted test prompt")
            return True
        else:
            print("   ❌ Failed to insert test prompt")
            return False
            
    except Exception as e:
        print(f"   ❌ Insert test failed: {e}")
        return False

def get_stats(client: Client):
    """Get current database statistics"""
    print("\n📈 Current Database Statistics:")
    
    try:
        # Count prompts
        prompts = client.table("prompts").select("*", count="exact").execute()
        print(f"   Prompts: {prompts.count}")
        
        # Count categories
        categories = client.table("categories").select("*", count="exact").execute()
        print(f"   Categories: {categories.count}")
        
        # Count collections
        collections = client.table("collections").select("*", count="exact").execute()
        print(f"   Collections: {collections.count}")
        
        # Count migration logs
        migrations = client.table("migration_log").select("*", count="exact").execute()
        print(f"   Migration Logs: {migrations.count}")
        
    except Exception as e:
        print(f"   ⚠️  Could not retrieve stats: {e}")

def main():
    """Main verification routine"""
    print("\n" + "="*60)
    print("PROMPTVAULT SUPABASE VERIFICATION")
    print("="*60 + "\n")
    
    # Connect
    client = verify_connection()
    
    # Verify tables
    if not verify_tables(client):
        print("\n❌ Table verification failed. Please run supabase_schema.sql first.")
        sys.exit(1)
    
    # Verify categories
    if not verify_categories(client):
        print("\n⚠️  Category verification failed. Some categories may be missing.")
    
    # Verify functions
    verify_functions(client)
    
    # Test insert
    if not test_insert(client):
        print("\n⚠️  Insert test failed. Check RLS policies or permissions.")
    
    # Get stats
    get_stats(client)
    
    print("\n" + "="*60)
    print("✅ VERIFICATION COMPLETE!")
    print("="*60)
    print("\nYour database is ready for migration.")
    print("Run: python migrate_notion_to_supabase.py")
    print("\n")

if __name__ == "__main__":
    main()
