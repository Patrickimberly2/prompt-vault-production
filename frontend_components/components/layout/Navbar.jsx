'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Menu, X } from 'lucide-react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PromptVault
            </span>
            <span className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded">
              2.0
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/browse" className="text-gray-700 hover:text-blue-600 transition">
              Browse
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 transition">
              Categories
            </Link>
            <Link href="/featured" className="text-gray-700 hover:text-blue-600 transition">
              Featured
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition">
              About
            </Link>
          </div>

          {/* Search Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              onClick={() => {/* Open command palette */}}
            >
              <Search size={18} />
              <span className="text-sm">Search prompts...</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link 
              href="/browse" 
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            <Link 
              href="/categories" 
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              href="/featured" 
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Featured
            </Link>
            <Link 
              href="/about" 
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">
              <Search size={18} />
              <span>Search prompts...</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
