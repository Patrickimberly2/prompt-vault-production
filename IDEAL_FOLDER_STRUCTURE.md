# 🗂️ PromptVault 2.0 - Ideal Folder Structure
**Production-Ready Organization for Next.js + Supabase**

---

## 📐 Complete Structure Overview

```
prompt-vault-production/
│
├── 📱 app/                                    # Next.js 14 App Router
│   ├── layout.js                             # Root layout
│   ├── page.js                               # Homepage
│   ├── globals.css                           # Global styles
│   │
│   ├── 🤖 bot-builder/                       # Bot Builder feature
│   │   ├── page.js                           # Main bot builder page
│   │   ├── agents/
│   │   │   └── page.js                       # Multi-step agents
│   │   └── personas/
│   │       └── page.js                       # Custom AI personas
│   │
│   ├── 💬 prompt/                            # Prompt pages
│   │   └── [id]/
│   │       └── page.js                       # Dynamic prompt detail
│   │
│   ├── 🔐 auth/                              # Authentication (future)
│   │   ├── login/page.js
│   │   └── register/page.js
│   │
│   └── 🎯 challenges/                        # Daily challenges (future)
│       └── page.js
│
├── 🧩 components/                            # Reusable UI Components
│   ├── layout/
│   │   ├── Navbar.jsx                        # Navigation bar
│   │   ├── Footer.jsx                        # Footer component
│   │   └── Sidebar.jsx                       # Sidebar navigation
│   │
│   ├── prompts/
│   │   ├── PromptCard.jsx                    # Prompt display card
│   │   ├── PromptList.jsx                    # List of prompts
│   │   └── PromptFilter.jsx                  # Filter/search component
│   │
│   ├── bot-builder/
│   │   ├── PersonaCreator.jsx                # Persona creation UI
│   │   ├── AgentBuilder.jsx                  # Agent workflow builder
│   │   └── WorkflowCanvas.jsx                # Visual workflow editor
│   │
│   └── ui/
│       ├── Button.jsx                        # Button component
│       ├── Input.jsx                         # Input component
│       ├── Modal.jsx                         # Modal component
│       └── Card.jsx                          # Card component
│
├── 📚 lib/                                   # Core Application Logic
│   ├── supabase/
│   │   ├── client.js                         # Supabase client setup
│   │   ├── server.js                         # Server-side Supabase
│   │   └── queries.js                        # Database queries
│   │
│   ├── auth/
│   │   ├── auth.js                           # Auth helper functions
│   │   └── middleware.js                     # Auth middleware
│   │
│   ├── notion/
│   │   ├── client.js                         # Notion API client
│   │   └── parser.js                         # Parse Notion data
│   │
│   └── utils/
│       ├── utils.js                          # Generic utilities
│       ├── formatting.js                     # Text formatting
│       └── validation.js                     # Input validation
│
├── 🛠️ scripts/                               # Automation Scripts
│   ├── 📥 migration/                         # Database Migration Scripts
│   │   ├── migrate_notion_enhanced.py        # Enhanced Notion → Supabase
│   │   ├── migrate_notion_to_supabase.py     # Basic Notion migration
│   │   ├── run_full_migration.py             # Run complete migration
│   │   ├── monitor_migration.py              # Monitor migration progress
│   │   └── rollback_migration.py             # Rollback if needed
│   │
│   ├── 🔄 sync/                              # Data Sync Scripts
│   │   ├── import_collection.py              # Import prompt collections
│   │   ├── import_excel.py                   # Import from Excel
│   │   ├── import_excel_advanced.py          # Advanced Excel import
│   │   ├── process_local_export.py           # Process Notion exports
│   │   └── schedule_sync.py                  # Automated sync scheduler
│   │
│   ├── 🔧 utils/                             # Utility Scripts
│   │   ├── verify_setup.py                   # Verify environment setup
│   │   ├── view_stats.py                     # View database stats
│   │   ├── cleanup_and_organize.py           # Data cleanup
│   │   ├── backup_database.py                # Backup Supabase data
│   │   └── test_connections.py               # Test API connections
│   │
│   ├── 📊 data/                              # Data Files (gitignored if large)
│   │   ├── ChatGPT_Prompt_Learning_Library.xlsx
│   │   └── prompt_collections/
│   │       └── (Excel/CSV files)
│   │
│   └── requirements.txt                      # Python dependencies
│
├── 🗄️ supabase/                              # Supabase Configuration
│   ├── migrations/                           # SQL Migration Files
│   │   ├── 00001_initial_schema.sql          # Initial database schema
│   │   ├── 00002_prompts_table.sql           # Prompts table
│   │   ├── 00003_categories_table.sql        # Categories table
│   │   ├── 00004_personas_table.sql          # AI Personas table
│   │   ├── 00005_agents_table.sql            # Multi-step agents
│   │   ├── 00006_challenges_table.sql        # Daily challenges
│   │   ├── 00007_rls_policies.sql            # Row Level Security
│   │   └── fresh_start.sql                   # Full reset script
│   │
│   ├── functions/                            # Edge Functions (future)
│   │   └── generate-prompt.ts
│   │
│   ├── seed.sql                              # Seed data
│   └── config.toml                           # Supabase project config
│
├── 📖 docs/                                  # Documentation
│   ├── README.md                             # Main documentation
│   ├── QUICKSTART.md                         # Quick start guide
│   ├── DEPLOYMENT.md                         # Deployment instructions
│   ├── API_REFERENCE.md                      # API documentation
│   ├── DATABASE_SCHEMA.md                    # Database structure
│   ├── MIGRATION_GUIDE.md                    # Data migration guide
│   ├── DEVELOPMENT.md                        # Development setup
│   └── CONTRIBUTING.md                       # Contribution guidelines
│
├── 🎨 public/                                # Static Assets
│   ├── images/
│   │   ├── logo.png                          # App logo
│   │   ├── og-image.png                      # Social share image
│   │   └── icons/
│   │       └── (various icons)
│   │
│   ├── fonts/                                # Custom fonts (if any)
│   └── favicon.ico                           # Favicon
│
├── 🎭 types/                                 # TypeScript Type Definitions
│   ├── database.ts                           # Supabase database types
│   ├── notion.ts                             # Notion API types
│   ├── prompts.ts                            # Prompt-related types
│   ├── personas.ts                           # Persona types
│   └── index.d.ts                            # Global type definitions
│
├── 🧪 tests/                                 # Test Files (future)
│   ├── unit/
│   │   ├── components/
│   │   └── lib/
│   ├── integration/
│   └── e2e/
│
├── 🔧 .github/                               # GitHub Configuration
│   ├── workflows/
│   │   ├── ci.yml                            # CI/CD pipeline
│   │   ├── deploy-production.yml             # Production deployment
│   │   └── create-cleanup-pr.yml             # Automated cleanup
│   │
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   │
│   └── pull_request_template.md
│
├── ⚙️ Configuration Files (Root Level)
│   ├── .env.example                          # Environment variables template
│   ├── .env.local                            # Local env vars (gitignored)
│   ├── .gitignore                            # Git ignore rules
│   ├── .eslintrc.json                        # ESLint configuration
│   ├── .prettierrc                           # Prettier configuration
│   ├── next.config.js                        # Next.js configuration
│   ├── tailwind.config.js                    # Tailwind CSS config
│   ├── postcss.config.js                     # PostCSS config
│   ├── jsconfig.json                         # JavaScript config
│   ├── tsconfig.json                         # TypeScript config
│   ├── package.json                          # NPM dependencies
│   └── package-lock.json                     # Locked dependencies
│
├── 📄 Documentation Files (Root Level)
│   ├── README.md                             # Project overview
│   ├── ROADMAP.md                            # Development roadmap
│   ├── CHANGELOG.md                          # Version history
│   ├── LICENSE                               # License file
│   └── REPO_STRUCTURE.md                     # This file
│
├── 🗑️ __review_needed__/                     # Temporary Review Folder
│   ├── old_scripts/                          # Old scripts to review
│   ├── duplicate_configs/                    # Duplicate configs
│   ├── old_docs/                             # Old documentation
│   ├── duplicate_prompts/                    # Duplicate prompt files
│   ├── backup_files/                         # Backup files
│   └── PromptVault_2.0_Scripts_OLD/          # Old nested project
│
└── 🚫 Excluded from Git (via .gitignore)
    ├── node_modules/                         # NPM dependencies
    ├── .next/                                # Next.js build cache
    ├── .env                                  # Environment variables
    ├── .env*.local                           # Local env files
    ├── __review_needed__/                    # Temporary folder
    └── scripts/data/*.xlsx                   # Large data files
```

