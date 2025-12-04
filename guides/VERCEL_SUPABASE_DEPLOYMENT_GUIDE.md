# 🚀 PromptVault 2.0: Complete Vercel + Supabase Deployment Guide

## 📋 **Overview**

This guide will help you deploy your PromptVault Next.js site with Supabase database to Vercel with best practices for environments, security, and performance.

---

## 🎯 **Architecture Overview**

```
┌─────────────────┐
│   Vercel Edge   │  ← Your Next.js App (SSR/SSG)
│    Network      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Supabase DB   │  ← Your 20,000+ prompts
│   (Postgres)    │
└─────────────────┘
```

**Benefits:**
- ⚡ Edge-optimized static pages
- 🔒 Secure environment variables
- 🚀 Automatic deployments
- 📊 Performance analytics
- 🌍 Global CDN

---

## 🔧 **Step 1: Prepare Your Next.js Project**

### **1.1 Install Supabase Client**

```bash
npm install @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
```

### **1.2 Create Supabase Client Utility**

Create `lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### **1.3 Create Data Fetching Functions**

Create `lib/prompts.js`:

```javascript
import { supabase } from './supabase'

// Get all prompts with pagination
export async function getPrompts({ 
  page = 1, 
  limit = 20,
  category = null,
  aiModel = null,
  search = null
}) {
  let query = supabase
    .from('prompts')
    .select('*', { count: 'exact' })
    .order('times_used', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)
  
  if (category) {
    query = query.eq('category', category)
  }
  
  if (aiModel) {
    query = query.eq('ai_model', aiModel)
  }
  
  if (search) {
    query = query.textSearch('prompt_text', search)
  }
  
  const { data, error, count } = await query
  
  if (error) throw error
  
  return { prompts: data, total: count }
}

// Get featured prompts (high popularity)
export async function getFeaturedPrompts(limit = 10) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .gte('times_used', 70)
    .order('times_used', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

// Get recent prompts
export async function getRecentPrompts(limit = 10) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

// Get all categories with counts
export async function getCategories() {
  const { data, error } = await supabase
    .from('prompts')
    .select('category')
    .not('category', 'is', null)
  
  if (error) throw error
  
  // Count by category
  const categoryCounts = {}
  data.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
  })
  
  return Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

// Get single prompt by ID
export async function getPromptById(id) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Search prompts with full-text search
export async function searchPrompts(query, limit = 20) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .textSearch('prompt_text', query)
    .limit(limit)
  
  if (error) throw error
  return data
}

// Increment usage count (for tracking popularity)
export async function incrementPromptUsage(promptId) {
  const { data, error } = await supabase.rpc('increment_prompt_usage', {
    prompt_id: promptId
  })
  
  if (error) throw error
  return data
}
```

---

## 🌐 **Step 2: Set Up Environment Variables**

### **2.1 Create Local Environment File**

Create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zqkcoyoknddubrobhfrp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (NEVER expose to client!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **2.2 Add to .gitignore**

```gitignore
# Environment Variables
.env*.local
.env.production
```

---

## 📦 **Step 3: Deploy to Vercel**

### **3.1 Connect Repository**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Vercel auto-detects Next.js!

### **3.2 Configure Environment Variables**

In Vercel dashboard → Your Project → Settings → Environment Variables:

#### **Production Environment:**

```
NEXT_PUBLIC_SUPABASE_URL = https://zqkcoyoknddubrobhfrp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key]
NEXT_PUBLIC_SITE_URL = https://your-domain.vercel.app
```

**Important Settings:**
- ✅ Target: Production, Preview, Development
- ✅ Type: Encrypted (for service role key)
- ⚠️ Never commit these to Git!

#### **Preview Environment:**

Same variables but with:
```
NEXT_PUBLIC_SITE_URL = https://your-preview-*.vercel.app
```

### **3.3 Deploy**

Click "Deploy" and Vercel will:
1. ✅ Install dependencies
2. ✅ Build your Next.js app
3. ✅ Deploy to edge network
4. ✅ Provide a URL

---

## 🏗️ **Step 4: Optimize for Performance**

### **4.1 Use Static Generation (SSG) for Speed**

For your homepage and category pages, use `getStaticProps`:

```javascript
// pages/index.js
export async function getStaticProps() {
  const featured = await getFeaturedPrompts(10)
  const recent = await getRecentPrompts(10)
  const categories = await getCategories()
  
  return {
    props: {
      featured,
      recent,
      categories
    },
    revalidate: 3600 // Regenerate every hour (ISR)
  }
}

