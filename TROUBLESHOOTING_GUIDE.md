# 🔧 Troubleshooting Guide - Cleanup & Organization

---

## 🚨 Common Issues & Solutions

### Issue #1: PowerShell Script Won't Run

**Error Message:**
```
cannot be loaded because running scripts is disabled on this system
```

**Solution 1: Bypass for Current Session (Safest)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\cleanup_project.ps1
```

**Solution 2: Enable for Current User**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\cleanup_project.ps1
```

**Solution 3: Run as Administrator**
```powershell
# Right-click PowerShell → "Run as Administrator"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
.\cleanup_project.ps1
```

---

### Issue #2: "File in Use" or "Access Denied"

**Error Message:**
```
Remove-Item : Cannot remove item: The process cannot access the file
```

**Solution:**
1. **Close all editors and IDEs**
   - Close VS Code
   - Close any text editors
   - Close file explorer in that folder

2. **Stop development server**
   ```powershell
   # Press Ctrl+C in terminal running npm run dev
   ```

3. **Check for Node processes**
   ```powershell
   # List Node processes
   Get-Process node
   
   # Kill all Node processes
   Get-Process node | Stop-Process -Force
   ```

4. **Restart and try again**
   ```powershell
   .\cleanup_project.ps1
   ```

---

### Issue #3: Git Shows Massive Changes

**When running `git status` after cleanup:**
```
Changes not staged for commit:
  deleted:    .next/...
  deleted:    PromptVault_2.0_Scripts/...
  (thousands of files)
```

**This is NORMAL and EXPECTED!**

**Solution:**
```powershell
# Review changes first
git status | more

# Stage all changes
git add .

# Verify what will be committed
git status

# Commit the cleanup
git commit -m "chore: major cleanup - remove build artifacts and duplicates"

# Push to GitHub
git push origin main
```

**If git diff is too slow:**
```powershell
# Skip diff, just add and commit
git add -A
git commit -m "chore: major cleanup"
git push origin main
```

---

### Issue #4: npm install Fails After Cleanup

**Error Message:**
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path package.json
```

**Solution 1: Verify package.json exists**
```powershell
# Check if package.json is in root
Test-Path .\package.json

# If missing, restore from review folder
Copy-Item "__review_needed__\duplicate_configs\scripts_package.json" ".\package.json"
```

**Solution 2: Clean install**
```powershell
# Remove node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Fresh install
npm install
```

**Solution 3: Check Node version**
```powershell
node --version
# Should be v18.x or higher for Next.js 14

# Update Node if needed
# Download from: https://nodejs.org/
```

---

### Issue #5: Vercel Deployment Fails

**Error:** Build fails after cleanup

**Solution 1: Check Environment Variables**
```
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all required variables are set:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (if needed)
   - NOTION_API_KEY (if needed)

3. If missing, add them from your .env.local
```

**Solution 2: Trigger Manual Deployment**
```powershell
# Redeploy from CLI
npm install -g vercel
vercel --prod
```

**Solution 3: Check Build Command**
```
In Vercel Dashboard → Settings → Build & Development:
- Build Command: npm run build
- Output Directory: .next
- Install Command: npm install
```

**Solution 4: Review Build Logs**
```
1. Go to Vercel Dashboard → Deployments
2. Click on failed deployment
3. Check "Building" logs for specific errors
4. Common issues:
   - Missing environment variables
   - Import path errors (update if files moved)
   - Missing dependencies (add to package.json)
```

---

### Issue #6: "Module not found" Errors

**Error Message:**
```
Module not found: Can't resolve '@/lib/db'
```

**Solution 1: Check import paths**
```javascript
// If file was moved, update import
❌ import { db } from '@/PromptVault_2.0_Scripts/lib/db'
✅ import { db } from '@/lib/supabase/client'
```

**Solution 2: Verify jsconfig.json**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"]
    }
  }
}
```

**Solution 3: Update absolute imports**
```powershell
# Search for old import patterns
Get-ChildItem -Recurse -Include *.js,*.jsx | Select-String "PromptVault_2.0_Scripts"

# Update each file found
```

---

### Issue #7: Database Connection Fails

**Error:** Supabase client not connecting

**Solution 1: Verify Environment Variables**
```powershell
# Check .env.local exists and has values
Get-Content .env.local

# Should contain:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**Solution 2: Check Supabase Client Path**
```javascript
// Update import if file was moved
❌ import { supabase } from '@/lib/db'
✅ import { supabase } from '@/lib/supabase/client'
```

**Solution 3: Restart Development Server**
```powershell
# Stop server (Ctrl+C)
# Start again
npm run dev
```

---

### Issue #8: Python Scripts Not Working

**Error:** Import errors in Python scripts

**Solution 1: Check Script Paths**
```powershell
# Scripts should now be in:
scripts/migration/migrate_notion_enhanced.py
scripts/sync/import_excel.py
scripts/utils/verify_setup.py

# Update any hardcoded paths in scripts
```

**Solution 2: Install Python Dependencies**
```powershell
# Navigate to scripts folder
cd scripts

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

