'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock challenges data for now
    setTimeout(() => {
      setChallenges([
        {
          id: 1,
          title: "Email Marketing Copy",
          slug: "email-marketing-copy-2025",
          description: "Write compelling email marketing copy that drives engagement.",
          difficulty: "beginner",
          category: "Marketing",
          xp_reward: 150,
          participant_count: 234
        },
        {
          id: 2,
          title: "API Documentation Writer", 
          slug: "api-documentation-writer-2025",
          description: "Create clear and comprehensive API documentation.",
          difficulty: "intermediate",
          category: "Development", 
          xp_reward: 250,
          participant_count: 156
        },
        {
          id: 3,
          title: "Character Dialogue Master",
          slug: "character-dialogue-master-2025", 
          description: "Write realistic and engaging character dialogue.",
          difficulty: "advanced",
          category: "Creative Writing",
          xp_reward: 350,
          participant_count: 89
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-96 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="card p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="section-header">
        <h1 className="text-4xl font-bold mb-4">AI Prompt Challenges</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your prompt engineering skills with our curated challenges. Earn XP, unlock achievements, and improve your AI interaction abilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <Link key={challenge.id} href={`/challenges/${challenge.slug}`}>
            <div className="card-interactive p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`badge ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="badge badge-secondary">
                    {challenge.xp_reward} XP
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {challenge.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{challenge.category}</span>
                <span>{challenge.participant_count} participants</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}