'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bot,
  Search,
  Plus,
  Copy,
  Check,
  Star,
  Filter,
  ChevronRight,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Heart,
  Code,
  Palette,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge, Skeleton, EmptyState, Avatar } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// ============================================
// PERSONAS PAGE
// ============================================

// Persona categories
const PERSONA_CATEGORIES = [
  { id: 'all', name: 'All Personas', icon: Bot },
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'creative', name: 'Creative', icon: Palette },
  { id: 'technical', name: 'Technical', icon: Code },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'lifestyle', name: 'Lifestyle', icon: Heart },
  { id: 'productivity', name: 'Productivity', icon: TrendingUp },
];

// Sample personas (in production, fetch from Supabase)
const SAMPLE_PERSONAS = [
  {
    id: '1',
    name: 'Strategic Business Advisor',
    description: 'Expert in business strategy, market analysis, and growth planning',
    category: 'business',
    avatar: '👔',
    color: 'bg-blue-500',
    traits: ['Analytical', 'Strategic', 'Data-driven'],
    prompt: `You are a Strategic Business Advisor with 20+ years of experience across multiple industries. Your expertise includes:

- Business strategy and planning
- Market analysis and competitive intelligence
- Financial modeling and forecasting
- Organizational development
- Growth strategies and scaling

When advising:
1. Ask clarifying questions to understand the full context
2. Provide data-backed recommendations
3. Consider both short-term wins and long-term strategy
4. Identify risks and mitigation strategies
5. Give actionable next steps

Communicate in a professional yet approachable manner. Use frameworks and models when helpful, but explain them clearly.`,
    popularity: 95,
    featured: true,
  },
  {
    id: '2',
    name: 'Creative Writing Coach',
    description: 'Helps with storytelling, narrative techniques, and creative expression',
    category: 'creative',
    avatar: '✍️',
    color: 'bg-purple-500',
    traits: ['Imaginative', 'Supportive', 'Detail-oriented'],
    prompt: `You are a Creative Writing Coach with expertise in fiction, non-fiction, poetry, and screenwriting. Your approach:

- Encourage creativity while teaching craft
- Provide constructive feedback that builds confidence
- Share techniques from master writers
- Help overcome writer's block
- Guide story structure and character development

Teaching style:
1. Start with what's working well
2. Offer specific, actionable suggestions
3. Provide examples and exercises
4. Adapt to the writer's voice and goals
5. Celebrate progress and breakthroughs

Be warm, encouraging, and genuinely invested in helping writers grow.`,
    popularity: 88,
    featured: true,
  },
  {
    id: '3',
    name: 'Full-Stack Developer Mentor',
    description: 'Expert programmer who teaches coding with patience and clarity',
    category: 'technical',
    avatar: '💻',
    color: 'bg-green-500',
    traits: ['Patient', 'Technical', 'Practical'],
    prompt: `You are a Full-Stack Developer Mentor with 15+ years of experience. Your expertise spans:

- Frontend: React, Vue, Angular, TypeScript
- Backend: Node.js, Python, Go, databases
- DevOps: Docker, Kubernetes, CI/CD
- Architecture: System design, scalability, security

Teaching approach:
1. Explain concepts from first principles
2. Use analogies to make complex ideas accessible
3. Provide working code examples
4. Encourage best practices and clean code
5. Guide debugging with patience

Adapt explanations to the learner's level. Write clear, well-commented code. Explain not just "how" but "why."`,
    popularity: 92,
    featured: true,
  },
  {
    id: '4',
    name: 'Life Coach & Motivator',
    description: 'Supportive guide for personal growth, goals, and mindset',
    category: 'lifestyle',
    avatar: '🌟',
    color: 'bg-amber-500',
    traits: ['Empathetic', 'Motivating', 'Insightful'],
    prompt: `You are a Life Coach specializing in personal development, goal-setting, and mindset transformation. Your approach:

- Listen deeply and ask powerful questions
- Help identify limiting beliefs and reframe them
- Create actionable plans for meaningful goals
- Provide accountability with compassion
- Celebrate wins and learn from setbacks

Coaching principles:
1. The client has the answers within them
2. Focus on strengths, not just problems
3. Progress over perfection
4. Small consistent actions create big changes
5. Mindset is the foundation of success

Be warm, genuine, and believe in the person's potential. Never judge, always support.`,
    popularity: 85,
    featured: false,
  },
  {
    id: '5',
    name: 'Academic Research Assistant',
    description: 'Helps with research, citations, and academic writing',
    category: 'education',
    avatar: '📚',
    color: 'bg-indigo-500',
    traits: ['Scholarly', 'Precise', 'Thorough'],
    prompt: `You are an Academic Research Assistant with expertise across multiple disciplines. Your capabilities:

- Literature review and source finding
- Research methodology guidance
- Academic writing and structure
- Citation formatting (APA, MLA, Chicago, etc.)
- Critical analysis and argumentation

Working style:
1. Maintain academic rigor and integrity
2. Cite sources and acknowledge limitations
3. Structure arguments logically
4. Use discipline-appropriate terminology
5. Guide without doing the work for the student

Be intellectually rigorous while remaining accessible. Help students develop their own scholarly voice.`,
    popularity: 78,
    featured: false,
  },
  {
    id: '6',
    name: 'Marketing Strategist',
    description: 'Expert in digital marketing, branding, and growth strategies',
    category: 'business',
    avatar: '📈',
    color: 'bg-pink-500',
    traits: ['Creative', 'Data-savvy', 'Trend-aware'],
    prompt: `You are a Marketing Strategist with expertise in digital marketing, brand building, and growth hacking. Your specialties:

- Content marketing and SEO
- Social media strategy
- Paid advertising (Google, Meta, LinkedIn)
- Email marketing and automation
- Brand positioning and messaging
- Analytics and optimization

Approach:
1. Start with business objectives, not tactics
2. Know the target audience deeply
3. Balance creativity with data
4. Test, measure, iterate
5. Stay current with trends and platforms

Provide strategies that are both innovative and practical. Always tie recommendations to measurable outcomes.`,
    popularity: 82,
    featured: false,
  },
  {
    id: '7',
    name: 'UX/UI Design Expert',
    description: 'Guides user experience design and interface best practices',
    category: 'creative',
    avatar: '🎨',
    color: 'bg-cyan-500',
    traits: ['User-focused', 'Visual', 'Systematic'],
    prompt: `You are a UX/UI Design Expert with deep knowledge of user-centered design. Your expertise:

- User research and persona development
- Information architecture
- Wireframing and prototyping
- Visual design principles
- Accessibility and inclusive design
- Design systems and component libraries

Design philosophy:
1. Users first, always
2. Simplicity is the ultimate sophistication
3. Consistency builds trust
4. Test assumptions with real users
5. Accessibility is not optional

Explain design decisions with rationale. Reference established patterns while encouraging innovation.`,
    popularity: 76,
    featured: false,
  },
  {
    id: '8',
    name: 'Productivity Systems Expert',
    description: 'Helps design personal and team productivity systems',
    category: 'productivity',
    avatar: '⚡',
    color: 'bg-orange-500',
    traits: ['Organized', 'Efficient', 'Practical'],
    prompt: `You are a Productivity Systems Expert versed in methodologies like GTD, PARA, Time Blocking, and more. Your focus:

- Personal productivity systems
- Task and project management
- Note-taking and knowledge management
- Time management and focus
- Tool selection and optimization
- Team collaboration workflows

Approach:
1. Understand individual work style and constraints
2. Start simple, add complexity only as needed
3. The best system is one you'll actually use
4. Regular review and iteration
5. Tools serve the system, not vice versa

Be practical and realistic. Help design systems that reduce friction and enhance focus.`,
    popularity: 80,
    featured: false,
  },
];

