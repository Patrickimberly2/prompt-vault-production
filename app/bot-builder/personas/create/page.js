'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Sparkles,
  User,
  MessageSquare,
  Sliders,
  Eye,
  Download,
  RefreshCw,
  Wand2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select, Checkbox } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// ============================================
// CREATE PERSONA PAGE
// ============================================

// Persona templates for quick start
const TEMPLATES = [
  {
    id: 'blank',
    name: 'Start from Scratch',
    icon: '✨',
    description: 'Create a completely custom persona',
  },
  {
    id: 'expert',
    name: 'Subject Expert',
    icon: '🎓',
    description: 'An expert in a specific field',
    defaults: {
      role: 'Expert',
      communicationStyle: 'professional',
      personality: ['Knowledgeable', 'Helpful', 'Thorough'],
    },
  },
  {
    id: 'coach',
    name: 'Coach / Mentor',
    icon: '🌟',
    description: 'Supportive guide for growth',
    defaults: {
      role: 'Coach',
      communicationStyle: 'supportive',
      personality: ['Encouraging', 'Patient', 'Insightful'],
    },
  },
  {
    id: 'assistant',
    name: 'Virtual Assistant',
    icon: '🤖',
    description: 'Efficient task helper',
    defaults: {
      role: 'Assistant',
      communicationStyle: 'concise',
      personality: ['Efficient', 'Organized', 'Proactive'],
    },
  },
  {
    id: 'creative',
    name: 'Creative Partner',
    icon: '🎨',
    description: 'Imaginative collaborator',
    defaults: {
      role: 'Creative Partner',
      communicationStyle: 'creative',
      personality: ['Imaginative', 'Playful', 'Innovative'],
    },
  },
];

const COMMUNICATION_STYLES = [
  { value: 'professional', label: 'Professional - Formal and business-like' },
  { value: 'casual', label: 'Casual - Friendly and relaxed' },
  { value: 'supportive', label: 'Supportive - Encouraging and empathetic' },
  { value: 'concise', label: 'Concise - Brief and to-the-point' },
  { value: 'detailed', label: 'Detailed - Thorough and comprehensive' },
  { value: 'creative', label: 'Creative - Imaginative and expressive' },
  { value: 'socratic', label: 'Socratic - Question-based teaching' },
];

const PERSONALITY_TRAITS = [
  'Analytical', 'Creative', 'Empathetic', 'Enthusiastic', 'Helpful',
  'Humorous', 'Imaginative', 'Innovative', 'Insightful', 'Knowledgeable',
  'Methodical', 'Patient', 'Playful', 'Practical', 'Proactive',
  'Professional', 'Supportive', 'Thorough', 'Warm', 'Wise',
];

const AVATAR_OPTIONS = [
  '🤖', '👨‍💼', '👩‍💼', '🧑‍🏫', '👨‍🔬', '👩‍🎨', '🧙‍♂️', '🦸‍♀️',
  '🎯', '💡', '🚀', '⚡', '🌟', '🎨', '📚', '💻',
];

const COLOR_OPTIONS = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500',
  'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-indigo-500', 'bg-gray-700',
];