export default function Home({ featured, recent, categories }) {
  return (
    <div>
      <FeaturedSection prompts={featured} />
      <RecentSection prompts={recent} />
      <CategoriesGrid categories={categories} />
    </div>
  )
}
```

### **4.2 Use Server-Side Rendering (SSR) for Dynamic Content**

For search and filtered pages:

```javascript
// pages/prompts/search.js
export async function getServerSideProps({ query }) {
  const { q, category, aiModel } = query
  
  const { prompts, total } = await getPrompts({
    search: q,
    category,
    aiModel,
    limit: 20
  })
  
  return {
    props: { prompts, total, query }
  }
}
```

### **4.3 Enable Edge Caching**

Add cache headers in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
          }
        ]
      }
    ]
  }
}
```

---

## 🔒 **Step 5: Security Best Practices**

### **5.1 Use Row Level Security (RLS) in Supabase**

Your prompts table should have RLS enabled:

```sql
-- Enable RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
ON prompts
FOR SELECT
TO public
USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert"
ON prompts
FOR INSERT
TO authenticated
WITH CHECK (true);
```

### **5.2 Validate Environment Variables**

Add to your app:

```javascript
// lib/config.js
export function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

// Call in _app.js
import { validateConfig } from '../lib/config'

if (typeof window === 'undefined') {
  validateConfig()
}
```

### **5.3 Never Expose Service Role Key**

❌ **NEVER DO THIS:**
```javascript
// DON'T use service role key in client code!
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)
```

✅ **DO THIS:**
```javascript
// Use anon key for client
const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Use service role ONLY in API routes or getServerSideProps
// pages/api/admin.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Safe here!
)
```

---

## 📊 **Step 6: Monitor & Optimize**

### **6.1 Enable Vercel Analytics**

```bash
npm install @vercel/analytics
```

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

### **6.2 Monitor Database Performance**

In Supabase dashboard:
- Database → Reports
- Check query performance
- Monitor connection pool
- Review slow queries

### **6.3 Set Up Error Tracking**

Add Sentry or similar:

```bash
npm install @sentry/nextjs
```

---

## 🎨 **Step 7: Example Page Implementations**

### **Homepage (SSG with ISR)**

```javascript
// pages/index.js
import { getFeaturedPrompts, getRecentPrompts, getCategories } from '../lib/prompts'

export default function Home({ featured, recent, categories }) {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          PromptVault 2.0
        </h1>
        <p className="text-xl text-gray-600">
          20,000+ AI Prompts for Every Use Case
        </p>
      </section>

      {/* Featured Prompts */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">🔥 Featured Prompts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* Recent Prompts */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">🆕 Recently Added</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recent.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-3xl font-bold mb-6">📂 Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <CategoryCard key={cat.name} category={cat} />
          ))}
        </div>
      </section>
    </main>
  )
}

export async function getStaticProps() {
  const featured = await getFeaturedPrompts(9)
  const recent = await getRecentPrompts(9)
  const categories = await getCategories()
  
  return {
    props: { featured, recent, categories },
    revalidate: 3600 // Regenerate every hour
  }
}
```

### **Category Page (SSG with Dynamic Paths)**

```javascript
// pages/category/[slug].js
import { getPrompts, getCategories } from '../../lib/prompts'

export default function CategoryPage({ category, prompts, total }) {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{category}</h1>
      <p className="text-gray-600 mb-8">{total} prompts available</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map(prompt => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </main>
  )
}

export async function getStaticPaths() {
  const categories = await getCategories()
  
  const paths = categories.map(cat => ({
    params: { slug: cat.name.toLowerCase().replace(/ /g, '-') }
  }))
  
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const category = params.slug.replace(/-/g, ' ')
  const { prompts, total } = await getPrompts({ 
    category,
    limit: 50
  })
  
  return {
    props: { category, prompts, total },
    revalidate: 3600
  }
}
```

---

## ✅ **Deployment Checklist**

- [ ] Environment variables configured in Vercel
- [ ] `.env.local` added to `.gitignore`
- [ ] Supabase connection tested locally
- [ ] RLS policies enabled in Supabase
- [ ] Static pages use `getStaticProps` with ISR
- [ ] Analytics installed
- [ ] Error tracking configured
- [ ] Custom domain added (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Cache headers optimized

---

## 🚨 **Common Issues & Solutions**

### **Issue: "supabaseUrl is required"**

**Solution:** Check environment variables are set:
```bash
vercel env ls
```

### **Issue: Slow page loads**

**Solution:** 
1. Enable ISR with `revalidate`
2. Add database indexes on frequently queried columns
3. Use connection pooling in Supabase

### **Issue: Build fails**

**Solution:**
1. Check `next.config.js` is valid
2. Verify all imports are correct
3. Run `npm run build` locally first

---

## 🎯 **Next Steps**

1. **Deploy your first version**
2. **Test all pages work correctly**
3. **Monitor performance in Vercel Analytics**
4. **Add custom domain** (Settings → Domains)
5. **Set up monitoring alerts**
6. **Optimize based on real usage**

---

## 📚 **Resources**

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Next.js Data Fetching](https://nextjs.org/docs/basic-features/data-fetching)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

**You're ready to deploy! 🚀**

Got questions? Let me know!
