import { supabase } from './db';

// ============================================
// PROMPTS QUERIES
// ============================================

/**
 * Search prompts with pagination and filters
 * @param {Object} options
 * @param {string} [options.searchTerm]
 * @param {string} [options.category]
 * @param {string[]} [options.tags]
 * @param {string} [options.aiModel]
 * @param {number} [options.minRating]
 * @param {string} [options.sortBy] - 'newest' | 'popular' | 'rating' | 'relevance'
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @returns {Promise<{data: Prompt[], count: number, error: Error|null}>}
 */
export async function searchPrompts({
  searchTerm = '',
  category = '',
  tags = [],
  aiModel = '',
  minRating = 0,
  sortBy = 'newest',
  page = 1,
  limit = 20,
} = {}) {
  try {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('prompts')
      .select(`
        *,
        prompt_categories!inner(category_id),
        prompt_tags(tag_id)
      `, { count: 'exact' });

    // Search filter
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,prompt_text.ilike.%${searchTerm}%`);
    }

    // Category filter
    if (category) {
      query = query.eq('prompt_categories.category_id', category);
    }

    // AI Model filter
    if (aiModel) {
      query = query.eq('ai_model', aiModel);
    }

    // Rating filter
    if (minRating > 0) {
      query = query.gte('rating', minRating);
    }

    // Sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('times_used', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false, nullsFirst: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error searching prompts:', error);
    return { data: [], count: 0, error };
  }
}

/**
 * Full-text search using PostgreSQL (requires search_vector column)
 * @param {string} query
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{data: Prompt[], count: number, error: Error|null}>}
 */
export async function fullTextSearch(query, page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;
    
    const { data, count, error } = await supabase
      .rpc('search_prompts', { search_query: query })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error in full-text search:', error);
    return { data: [], count: 0, error };
  }
}

/**
 * Get a single prompt by ID with full details
 * @param {string} id
 * @returns {Promise<{data: Prompt|null, error: Error|null}>}
 */
export async function getPromptById(id) {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        prompt_categories(
          categories(id, name, slug, color, icon)
        ),
        prompt_tags(
          tags(id, name, slug)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Transform nested data
    const transformed = data ? {
      ...data,
      categories: data.prompt_categories?.map(pc => pc.categories) || [],
      tags: data.prompt_tags?.map(pt => pt.tags) || [],
    } : null;

    // Remove junction table data
    delete transformed?.prompt_categories;
    delete transformed?.prompt_tags;

    return { data: transformed, error: null };
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return { data: null, error };
  }
}

/**
 * Get prompts by category slug
 * @param {string} categorySlug
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{data: Prompt[], count: number, error: Error|null}>}
 */
export async function getPromptsByCategory(categorySlug, page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;

    // First get category ID
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (catError) throw catError;

    // Then get prompts
    const { data, count, error } = await supabase
      .from('prompts')
      .select(`
        *,
        prompt_categories!inner(category_id)
      `, { count: 'exact' })
      .eq('prompt_categories.category_id', category.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching prompts by category:', error);
    return { data: [], count: 0, error };
  }
}

/**
 * Get prompts by tag slug
 * @param {string} tagSlug
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{data: Prompt[], count: number, error: Error|null}>}
 */
export async function getPromptsByTag(tagSlug, page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;

    // First get tag ID
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug)
      .single();

    if (tagError) throw tagError;

    // Then get prompts
    const { data, count, error } = await supabase
      .from('prompts')
      .select(`
        *,
        prompt_tags!inner(tag_id)
      `, { count: 'exact' })
      .eq('prompt_tags.tag_id', tag.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching prompts by tag:', error);
    return { data: [], count: 0, error };
  }
}

/**
 * Get total prompts count
 * @returns {Promise<number>}
 */
export async function getPromptsCount() {
  const { count } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

/**
 * Track prompt usage
 * @param {string} promptId
 * @param {string} [userId]
 * @param {string} [aiModel]
 */
export async function trackPromptUsage(promptId, userId = null, aiModel = null) {
  try {
    // Update times_used and last_used_at
    await supabase
      .from('prompts')
      .update({
        times_used: supabase.sql`times_used + 1`,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', promptId);

    // Insert usage tracking record
    if (userId) {
      await supabase.from('usage_tracking').insert({
        prompt_id: promptId,
        user_id: userId,
        ai_model: aiModel,
        used_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error tracking usage:', error);
  }
}

// ============================================
// CATEGORIES QUERIES
// ============================================

/**
 * Get all categories
 * @returns {Promise<{data: Category[], error: Error|null}>}
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { data: [], error };
  }
}

/**
 * Get category by slug
 * @param {string} slug
 * @returns {Promise<{data: Category|null, error: Error|null}>}
 */
export async function getCategoryBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching category:', error);
    return { data: null, error };
  }
}

// ============================================
// TAGS QUERIES
// ============================================

/**
 * Get all tags
 * @returns {Promise<{data: Tag[], error: Error|null}>}
 */
export async function getTags() {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { data: [], error };
  }
}

/**
 * Get popular tags (by usage count)
 * @param {number} limit
 * @returns {Promise<{data: Tag[], error: Error|null}>}
 */
export async function getPopularTags(limit = 20) {
  try {
    const { data, error } = await supabase
      .rpc('get_popular_tags', { limit_count: limit });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return { data: [], error };
  }
}

// ============================================
// USER QUERIES
// ============================================

/**
 * Get user's favorites
 * @param {string} userId
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{data: Prompt[], count: number, error: Error|null}>}
 */
export async function getUserFavorites(userId, page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('favorites')
      .select(`
        *,
        prompts(*)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const prompts = data?.map(fav => ({ ...fav.prompts, favoriteNotes: fav.notes })) || [];

    return { data: prompts, count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return { data: [], count: 0, error };
  }
}

/**
 * Add to favorites
 * @param {string} userId
 * @param {string} promptId
 * @param {string} [notes]
 */
export async function addToFavorites(userId, promptId, notes = '') {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, prompt_id: promptId, notes });
  return { error };
}

