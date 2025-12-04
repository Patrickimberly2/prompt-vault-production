'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  // Open with Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="flex items-center border-b border-gray-200 px-4">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search 20,000+ prompts..."
            className="w-full px-4 py-4 text-lg outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-4">
          {query ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Search results for "{query}"</p>
              {/* TODO: Add actual search results here */}
              <div className="text-center py-8 text-gray-400">
                Search functionality coming soon...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">QUICK LINKS</p>
                <div className="space-y-1">
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">
                    Browse All Prompts
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">
                    Featured Prompts
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">
                    Recent Prompts
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">CATEGORIES</p>
                <div className="space-y-1">
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">
                    Content Marketing
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">
                    Social Media
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">
                    Business Strategy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-100 rounded mr-1">↑</kbd>
              <kbd className="px-2 py-1 bg-gray-100 rounded">↓</kbd>
              <span className="ml-2">Navigate</span>
            </span>
            <span className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-100 rounded mr-1">↵</kbd>
              <span className="ml-2">Select</span>
            </span>
          </div>
          <span className="flex items-center">
            <kbd className="px-2 py-1 bg-gray-100 rounded mr-1">ESC</kbd>
            <span className="ml-2">Close</span>
          </span>
        </div>
      </div>
    </div>
  )
}
