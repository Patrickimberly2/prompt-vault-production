'use client'

import { useState } from 'react'
import { supabase } from '@/lib/db'

export default function AddPromptModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Career',
    tags: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const categories = [
    'Career',
    'Learning',
    'Writing',
    'Exploring',
    'Hobby',
    'Personal',
    'Business',
    'Creative',
    'Technical'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Parse tags (comma-separated)
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // Add category to tags if not already there
      if (!tagsArray.includes(formData.category)) {
        tagsArray.unshift(formData.category)
      }

      const { data, error: insertError } = await supabase
        .from('prompts')
        .insert([
          {
            title: formData.title,
            content: formData.content,
            category: formData.category,
            tags: tagsArray,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (insertError) {
        throw insertError
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'Career',
        tags: ''
      })

      // Close modal and refresh
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving prompt:', err)
      setError(err.message || 'Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Prompt</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter a short title for your prompt..."
              required
              maxLength={200}
            />
            <span className="char-count">{formData.title.length}/200</span>
          </div>

          <div className="form-group">
            <label htmlFor="content">Prompt Content *</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Enter the full prompt text..."
              required
              rows={8}
            />
            <span className="char-count">{formData.content.length} characters</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                id="tags"
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="e.g., Marketing, Social Media, Strategy"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="button-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
