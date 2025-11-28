'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { searchPrompts, getCategories, getTags } from '@/lib/queries';

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const [promptsData, categoriesData, tagsData] = await Promise.all([
        searchPrompts(),
        getCategories(),
        getTags()
      ]);
      setPrompts(promptsData);
      setCategories(categoriesData);
      setTags(tagsData);
      setLoading(false);
    }
    loadInitialData();
  }, []);

  // Handle search
  const handleSearch = async () => {
    setLoading(true);
    const results = await searchPrompts(searchTerm, selectedCategory, selectedTags);
    setPrompts(results);
    setLoading(false);
  };

  // Handle tag toggle
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Copy to clipboard
  const copyToClipboard = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🗂️ PromptVault</h1>
        <p>Your AI Prompt Library</p>
      </header>

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Tags:</label>
            <div className="tags-list">
              {tags.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  className={`tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h2>Results</h2>
          <span className="count">{prompts.length} prompts</span>
        </div>

        {loading ? (
          <div className="loading">Loading prompts...</div>
        ) : prompts.length === 0 ? (
          <div className="no-results">No prompts found. Try adjusting your search.</div>
        ) : (
          <div className="prompts-grid">
            {prompts.map(prompt => (
              <div key={prompt.id} className="prompt-card">
                <Link href={`/prompt/${prompt.id}`} className="card-link">
                  <h3>{prompt.title}</h3>
                  <p className="content">{prompt.content}</p>
                </Link>

                <div className="card-actions">
                  <button
                    onClick={() => copyToClipboard(prompt.content, prompt.id)}
                    className={`copy-btn ${copiedId === prompt.id ? 'copied' : ''}`}
                    title="Copy to clipboard"
                  >
                    {copiedId === prompt.id ? '✓' : '📋'}
                  </button>
                </div>

                <div className="meta">
                  <span className="category">{prompt.category}</span>
                  <div className="tags">
                    {prompt.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="date">
                  {new Date(prompt.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}