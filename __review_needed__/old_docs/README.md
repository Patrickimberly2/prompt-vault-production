# PromptVault Migration Guide

Complete guide for migrating ~20,000 prompts from Notion to Supabase PostgreSQL database.

## 📋 Overview

This migration system will:
- ✅ Extract prompts from Notion pages (all formats)
- ✅ Organize into structured Supabase database
- ✅ Handle categories, tags, and metadata
- ✅ Track migration progress
- ✅ Enable favorites, usage tracking, and version history
- ✅ Implement Row Level Security (RLS)

---

## 🗄️ Database Schema

### Core Tables
- **prompts** - Main prompt storage with full metadata
- **categories** - Hierarchical category system (19 main categories)
- **tags** - Flexible tagging system
- **collections** - Track source collections
- **favorites** - User bookmarks
- **prompt_history** - Version tracking
- **usage_tracking** - Track prompt usage
- **migration_log** - Track migration progress

### Features
- Full-text search with PostgreSQL trigram matching
- Automatic version history on updates
- Usage statistics (times_used, last_used_at)
- Rating system (1-5 stars)
- Priority levels (high, medium, low)
- Status tracking (active, draft, archived, favorite)

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Set Up Supabase Database

1. Log into your Supabase dashboard: https://zqkcoyoknddubrobhfrp.supabase.co

2. Go to **SQL Editor**

3. Copy and paste the entire contents of `supabase_schema.sql`

4. Click **Run** to execute

This will:
- Create all tables with proper indexes
- Set up RLS policies
- Create helper functions and triggers
- Seed 19 main categories
- Create utility views

### Step 3: Get Notion Integration Token

1. Go to https://www.notion.so/my-integrations

2. Click **+ New integration**

3. Name it "PromptVault Migration"

4. Select the workspace containing your prompts

5. Click **Submit**

6. Copy the **Internal Integration Token** (starts with `secret_` or `ntn_`)

7. Share your Notion pages with the integration:
   - Open your "All the Prompts" page in Notion
   - Click **Share** in the top right
   - Click **Invite**
   - Search for your integration name
   - Click **Invite**

### Step 4: Set Environment Variables

```bash
export NOTION_TOKEN="your_notion_token_here"
```

Or create a `.env` file:

```
NOTION_TOKEN=your_notion_token_here
```

---

## 🏃 Running the Migration

### Full Migration (All Collections)

```bash
python migrate_notion_to_supabase.py
```

This will migrate:
1. Ultimate ChatGPT Bible 2.0 (~1,400 prompts)
2. AI Ultimate Collection
3. AI Prompt Box
4. ChatGPT Advantage
5. 100+ ChatGPT Prompts

### Custom Migration

To migrate specific collections, edit the `MIGRATIONS` dictionary in `migrate_notion_to_supabase.py`:

```python
MIGRATIONS = {
    "Collection Name": "notion_page_id",
    # Add more as needed
}
```

---

## 📊 Migration Progress

The script will:

1. **Log each collection** being processed
2. **Skip BONUS pages** automatically
3. **Extract prompts** in multiple formats:
   - Question-based prompts
   - Fill-in-blank prompts (JavaScript blocks)
   - List items
4. **Insert into Supabase** with proper categorization
5. **Display progress** with counts and status

### Example Output:

```
============================================================
MIGRATING: Ultimate ChatGPT Bible 2.0
============================================================

📄 Processing: Content Strategy Development
   Found 15 prompts
   ✅ Inserted 15 prompts

📄 Processing: Blog and Article Writing
   Found 10 prompts
   ✅ Inserted 10 prompts

⏭️  Skipping: BONUS: Perfect AI Partner

============================================================
SUMMARY:
Total Extracted: 1,425
Total Inserted: 1,425
============================================================
```

---

## 🔍 Verifying Migration

### Check in Supabase Dashboard

1. Go to **Table Editor**
2. Select **prompts** table
3. Browse your migrated prompts

### Query via SQL Editor

```sql
-- Count total prompts
SELECT COUNT(*) FROM prompts;

-- Count by category
SELECT c.name, COUNT(pc.prompt_id) as prompt_count
FROM categories c
LEFT JOIN prompt_categories pc ON c.id = pc.category_id
GROUP BY c.name
ORDER BY prompt_count DESC;

-- View recent prompts
SELECT name, prompt_text, source, created_at
FROM prompts
ORDER BY created_at DESC
LIMIT 10;

-- Popular prompts
SELECT name, times_used, rating
FROM prompts
WHERE times_used > 0
ORDER BY times_used DESC
LIMIT 10;
```

---

## 🔐 Row Level Security (RLS)

The database includes RLS policies that:

- Users can only view/edit their own prompts
- Categories are public read, authenticated write
- Favorites are user-specific
- Usage tracking is private to each user

