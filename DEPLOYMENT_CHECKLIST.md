# Deployment Checklist

Use this checklist to ensure a smooth deployment of PromptVault to production.

## Phase 1: Database Setup ✓

- [ ] Supabase project created
- [ ] SQL schema executed (`supabase/schema.sql`)
- [ ] Prompts table exists with correct columns
- [ ] Indexes created (content_fts, category, tags)
- [ ] Row Level Security enabled
- [ ] Public read policy created
- [ ] Test query in Supabase SQL Editor works

## Phase 2: Data Import ✓

- [ ] Notion export downloaded and extracted
- [ ] Python dependencies installed (`pip install -r scripts/requirements.txt`)
- [ ] `NOTION_EXPORT_DIR` path updated in `notion_to_csv.py`
- [ ] Import script executed successfully
- [ ] `prompts.csv` generated
- [ ] CSV imported to Supabase (via Dashboard or psql)
- [ ] Verify row count matches expected prompts
- [ ] Sample queries return data correctly
- [ ] Review `import_errors.log` for any issues

## Phase 3: Local Development ✓

- [ ] `.env.local` created from `.env.example`
- [ ] Supabase URL and anon key added
- [ ] `npm install` completed successfully
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Homepage loads at localhost:3000
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Tag filtering works
- [ ] No console errors in browser DevTools
- [ ] Supabase API calls visible in Network tab

## Phase 4: Code Repository ✓

- [ ] Git repository initialized
- [ ] `.gitignore` includes `.env.local`
- [ ] All files committed to Git
- [ ] GitHub repository created
- [ ] Code pushed to GitHub main branch
- [ ] README.md is complete and accurate
- [ ] Repository is public (or private with Vercel access)

## Phase 5: Vercel Deployment ✓

- [ ] Vercel account created/logged in
- [ ] GitHub repository imported to Vercel
- [ ] Framework preset detected as Next.js
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] Variables set for both Production and Preview
- [ ] Initial deployment successful
- [ ] Vercel preview URL loads correctly
- [ ] Prompts display on preview site
- [ ] Search works on preview site
- [ ] No build errors in Vercel logs

## Phase 6: Domain Configuration ✓

- [ ] Custom domain added in Vercel (Settings → Domains)
- [ ] DNS records noted from Vercel
- [ ] Logged into Namecheap
- [ ] Advanced DNS section accessed
- [ ] Old/conflicting DNS records removed
- [ ] Vercel A record added (`@` → `76.76.21.21`)
- [ ] Vercel CNAME record added (`www` → `cname.vercel-dns.com`)
- [ ] DNS changes saved in Namecheap
- [ ] SSL certificate status checked in Vercel (should auto-provision)

## Phase 7: DNS Propagation & Final Verification ✓

- [ ] Waited for DNS propagation (check whatsmydns.net)
- [ ] Custom domain loads in browser
- [ ] SSL certificate is valid (https with green lock)
- [ ] All prompts display correctly
- [ ] Search functionality works on production
- [ ] Filters work on production
- [ ] Mobile responsive design verified
- [ ] curl verification completed:
  ```bash
  curl -I https://promptvault.com
  # Should return HTTP/2 200 with x-vercel-id header
  ```
- [ ] Screenshot captured showing working production site

## Post-Deployment Monitoring

- [ ] Set up Vercel analytics (optional)
- [ ] Configure Supabase database backups
- [ ] Monitor Supabase usage and quotas
- [ ] Test site across different browsers
- [ ] Test site on mobile devices
- [ ] Share production URL with team/users

## Rollback Plan (If Needed)

If deployment fails:
1. Check Vercel build logs for errors
2. Verify environment variables are correct
3. Test Supabase connection from local dev
4. Check Supabase database is accessible
5. Review DNS records in Namecheap
6. Contact support if issues persist

---

**Deployment Date:** _________________
**Deployed By:** _________________
**Production URL:** https://promptvault.com
**Notes:** _________________
