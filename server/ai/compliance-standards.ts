import { ComplianceStandard } from './types';

export const COMPLIANCE_STANDARDS: Record<string, ComplianceStandard> = {
  'FDA': {
    name: 'FDA 21 CFR Part 11',
    requirements: [
      'Electronic records must be authenticated and secure',
      'Audit trails must be maintained for all system activities',
      'User access controls must be implemented',
      'Data integrity must be ensured throughout the system lifecycle',
      'Electronic signatures must be unique and verifiable'
    ],
    validationRules: [
      'Test user authentication mechanisms',
      'Verify audit trail completeness and accuracy',
      'Validate access control restrictions',
      'Test data integrity during transmission and storage',
      'Verify electronic signature functionality'
    ]
  },
  'IEC 62304': {
    name: 'IEC 62304:2006 Medical Device Software',
    requirements: [
      'Software safety classification must be established',
      'Risk management processes must be implemented',
      'Software development lifecycle must be documented',
      'Verification and validation activities must be performed',
      'Configuration management must be maintained'
    ],
    validationRules: [
      'Test safety-critical functions thoroughly',
      'Verify risk mitigation measures',
      'Validate software requirements traceability',
      'Test error handling and recovery mechanisms',
      'Verify version control and change management'
    ]
  },
  'ISO 9001': {
    name: 'ISO 9001:2015 Quality Management',
    requirements: [
      'Quality management system must be established',
      'Customer requirements must be understood and met',
      'Continuous improvement processes must be implemented',
      'Document control procedures must be maintained',
      'Management review processes must be established'
    ],
    validationRules: [
      'Test quality control processes',
      'Verify customer requirement fulfillment',
      'Validate improvement tracking mechanisms',
      'Test document version control',
      'Verify management reporting functionality'
    ]
  },
  'ISO 13485': {
    name: 'ISO 13485:2016 Medical Devices QMS',
    requirements: [
      'Medical device quality management system must be implemented',
      'Risk management must be integrated into design controls',
      'Design and development controls must be established',
      'Corrective and preventive action systems must be maintained',
      'Post-market surveillance processes must be implemented'
    ],
    validationRules: [
      'Test design control processes',
      'Verify risk management integration',
      'Validate CAPA system functionality',
      'Test post-market surveillance data collection',
      'Verify regulatory compliance reporting'
    ]
  },
  'ISO 27001': {
    name: 'ISO 27001:2013 Information Security',
    requirements: [
      'Information security management system must be established',
      'Risk assessment and treatment must be performed',
      'Security controls must be implemented and monitored',
      'Incident response procedures must be established',
      'Business continuity planning must be maintained'
    ],
    validationRules: [
      'Test security control effectiveness',
      'Verify incident response procedures',
      'Validate access control mechanisms',
      'Test data encryption and protection',
      'Verify backup and recovery processes'
    ]
  }
};

export function getComplianceStandards(standardNames: string[]): ComplianceStandard[] {
  return standardNames
    .map(name => COMPLIANCE_STANDARDS[name])
    .filter(Boolean);
}

export function generateCompliancePrompt(standards: ComplianceStandard[]): string {
  const standardsText = standards.map(standard => 
    `${standard.name}:\n` +
    `Requirements: ${standard.requirements.join(', ')}\n` +
    `Validation Rules: ${standard.validationRules.join(', ')}`
  ).join('\n\n');

  return `
Consider the following compliance standards when generating test cases:

${standardsText}

Ensure that each test case addresses relevant compliance requirements and includes appropriate validation steps.
`;
}