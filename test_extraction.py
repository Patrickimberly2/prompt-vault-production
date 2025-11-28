"""
Test Single Collection Migration with Detailed Debugging
"""

import os
import requests
from time import sleep

# Configuration
import os
NOTION_TOKEN = os.getenv("NOTION_TOKEN")  # Set via environment variable
NOTION_BASE_URL = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"

def make_notion_request(method: str, endpoint: str, **kwargs):
    """Make request to Notion API"""
    url = f"{NOTION_BASE_URL}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.request(method, url, headers=headers, **kwargs)
        response.raise_for_status()
        sleep(0.33)  # Rate limiting
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        return None

def get_page(page_id: str):
    """Get page details"""
    print(f"\n📄 Fetching page: {page_id}")
    result = make_notion_request("GET", f"pages/{page_id}")
    
    if result:
        # Extract title
        properties = result.get("properties", {})
        for prop_name, prop_value in properties.items():
            if prop_value.get("type") == "title":
                title_array = prop_value.get("title", [])
                if title_array:
                    title = "".join([t.get("plain_text", "") for t in title_array])
                    print(f"   Title: {title}")
                    return result
        print(f"   ✅ Got page (no title found)")
    return result

def get_blocks(block_id: str, indent: int = 0):
    """Get blocks from a page with debugging"""
    prefix = "  " * indent
    print(f"{prefix}📦 Fetching blocks for: {block_id}")
    
    response = make_notion_request("GET", f"blocks/{block_id}/children", params={"page_size": 100})
    
    if not response:
        print(f"{prefix}❌ Failed to get blocks")
        return []
    
    blocks = response.get("results", [])
    print(f"{prefix}   Found {len(blocks)} blocks")
    
    # Show block types
    block_types = {}
    for block in blocks:
        btype = block.get("type", "unknown")
        block_types[btype] = block_types.get(btype, 0) + 1
    
    for btype, count in block_types.items():
        print(f"{prefix}   - {btype}: {count}")
    
    return blocks

def extract_text_from_block(block):
    """Extract text from any block type"""
    block_type = block.get("type")
    if not block_type:
        return None
    
    block_data = block.get(block_type, {})
    
    # Handle rich_text based blocks
    if "rich_text" in block_data:
        rich_text = block_data["rich_text"]
        if rich_text:
            return "".join([t.get("plain_text", "") for t in rich_text])
    
    return None

def test_collection(collection_name: str, page_id: str):
    """Test extracting from a single collection"""
    print("\n" + "="*70)
    print(f"TESTING: {collection_name}")
    print("="*70)
    
    # Get page
    page = get_page(page_id)
    if not page:
        print("❌ Could not fetch page")
        return
    
    # Get blocks
    blocks = get_blocks(page_id)
    
    # Analyze child pages
    child_pages = [b for b in blocks if b.get("type") == "child_page"]
    print(f"\n👶 Found {len(child_pages)} child pages")
    
    if child_pages:
        print("\nChild pages:")
        for i, child in enumerate(child_pages[:5], 1):  # Show first 5
            child_id = child.get("id")
            child_title = child.get("child_page", {}).get("title", "Untitled")
            print(f"   {i}. {child_title} ({child_id})")
            
            # Get blocks from first child page as test
            if i == 1:
                print(f"\n   Testing first child page...")
                child_blocks = get_blocks(child_id, indent=2)
                
                # Try to extract prompts
                prompts_found = 0
                for block in child_blocks[:10]:  # Check first 10 blocks
                    text = extract_text_from_block(block)
                    if text and len(text) > 20:
                        prompts_found += 1
                        print(f"      📝 Prompt: {text[:60]}...")
                
                print(f"      Found {prompts_found} potential prompts in first 10 blocks")
    
    # Analyze databases
    databases = [b for b in blocks if b.get("type") == "child_database"]
    print(f"\n🗄️  Found {len(databases)} databases")
    
    if databases:
        for i, db in enumerate(databases[:2], 1):  # Show first 2
            db_id = db.get("id")
            db_title = db.get("child_database", {}).get("title", "Untitled")
            print(f"   {i}. {db_title} ({db_id})")
    
    # Analyze list items
    list_items = [b for b in blocks if b.get("type") in ["bulleted_list_item", "numbered_list_item"]]
    print(f"\n📋 Found {len(list_items)} list items")
    
    if list_items:
        print("\nSample list items:")
        for i, item in enumerate(list_items[:3], 1):
            text = extract_text_from_block(item)
            if text:
                print(f"   {i}. {text[:60]}...")
    
    print("\n" + "="*70 + "\n")

def main():
    """Test migration on selected collections"""
    print("\n" + "="*70)
    print("NOTION EXTRACTION DEBUG TEST")
    print("="*70)
    
    # Test collections
    collections = {
        "Ultimate ChatGPT Bible 2.0": "2b0a3b31e44780ffa1cbccd08b96957a",
        "AI Ultimate Collection": "2aaa3b31e44780df9ff0f7db9c071a0b",
    }
    
    for name, page_id in collections.items():
        test_collection(name, page_id)
        
        # Ask if want to continue
        response = input("\nTest next collection? (yes/no): ")
        if response.lower() != "yes":
            break
    
    print("\n✅ Debug test complete!")
    print("\nObservations will help fix the migration script.\n")

if __name__ == "__main__":
    main()