### Testing RLS

After creating a user account, prompts will automatically be associated with that user via the `user_id` column.

---

## 🛠️ Troubleshooting

### Issue: "Permission denied" when running SQL

**Solution:** Make sure you're using the **service_role** key, not the **anon** key.

### Issue: "NOTION_TOKEN not found"

**Solution:** 
```bash
export NOTION_TOKEN="your_token_here"
```

### Issue: Rate limiting from Notion

**Solution:** The script includes automatic rate limiting (3 requests/second). If you still hit limits, increase `NOTION_RATE_LIMIT_DELAY` in the script.

### Issue: Some prompts not extracting

**Solution:** Check the prompt format. The extractor handles:
- Bulleted lists with questions
- JavaScript code blocks
- Numbered lists

If your prompts use a different format, you may need to extend the `PromptExtractor` class.

---

## 📈 Post-Migration Steps

### 1. Connect to PromptVault App

Update your PromptVault application to use the new Supabase database:

```javascript
// In your Next.js app
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zqkcoyoknddubrobhfrp.supabase.co',
  'your_anon_key_here'
)
```

### 2. Test Search Functionality

```sql
SELECT * FROM search_prompts('marketing strategy');
```

### 3. Enable Additional Features

The database supports:
- **Favorites:** Users can bookmark prompts
- **Usage Tracking:** Track when/how prompts are used
- **Version History:** Automatic versioning on updates
- **Collections:** Group prompts by source

### 4. Create Initial User

If testing locally:

```sql
-- This is for testing only
-- In production, users are created via Supabase Auth
INSERT INTO auth.users (id, email)
VALUES (gen_random_uuid(), 'test@example.com');
```

---

## 📚 Database Schema Details

### Prompts Table Structure

```sql
- id (UUID)
- name (TEXT) - Short title/summary
- prompt_text (TEXT) - Full prompt content
- prompt_type (VARCHAR) - question-based, fill-in-blank, etc.
- ai_model (VARCHAR) - ChatGPT, Claude, etc.
- use_case (VARCHAR) - Business, Creative, etc.
- source (TEXT) - Collection name
- source_page_url (TEXT) - Original Notion URL
- status (VARCHAR) - active, draft, archived, favorite
- priority (VARCHAR) - high, medium, low
- rating (INTEGER) - 1-5 stars
- tried (BOOLEAN) - Has user tried it?
- notes (TEXT) - Personal notes
- times_used (INTEGER) - Usage counter
- last_used_at (TIMESTAMP) - Last usage time
- user_id (UUID) - Owner
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Categories System

19 main categories from Ultimate ChatGPT Bible 2.0:
1. Content Marketing
2. Social Media
3. Email Marketing
4. Social Media Management
5. Copywriting
6. Conversion Rate Optimization
7. Growth Hacking
8. Budget-Friendly Marketing
9. Customer Relationship Management
10. Financial Marketing
11. Personal Branding
12. Operations Management
13. Innovation & Product Development
14. Writing
15. Productivity & Virtual Assistance
16. Consulting
17. Human Resources
18. Legal & Compliance
19. Creative Brainstorming

---

## 🎯 Advanced Features

### Full-Text Search

```sql
SELECT * FROM search_prompts('social media strategy', 'user_uuid_here');
```

### Popular Prompts View

```sql
SELECT * FROM popular_prompts LIMIT 10;
```

### Recent Activity

```sql
SELECT * FROM recent_activity LIMIT 20;
```

### Prompts with Categories

```sql
SELECT * FROM prompts_with_categories
WHERE 'Content Marketing' = ANY(category_names);
```

---

## 📝 Customization

### Add Custom Categories

```sql
INSERT INTO categories (name, slug, description, sort_order, icon, color)
VALUES ('Your Category', 'your-category', 'Description', 20, '🎯', 'indigo');
```

### Add Custom Prompt Type

Just insert prompts with your custom `prompt_type`:

```python
prompt = Prompt(
    name="My Custom Prompt",
    prompt_text="...",
    prompt_type="custom-type",  # Your custom type
    ...
)
```

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs in the dashboard
3. Check migration_log table for errors

```sql
SELECT * FROM migration_log WHERE status = 'failed';
```

---

## 📄 License

This migration system is part of PromptVault.

---

## ✅ Checklist

- [ ] Install Python dependencies
- [ ] Run `supabase_schema.sql` in Supabase
- [ ] Get Notion integration token
- [ ] Share Notion pages with integration
- [ ] Set NOTION_TOKEN environment variable
- [ ] Run migration script
- [ ] Verify data in Supabase
- [ ] Connect PromptVault app to Supabase
- [ ] Test search and filtering
- [ ] Enable user authentication

---

**Ready to migrate? Run:**

```bash
python migrate_notion_to_supabase.py
```

🚀 Happy migrating!
