import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// ============================================
// SUPABASE CLIENT CONFIGURATION
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-side client (for API routes, server components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Client-side client factory (for client components)
export function createBrowserClient() {
  return createClientComponentClient();
}

// ============================================
// DATABASE TYPES (for TypeScript users)
// ============================================

/**
 * @typedef {Object} Prompt
 * @property {string} id
 * @property {string} name
 * @property {string} prompt_text
 * @property {string} [prompt_type]
 * @property {string} [ai_model]
 * @property {string} [use_case]
 * @property {string} [source]
 * @property {string} [source_page_url]
 * @property {string} [status]
 * @property {number} [priority]
 * @property {number} [rating]
 * @property {boolean} [tried]
 * @property {string} [notes]
 * @property {number} [times_used]
 * @property {string} [last_used_at]
 * @property {string} [user_id]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [parent_id]
 * @property {string} [description]
 * @property {number} [sort_order]
 * @property {string} [icon]
 * @property {string} [color]
 */

/**
 * @typedef {Object} Tag
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [user_id]
 */

/**
 * @typedef {Object} Collection
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [source_url]
 * @property {string} [notion_page_id]
 * @property {number} [total_prompts]
 * @property {string} [migrated_date]
 * @property {string} [user_id]
 */

/**
 * @typedef {Object} AIPersona
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string} slug
 * @property {string} [description]
 * @property {string} [avatar_url]
 * @property {string} system_prompt
 * @property {string} [welcome_message]
 * @property {Object} [personality_traits]
 * @property {Object} [model_preferences]
 * @property {boolean} is_public
 * @property {boolean} is_featured
 * @property {number} fork_count
 * @property {number} use_count
 * @property {string} [forked_from]
 * @property {string} [category]
 * @property {string[]} [tags]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Challenge
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {string} description
 * @property {string} [thumbnail_url]
 * @property {'daily'|'weekly'|'monthly'} challenge_type
 * @property {string} starts_at
 * @property {string} ends_at
 * @property {string} [category_id]
 * @property {'beginner'|'intermediate'|'advanced'} difficulty
 * @property {Object} [rules]
 * @property {Object} [prizes]
 * @property {'draft'|'active'|'completed'|'cancelled'} status
 * @property {boolean} is_featured
 * @property {number} submission_count
 * @property {string} [created_by]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {string} description
 * @property {string} [short_description]
 * @property {string} [thumbnail_url]
 * @property {'beginner'|'intermediate'|'advanced'} difficulty
 * @property {number} [estimated_hours]
 * @property {number} lesson_count
 * @property {boolean} is_premium
 * @property {number} [price]
 * @property {'draft'|'published'|'archived'} status
 * @property {boolean} is_featured
 * @property {number} enrollment_count
 * @property {string[]} [prerequisites]
 * @property {string[]} [learning_outcomes]
 * @property {string[]} [tags]
 * @property {string} [created_by]
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} [published_at]
 */

/**
 * @typedef {Object} PromptChain
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string} slug
 * @property {string} [description]
 * @property {string} [thumbnail_url]
 * @property {string} [category]
 * @property {string[]} [tags]
 * @property {boolean} is_public
 * @property {boolean} is_featured
 * @property {number} fork_count
 * @property {number} use_count
 * @property {string} [forked_from]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} UserTier
 * @property {string} user_id
 * @property {'free'|'pro'|'lifetime'} tier
 * @property {Object} features_unlocked
 * @property {string} [upgraded_at]
 * @property {string} created_at
 */

export default supabase;
