-- Create the prompts table
CREATE TABLE prompts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create full-text search index
CREATE INDEX prompts_content_fts ON prompts USING GIN (to_tsvector('english', content));

-- Create additional indexes for common queries
CREATE INDEX prompts_category_idx ON prompts (category);
CREATE INDEX prompts_tags_idx ON prompts USING GIN (tags);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON prompts
  FOR SELECT
  USING (true);
