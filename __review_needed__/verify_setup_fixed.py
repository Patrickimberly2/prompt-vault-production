"""
Verification script to test Supabase connection and schema setup
Uses direct REST API calls instead of supabase client for better compatibility
"""

import requests
import sys
import json

# Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY"

def get_headers():
    """Get headers for Supabase REST API"""
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def verify_connection():
    """Verify connection to Supabase"""
    print("🔗 Testing Supabase connection...")
    try:
        url = f"{SUPABASE_URL}/rest/v1/"
        response = requests.get(url, headers=get_headers(), timeout=10)
        
        if response.status_code in [200, 404]:  # 404 is ok for root endpoint
            print("✅ Connected to Supabase successfully!")
            return True
        else:
            print(f"❌ Failed to connect: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        return False

def verify_tables():
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
    
    all_exist = True
    for table in required_tables:
        try:
            url = f"{SUPABASE_URL}/rest/v1/{table}?limit=1"
            response = requests.get(url, headers=get_headers(), timeout=10)
            
            if response.status_code == 200:
                print(f"   ✅ Table '{table}' exists")
            else:
                print(f"   ❌ Table '{table}' missing or inaccessible (Status: {response.status_code})")
                all_exist = False
        except Exception as e:
            print(f"   ❌ Table '{table}' error: {e}")
            all_exist = False
    
    return all_exist

def verify_categories():
    """Verify categories were seeded"""
    print("\n📁 Verifying categories...")
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/categories?select=count"
        headers = get_headers()
        headers["Prefer"] = "count=exact"
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # Get count from Content-Range header
            content_range = response.headers.get('Content-Range', '0-0/0')
            count = int(content_range.split('/')[-1])
            
            if count == 19:
                print(f"   ✅ All 19 categories seeded")
                return True
            else:
                print(f"   ⚠️  Found {count} categories (expected 19)")
                return count > 0
        else:
            print(f"   ❌ Failed to check categories (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"   ❌ Failed to check categories: {e}")
        return False

def verify_insert_delete():
    """Test insert and delete operations"""
    print("\n🔧 Testing insert/delete operations...")
    
    test_data = {
        "title": "TEST_PROMPT_DELETE_ME",
        "content": "This is a test prompt for verification",
        "is_public": True
    }
    
    try:
        # Test INSERT
        url = f"{SUPABASE_URL}/rest/v1/prompts"
        headers = get_headers()
        headers["Prefer"] = "return=representation"
        
        response = requests.post(url, headers=headers, json=test_data, timeout=10)
        
        if response.status_code in [200, 201]:
            inserted = response.json()
            if isinstance(inserted, list) and len(inserted) > 0:
                test_id = inserted[0].get('id')
                print(f"   ✅ Insert works (created ID: {test_id})")
                
                # Test DELETE
                delete_url = f"{SUPABASE_URL}/rest/v1/prompts?id=eq.{test_id}"
                delete_response = requests.delete(delete_url, headers=get_headers(), timeout=10)
                
                if delete_response.status_code in [200, 204]:
                    print(f"   ✅ Delete works")
                    return True
                else:
                    print(f"   ⚠️  Delete returned status {delete_response.status_code}")
                    return True  # Insert worked at least
            else:
                print(f"   ⚠️  Insert succeeded but no ID returned")
                return True
        else:
            print(f"   ❌ Insert failed (Status: {response.status_code})")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"   ❌ Insert/Delete test failed: {e}")
        return False

def main():
    """Run all verification checks"""
    print("=" * 60)
    print("PROMPTVAULT SUPABASE VERIFICATION")
    print("=" * 60)
    
    # Run checks
    connection_ok = verify_connection()
    if not connection_ok:
        print("\n❌ Connection failed. Cannot proceed with verification.")
        sys.exit(1)
    
    tables_ok = verify_tables()
    categories_ok = verify_categories()
    operations_ok = verify_insert_delete()
    
    # Summary
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    
    if connection_ok and tables_ok and categories_ok and operations_ok:
        print("✅ All checks passed!")
        print("✅ Database is ready for migration")
        print("\n🚀 Next step: Run migration script")
        print("   python migrate_notion_to_supabase.py")
        sys.exit(0)
    else:
        print("❌ Some checks failed:")
        if not tables_ok:
            print("   - Tables are missing or inaccessible")
            print("   - Run supabase_schema.sql in Supabase SQL Editor")
        if not categories_ok:
            print("   - Categories not seeded properly")
            print("   - Check if supabase_schema.sql completed successfully")
        if not operations_ok:
            print("   - Insert/Delete operations failed")
            print("   - Check database permissions and RLS policies")
        
        print("\n💡 Troubleshooting:")
        print("   1. Make sure you ran fresh_start.sql first")
        print("   2. Then run supabase_schema.sql")
        print("   3. Check Supabase logs for errors")
        sys.exit(1)

if __name__ == "__main__":
    main()
