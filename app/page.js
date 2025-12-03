import Link from 'next/link';
import { 
  Sparkles, 
  Bot, 
  Trophy, 
  BookOpen, 
  Link2, 
  Search,
  ArrowRight,
  Zap,
  Users,
  Star,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, FeatureCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PromptCard } from '@/components/prompts/PromptCard';
import { getCategories, searchPrompts, getPromptsCount } from '@/lib/queries';

// ============================================
// HOMEPAGE
// ============================================

export default async function HomePage() {
  // Fetch data
  const [
    { data: categories },
    { data: featuredPrompts },
    totalPrompts,
  ] = await Promise.all([
    getCategories(),
    searchPrompts({ limit: 6, sortBy: 'popular' }),
    getPromptsCount(),
  ]);

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="container-custom relative py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge variant="accent" size="lg" className="mb-6">
              <Sparkles className="w-4 h-4 mr-1" />
              {totalPrompts.toLocaleString()}+ Prompts Available
            </Badge>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Master AI with the{' '}
              <span className="gradient-text">Ultimate Prompt Library</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Discover, create, and share AI prompts. Build custom bots, 
              compete in challenges, and learn prompt engineering from experts.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/prompts">
                <Button variant="gradient" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Browse Prompts
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" size="lg">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>5,000+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Updated daily</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="section-header">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to master AI
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              From prompt library to custom bot builder - all the tools in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="20,000+ Prompts"
              description="Browse our massive collection of AI prompts organized by category, use case, and AI model."
            />
            <FeatureCard
              icon={<Bot className="w-6 h-6" />}
              title="Bot Builder"
              description="Create custom AI personas and agent workflows. Export to ChatGPT, Claude, and more."
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title="Challenges"
              description="Compete with others in daily and weekly prompt challenges. Win badges and climb the leaderboard."
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Learn"
              description="Master prompt engineering with our courses and guides written by AI experts."
            />
            <FeatureCard
              icon={<Link2 className="w-6 h-6" />}
              title="Prompt Chains"
              description="Create multi-step prompt workflows for complex tasks like content creation and research."
            />
            <FeatureCard
              icon={<Search className="w-6 h-6" />}
              title="Smart Search"
              description="Find the perfect prompt with our powerful full-text search and advanced filters."
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="section-header">
            <Badge variant="secondary" className="mb-4">Categories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Prompts for every use case
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Explore prompts organized into {categories?.length || 19} categories.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories?.slice(0, 8).map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card hover className="text-center h-full">
                  <div 
                    className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 text-2xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon || '📝'}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/categories">
              <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Prompts Section */}
      <section className="section bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="section-header">
            <Badge variant="primary" className="mb-4">Popular</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trending prompts
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover the most popular prompts used by our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPrompts?.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/prompts">
              <Button variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse All Prompts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="section bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="section-header">
            <Badge variant="accent" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, one-time pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No subscriptions. Pay once, own forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <Card className="relative">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Free
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Perfect for getting started
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    'Browse all prompts',
                    'Basic search',
                    '3 favorites',
                    'Daily challenges',
                    'Free courses',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button variant="secondary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Pro - Highlighted */}
            <Card variant="gradient" className="relative ring-2 ring-brand-500">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="primary">Most Popular</Badge>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Pro
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$49</span>
                  <span className="text-gray-500 ml-1">one-time</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  For serious prompt engineers
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    'Everything in Free',
                    'Unlimited favorites',
                    'Advanced search',
                    '10 AI personas',
                    '5 prompt chains',
                    'Export prompts',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <Button variant="gradient" className="w-full">
                    Get Pro
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Lifetime */}
            <Card className="relative">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Lifetime
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$149</span>
                  <span className="text-gray-500 ml-1">one-time</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Unlock everything forever
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    'Everything in Pro',
                    'Unlimited personas & chains',
                    'Agent workflow builder',
                    'All premium courses',
                    'API access',
                    'Early feature access',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <Button variant="secondary" className="w-full">
                    Get Lifetime
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-brand-600 to-accent-600">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to level up your AI game?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already using PromptVault to 
            create better AI conversations and workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-brand-600 hover:bg-gray-100"
              >
                Start for Free
              </Button>
            </Link>
            <Link href="/prompts">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Browse Prompts
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
