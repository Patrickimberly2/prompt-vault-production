-- ================================================================
-- PROMPTVAULT DATABASE SCHEMA FOR SUPABASE
-- Complete schema with RLS policies, triggers, and helper functions
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================================
-- CORE TABLES
-- ================================================================

-- 1. PROMPTS TABLE (Main table for all prompts)
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    prompt_type VARCHAR(50), -- 'question-based', 'fill-in-blank', 'template', 'script', 'javascript'
    ai_model VARCHAR(50), -- 'ChatGPT', 'Claude', 'Midjourney', 'DALL-E', 'Gemini', 'Universal'
    use_case VARCHAR(50), -- 'Business', 'Creative', 'Learning', 'Technical', 'Personal', 'Marketing', 'Writing'
    source TEXT, -- 'Ultimate ChatGPT Bible 2.0', 'AI Ultimate Collection', etc.
    source_page_url TEXT, -- Original Notion page URL
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'draft', 'archived', 'favorite'
    priority VARCHAR(20), -- 'high', 'medium', 'low'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    tried BOOLEAN DEFAULT false,
    notes TEXT,
    times_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    migrated_date TIMESTAMP DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_prompts_user ON prompts(user_id);
CREATE INDEX idx_prompts_ai_model ON prompts(ai_model);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_prompts_source ON prompts(source);
CREATE INDEX idx_prompts_name_trgm ON prompts USING GIN(name gin_trgm_ops);
CREATE INDEX idx_prompts_text_trgm ON prompts USING GIN(prompt_text gin_trgm_ops);
CREATE INDEX idx_prompts_name_fts ON prompts USING GIN(to_tsvector('english', name));
CREATE INDEX idx_prompts_text_fts ON prompts USING GIN(to_tsvector('english', prompt_text));
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_times_used ON prompts(times_used DESC);

-- 2. CATEGORIES TABLE (Hierarchical categories)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    icon TEXT, -- emoji or icon identifier
    color TEXT, -- for UI display
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- 3. PROMPT_CATEGORIES (Many-to-many junction)
CREATE TABLE prompt_categories (
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (prompt_id, category_id)
);

CREATE INDEX idx_prompt_categories_prompt ON prompt_categories(prompt_id);
CREATE INDEX idx_prompt_categories_category ON prompt_categories(category_id);

-- 4. TAGS TABLE (Flexible tagging system)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tags_user ON tags(user_id);
CREATE INDEX idx_tags_slug ON tags(slug);

CREATE TABLE prompt_tags (
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (prompt_id, tag_id)
);

CREATE INDEX idx_prompt_tags_prompt ON prompt_tags(prompt_id);
CREATE INDEX idx_prompt_tags_tag ON prompt_tags(tag_id);

-- 5. COLLECTIONS TABLE (Source tracking)
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    source_url TEXT,
    notion_page_id TEXT,
    total_prompts INTEGER DEFAULT 0,
    migrated_date TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_notion_page ON collections(notion_page_id);

