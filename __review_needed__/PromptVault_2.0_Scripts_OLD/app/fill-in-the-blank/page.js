'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Copy,
  Check,
  ChevronRight,
  Search,
  Sparkles,
  RefreshCw,
  Filter,
  X,
} from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { Input, SearchInput, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge, Skeleton, EmptyState } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// ============================================
// FILL-IN-THE-BLANK PAGE
// ============================================

export default function FillInTheBlankPage() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch fill-in-the-blank prompts
  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true);
      try {
        // Fetch prompts that contain brackets (fill-in-the-blank pattern)
        const response = await fetch(
          `https://zqkcoyoknddubrobhfrp.supabase.co/rest/v1/prompts?select=id,name,title,prompt_text,content,source,ai_model&or=(prompt_text.ilike.*%5B*%5D*,content.ilike.*%5B*%5D*)&limit=100`,
          {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setPrompts(data);
          
          // Extract unique sources as categories
          const uniqueSources = [...new Set(data.map(p => p.source).filter(Boolean))];
          setCategories(uniqueSources);
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
        toast.error('Failed to load prompts');
      } finally {
        setLoading(false);
      }
    }

    fetchPrompts();
  }, []);

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const text = (prompt.title || prompt.name || '').toLowerCase();
      const matchesSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || prompt.source === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [prompts, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-purple-600 via-brand-600 to-accent-600">
        <div className="container-custom py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <PenTool className="w-5 h-5" />
              <span className="font-medium">Interactive Prompts</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Fill-in-the-Blank Prompts
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Customize prompts by filling in the blanks. Each bracket contains an example 
              to guide you. Click to edit and create your perfect prompt!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-10">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search prompts..."
                onClear={() => setSearchTerm('')}
              />
            </div>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(cat => ({ value: cat, label: cat })),
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Showing {filteredPrompts.length} interactive prompts
        </p>

        {loading ? (
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <Card>
            <EmptyState
              icon={<PenTool className="w-12 h-12" />}
              title="No prompts found"
              description="Try adjusting your search or filters"
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
                <FillInTheBlankCard prompt={prompt} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// FILL-IN-THE-BLANK CARD COMPONENT
// ============================================

function FillInTheBlankCard({ prompt }) {
  const [values, setValues] = useState({});
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const promptText = prompt.content || prompt.prompt_text || '';
  const promptTitle = prompt.title || prompt.name || 'Untitled Prompt';

  // Parse the prompt to find all [bracketed] placeholders
  const blanks = useMemo(() => {
    const regex = /\[([^\]]+)\]/g;
    const matches = [];
    let match;
    while ((match = regex.exec(promptText)) !== null) {
      matches.push({
        full: match[0],
        content: match[1],
        index: match.index,
      });
    }
    return matches;
  }, [promptText]);

  // Generate the filled prompt
  const filledPrompt = useMemo(() => {
    let result = promptText;
    blanks.forEach((blank, index) => {
      const value = values[index] || blank.full;
      result = result.replace(blank.full, value);
    });
    return result;
  }, [promptText, blanks, values]);

  // Check if all blanks are filled
  const allFilled = blanks.length > 0 && blanks.every((_, index) => values[index]);

  // Handle copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(filledPrompt);
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  // Handle reset
  const handleReset = () => {
    setValues({});
    toast.success('Reset all fields');
  };

  // Render prompt with interactive blanks
  const renderInteractivePrompt = () => {
    if (blanks.length === 0) {
      return <p className="text-gray-700 dark:text-gray-300">{promptText}</p>;
    }

    const parts = [];
    let lastIndex = 0;

    blanks.forEach((blank, index) => {
      // Add text before this blank
      if (blank.index > lastIndex) {
        parts.push(
          <span key={`text-${index}`} className="text-gray-700 dark:text-gray-300">
            {promptText.slice(lastIndex, blank.index)}
          </span>
        );
      }

      // Add the interactive blank
      parts.push(
        <BlankInput
          key={`blank-${index}`}
          placeholder={blank.content}
          value={values[index] || ''}
          onChange={(value) => setValues({ ...values, [index]: value })}
        />
      );

      lastIndex = blank.index + blank.full.length;
    });

    // Add remaining text
    if (lastIndex < promptText.length) {
      parts.push(
        <span key="text-end" className="text-gray-700 dark:text-gray-300">
          {promptText.slice(lastIndex)}
        </span>
      );
    }

    return <div className="leading-relaxed">{parts}</div>;
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
            {promptTitle}
          </h3>
          <div className="flex items-center gap-2">
            {prompt.source && (
              <Badge variant="secondary" size="sm">{prompt.source}</Badge>
            )}
            {prompt.ai_model && (
              <Badge variant="primary" size="sm">{prompt.ai_model}</Badge>
            )}
            <Badge variant="accent" size="sm">
              {blanks.length} blank{blanks.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            variant="ghost"
            size="icon-sm"
            onClick={handleReset}
            aria-label="Reset fields"
          >
            <RefreshCw className="w-4 h-4" />
          </IconButton>
          <Button
            variant={allFilled ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Interactive Prompt */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
        {renderInteractivePrompt()}
      </div>

      {/* Preview (when expanded or all filled) */}
      {(isExpanded || allFilled) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-gray-200 dark:border-gray-700 pt-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preview (Ready to Copy)
            </span>
          </div>
          <div className="bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-lg p-4">
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {filledPrompt}
            </p>
          </div>
        </motion.div>
      )}

      {/* Expand toggle */}
      {!allFilled && blanks.length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-brand-600 dark:text-brand-400 hover:underline mt-2"
        >
          {isExpanded ? 'Hide preview' : 'Show preview'}
        </button>
      )}
    </Card>
  );
}

// ============================================
// BLANK INPUT COMPONENT
// ============================================

function BlankInput({ placeholder, value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showExample, setShowExample] = useState(true);

  // Parse example from placeholder (e.g., "specific benefit, e.g., discounts, exclusive access")
  const parts = placeholder.split(', e.g., ');
  const label = parts[0];
  const example = parts[1] || '';

  return (
    <span className="inline-block relative mx-1 my-1">
      <span
        className={`
          inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 transition-all
          ${isFocused 
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' 
            : value 
              ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
              : 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30'
          }
        `}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowExample(false);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={showExample && example ? example : label}
          className={`
            bg-transparent border-none outline-none text-sm font-medium
            min-w-[120px] max-w-[300px]
            placeholder:text-purple-400 dark:placeholder:text-purple-500
            ${value ? 'text-green-700 dark:text-green-400' : 'text-purple-700 dark:text-purple-300'}
          `}
          style={{ width: `${Math.max(120, (value || placeholder).length * 8)}px` }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </span>
      
      {/* Tooltip with example */}
      {isFocused && example && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 bottom-full mb-2 z-10"
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs">
            <span className="text-gray-400">Example: </span>
            {example}
          </div>
        </motion.div>
      )}
    </span>
  );
}
