@@ .. @@
 import type { Express } from "express";
 import { createServer, type Server } from "http";
 import { storage } from "./storage";
+import { ChatService } from "./ai/chat-service";
+
+const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyARnj6ZZs5Iz2FlqPVpAg8JCe3HG795c3A";
+const chatService = new ChatService(GEMINI_API_KEY);

 export async function registerRoutes(app: Express): Promise<Server> {
-  // put application routes here
-  // prefix all routes with /api
+  // Requirements routes
+  app.get("/api/requirements", async (req, res) => {
+    try {
+      const requirements = await storage.getAllRequirements();
+      res.json(requirements);
+    } catch (error) {
+      res.status(500).json({ error: "Failed to fetch requirements" });
+    }
+  });
+
+  app.get("/api/requirements/:id", async (req, res) => {
+    try {
+      const requirement = await storage.getRequirement(req.params.id);
+      if (!requirement) {
+        return res.status(404).json({ error: "Requirement not found" });
+      }
+      res.json(requirement);
+    } catch (error) {
+      res.status(500).json({ error: "Failed to fetch requirement" });
+    }
+  });
+
+  // Test cases routes
+  app.get("/api/test-cases", async (req, res) => {
+    try {
+      const testCases = await storage.getAllTestCases();
+      res.json(testCases);
+    } catch (error) {
+      res.status(500).json({ error: "Failed to fetch test cases" });
+    }
+  });
+
+  app.get("/api/test-cases/requirement/:requirementId", async (req, res) => {
+    try {
+      const testCases = await storage.getTestCasesByRequirement(req.params.requirementId);
+      res.json(testCases);
+    } catch (error) {
+      res.status(500).json({ error: "Failed to fetch test cases" });
+    }
+  });
+
+  // AI Chat routes
+  app.post("/api/chat/sessions", async (req, res) => {
+    try {
+      const { requirementId } = req.body;
+      if (!requirementId) {
+        return res.status(400).json({ error: "requirementId is required" });
+      }
+      
+      const sessionId = await chatService.createChatSession(requirementId);
+      res.json({ sessionId });
+    } catch (error) {
+      console.error("Error creating chat session:", error);
+      res.status(500).json({ error: "Failed to create chat session" });
+    }
+  });
+
+  app.post("/api/chat/sessions/:sessionId/messages", async (req, res) => {
+    try {
+      const { sessionId } = req.params;
+      const { message } = req.body;
+      
+      if (!message) {
+        return res.status(400).json({ error: "message is required" });
+      }
+
+      const response = await chatService.sendMessage(sessionId, message);
+      res.json(response);
+    } catch (error) {
+      console.error("Error sending message:", error);
+      res.status(500).json({ error: "Failed to send message" });
+    }
+  });
+
+  app.get("/api/chat/sessions/:sessionId/messages", async (req, res) => {
+    try {
+      const { sessionId } = req.params;
+      const messages = await chatService.getChatHistory(sessionId);
+      res.json(messages);
+    } catch (error) {
+      console.error("Error fetching chat history:", error);
+      res.status(500).json({ error: "Failed to fetch chat history" });
+    }
+  });
+
+  app.get("/api/chat/requirements/:requirementId/sessions", async (req, res) => {
+    try {
+      const { requirementId } = req.params;
+      const sessions = await chatService.getSessionsByRequirement(requirementId);
+      res.json(sessions);
+    } catch (error) {
+      console.error("Error fetching sessions:", error);
+      res.status(500).json({ error: "Failed to fetch sessions" });
+    }
+  });
+
+  app.delete("/api/chat/sessions/:sessionId", async (req, res) => {
+    try {
+      const { sessionId } = req.params;
+      await chatService.deleteSession(sessionId);
+      res.json({ success: true });
+    } catch (error) {
+      console.error("Error deleting session:", error);
+      res.status(500).json({ error: "Failed to delete session" });
+    }
+  });

-  // use storage to perform CRUD operations on the storage interface
-  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

   const httpServer = createServer(app);