'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Lightbulb,
  Target,
  Users,
  Palette,
  FileText,
  Wand2,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select, Checkbox } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// ============================================
// PROMPT BUILDER PAGE (Questions-Based)
// ============================================

// Predefined prompt templates/categories
const PROMPT_CATEGORIES = [
  {
    id: 'business',
    name: 'Business & Marketing',
    icon: Target,
    color: 'bg-blue-500',
    description: 'Create prompts for business strategy, marketing, and sales',
  },
  {
    id: 'content',
    name: 'Content Creation',
    icon: FileText,
    color: 'bg-purple-500',
    description: 'Generate prompts for blogs, social media, and copywriting',
  },
  {
    id: 'creative',
    name: 'Creative Writing',
    icon: Palette,
    color: 'bg-pink-500',
    description: 'Craft prompts for stories, scripts, and creative projects',
  },
  {
    id: 'productivity',
    name: 'Productivity & Learning',
    icon: Lightbulb,
    color: 'bg-amber-500',
    description: 'Build prompts for learning, planning, and organization',
  },
  {
    id: 'customer',
    name: 'Customer Service',
    icon: Users,
    color: 'bg-green-500',
    description: 'Design prompts for support, feedback, and engagement',
  },
  {
    id: 'custom',
    name: 'Custom Prompt',
    icon: Wand2,
    color: 'bg-gradient-to-r from-brand-500 to-accent-500',
    description: 'Build a completely custom prompt from scratch',
  },
];

