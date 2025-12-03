# PromptVault 2.0 Migration Folder Checklist
**Last Updated:** November 28, 2024

## 📁 Required Files for Migration

### ✅ You Already Have (in `/outputs/`)

1. **SQL Schema Files:**
   - ✅ `fresh_start.sql` - Drops all existing tables
   - ✅ `supabase_schema.sql` - Creates all 9 tables + indexes + RLS
   - ✅ `check_existing_schema.sql` - Diagnostic queries
   - ✅ `migrate_existing_prompts_table.sql` - Alter existing table (not needed)

2. **Python Migration Scripts:**
   - ✅ `migrate_notion_to_supabase.py` - Main migration script (21KB)
   - ✅ `verify_setup.py` - Verifies database setup (6.5KB)
   - ✅ `view_stats.py` - Shows migration statistics (7.5KB)
   - ✅ `requirements.txt` - Python dependencies

3. **Configuration Files:**
   - ✅ `.env.example` - Template for environment variables
   - ✅ `.env` - **YOU NEED TO EDIT THIS!**

4. **Documentation:**
   - ✅ `README.md` - Full documentation (9.5KB)
   - ✅ `QUICKSTART.md` - Quick start guide (4.5KB)

---

## ⚠️ CRITICAL: What You Need to Do NOW

### 1. **Edit the `.env` file** (MOST IMPORTANT)

Open `C:\Users\KLHst\OneDrive\Documents\Prompt Organizer\PromptVault_2.0_Scripts\.env` and replace:

```bash
# Replace this line:
NOTION_TOKEN=your_notion_integration_token_here

# With your actual Notion integration token:
NOTION_TOKEN=ntn_123456789abcdef...

# Replace this line:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# With your actual service role key:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to get these:**
- **Notion Token:** https://www.notion.so/my-integrations (create integration → copy token)
- **Supabase Service Key:** Your Supabase dashboard → Project Settings → API → service_role key

---

### 2. **Install Python Dependencies**

Open Command Prompt in `C:\Users\KLHst\OneDrive\Documents\Prompt Organizer\PromptVault_2.0_Scripts` and run:

```bash
pip install -r requirements.txt
```

This installs:
- `notion-client` - For Notion API
- `supabase` - For Supabase database
- `python-dotenv` - For environment variables
- `tqdm` - For progress bars

---

### 3. **Run Fresh Start in Supabase**

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/zqkcoyoknddubrobhfrp/sql
2. Copy/paste `fresh_start.sql` → Click "Run"
3. Copy/paste `supabase_schema.sql` → Click "Run"

---

### 4. **Verify Database Setup**

In Command Prompt:

```bash
python verify_setup.py
```

You should see:
```
✅ All 9 tables exist
✅ 19 categories seeded
✅ Test insert/delete works
✅ Database is ready for migration
```

---

### 5. **Run the Migration**

```bash
python migrate_notion_to_supabase.py
```

Monitor progress with:
```bash
python view_stats.py
```

---

## 📋 Migration Folder Structure

Your folder should look like this:

```
C:\Users\KLHst\OneDrive\Documents\Prompt Organizer\PromptVault_2.0_Scripts\
│
├── .env                                    ← EDIT THIS FIRST!
├── .env.example
├── requirements.txt
│
├── fresh_start.sql                         ← Run in Supabase (Step 1)
├── supabase_schema.sql                     ← Run in Supabase (Step 2)
├── check_existing_schema.sql
├── migrate_existing_prompts_table.sql
│
├── migrate_notion_to_supabase.py          ← Main migration script
├── verify_setup.py                         ← Test setup first
├── view_stats.py                           ← Monitor progress
│
├── README.md                               ← Full documentation
├── QUICKSTART.md                           ← Quick reference
└── MIGRATION_CHECKLIST.md                  ← This file
```

---

## 🎯 Migration Strategy Recap

### What We're Migrating (~20,000 prompts):

1. **Ultimate ChatGPT Bible 2.0** (~1,400 prompts)
   - 19 categories with question-based prompts
   - Fill-in-blank prompts with variables

2. **AI Ultimate Collection** (Excel file with 20K+ prompts)
   - Needs CSV export or direct Excel reading

3. **AI Prompt Box** (Existing database)
   - Already has prompts - may need deduplication

### What We're SKIPPING:

- ❌ Educational content (28-Day Challenge, tutorials)
- ❌ BONUS pages
- ❌ Bot builder instructions
- ❌ Course materials
- ❌ YouTube videos

*(You'll add these later when you build those features in PromptVault)*

---

## 🔐 Security Reminders

- ✅ Add `.env` to `.gitignore` in your GitHub repo
- ✅ Never commit `.env` to version control
- ✅ Keep your Notion token and Supabase service key private
- ✅ Use environment variables for all sensitive data

---

## 🚀 Quick Start Command Sequence

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Edit .env file (add your tokens)
notepad .env

# 3. Run fresh_start.sql in Supabase SQL Editor
# 4. Run supabase_schema.sql in Supabase SQL Editor

# 5. Verify setup
python verify_setup.py

# 6. Run migration
python migrate_notion_to_supabase.py

# 7. Check stats
python view_stats.py
```

---

## 📞 Need Help?

If you encounter errors:

1. **Check `.env` file** - Most common issue
2. **Run `verify_setup.py`** - Confirms database is ready
3. **Check Supabase logs** - See what's happening on server
4. **Review `README.md`** - Has troubleshooting section

---

## ✅ Final Checklist Before Running Migration

- [ ] `.env` file has real Notion token
- [ ] `.env` file has real Supabase service role key
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] `fresh_start.sql` executed in Supabase
- [ ] `supabase_schema.sql` executed in Supabase
- [ ] `verify_setup.py` shows all green checkmarks
- [ ] Notion integration has access to all workspace pages
- [ ] You've backed up any important data (if applicable)

**Once all checked → Run:** `python migrate_notion_to_supabase.py`

---

**Status:** Ready for Fresh Start Migration 🚀
**Estimated Time:** 10-20 minutes for ~20,000 prompts
**Next Steps:** Edit `.env` → Run SQL scripts → Verify → Migrate
