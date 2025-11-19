'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/db'

export default function PromptDetailPage() {
  const [prompt, setPrompt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    async function fetchPrompt() {
      if (!params?.id) {
        console.error('No ID provided')
        setLoading(false)
        return
      }

      // Try both lowercase 'id' and uppercase 'ID' for compatibility
      let data, error
      
      // First try lowercase
      const result = await supabase
        .from('prompts')
        .select('*')
        .eq('id', params.id)
        .maybeSingle()

      if (result.error && result.error.code !== 'PGRST116') {
        // If error is NOT "no rows returned", try uppercase ID
        const upperResult = await supabase
          .from('prompts')
          .select('*')
          .eq('ID', params.id)
          .maybeSingle()
        
        data = upperResult.data
        error = upperResult.error
      } else {
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('Error fetching prompt:', error)
        setLoading(false)
        return
      }

      if (!data) {
        console.error('No prompt found with ID:', params.id)
        setLoading(false)
        return
      }

      setPrompt(data)
      setLoading(false)
    }

    fetchPrompt()
  }, [params?.id])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading prompt...</div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="container">
        <div className="error-page">
          <h1>Prompt Not Found</h1>
          <p>The prompt you're looking for doesn't exist.</p>
          <button onClick={() => router.push('/')} className="back-button">
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="detail-page">
        <button onClick={() => router.push('/')} className="back-button">
          ← Back to All Prompts
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
  )
}
