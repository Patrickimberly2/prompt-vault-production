'use client';

import { useState } from 'react';

export default function ChainsPage() {
  const [chains, setChains] = useState([
    {
      id: 1,
      name: "Content Marketing Pipeline",
      description: "Research → Outline → Write → Edit → SEO Optimize",
      category: "Marketing",
      use_count: 245,
      steps: 5
    },
    {
      id: 2, 
      name: "Code Review Workflow",
      description: "Analyze → Security Check → Performance Review → Documentation",
      category: "Development",
      use_count: 156,
      steps: 4
    },
    {
      id: 3,
      name: "Creative Story Generator", 
      description: "Character → Setting → Conflict → Plot → Ending",
      category: "Creative Writing",
      use_count: 89,
      steps: 5
    }
  ]);

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Marketing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Development': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Creative Writing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="section-header">
        <h1 className="text-4xl font-bold mb-4">Prompt Chains</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create multi-step AI workflows that chain prompts together for complex tasks. Build powerful automation sequences.
        </p>
      </div>

      <div className="mb-8">
        <button className="btn-primary">
          + Create New Chain
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chains.map((chain) => (
          <div key={chain.id} className="card-interactive p-6">
            <div className="flex items-start justify-between mb-4">
              <span className={`badge ${getCategoryColor(chain.category)}`}>
                {chain.category}
              </span>
              <span className="badge badge-secondary">
                {chain.steps} steps
              </span>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{chain.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {chain.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{chain.use_count} uses</span>
              <span className="text-blue-600 dark:text-blue-400">Run →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}