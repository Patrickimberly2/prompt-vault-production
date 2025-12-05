# 🎨 IMPORT BOTH EXCEL FILES - UPDATED GUIDE

## 📊 **TWO EXCEL FILES SUPPORTED:**

### **1. ChatGPT Prompt Learning Library** (Original)
- **Sheets:** 78
- **Prompts:** ~15,000-20,000
- **Categories:** Marketing, Sales, Business, Social Media, etc.
- **AI Model:** ChatGPT

### **2. Midjourney AI Art Prompts** (NEW!)
- **Sheets:** 51
- **Prompts:** ~10,000
- **Categories:** Oil Paintings, Character Design, 3D Art, Portraits, etc.
- **AI Model:** Midjourney

**Total Expected:** ~25,000-30,000 prompts! 🎉

---

## ⚡ **QUICK START:**

### **Step 1: Get Both Files Ready**
Place these files in the same folder as your scripts:
```
your_folder/
├── ChatGPT_Prompt_Learning_Library.xlsx
├── 10000_Midjourney_AI_Art_Prompt_Collection.xlsx
└── import_excel_advanced.py
```

### **Step 2: Run the Importer**
```bash
python import_excel_advanced.py
```

That's it! The script will automatically:
1. ✅ Find both Excel files
2. ✅ Process all sheets (78 + 51 = 129 sheets)
3. ✅ Import ~25,000-30,000 prompts
4. ✅ Skip duplicates
5. ✅ Categorize everything

---

## 📋 **WHAT GETS IMPORTED:**

### **From ChatGPT File:**
| Category | Example Sheets | Est. Prompts |
|----------|---------------|--------------|
| Social Media | Facebook, Instagram, LinkedIn | ~3,000 |
| Email Marketing | Advanced Email, Cold Email | ~1,500 |
| Sales | B2B, B2C, Objections | ~2,500 |
| Business Strategy | Entrepreneur, SaaS, E-commerce | ~2,000 |
| Copywriting | Landing Pages, Funnels | ~1,500 |
| Personal Development | Resume, Career, Time Management | ~1,000 |
| Technical | Excel, Google Sheets | ~500 |
| General | Extra Prompts | ~2,500 |

**Total:** ~15,000-20,000 prompts

### **From Midjourney File:**
| Category | Example Sheets | Est. Prompts |
|----------|---------------|--------------|
| Image Generation | Oil Paintings, Character Design, 3D Art | ~10,000 |

All tagged with:
- ✅ AI Model: "Midjourney"
- ✅ Category: "Image Generation"
- ✅ Prompt Type: "image-generation"
- ✅ Tags: Sheet name + "Midjourney" + "Art"

**Total:** ~10,000 prompts

---

## 🎯 **EXPECTED OUTPUT:**

```
======================================================================
🚀 UNIVERSAL EXCEL IMPORTER
   ChatGPT Prompts + Midjourney Art Prompts
======================================================================

Looking for Excel files...
   ✅ Found: ChatGPT_Prompt_Learning_Library.xlsx
   ✅ Found: 10000_Midjourney_AI_Art_Prompt_Collection.xlsx

======================================================================
📂 PROCESSING: ChatGPT_Prompt_Learning_Library.xlsx
   Type: ChatGPT
======================================================================
   Found 78 sheets
   Processing 77 sheets

   📄 [1/77] Extra Prompts... ✅ 2,170 prompts
   📄 [2/77] E-Commerce... ✅ 1,428 prompts
   📄 [3/77] Sales Funnel... ✅ 1,087 prompts
   ...

======================================================================
📂 PROCESSING: 10000_Midjourney_AI_Art_Prompt_Collection.xlsx
   Type: Midjourney
======================================================================
   Found 51 sheets
   Processing 49 sheets

   📄 [1/49] Oil on Canvas Paintings... ✅ 27 prompts
   📄 [2/49] Super realistic portraits... ✅ 22 prompts
   📄 [3/49] Abstract Pattern Designs... ✅ 102 prompts
   ...

======================================================================
🎉 IMPORT COMPLETE
======================================================================
Files Processed:      2/2
Sheets Processed:     126
Prompts Extracted:    25,847
Prompts Inserted:     25,847
Duplicates Skipped:   0
Errors:               0
======================================================================

✨ Your database now has ~25,847 prompts!
```

---

## ⏱️ **TIME ESTIMATE:**

- **ChatGPT File:** 30-40 minutes
- **Midjourney File:** 15-20 minutes
- **Total:** ~45-60 minutes

The script processes both files automatically!

---

## 🔍 **WHAT IF A FILE IS MISSING?**

If you only have one file, the script will still work:

```
Looking for Excel files...
   ✅ Found: ChatGPT_Prompt_Learning_Library.xlsx
   ⚠️  Not found: 10000_Midjourney_AI_Art_Prompt_Collection.xlsx

Proceeding with 1 file...
```

It will just import the file(s) you have!

---

## ✅ **AFTER IMPORTING:**

### **View Your Stats:**
```bash
python view_stats.py
```

You should see:
```
Total Prompts:    ~25,000-30,000
AI Models:        2 (ChatGPT, Midjourney)
Categories:       10+ categories
```

### **Verify in Supabase:**
Go to your Supabase dashboard:
1. Open "Table Editor"
2. Click "prompts" table
3. You should see ~25,000-30,000 rows!

---

## 🎨 **SEARCHING BY AI MODEL:**

### **Find all Midjourney prompts:**
```sql
SELECT * FROM prompts WHERE ai_model = 'Midjourney';
```

### **Find all ChatGPT prompts:**
```sql
SELECT * FROM prompts WHERE ai_model = 'ChatGPT';
```

### **Find image generation prompts:**
```sql
SELECT * FROM prompts WHERE prompt_type = 'image-generation';
```

---

## 🚀 **USING ON YOUR SITE:**

In your Next.js app, you can filter by AI model:

```javascript
// Get all Midjourney prompts
const { data } = await supabase
  .from('prompts')
  .select('*')
  .eq('ai_model', 'Midjourney')
  .limit(20)

// Get all ChatGPT prompts
const { data } = await supabase
  .from('prompts')
  .select('*')
  .eq('ai_model', 'ChatGPT')
  .limit(20)
```

---

## 📊 **CATEGORIES BREAKDOWN:**

### **ChatGPT Prompts:**
- Social Media
- Email Marketing
- Content Marketing
- Sales
- Business Strategy
- Copywriting
- Technical
- Personal Development
- Customer Service
- Finance & Crypto
- General

### **Midjourney Prompts:**
- Image Generation
  - Oil Paintings
  - Character Design
  - 3D Art
  - Portraits
  - Pattern Designs
  - Photorealistic
  - And 40+ more styles!

---

## 🎉 **YOU'RE READY!**

**Single command to import everything:**
```bash
python import_excel_advanced.py
```

**Expected result:**
- ✅ ~25,000-30,000 prompts imported
- ✅ 2 AI models (ChatGPT + Midjourney)
- ✅ 10+ categories
- ✅ All organized and searchable

**Let it run for 45-60 minutes and you're done!** ☕

---

## 💡 **PRO TIP:**

After importing, run cleanup:
```bash
python cleanup_and_organize.py
```

This will:
- Remove any remaining duplicates
- Normalize categories
- Update statistics
- Polish everything

---

**Ready to import 25,000+ prompts?** 🚀

```bash
python import_excel_advanced.py
```

**GO!** 💪
