# 🚀 Quick Start - Cleanup Guide

## Run the Cleanup (5 minutes)

### Step 1: Download the Cleanup Script
Save `cleanup_project.ps1` to your project root:
```
C:\Users\KLHst\OneDrive\Documents\GitHub\prompt-vault-production\
```

### Step 2: Run PowerShell as Administrator
1. Press `Win + X`
2. Select "PowerShell (Admin)" or "Terminal (Admin)"
3. Navigate to your project:
```powershell
cd C:\Users\KLHst\OneDrive\Documents\GitHub\prompt-vault-production
```

### Step 3: Enable Script Execution (One-time)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 4: Run the Cleanup Script
```powershell
.\cleanup_project.ps1
```

### Step 5: Review Changes
The script will:
- ✅ Remove `.next/` build cache (~70,000 lines!)
- ✅ Move duplicates to `__review_needed__/`
- ✅ Organize scripts into `/scripts/` folder
- ✅ Create proper folder structure
- ✅ Show you what was moved/removed

### Step 6: Update .gitignore
```powershell
# Backup your current .gitignore
Copy-Item .gitignore .gitignore.backup

# Replace with recommended version
Copy-Item .gitignore_recommended .gitignore
```

### Step 7: Rebuild Dependencies
```powershell
# Clean install
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
```

### Step 8: Test Locally
```powershell
npm run dev
```
Visit: http://localhost:3000

### Step 9: Commit Changes
```powershell
# Stage all changes
git add .

# Commit
git commit -m "chore: major cleanup - remove build artifacts, organize structure"

# Push to GitHub
git push origin main
```

### Step 10: Verify Deployment
Check your Vercel dashboard - deployment should work normally.

---

## ⚠️ Important: Manual Checks

### 1. Check Environment Variables
```powershell
# Look for old .env in review folder
Get-Content __review_needed__\PromptVault_2.0_Scripts_OLD\.env

# If it has secrets you need:
# 1. Copy them to .env.local (NOT .env)
# 2. Add to Vercel environment variables
# 3. Delete the old file
```

### 2. Verify Excel Data Files
```powershell
# Check if Excel file is still needed
Get-ChildItem __review_needed__ -Recurse -Filter "*.xlsx"

# If data not yet imported:
# Move to: ./scripts/data/filename.xlsx
# Then run your import script
```

---

## 🎯 Expected Results

### Before:
```
Repository size: ~500MB
File structure: 74,860 lines
.next/ cache: COMMITTED ❌
Duplicate configs: YES ❌
Clear structure: NO ❌
```

### After:
```
Repository size: ~5-10MB
File structure: ~300-500 files
.next/ cache: GITIGNORED ✅
Duplicate configs: REMOVED ✅
Clear structure: YES ✅
```

---

## 🆘 If Something Goes Wrong

### Rollback Everything
```powershell
# Undo all changes (before commit)
git checkout .
git clean -fd

# Restore a specific file from review
Copy-Item "__review_needed__\backup_files\filename" ".\"
```

### Restore Old Structure
```powershell
# Restore PromptVault_2.0_Scripts
Copy-Item -Recurse "__review_needed__\PromptVault_2.0_Scripts_OLD" ".\PromptVault_2.0_Scripts"
```

---

## 📞 Need Help?

### Common Issues:

**Issue**: "Execution Policy Restricted"
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\cleanup_project.ps1
```

**Issue**: "File in Use" errors
- Close VS Code / other editors
- Stop development server (`Ctrl+C`)
- Run script again

**Issue**: npm install fails
```powershell
# Clear npm cache
npm cache clean --force
# Delete package-lock
Remove-Item package-lock.json
# Try again
npm install
```

**Issue**: Vercel deployment fails
1. Check environment variables in Vercel dashboard
2. Verify .env.example has all required keys
3. Rebuild: `vercel --prod`

---

## ✅ Final Checklist

- [ ] Ran cleanup script successfully
- [ ] Updated .gitignore
- [ ] Checked old .env for secrets
- [ ] Ran `npm install` without errors
- [ ] Tested locally with `npm run dev`
- [ ] Application loads correctly
- [ ] Committed changes to git
- [ ] Pushed to GitHub
- [ ] Verified Vercel deployment
- [ ] Deleted `__review_needed__/` folder (after confirming)

---

**Time Required**: ~10-15 minutes
**Difficulty**: Easy
**Risk Level**: Low (everything backed up in `__review_needed__/`)

🎉 **You're done!** Your project is now clean and organized.
