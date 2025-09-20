@@ .. @@
 import { useState } from "react";
+import { useChat } from "@/hooks/use-chat";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Separator } from "@/components/ui/separator";
+import { Skeleton } from "@/components/ui/skeleton";
+import { Alert, AlertDescription } from "@/components/ui/alert";
 import {
   Bot,
   Send,
   User,
   CheckCircle,
   AlertCircle,
   Download,
   Copy,
   Sparkles,
+  MessageSquare,
+  Loader2,
 } from "lucide-react";

-interface Message {
-  id: string;
-  role: "user" | "assistant";
-  content: string;
-  timestamp: Date;
-}
-
-interface GeneratedTestCase {
-  id: string;
-  title: string;
-  description: string;
-  steps: Array<{ step: string; expectedResult: string }>;
-  priority: string;
-  complianceChecks: string[];
-}
-
 interface AIChatProps {
   requirement?: {
+    id: string;
     jiraKey: string;
     title: string;
     description: string;
     complianceStandards: string[];
   };
   onClose?: () => void;
 }

-// TODO: remove mock functionality - replace with actual AI integration
-const mockTestCases: GeneratedTestCase[] = [
-  {
-    id: "tc-1",
-    title: "Verify AES-256 Encryption Implementation",
-    description: "Test that patient data is properly encrypted using AES-256 standards",
-    steps: [
-      {
-        step: "Create a test patient record with sensitive data",
-        expectedResult: "Patient record is created successfully",
-      },
-      {
-        step: "Save the record to the database",
-        expectedResult: "Data is encrypted using AES-256 before storage",
-      },
-      {
-        step: "Retrieve the record from database",
-        expectedResult: "Data is decrypted correctly upon retrieval",
-      },
-    ],
-    priority: "Critical",
-    complianceChecks: ["FDA 21 CFR Part 11", "ISO 27001:2013"],
-  },
-  {
-    id: "tc-2",
-    title: "Validate Data Transmission Security",
-    description: "Ensure patient data remains encrypted during transmission",
-    steps: [
-      {
-        step: "Initiate secure data transmission",
-        expectedResult: "Connection established with TLS 1.3",
-      },
-      {
-        step: "Monitor data packets during transmission",
-        expectedResult: "All patient data is encrypted in transit",
-      },
-    ],
-    priority: "Critical",
-    complianceChecks: ["IEC 62304:2006", "ISO 27001:2013"],
-  },
-];
-
 export function AIChat({ requirement, onClose }: AIChatProps) {
-  const [messages, setMessages] = useState<Message[]>([]);
   const [inputValue, setInputValue] = useState("");
-  const [isGenerating, setIsGenerating] = useState(false);
-  const [generatedTestCases, setGeneratedTestCases] = useState<GeneratedTestCase[]>([]);
+  
+  const {
+    currentSession,
+    messages,
+    messagesLoading,
+    isCreatingSession,
+    isSendingMessage,
+    startNewSession,
+    sendMessage,
+  } = useChat(requirement?.id);

-  const handleSendMessage = async () => {
+  const handleSendMessage = () => {
     if (!inputValue.trim()) return;
-
-    const userMessage: Message = {
-      id: `msg-${Date.now()}`,
-      role: "user",
-      content: inputValue,
-      timestamp: new Date(),
-    };
-
-    setMessages((prev) => [...prev, userMessage]);
+    
+    if (!currentSession) {
+      if (requirement?.id) {
+        startNewSession(requirement.id);
+      }
+      return;
+    }
+    
+    sendMessage(inputValue);
     setInputValue("");
-    setIsGenerating(true);
-
-    // TODO: remove mock functionality - replace with actual AI generation
-    setTimeout(() => {
-      const aiResponse: Message = {
-        id: `msg-${Date.now() + 1}`,
-        role: "assistant",
-        content: "I've analyzed the requirement and generated compliant test cases. The test cases follow FDA and ISO standards with specific validation steps for encryption requirements.",
-        timestamp: new Date(),
-      };
-
-      setMessages((prev) => [...prev, aiResponse]);
-      setGeneratedTestCases(mockTestCases);
-      setIsGenerating(false);
-    }, 2000);
   };

+  const handleStartSession = () => {
+    if (requirement?.id) {
+      startNewSession(requirement.id);
+    }
+  };
+
   const handleExportTestCases = () => {
     console.log("Exporting test cases...");
-    // TODO: remove mock functionality - implement actual export
   };

-  const handleCopyTestCase = (testCase: GeneratedTestCase) => {
-    console.log(`Copying test case: ${testCase.title}`);
-    // TODO: remove mock functionality - implement copy to clipboard
+  const handleCopyTestCase = (testCase: any) => {
+    const testCaseText = `
+Title: ${testCase.title}
+Description: ${testCase.description}
+Priority: ${testCase.priority}
+
+Test Steps:
+${testCase.steps?.map((step: any, index: number) => 
+  `${index + 1}. ${step.step}\n   Expected: ${step.expectedResult}`
+).join('\n') || 'No steps defined'}
+
+Compliance Checks: ${testCase.complianceChecks?.join(', ') || 'None'}
+    `.trim();
+    
+    navigator.clipboard.writeText(testCaseText);
   };

+  const getGeneratedTestCases = () => {
+    const latestMessage = messages
+      .filter(m => m.role === 'assistant' && m.metadata?.generatedTestCases)
+      .pop();
+    return latestMessage?.metadata?.generatedTestCases || [];
+  };
+
+  const generatedTestCases = getGeneratedTestCases();
+
   return (
     <div className="flex flex-col h-[80vh] max-w-6xl mx-auto">
       <Card className="flex-1 flex flex-col">
         <CardHeader className="pb-4">
           <div className="flex items-center justify-between">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-primary" />
                 AI Test Case Generation
               </CardTitle>
               {requirement && (
                 <div className="mt-2">
                   <Badge variant="outline" className="mr-2">
                     {requirement.jiraKey}
                   </Badge>
                   <span className="text-sm text-muted-foreground">
                     {requirement.title}
                   </span>
                 </div>
               )}
             </div>
             {onClose && (
               <Button variant="ghost" onClick={onClose} data-testid="button-close-chat">
                 ×
               </Button>
             )}
           </div>
         </CardHeader>

         <div className="flex flex-1 gap-6 px-6 pb-6">
           {/* Chat Section */}
           <div className="flex-1 flex flex-col">
+            {!currentSession && !isCreatingSession && (
+              <div className="flex-1 flex items-center justify-center">
+                <div className="text-center">
+                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
+                  <h3 className="text-lg font-semibold mb-2">Start AI Test Case Generation</h3>
+                  <p className="text-muted-foreground mb-4">
+                    I'll help you generate compliant test cases for this healthcare requirement.
+                  </p>
+                  <Button onClick={handleStartSession} data-testid="button-start-session">
+                    <Bot className="h-4 w-4 mr-2" />
+                    Start New Session
+                  </Button>
+                </div>
+              </div>
+            )}
+
+            {isCreatingSession && (
+              <div className="flex-1 flex items-center justify-center">
+                <div className="text-center">
+                  <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
+                  <p className="text-muted-foreground">Starting AI session...</p>
+                </div>
+              </div>
+            )}
+
+            {currentSession && (
             <ScrollArea className="flex-1 pr-4">
+              {messagesLoading && (
+                <div className="space-y-4">
+                  {[1, 2, 3].map((i) => (
+                    <div key={i} className="flex gap-3">
+                      <Skeleton className="w-8 h-8 rounded-full" />
+                      <div className="flex-1">
+                        <Skeleton className="h-4 w-3/4 mb-2" />
+                        <Skeleton className="h-4 w-1/2" />
+                      </div>
+                    </div>
+                  ))}
+                </div>
+              )}
+              
               <div className="space-y-4">
                 {messages.length === 0 && (
                   <div className="text-center py-8">
                     <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                     <h3 className="text-lg font-semibold">AI Test Case Assistant</h3>
                     <p className="text-muted-foreground">
                       I'll help you generate compliant test cases for healthcare software requirements.
                     </p>
                   </div>
                 )}

                 {messages.map((message) => (
                   <div key={message.id} className="flex gap-3">
                     <Avatar className="w-8 h-8">
                       {message.role === "user" ? (
                         <>
                           <AvatarImage src="/placeholder-user.jpg" />
                           <AvatarFallback>
                             <User className="h-4 w-4" />
                           </AvatarFallback>
                         </>
                       ) : (
                         <AvatarFallback className="bg-primary text-primary-foreground">
                           <Bot className="h-4 w-4" />
                         </AvatarFallback>
                       )}
                     </Avatar>
                     <div className="flex-1">
                       <div className="bg-muted rounded-lg p-3">
-                        <p className="text-sm">{message.content}</p>
+                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                       </div>
                       <p className="text-xs text-muted-foreground mt-1">
-                        {message.timestamp.toLocaleTimeString()}
+                        {new Date(message.timestamp).toLocaleTimeString()}
                       </p>
                     </div>
                   </div>
                 ))}

-                {isGenerating && (
+                {isSendingMessage && (
                   <div className="flex gap-3">
                     <Avatar className="w-8 h-8">
                       <AvatarFallback className="bg-primary text-primary-foreground">
                         <Bot className="h-4 w-4" />
                       </AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <div className="bg-muted rounded-lg p-3">
                         <div className="flex items-center gap-2">
-                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
+                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                           <p className="text-sm">Generating test cases...</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             </ScrollArea>

+            {currentSession && (
             <div className="flex gap-2 mt-4">
               <Input
                 placeholder="Describe what test cases you need or ask for modifications..."
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
-                disabled={isGenerating}
+                disabled={isSendingMessage}
                 data-testid="input-ai-chat"
               />
               <Button
                 onClick={handleSendMessage}
-                disabled={!inputValue.trim() || isGenerating}
+                disabled={!inputValue.trim() || isSendingMessage}
                 data-testid="button-send-message"
               >
-                <Send className="h-4 w-4" />
+                {isSendingMessage ? (
+                  <Loader2 className="h-4 w-4 animate-spin" />
+                ) : (
+                  <Send className="h-4 w-4" />
+                )}
               </Button>
             </div>
+            )}
+            )}
           </div>

           {/* Generated Test Cases */}
           <div className="w-96">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold">Generated Test Cases</h3>
               {generatedTestCases.length > 0 && (
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={handleExportTestCases}
                   data-testid="button-export-test-cases"
                 >
                   <Download className="h-4 w-4 mr-2" />
                   Export
                 </Button>
               )}
             </div>

             <ScrollArea className="h-[calc(100vh-12rem)]">
               <div className="space-y-4">
                 {generatedTestCases.map((testCase: any) => (
                   <Card key={testCase.id} className="p-4">
                     <div className="flex items-start justify-between mb-2">
                       <div className="flex-1">
                         <h4 className="font-medium text-sm mb-1">{testCase.title}</h4>
                         <p className="text-xs text-muted-foreground mb-2">
                           {testCase.description}
                         </p>
                         <Badge
                           variant={testCase.priority === "Critical" ? "destructive" : "default"}
                           className="text-xs"
                         >
                           {testCase.priority}
                         </Badge>
                       </div>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleCopyTestCase(testCase)}
                         data-testid={`button-copy-${testCase.id}`}
                       >
                         <Copy className="h-4 w-4" />
                       </Button>
                     </div>

                     <Separator className="my-2" />

                     <div className="space-y-2">
                       <h5 className="text-xs font-medium">Test Steps:</h5>
-                      {testCase.steps.map((step, index) => (
+                      {testCase.steps?.map((step: any, index: number) => (
                         <div key={index} className="text-xs">
                           <div className="font-medium">{index + 1}. {step.step}</div>
                           <div className="text-muted-foreground ml-3">
                             Expected: {step.expectedResult}
                           </div>
                         </div>
-                      ))}
+                      )) || <p className="text-xs text-muted-foreground">No steps defined</p>}
                     </div>

                     <Separator className="my-2" />

                     <div>
                       <h5 className="text-xs font-medium mb-1">Compliance Checks:</h5>
                       <div className="flex flex-wrap gap-1">
-                        {testCase.complianceChecks.map((check) => (
+                        {testCase.complianceChecks?.map((check: string) => (
                           <Badge key={check} variant="outline" className="text-xs">
                             <CheckCircle className="h-3 w-3 mr-1" />
                             {check}
                           </Badge>
-                        ))}
+                        )) || <p className="text-xs text-muted-foreground">No compliance checks</p>}
                       </div>
                     </div>
                   </Card>
                 ))}

                 {generatedTestCases.length === 0 && (
                   <div className="text-center py-8">
                     <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                     <p className="text-sm text-muted-foreground">
-                      No test cases generated yet. Start a conversation to begin.
+                      No test cases generated yet. {currentSession ? "Send a message to generate test cases." : "Start a session to begin."}
                     </p>
                   </div>
                 )}
               </div>
             </ScrollArea>
           </div>
         </div>
       </Card>
     </div>
   );
 }