<<<<<<< HEAD
# PromptVault - Supabase Migration Guide

A Next.js 14 prompt organizer application migrated from local PostgreSQL to Supabase, with bulk import capabilities for 50,000+ prompts from Notion.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+ (for data import script)
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prompt-vault-production.git
   cd prompt-vault-production
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase/schema.sql`

5. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 📦 Data Import

### From Notion Export

1. **Export your Notion workspace**
   - Go to Settings & Members → Settings → Export content
   - Choose "Markdown & CSV" format
   - Download and extract the zip file

2. **Install Python dependencies**
   ```bash
   cd scripts
   pip install -r requirements.txt
   ```

3. **Configure the import script**
   Edit `scripts/notion_to_csv.py` and update:
   ```python
   NOTION_EXPORT_DIR = "./notion_export"  # Path to your extracted Notion export
   ```

4. **Run the conversion script**
   ```bash
   python notion_to_csv.py
   ```
   
   This generates:
   - `prompts.csv` - Ready for import
   - `import_errors.log` - Any files that failed processing

5. **Import to Supabase**
   
   **Option A: Via Supabase Dashboard**
   - Navigate to Table Editor → prompts
   - Click Insert → Import data from CSV
   - Upload `prompts.csv`
   - Map columns and import
   
   **Option B: Via psql**
   ```bash
   psql postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres \
     -c "\COPY prompts(title, content, category, tags, created_at) FROM 'prompts.csv' WITH (FORMAT csv, HEADER true);"
   ```

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Framework: Next.js (auto-detected)

3. **Configure Environment Variables**
   
   Add these for both Production and Preview:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_SITE_URL=https://promptvault.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test the generated URL

### Custom Domain Setup (Namecheap)

1. **Add domain in Vercel**
   - Go to Settings → Domains
   - Add your domain (e.g., `promptvault.com`)
   - Note the DNS records provided

2. **Configure Namecheap DNS**
   - Log into Namecheap
   - Go to Domain List → Your Domain → Advanced DNS
   - Remove existing A/CNAME records
   - Add Vercel's DNS records:
     ```
     Type: A Record
     Host: @
     Value: 76.76.21.21
     
     Type: CNAME Record
     Host: www
     Value: cname.vercel-dns.com
     ```

3. **Wait for DNS propagation** (up to 24 hours)
   
   Check status: [whatsmydns.net](https://www.whatsmydns.net/)

4. **Verify deployment**
   ```bash
   curl -I https://promptvault.com
   ```

## 📁 Project Structure

```
prompt-vault/
├── lib/
│   ├── db.js              # Supabase client setup
│   └── queries.js         # Database query functions
├── scripts/
│   ├── notion_to_csv.py   # Notion export converter
│   └── requirements.txt   # Python dependencies
├── supabase/
│   └── schema.sql         # Database schema
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🔍 Features

- **Full-text search** with PostgreSQL GIN indexes
- **Category filtering** for organized browsing
- **Tag-based filtering** with multi-select support
- **Responsive design** for mobile and desktop
- **50,000+ prompt capacity** with optimized queries

## 🛠️ Troubleshooting

### CSV Import Issues
- Ensure tags use PostgreSQL array syntax: `{"tag1","tag2"}`
- Check for NULL bytes in content
- Verify UTF-8 encoding

### Search Not Working
- Verify GIN index exists in Supabase
- Check Row Level Security policies
- Review Supabase logs

### Deployment Failures
- Verify all environment variables are set
- Check build logs in Vercel dashboard
- Ensure Supabase database is accessible

## 📝 License

MIT License - feel free to use this for your own projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.
=======
# prompt-vault-production
>>>>>>> 0b983d65462fd72d5cff605f52a087f77590def2