// Questions for each category
const CATEGORY_QUESTIONS = {
  business: [
    {
      id: 'goal',
      question: 'What is your primary business goal?',
      type: 'select',
      options: [
        'Increase sales',
        'Generate leads',
        'Build brand awareness',
        'Improve customer retention',
        'Launch a new product',
        'Enter new market',
        'Other',
      ],
      icon: Target,
    },
    {
      id: 'audience',
      question: 'Who is your target audience?',
      type: 'text',
      placeholder: 'e.g., Small business owners, Tech professionals, Parents...',
      icon: Users,
    },
    {
      id: 'industry',
      question: 'What industry are you in?',
      type: 'text',
      placeholder: 'e.g., E-commerce, SaaS, Healthcare, Education...',
      icon: FileText,
    },
    {
      id: 'tone',
      question: 'What tone should the AI use?',
      type: 'select',
      options: ['Professional', 'Casual', 'Friendly', 'Formal', 'Persuasive', 'Educational'],
      icon: Palette,
    },
    {
      id: 'details',
      question: 'Any specific requirements or context?',
      type: 'textarea',
      placeholder: 'Add any additional details, constraints, or context...',
      icon: Lightbulb,
    },
  ],
  content: [
    {
      id: 'content_type',
      question: 'What type of content do you want to create?',
      type: 'select',
      options: [
        'Blog post',
        'Social media post',
        'Email newsletter',
        'Product description',
        'Ad copy',
        'Video script',
        'Podcast outline',
      ],
      icon: FileText,
    },
    {
      id: 'topic',
      question: 'What is the main topic or subject?',
      type: 'text',
      placeholder: 'e.g., AI productivity tips, Summer fashion trends...',
      icon: Target,
    },
    {
      id: 'audience',
      question: 'Who is your target audience?',
      type: 'text',
      placeholder: 'e.g., Millennials, Business professionals, Parents...',
      icon: Users,
    },
    {
      id: 'tone',
      question: 'What tone and style do you want?',
      type: 'select',
      options: ['Informative', 'Entertaining', 'Inspirational', 'Conversational', 'Professional', 'Humorous'],
      icon: Palette,
    },
    {
      id: 'length',
      question: 'How long should the content be?',
      type: 'select',
      options: ['Short (100-200 words)', 'Medium (300-500 words)', 'Long (800+ words)', 'As needed'],
      icon: FileText,
    },
  ],
  creative: [
    {
      id: 'format',
      question: 'What creative format are you working on?',
      type: 'select',
      options: ['Short story', 'Novel chapter', 'Poem', 'Script/Screenplay', 'Song lyrics', 'Creative essay'],
      icon: FileText,
    },
    {
      id: 'genre',
      question: 'What genre or style?',
      type: 'select',
      options: ['Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Horror', 'Comedy', 'Drama', 'Non-fiction'],
      icon: Palette,
    },
    {
      id: 'premise',
      question: 'What is the main premise or theme?',
      type: 'textarea',
      placeholder: 'Describe your story idea, theme, or creative vision...',
      icon: Lightbulb,
    },
    {
      id: 'characters',
      question: 'Describe the main character(s)',
      type: 'textarea',
      placeholder: 'e.g., A reluctant hero, a wise mentor, an unexpected villain...',
      icon: Users,
    },
    {
      id: 'mood',
      question: 'What mood or atmosphere do you want?',
      type: 'select',
      options: ['Dark & mysterious', 'Light & whimsical', 'Tense & thrilling', 'Warm & heartfelt', 'Epic & grand'],
      icon: Palette,
    },
  ],
  productivity: [
    {
      id: 'task',
      question: 'What do you want help with?',
      type: 'select',
      options: [
        'Learning a new skill',
        'Planning a project',
        'Solving a problem',
        'Organizing information',
        'Making a decision',
        'Brainstorming ideas',
      ],
      icon: Target,
    },
    {
      id: 'subject',
      question: 'What is the specific subject or topic?',
      type: 'text',
      placeholder: 'e.g., Python programming, Project management, Financial planning...',
      icon: FileText,
    },
    {
      id: 'level',
      question: 'What is your current knowledge level?',
      type: 'select',
      options: ['Complete beginner', 'Some basics', 'Intermediate', 'Advanced', 'Expert looking to refine'],
      icon: Lightbulb,
    },
    {
      id: 'format',
      question: 'How would you like the information presented?',
      type: 'select',
      options: ['Step-by-step guide', 'Bullet points', 'Detailed explanation', 'Q&A format', 'Examples & exercises'],
      icon: Palette,
    },
    {
      id: 'constraints',
      question: 'Any constraints or preferences?',
      type: 'textarea',
      placeholder: 'e.g., Time limit, specific tools, learning style preferences...',
      icon: Users,
    },
  ],
  customer: [
    {
      id: 'scenario',
      question: 'What customer scenario are you addressing?',
      type: 'select',
      options: [
        'Responding to complaint',
        'Answering product questions',
        'Handling refund request',
        'Onboarding new customer',
        'Gathering feedback',
        'Upselling/Cross-selling',
      ],
      icon: Users,
    },
    {
      id: 'product',
      question: 'What product or service is involved?',
      type: 'text',
      placeholder: 'e.g., SaaS subscription, Physical product, Consulting service...',
      icon: Target,
    },
    {
      id: 'customer_mood',
      question: 'What is the customer\'s likely mood?',
      type: 'select',
      options: ['Frustrated/Angry', 'Confused', 'Curious', 'Happy', 'Neutral', 'Urgent'],
      icon: Palette,
    },
    {
      id: 'goal',
      question: 'What outcome do you want?',
      type: 'select',
      options: ['Resolve issue', 'Retain customer', 'Convert to sale', 'Gather information', 'Build relationship'],
      icon: Lightbulb,
    },
    {
      id: 'brand_voice',
      question: 'Describe your brand voice',
      type: 'text',
      placeholder: 'e.g., Friendly and casual, Professional and formal...',
      icon: FileText,
    },
  ],
  custom: [
    {
      id: 'task',
      question: 'What do you want the AI to do?',
      type: 'textarea',
      placeholder: 'Describe the task in detail...',
      icon: Target,
    },
    {
      id: 'context',
      question: 'What context or background should the AI know?',
      type: 'textarea',
      placeholder: 'Provide any relevant background information...',
      icon: FileText,
    },
    {
      id: 'format',
      question: 'How should the output be formatted?',
      type: 'text',
      placeholder: 'e.g., Bullet points, paragraphs, table, code...',
      icon: Palette,
    },
    {
      id: 'constraints',
      question: 'Any constraints or requirements?',
      type: 'textarea',
      placeholder: 'e.g., Word count, tone, things to avoid...',
      icon: Lightbulb,
    },
    {
      id: 'examples',
      question: 'Can you provide an example of good output?',
      type: 'textarea',
      placeholder: 'Optional: Show an example of what you\'re looking for...',
      icon: Star,
    },
  ],
};

