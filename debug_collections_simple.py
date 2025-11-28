"""
Debug script to investigate why some collections aren't extracting prompts
"""

import os
import json
from pathlib import Path
import requests
from time import sleep

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

NOTION_TOKEN = os.getenv("NOTION_TOKEN")
NOTION_API_VERSION = "2022-06-28"
NOTION_BASE_URL = "https://api.notion.com/v1"

headers = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": NOTION_API_VERSION,
    "Content-Type": "application/json"
}

# Collections to investigate
COLLECTIONS = {
    "AI Ultimate Collection": "2aaa3b31e44780df9ff0f7db9c071a0b",
    "AI Prompt Box": "27ba3b31e44781efb273de412a561baf",
    "ChatGPT Advantage": "293a3b31e447805fb562c0a204f56831",
    "100+ ChatGPT Prompts": "24da3b31e447808aa527ea0d9a2d80ae"
}

def get_block_children(block_id):
    """Get children of a block"""
    url = f"{NOTION_BASE_URL}/blocks/{block_id}/children"
    params = {"page_size": 100}
    response = requests.get(url, headers=headers, params=params)
    sleep(0.33)
    if response.status_code == 200:
        return response.json()
    else:
        return None

print("\n" + "="*70)
print("INVESTIGATING NOTION COLLECTIONS - Block Type Analysis")
print("="*70 + "\n")

for collection_name, page_id in COLLECTIONS.items():
    print(f"\n{collection_name}:")
    print(f"  Page ID: {page_id}")

    blocks_response = get_block_children(page_id)

    if not blocks_response:
        print("  ERROR: Failed to fetch blocks")
        continue

    blocks = blocks_response.get("results", [])
    print(f"  Total blocks: {len(blocks)}")

    # Count block types
    block_types = {}
    for block in blocks:
        block_type = block.get("type", "unknown")
        block_types[block_type] = block_types.get(block_type, 0) + 1

    print(f"  Block types:")
    for btype, count in sorted(block_types.items()):
        print(f"    - {btype}: {count}")

    # Check for specific extractable content
    has_bulleted = block_types.get("bulleted_list_item", 0)
    has_numbered = block_types.get("numbered_list_item", 0)
    has_code = block_types.get("code", 0)
    has_child_pages = block_types.get("child_page", 0)
    has_database = block_types.get("child_database", 0)

    print(f"\n  Analysis:")
    if has_child_pages > 0:
        print(f"    ! This page contains {has_child_pages} child pages")
        print(f"      The script needs to navigate into these child pages")
    if has_database > 0:
        print(f"    ! This page contains {has_database} database(s)")
        print(f"      Databases need special handling to extract content")
    if has_bulleted + has_numbered + has_code == 0:
        print(f"    ! No directly extractable content (lists/code blocks)")
        print(f"      Content is likely in child pages or databases")
    else:
        print(f"    Has extractable content: {has_bulleted + has_numbered + has_code} items")

print("\n" + "="*70)
print("RECOMMENDATION:")
print("="*70)
print("\nThe collections that returned 0 prompts have different structures:")
print("1. They contain child_pages or databases instead of direct content")
print("2. The migration script needs to be updated to:")
print("   - Navigate into child pages recursively")
print("   - Query databases for content")
print("   - Extract prompts from nested structures")
print("\n")
