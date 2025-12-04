import { getFeaturedPrompts, getRecentPrompts, getCategories, getStats } from '@/lib/prompts'
import Link from 'next/link'

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  // Fetch data
  const [featured, recent, categories, stats] = await Promise.all([
    getFeaturedPrompts(9),
    getRecentPrompts(9),
    getCategories(),
    getStats()
  ])

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PromptVault 2.0
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Your comprehensive library of {stats.total.toLocaleString()}+ AI prompts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse All Prompts
            </Link>
            <Link
              href="/categories"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-blue-600"
            >
              View Categories
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{stats.total.toLocaleString()}</div>
              <div className="text-gray-600 mt-1">Total Prompts</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">{stats.categories}</div>
              <div className="text-gray-600 mt-1">Categories</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-pink-600">{stats.models}</div>
              <div className="text-gray-600 mt-1">AI Models</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Prompts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">🔥 Featured Prompts</h2>
          <Link href="/featured" className="text-blue-600 hover:text-blue-700 font-semibold">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* Recent Prompts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">🆕 Recently Added</h2>
          <Link href="/recent" className="text-blue-600 hover:text-blue-700 font-semibold">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recent.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">📂 Browse by Category</h2>
          <Link href="/categories" className="text-blue-600 hover:text-blue-700 font-semibold">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map(category => (
            <Link
              key={category.name}
              href={`/category/${category.name.toLowerCase().replace(/ /g, '-')}`}
              className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">{category.count} prompts</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

// Prompt Card Component
function PromptCard({ prompt }) {
  return (
    <Link
      href={`/prompt/${prompt.id}`}
      className="group bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
          {prompt.category}
        </span>
        <span className="text-sm text-gray-500">{prompt.ai_model}</span>
      </div>
      
      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-2 line-clamp-2">
        {prompt.name}
      </h3>
      
      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
        {prompt.prompt_text}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center">
          <span className="mr-1">⭐</span>
          {prompt.times_used || 0} uses
        </span>
        <span className="px-2 py-1 bg-gray-100 rounded">
          {prompt.prompt_type}
        </span>
      </div>
    </Link>
  )
}
