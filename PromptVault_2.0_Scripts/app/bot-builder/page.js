import Link from 'next/link';
import {
  Bot,
  BookOpen,
  User,
  Workflow,
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  Code2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, LinkedCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// ============================================
// BOT BUILDER HUB PAGE
// ============================================

export const metadata = {
  title: 'Bot Builder',
  description: 'Create custom AI personas and agent workflows. Tutorials, persona builder, and agent workflow editor.',
};

export default function BotBuilderPage() {
  const features = [
    {
      title: 'Tutorials',
      description: 'Step-by-step guides for setting up custom bots on ChatGPT, Claude, Gemini, and more.',
      icon: BookOpen,
      href: '/bot-builder/tutorials',
      color: 'bg-blue-500',
      badge: 'Free',
    },
    {
      title: 'AI Personas',
      description: 'Create custom AI personalities with unique traits, system prompts, and conversation styles.',
      icon: User,
      href: '/bot-builder/personas',
      color: 'bg-purple-500',
      badge: 'Popular',
    },
    {
      title: 'Agent Workflows',
      description: 'Build multi-step AI workflows with conditional logic and variable passing.',
      icon: Workflow,
      href: '/bot-builder/agents',
      color: 'bg-green-500',
      badge: 'Pro',
    },
  ];

  const tutorials = [
    {
      title: 'Create a Custom GPT',
      platform: 'ChatGPT',
      duration: '10 min',
      href: '/bot-builder/tutorials/custom-gpt',
    },
    {
      title: 'Set Up Claude Projects',
      platform: 'Claude',
      duration: '8 min',
      href: '/bot-builder/tutorials/claude-projects',
    },
    {
      title: 'Configure Gemini Gems',
      platform: 'Gemini',
      duration: '7 min',
      href: '/bot-builder/tutorials/gemini-gems',
    },
    {
      title: 'Local LLM with Ollama',
      platform: 'Ollama',
      duration: '15 min',
      href: '/bot-builder/tutorials/ollama-setup',
    },
  ];

  const featuredPersonas = [
    {
      name: 'Code Reviewer',
      description: 'Expert code reviewer that provides detailed feedback on code quality, security, and best practices.',
      uses: 2340,
      category: 'Development',
    },
    {
      name: 'Marketing Strategist',
      description: 'Strategic marketing advisor that helps create campaigns, analyze markets, and optimize funnels.',
      uses: 1890,
      category: 'Business',
    },
    {
      name: 'Creative Writer',
      description: 'Versatile writer that adapts tone and style for any creative writing project.',
      uses: 3120,
      category: 'Writing',
    },
  ];

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-gradient-to-br from-accent-50 via-white to-brand-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <div className="container-custom py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge variant="accent" className="mb-4">
              <Bot className="w-4 h-4 mr-1" />
              Bot Builder
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Build Custom AI Assistants
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              From simple tutorials to advanced agent workflows. Create AI personas
              that match your exact needs and export them anywhere.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/bot-builder/personas/create">
                <Button variant="gradient" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Create Persona
                </Button>
              </Link>
              <Link href="/bot-builder/tutorials">
                <Button variant="secondary" size="lg">
                  View Tutorials
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="section bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.href}>
                  <Card hover className="h-full relative overflow-hidden group">
                    {feature.badge && (
                      <Badge 
                        variant={feature.badge === 'Pro' ? 'accent' : 'primary'}
                        className="absolute top-4 right-4"
                      >
                        {feature.badge}
                      </Badge>
                    )}
                    <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {feature.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {feature.description}
                    </p>
                    <span className="inline-flex items-center text-brand-600 dark:text-brand-400 text-sm font-medium">
                      Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Tutorials */}
      <section className="section bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Quick Start Tutorials
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Learn how to set up custom bots on popular AI platforms.
              </p>
            </div>
            <Link href="/bot-builder/tutorials">
              <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View all
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tutorials.map((tutorial) => (
              <Link key={tutorial.href} href={tutorial.href}>
                <Card hover className="h-full">
                  <Badge variant="secondary" size="sm" className="mb-3">
                    {tutorial.platform}
                  </Badge>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {tutorial.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tutorial.duration} read
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Personas */}
      <section className="section bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Featured Personas
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explore community-created AI personas ready to use.
              </p>
            </div>
            <Link href="/bot-builder/personas">
              <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse all
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredPersonas.map((persona) => (
              <Card key={persona.name} hover>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {persona.name}
                      </h3>
                      <Badge variant="secondary" size="sm">
                        {persona.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {persona.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      <Zap className="w-3 h-3 inline mr-1" />
                      {persona.uses.toLocaleString()} uses
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="section-header">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How the Bot Builder Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Three tiers of AI customization for any skill level.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-brand-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Follow Tutorials
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn the basics with our step-by-step guides for ChatGPT, Claude, Gemini, and more.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Create Personas
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build custom AI personalities with unique traits, prompts, and conversation styles.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Build Workflows
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create advanced multi-step agent workflows with conditional logic and automation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-accent-600 to-brand-600">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to build your first AI assistant?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Start with a simple persona or dive into advanced workflows.
            Our tools make it easy to create exactly what you need.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/bot-builder/personas/create">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-accent-600 hover:bg-gray-100"
              >
                Create a Persona
              </Button>
            </Link>
            <Link href="/bot-builder/tutorials">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Start with Tutorials
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
