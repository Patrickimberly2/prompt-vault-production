-- Migration script to add missing columns to existing prompts table
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add prompt_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'prompt_type') THEN
        ALTER TABLE prompts ADD COLUMN prompt_type VARCHAR(50);
        COMMENT ON COLUMN prompts.prompt_type IS 'question-based, fill-in-blank, template, script, javascript';
    END IF;

    -- Add ai_model if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'ai_model') THEN
        ALTER TABLE prompts ADD COLUMN ai_model VARCHAR(50);
        COMMENT ON COLUMN prompts.ai_model IS 'ChatGPT, Claude, Midjourney, DALL-E, Gemini, Universal';
    END IF;

    -- Add use_case if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'use_case') THEN
        ALTER TABLE prompts ADD COLUMN use_case VARCHAR(50);
        COMMENT ON COLUMN prompts.use_case IS 'Business, Creative, Learning, Technical, Personal, Marketing, Writing';
    END IF;

    -- Add source if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'source') THEN
        ALTER TABLE prompts ADD COLUMN source TEXT;
    END IF;

    -- Add source_page_url if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'source_page_url') THEN
        ALTER TABLE prompts ADD COLUMN source_page_url TEXT;
    END IF;

    -- Add priority if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'priority') THEN
        ALTER TABLE prompts ADD COLUMN priority VARCHAR(20);
        COMMENT ON COLUMN prompts.priority IS 'high, medium, low';
    END IF;

    -- Add rating if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'rating') THEN
        ALTER TABLE prompts ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
    END IF;

    -- Add tried if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'tried') THEN
        ALTER TABLE prompts ADD COLUMN tried BOOLEAN DEFAULT false;
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'notes') THEN
        ALTER TABLE prompts ADD COLUMN notes TEXT;
    END IF;

    -- Add migrated_date if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'migrated_date') THEN
        ALTER TABLE prompts ADD COLUMN migrated_date TIMESTAMP DEFAULT NOW();
    END IF;

    -- Add times_used if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'times_used') THEN
        ALTER TABLE prompts ADD COLUMN times_used INTEGER DEFAULT 0;
    END IF;

    -- Add last_used_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'last_used_at') THEN
        ALTER TABLE prompts ADD COLUMN last_used_at TIMESTAMP;
    END IF;

    -- Ensure updated_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'updated_at') THEN
        ALTER TABLE prompts ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON prompts;

-- Create the trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_prompts_ai_model ON prompts(ai_model);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_source ON prompts(source);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_times_used ON prompts(times_used DESC);

-- Create full-text search indexes with pg_trgm for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_prompts_name_trgm ON prompts USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prompts_text_trgm ON prompts USING GIN(prompt_text gin_trgm_ops);

-- Create full-text search indexes with tsvector for keyword matching
CREATE INDEX IF NOT EXISTS idx_prompts_name_fts ON prompts USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_prompts_text_fts ON prompts USING GIN(to_tsvector('english', prompt_text));

-- Display current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'prompts'
ORDER BY ordinal_position;

-- Display summary
SELECT 'Migration complete! Check the table structure above.' as status;
