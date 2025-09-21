import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertRequirementSchema, 
  insertTestCaseSchema, 
  insertComplianceReportSchema 
} from "@shared/schema";
import { generateTestCases, generateComplianceReport } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Requirements endpoints
  app.get("/api/requirements", async (req: Request, res: Response) => {
    try {
      const requirements = await storage.getAllRequirements();
      res.json(requirements);
    } catch (error) {
      console.error("Error fetching requirements:", error);
      res.status(500).json({ error: "Failed to fetch requirements" });
    }
  });

  app.get("/api/requirements/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const requirement = await storage.getRequirement(id);
      if (!requirement) {
        return res.status(404).json({ error: "Requirement not found" });
      }
      res.json(requirement);
    } catch (error) {
      console.error("Error fetching requirement:", error);
      res.status(500).json({ error: "Failed to fetch requirement" });
    }
  });

  app.post("/api/requirements", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRequirementSchema.parse(req.body);
      const requirement = await storage.createRequirement(validatedData);
      res.status(201).json(requirement);
    } catch (error) {
      console.error("Error creating requirement:", error);
      res.status(400).json({ error: "Invalid requirement data" });
    }
  });

  app.put("/api/requirements/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertRequirementSchema.partial().parse(req.body);
      const requirement = await storage.updateRequirement(id, validatedData);
      res.json(requirement);
    } catch (error) {
      console.error("Error updating requirement:", error);
      res.status(400).json({ error: "Failed to update requirement" });
    }
  });

  // Test Cases endpoints
  app.get("/api/test-cases", async (req: Request, res: Response) => {
    try {
      const testCases = await storage.getAllTestCases();
      res.json(testCases);
    } catch (error) {
      console.error("Error fetching test cases:", error);
      res.status(500).json({ error: "Failed to fetch test cases" });
    }
  });

  app.get("/api/test-cases/requirement/:requirementId", async (req: Request, res: Response) => {
    try {
      const { requirementId } = req.params;
      const testCases = await storage.getTestCasesByRequirement(requirementId);
      res.json(testCases);
    } catch (error) {
      console.error("Error fetching test cases:", error);
      res.status(500).json({ error: "Failed to fetch test cases" });
    }
  });

  app.get("/api/test-cases/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const testCase = await storage.getTestCase(id);
      if (!testCase) {
        return res.status(404).json({ error: "Test case not found" });
      }
      res.json(testCase);
    } catch (error) {
      console.error("Error fetching test case:", error);
      res.status(500).json({ error: "Failed to fetch test case" });
    }
  });

  app.post("/api/test-cases", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTestCaseSchema.parse(req.body);
      const testCase = await storage.createTestCase(validatedData);
      res.status(201).json(testCase);
    } catch (error) {
      console.error("Error creating test case:", error);
      res.status(400).json({ error: "Invalid test case data" });
    }
  });

  app.put("/api/test-cases/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertTestCaseSchema.partial().parse(req.body);
      const testCase = await storage.updateTestCase(id, validatedData);
      res.json(testCase);
    } catch (error) {
      console.error("Error updating test case:", error);
      res.status(400).json({ error: "Failed to update test case" });
    }
  });

  // AI Generation endpoints
  app.post("/api/ai/generate-test-cases", async (req: Request, res: Response) => {
    try {
      const { requirementId } = req.body;
      if (!requirementId) {
        return res.status(400).json({ error: "Requirement ID is required" });
      }
      
      const requirement = await storage.getRequirement(requirementId);
      if (!requirement) {
        return res.status(404).json({ error: "Requirement not found" });
      }

      const testCases = await generateTestCases(requirement);
      
      // Save generated test cases to database
      const savedTestCases = [];
      for (const testCase of testCases) {
        const saved = await storage.createTestCase({
          ...testCase,
          requirement_id: requirementId,
          ai_generated: true
        });
        savedTestCases.push(saved);
      }
      
      res.json({ testCases: savedTestCases });
    } catch (error) {
      console.error("Error generating test cases:", error);
      res.status(500).json({ error: "Failed to generate test cases" });
    }
  });

  app.post("/api/ai/generate-compliance-report", async (req: Request, res: Response) => {
    try {
      const { requirementId, testCaseId, standard } = req.body;
      
      if (!requirementId && !testCaseId) {
        return res.status(400).json({ error: "Either requirement ID or test case ID is required" });
      }

      const report = await generateComplianceReport(requirementId, testCaseId, standard);
      const savedReport = await storage.createComplianceReport(report);
      
      res.json({ report: savedReport });
    } catch (error) {
      console.error("Error generating compliance report:", error);
      res.status(500).json({ error: "Failed to generate compliance report" });
    }
  });

  // Compliance Reports endpoints
  app.get("/api/compliance/reports", async (req: Request, res: Response) => {
    try {
      const { requirementId } = req.query;
      let reports;
      
      if (requirementId) {
        reports = await storage.getComplianceReportsByRequirement(requirementId as string);
      } else {
        // If no specific query, get all reports (you might want to implement this in storage)
        reports = [];
      }
      
      res.json(reports);
    } catch (error) {
      console.error("Error fetching compliance reports:", error);
      res.status(500).json({ error: "Failed to fetch compliance reports" });
    }
  });

  app.get("/api/compliance/reports/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const report = await storage.getComplianceReport(id);
      if (!report) {
        return res.status(404).json({ error: "Compliance report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching compliance report:", error);
      res.status(500).json({ error: "Failed to fetch compliance report" });
    }
  });

  // Chat/Session endpoints for AI interaction
  app.post("/api/chat/sessions", async (req: Request, res: Response) => {
    try {
      const { requirementId } = req.body;
      
      // For now, we'll create a simple session ID
      // In a real app, you'd store session state
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.json({ sessionId, requirementId });
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  app.post("/api/chat/sessions/:sessionId/messages", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;
      
      // For now, return a simple response
      // In a real app, you'd process the message with AI
      const response = {
        id: `msg_${Date.now()}`,
        content: `AI response to: ${message}`,
        timestamp: new Date().toISOString(),
        type: 'ai'
      };
      
      res.json({ message: response });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/chat/sessions/:sessionId/messages", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      
      // For now, return empty messages
      // In a real app, you'd fetch session history
      const messages = [];
      
      res.json({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