---

## 🎯 Folder Purpose Quick Reference

| Folder | Purpose | When to Use |
|--------|---------|-------------|
| `/app` | Next.js pages and routes | Creating new pages/routes |
| `/components` | Reusable UI components | Building UI elements |
| `/lib` | Core business logic | Adding utilities, API clients |
| `/scripts` | Automation and migration | Data migration, maintenance |
| `/supabase` | Database configuration | SQL migrations, schema changes |
| `/docs` | Documentation | Writing guides, references |
| `/public` | Static assets | Adding images, fonts, icons |
| `/types` | TypeScript types | Defining data structures |
| `/tests` | Test files | Writing tests |
| `/.github` | GitHub config | CI/CD, workflows, templates |

---

## 📝 File Naming Conventions

### Components
```
✅ GOOD:
- PascalCase: PromptCard.jsx, UserProfile.jsx
- Descriptive: SearchBar.jsx, FilterDropdown.jsx

❌ BAD:
- lowercase: promptcard.jsx
- Unclear: component1.jsx, temp.jsx
```

### Utilities
```
✅ GOOD:
- camelCase: formatDate.js, validateEmail.js
- Descriptive: parsePromptData.js

❌ BAD:
- PascalCase: FormatDate.js (confusing with components)
- Unclear: utils.js (too generic, be specific)
```

