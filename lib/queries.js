import { supabase } from './db';

/**
 * Search prompts with optional filters
 * @param {string} searchTerm - Search query
 * @param {string} category - Filter by category ('all' for no filter)
 * @param {string[]} tags - Filter by tags array
 * @returns {Promise<Array>} Array of prompts
 */
export async function searchPrompts(searchTerm = '', category = 'all', tags = []) {
  let query = supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });

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

  const { data, error } = await query;

  if (error) {
    console.error('Error searching prompts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all unique categories
 * @returns {Promise<Array<string>>} Array of category names
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('prompts')
    .select('category')
    .order('category');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Extract unique categories
  const categories = [...new Set(data.map(item => item.category))];
  return categories.filter(cat => cat); // Remove null/undefined
}

/**
 * Get all unique tags
 * @returns {Promise<Array<string>>} Array of tag names
 */
export async function getTags() {
  const { data, error } = await supabase
    .from('prompts')
    .select('tags')
    .order('tags');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // Flatten and deduplicate tags
  const allTags = data.reduce((acc, item) => {
    if (item.tags && Array.isArray(item.tags)) {
      return [...acc, ...item.tags];
    }
    return acc;
  }, []);

  return [...new Set(allTags)].filter(tag => tag); // Remove null/undefined/empty
}

/**
 * Get a single prompt by ID
 * @param {number} id - Prompt ID
 * @returns {Promise<Object|null>} Prompt object or null
 */
export async function getPromptById(id) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }

  return data;
}

/**
 * Get prompts by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of prompts
 */
export async function getPromptsByCategory(category) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompts by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Get prompts by tag
 * @param {string} tag - Tag name
 * @returns {Promise<Array>} Array of prompts
 */
export async function getPromptsByTag(tag) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .contains('tags', [tag])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompts by tag:', error);
    return [];
  }

  return data || [];
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