/**
 * Remove from favorites
 * @param {string} userId
 * @param {string} promptId
 */
export async function removeFromFavorites(userId, promptId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('prompt_id', promptId);
  return { error };
}

/**
 * Check if prompt is favorited
 * @param {string} userId
 * @param {string} promptId
 * @returns {Promise<boolean>}
 */
export async function isFavorited(userId, promptId) {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('prompt_id', promptId)
    .single();
  return !!data;
}

/**
 * Get user's tier information
 * @param {string} userId
 * @returns {Promise<{data: UserTier|null, error: Error|null}>}
 */
export async function getUserTier(userId) {
  try {
    const { data, error } = await supabase
      .from('user_tiers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { data: data || { tier: 'free', features_unlocked: {} }, error: null };
  } catch (error) {
    console.error('Error fetching user tier:', error);
    return { data: null, error };
  }
}

// ============================================
// AI PERSONAS QUERIES
// ============================================

/**
 * Get public personas
 * @param {Object} options
 * @param {string} [options.category]
 * @param {string} [options.search]
 * @param {string} [options.sortBy] - 'newest' | 'popular' | 'featured'
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @returns {Promise<{data: AIPersona[], count: number, error: Error|null}>}
 */
export async function getPublicPersonas({
  category = '',
  search = '',
  sortBy = 'newest',
  page = 1,
  limit = 20,
} = {}) {
  try {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('ai_personas')
      .select('*', { count: 'exact' })
      .eq('is_public', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    switch (sortBy) {
      case 'popular':
        query = query.order('use_count', { ascending: false });
        break;
      case 'featured':
        query = query.eq('is_featured', true).order('created_at', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching personas:', error);
    return { data: [], count: 0, error };
  }
}

/**
 * Get persona by ID
 * @param {string} id
 * @returns {Promise<{data: AIPersona|null, error: Error|null}>}
 */
export async function getPersonaById(id) {
  try {
    const { data, error } = await supabase
      .from('ai_personas')
      .select(`
        *,
        persona_prompts(
          prompts(id, name, prompt_text)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching persona:', error);
    return { data: null, error };
  }
}

/**
 * Get user's personas
 * @param {string} userId
 * @returns {Promise<{data: AIPersona[], error: Error|null}>}
 */
export async function getUserPersonas(userId) {
  try {
    const { data, error } = await supabase
      .from('ai_personas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching user personas:', error);
    return { data: [], error };
  }
}

// ============================================
// CHALLENGES QUERIES
// ============================================

/**
 * Get active challenges
 * @param {string} [type] - 'daily' | 'weekly' | 'monthly'
 * @returns {Promise<{data: Challenge[], error: Error|null}>}
 */
export async function getActiveChallenges(type = '') {
  try {
    let query = supabase
      .from('challenges')
      .select('*')
      .eq('status', 'active')
      .gte('ends_at', new Date().toISOString())
      .order('starts_at', { ascending: true });

    if (type) {
      query = query.eq('challenge_type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return { data: [], error };
  }
}

/**
 * Get challenge by ID with submissions
 * @param {string} id
 * @returns {Promise<{data: Challenge|null, error: Error|null}>}
 */
export async function getChallengeById(id) {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        categories(name, slug),
        challenge_submissions(
          id,
          user_id,
          prompt_text,
          ai_output,
          score,
          votes,
          rank,
          submitted_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return { data: null, error };
  }
}

// ============================================
// COURSES QUERIES
// ============================================

/**
 * Get published courses
 * @param {Object} options
 * @param {boolean} [options.premiumOnly]
 * @param {string} [options.difficulty]
 * @returns {Promise<{data: Course[], error: Error|null}>}
 */
export async function getCourses({ premiumOnly = false, difficulty = '' } = {}) {
  try {
    let query = supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (premiumOnly) {
      query = query.eq('is_premium', true);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { data: [], error };
  }
}

/**
 * Get course by slug with lessons
 * @param {string} slug
 * @returns {Promise<{data: Course|null, error: Error|null}>}
 */
export async function getCourseBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons(
          id,
          title,
          slug,
          description,
          video_duration,
          is_free_preview,
          sort_order
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;

    // Sort lessons by sort_order
    if (data?.lessons) {
      data.lessons.sort((a, b) => a.sort_order - b.sort_order);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching course:', error);
    return { data: null, error };
  }
}

// ============================================
// PROMPT CHAINS QUERIES
// ============================================

/**
 * Get public chains
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{data: PromptChain[], count: number, error: Error|null}>}
 */
export async function getPublicChains(page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('prompt_chains')
      .select('*', { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching chains:', error);
    return { data: [], count: 0, error };
  }
}

/**
 * Get chain by ID with steps
 * @param {string} id
 * @returns {Promise<{data: PromptChain|null, error: Error|null}>}
 */
export async function getChainById(id) {
  try {
    const { data, error } = await supabase
      .from('prompt_chains')
      .select(`
        *,
        chain_steps(
          *,
          prompts(id, name, prompt_text)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Sort steps by order
    if (data?.chain_steps) {
      data.chain_steps.sort((a, b) => a.step_order - b.step_order);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching chain:', error);
    return { data: null, error };
  }
}

export default {
  // Prompts
  searchPrompts,
  fullTextSearch,
  getPromptById,
  getPromptsByCategory,
  getPromptsByTag,
  getPromptsCount,
  trackPromptUsage,
  // Categories
  getCategories,
  getCategoryBySlug,
  // Tags
  getTags,
  getPopularTags,
  // User
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorited,
  getUserTier,
  // Personas
  getPublicPersonas,
  getPersonaById,
  getUserPersonas,
  // Challenges
  getActiveChallenges,
  getChallengeById,
  // Courses
  getCourses,
  getCourseBySlug,
  // Chains
  getPublicChains,
  getChainById,
};
