"""
FULL AUTO MIGRATION - Master Script
Runs all 3 phases automatically
"""

import subprocess
import sys
import time
import os

def print_header(text):
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70 + "\n")

def run_script(script_name, phase_number, phase_name):
    """Run a Python script and handle errors"""
    print_header(f"PHASE {phase_number}: {phase_name}")
    
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            capture_output=False,
            text=True,
            check=True
        )
        print(f"\n✅ Phase {phase_number} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Phase {phase_number} failed!")
        print(f"Error: {e}")
        return False
    except FileNotFoundError:
        print(f"\n❌ Script not found: {script_name}")
        return False

def check_excel_file():
    """Check if Excel file exists"""
    possible_files = [
        'ChatGPT Prompt Learning Library.xlsx',
        'ChatGPT_Prompt_Learning_Library.xlsx',
        'prompts.xlsx',
        'prompts.csv'
    ]
    
    for f in possible_files:
        if os.path.exists(f):
            return True, f
    
    return False, None

def main():
    print("="*70)
    print("  🚀 PROMPTVAULT FULL AUTO MIGRATION")
    print("  Get ALL 21,000+ Prompts Organized Beautifully")
    print("="*70)
    
    print("\n📋 This will run 3 phases:")
    print("   Phase 1: Extract Notion databases (~1,400 prompts)")
    print("   Phase 2: Import Excel file (~20,000 prompts)")
    print("   Phase 3: Cleanup and organize everything")
    print("\n⏱️  Estimated time: 60-90 minutes")
    print("💾 All data will be saved to Supabase")
    
    # Check for Excel file
    has_excel, excel_file = check_excel_file()
    if not has_excel:
        print("\n⚠️  WARNING: Excel file not found!")
        print("   Phase 2 will be skipped unless you add the file.")
        print("\n📥 To include 20,000+ prompts:")
        print("   1. Download: https://www.notion.so/2aaa3b31e44780df9ff0f7db9c071a0b")
        print("   2. Save as: ChatGPT Prompt Learning Library.xlsx")
        print("   3. Place in this folder")
        
        choice = input("\n   Continue without Excel file? (y/n): ")
        if choice.lower() != 'y':
            print("\n   Exiting... Add the Excel file and run again.")
            return
    else:
        print(f"\n✅ Excel file found: {excel_file}")
    
    input("\n   Press Enter to start migration...")
    
    start_time = time.time()
    results = {}
    
    # Phase 1: Notion extraction
    results['phase1'] = run_script(
        'migrate_notion_enhanced.py',
        1,
        'Notion Database Extraction'
    )
    
    if not results['phase1']:
        print("\n⚠️  Phase 1 failed. Continue anyway? (y/n): ", end='')
        if input().lower() != 'y':
            return
    
    time.sleep(2)
    
    # Phase 2: Excel import (if file exists)
    if has_excel:
        results['phase2'] = run_script(
            'import_excel.py',
            2,
            'Excel File Import (20,000+ prompts)'
        )
        
        if not results['phase2']:
            print("\n⚠️  Phase 2 failed. Continue anyway? (y/n): ", end='')
            if input().lower() != 'y':
                return
        
        time.sleep(2)
    else:
        print_header("PHASE 2: SKIPPED (No Excel file)")
        results['phase2'] = None
    
    # Phase 3: Cleanup
    results['phase3'] = run_script(
        'cleanup_and_organize.py',
        3,
        'Cleanup & Organization'
    )
    
    # Final summary
    elapsed = time.time() - start_time
    minutes = int(elapsed // 60)
    seconds = int(elapsed % 60)
    
    print_header("🎉 MIGRATION COMPLETE!")
    
    print(f"⏱️  Total time: {minutes}m {seconds}s")
    print(f"\n📊 Phase Results:")
    print(f"   Phase 1 (Notion):  {'✅ Success' if results['phase1'] else '❌ Failed'}")
    print(f"   Phase 2 (Excel):   {'✅ Success' if results['phase2'] else '⏭️  Skipped' if results['phase2'] is None else '❌ Failed'}")
    print(f"   Phase 3 (Cleanup): {'✅ Success' if results['phase3'] else '❌ Failed'}")
    
    print(f"\n🎯 Next Steps:")
    print(f"   1. Run: python view_stats.py")
    print(f"   2. Check your database in Supabase")
    print(f"   3. Connect to your Next.js site")
    print(f"   4. Launch PromptVault 2.0! 🚀")
    
    print("\n" + "="*70)

if __name__ == "__main__":
    main()
