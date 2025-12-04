'use client'

import { createContext, useContext, useState } from 'react'

// Create contexts for global state management
const AppContext = createContext()

export function Providers({ children }) {
  const [favorites, setFavorites] = useState([])
  const [recentSearches, setRecentSearches] = useState([])

  const addFavorite = (promptId) => {
    setFavorites(prev => [...new Set([...prev, promptId])])
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify([...favorites, promptId]))
    }
  }

  const removeFavorite = (promptId) => {
    setFavorites(prev => prev.filter(id => id !== promptId))
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(favorites.filter(id => id !== promptId)))
    }
  }

  const addRecentSearch = (query) => {
    setRecentSearches(prev => [query, ...prev.filter(q => q !== query)].slice(0, 10))
  }

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    recentSearches,
    addRecentSearch
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within Providers')
  }
  return context
}
