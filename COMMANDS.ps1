# Quick Start Commands - Prompt Organizer

# SET NOTION TOKEN (Required for all operations)
$env:NOTION_TOKEN="your_notion_token_here"

# OPTION 1: View current stats
python view_stats.py

# OPTION 2: Watch stats in real-time
python view_stats.py --watch 10

# OPTION 3: Fix any issues (stuck migrations, missing categories)
python fix_issues.py

# OPTION 4: Test extraction (debugging)
python test_extraction.py

# OPTION 5: Clean database and start fresh
python clean_and_migrate.py

# OPTION 6: Run migration (keeps existing data)
python migrate_notion_to_supabase.py

# RECOMMENDED: Full fresh migration
python clean_and_migrate.py   # Type 'yes' to confirm
python migrate_notion_to_supabase.py
python view_stats.py
