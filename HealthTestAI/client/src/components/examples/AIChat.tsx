import { AIChat } from '../AIChat';

export default function AIChatExample() {
  // TODO: remove mock functionality
  const mockRequirement = {
    jiraKey: "HSW-1001",
    title: "Patient Data Encryption",
    description: "Implement AES-256 encryption for all patient data at rest and in transit",
    complianceStandards: ["FDA", "ISO 27001", "IEC 62304"],
  };

  return <AIChat requirement={mockRequirement} />;
}