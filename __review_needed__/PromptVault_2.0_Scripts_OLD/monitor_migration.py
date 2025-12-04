"""
PromptVault Migration Monitor
Run this in a separate terminal to watch migration progress in real-time
"""

import requests
import time
import sys
from datetime import datetime

# Configuration
SUPABASE_URL = "https://zqkcoyoknddubrobhfrp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjI4NTUsImV4cCI6MjA3OTA5ODg1NX0.cU8XvpVTCmF-HSPS5rOJFKj36Eg_fKfZDvu0vTVttgY"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Prefer": "count=exact"
}

def get_count(table):
    """Get row count for a table"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/{table}?select=count",
            headers=headers
        )
        if response.status_code == 200:
            # Get count from Content-Range header
            content_range = response.headers.get('content-range', '*/0')
            count = content_range.split('/')[-1]
            return int(count) if count != '*' else 0
        return 0
    except:
        return 0

def get_latest_prompts(limit=3):
    """Get most recently added prompts"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/prompts?select=name,created_at&order=created_at.desc&limit={limit}",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
        )
        if response.status_code == 200:
            return response.json()
        return []
    except:
        return []

def clear_line():
    """Clear current line"""
    sys.stdout.write('\r' + ' ' * 80 + '\r')
    sys.stdout.flush()

def main():
    print("=" * 60)
    print("🔍 PROMPTVAULT MIGRATION MONITOR")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Refreshing every 5 seconds... (Ctrl+C to stop)")
    print("-" * 60)
    
    last_count = 0
    start_time = time.time()
    
    try:
        while True:
            # Get current counts
            prompt_count = get_count('prompts')
            category_count = get_count('categories')
            tag_count = get_count('tags')
            
            # Calculate rate
            elapsed = time.time() - start_time
            rate = prompt_count / (elapsed / 60) if elapsed > 0 else 0
            
            # Check for new prompts
            new_prompts = prompt_count - last_count
            
            # Display status
            clear_line()
            timestamp = datetime.now().strftime('%H:%M:%S')
            
            print(f"\n[{timestamp}] 📊 CURRENT STATUS")
            print(f"   📝 Prompts:    {prompt_count:,}")
            print(f"   📁 Categories: {category_count}")
            print(f"   🏷️  Tags:       {tag_count}")
            print(f"   ⚡ Rate:       {rate:.1f} prompts/min")
            
            if new_prompts > 0:
                print(f"   ✅ +{new_prompts} new since last check!")
            elif prompt_count == 0:
                print(f"   ⏳ Waiting for prompts to appear...")
            
            # Show latest prompts
            latest = get_latest_prompts(3)
            if latest:
                print(f"\n   📌 Latest prompts:")
                for p in latest:
                    name = p.get('name', 'Unknown')[:40]
                    print(f"      • {name}")
            
            last_count = prompt_count
            
            # Progress bar (assuming 20,000 target)
            target = 20000
            progress = min(prompt_count / target * 100, 100)
            bar_length = 30
            filled = int(bar_length * progress / 100)
            bar = '█' * filled + '░' * (bar_length - filled)
            print(f"\n   [{bar}] {progress:.1f}% of {target:,} target")
            
            print("-" * 60)
            
            time.sleep(5)
            
    except KeyboardInterrupt:
        print("\n\n✋ Monitor stopped.")
        print(f"Final count: {prompt_count:,} prompts")

if __name__ == "__main__":
    main()