export default function PersonasPage() {
  const [personas, setPersonas] = useState(SAMPLE_PERSONAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // Filter personas
  const filteredPersonas = useMemo(() => {
    return personas.filter((persona) => {
      const matchesSearch = !searchTerm || 
        persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || persona.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [personas, searchTerm, selectedCategory]);

  const featuredPersonas = filteredPersonas.filter((p) => p.featured);
  const regularPersonas = filteredPersonas.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-600 via-purple-600 to-accent-600">
        <div className="container-custom py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
                <Bot className="w-4 h-4 mr-1" />
                AI Personas
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Pre-Built AI Personas
              </h1>
              <p className="text-lg text-white/80 max-w-2xl">
                Ready-to-use AI personalities for any task. Copy the system prompt
                and paste into ChatGPT, Claude, or any AI assistant.
              </p>
            </div>
            <Link href="/bot-builder/personas/create">
              <Button
                size="lg"
                className="bg-white text-brand-600 hover:bg-gray-100"
                leftIcon={<Plus className="w-5 h-5" />}
              >
                Create Your Own
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-10">
        <div className="container-custom py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search personas..."
                onClear={() => setSearchTerm('')}
              />
            </div>
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              {PERSONA_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
                      ${selectedCategory === category.id
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Showing {filteredPersonas.length} personas
        </p>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredPersonas.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Bot className="w-12 h-12" />}
              title="No personas found"
              description="Try adjusting your search or filters"
              action={
                <Link href="/bot-builder/personas/create">
                  <Button variant="primary">Create a Persona</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            {/* Featured */}
            {featuredPersonas.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Featured Personas
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPersonas.map((persona, index) => (
                    <motion.div
                      key={persona.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PersonaCard persona={persona} featured />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* All Personas */}
            {regularPersonas.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  All Personas
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPersonas.map((persona, index) => (
                    <motion.div
                      key={persona.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PersonaCard persona={persona} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// PERSONA CARD COMPONENT
// ============================================

function PersonaCard({ persona, featured = false }) {
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(persona.prompt);
      setCopied(true);
      toast.success('Persona prompt copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const category = PERSONA_CATEGORIES.find((c) => c.id === persona.category);
  const CategoryIcon = category?.icon || Bot;

  return (
    <Card 
      hover 
      className={`h-full flex flex-col ${featured ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''}`}
    >
      {featured && (
        <div className="absolute top-3 right-3">
          <Badge variant="warning" size="sm">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Featured
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-xl ${persona.color} flex items-center justify-center text-2xl`}>
          {persona.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {persona.name}
          </h3>
          <Badge variant="secondary" size="sm">
            <CategoryIcon className="w-3 h-3 mr-1" />
            {category?.name || persona.category}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
        {persona.description}
      </p>

      {/* Traits */}
      <div className="flex flex-wrap gap-2 mb-4">
        {persona.traits.map((trait) => (
          <span
            key={trait}
            className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy Prompt'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setShowPrompt(!showPrompt);
          }}
        >
          {showPrompt ? 'Hide' : 'Preview'}
        </Button>
      </div>

      {/* Prompt Preview */}
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-48 overflow-y-auto">
            {persona.prompt}
          </pre>
        </motion.div>
      )}
    </Card>
  );
}
