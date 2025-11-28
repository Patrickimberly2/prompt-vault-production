# 🚀 PromptVault Migration - Quick Start

## Files Overview

### 📄 Core Files
1. **supabase_schema.sql** - Complete database schema with RLS
2. **migrate_notion_to_supabase.py** - Main migration script
3. **verify_setup.py** - Verify Supabase setup
4. **view_stats.py** - View migration statistics
5. **requirements.txt** - Python dependencies
6. **README.md** - Complete documentation

## ⚡ Quick Setup (5 Steps)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Run SQL Schema in Supabase
1. Login to: https://zqkcoyoknddubrobhfrp.supabase.co
2. Go to **SQL Editor**
3. Paste contents of `supabase_schema.sql`
4. Click **Run**

### Step 3: Verify Setup
```bash
python verify_setup.py
```

Expected output:
```
✅ Connected to Supabase successfully!
✅ Table 'prompts' exists
✅ All 19 main categories present
✅ Successfully inserted test prompt
✅ VERIFICATION COMPLETE!
```

### Step 4: Set Notion Token
```bash
export NOTION_TOKEN="ntn_your_token_here"
```

**Get token at:** https://www.notion.so/my-integrations

**Important:** Share your "All the Prompts" page with the integration!

### Step 5: Run Migration
```bash
python migrate_notion_to_supabase.py
```

## 📊 Monitor Progress

### View Live Statistics
```bash
python view_stats.py
```

### Watch Mode (Auto-refresh every 10 seconds)
```bash
python view_stats.py --watch 10
```

## ✅ Verify Migration

### Check in Supabase Dashboard
1. Go to **Table Editor**
2. Select **prompts** table
3. Browse your data

### Quick SQL Checks
```sql
-- Total prompts
SELECT COUNT(*) FROM prompts;

-- By category
SELECT c.name, COUNT(pc.prompt_id) 
FROM categories c
LEFT JOIN prompt_categories pc ON c.id = pc.category_id
GROUP BY c.name;

-- Recent additions
SELECT name, source, created_at
FROM prompts
ORDER BY created_at DESC
LIMIT 10;
```

## 🎯 Expected Results

### Ultimate ChatGPT Bible 2.0
- **Categories:** 19 main categories
- **Prompts:** ~1,400 prompts
- **Format:** Question-based, fill-in-blank

### AI Ultimate Collection
- **Prompts:** Variable (includes Excel file with 20K+ prompts)
- **Format:** Mixed

### AI Prompt Box
- **Database:** Already exists, will be merged
- **Prompts:** Existing database entries

### Total Expected
- **~20,000+ prompts** across all collections

## 🔧 Troubleshooting

### "Permission denied"
- Use **service_role** key (not anon key)
- Check you ran the SQL schema

### "NOTION_TOKEN not found"
```bash
export NOTION_TOKEN="your_token"
```

### "Rate limit exceeded"
- Script includes automatic rate limiting
- Wait a few minutes and retry

### "No prompts extracted"
- Verify page sharing with integration
- Check page IDs in migration script

## 📁 Database Structure

```
prompts/
├── Core Fields
│   ├── name
│   ├── prompt_text
│   └── prompt_type
├── Metadata
│   ├── ai_model
│   ├── use_case
│   ├── source
│   └── source_page_url
├── Status & Tracking
│   ├── status
│   ├── priority
│   ├── rating
│   ├── tried
│   └── notes
└── Usage Stats
    ├── times_used
    └── last_used_at
```

## 🎨 Features Enabled

✅ Full-text search
✅ Category hierarchy
✅ Favorites/bookmarks
✅ Usage tracking
✅ Version history
✅ RLS policies
✅ Automatic timestamps
✅ Migration logging

## 📱 Connect to Your App

Update your PromptVault frontend:

```javascript
// supabase.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zqkcoyoknddubrobhfrp.supabase.co',
  'your_anon_public_key'
)

export default supabase
```

## 🔐 Security Notes

- ✅ RLS enabled on all tables
- ✅ User-specific data isolation
- ✅ Service role key for migration only
- ✅ Anon key for frontend

## 📞 Need Help?

1. Check `README.md` for detailed docs
2. Run `verify_setup.py` to diagnose
3. Check `migration_log` table for errors
4. Review Supabase logs

## 🎉 Success Checklist

- [ ] SQL schema executed
- [ ] Verification passed
- [ ] Notion token set
- [ ] Pages shared with integration
- [ ] Migration completed
- [ ] Stats show expected counts
- [ ] Frontend connected
- [ ] Search working

---

**Ready to start?**

```bash
python verify_setup.py && python migrate_notion_to_supabase.py
```

🚀 Let's migrate those prompts!
