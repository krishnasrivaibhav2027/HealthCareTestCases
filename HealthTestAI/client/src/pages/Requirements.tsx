import { useState } from "react";
import { RequirementsTable } from "@/components/RequirementsTable";
import { AIChat } from "@/components/AIChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Requirement {
  id: string;
  jiraKey: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignee?: string;
  complianceStandards: string[];
}

export default function Requirements() {
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);

  const handleGenerateTestCases = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowAIChat(true);
  };

  const handleCloseChat = () => {
    setShowAIChat(false);
    setSelectedRequirement(null);
  };

  if (showAIChat && selectedRequirement) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleCloseChat}
            className="mb-4"
            data-testid="button-back-to-requirements"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requirements
          </Button>
        </div>
        <AIChat requirement={selectedRequirement} onClose={handleCloseChat} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Requirements Management</h1>
        <p className="text-muted-foreground mt-2">
          Import, view, and manage healthcare software requirements from Jira
        </p>
      </div>

      <RequirementsTable onGenerateTestCases={handleGenerateTestCases} />
    </div>
  );
}