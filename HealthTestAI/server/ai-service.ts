import { GoogleGenerativeAI } from '@google/genai';
import type { Requirement, InsertTestCase, InsertComplianceReport } from '@shared/schema';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface GeneratedTestCase {
  title: string;
  description: string;
  steps: Array<{step: string, expectedResult: string}>;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  compliance_checks: string[];
}

export async function generateTestCases(requirement: Requirement): Promise<GeneratedTestCase[]> {
  try {
    const prompt = `
You are an expert healthcare software QA engineer. Generate comprehensive test cases for the following healthcare software requirement:

**Requirement Details:**
- JIRA Key: ${requirement.jira_key}
- Title: ${requirement.title}
- Description: ${requirement.description}
- Priority: ${requirement.priority}
- Compliance Standards: ${requirement.compliance_standards.join(', ')}

**Instructions:**
1. Generate 3-5 detailed test cases that thoroughly cover this requirement
2. Each test case should include specific steps and expected results
3. Consider security, compliance, and healthcare-specific edge cases
4. Include appropriate compliance checks based on the standards listed
5. Prioritize test cases based on risk and criticality

**Output Format (JSON):**
Return a JSON array of test cases with this exact structure:
[
  {
    "title": "Test case title",
    "description": "Detailed description of what this test validates",
    "steps": [
      {"step": "Step 1 description", "expectedResult": "Expected outcome"},
      {"step": "Step 2 description", "expectedResult": "Expected outcome"}
    ],
    "priority": "Critical|High|Medium|Low",
    "compliance_checks": ["Standard 1", "Standard 2"]
  }
]

Focus on healthcare-specific scenarios, security considerations, and regulatory compliance.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }
    
    const testCases = JSON.parse(jsonMatch[0]) as GeneratedTestCase[];
    
    // Validate and ensure compliance with our schema
    return testCases.map(tc => ({
      ...tc,
      priority: validatePriority(tc.priority),
      compliance_checks: tc.compliance_checks || requirement.compliance_standards
    }));
    
  } catch (error) {
    console.error('Error generating test cases:', error);
    
    // Fallback: Return basic test cases if AI fails
    return generateFallbackTestCases(requirement);
  }
}

export async function generateComplianceReport(
  requirementId?: string, 
  testCaseId?: string, 
  standard?: string
): Promise<Omit<InsertComplianceReport, 'created_at'>> {
  try {
    const prompt = `
You are a healthcare compliance expert. Generate a compliance analysis report for:
- Requirement ID: ${requirementId || 'N/A'}
- Test Case ID: ${testCaseId || 'N/A'}
- Compliance Standard: ${standard || 'General Healthcare Compliance'}

**Instructions:**
1. Analyze compliance status against the specified standard
2. Identify any potential issues or gaps
3. Provide specific findings with severity levels
4. Determine overall compliance status

**Output Format (JSON):**
{
  "standard": "${standard || 'FDA'}",
  "status": "compliant|non-compliant|review-needed",
  "findings": [
    {"issue": "Description of finding", "severity": "high|medium|low"}
  ]
}

Focus on healthcare regulations, data privacy, and patient safety requirements.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }
    
    const report = JSON.parse(jsonMatch[0]);
    
    return {
      requirement_id: requirementId,
      test_case_id: testCaseId,
      standard: report.standard,
      status: report.status,
      findings: report.findings || []
    };
    
  } catch (error) {
    console.error('Error generating compliance report:', error);
    
    // Fallback: Return basic compliance report
    return {
      requirement_id: requirementId,
      test_case_id: testCaseId,
      standard: standard || 'FDA',
      status: 'review-needed' as const,
      findings: [
        {
          issue: 'Automated compliance analysis unavailable. Manual review required.',
          severity: 'medium'
        }
      ]
    };
  }
}

function validatePriority(priority: string): 'Critical' | 'High' | 'Medium' | 'Low' {
  const validPriorities = ['Critical', 'High', 'Medium', 'Low'] as const;
  return validPriorities.includes(priority as any) ? priority as any : 'Medium';
}

function generateFallbackTestCases(requirement: Requirement): GeneratedTestCase[] {
  return [
    {
      title: `Basic Functionality Test - ${requirement.title}`,
      description: `Verify that ${requirement.title.toLowerCase()} functions according to the basic requirements`,
      steps: [
        {
          step: "Navigate to the relevant system component",
          expectedResult: "Component loads successfully"
        },
        {
          step: "Execute the primary function described in the requirement",
          expectedResult: "Function executes without errors"
        },
        {
          step: "Verify the output meets the specified criteria",
          expectedResult: "Output matches expected results"
        }
      ],
      priority: requirement.priority as any || 'Medium',
      compliance_checks: requirement.compliance_standards
    },
    {
      title: `Security Test - ${requirement.title}`,
      description: `Verify security aspects and data protection for ${requirement.title.toLowerCase()}`,
      steps: [
        {
          step: "Attempt unauthorized access to the functionality",
          expectedResult: "Access is properly restricted"
        },
        {
          step: "Verify data encryption and secure transmission",
          expectedResult: "All data is properly encrypted"
        },
        {
          step: "Test input validation and sanitization",
          expectedResult: "Invalid inputs are rejected securely"
        }
      ],
      priority: 'High',
      compliance_checks: requirement.compliance_standards
    }
  ];
}

export async function generateChatResponse(message: string, context?: any): Promise<string> {
  try {
    const prompt = `
You are a healthcare software testing expert assistant. Help users with:
- Test case generation and optimization
- Healthcare compliance requirements
- Security testing strategies
- Regulatory standards (FDA, ISO, IEC, etc.)

User message: ${message}
${context ? `Context: ${JSON.stringify(context)}` : ''}

Provide a helpful, expert response focused on healthcare software testing and compliance.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.';
  }
}