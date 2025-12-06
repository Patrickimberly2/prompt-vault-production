import { supabase } from './supabase'

/**
 * Get prompts with filters and pagination
 */
export async function getPrompts({
  page = 1,
  limit = 20,
  category = null,
  aiModel = null,
  search = null,
  sortBy = 'times_used' // 'times_used', 'created_at', 'name'
}) {
  let query = supabase
    .from('prompts')
    .select('*', { count: 'exact' })

  // Apply filters
  if (category) {
    query = query.eq('category', category)
  }

  if (aiModel) {
    query = query.eq('ai_model', aiModel)
  }

  if (search) {
    query = query.textSearch('prompt_text', search)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: false })

  // Apply pagination
  const start = (page - 1) * limit
  const end = start + limit - 1
  query = query.range(start, end)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching prompts:', error)
    throw error
  }

  return {
    prompts: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

/**
 * Get featured prompts (high popularity)
 */
export async function getFeaturedPrompts(limit = 10) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .gte('times_used', 70)
    .order('times_used', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured prompts:', error)
    return []
  }

  return data || []
}

/**
 * Get recent prompts
 */
export async function getRecentPrompts(limit = 10) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent prompts:', error)
    return []
  }

  return data || []
}

/**
 * Get all categories with counts
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('prompts')
    .select('category')
    .not('category', 'is', null)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  // Count by category
  const categoryCounts = {}
  data.forEach(item => {
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
    }
  })

  return Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get single prompt by ID
 */
export async function getPromptById(id) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching prompt:', error)
    throw error
  }

  return data
}

/**
 * Search prompts with full-text search
 */
export async function searchPrompts(query, limit = 20) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .textSearch('prompt_text', query)
    .limit(limit)

  if (error) {
    console.error('Error searching prompts:', error)
    return []
  }

  return data || []
}

/**
 * Get AI models with counts
 */
export async function getAIModels() {
  const { data, error } = await supabase
    .from('prompts')
    .select('ai_model')
    .not('ai_model', 'is', null)

  if (error) {
    console.error('Error fetching AI models:', error)
    return []
  }

  // Count by AI model
  const modelCounts = {}
  data.forEach(item => {
    if (item.ai_model) {
      modelCounts[item.ai_model] = (modelCounts[item.ai_model] || 0) + 1
    }
  })

  return Object.entries(modelCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get database stats
 */
export async function getStats() {
  const { count, error } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error fetching stats:', error)
    return { total: 0 }
  }

  const categories = await getCategories()
  const models = await getAIModels()

  return {
    total: count || 0,
    categories: categories.length,
    models: models.length
  }
}
