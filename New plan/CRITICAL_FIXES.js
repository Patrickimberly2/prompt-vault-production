// ============================================
// PromptVault Critical Bug Fixes
// Apply these changes IMMEDIATELY before any new development
// ============================================

// ============================================
// FIX 1: app/layout.js - Add CSS Import
// ============================================
// REPLACE your current layout.js with this:

export const metadata = {
  title: 'PromptVault - AI Prompt Library',
  description: 'Your comprehensive AI prompt organizer with 20,000+ prompts from Notion collections',
  keywords: ['AI prompts', 'ChatGPT', 'prompt library', 'AI tools'],
};

import './globals.css';  // ← THIS LINE WAS MISSING!

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}


// ============================================
// FIX 2: lib/queries.js - Fix Schema Mismatch + Add Pagination
// ============================================
// REPLACE your current queries.js with this:

import { supabase } from './db';

/**
 * Search prompts with optional filters and pagination
 * @param {string} searchTerm - Search query
 * @param {string} category - Filter by category ('all' for no filter)
 * @param {string[]} tags - Filter by tags array
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Results per page
 * @returns {Promise<{data: Array, count: number}>} Prompts and total count
 */
export async function searchPrompts(searchTerm = '', category = 'all', tags = [], page = 1, limit = 50) {
  // Calculate offset
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('prompts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply search filter - FIXED: Using correct column names
  if (searchTerm && searchTerm.trim() !== '') {
    query = query.or(`name.ilike.%${searchTerm}%,prompt_text.ilike.%${searchTerm}%`);
  }

  // Apply category filter
  if (category && category !== 'all') {
    // If using category name directly
    query = query.eq('use_case', category);
  }

  // Apply tags filter (if you have a tags array column)
  // Note: Your schema uses junction tables, so this might need adjustment
  // if (tags && tags.length > 0) {
  //   query = query.contains('tags', tags);
  // }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error searching prompts:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Get all unique categories
 * @returns {Promise<Array<string>>} Array of category names
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('name, slug')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all tags
 * @returns {Promise<Array>} Array of tags
 */
export async function getTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, slug')
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single prompt by ID - FIXED: Using correct column names
 * @param {string} id - Prompt UUID
 * @returns {Promise<Object|null>} Prompt object or null
 */
export async function getPromptById(id) {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      prompt_categories(
        categories(id, name, slug)
      ),
      prompt_tags(
        tags(id, name, slug)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }

  // Transform nested data for easier use
  if (data) {
    data.categories = data.prompt_categories?.map(pc => pc.categories) || [];
    data.tags = data.prompt_tags?.map(pt => pt.tags) || [];
    delete data.prompt_categories;
    delete data.prompt_tags;
  }

  return data;
}

/**
 * Get prompts by category with pagination
 * @param {string} categorySlug - Category slug
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 * @returns {Promise<{data: Array, count: number}>}
 */
export async function getPromptsByCategory(categorySlug, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  
  // First get category ID
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return { data: [], count: 0 };

  const { data, error, count } = await supabase
    .from('prompts')
    .select(`
      *,
      prompt_categories!inner(category_id)
    `, { count: 'exact' })
    .eq('prompt_categories.category_id', category.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching prompts by category:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Get prompts by tag with pagination
 * @param {string} tagSlug - Tag slug
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 * @returns {Promise<{data: Array, count: number}>}
 */
export async function getPromptsByTag(tagSlug, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  
  // First get tag ID
  const { data: tag } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', tagSlug)
    .single();

  if (!tag) return { data: [], count: 0 };

  const { data, error, count } = await supabase
    .from('prompts')
    .select(`
      *,
      prompt_tags!inner(tag_id)
    `, { count: 'exact' })
    .eq('prompt_tags.tag_id', tag.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching prompts by tag:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Get total count of prompts
 * @returns {Promise<number>} Total number of prompts
 */
export async function getPromptsCount() {
  const { count, error } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting prompts:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Full-text search using PostgreSQL (after adding search_vector column)
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 * @returns {Promise<{data: Array, count: number}>}
 */
export async function fullTextSearch(query, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .rpc('search_prompts', { 
      search_query: query,
      result_limit: limit,
      result_offset: offset
    });

  if (error) {
    console.error('Error in full-text search:', error);
    // Fallback to basic search
    return searchPrompts(query, 'all', [], page, limit);
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Track prompt usage
 * @param {string} promptId - Prompt UUID
 */
export async function trackPromptUsage(promptId) {
  // Update times_used and last_used_at
  await supabase
    .from('prompts')
    .update({ 
      times_used: supabase.raw('times_used + 1'),
      last_used_at: new Date().toISOString()
    })
    .eq('id', promptId);
}


// ============================================
// FIX 3: app/page.js - Update to use new query format
// ============================================
// Key changes needed in your page.js:

// Change this:
// const [promptsData, categoriesData, tagsData] = await Promise.all([
//   searchPrompts(),
//   getCategories(),
//   getTags()
// ]);
// setPrompts(promptsData);

// To this:
// const [promptsResult, categoriesData, tagsData] = await Promise.all([
//   searchPrompts('', 'all', [], 1, 50),
//   getCategories(),
//   getTags()
// ]);
// setPrompts(promptsResult.data);
// setTotalCount(promptsResult.count);

// And in your handleSearch function, update:
// const results = await searchPrompts(searchTerm, selectedCategory, selectedTags);
// To:
// const results = await searchPrompts(searchTerm, selectedCategory, selectedTags, currentPage, 50);
// setPrompts(results.data);
// setTotalCount(results.count);


// ============================================
// FIX 4: app/prompt/[id]/page.js - Fix field names
// ============================================
// Update the JSX to use correct field names:

// Change: {prompt.title}
// To:     {prompt.name}

// Change: {prompt.content}
// To:     {prompt.prompt_text}

// Change: await navigator.clipboard.writeText(prompt.content)
// To:     await navigator.clipboard.writeText(prompt.prompt_text)
