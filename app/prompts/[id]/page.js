'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Heart,
  Star,
  Share2,
  ExternalLink,
  ArrowLeft,
  Clock,
  Zap,
  Edit3,
  Flag,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, Skeleton, Divider } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { PromptCard } from '@/components/prompts/PromptCard';
import { getPromptById, trackPromptUsage, searchPrompts } from '@/lib/queries';
import { useAuth } from '@/components/Providers';
import toast from 'react-hot-toast';

// ============================================
// PROMPT DETAIL PAGE
// ============================================

export default function PromptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState(null);
  const [relatedPrompts, setRelatedPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [rating, setRating] = useState(0);
  const [userNotes, setUserNotes] = useState('');

  // Fetch prompt data
  useEffect(() => {
    async function fetchPrompt() {
      setLoading(true);
      try {
        const { data, error } = await getPromptById(id);
        if (error) throw error;
        setPrompt(data);

        // Fetch related prompts from same category
        if (data?.categories?.[0]) {
          const { data: related } = await searchPrompts({
            category: data.categories[0].id,
            limit: 4,
          });
          setRelatedPrompts(
            related?.filter((p) => p.id !== id).slice(0, 3) || []
          );
        }

        // Track usage
        trackPromptUsage(id, user?.id);
      } catch (error) {
        console.error('Error fetching prompt:', error);
        toast.error('Failed to load prompt');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPrompt();
    }
  }, [id, user?.id]);

  // Copy prompt to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  // Share prompt
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: prompt.name,
        text: `Check out this AI prompt: ${prompt.name}`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  // Toggle favorite
  const handleFavorite = () => {
    if (!user) {
      router.push(`/login?redirect=/prompts/${id}`);
      return;
    }
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  if (loading) {
    return <PromptDetailSkeleton />;
  }

  if (!prompt) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Prompt not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The prompt you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/prompts">
          <Button variant="primary">Browse Prompts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container-custom py-8">
        {/* Back button */}
        <Link
          href="/prompts"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to prompts
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                {/* Category & Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {prompt.categories?.map((cat) => (
                    <Link key={cat.id} href={`/categories/${cat.slug}`}>
                      <Badge variant="primary" size="lg">
                        {cat.icon} {cat.name}
                      </Badge>
                    </Link>
                  ))}
                  {prompt.tags?.map((tag) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`}>
                      <Badge variant="secondary">{tag.name}</Badge>
                    </Link>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {prompt.name}
                </h1>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {prompt.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {prompt.rating.toFixed(1)} rating
                    </span>
                  )}
                  {prompt.times_used > 0 && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {prompt.times_used.toLocaleString()} uses
                    </span>
                  )}
                  {prompt.ai_model && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {prompt.ai_model}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    onClick={handleCopy}
                  >
                    {copied ? 'Copied!' : 'Copy Prompt'}
                  </Button>
                  <Button
                    variant="secondary"
                    leftIcon={
                      <Heart
                        className={clsx(
                          'w-4 h-4',
                          isFavorited && 'fill-red-500 text-red-500'
                        )}
                      />
                    }
                    onClick={handleFavorite}
                  >
                    {isFavorited ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="ghost"
                    leftIcon={<Share2 className="w-4 h-4" />}
                    onClick={handleShare}
                  >
                    Share
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Prompt Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Prompt
                  </h2>
                  <IconButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCopy}
                    aria-label="Copy prompt"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </IconButton>
                </div>
                <div
                  className={clsx(
                    'p-4 rounded-lg',
                    'bg-gray-50 dark:bg-gray-800',
                    'border border-gray-200 dark:border-gray-700',
                    'font-mono text-sm',
                    'whitespace-pre-wrap',
                    'max-h-96 overflow-y-auto'
                  )}
                >
                  {prompt.prompt_text}
                </div>
              </Card>
            </motion.div>

            {/* Use Case / Notes */}
            {(prompt.use_case || prompt.notes) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    How to Use
                  </h2>
                  {prompt.use_case && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Use Case
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {prompt.use_case}
                      </p>
                    </div>
                  )}
                  {prompt.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {prompt.notes}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* User Notes (if logged in) */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Your Notes
                  </h2>
                  <Textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Add your personal notes about this prompt..."
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <Button variant="secondary" size="sm">
                      Save Notes
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link href={`/bot-builder/personas/create?prompt=${id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Create Persona with this prompt
                  </Button>
                </Link>
                <Link href={`/chains/create?prompt=${id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Add to Prompt Chain
                  </Button>
                </Link>
                {prompt.source_page_url && (
                  <a
                    href={prompt.source_page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Source
                    </Button>
                  </a>
                )}
              </div>
            </Card>

            {/* Rate this prompt */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Rate this prompt
              </h3>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={clsx(
                        'w-6 h-6 transition-colors',
                        star <= rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-500">
                  You rated this {rating} star{rating > 1 ? 's' : ''}
                </p>
              )}
            </Card>

            {/* Metadata */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Details
              </h3>
              <dl className="space-y-3 text-sm">
                {prompt.ai_model && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">AI Model</dt>
                    <dd className="text-gray-900 dark:text-white font-medium">
                      {prompt.ai_model}
                    </dd>
                  </div>
                )}
                {prompt.prompt_type && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                    <dd className="text-gray-900 dark:text-white font-medium">
                      {prompt.prompt_type}
                    </dd>
                  </div>
                )}
                {prompt.source && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Source</dt>
                    <dd className="text-gray-900 dark:text-white font-medium">
                      {prompt.source}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Added</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </Card>

            {/* Report */}
            <Button variant="ghost" size="sm" className="w-full text-gray-500">
              <Flag className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </div>

        {/* Related Prompts */}
        {relatedPrompts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Divider className="mb-8" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Prompts
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPrompts.map((p) => (
                <PromptCard key={p.id} prompt={p} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

// ============================================
// LOADING SKELETON
// ============================================

function PromptDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container-custom py-8">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
