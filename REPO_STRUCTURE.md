# Repository Structure

This repository contains two main components:

## 1. Next.js Website (Main Branch)
Production-ready prompt vault website using Next.js 14 and Supabase.

### Key Directories:
- **`app/`** - Next.js 14 app router pages and layouts
- **`components/`** - React components
- **`lib/`** - Database client and query functions
  - `db.js` - Supabase client initialization
  - `queries.js` - Database query functions
- **`public/`** - Static assets
- **`styles/`** or **`app/globals.css`** - Styling

### Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL` - Website URL

## 2. Migration Tools (Root Level)
Python scripts for migrating prompts from Notion to Supabase.

### Migration Scripts:
- **`migrate_notion_to_supabase.py`** - Main migration orchestrator
- **`fix_issues.py`** - Database cleanup and fixes
- **`test_extraction.py`** - Debug Notion extraction
- **`view_stats.py`** - Database statistics
- **`verify_setup.py`** - Verify Supabase setup
- **`debug_collections_simple.py`** - Collection debugging
- **`debug_collections.py`** - Detailed collection analysis

### Database:
- **`supabase_schema.sql`** - Complete database schema
- **`scripts/`** - Additional conversion scripts
  - `notion_to_csv.py` - Convert Notion markdown to CSV
  - `notion_db_to_csv.py` - Convert Notion database JSON to CSV

### Environment Variables (Migration):
- `NOTION_TOKEN` - Notion integration token
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (admin)

## Current Database Status
- **Database**: https://zqkcoyoknddubrobhfrp.supabase.co
- **Prompts**: 244 currently migrated (out of ~20,000 total)
- **Categories**: 19 defined
- **Collections**: Multiple Notion databases being migrated

## Branch Structure
- **`main`** - Next.js website + migration tools (current setup)
- **`prompt-organizer`** - Migration tools only (original setup)

## Documentation
- **`README.md`** - Main documentation with quick start
- **`QUICK_START.md`** / **`QUICKSTART.md`** - Quick setup guides
- **`DEPLOYMENT_CHECKLIST.md`** - Production deployment steps
- **`FIXES_APPLIED.md`** - Database fixes documentation
- **`COMMANDS.ps1`** - PowerShell command reference

## Next Steps for Website Development
1. ✅ Create missing `lib/` files (db.js, queries.js)
2. ⬜ Add prompt detail page (`app/prompt/[id]/page.js`)
3. ⬜ Implement advanced search with full-text
4. ⬜ Add user authentication (optional)
5. ⬜ Create admin dashboard for prompt management
6. ⬜ Add prompt categories browsing page
7. ⬜ Implement prompt favoriting/bookmarking
8. ⬜ Add export functionality (JSON, CSV, Markdown)
9. ⬜ Complete full migration (~19,756 prompts remaining)
10. ⬜ Deploy to Vercel with custom domain

## Technology Stack
- **Frontend**: Next.js 14, React, TailwindCSS (or CSS modules)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Migration**: Python 3.x with Notion API
- **Deployment**: Vercel + Supabase Cloud
