'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Plus,
  Play,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Trash2,
  GripVertical,
  Settings,
  Zap,
  FileText,
  MessageSquare,
  Code,
  Search,
  Database,
  Send,
  Bot,
  Lightbulb,
} from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge, EmptyState } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// ============================================
// AGENTS PAGE - Multi-Step Workflow Builder
// ============================================

// Pre-built agent templates
const AGENT_TEMPLATES = [
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Multi-step research workflow that gathers, analyzes, and summarizes information',
    icon: Search,
    color: 'bg-blue-500',
    steps: [
      { type: 'prompt', name: 'Define Research Question', content: 'Clarify and refine the research question: {{input}}' },
      { type: 'prompt', name: 'Gather Information', content: 'List key sources and information to research about: {{previous}}' },
      { type: 'prompt', name: 'Analyze Findings', content: 'Analyze the gathered information and identify key insights from: {{previous}}' },
      { type: 'prompt', name: 'Synthesize Report', content: 'Create a comprehensive summary report based on: {{previous}}' },
    ],
  },
  {
    id: 'content',
    name: 'Content Creation Agent',
    description: 'Structured workflow for creating high-quality content',
    icon: FileText,
    color: 'bg-purple-500',
    steps: [
      { type: 'prompt', name: 'Outline Creation', content: 'Create a detailed outline for content about: {{input}}' },
      { type: 'prompt', name: 'Draft Writing', content: 'Write a first draft based on this outline: {{previous}}' },
      { type: 'prompt', name: 'Edit & Refine', content: 'Edit and improve this draft for clarity and engagement: {{previous}}' },
      { type: 'prompt', name: 'Final Polish', content: 'Do a final polish, check for errors, and optimize: {{previous}}' },
    ],
  },
  {
    id: 'code',
    name: 'Code Assistant Agent',
    description: 'Step-by-step coding workflow from requirements to implementation',
    icon: Code,
    color: 'bg-green-500',
    steps: [
      { type: 'prompt', name: 'Requirements Analysis', content: 'Analyze these requirements and identify technical needs: {{input}}' },
      { type: 'prompt', name: 'Architecture Design', content: 'Design the architecture and structure for: {{previous}}' },
      { type: 'prompt', name: 'Implementation', content: 'Write the code implementation based on: {{previous}}' },
      { type: 'prompt', name: 'Review & Test', content: 'Review code quality and suggest tests for: {{previous}}' },
    ],
  },
  {
    id: 'analysis',
    name: 'Data Analysis Agent',
    description: 'Systematic approach to analyzing and interpreting data',
    icon: Database,
    color: 'bg-amber-500',
    steps: [
      { type: 'prompt', name: 'Data Understanding', content: 'Understand and describe this data: {{input}}' },
      { type: 'prompt', name: 'Pattern Analysis', content: 'Identify patterns and trends in: {{previous}}' },
      { type: 'prompt', name: 'Insight Generation', content: 'Generate actionable insights from: {{previous}}' },
      { type: 'prompt', name: 'Recommendations', content: 'Provide recommendations based on: {{previous}}' },
    ],
  },
];

// Step types available
const STEP_TYPES = [
  { value: 'prompt', label: 'AI Prompt', icon: MessageSquare, description: 'Send a prompt to the AI' },
  { value: 'transform', label: 'Transform', icon: Zap, description: 'Transform or format data' },
  { value: 'condition', label: 'Condition', icon: Settings, description: 'Add conditional logic' },
];