### Database Migrations
```
✅ GOOD:
- Numbered: 00001_initial_schema.sql
- Dated: 2024_12_03_add_personas_table.sql
- Descriptive: create_prompts_table.sql

❌ BAD:
- No order: schema.sql, new.sql
- Vague: update.sql, fix.sql
```

### Scripts
```
✅ GOOD:
- snake_case: migrate_notion_enhanced.py
- Descriptive: import_excel_advanced.py

❌ BAD:
- camelCase: migrateNotion.py (use snake_case for Python)
- Vague: script1.py, temp.py
```

---

## 🚀 Growth-Ready Structure

### Adding New Features

**New Page Route:**
```
app/
└── your-feature/
    ├── page.js
    ├── layout.js (optional)
    └── loading.js (optional)
```

**New Component:**
```
components/
└── your-feature/
    ├── MainComponent.jsx
    ├── SubComponent.jsx
    └── index.js (for easy imports)
```

**New API Integration:**
```
lib/
└── your-service/
    ├── client.js
    ├── queries.js
    └── utils.js
```

**New Database Table:**
```
supabase/migrations/
└── 0000X_create_your_table.sql
```

---

## 🔒 Security Best Practices

### Environment Variables
```
✅ Commit: .env.example (template only)
❌ Never: .env, .env.local (contains secrets)

Structure:
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-secret-key-here
NOTION_API_KEY=your-notion-key-here
```

### Sensitive Files
```
❌ NEVER COMMIT:
- API keys
- Database credentials
- User data
- Large datasets (>10MB)
- Build artifacts (.next/)
- Dependencies (node_modules/)
```

---

## 📊 Size Guidelines

### Keep Files Small
```
✅ Component: <300 lines
✅ Utility: <200 lines
✅ Page: <500 lines

❌ If larger: Break into smaller files
```

### Repository Size
```
Target: 5-10MB (source code only)
Max: 50MB (with docs and small assets)

Large files → Store externally (S3, CDN)
```

---

## 🛠️ Maintenance Tasks

### Weekly
- [ ] Review `__review_needed__/` folder
- [ ] Clean up old branches
- [ ] Update dependencies (`npm update`)

### Monthly
- [ ] Review and update documentation
- [ ] Check for security updates
- [ ] Audit file structure
- [ ] Clean up old migration scripts

### Quarterly
- [ ] Major dependency updates
- [ ] Architecture review
- [ ] Performance audit
- [ ] Security audit

---

## ✅ Structure Checklist

Use this to verify your folder structure is correct:

### Essential Folders
- [ ] `/app` exists with layout.js and page.js
- [ ] `/components` exists with organized subfolders
- [ ] `/lib` exists with supabase client
- [ ] `/scripts` exists with migration, sync, utils subfolders
- [ ] `/supabase/migrations` exists with SQL files
- [ ] `/public` exists with assets
- [ ] `/types` exists (if using TypeScript)

### Configuration
- [ ] `.gitignore` updated (excludes .next, node_modules, .env)
- [ ] `.env.example` exists (no secrets)
- [ ] `package.json` has all dependencies
- [ ] `next.config.js` configured properly
- [ ] `README.md` up to date

### Cleanup
- [ ] No `.next/` folder committed
- [ ] No `node_modules/` committed
- [ ] No duplicate configs
- [ ] No `.env` files with secrets
- [ ] `__review_needed__/` cleared after review

---

## 🎓 Best Practices Summary

1. **One Source of Truth**: Only one copy of each file
2. **Logical Organization**: Related files grouped together
3. **Clear Naming**: Descriptive, consistent names
4. **Security First**: Never commit secrets
5. **Documentation**: Keep docs updated
6. **Git Hygiene**: Use .gitignore properly
7. **Scalability**: Structure supports growth
8. **Performance**: Keep repository lean

---

**This structure scales from MVP to production with 20,000+ prompts!** 🚀
