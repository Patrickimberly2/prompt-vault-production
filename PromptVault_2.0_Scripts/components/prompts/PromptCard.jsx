'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Heart,
  Star,
  ExternalLink,
  MoreVertical,
  Bookmark,
  Share2,
  Flag,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// ============================================
// PROMPT CARD COMPONENT
// ============================================

export function PromptCard({
  prompt,
  showCategory = true,
  showTags = true,
  showStats = true,
  onFavorite,
  isFavorited = false,
  className,
}) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(prompt.id);
  };

  return (
    <Link href={`/prompts/${prompt.id}`}>
      <Card
        hover
        className={clsx('group relative h-full', className)}
        padding="none"
      >
        {/* Card content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              {/* Category badge */}
              {showCategory && prompt.categories?.[0] && (
                <Badge
                  variant="primary"
                  size="sm"
                  className="mb-2"
                >
                  {prompt.categories[0].name}
                </Badge>
              )}
              
              {/* Title */}
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {prompt.name}
              </h3>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip content={copied ? 'Copied!' : 'Copy prompt'}>
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
              </Tooltip>

              {onFavorite && (
                <Tooltip content={isFavorited ? 'Remove favorite' : 'Add to favorites'}>
                  <IconButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleFavorite}
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={clsx(
                        'w-4 h-4 transition-colors',
                        isFavorited
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-400'
                      )}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Preview text */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
            {prompt.prompt_text}
          </p>

          {/* Tags */}
          {showTags && prompt.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {prompt.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="secondary" size="sm">
                  {tag.name}
                </Badge>
              ))}
              {prompt.tags.length > 3 && (
                <Badge variant="secondary" size="sm">
                  +{prompt.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          {showStats && (
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {prompt.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {prompt.rating.toFixed(1)}
                </span>
              )}
              {prompt.times_used > 0 && (
                <span>{prompt.times_used.toLocaleString()} uses</span>
              )}
              {prompt.ai_model && (
                <span className="truncate">{prompt.ai_model}</span>
              )}
            </div>
          )}
        </div>

        {/* Hover gradient border effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/20 to-accent-500/20 blur-sm" />
        </div>
      </Card>
    </Link>
  );
}

// ============================================
// PROMPT CARD SKELETON
// ============================================

export function PromptCardSkeleton() {
  return (
    <Card className="h-full" padding="none">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="skeleton h-5 w-20 rounded-full mb-2" />
            <div className="skeleton h-6 w-full rounded mb-1" />
            <div className="skeleton h-6 w-3/4 rounded" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
        <div className="flex gap-1.5 mb-4">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-4">
          <div className="skeleton h-4 w-12 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      </div>
    </Card>
  );
}

// ============================================
// PROMPT GRID
// ============================================

export function PromptGrid({
  prompts,
  loading = false,
  emptyMessage = 'No prompts found',
  columns = 3,
  onFavorite,
  favorites = [],
  className,
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={clsx('grid gap-6', gridCols[columns], className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!prompts?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx('grid gap-6', gridCols[columns], className)}
    >
      {prompts.map((prompt, index) => (
        <motion.div
          key={prompt.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <PromptCard
            prompt={prompt}
            onFavorite={onFavorite}
            isFavorited={favorites.includes(prompt.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================
// PROMPT LIST ITEM (for list views)
// ============================================

export function PromptListItem({
  prompt,
  onFavorite,
  isFavorited = false,
  className,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Link href={`/prompts/${prompt.id}`}>
      <div
        className={clsx(
          'group flex items-start gap-4 p-4 rounded-lg',
          'hover:bg-gray-50 dark:hover:bg-gray-900',
          'border border-transparent hover:border-gray-200 dark:hover:border-gray-800',
          'transition-all',
          className
        )}
      >
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {prompt.categories?.[0] && (
              <Badge variant="primary" size="sm">
                {prompt.categories[0].name}
              </Badge>
            )}
            <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
              {prompt.name}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {prompt.prompt_text}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
          {prompt.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              {prompt.rating.toFixed(1)}
            </span>
          )}
          {prompt.times_used > 0 && (
            <span>{prompt.times_used.toLocaleString()}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
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
          {onFavorite && (
            <IconButton
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavorite(prompt.id);
              }}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={clsx(
                  'w-4 h-4',
                  isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400'
                )}
              />
            </IconButton>
          )}
        </div>
      </div>
    </Link>
  );
}
