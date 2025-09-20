import { storage } from './storage';

export async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...');

    // Sample requirements
    const requirements = [
      {
        jiraKey: "HSW-1001",
        title: "Patient Data Encryption",
        description: "Implement AES-256 encryption for all patient data at rest and in transit to ensure HIPAA compliance and protect sensitive medical information",
        priority: "Critical",
        status: "In Progress",
        assignee: "John Smith",
        complianceStandards: ["FDA", "ISO 27001", "IEC 62304"],
      },
      {
        jiraKey: "HSW-1002",
        title: "User Authentication System",
        description: "Multi-factor authentication system for healthcare professionals with role-based access control and session management",
        priority: "High",
        status: "Ready for Testing",
        assignee: "Sarah Johnson",
        complianceStandards: ["FDA", "ISO 9001"],
      },
      {
        jiraKey: "HSW-1003",
        title: "Audit Logging Module",
        description: "Comprehensive audit trail system for all system activities including user actions, data access, and system changes",
        priority: "Medium",
        status: "To Do",
        assignee: "Mike Chen",
        complianceStandards: ["FDA", "ISO 13485", "ISO 27001"],
      },
      {
        jiraKey: "HSW-1004",
        title: "Device Integration API",
        description: "Secure REST API endpoints for medical device data integration with real-time monitoring and alerting capabilities",
        priority: "High",
        status: "In Progress",
        assignee: "Emily Davis",
        complianceStandards: ["IEC 62304", "ISO 13485"],
      },
      {
        jiraKey: "HSW-1005",
        title: "Patient Portal Security",
        description: "Secure patient portal with encrypted communication, secure file sharing, and privacy controls",
        priority: "High",
        status: "To Do",
        assignee: "Alex Rodriguez",
        complianceStandards: ["FDA", "ISO 27001"],
      }
    ];

    for (const req of requirements) {
      try {
        const existing = await storage.getRequirementByJiraKey(req.jiraKey);
        if (!existing) {
          await storage.createRequirement(req);
          console.log(`Created requirement: ${req.jiraKey}`);
        }
      } catch (error) {
        console.log(`Requirement ${req.jiraKey} already exists or error occurred`);
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}