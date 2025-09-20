import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AIWorkflowState, GeneratedTestCase, ComplianceValidationResult } from './types';
import { getComplianceStandards, generateCompliancePrompt } from './compliance-standards';
import { v4 as uuidv4 } from 'uuid';

export class TestCaseGenerationWorkflow {
  private model: ChatGoogleGenerativeAI;

  constructor(apiKey: string) {
    this.model = new ChatGoogleGenerativeAI({
      apiKey,
      modelName: "gemini-1.5-pro",
      temperature: 0.3,
    });
  }

  private async analyzeRequirement(state: AIWorkflowState): Promise<Partial<AIWorkflowState>> {
    const { requirement, userMessage } = state;
    
    const complianceStandards = getComplianceStandards(requirement.complianceStandards || []);
    const compliancePrompt = generateCompliancePrompt(complianceStandards);

    const systemPrompt = `
You are an expert healthcare software test case analyst. Analyze the given requirement and user request to understand what type of test cases need to be generated.

${compliancePrompt}

Requirement Details:
- Jira Key: ${requirement.jiraKey}
- Title: ${requirement.title}
- Description: ${requirement.description}
- Compliance Standards: ${requirement.complianceStandards?.join(', ') || 'None specified'}

User Request: ${userMessage}

Analyze the requirement and determine:
1. Key functional areas to test
2. Compliance requirements that must be addressed
3. Risk areas that need thorough testing
4. Integration points that require validation

Respond with a structured analysis in JSON format.
`;

    const response = await this.model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage("Please analyze this requirement for test case generation.")
    ]);

    return {
      ...state,
      complianceStandards,
      currentStep: 'generate'
    };
  }

  private async generateTestCases(state: AIWorkflowState): Promise<Partial<AIWorkflowState>> {
    const { requirement, complianceStandards, userMessage } = state;

    const compliancePrompt = generateCompliancePrompt(complianceStandards);

    const systemPrompt = `
You are an expert healthcare software test case generator. Generate comprehensive test cases for the given requirement that ensure compliance with healthcare standards.

${compliancePrompt}

Requirement Details:
- Jira Key: ${requirement.jiraKey}
- Title: ${requirement.title}
- Description: ${requirement.description}

User Request: ${userMessage}

Generate 3-8 test cases that:
1. Cover all functional aspects of the requirement
2. Address compliance requirements for each applicable standard
3. Include both positive and negative test scenarios
4. Provide clear, actionable test steps
5. Specify expected results for each step
6. Assign appropriate priority levels (Critical, High, Medium, Low)

For each test case, provide:
- Title: Clear, descriptive title
- Description: Brief description of what the test validates
- Steps: Array of test steps with expected results
- Priority: Based on risk and compliance impact
- ComplianceChecks: Array of compliance standards this test addresses

Return the response as a JSON array of test cases.
`;

    const response = await this.model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage("Generate comprehensive test cases for this requirement.")
    ]);

    let generatedTestCases: GeneratedTestCase[] = [];
    
    try {
      const content = response.content as string;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedTestCases = JSON.parse(jsonMatch[0]);
        generatedTestCases = parsedTestCases.map((tc: any) => ({
          id: uuidv4(),
          title: tc.title || 'Generated Test Case',
          description: tc.description || '',
          steps: tc.steps || [],
          priority: tc.priority || 'Medium',
          complianceChecks: tc.complianceChecks || [],
          aiGenerated: true,
          reviewed: false
        }));
      }
    } catch (error) {
      console.error('Error parsing generated test cases:', error);
      // Fallback: create a basic test case
      generatedTestCases = [{
        id: uuidv4(),
        title: `Test Case for ${requirement.title}`,
        description: `Validate functionality described in ${requirement.jiraKey}`,
        steps: [
          {
            step: "Execute the functionality described in the requirement",
            expectedResult: "System behaves as specified in the requirement"
          }
        ],
        priority: 'High',
        complianceChecks: requirement.complianceStandards || [],
        aiGenerated: true,
        reviewed: false
      }];
    }

    return {
      ...state,
      generatedTestCases,
      currentStep: 'validate'
    };
  }

  private async validateCompliance(state: AIWorkflowState): Promise<Partial<AIWorkflowState>> {
    const { generatedTestCases, complianceStandards } = state;

    const validationPromises = complianceStandards.map(async (standard) => {
      const systemPrompt = `
You are a compliance validation expert for ${standard.name}. 

Review the generated test cases and validate their compliance with ${standard.name} requirements:

Requirements: ${standard.requirements.join(', ')}
Validation Rules: ${standard.validationRules.join(', ')}

Test Cases to Review:
${generatedTestCases.map(tc => `
Title: ${tc.title}
Description: ${tc.description}
Steps: ${tc.steps.map(s => s.step).join('; ')}
`).join('\n')}

Provide a compliance validation result with:
1. Overall compliance status (compliant, non-compliant, review-needed)
2. Specific findings with severity levels
3. Recommendations for improvement

Return as JSON format.
`;

      const response = await this.model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage("Validate compliance of these test cases.")
      ]);

      try {
        const content = response.content as string;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const validation = JSON.parse(jsonMatch[0]);
          return {
            standard: standard.name,
            status: validation.status || 'review-needed',
            findings: validation.findings || []
          } as ComplianceValidationResult;
        }
      } catch (error) {
        console.error(`Error parsing compliance validation for ${standard.name}:`, error);
      }

      return {
        standard: standard.name,
        status: 'review-needed' as const,
        findings: [{
          issue: 'Automated validation could not be completed',
          severity: 'medium' as const,
          recommendation: 'Manual review required'
        }]
      };
    });

    const complianceValidations = await Promise.all(validationPromises);

    return {
      ...state,
      complianceValidations,
      currentStep: 'complete'
    };
  }

  private async shouldRefine(state: AIWorkflowState): Promise<string> {
    const { complianceValidations, iterations, maxIterations } = state;
    
    if (iterations >= maxIterations) {
      return 'complete';
    }

    const hasNonCompliant = complianceValidations.some(v => v.status === 'non-compliant');
    const hasHighSeverityFindings = complianceValidations.some(v => 
      v.findings.some(f => f.severity === 'high')
    );

    if (hasNonCompliant || hasHighSeverityFindings) {
      return 'refine';
    }

    return 'complete';
  }

  private async refineTestCases(state: AIWorkflowState): Promise<Partial<AIWorkflowState>> {
    const { generatedTestCases, complianceValidations, complianceStandards } = state;

    const issues = complianceValidations.flatMap(v => 
      v.findings.filter(f => f.severity === 'high' || v.status === 'non-compliant')
    );

    const systemPrompt = `
You are an expert test case refinement specialist. Improve the existing test cases based on compliance validation feedback.

Current Test Cases:
${generatedTestCases.map(tc => `
ID: ${tc.id}
Title: ${tc.title}
Description: ${tc.description}
Steps: ${tc.steps.map(s => `${s.step} -> ${s.expectedResult}`).join('; ')}
`).join('\n')}

Compliance Issues to Address:
${issues.map(issue => `
Issue: ${issue.issue}
Severity: ${issue.severity}
Recommendation: ${issue.recommendation}
`).join('\n')}

Refine the test cases to address these issues. Return the improved test cases as a JSON array.
`;

    const response = await this.model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage("Refine these test cases to address the compliance issues.")
    ]);

    let refinedTestCases = generatedTestCases;

    try {
      const content = response.content as string;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedTestCases = JSON.parse(jsonMatch[0]);
        refinedTestCases = parsedTestCases.map((tc: any, index: number) => ({
          id: generatedTestCases[index]?.id || uuidv4(),
          title: tc.title || generatedTestCases[index]?.title || 'Refined Test Case',
          description: tc.description || generatedTestCases[index]?.description || '',
          steps: tc.steps || generatedTestCases[index]?.steps || [],
          priority: tc.priority || generatedTestCases[index]?.priority || 'Medium',
          complianceChecks: tc.complianceChecks || generatedTestCases[index]?.complianceChecks || [],
          aiGenerated: true,
          reviewed: false
        }));
      }
    } catch (error) {
      console.error('Error parsing refined test cases:', error);
    }

    return {
      ...state,
      generatedTestCases: refinedTestCases,
      iterations: state.iterations + 1,
      currentStep: 'validate'
    };
  }

  public createWorkflow() {
    const workflow = new StateGraph<AIWorkflowState>({
      channels: {
        sessionId: null,
        requirementId: null,
        userMessage: null,
        requirement: null,
        complianceStandards: null,
        generatedTestCases: null,
        complianceValidations: null,
        currentStep: null,
        iterations: null,
        maxIterations: null,
      }
    });

    workflow.addNode("analyze", this.analyzeRequirement.bind(this));
    workflow.addNode("generate", this.generateTestCases.bind(this));
    workflow.addNode("validate", this.validateCompliance.bind(this));
    workflow.addNode("refine", this.refineTestCases.bind(this));

    workflow.addEdge(START, "analyze");
    workflow.addEdge("analyze", "generate");
    workflow.addEdge("generate", "validate");
    workflow.addConditionalEdges(
      "validate",
      this.shouldRefine.bind(this),
      {
        "refine": "refine",
        "complete": END
      }
    );
    workflow.addEdge("refine", "validate");

    return workflow.compile();
  }
}