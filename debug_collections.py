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
    "Ultimate ChatGPT Bible 2.0": "2b0a3b31e44780ffa1cbccd08b96957a",
    "AI Ultimate Collection": "2aaa3b31e44780df9ff0f7db9c071a0b",
    "AI Prompt Box": "27ba3b31e44781efb273de412a561baf",
    "ChatGPT Advantage": "293a3b31e447805fb562c0a204f56831",
    "100+ ChatGPT Prompts": "24da3b31e447808aa527ea0d9a2d80ae"
}

def get_page_info(page_id):
    """Get page metadata"""
    url = f"{NOTION_BASE_URL}/pages/{page_id}"
    response = requests.get(url, headers=headers)
    sleep(0.33)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"  Error {response.status_code}: {response.text}")
        return None

def get_block_children(block_id, limit=10):
    """Get first N children of a block"""
    url = f"{NOTION_BASE_URL}/blocks/{block_id}/children"
    params = {"page_size": limit}
    response = requests.get(url, headers=headers, params=params)
    sleep(0.33)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"  Error {response.status_code}: {response.text}")
        return None

def extract_text_from_rich_text(rich_text_array):
    """Extract plain text from Notion rich text array"""
    if not rich_text_array:
        return ""
    return "".join([text.get("plain_text", "") for text in rich_text_array])

def get_page_title(page):
    """Extract title from page properties"""
    properties = page.get("properties", {})
    for prop_name, prop_value in properties.items():
        if prop_value.get("type") == "title":
            title_array = prop_value.get("title", [])
            return extract_text_from_rich_text(title_array)
    return "Untitled"

def analyze_block_structure(block, depth=0):
    """Analyze and print block structure"""
    indent = "  " * depth
    block_type = block.get("type", "unknown")
    block_id = block.get("id", "")
    has_children = block.get("has_children", False)

    # Extract text content
    text_content = ""
    if block_type in block:
        block_data = block[block_type]
        if "rich_text" in block_data:
            text_content = extract_text_from_rich_text(block_data["rich_text"])

    print(f"{indent}[{block_type}] {text_content[:60] if text_content else '(no text)'}")
    if has_children:
        print(f"{indent}  ^ has children")

    return block_type, text_content, has_children

print("\n" + "="*70)
print("INVESTIGATING NOTION COLLECTIONS")
print("="*70 + "\n")

for collection_name, page_id in COLLECTIONS.items():
    print(f"\n{'='*70}")
    print(f"Collection: {collection_name}")
    print(f"Page ID: {page_id}")
    print("="*70)

    # Get page info
    page = get_page_info(page_id)
    if not page:
        print("  Failed to fetch page")
        continue

    title = get_page_title(page)
    print(f"Title: {title}")
    print(f"Object: {page.get('object')}")
    print(f"Archived: {page.get('archived')}")

    # Get block structure
    print("\nBlock Structure (first 10 blocks):")
    blocks_response = get_block_children(page_id, limit=10)

    if not blocks_response:
        print("  Failed to fetch blocks")
        continue

    blocks = blocks_response.get("results", [])
    print(f"  Total blocks returned: {len(blocks)}")
    print(f"  Has more: {blocks_response.get('has_more', False)}")

    if len(blocks) == 0:
        print("  WARNING: No blocks found in this page!")
        print("  This page might be empty or the integration doesn't have access.")
    else:
        print("\n  Block Types Found:")
        block_types = {}
        for i, block in enumerate(blocks[:10]):
            block_type, text, has_children = analyze_block_structure(block, depth=2)
            block_types[block_type] = block_types.get(block_type, 0) + 1

            # If it's a child_page, get its info
            if block_type == "child_page":
                child_page_id = block.get("id")
                child_page = get_page_info(child_page_id)
                if child_page:
                    child_title = get_page_title(child_page)
                    print(f"      Child page title: {child_title}")

        print(f"\n  Summary of block types:")
        for btype, count in block_types.items():
            print(f"    {btype}: {count}")

print("\n" + "="*70)
print("ANALYSIS COMPLETE")
print("="*70 + "\n")
