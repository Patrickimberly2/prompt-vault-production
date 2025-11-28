-- ============================================
-- PromptVault 2.0 Expanded Database Schema
-- Generated: November 27, 2025
-- ============================================
-- This schema extends the existing 10 tables with new tables
-- for Bot Builder, Challenges, Education, Prompt Chains, and Monetization
-- 
-- IMPORTANT: Run this AFTER your existing schema is in place.
-- This script only adds NEW tables and does not modify existing ones.
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- ============================================
-- BOT BUILDER TABLES
-- ============================================

-- AI Personas: User-created AI character templates
CREATE TABLE IF NOT EXISTS public.ai_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    avatar_url TEXT,
    
    -- AI Configuration
    system_prompt TEXT NOT NULL,
    welcome_message TEXT,
    personality_traits JSONB DEFAULT '[]'::jsonb,  -- ["friendly", "professional", "creative"]
    model_preferences JSONB DEFAULT '{}'::jsonb,   -- {"temperature": 0.7, "preferred_model": "gpt-4"}
    
    -- Attached Prompts (many-to-many handled by junction table)
    
    -- Sharing & Discovery
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    fork_count INTEGER DEFAULT 0,
    use_count INTEGER DEFAULT 0,
    forked_from UUID REFERENCES public.ai_personas(id) ON DELETE SET NULL,
    
    -- Metadata
    category TEXT,  -- "writing", "coding", "business", "creative", "roleplay", "education"
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table: Personas ↔ Prompts
CREATE TABLE IF NOT EXISTS public.persona_prompts (
    persona_id UUID NOT NULL REFERENCES public.ai_personas(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    usage_context TEXT,  -- "default", "greeting", "followup", etc.
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (persona_id, prompt_id)
);

-- Agent Workflows: Multi-step automated workflows
CREATE TABLE IF NOT EXISTS public.agent_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    persona_id UUID REFERENCES public.ai_personas(id) ON DELETE SET NULL,
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    
    -- Workflow Configuration
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    /*
    steps format:
    [
        {
            "id": "step_1",
            "type": "system_prompt" | "user_input" | "conditional" | "output",
            "content": "...",
            "variables": ["{{previous_output}}", "{{user_input}}"],
            "next": "step_2" | {"condition": "...", "true": "step_2", "false": "step_3"}
        }
    ]
    */
    triggers JSONB DEFAULT '{}'::jsonb,  -- {"type": "manual" | "scheduled" | "webhook", "config": {...}}
    variables JSONB DEFAULT '{}'::jsonb,  -- User-defined variables
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Execution History
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.agent_workflows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Execution Data
    input_data JSONB,
    output_data JSONB,
    step_results JSONB,  -- Array of results per step
    status VARCHAR(20) DEFAULT 'pending',  -- pending, running, completed, failed
    error_message TEXT,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- CHALLENGES TABLES
-- ============================================

-- Challenges: Daily/Weekly/Monthly prompt challenges
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Challenge Type & Timing
    challenge_type VARCHAR(20) NOT NULL DEFAULT 'daily',  -- daily, weekly, monthly, special
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Configuration
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    difficulty VARCHAR(20) DEFAULT 'intermediate',  -- beginner, intermediate, advanced
    rules JSONB DEFAULT '{}'::jsonb,
    /*
    rules format:
    {
        "max_prompt_length": 500,
        "required_elements": ["specific output format"],
        "ai_models_allowed": ["any"] | ["gpt-4", "claude"],
        "evaluation_criteria": ["creativity", "effectiveness", "clarity"]
    }
    */
    prizes JSONB DEFAULT '[]'::jsonb,  -- [{"place": 1, "reward": "Featured badge"}, ...]
    
    -- Status
    status VARCHAR(20) DEFAULT 'upcoming',  -- upcoming, active, voting, completed, cancelled
    is_featured BOOLEAN DEFAULT false,
    submission_count INTEGER DEFAULT 0,
    
    -- Admin
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge Submissions
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Submission Content
    prompt_text TEXT NOT NULL,
    ai_output TEXT,
    ai_model_used VARCHAR(50),
    explanation TEXT,  -- User's explanation of their approach
    
    -- Scoring
    score DECIMAL(5,2) DEFAULT 0,
    votes INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- Feedback from judges/community
    feedback JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, featured, winner, disqualified
    is_winner BOOLEAN DEFAULT false,
    rank INTEGER,
    
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One submission per user per challenge
    UNIQUE(challenge_id, user_id)
);

