# ⚡ ULTRA QUICK START

## 🎯 **Get Your Site Live in 60 Minutes**

---

## **STEP 1: Import Prompts** (30-40 min)

```bash
# Navigate to migration scripts
cd migration_scripts

# Setup environment
cp .env.example .env
# Edit .env - add your Supabase credentials

# Install dependencies (one time)
pip install -r requirements.txt

# Import all prompts (15,000-20,000 prompts)
python import_excel_advanced.py

# Verify results
python view_stats.py
```

**✅ Result:** 15,000-20,000 prompts in your Supabase database!

---

## **STEP 2: Setup Frontend** (10 min)

```bash
# Navigate to your Next.js project
cd "C:\Users\YourName\Your\NextJS\Project"

# Copy frontend components
# From: frontend_components/
# To your project root:

# Copy these folders:
components/
lib/
app/page.js

# Install dependencies
npm install @supabase/supabase-js lucide-react

# Create .env.local
echo NEXT_PUBLIC_SUPABASE_URL=https://zqkcoyoknddubrobhfrp.supabase.co > .env.local
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here >> .env.local

# Test locally
npm run dev
# Open: http://localhost:3000
```

**✅ Result:** Your site works locally with all prompts!

---

## **STEP 3: Deploy to Vercel** (10 min)

```bash
# Push to GitHub
git add .
git commit -m "Add PromptVault 2.0"
git push

# Then in Vercel Dashboard:
# 1. Import your GitHub repo
# 2. Add environment variables:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
# 3. Click "Deploy"
```

**✅ Result:** Your site is LIVE! 🎉

---

## 📋 **That's It!**

Three steps:
1. ✅ Import prompts (30-40 min)
2. ✅ Setup frontend (10 min)
3. ✅ Deploy (10 min)

**Total:** 50-60 minutes to a live site with 20,000+ prompts!

---

## 🆘 **Stuck?**

- **Migration issues?** → See `guides/EXCEL_IMPORT_GUIDE.md`
- **Frontend issues?** → See `guides/SETUP_INSTRUCTIONS.md`
- **Deployment issues?** → See `guides/VERCEL_SUPABASE_DEPLOYMENT_GUIDE.md`

---

## 🚀 **Ready? Start Here:**

```bash
cd migration_scripts
python import_excel_advanced.py
```

**GO!** 💪
