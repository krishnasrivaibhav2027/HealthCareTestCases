import { z } from "zod";

// BigQuery table interfaces
export interface Requirement {
  id: string;
  jira_key: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignee?: string;
  compliance_standards: string[];
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  id: string;
  requirement_id?: string;
  title: string;
  description: string;
  steps?: Array<{step: string, expectedResult: string}>;
  priority: string;
  compliance_checks: string[];
  ai_generated: boolean;
  reviewed: boolean;
  reviewed_by?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ComplianceReport {
  id: string;
  requirement_id?: string;
  test_case_id?: string;
  standard: string;
  status: string; // compliant, non-compliant, review-needed
  findings?: Array<{issue: string, severity: string}>;
  created_at: string;
}

// Validation schemas for inserts (without id and timestamps)
export const insertRequirementSchema = z.object({
  jira_key: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  status: z.string().min(1),
  assignee: z.string().optional(),
  compliance_standards: z.array(z.string()).default([]),
});

export const insertTestCaseSchema = z.object({
  requirement_id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  steps: z.array(z.object({
    step: z.string(),
    expectedResult: z.string()
  })).optional(),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  compliance_checks: z.array(z.string()).default([]),
  ai_generated: z.boolean().default(true),
  reviewed: z.boolean().default(false),
  reviewed_by: z.string().optional(),
  version: z.number().int().default(1),
});

export const insertComplianceReportSchema = z.object({
  requirement_id: z.string().optional(),
  test_case_id: z.string().optional(),
  standard: z.enum(['FDA', 'IEC 62304', 'ISO 9001', 'ISO 13485', 'ISO 27001']),
  status: z.enum(['compliant', 'non-compliant', 'review-needed']),
  findings: z.array(z.object({
    issue: z.string(),
    severity: z.string()
  })).optional(),
});

export type InsertRequirement = z.infer<typeof insertRequirementSchema>;
export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type InsertComplianceReport = z.infer<typeof insertComplianceReportSchema>;

// Enums for consistency
export const COMPLIANCE_STANDARDS = ['FDA', 'IEC 62304', 'ISO 9001', 'ISO 13485', 'ISO 27001'] as const;
export const PRIORITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const;
export const COMPLIANCE_STATUS = ['compliant', 'non-compliant', 'review-needed'] as const;