import { supabase } from './db';

/**
 * Search prompts with optional filters
 * @param {Object} options - Search options
 * @param {string} options.searchTerm - Search query
 * @param {string} options.category - Filter by category
 * @param {string[]} options.tags - Filter by tags array
 * @param {number} options.limit - Max number of results
 * @param {string} options.sortBy - Sort method ('popular', 'recent')
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function searchPrompts(options = {}) {
  if (!supabase) {
    return { data: [], error: null };
  }

  const { searchTerm = '', category = 'all', tags = [], limit = 50, sortBy = 'recent' } = options;

  let query = supabase
    .from('prompts')
    .select('*');

  // Apply sorting
  if (sortBy === 'popular') {
    // Use created_at as fallback since views column doesn't exist yet
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Apply search filter
  if (searchTerm && searchTerm.trim() !== '') {
    query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
  }

  // Apply category filter
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  // Apply tags filter
  if (tags && tags.length > 0) {
    query = query.contains('tags', tags);
  }

  // Apply limit
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error searching prompts:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get all unique categories
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getCategories() {
  if (!supabase) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    // Fallback: try to get unique categories from prompts table
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('category')
      .order('category');

    if (promptsError) {
      console.error('Error fetching categories:', promptsError);
      return { data: [], error: promptsError };
    }

    const categories = [...new Set(prompts.map(item => item.category))]
      .filter(cat => cat)
      .map((name, index) => ({ id: index, name, slug: name.toLowerCase().replace(/\s+/g, '-') }));
    
    return { data: categories, error: null };
  }

  return { data: data || [], error: null };
}

/**
 * Get all unique tags
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getTags() {
  if (!supabase) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('prompts')
    .select('tags')
    .order('tags');

  if (error) {
    console.error('Error fetching tags:', error);
    return { data: [], error };
  }

  // Flatten and deduplicate tags
  const allTags = (data || []).reduce((acc, item) => {
    if (item.tags && Array.isArray(item.tags)) {
      return [...acc, ...item.tags];
    }
    return acc;
  }, []);

  return { data: [...new Set(allTags)].filter(tag => tag), error: null };
}

/**
 * Get a single prompt by ID
 * @param {number|string} id - Prompt ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getPromptById(id) {
  if (!supabase) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching prompt:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get prompts by category
 * @param {string} category - Category name
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getPromptsByCategory(category) {
  if (!supabase) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompts by category:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get prompts by tag
 * @param {string} tag - Tag name
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getPromptsByTag(tag) {
  if (!supabase) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .contains('tags', [tag])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompts by tag:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get total count of prompts
 * @returns {Promise<number>} Total number of prompts
 */
export async function getPromptsCount() {
  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting prompts:', error);
    return 0;
  }

  return count || 0;
}