-- Submission Votes
CREATE TABLE IF NOT EXISTS public.submission_votes (
    submission_id UUID NOT NULL REFERENCES public.challenge_submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL,  -- 'up' or 'down'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (submission_id, user_id)
);

-- User Badges (earned from challenges and achievements)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,  -- "first_submission", "10_wins", "streak_7", etc.
    badge_name TEXT NOT NULL,
    badge_icon TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,  -- Additional context
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Streaks (for gamification)
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_challenges_completed INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EDUCATION TABLES
-- ============================================

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    thumbnail_url TEXT,
    
    -- Course Details
    difficulty VARCHAR(20) DEFAULT 'beginner',  -- beginner, intermediate, advanced
    estimated_hours DECIMAL(4,1),
    lesson_count INTEGER DEFAULT 0,
    
    -- Pricing
    is_premium BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0,  -- 0 for free courses
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',  -- draft, published, archived
    is_featured BOOLEAN DEFAULT false,
    enrollment_count INTEGER DEFAULT 0,
    
    -- Metadata
    prerequisites TEXT[],
    learning_outcomes TEXT[],
    tags TEXT[],
    
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    -- Basic Info
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Content
    content_mdx TEXT,  -- MDX content for rich formatting
    video_url TEXT,
    video_duration INTEGER,  -- Duration in seconds
    
    -- Resources
    resources JSONB DEFAULT '[]'::jsonb,  -- [{title, url, type}]
    related_prompts UUID[],  -- References to prompts table
    
    -- Structure
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_free_preview BOOLEAN DEFAULT false,
    
    -- Quiz
    has_quiz BOOLEAN DEFAULT false,
    quiz_questions JSONB DEFAULT '[]'::jsonb,
    /*
    quiz format:
    [
        {
            "question": "...",
            "type": "multiple_choice" | "true_false" | "free_text",
            "options": ["a", "b", "c"],
            "correct_answer": "a",
            "explanation": "..."
        }
    ]
    */
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(course_id, slug)
);

-- User Progress
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    
    -- Progress
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Quiz Results
    quiz_score DECIMAL(5,2),
    quiz_attempts INTEGER DEFAULT 0,
    quiz_answers JSONB,
    
    -- Time Tracking
    time_spent_seconds INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0,  -- Video position or scroll position
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, lesson_id)
);

-- Course Enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    -- Progress
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    
    -- Certification
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    certificate_url TEXT,
    
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, course_id)
);

-- Guides (standalone educational content)
CREATE TABLE IF NOT EXISTS public.guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    content_mdx TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Categorization
    category VARCHAR(50),  -- "basics", "advanced", "tips", "reference"
    tags TEXT[],
    
    -- Status
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- PROMPT CHAINS TABLES
-- ============================================

-- Prompt Chains: Multi-step prompt sequences
CREATE TABLE IF NOT EXISTS public.prompt_chains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    thumbnail_url TEXT,
    
    -- Chain Configuration
    category VARCHAR(50),
    tags TEXT[],
    
    -- Sharing
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    fork_count INTEGER DEFAULT 0,
    use_count INTEGER DEFAULT 0,
    forked_from UUID REFERENCES public.prompt_chains(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chain Steps
CREATE TABLE IF NOT EXISTS public.chain_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID NOT NULL REFERENCES public.prompt_chains(id) ON DELETE CASCADE,
    
    -- Step Reference (can be from library or custom)
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
    custom_prompt_text TEXT,  -- If not using a library prompt
    
    -- Step Configuration
    step_order INTEGER NOT NULL,
    step_name TEXT,
    instructions TEXT,  -- Additional context for this step
    
    -- Variables & Logic
    input_variables JSONB DEFAULT '[]'::jsonb,  -- ["{{user_input}}", "{{step_1_output}}"]
    output_variable TEXT,  -- Name for this step's output
    transition_logic JSONB DEFAULT '{}'::jsonb,
    /*
    transition_logic format:
    {
        "type": "always" | "conditional",
        "condition": "output.includes('error')",
        "on_true": "step_error",
        "on_false": "step_3"
    }
    */
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(chain_id, step_order)
);

