-- Run this in Supabase SQL Editor to see your current prompts table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'prompts'
ORDER BY ordinal_position;

-- Also check existing indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'prompts';