export default function PromptBuilderPage() {
  const [step, setStep] = useState(0); // 0 = category selection, 1+ = questions
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [answers, setAnswers] = useState({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const questions = selectedCategory ? CATEGORY_QUESTIONS[selectedCategory.id] : [];
  const currentQuestion = questions[step - 1];
  const totalSteps = questions.length + 1; // +1 for category selection
  const isLastQuestion = step === questions.length;
  const showResult = step > questions.length;

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setAnswers({});
    setGeneratedPrompt('');
    setStep(1);
  };

  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  // Go to next step
  const handleNext = () => {
    if (isLastQuestion) {
      generatePrompt();
      setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };

  // Go to previous step
  const handleBack = () => {
    if (step === 1) {
      setSelectedCategory(null);
      setStep(0);
    } else {
      setStep(step - 1);
    }
  };

  // Generate the prompt based on answers
  const generatePrompt = () => {
    const category = selectedCategory;
    let prompt = '';

    switch (category.id) {
      case 'business':
        prompt = `Act as a ${answers.industry || 'business'} expert and marketing strategist.

My goal is to ${answers.goal?.toLowerCase() || 'grow my business'}.

Target audience: ${answers.audience || 'my ideal customers'}

Please provide a detailed, actionable strategy that includes:
1. Key tactics and approaches
2. Specific examples and templates
3. Metrics to track success
4. Timeline for implementation

${answers.details ? `Additional context: ${answers.details}` : ''}

Use a ${answers.tone?.toLowerCase() || 'professional'} tone throughout your response.`;
        break;

      case 'content':
        prompt = `Create a ${answers.content_type?.toLowerCase() || 'piece of content'} about "${answers.topic || 'the given topic'}".

Target audience: ${answers.audience || 'general readers'}
Tone: ${answers.tone || 'Informative'}
Length: ${answers.length || 'As appropriate'}

Requirements:
- Make it engaging and valuable for the reader
- Include a compelling hook/opening
- Use clear structure and formatting
- End with a strong call-to-action or conclusion

Please write the complete ${answers.content_type?.toLowerCase() || 'content'} now.`;
        break;

      case 'creative':
        prompt = `You are a creative writing assistant specializing in ${answers.genre || 'fiction'}.

Write a ${answers.format?.toLowerCase() || 'creative piece'} with the following:

Premise/Theme: ${answers.premise || 'An engaging story'}

Main Character(s): ${answers.characters || 'Compelling protagonists'}

Mood/Atmosphere: ${answers.mood || 'Engaging and immersive'}

Guidelines:
- Show, don't tell
- Use vivid sensory details
- Create authentic dialogue
- Build tension and emotional resonance

Begin the ${answers.format?.toLowerCase() || 'piece'} now:`;
        break;

      case 'productivity':
        prompt = `Act as an expert teacher and mentor in ${answers.subject || 'the given subject'}.

I am a ${answers.level?.toLowerCase() || 'learner'} who wants help with: ${answers.task?.toLowerCase() || 'learning and improving'}

Please provide guidance in the following format: ${answers.format || 'Clear and structured'}

${answers.constraints ? `Constraints/Preferences: ${answers.constraints}` : ''}

Make your response:
- Practical and actionable
- Easy to understand at my level
- Include examples where helpful
- Provide next steps for continued learning`;
        break;

      case 'customer':
        prompt = `Act as a customer service expert for a company that offers ${answers.product || 'products/services'}.

Scenario: ${answers.scenario || 'Customer interaction'}
Customer mood: ${answers.customer_mood || 'Varied'}
Goal: ${answers.goal || 'Resolve the situation positively'}

Brand voice: ${answers.brand_voice || 'Professional and helpful'}

Please provide:
1. A template response for this scenario
2. Key phrases to use
3. Things to avoid saying
4. Follow-up actions to take

Make the response empathetic, solution-focused, and aligned with our brand voice.`;
        break;

      case 'custom':
      default:
        prompt = `${answers.task || 'Please help me with the following task.'}

${answers.context ? `Context: ${answers.context}` : ''}

${answers.format ? `Output format: ${answers.format}` : ''}

${answers.constraints ? `Requirements: ${answers.constraints}` : ''}

${answers.examples ? `Example of desired output:\n${answers.examples}` : ''}`;
        break;
    }

    setGeneratedPrompt(prompt.trim());
  };

  // Copy prompt
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  // Reset
  const handleReset = () => {
    setStep(0);
    setSelectedCategory(null);
    setAnswers({});
    setGeneratedPrompt('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-green-600 via-teal-600 to-brand-600">
        <div className="container-custom py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Guided Prompt Builder</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Questions-Based Prompt Builder
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Answer a few simple questions and we'll generate the perfect prompt for you.
              No prompt engineering experience required!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Progress Bar */}
      {step > 0 && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {showResult ? 'Complete!' : `Question ${step} of ${questions.length}`}
              </span>
              <span className="text-sm font-medium text-brand-600">
                {Math.round((step / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-brand-500"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 0: Category Selection */}
            {step === 0 && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  What kind of prompt do you need?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
                  Select a category to get started
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {PROMPT_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <motion.button
                        key={category.id}
                        onClick={() => handleCategorySelect(category)}
                        className="text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card hover className="h-full">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {category.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {category.description}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          </div>
                        </Card>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Questions */}
            {step > 0 && !showResult && currentQuestion && (
              <motion.div
                key={`question-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    {currentQuestion.icon && (
                      <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                        <currentQuestion.icon className="w-5 h-5 text-brand-600" />
                      </div>
                    )}
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {currentQuestion.question}
                    </h2>
                  </div>

                  {currentQuestion.type === 'select' && (
                    <div className="grid gap-2">
                      {currentQuestion.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleAnswerChange(currentQuestion.id, option)}
                          className={`
                            w-full text-left px-4 py-3 rounded-lg border-2 transition-all
                            ${answers[currentQuestion.id] === option
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
                          `}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'text' && (
                    <Input
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="text-lg"
                    />
                  )}

                  {currentQuestion.type === 'textarea' && (
                    <Textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      rows={4}
                    />
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      leftIcon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      rightIcon={isLastQuestion ? <Sparkles className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      disabled={!answers[currentQuestion.id] && currentQuestion.type !== 'textarea'}
                    >
                      {isLastQuestion ? 'Generate Prompt' : 'Next'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Result */}
            {showResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-brand-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Your Custom Prompt
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ready to use with any AI assistant
                      </p>
                    </div>
                  </div>

                  {/* Generated Prompt */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                      {generatedPrompt}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      leftIcon={copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      onClick={handleCopy}
                    >
                      {copied ? 'Copied!' : 'Copy Prompt'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      leftIcon={<RefreshCw className="w-5 h-5" />}
                      onClick={handleReset}
                    >
                      Start Over
                    </Button>
                  </div>

                  {/* Tips */}
                  <div className="mt-8 p-4 bg-brand-50 dark:bg-brand-950/30 rounded-lg border border-brand-200 dark:border-brand-800">
                    <h4 className="font-medium text-brand-800 dark:text-brand-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Pro Tips
                    </h4>
                    <ul className="text-sm text-brand-700 dark:text-brand-400 space-y-1">
                      <li>• Paste this prompt into ChatGPT, Claude, or any AI assistant</li>
                      <li>• Feel free to modify and add more context</li>
                      <li>• Save prompts that work well for future use</li>
                    </ul>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
