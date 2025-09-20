import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatSession, AIWorkflowState } from './types';
import { chatMemoryStore } from './memory-store';
import { TestCaseGenerationWorkflow } from './workflows';
import { storage } from '../storage';

export class ChatService {
  private workflow: TestCaseGenerationWorkflow;

  constructor(geminiApiKey: string) {
    this.workflow = new TestCaseGenerationWorkflow(geminiApiKey);
  }

  async createChatSession(requirementId: string): Promise<string> {
    const sessionId = uuidv4();
    const requirement = await storage.getRequirement(requirementId);
    
    if (!requirement) {
      throw new Error('Requirement not found');
    }

    await chatMemoryStore.createSession(sessionId, requirementId, requirement);
    return sessionId;
  }

  async sendMessage(sessionId: string, userMessage: string): Promise<ChatMessage> {
    const session = await chatMemoryStore.getSession(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Add user message to session
    const userChatMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    await chatMemoryStore.addMessage(sessionId, userChatMessage);

    // Process with AI workflow
    const compiledWorkflow = this.workflow.createWorkflow();
    
    const initialState: AIWorkflowState = {
      sessionId,
      requirementId: session.requirementId,
      userMessage,
      requirement: session.context.requirement,
      complianceStandards: [],
      generatedTestCases: [],
      complianceValidations: [],
      currentStep: 'analyze',
      iterations: 0,
      maxIterations: 2
    };

    try {
      const result = await compiledWorkflow.invoke(initialState);
      
      // Create AI response message
      const aiResponse: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: this.formatAIResponse(result),
        timestamp: new Date(),
        metadata: {
          requirementId: session.requirementId,
          generatedTestCases: result.generatedTestCases,
          complianceValidation: result.complianceValidations
        }
      };

      await chatMemoryStore.addMessage(sessionId, aiResponse);

      // Update session context
      await chatMemoryStore.updateSession(sessionId, {
        context: {
          ...session.context,
          generatedTestCases: result.generatedTestCases,
          complianceValidations: result.complianceValidations
        }
      });

      // Save generated test cases to database
      if (result.generatedTestCases && result.generatedTestCases.length > 0) {
        for (const testCase of result.generatedTestCases) {
          await storage.createTestCase({
            requirementId: session.requirementId,
            title: testCase.title,
            description: testCase.description,
            steps: testCase.steps,
            priority: testCase.priority,
            complianceChecks: testCase.complianceChecks,
            aiGenerated: true,
            reviewed: false
          });
        }
      }

      return aiResponse;
    } catch (error) {
      console.error('Error in AI workflow:', error);
      
      const errorResponse: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while generating test cases. Please try again or rephrase your request.',
        timestamp: new Date()
      };

      await chatMemoryStore.addMessage(sessionId, errorResponse);
      return errorResponse;
    }
  }

  private formatAIResponse(result: AIWorkflowState): string {
    const { generatedTestCases, complianceValidations } = result;
    
    let response = "I've analyzed the requirement and generated compliant test cases. Here's what I've created:\n\n";
    
    if (generatedTestCases && generatedTestCases.length > 0) {
      response += `**Generated ${generatedTestCases.length} Test Cases:**\n\n`;
      
      generatedTestCases.forEach((testCase, index) => {
        response += `**${index + 1}. ${testCase.title}** (${testCase.priority} Priority)\n`;
        response += `${testCase.description}\n\n`;
        
        if (testCase.steps && testCase.steps.length > 0) {
          response += "**Test Steps:**\n";
          testCase.steps.forEach((step, stepIndex) => {
            response += `${stepIndex + 1}. ${step.step}\n`;
            response += `   *Expected:* ${step.expectedResult}\n`;
          });
          response += "\n";
        }
        
        if (testCase.complianceChecks && testCase.complianceChecks.length > 0) {
          response += `**Compliance:** ${testCase.complianceChecks.join(', ')}\n\n`;
        }
      });
    }

    if (complianceValidations && complianceValidations.length > 0) {
      response += "**Compliance Validation Results:**\n\n";
      
      complianceValidations.forEach(validation => {
        const statusEmoji = validation.status === 'compliant' ? '✅' : 
                           validation.status === 'non-compliant' ? '❌' : '⚠️';
        response += `${statusEmoji} **${validation.standard}**: ${validation.status}\n`;
        
        if (validation.findings && validation.findings.length > 0) {
          validation.findings.forEach(finding => {
            const severityEmoji = finding.severity === 'high' ? '🔴' : 
                                 finding.severity === 'medium' ? '🟡' : '🟢';
            response += `  ${severityEmoji} ${finding.issue}\n`;
            response += `     *Recommendation:* ${finding.recommendation}\n`;
          });
        }
        response += "\n";
      });
    }

    response += "The test cases have been saved and are ready for review. You can export them or request modifications if needed.";
    
    return response;
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const session = await chatMemoryStore.getSession(sessionId);
    return session?.messages || [];
  }

  async getSessionsByRequirement(requirementId: string): Promise<ChatSession[]> {
    return await chatMemoryStore.getSessionsByRequirement(requirementId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await chatMemoryStore.deleteSession(sessionId);
  }
}