export default function AgentsPage() {
  const [view, setView] = useState('templates'); // 'templates' | 'builder'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    steps: [],
  });
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Select a template
  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setWorkflow({
      name: template.name,
      description: template.description,
      steps: template.steps.map((step, index) => ({
        ...step,
        id: `step-${index}`,
      })),
    });
    setView('builder');
  };

  // Start from scratch
  const startFromScratch = () => {
    setSelectedTemplate(null);
    setWorkflow({
      name: 'My Custom Agent',
      description: 'A custom multi-step workflow',
      steps: [
        { id: 'step-0', type: 'prompt', name: 'Step 1', content: '{{input}}' },
      ],
    });
    setView('builder');
  };

  // Add a step
  const addStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      type: 'prompt',
      name: `Step ${workflow.steps.length + 1}`,
      content: '{{previous}}',
    };
    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, newStep],
    });
  };

  // Update a step
  const updateStep = (stepId, field, value) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      ),
    });
  };

  // Remove a step
  const removeStep = (stepId) => {
    if (workflow.steps.length <= 1) {
      toast.error('Workflow must have at least one step');
      return;
    }
    setWorkflow({
      ...workflow,
      steps: workflow.steps.filter((step) => step.id !== stepId),
    });
  };

  // Simulate running the workflow
  const runWorkflow = async () => {
    if (!testInput.trim()) {
      toast.error('Please enter test input');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    // Simulate step-by-step execution
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      // Add "running" state
      setTestResults((prev) => [
        ...prev,
        { stepId: step.id, status: 'running', output: '' },
      ]);

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate mock output
      const previousOutput = i > 0 ? testResults[i - 1]?.output : testInput;
      const mockOutput = `[Output from "${step.name}"]\n\nBased on the input: "${i === 0 ? testInput : 'previous step output'}"\n\nThis is a simulated response that would come from the AI. In a real implementation, this would be the actual AI response based on the step's prompt.`;

      // Update with completed state
      setTestResults((prev) =>
        prev.map((result) =>
          result.stepId === step.id
            ? { ...result, status: 'completed', output: mockOutput }
            : result
        )
      );
    }

    setIsRunning(false);
    toast.success('Workflow completed!');
  };

  // Copy workflow as JSON
  const copyWorkflow = async () => {
    const workflowJson = JSON.stringify(workflow, null, 2);
    await navigator.clipboard.writeText(workflowJson);
    toast.success('Workflow copied as JSON!');
  };

  // Generate prompt chain
  const generatePromptChain = () => {
    let chain = `# ${workflow.name}\n\n${workflow.description}\n\n---\n\n`;
    
    workflow.steps.forEach((step, index) => {
      chain += `## Step ${index + 1}: ${step.name}\n\n`;
      chain += `\`\`\`\n${step.content}\n\`\`\`\n\n`;
    });

    chain += `---\n\nUsage: Start with Step 1 using your input. Each subsequent step uses the output from the previous step as {{previous}}.`;
    
    return chain;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 via-brand-600 to-purple-600">
        <div className="container-custom py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
                <Workflow className="w-4 h-4 mr-1" />
                Agent Workflows
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Multi-Step AI Agents
              </h1>
              <p className="text-lg text-white/80 max-w-2xl">
                Build complex workflows that chain multiple AI steps together.
                Perfect for research, content creation, analysis, and more.
              </p>
            </div>
            {view === 'builder' && (
              <Button
                variant="secondary"
                className="bg-white text-brand-600 hover:bg-gray-100"
                onClick={() => setView('templates')}
              >
                Back to Templates
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <AnimatePresence mode="wait">
          {/* Templates View */}
          {view === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Start from Scratch */}
              <div className="mb-8">
                <button onClick={startFromScratch} className="w-full text-left">
                  <Card hover className="border-2 border-dashed border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-950/20">
                    <div className="flex items-center gap-4 py-4">
                      <div className="w-14 h-14 rounded-xl bg-brand-500 flex items-center justify-center">
                        <Plus className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Create Custom Agent
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Build a workflow from scratch with your own steps
                        </p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 ml-auto" />
                    </div>
                  </Card>
                </button>
              </div>

              {/* Template Grid */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Pre-Built Agent Templates
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {AGENT_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <motion.button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className="text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card hover className="h-full">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl ${template.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" size="sm">
                                {template.steps.length} steps
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </Card>
                    </motion.button>
                  );
                })}
              </div>

              {/* Info Section */}
              <Card className="mt-12 bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-950/30 dark:to-accent-950/30 border-brand-200 dark:border-brand-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      What are AI Agent Workflows?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Agent workflows chain multiple AI prompts together, where each step builds on the previous one.
                      This allows you to break complex tasks into manageable steps for better results.
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Break complex tasks into simple steps
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Each step refines and builds on previous output
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Consistent, reproducible results
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Builder View */}
          {view === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Workflow Builder */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Workflow Info */}
                  <Card>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${selectedTemplate?.color || 'bg-brand-500'} flex items-center justify-center`}>
                        <Workflow className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={workflow.name}
                          onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                          className="text-lg font-semibold border-none p-0 h-auto focus:ring-0"
                          placeholder="Workflow Name"
                        />
                        <Input
                          value={workflow.description}
                          onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                          className="text-sm text-gray-500 border-none p-0 h-auto focus:ring-0 mt-1"
                          placeholder="Description"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Steps */}
                  <div className="space-y-4">
                    {workflow.steps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <StepCard
                          step={step}
                          index={index}
                          isLast={index === workflow.steps.length - 1}
                          onUpdate={(field, value) => updateStep(step.id, field, value)}
                          onRemove={() => removeStep(step.id)}
                          testResult={testResults.find((r) => r.stepId === step.id)}
                        />
                      </motion.div>
                    ))}

                    {/* Add Step Button */}
                    <button
                      onClick={addStep}
                      className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-brand-500 dark:hover:border-brand-500 transition-colors flex items-center justify-center gap-2 text-gray-500 hover:text-brand-600"
                    >
                      <Plus className="w-5 h-5" />
                      Add Step
                    </button>
                  </div>
                </div>

                {/* Sidebar - Test & Export */}
                <div className="space-y-6">
                  {/* Test Workflow */}
                  <Card>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-green-500" />
                      Test Workflow
                    </h3>
                    <Textarea
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder="Enter test input to run through the workflow..."
                      rows={4}
                      className="mb-4"
                    />
                    <Button
                      variant="primary"
                      className="w-full"
                      leftIcon={isRunning ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      onClick={runWorkflow}
                      disabled={isRunning}
                    >
                      {isRunning ? 'Running...' : 'Run Test'}
                    </Button>
                  </Card>

                  {/* Export Options */}
                  <Card>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Send className="w-5 h-5 text-brand-500" />
                      Export Workflow
                    </h3>
                    <div className="space-y-3">
                      <Button
                        variant="secondary"
                        className="w-full"
                        leftIcon={<Copy className="w-4 h-4" />}
                        onClick={copyWorkflow}
                      >
                        Copy as JSON
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full"
                        leftIcon={<FileText className="w-4 h-4" />}
                        onClick={async () => {
                          await navigator.clipboard.writeText(generatePromptChain());
                          toast.success('Prompt chain copied!');
                        }}
                      >
                        Copy as Prompt Chain
                      </Button>
                    </div>
                  </Card>

                  {/* Instructions */}
                  <Card className="bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Variables
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li>
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{input}}'}</code>
                        <span className="ml-2">Original input</span>
                      </li>
                      <li>
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{previous}}'}</code>
                        <span className="ml-2">Previous step output</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// STEP CARD COMPONENT
// ============================================

function StepCard({ step, index, isLast, onUpdate, onRemove, testResult }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className={`relative ${testResult?.status === 'running' ? 'ring-2 ring-brand-500' : ''}`}>
      {/* Connection Line */}
      {!isLast && (
        <div className="absolute left-8 -bottom-4 w-0.5 h-8 bg-gray-300 dark:bg-gray-700 z-0" />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-bold">
          {index + 1}
        </div>
        <Input
          value={step.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          className="font-semibold border-none p-0 h-auto focus:ring-0 flex-1"
          placeholder="Step name"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Textarea
              value={step.content}
              onChange={(e) => onUpdate('content', e.target.value)}
              placeholder="Enter the prompt for this step. Use {{input}} for original input or {{previous}} for previous step output."
              rows={3}
              className="font-mono text-sm"
            />

            {/* Test Result */}
            {testResult && (
              <div className={`mt-4 p-3 rounded-lg ${
                testResult.status === 'running'
                  ? 'bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800'
                  : 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.status === 'running' ? (
                    <>
                      <Sparkles className="w-4 h-4 text-brand-500 animate-spin" />
                      <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                        Running...
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        Completed
                      </span>
                    </>
                  )}
                </div>
                {testResult.output && (
                  <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {testResult.output}
                  </pre>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
