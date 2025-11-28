'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPromptById } from '@/lib/queries';

export default function PromptDetail({ params }) {
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadPrompt() {
      const id = await params.id;
      const data = await getPromptById(id);
      setPrompt(data);
      setLoading(false);
    }
    loadPrompt();
  }, [params]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="detail-page">
          <div className="loading">Loading prompt...</div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="container">
        <div className="detail-page error-page">
          <h1>Prompt Not Found</h1>
          <p>The prompt you're looking for doesn't exist.</p>
          <button onClick={() => router.push('/')} className="back-button">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="detail-page">
        <button onClick={() => router.back()} className="back-button">
          ← Back
        </button>

        <div className="detail-header">
          <h1>{prompt.title}</h1>
          <div className="detail-meta">
            <span className="category-badge">{prompt.category}</span>
            <span className="date">
              {new Date(prompt.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className="detail-content">
          <div className="content-header">
            <h2>Prompt Content</h2>
            <button 
              onClick={copyToClipboard} 
              className={`copy-button ${copied ? 'copied' : ''}`}
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>
          <div className="content-text">
            {prompt.content}
          </div>
        </div>

        {prompt.tags && prompt.tags.length > 0 && (
          <div className="detail-tags">
            <h3>Tags</h3>
            <div className="tags-list">
              {prompt.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
