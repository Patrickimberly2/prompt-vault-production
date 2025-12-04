"""
Migration Statistics Viewer
View real-time migration progress and database statistics
"""

from supabase import create_client, Client
from datetime import datetime
import time
import os

# Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY"

def clear_screen():
    """Clear terminal screen"""
    os.system('clear' if os.name != 'nt' else 'cls')

def print_header():
    """Print formatted header"""
    print("\n" + "="*70)
    print("📊 PROMPTVAULT MIGRATION STATISTICS".center(70))
    print("="*70 + "\n")

def get_prompt_stats(client: Client):
    """Get prompt statistics"""
    print("📝 PROMPT STATISTICS")
    print("-" * 70)
    
    # Total prompts
    total = client.table("prompts").select("*", count="exact").execute()
    print(f"Total Prompts:          {total.count:,}")
    
    # By status
    statuses = ["active", "draft", "archived", "favorite"]
    for status in statuses:
        count = client.table("prompts").select("*", count="exact").eq("status", status).execute()
        print(f"  - {status.capitalize()}:".ljust(22) + f"{count.count:,}")
    
    # By AI model
    print("\nBy AI Model:")
    models = ["ChatGPT", "Claude", "Midjourney", "DALL-E", "Gemini", "Universal"]
    for model in models:
        count = client.table("prompts").select("*", count="exact").eq("ai_model", model).execute()
        if count.count > 0:
            print(f"  - {model}:".ljust(22) + f"{count.count:,}")
    
    # Tried prompts
    tried = client.table("prompts").select("*", count="exact").eq("tried", True).execute()
    print(f"\nTried Prompts:          {tried.count:,}")
    
    # Most used
    most_used = client.table("prompts") \
        .select("name, times_used") \
        .order("times_used", desc=True) \
        .limit(3) \
        .execute()
    
    if most_used.data and most_used.data[0]["times_used"] > 0:
        print(f"\nMost Used Prompts:")
        for i, prompt in enumerate(most_used.data, 1):
            print(f"  {i}. {prompt['name'][:50]}... ({prompt['times_used']} uses)")
    
    print()

def get_category_stats(client: Client):
    """Get category statistics"""
    print("📁 CATEGORY STATISTICS")
    print("-" * 70)
    
    # Total categories
    total = client.table("categories").select("*", count="exact").execute()
    print(f"Total Categories:       {total.count}")
    
    # Prompts per category
    query = """
        SELECT c.name, COUNT(pc.prompt_id) as prompt_count
        FROM categories c
        LEFT JOIN prompt_categories pc ON c.id = pc.category_id
        GROUP BY c.name
        ORDER BY prompt_count DESC
        LIMIT 10
    """
    
    # Since we can't run raw SQL directly, use a workaround
    categories = client.table("categories").select("id, name").execute()
    category_counts = []
    
    for cat in categories.data:
        count = client.table("prompt_categories") \
            .select("*", count="exact") \
            .eq("category_id", cat["id"]) \
            .execute()
        category_counts.append((cat["name"], count.count))
    
    category_counts.sort(key=lambda x: x[1], reverse=True)
    
    print(f"\nTop 10 Categories by Prompt Count:")
    for i, (name, count) in enumerate(category_counts[:10], 1):
        print(f"  {i}. {name[:40].ljust(40)} {count:,} prompts")
    
    print()

def get_source_stats(client: Client):
    """Get source/collection statistics"""
    print("📚 SOURCE STATISTICS")
    print("-" * 70)
    
    # Get unique sources
    prompts = client.table("prompts").select("source").execute()
    
    sources = {}
    for p in prompts.data:
        source = p["source"] or "Unknown"
        sources[source] = sources.get(source, 0) + 1
    
    sorted_sources = sorted(sources.items(), key=lambda x: x[1], reverse=True)
    
    print(f"Total Sources:          {len(sources)}")
    print(f"\nPrompts per Source:")
    
    for source, count in sorted_sources:
        print(f"  - {source[:50].ljust(50)} {count:,}")
    
    print()

def get_migration_logs(client: Client):
    """Get migration log information"""
    print("📋 MIGRATION LOGS")
    print("-" * 70)
    
    logs = client.table("migration_log") \
        .select("*") \
        .order("started_at", desc=True) \
        .limit(10) \
        .execute()
    
    if not logs.data:
        print("No migration logs found.\n")
        return
    
    for log in logs.data:
        status_icon = {
            "completed": "✅",
            "processing": "⏳",
            "failed": "❌",
            "pending": "⏸️"
        }.get(log["status"], "❓")
        
        print(f"\n{status_icon} {log['collection_name']}")
        print(f"   Status: {log['status']}")
        print(f"   Extracted: {log['prompts_extracted']}")
        print(f"   Inserted: {log['prompts_inserted']}")
        print(f"   Started: {log['started_at']}")
        
        if log["completed_at"]:
            print(f"   Completed: {log['completed_at']}")
        
        if log["error_message"]:
            print(f"   Error: {log['error_message']}")
    
    print()

def get_recent_activity(client: Client):
    """Get recent activity"""
    print("⚡ RECENT ACTIVITY")
    print("-" * 70)
    
    # Recent prompts
    recent = client.table("prompts") \
        .select("name, source, created_at") \
        .order("created_at", desc=True) \
        .limit(5) \
        .execute()
    
    if recent.data:
        print("Recently Added Prompts:")
        for prompt in recent.data:
            created = prompt["created_at"][:19].replace("T", " ")
            print(f"  • {prompt['name'][:50]}")
            print(f"    Source: {prompt['source']} | Added: {created}")
    
    print()

def display_dashboard(client: Client):
    """Display complete dashboard"""
    clear_screen()
    print_header()
    
    try:
        get_prompt_stats(client)
        get_category_stats(client)
        get_source_stats(client)
        get_migration_logs(client)
        get_recent_activity(client)
        
        print("="*70)
        print(f"Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error fetching statistics: {e}\n")

def watch_mode(client: Client, interval: int = 10):
    """Watch mode - refresh every N seconds"""
    print("👀 Starting watch mode (refresh every {} seconds)".format(interval))
    print("Press Ctrl+C to exit\n")
    
    try:
        while True:
            display_dashboard(client)
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\n\n👋 Exiting watch mode...\n")

def main():
    """Main function"""
    import sys
    
    # Connect to Supabase
    try:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    # Check for watch mode
    if len(sys.argv) > 1 and sys.argv[1] == "--watch":
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        watch_mode(client, interval)
    else:
        display_dashboard(client)

if __name__ == "__main__":
    main()
