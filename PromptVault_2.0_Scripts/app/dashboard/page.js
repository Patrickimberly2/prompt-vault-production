'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Heart,
  Clock,
  Star,
  TrendingUp,
  Bookmark,
  Settings,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Target,
  Award,
  Zap,
  FolderOpen,
  PenTool,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge, Avatar, Skeleton, Divider, EmptyState } from '@/components/ui/Badge';
import { PromptCard } from '@/components/prompts/PromptCard';
import { useAuth } from '@/components/Providers';
import toast from 'react-hot-toast';

// ============================================
// DASHBOARD PAGE
// ============================================

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    totalFavorites: 0,
    promptsUsed: 0,
    streak: 0,
    rank: 'Explorer',
  });
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, authLoading, router]);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      
      setLoading(true);
      try {
        // In a real app, fetch from Supabase
        // For now, using placeholder data
        setStats({
          totalFavorites: 24,
          promptsUsed: 156,
          streak: 7,
          rank: 'Pro Prompter',
        });
        
        // Fetch recent/favorite prompts would go here
        setRecentPrompts([]);
        setFavorites([]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (authLoading || !user) {
    return <DashboardSkeleton />;
  }

  const quickActions = [
    {
      title: 'Browse Prompts',
      description: 'Explore 20,000+ AI prompts',
      icon: Sparkles,
      href: '/prompts',
      color: 'bg-brand-500',
    },
    {
      title: 'Fill-in-the-Blank',
      description: 'Interactive prompt templates',
      icon: PenTool,
      href: '/fill-in-the-blank',
      color: 'bg-purple-500',
    },
    {
      title: 'Prompt Builder',
      description: 'Build prompts with questions',
      icon: Target,
      href: '/prompt-builder',
      color: 'bg-green-500',
    },
    {
      title: 'Bot Builder',
      description: 'Create custom AI personas',
      icon: Zap,
      href: '/bot-builder',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={user.user_metadata?.avatar_url}
                name={user.user_metadata?.full_name || user.email}
                size="xl"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="ghost" leftIcon={<Settings className="w-4 h-4" />}>
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              label="Favorites"
              value={stats.totalFavorites}
              icon={<Heart className="w-5 h-5 text-red-500" />}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              label="Prompts Used"
              value={stats.promptsUsed}
              icon={<Copy className="w-5 h-5 text-brand-500" />}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              label="Day Streak"
              value={stats.streak}
              icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              label="Rank"
              value={stats.rank}
              icon={<Award className="w-5 h-5 text-amber-500" />}
            />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Link href={action.href}>
                        <Card hover className="h-full">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {action.description}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
                <Link href="/prompts">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    View all
                  </Button>
                </Link>
              </div>
              
              {recentPrompts.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {recentPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>
              ) : (
                <Card>
                  <EmptyState
                    icon={<Clock className="w-12 h-12" />}
                    title="No recent activity"
                    description="Start exploring prompts to see your activity here"
                    action={
                      <Link href="/prompts">
                        <Button variant="primary">Browse Prompts</Button>
                      </Link>
                    }
                  />
                </Card>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Favorites */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Favorites
                </h3>
                <Badge variant="secondary">{stats.totalFavorites}</Badge>
              </div>
              
              {favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.slice(0, 5).map((prompt) => (
                    <Link
                      key={prompt.id}
                      href={`/prompts/${prompt.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {prompt.title || prompt.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {prompt.content || prompt.prompt_text}
                      </p>
                    </Link>
                  ))}
                  <Link href="/favorites">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all favorites
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Heart className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    No favorites yet
                  </p>
                  <Link href="/prompts">
                    <Button variant="secondary" size="sm">
                      Find prompts to save
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Collections */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-brand-500" />
                  Collections
                </h3>
              </div>
              <div className="text-center py-6">
                <FolderOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Organize prompts into collections
                </p>
                <Button variant="secondary" size="sm">
                  Create collection
                </Button>
              </div>
            </Card>

            {/* Upgrade CTA */}
            <Card className="bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <div className="text-center">
                <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-90" />
                <h3 className="font-semibold text-lg mb-2">Upgrade to Pro</h3>
                <p className="text-sm opacity-90 mb-4">
                  Unlock unlimited favorites, collections, and more!
                </p>
                <Link href="/pricing">
                  <Button
                    variant="secondary"
                    className="bg-white text-brand-600 hover:bg-gray-100"
                  >
                    View Plans
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOADING SKELETON
// ============================================

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-8">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      </div>
      <div className="container-custom py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
