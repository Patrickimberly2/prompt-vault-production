'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Copy,
  Check,
  Heart,
  Star,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge, Skeleton, EmptyState } from '@/components/ui/Badge';
import { searchPrompts, getCategories, getTags } from '@/lib/queries';
import toast from 'react-hot-toast';

// ============================================
// PROMPTS PAGE
// ============================================

export default function PromptsPage() {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [promptsResult, categoriesResult, tagsResult] = await Promise.all([
          searchPrompts({ limit: 100, sortBy }),
          getCategories(),
          getTags(),
        ]);

        setPrompts(promptsResult.data || []);
        setCategories(categoriesResult.data || []);
        setTags(tagsResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load prompts');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sortBy]);

  // Apply filters
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesSearch = !searchTerm ||
        (prompt.title || prompt.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prompt.content || prompt.prompt_text || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' ||
        prompt.category === selectedCategory;

      const matchesTags = selectedTags.length === 0 ||
        (prompt.tags && selectedTags.every(tag => prompt.tags.includes(tag)));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [prompts, searchTerm, selectedCategory, selectedTags]);

  // Remove tag filter
  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600">
        <div className="container-custom py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">AI Prompt Library</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover {prompts.length.toLocaleString()}+ AI Prompts
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Browse our collection of high-quality prompts for ChatGPT, Claude,
              and other AI assistants. Find, save, and customize prompts for any task.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-10">
        <div className="container-custom py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search prompts..."
                onClear={() => setSearchTerm('')}
              />
            </div>

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'recent', label: 'Most Recent' },
                { value: 'popular', label: 'Most Popular' },
              ]}
              className="w-full lg:w-48"
            />

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-4 h-4" />}
              rightIcon={<ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />}
            >
              Filters
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800"
            >
              <div className="grid md:grid-cols-2 gap-4">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Categories' },
                      ...categories.map(cat => ({ value: cat.name, label: cat.name })),
                    ]}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 10).map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            if (isSelected) {
                              removeTag(tag);
                            } else {
                              setSelectedTags([...selectedTags, tag]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            isSelected
                              ? 'bg-brand-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Filters */}
          {(selectedCategory !== 'all' || selectedTags.length > 0) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-gray-500">Active filters:</span>
              {selectedCategory !== 'all' && (
                <Badge variant="primary" removable onRemove={() => setSelectedCategory('all')}>
                  {selectedCategory}
                </Badge>
              )}
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" removable onRemove={() => removeTag(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Showing {filteredPrompts.length} of {prompts.length} prompts
        </p>

        {loading ? (
          <div className="grid gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Search className="w-12 h-12" />}
              title="No prompts found"
              description="Try adjusting your search or filters"
              action={
                <Button
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedTags([]);
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PromptCard prompt={prompt} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// PROMPT CARD COMPONENT
// ============================================

function PromptCard({ prompt }) {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const promptText = prompt.content || prompt.prompt_text || '';
  const promptTitle = prompt.title || prompt.name || 'Untitled Prompt';

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorited(!favorited);
    toast.success(favorited ? 'Removed from favorites' : 'Added to favorites');
  };

  return (
    <Link href={`/prompt/${prompt.id}`}>
      <Card hover className="h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
              {promptTitle}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {prompt.category && (
                <Badge variant="secondary" size="sm">
                  {prompt.category}
                </Badge>
              )}
              {prompt.ai_model && (
                <Badge variant="primary" size="sm">
                  {prompt.ai_model}
                </Badge>
              )}
              {prompt.source && (
                <Badge variant="accent" size="sm">
                  {prompt.source}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              variant="ghost"
              size="icon-sm"
              onClick={handleFavorite}
              aria-label="Favorite"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
            </IconButton>
            <Button
              variant={copied ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
          {promptText}
        </p>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {prompt.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
          {prompt.created_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(prompt.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
