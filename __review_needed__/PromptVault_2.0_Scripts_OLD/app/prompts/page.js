'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { Input, SearchInput, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge, Skeleton } from '@/components/ui/Badge';
import { PromptGrid, PromptListItem } from '@/components/prompts/PromptCard';
import { searchPrompts, getCategories, getTags } from '@/lib/queries';
import { useAuth } from '@/components/Providers';

// ============================================
// PROMPTS BROWSE PAGE
// ============================================

export default function PromptsPage() {
  return (
    <Suspense fallback={<PromptsPageSkeleton />}>
      <PromptsContent />
    </Suspense>
  );
}

function PromptsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // State
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Filters from URL
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  // Update URL params
  const updateParams = useCallback((updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 when filters change
    if (!updates.page) {
      params.delete('page');
    }
    router.push(`/prompts?${params.toString()}`);
  }, [searchParams, router]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [
          { data: promptsData, count },
          { data: categoriesData },
          { data: tagsData },
        ] = await Promise.all([
          searchPrompts({
            searchTerm: search,
            category,
            tags: tag ? [tag] : [],
            sortBy,
            page,
            limit,
          }),
          getCategories(),
          getTags(),
        ]);

        setPrompts(promptsData || []);
        setTotalCount(count || 0);
        setCategories(categoriesData || []);
        setTags(tagsData || []);
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [search, category, tag, sortBy, page]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const q = formData.get('search');
    updateParams({ q });
  };

  // Handle favorite toggle
  const handleFavorite = async (promptId) => {
    if (!user) {
      router.push('/login?redirect=/prompts');
      return;
    }
    // Toggle favorite logic here
    setFavorites((prev) =>
      prev.includes(promptId)
        ? prev.filter((id) => id !== promptId)
        : [...prev, promptId]
    );
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Prompts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover {totalCount.toLocaleString()} AI prompts for every use case
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FiltersSidebar
              categories={categories}
              tags={tags}
              selectedCategory={category}
              selectedTag={tag}
              onCategoryChange={(c) => updateParams({ category: c })}
              onTagChange={(t) => updateParams({ tag: t })}
              onClear={() => updateParams({ category: '', tag: '', q: '' })}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Search and controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <SearchInput
                  name="search"
                  defaultValue={search}
                  placeholder="Search prompts..."
                  onClear={() => updateParams({ q: '' })}
                />
              </form>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Mobile filters toggle */}
                <Button
                  variant="secondary"
                  className="lg:hidden"
                  leftIcon={<Filter className="w-4 h-4" />}
                  onClick={() => setFiltersOpen(true)}
                >
                  Filters
                </Button>

                {/* Sort */}
                <Select
                  value={sortBy}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  options={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'popular', label: 'Most Popular' },
                    { value: 'rating', label: 'Highest Rated' },
                    { value: 'oldest', label: 'Oldest' },
                  ]}
                  className="w-40"
                />

                {/* View mode toggle */}
                <div className="hidden sm:flex items-center border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <IconButton
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="icon-sm"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    className="rounded-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="icon-sm"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    className="rounded-none"
                  >
                    <List className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>
            </div>

            {/* Active filters */}
            {(search || category || tag) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-gray-500">Active filters:</span>
                {search && (
                  <Badge
                    variant="primary"
                    removable
                    onRemove={() => updateParams({ q: '' })}
                  >
                    Search: {search}
                  </Badge>
                )}
                {category && (
                  <Badge
                    variant="primary"
                    removable
                    onRemove={() => updateParams({ category: '' })}
                  >
                    Category: {categories.find((c) => c.id === category)?.name || category}
                  </Badge>
                )}
                {tag && (
                  <Badge
                    variant="primary"
                    removable
                    onRemove={() => updateParams({ tag: '' })}
                  >
                    Tag: {tags.find((t) => t.id === tag)?.name || tag}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateParams({ category: '', tag: '', q: '' })}
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Results count */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Showing {prompts.length} of {totalCount.toLocaleString()} prompts
            </p>

            {/* Prompts grid/list */}
            {viewMode === 'grid' ? (
              <PromptGrid
                prompts={prompts}
                loading={loading}
                onFavorite={handleFavorite}
                favorites={favorites}
                emptyMessage="No prompts found. Try adjusting your filters."
              />
            ) : (
              <div className="space-y-2">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))
                ) : prompts.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">
                    No prompts found. Try adjusting your filters.
                  </p>
                ) : (
                  prompts.map((prompt) => (
                    <PromptListItem
                      key={prompt.id}
                      prompt={prompt}
                      onFavorite={handleFavorite}
                      isFavorited={favorites.includes(prompt.id)}
                    />
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="secondary"
                  disabled={!hasPrevPage}
                  onClick={() => updateParams({ page: String(page - 1) })}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={!hasNextPage}
                  onClick={() => updateParams({ page: String(page + 1) })}
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {filtersOpen && (
        <MobileFiltersDrawer
          categories={categories}
          tags={tags}
          selectedCategory={category}
          selectedTag={tag}
          onCategoryChange={(c) => updateParams({ category: c })}
          onTagChange={(t) => updateParams({ tag: t })}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </div>
  );
}

// ============================================
// FILTERS SIDEBAR
// ============================================

function FiltersSidebar({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  onCategoryChange,
  onTagChange,
  onClear,
}) {
  return (
    <div className="sticky top-24 space-y-6">
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </h3>
          {(selectedCategory || selectedTag) && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Categories
          </h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(selectedCategory === cat.id ? '' : cat.id)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedCategory === cat.id
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <span className="mr-2">{cat.icon || '📁'}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Tags */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Popular Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 12).map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagChange(selectedTag === tag.id ? '' : tag.id)}
              >
                <Badge
                  variant={selectedTag === tag.id ? 'primary' : 'secondary'}
                  size="sm"
                  className="cursor-pointer"
                >
                  {tag.name}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================
// MOBILE FILTERS DRAWER
// ============================================

function MobileFiltersDrawer({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  onCategoryChange,
  onTagChange,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          <IconButton variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </IconButton>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          <FiltersSidebar
            categories={categories}
            tags={tags}
            selectedCategory={selectedCategory}
            selectedTag={selectedTag}
            onCategoryChange={(c) => {
              onCategoryChange(c);
              onClose();
            }}
            onTagChange={(t) => {
              onTagChange(t);
              onClose();
            }}
            onClear={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOADING SKELETON
// ============================================

function PromptsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
      </div>
      <div className="container-custom py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-64">
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div className="flex-1">
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-11 flex-1 rounded-lg" />
              <Skeleton className="h-11 w-40 rounded-lg" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
