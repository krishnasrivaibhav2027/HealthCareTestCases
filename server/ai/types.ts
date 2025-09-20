export interface TestCaseStep {
  step: string;
  expectedResult: string;
}

export interface GeneratedTestCase {
  id: string;
  title: string;
  description: string;
  steps: TestCaseStep[];
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  complianceChecks: string[];
  aiGenerated: boolean;
  reviewed: boolean;
}

export interface ComplianceStandard {
  name: string;
  requirements: string[];
  validationRules: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    requirementId?: string;
    generatedTestCases?: GeneratedTestCase[];
    complianceValidation?: ComplianceValidationResult[];
  };
}

export interface ComplianceValidationResult {
  standard: string;
  status: 'compliant' | 'non-compliant' | 'review-needed';
  findings: Array<{
    issue: string;
    severity: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
}

export interface ChatSession {
  id: string;
  requirementId: string;
  messages: ChatMessage[];
  context: {
    requirement: {
      jiraKey: string;
      title: string;
      description: string;
      complianceStandards: string[];
    };
    generatedTestCases: GeneratedTestCase[];
    complianceValidations: ComplianceValidationResult[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AIWorkflowState {
  sessionId: string;
  requirementId: string;
  userMessage: string;
  requirement: any;
  complianceStandards: ComplianceStandard[];
  generatedTestCases: GeneratedTestCase[];
  complianceValidations: ComplianceValidationResult[];
  currentStep: 'analyze' | 'generate' | 'validate' | 'refine' | 'complete';
  iterations: number;
  maxIterations: number;
}