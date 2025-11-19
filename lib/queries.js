import { supabase } from './db'

/**
 * Search prompts with full-text search and filters
 * @param {string} searchTerm - Search query
 * @param {string} category - Optional category filter
 * @param {string[]} tags - Optional tag filters
 * @param {number} limit - Results limit (default: 50)
 * @returns {Promise<Array>} Array of prompt objects
 */
export async function searchPrompts(searchTerm = '', category = null, tags = [], limit = 50) {
  try {
    let query = supabase
      .from('prompts')
      .select('*')
    
    // Full-text search on content
    if (searchTerm) {
      query = query.textSearch('content', searchTerm, {
        type: 'websearch',
        config: 'english'
      })
    }
    
    // Category filter
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    // Tag filters (array contains)
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    }
    
    // Apply limit and ordering
    query = query
      .order('created_at', { ascending: false })
      .limit(limit)
    
    const { data, error } = await query
    
    if (error) {
      console.error('Supabase query error:', error)
      return []
    }
    
    return data || []
    
  } catch (error) {
    console.error('Search prompts error:', error)
    return []
  }
}

/**
 * Get all unique categories
 * @returns {Promise<Array>} Array of category strings
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('category')
      .not('category', 'is', null)
    
    if (error) {
      console.error('Get categories error:', error)
      return []
    }
    
    // Extract unique categories
    const categories = [...new Set(data.map(row => row.category))]
    return categories.sort()
    
  } catch (error) {
    console.error('Get categories error:', error)
    return []
  }
}

/**
 * Get all unique tags
 * @returns {Promise<Array>} Array of tag strings
 */
export async function getTags() {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('tags')
    
    if (error) {
      console.error('Get tags error:', error)
      return []
    }
    
    // Flatten and deduplicate tags
    const allTags = data.flatMap(row => row.tags || [])
    return [...new Set(allTags)].sort()
    
  } catch (error) {
    console.error('Get tags error:', error)
    return []
  }
}
