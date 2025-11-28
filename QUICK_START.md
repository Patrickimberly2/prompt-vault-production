# Quick Start Guide - Notion to Supabase Migration

## Step 1: Set Up Supabase Database

1. Go to your Supabase dashboard: https://zqkcoyoknddubrobhfrp.supabase.co

2. Click on "SQL Editor" in the left sidebar

3. Open the file `supabase_schema.sql` in this directory

4. Copy ALL the contents of `supabase_schema.sql`

5. Paste into the Supabase SQL Editor

6. Click "Run" to execute the SQL

This will create all the necessary tables:
- prompts
- categories
- tags
- collections
- favorites
- prompt_history
- usage_tracking
- migration_log

## Step 2: Run the Migration

Once the database is set up, simply run:

```bash
python migrate_notion_to_supabase.py
```

The script will:
- Extract prompts from your Notion pages
- Organize them by category
- Insert them into Supabase
- Track migration progress

## Step 3: Verify

Check your Supabase dashboard:
1. Go to "Table Editor"
2. Select "prompts" table
3. You should see all your migrated prompts!

## Configuration

Your configuration should be set in `.env`:
- NOTION_TOKEN: your_notion_token_here
- SUPABASE_URL: https://zqkcoyoknddubrobhfrp.supabase.co

## Collections Being Migrated

1. Ultimate ChatGPT Bible 2.0
2. AI Ultimate Collection
3. AI Prompt Box
4. ChatGPT Advantage
5. 100+ ChatGPT Prompts

## Troubleshooting

If you get schema errors, make sure you completed Step 1 (running the SQL schema).

Good luck!
