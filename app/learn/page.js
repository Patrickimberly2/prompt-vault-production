'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LearnPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock courses data for now
    setTimeout(() => {
      setCourses([
        {
          id: 1,
          title: "AI Prompt Engineering Basics",
          slug: "ai-prompt-engineering-basics-2025",
          short_description: "Master the art of prompt engineering",
          difficulty: "beginner",
          category: "AI & Prompts",
          estimated_duration_minutes: 120,
          lesson_count: 5,
          is_free: true,
          enrollment_count: 1250
        },
        {
          id: 2,
          title: "Advanced Chatbot Development",
          slug: "advanced-chatbot-development-2025", 
          short_description: "Create intelligent conversational AI",
          difficulty: "advanced",
          category: "Bot Building",
          estimated_duration_minutes: 300,
          lesson_count: 8,
          is_free: false,
          enrollment_count: 456
        },
        {
          id: 3,
          title: "Content Creation with AI",
          slug: "content-creation-ai-2025",
          short_description: "AI-powered content creation",
          difficulty: "intermediate", 
          category: "Content Marketing",
          estimated_duration_minutes: 180,
          lesson_count: 6,
          is_free: true,
          enrollment_count: 789
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
        <h1 className="text-4xl font-bold mb-4">Learn AI & Prompt Engineering</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Master AI prompt engineering and chatbot development with our comprehensive courses. From basics to advanced techniques.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link key={course.id} href={`/learn/${course.slug}`}>
            <div className="card-interactive p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                  {course.is_free && (
                    <span className="badge badge-success">Free</span>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {course.short_description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{course.category}</span>
                <span>{Math.round(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{course.lesson_count} lessons</span>
                <span className="text-gray-500 dark:text-gray-400">{course.enrollment_count} enrolled</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}