-- Chain Executions (saved runs)
CREATE TABLE IF NOT EXISTS public.chain_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID NOT NULL REFERENCES public.prompt_chains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Execution State
    current_step INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    
    -- Results
    step_outputs JSONB DEFAULT '[]'::jsonb,
    /*
    step_outputs format:
    [
        {"step_order": 1, "prompt_used": "...", "output": "...", "completed_at": "..."},
        ...
    ]
    */
    final_output TEXT,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- MONETIZATION TABLES
-- ============================================

-- User Tiers
CREATE TABLE IF NOT EXISTS public.user_tiers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tier Info
    tier VARCHAR(20) NOT NULL DEFAULT 'free',  -- free, pro, lifetime
    
    -- Feature Limits
    features_unlocked JSONB DEFAULT '{}'::jsonb,
    /*
    features_unlocked format:
    {
        "unlimited_favorites": true,
        "unlimited_collections": true,
        "max_personas": 10,
        "max_chains": 5,
        "max_workflows": 3,
        "export_enabled": true,
        "api_access": false,
        "premium_courses": false
    }
    */
    
    upgraded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Product Info
    product_type VARCHAR(50) NOT NULL,  -- 'tier_upgrade', 'course', 'bundle'
    product_id TEXT,  -- Reference to the purchased item
    product_name TEXT,
    
    -- Payment Info
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- pending, completed, failed, refunded
    
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    refunded_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- AI Personas
CREATE INDEX IF NOT EXISTS idx_personas_user ON public.ai_personas(user_id);
CREATE INDEX IF NOT EXISTS idx_personas_public ON public.ai_personas(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_personas_category ON public.ai_personas(category);
CREATE INDEX IF NOT EXISTS idx_personas_search ON public.ai_personas USING GIN (name gin_trgm_ops);

-- Challenges
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON public.challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON public.challenges(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON public.challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.challenge_submissions(user_id);

-- Courses & Lessons
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.course_enrollments(user_id);

-- Prompt Chains
CREATE INDEX IF NOT EXISTS idx_chains_user ON public.prompt_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_chains_public ON public.prompt_chains(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_chain_steps_chain ON public.chain_steps(chain_id, step_order);

-- Purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe ON public.purchases(stripe_payment_intent_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE public.ai_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chain_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chain_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- AI Personas: Users can see public + their own
CREATE POLICY "Personas viewable by public or owner" ON public.ai_personas
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own personas" ON public.ai_personas
    FOR ALL USING (auth.uid() = user_id);

-- Challenges: Everyone can view active challenges
CREATE POLICY "Active challenges viewable by all" ON public.challenges
    FOR SELECT USING (status IN ('active', 'voting', 'completed'));

-- Challenge Submissions: Public viewing, own management
CREATE POLICY "Submissions viewable by all" ON public.challenge_submissions
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own submissions" ON public.challenge_submissions
    FOR ALL USING (auth.uid() = user_id);

-- Courses: Published courses viewable by all
CREATE POLICY "Published courses viewable by all" ON public.courses
    FOR SELECT USING (status = 'published');

-- Lessons: Check course access
CREATE POLICY "Lessons viewable if course published" ON public.lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = lessons.course_id 
            AND courses.status = 'published'
        )
    );

-- User Progress: Only own progress
CREATE POLICY "Users can manage own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- Prompt Chains: Public + own
CREATE POLICY "Chains viewable by public or owner" ON public.prompt_chains
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own chains" ON public.prompt_chains
    FOR ALL USING (auth.uid() = user_id);

-- User Tiers & Purchases: Only own
CREATE POLICY "Users can view own tier" ON public.user_tiers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own purchases" ON public.purchases
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_ai_personas_updated_at BEFORE UPDATE ON public.ai_personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_workflows_updated_at BEFORE UPDATE ON public.agent_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_submissions_updated_at BEFORE UPDATE ON public.challenge_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_chains_updated_at BEFORE UPDATE ON public.prompt_chains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user tier on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_tiers (user_id, tier, features_unlocked)
    VALUES (
        NEW.id,
        'free',
        '{
            "unlimited_favorites": false,
            "unlimited_collections": false,
            "max_personas": 1,
            "max_chains": 1,
            "max_workflows": 0,
            "export_enabled": false,
            "api_access": false,
            "premium_courses": false
        }'::jsonb
    );
    
    INSERT INTO public.user_streaks (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update submission vote counts
CREATE OR REPLACE FUNCTION update_submission_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.challenge_submissions
        SET 
            votes = votes + 1,
            upvotes = CASE WHEN NEW.vote_type = 'up' THEN upvotes + 1 ELSE upvotes END,
            downvotes = CASE WHEN NEW.vote_type = 'down' THEN downvotes + 1 ELSE downvotes END
        WHERE id = NEW.submission_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.challenge_submissions
        SET 
            votes = votes - 1,
            upvotes = CASE WHEN OLD.vote_type = 'up' THEN upvotes - 1 ELSE upvotes END,
            downvotes = CASE WHEN OLD.vote_type = 'down' THEN downvotes - 1 ELSE downvotes END
        WHERE id = OLD.submission_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_submission_vote_counts
    AFTER INSERT OR DELETE ON public.submission_votes
    FOR EACH ROW EXECUTE FUNCTION update_submission_votes();

-- ============================================
-- SEED DATA: Default Free Tier Features
-- ============================================

-- Note: This would be applied per-user via the trigger above

-- ============================================
-- FULL-TEXT SEARCH ENHANCEMENT FOR EXISTING PROMPTS TABLE
-- ============================================
-- Run this if you haven't already set up full-text search

-- Add search vector column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prompts' AND column_name = 'search_vector'
    ) THEN
        ALTER TABLE public.prompts ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION prompts_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.prompt_text, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector
DROP TRIGGER IF EXISTS prompts_search_update ON public.prompts;
CREATE TRIGGER prompts_search_update
    BEFORE INSERT OR UPDATE OF name, prompt_text, notes ON public.prompts
    FOR EACH ROW EXECUTE FUNCTION prompts_search_vector_update();

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_prompts_search ON public.prompts USING GIN (search_vector);

-- Update existing rows (run once)
-- UPDATE public.prompts SET search_vector = 
--     setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
--     setweight(to_tsvector('english', COALESCE(prompt_text, '')), 'B') ||
--     setweight(to_tsvector('english', COALESCE(notes, '')), 'C');

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View: Public personas with stats
CREATE OR REPLACE VIEW public.public_personas_with_stats AS
SELECT 
    p.*,
    u.raw_user_meta_data->>'full_name' as creator_name,
    (SELECT COUNT(*) FROM public.persona_prompts WHERE persona_id = p.id) as prompt_count
FROM public.ai_personas p
JOIN auth.users u ON p.user_id = u.id
WHERE p.is_public = true;

-- View: Active challenges
CREATE OR REPLACE VIEW public.active_challenges AS
SELECT 
    c.*,
    cat.name as category_name,
    (SELECT COUNT(*) FROM public.challenge_submissions WHERE challenge_id = c.id) as submission_count
FROM public.challenges c
LEFT JOIN public.categories cat ON c.category_id = cat.id
WHERE c.status = 'active' AND c.ends_at > NOW();

-- View: Course progress summary
CREATE OR REPLACE VIEW public.user_course_progress AS
SELECT 
    ce.user_id,
    ce.course_id,
    c.title as course_title,
    c.lesson_count as total_lessons,
    ce.lessons_completed,
    ce.progress_percentage,
    ce.is_completed,
    ce.enrolled_at,
    ce.last_accessed_at
FROM public.course_enrollments ce
JOIN public.courses c ON ce.course_id = c.id;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.ai_personas IS 'User-created AI character templates with system prompts and personalities';
COMMENT ON TABLE public.agent_workflows IS 'Multi-step automated workflows for advanced users';
COMMENT ON TABLE public.challenges IS 'Daily/weekly/monthly prompt challenges for community engagement';
COMMENT ON TABLE public.challenge_submissions IS 'User submissions for challenges with voting';
COMMENT ON TABLE public.courses IS 'Structured educational courses with lessons';
COMMENT ON TABLE public.lessons IS 'Individual lessons within courses';
COMMENT ON TABLE public.prompt_chains IS 'Multi-step prompt sequences';
COMMENT ON TABLE public.user_tiers IS 'User subscription/purchase tiers and feature access';
COMMENT ON TABLE public.purchases IS 'One-time purchase records for monetization';

-- ============================================
-- END OF SCHEMA EXPANSION
-- ============================================
