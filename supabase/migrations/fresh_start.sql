-- ================================================================
-- FRESH START - Drop everything and recreate from scratch
-- WARNING: This will delete ALL data in these tables!
-- Only use this if you're starting fresh with no data to preserve
-- ================================================================

-- Drop all tables in correct order (reverse of foreign key dependencies)
DROP TABLE IF EXISTS migration_log CASCADE;
DROP TABLE IF EXISTS usage_tracking CASCADE;
DROP TABLE IF EXISTS prompt_history CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS prompt_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS prompt_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;

-- Drop views
DROP VIEW IF EXISTS popular_prompts CASCADE;
DROP VIEW IF EXISTS prompts_with_categories CASCADE;
DROP VIEW IF EXISTS recent_activity CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_prompt_version() CASCADE;
DROP FUNCTION IF EXISTS increment_prompt_usage() CASCADE;
DROP FUNCTION IF EXISTS update_collection_count() CASCADE;
DROP FUNCTION IF EXISTS search_prompts(TEXT, UUID) CASCADE;

-- Confirm everything is dropped
SELECT 'All tables, views, and functions dropped. Ready for fresh install.' AS status;
SELECT 'Now run supabase_schema.sql to recreate everything.' AS next_step;