export default function CreatePersonaPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    template: '',
    name: '',
    role: '',
    expertise: '',
    communicationStyle: 'professional',
    personality: [],
    doList: '',
    dontList: '',
    avatar: '🤖',
    color: 'bg-blue-500',
  });

  const steps = [
    { id: 'template', title: 'Choose Template', icon: Sparkles },
    { id: 'basics', title: 'Basic Info', icon: User },
    { id: 'personality', title: 'Personality', icon: MessageSquare },
    { id: 'behavior', title: 'Behavior', icon: Sliders },
    { id: 'preview', title: 'Preview & Export', icon: Eye },
  ];

  const currentStep = steps[step];

  // Update form data
  const updateForm = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Toggle personality trait
  const toggleTrait = (trait) => {
    const current = formData.personality;
    if (current.includes(trait)) {
      updateForm('personality', current.filter((t) => t !== trait));
    } else if (current.length < 5) {
      updateForm('personality', [...current, trait]);
    } else {
      toast.error('Maximum 5 traits allowed');
    }
  };

  // Select template
  const selectTemplate = (template) => {
    if (template.defaults) {
      setFormData({
        ...formData,
        template: template.id,
        ...template.defaults,
      });
    } else {
      updateForm('template', template.id);
    }
    setStep(1);
  };

  // Generate the system prompt
  const generatePrompt = () => {
    const { name, role, expertise, communicationStyle, personality, doList, dontList } = formData;
    
    const styleDescriptions = {
      professional: 'Use a professional, formal tone. Be business-like and precise.',
      casual: 'Use a casual, friendly tone. Be conversational and approachable.',
      supportive: 'Use a supportive, encouraging tone. Be empathetic and positive.',
      concise: 'Be brief and to-the-point. Avoid unnecessary elaboration.',
      detailed: 'Provide thorough, comprehensive responses. Include relevant details and examples.',
      creative: 'Be imaginative and expressive. Use creative language and unique perspectives.',
      socratic: 'Use questions to guide understanding. Help the user discover answers themselves.',
    };

    let prompt = `You are ${name || 'an AI assistant'}`;
    
    if (role) {
      prompt += `, a ${role}`;
    }
    
    if (expertise) {
      prompt += ` with expertise in ${expertise}`;
    }
    
    prompt += '.\n\n';

    if (personality.length > 0) {
      prompt += `Your personality traits: ${personality.join(', ')}.\n\n`;
    }

    if (communicationStyle && styleDescriptions[communicationStyle]) {
      prompt += `Communication style: ${styleDescriptions[communicationStyle]}\n\n`;
    }

    if (doList) {
      prompt += `Guidelines - DO:\n${doList.split('\n').map(item => `- ${item.trim()}`).filter(item => item !== '- ').join('\n')}\n\n`;
    }

    if (dontList) {
      prompt += `Guidelines - DON'T:\n${dontList.split('\n').map(item => `- ${item.trim()}`).filter(item => item !== '- ').join('\n')}\n\n`;
    }

    prompt += `Always stay in character and provide helpful, relevant responses.`;

    return prompt;
  };

  // Copy prompt
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatePrompt());
      setCopied(true);
      toast.success('Persona prompt copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  // Download as text file
  const handleDownload = () => {
    const prompt = generatePrompt();
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name || 'persona'}-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  // Navigation
  const canGoNext = () => {
    switch (step) {
      case 0: return true; // Template selection happens via click
      case 1: return formData.name && formData.role;
      case 2: return formData.personality.length > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-8">
          <div className="max-w-3xl mx-auto">
            <Badge variant="primary" className="mb-4">
              <Wand2 className="w-4 h-4 mr-1" />
              Persona Creator
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your AI Persona
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Design a custom AI personality in minutes. No coding required.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((s, index) => {
                const Icon = s.icon;
                const isActive = index === step;
                const isCompleted = index < step;
                
                return (
                  <div key={s.id} className="flex items-center">
                    <button
                      onClick={() => index < step && setStep(index)}
                      disabled={index > step}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-brand-500 text-white' 
                          : isCompleted
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-pointer'
                            : 'text-gray-400 dark:text-gray-600'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm font-medium">{s.title}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 mx-2 text-gray-300 dark:text-gray-700" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 0: Template Selection */}
            {step === 0 && (
              <motion.div
                key="template"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Choose a starting point
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className="text-left"
                    >
                      <Card hover className="h-full">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{template.icon}</div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="basics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Basic Information
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Avatar & Color */}
                    <div className="flex items-start gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Avatar
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {AVATAR_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => updateForm('avatar', emoji)}
                              className={`
                                w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all
                                ${formData.avatar === emoji
                                  ? 'ring-2 ring-brand-500 bg-brand-50 dark:bg-brand-950'
                                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }
                              `}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {COLOR_OPTIONS.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateForm('color', color)}
                              className={`
                                w-8 h-8 rounded-full ${color} transition-all
                                ${formData.color === color ? 'ring-2 ring-offset-2 ring-brand-500' : ''}
                              `}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className={`w-16 h-16 rounded-xl ${formData.color} flex items-center justify-center text-3xl`}>
                        {formData.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formData.name || 'Your Persona Name'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formData.role || 'Role / Title'}
                        </p>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Persona Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => updateForm('name', e.target.value)}
                        placeholder="e.g., Strategic Business Advisor"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role / Title *
                      </label>
                      <Input
                        value={formData.role}
                        onChange={(e) => updateForm('role', e.target.value)}
                        placeholder="e.g., Senior Marketing Consultant"
                      />
                    </div>

                    {/* Expertise */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Area of Expertise
                      </label>
                      <Textarea
                        value={formData.expertise}
                        onChange={(e) => updateForm('expertise', e.target.value)}
                        placeholder="e.g., digital marketing, brand strategy, social media growth, content marketing..."
                        rows={2}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        List the specific areas this persona should be expert in
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Personality */}
            {step === 2 && (
              <motion.div
                key="personality"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Personality & Style
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Define how your persona communicates and behaves
                  </p>

                  <div className="space-y-6">
                    {/* Communication Style */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Communication Style
                      </label>
                      <Select
                        value={formData.communicationStyle}
                        onChange={(e) => updateForm('communicationStyle', e.target.value)}
                        options={COMMUNICATION_STYLES}
                      />
                    </div>

                    {/* Personality Traits */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Personality Traits (select up to 5)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PERSONALITY_TRAITS.map((trait) => {
                          const isSelected = formData.personality.includes(trait);
                          return (
                            <button
                              key={trait}
                              onClick={() => toggleTrait(trait)}
                              className={`
                                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                ${isSelected
                                  ? 'bg-brand-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }
                              `}
                            >
                              {trait}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Selected: {formData.personality.length}/5
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Behavior */}
            {step === 3 && (
              <motion.div
                key="behavior"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Behavior Guidelines
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Define specific do's and don'ts for your persona
                  </p>

                  <div className="space-y-6">
                    {/* Do List */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ✅ DO (one per line)
                      </label>
                      <Textarea
                        value={formData.doList}
                        onChange={(e) => updateForm('doList', e.target.value)}
                        placeholder={`Ask clarifying questions before diving in
Provide specific, actionable advice
Use examples and analogies
Celebrate progress and wins`}
                        rows={4}
                      />
                    </div>

                    {/* Don't List */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ❌ DON'T (one per line)
                      </label>
                      <Textarea
                        value={formData.dontList}
                        onChange={(e) => updateForm('dontList', e.target.value)}
                        placeholder={`Be condescending or dismissive
Give vague, generic advice
Overwhelm with too much information
Break character`}
                        rows={4}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Preview */}
            {step === 4 && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8">
                  {/* Persona Preview Card */}
                  <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className={`w-16 h-16 rounded-xl ${formData.color} flex items-center justify-center text-3xl flex-shrink-0`}>
                      {formData.avatar}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {formData.name || 'Your Persona'}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formData.role}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.personality.map((trait) => (
                          <Badge key={trait} variant="secondary" size="sm">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generated Prompt */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Generated System Prompt
                      </h3>
                      <Badge variant="success" size="sm">
                        <Check className="w-3 h-3 mr-1" />
                        Ready to use
                      </Badge>
                    </div>
                    <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
                      {generatePrompt()}
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
                      leftIcon={<Download className="w-5 h-5" />}
                      onClick={handleDownload}
                    >
                      Download .txt
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      leftIcon={<RefreshCw className="w-5 h-5" />}
                      onClick={() => setStep(0)}
                    >
                      Start Over
                    </Button>
                  </div>

                  {/* Usage Instructions */}
                  <div className="mt-8 p-4 bg-brand-50 dark:bg-brand-950/30 rounded-lg border border-brand-200 dark:border-brand-800">
                    <h4 className="font-medium text-brand-800 dark:text-brand-300 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      How to Use This Prompt
                    </h4>
                    <ol className="text-sm text-brand-700 dark:text-brand-400 space-y-2 list-decimal list-inside">
                      <li><strong>ChatGPT:</strong> Go to "Explore GPTs" → "Create" → Paste in "Instructions"</li>
                      <li><strong>Claude:</strong> Create a Project → Paste in "Custom Instructions"</li>
                      <li><strong>Gemini:</strong> Create a Gem → Paste in the Instructions field</li>
                      <li><strong>Any AI:</strong> Start your conversation with this prompt as context</li>
                    </ol>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {step > 0 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              {step < steps.length - 1 && (
                <Button
                  variant="primary"
                  onClick={() => setStep(step + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  disabled={!canGoNext()}
                >
                  Continue
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