-- 6. FAVORITES TABLE (User bookmarks)
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(prompt_id, user_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_prompt ON favorites(prompt_id);
CREATE INDEX idx_favorites_created ON favorites(created_at DESC);

-- 7. PROMPT_HISTORY (Version tracking)
CREATE TABLE prompt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    change_type VARCHAR(20), -- 'created', 'updated', 'restored'
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompt_history_prompt ON prompt_history(prompt_id);
CREATE INDEX idx_prompt_history_created ON prompt_history(created_at DESC);
CREATE INDEX idx_prompt_history_version ON prompt_history(prompt_id, version_number);

-- 8. USAGE_TRACKING (Track when prompts are used)
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ai_model VARCHAR(50),
    success BOOLEAN,
    feedback TEXT,
    used_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_tracking_prompt ON usage_tracking(prompt_id);
CREATE INDEX idx_usage_tracking_user ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_used_at ON usage_tracking(used_at DESC);

-- 9. MIGRATION_LOG (Track migration progress)
CREATE TABLE migration_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_name TEXT NOT NULL,
    notion_page_id TEXT,
    notion_page_url TEXT,
    prompts_extracted INTEGER DEFAULT 0,
    prompts_inserted INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_migration_log_status ON migration_log(status);
CREATE INDEX idx_migration_log_collection ON migration_log(collection_name);

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create version history on prompt updates
CREATE OR REPLACE FUNCTION create_prompt_version()
RETURNS TRIGGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO next_version
    FROM prompt_history 
    WHERE prompt_id = NEW.id;

    -- Insert version history
    INSERT INTO prompt_history (
        prompt_id, 
        name, 
        prompt_text, 
        changed_by, 
        change_type,
        version_number
    ) VALUES (
        NEW.id, 
        NEW.name, 
        NEW.prompt_text, 
        NEW.user_id, 
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'created'
            ELSE 'updated'
        END,
        next_version
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_prompt_version_trigger
    AFTER INSERT OR UPDATE OF name, prompt_text ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION create_prompt_version();

-- Increment usage counter when prompt is used
CREATE OR REPLACE FUNCTION increment_prompt_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE prompts 
    SET times_used = times_used + 1,
        last_used_at = NOW()
    WHERE id = NEW.prompt_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_prompt_usage_trigger
    AFTER INSERT ON usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION increment_prompt_usage();

-- Update collection total_prompts count
CREATE OR REPLACE FUNCTION update_collection_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE collections 
        SET total_prompts = total_prompts + 1
        WHERE name = NEW.source;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE collections 
        SET total_prompts = total_prompts - 1
        WHERE name = OLD.source;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collection_count_trigger
    AFTER INSERT OR DELETE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_collection_count();

-- Full-text search function
CREATE OR REPLACE FUNCTION search_prompts(
    search_query TEXT,
    user_uuid UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    prompt_text TEXT,
    ai_model VARCHAR(50),
    status VARCHAR(20),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.prompt_text,
        p.ai_model,
        p.status,
        ts_rank(
            to_tsvector('english', p.name || ' ' || COALESCE(p.prompt_text, '')),
            plainto_tsquery('english', search_query)
        ) AS rank
    FROM prompts p
    WHERE 
        (user_uuid IS NULL OR p.user_id = user_uuid)
        AND to_tsvector('english', p.name || ' ' || COALESCE(p.prompt_text, '')) 
            @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- PROMPTS POLICIES
CREATE POLICY "Users can view their own prompts"
    ON prompts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompts"
    ON prompts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
    ON prompts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
    ON prompts FOR DELETE
    USING (auth.uid() = user_id);

-- CATEGORIES POLICIES (Public read, authenticated write)
CREATE POLICY "Anyone can view categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert categories"
    ON categories FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories"
    ON categories FOR UPDATE
    USING (auth.role() = 'authenticated');

-- PROMPT_CATEGORIES POLICIES
CREATE POLICY "Users can view their prompt categories"
    ON prompt_categories FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM prompts 
            WHERE prompts.id = prompt_categories.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their prompt categories"
    ON prompt_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM prompts 
            WHERE prompts.id = prompt_categories.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

-- TAGS POLICIES
CREATE POLICY "Users can view their own tags"
    ON tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
    ON tags FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
    ON tags FOR DELETE
    USING (auth.uid() = user_id);

-- PROMPT_TAGS POLICIES
CREATE POLICY "Users can view their prompt tags"
    ON prompt_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM prompts 
            WHERE prompts.id = prompt_tags.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their prompt tags"
    ON prompt_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM prompts 
            WHERE prompts.id = prompt_tags.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

-- COLLECTIONS POLICIES
CREATE POLICY "Users can view their own collections"
    ON collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id);

-- FAVORITES POLICIES
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- PROMPT_HISTORY POLICIES
CREATE POLICY "Users can view their prompt history"
    ON prompt_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM prompts 
            WHERE prompts.id = prompt_history.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

-- USAGE_TRACKING POLICIES
CREATE POLICY "Users can view their own usage tracking"
    ON usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage tracking"
    ON usage_tracking FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- SEED DATA - CATEGORIES FROM ULTIMATE CHATGPT BIBLE 2.0
-- ================================================================

INSERT INTO categories (name, slug, description, sort_order, icon, color) VALUES
    ('Content Marketing', 'content-marketing', 'Content strategy, blogging, and content creation prompts', 1, '📝', 'blue'),
    ('Social Media', 'social-media', 'Platform-specific social media optimization prompts', 2, '📱', 'purple'),
    ('Email Marketing', 'email-marketing', 'Email campaigns and automation prompts', 3, '📧', 'green'),
    ('Social Media Management', 'social-media-management', 'Social media strategy and analytics prompts', 4, '📊', 'orange'),
    ('Copywriting', 'copywriting', 'Sales copy and persuasive writing prompts', 5, '✍️', 'red'),
    ('Conversion Rate Optimization', 'cro', 'Landing pages and conversion optimization prompts', 6, '📈', 'yellow'),
    ('Growth Hacking', 'growth-hacking', 'Viral marketing and growth tactics prompts', 7, '🚀', 'pink'),
    ('Budget-Friendly Marketing', 'budget-marketing', 'Low-cost marketing strategies prompts', 8, '💰', 'teal'),
    ('Customer Relationship Management', 'crm', 'Customer loyalty and retention prompts', 9, '🤝', 'indigo'),
    ('Financial Marketing', 'financial-marketing', 'Pricing and financial strategy prompts', 10, '💵', 'emerald'),
    ('Personal Branding', 'personal-branding', 'Personal brand development prompts', 11, '⭐', 'violet'),
    ('Operations Management', 'operations', 'Workflow and process optimization prompts', 12, '⚙️', 'slate'),
    ('Innovation & Product Development', 'innovation', 'Product development and testing prompts', 13, '💡', 'amber'),
    ('Writing', 'writing', 'Creative and technical writing prompts', 14, '📚', 'cyan'),
    ('Productivity & Virtual Assistance', 'productivity', 'Task management and organization prompts', 15, '✅', 'lime'),
    ('Consulting', 'consulting', 'Business consulting and strategy prompts', 16, '💼', 'fuchsia'),
    ('Human Resources', 'hr', 'HR and people management prompts', 17, '👥', 'rose'),
    ('Legal & Compliance', 'legal', 'Legal documentation and compliance prompts', 18, '⚖️', 'stone'),
    ('Creative Brainstorming', 'brainstorming', 'Ideation and creative thinking prompts', 19, '🎨', 'sky')
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- UTILITY VIEWS
-- ================================================================

-- View: Popular prompts (most used)
CREATE OR REPLACE VIEW popular_prompts AS
SELECT 
    p.id,
    p.name,
    p.prompt_text,
    p.ai_model,
    p.times_used,
    p.last_used_at,
    p.rating,
    COUNT(f.id) as favorite_count
FROM prompts p
LEFT JOIN favorites f ON p.id = f.prompt_id
GROUP BY p.id
ORDER BY p.times_used DESC, favorite_count DESC;

-- View: Prompts with categories
CREATE OR REPLACE VIEW prompts_with_categories AS
SELECT 
    p.id,
    p.name,
    p.prompt_text,
    p.ai_model,
    p.status,
    p.rating,
    p.times_used,
    p.created_at,
    ARRAY_AGG(DISTINCT c.name) as category_names,
    ARRAY_AGG(DISTINCT c.slug) as category_slugs
FROM prompts p
LEFT JOIN prompt_categories pc ON p.id = pc.prompt_id
LEFT JOIN categories c ON pc.category_id = c.id
GROUP BY p.id;

-- View: Recent activity
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
    'prompt_created' as activity_type,
    p.id as prompt_id,
    p.name as prompt_name,
    p.user_id,
    p.created_at as activity_at
FROM prompts p
UNION ALL
SELECT 
    'prompt_used' as activity_type,
    ut.prompt_id,
    p.name as prompt_name,
    ut.user_id,
    ut.used_at as activity_at
FROM usage_tracking ut
JOIN prompts p ON ut.prompt_id = p.id
UNION ALL
SELECT 
    'favorite_added' as activity_type,
    f.prompt_id,
    p.name as prompt_name,
    f.user_id,
    f.created_at as activity_at
FROM favorites f
JOIN prompts p ON f.prompt_id = p.id
ORDER BY activity_at DESC
LIMIT 100;

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE 'PromptVault schema created successfully!';
    RAISE NOTICE 'Tables: prompts, categories, tags, collections, favorites, prompt_history, usage_tracking';
    RAISE NOTICE 'RLS policies enabled on all user tables';
    RAISE NOTICE '19 main categories seeded from Ultimate ChatGPT Bible 2.0';
END $$;