**Solution 3: Update Import Paths in Scripts**
```python
# If scripts imported each other, update paths
❌ from PromptVault_2.0_Scripts.import_excel import process_file
✅ from sync.import_excel import process_file
```

---

### Issue #9: SQL Files Not Found

**Error:** Migration script can't find SQL files

**Solution:**
```powershell
# SQL files should be in:
supabase/migrations/

# Update any script references
❌ sql_path = "PromptVault_2.0_Scripts/supabase_schema.sql"
✅ sql_path = "supabase/migrations/supabase_schema.sql"
```

---

### Issue #10: Lost Important File

**Error:** "I can't find [filename] anymore!"

**Solution 1: Check Review Folder**
```powershell
# Search in review folder
Get-ChildItem -Path __review_needed__ -Recurse -Filter "*filename*"

# Restore if found
Copy-Item "__review_needed__\path\to\file" ".\"
```

**Solution 2: Check Git History**
```powershell
# Before committing, you can recover
git checkout filename

# After committing, recover from previous commit
git log --all --full-history -- "**/filename"
git checkout <commit-hash> -- path/to/filename
```

**Solution 3: Check Recycle Bin**
```
Windows Recycle Bin may have the file if deleted (not moved)
```

---

### Issue #11: Can't Delete __review_needed__

**Error:** Folder won't delete after review

**Solution:**
```powershell
# Make sure nothing is using files in folder
Get-Process | Where-Object {$_.Path -like "*__review_needed__*"}

# Force delete with elevated permissions
Remove-Item -Recurse -Force __review_needed__ -ErrorAction SilentlyContinue

# If still fails, delete from File Explorer:
# Right-click → Delete (or Shift+Delete for permanent)
```

---

### Issue #12: GitHub Shows Weird Characters

**Issue:** Git showing binary characters or encoding issues

**Solution:**
```powershell
# Your file_structure.txt had UTF-16 encoding
# Git works best with UTF-8

# Regenerate with UTF-8 encoding
tree /F | Out-File -Encoding utf8 file_structure_new.txt

# Or use PowerShell command
Get-ChildItem -Recurse | Out-File -Encoding utf8 structure.txt
```

---

### Issue #13: Development Server Won't Start

**Error Message:**
```
Error: Cannot find module 'next'
```

**Solution:**
```powershell
# Reinstall all dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# If still failing, check Node version
node --version
# Must be 18.17.0 or higher

# Start server
npm run dev
```

---

### Issue #14: Duplicate Files Still Exist

**Issue:** Found duplicate files after running cleanup

**Solution:**
```powershell
# Find remaining duplicates
Get-ChildItem -Recurse -Include "*copy*","*(1)*" | Select-Object FullName

# Move to review folder manually
$file = "path\to\duplicate"
Move-Item $file "__review_needed__\duplicate_prompts\"
```

---

## 🔍 Diagnostic Commands

### Check Repository Status
```powershell
# See what changed
git status

# See size of .git folder
du -sh .git

# Count files being tracked
git ls-files | Measure-Object -Line
```

### Check File Structure
```powershell
# See folder sizes
Get-ChildItem | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse | Measure-Object -Property Length -Sum).Sum
    [PSCustomObject]@{
        Folder = $_.Name
        SizeMB = [math]::Round($size / 1MB, 2)
    }
} | Sort-Object SizeMB -Descending

# Find large files
Get-ChildItem -Recurse -File | Sort-Object Length -Descending | Select-Object -First 20 FullName, @{Name="SizeMB";Expression={[math]::Round($_.Length/1MB,2)}}
```

### Check Dependencies
```powershell
# Check Node version
node --version

# Check npm version
npm --version

# Check for npm issues
npm doctor
```

---

## 🆘 Emergency Rollback

### If Everything Goes Wrong

**Before Commit:**
```powershell
# Undo all changes
git checkout .
git clean -fd

# Everything back to before cleanup
```

**After Commit:**
```powershell
# Revert to previous commit
git log --oneline
git reset --hard <previous-commit-hash>

# Force push (⚠️ only if you're the only developer)
git push -f origin main
```

**Nuclear Option:**
```powershell
# Clone fresh from GitHub (loses local changes)
cd ..
Remove-Item -Recurse -Force prompt-vault-production
git clone https://github.com/Patrickimberly2/prompt-vault-production.git
cd prompt-vault-production
```

---

## 📞 Getting Help

### Information to Provide
When asking for help, include:
1. Exact error message
2. What you were doing when error occurred
3. Output of diagnostic commands
4. Your OS and versions:
   ```powershell
   # System info
   systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
   
   # Node/npm versions
   node --version
   npm --version
   
   # Git version
   git --version
   ```

### Useful Resources
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **npm Troubleshooting**: https://docs.npmjs.com/

---

## ✅ Verification Checklist

After cleanup, verify:
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts development server
- [ ] http://localhost:3000 loads correctly
- [ ] Database connections work
- [ ] All pages render properly
- [ ] No console errors in browser
- [ ] Vercel deployment successful
- [ ] Environment variables configured
- [ ] Git repository size reduced
- [ ] All needed files present

---

**Remember**: The `__review_needed__` folder has backups of everything moved. Nothing is permanently lost! 🔒
