# 🔧 FIX: "supabase_url is required" Error

## ❌ THE ERROR

```
supabase._sync.client.SupabaseException: supabase_url is required
```

This means the script can't find your Supabase credentials.

---

## ✅ SOLUTION 1: Use the FIXED Script (EASIEST!)

I've created a version with credentials already built-in.

### **Download the Fixed Script:**
- **File:** `import_notion_csv_FIXED.py`
- No `.env` file needed!
- Ready to run immediately!

### **Run it:**
```bash
python import_notion_csv_FIXED.py
```

**That's it!** No configuration needed.

---

## ✅ SOLUTION 2: Create .env File (For Future)

If you want to use `.env` files properly:

### **Step 1: Create .env File**

**Using Notepad:**
1. Open Notepad (NOT Word!)
2. Paste EXACTLY this:

```
SUPABASE_URL=https://zqkcoyoknddubrobhfrp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY
```

3. Click **File** → **Save As**
4. File name: `.env` (include the dot!)
5. Save as type: **All Files** (not Text Documents!)
6. Location: `C:\Users\KLHst\OneDrive\Documents\GitHub\prompt-vault-production\`
7. Click **Save**

### **Step 2: Verify File**

```bash
dir .env
```

Should show: `.env` (NOT `.env.txt` or `_env`)

### **Step 3: Run Original Script**

```bash
python import_notion_csv.py
```

---

## ✅ SOLUTION 3: Using VS Code

If you have VS Code:

1. Open your project folder in VS Code
2. Create new file: `.env`
3. Paste the credentials
4. Save
5. Run: `python import_notion_csv.py`

---

## 🎯 RECOMMENDED: Use the FIXED Script!

**Quickest solution:**

1. Download `import_notion_csv_FIXED.py`
2. Put it in: `C:\Users\KLHst\OneDrive\Documents\GitHub\prompt-vault-production\`
3. Run: `python import_notion_csv_FIXED.py`
4. Done! ✅

---

## 📋 Common .env File Mistakes

**❌ WRONG:**
- File named: `_env` (missing dot)
- File named: `.env.txt` (has .txt extension)
- File named: `env` (no dot)
- Extra quotes around values
- Extra spaces

**✅ CORRECT:**
- File named: `.env` (exactly)
- No quotes needed
- No spaces around `=`
- Each variable on its own line

---

## 🚀 READY TO IMPORT!

**Use the FIXED script:**
```bash
python import_notion_csv_FIXED.py
```

**Or create .env file and use:**
```bash
python import_notion_csv.py
```

**Both will work!** The FIXED version is just faster to set up.

---

## 📦 What You'll Get

After running the script:
- ✅ ~100 new Notion prompts
- ✅ 20 new categories
- ✅ Total: ~9,655 prompts
- ✅ All organized and ready!

**Import takes ~1-2 minutes!** 🎉
