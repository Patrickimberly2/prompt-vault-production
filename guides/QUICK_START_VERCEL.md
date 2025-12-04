# ⚡ Quick Start: Deploy PromptVault to Vercel

## 🚀 **5-Minute Setup**

### **1. Install Supabase Client**
```bash
npm install @supabase/supabase-js @vercel/analytics
```

### **2. Create `.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://zqkcoyoknddubrobhfrp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjI4NTUsImV4cCI6MjA3OTA5ODg1NX0.UWRkmMRdO7jgQy4kIx5N7mSywOuL2P1v8gQs9YHfbck
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY
```

### **3. Create Supabase Client**

`lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

### **4. Create Data Functions**

`lib/prompts.js`:
```javascript
import { supabase } from './supabase'

export async function getPrompts() {
  const { data } = await supabase
    .from('prompts')
    .select('*')
    .order('times_used', { ascending: false })
    .limit(20)
  return data
}
```

### **5. Use in Page**

`pages/index.js`:
```javascript
import { getPrompts } from '../lib/prompts'

export default function Home({ prompts }) {
  return (
    <div>
      {prompts.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  )
}

export async function getStaticProps() {
  const prompts = await getPrompts()
  return { 
    props: { prompts },
    revalidate: 3600 
  }
}
```

### **6. Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables → Add:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

---

## ✅ **Deployment Checklist**

- [ ] Supabase client installed
- [ ] `.env.local` created and added to `.gitignore`
- [ ] `lib/supabase.js` and `lib/prompts.js` created
- [ ] Test locally: `npm run dev`
- [ ] Push to GitHub/GitLab
- [ ] Connect repo in Vercel dashboard
- [ ] Add environment variables in Vercel
- [ ] Deploy!

---

## 🎯 **Your Supabase Credentials**

**URL:** `https://zqkcoyoknddubrobhfrp.supabase.co`

**Anon Key** (safe for client):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjI4NTUsImV4cCI6MjA3OTA5ODg1NX0.UWRkmMRdO7jgQy4kIx5N7mSywOuL2P1v8gQs9YHfbck
```

**Service Role Key** (NEVER expose to client!):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxa2NveW9rbmRkdWJyb2JoZnJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjg1NSwiZXhwIjoyMDc5MDk4ODU1fQ.CM9gmoRO-u2LOnTbZgqAc5lRmwSbWHynyNbk2kUpGIY
```

---

## 📊 **Key Concepts**

### **SSG (Static Site Generation)**
Best for: Homepage, categories, featured prompts
- Builds at deploy time
- Super fast
- Use `getStaticProps` with `revalidate`

### **SSR (Server-Side Rendering)**
Best for: Search, filters, dynamic content
- Builds on each request
- Always fresh
- Use `getServerSideProps`

### **ISR (Incremental Static Regeneration)**
Best for: Content that updates periodically
- Static + auto-update
- Add `revalidate: 3600` to `getStaticProps`

---

## 🔥 **Pro Tips**

1. **Use ISR for speed:**
   ```javascript
   export async function getStaticProps() {
     // ...
     return { 
       props: { data },
       revalidate: 3600  // Update every hour
     }
   }
   ```

2. **Enable Vercel Analytics:**
   ```javascript
   // pages/_app.js
   import { Analytics } from '@vercel/analytics/react'
   
   export default function App({ Component, pageProps }) {
     return (
       <>
         <Component {...pageProps} />
         <Analytics />
       </>
     )
   }
   ```

3. **Add Caching:**
   ```javascript
   // next.config.js
   module.exports = {
     async headers() {
       return [{
         source: '/(.*)',
         headers: [{
           key: 'Cache-Control',
           value: 'public, max-age=3600, stale-while-revalidate=86400'
         }]
       }]
     }
   }
   ```

---

## 🚨 **Common Gotchas**

❌ **Don't:** Use service role key in client code
✅ **Do:** Use anon key for client, service role only in API routes

❌ **Don't:** Forget to add env vars to Vercel
✅ **Do:** Add them in Settings → Environment Variables

❌ **Don't:** Commit `.env.local` to Git
✅ **Do:** Add it to `.gitignore`

---

## 📚 **Quick Links**

- [Full Deployment Guide](VERCEL_SUPABASE_DEPLOYMENT_GUIDE.md)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard/project/zqkcoyoknddubrobhfrp)

---

**Ready to deploy? You got this! 🚀**
