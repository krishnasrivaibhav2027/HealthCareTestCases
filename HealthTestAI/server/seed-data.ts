import { storage } from './storage';

export async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...');

    // Sample requirements for healthcare systems
    const requirements = [
      {
        jira_key: "HSW-1001",
        title: "Patient Data Encryption",
        description: "Implement AES-256 encryption for all patient data at rest and in transit to ensure HIPAA compliance and protect sensitive medical information from unauthorized access",
        priority: "Critical" as const,
        status: "In Progress",
        assignee: "John Smith",
        compliance_standards: ["FDA", "ISO 27001", "IEC 62304"],
      },
      {
        jira_key: "HSW-1002", 
        title: "Multi-Factor Authentication System",
        description: "Implement robust multi-factor authentication system for healthcare professionals with role-based access control, session management, and audit logging for all user activities",
        priority: "High" as const,
        status: "Ready for Testing",
        assignee: "Sarah Johnson", 
        compliance_standards: ["FDA", "ISO 9001"],
      },
      {
        jira_key: "HSW-1003",
        title: "Comprehensive Audit Logging Module", 
        description: "Develop comprehensive audit trail system for all system activities including user actions, data access, system changes, and compliance monitoring with tamper-proof storage",
        priority: "Medium" as const,
        status: "To Do",
        assignee: "Mike Chen",
        compliance_standards: ["FDA", "ISO 13485", "ISO 27001"],
      },
      {
        jira_key: "HSW-1004",
        title: "Medical Device Integration API",
        description: "Create secure REST API endpoints for medical device data integration with real-time monitoring, alerting capabilities, and interoperability with HL7 FHIR standards",
        priority: "High" as const,
        status: "In Progress", 
        assignee: "Emily Davis",
        compliance_standards: ["IEC 62304", "ISO 13485"],
      },
      {
        jira_key: "HSW-1005",
        title: "Patient Portal Security Framework",
        description: "Develop secure patient portal with encrypted communication channels, secure file sharing capabilities, privacy controls, and patient consent management",
        priority: "High" as const,
        status: "To Do",
        assignee: "Alex Rodriguez",
        compliance_standards: ["FDA", "ISO 27001"],
      }
    ];

    // Sample test cases
    const testCases = [
      {
        title: "Patient Data Encryption Validation",
        description: "Verify that all patient data is properly encrypted using AES-256 encryption both at rest and in transit",
        steps: [
          {
            step: "Access patient database and retrieve encrypted patient record",
            expectedResult: "Data should be encrypted and unreadable without proper decryption keys"
          },
          {  
            step: "Monitor network traffic during patient data transmission",
            expectedResult: "All data transmission should use TLS/SSL encryption"
          },
          {
            step: "Attempt to access raw database files",
            expectedResult: "Patient data should be encrypted at the file system level"
          }
        ],
        priority: "Critical" as const,
        compliance_checks: ["FDA", "ISO 27001"],
        ai_generated: false,
        reviewed: true,
        reviewed_by: "QA Lead",
        version: 1
      },
      {
        title: "Multi-Factor Authentication Flow Test",
        description: "Validate the complete multi-factor authentication process for healthcare professionals",
        steps: [
          {
            step: "Enter valid username and password",
            expectedResult: "System should prompt for second factor authentication"
          },
          {
            step: "Complete MFA challenge (SMS, app, or hardware token)",
            expectedResult: "User should be successfully authenticated and granted appropriate access"
          },
          {
            step: "Verify session timeout and re-authentication requirements",
            expectedResult: "Session should timeout after configured period and require re-authentication"
          }
        ],
        priority: "High" as const,
        compliance_checks: ["FDA", "ISO 9001"],
        ai_generated: false,
        reviewed: true,
        reviewed_by: "Security Team",
        version: 1
      }
    ];

    // Insert requirements
    let createdRequirements = [];
    for (const req of requirements) {
      try {
        const existing = await storage.getRequirementByJiraKey(req.jira_key);
        if (!existing) {
          const created = await storage.createRequirement(req);
          createdRequirements.push(created);
          console.log(`Created requirement: ${req.jira_key}`);
        } else {
          createdRequirements.push(existing);
          console.log(`Requirement ${req.jira_key} already exists`);
        }
      } catch (error) {
        console.log(`Error with requirement ${req.jira_key}:`, error);
      }
    }

    // Insert test cases (link to first requirement)
    if (createdRequirements.length > 0) {
      for (let i = 0; i < testCases.length && i < createdRequirements.length; i++) {
        try {
          const testCaseWithReq = {
            ...testCases[i],
            requirement_id: createdRequirements[i].id
          };
          
          await storage.createTestCase(testCaseWithReq);
          console.log(`Created test case: ${testCases[i].title}`);
        } catch (error) {
          console.log(`Error creating test case ${testCases[i].title}:`, error);
        }
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}