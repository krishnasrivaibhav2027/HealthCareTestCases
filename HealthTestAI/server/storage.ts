import { 
  requirements, 
  testCases, 
  complianceReports,
  type Requirement,
  type TestCase,
  type ComplianceReport,
  type InsertRequirement,
  type InsertTestCase,
  type InsertComplianceReport
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Reference: javascript_database integration
// Healthcare test case generation storage interface
export interface IStorage {
  // Requirements
  getRequirement(id: string): Promise<Requirement | undefined>;
  getRequirementByJiraKey(jiraKey: string): Promise<Requirement | undefined>;
  getAllRequirements(): Promise<Requirement[]>;
  createRequirement(requirement: InsertRequirement): Promise<Requirement>;
  updateRequirement(id: string, requirement: Partial<InsertRequirement>): Promise<Requirement>;
  
  // Test Cases
  getTestCase(id: string): Promise<TestCase | undefined>;
  getTestCasesByRequirement(requirementId: string): Promise<TestCase[]>;
  getAllTestCases(): Promise<TestCase[]>;
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;
  updateTestCase(id: string, testCase: Partial<InsertTestCase>): Promise<TestCase>;
  
  // Compliance Reports
  getComplianceReport(id: string): Promise<ComplianceReport | undefined>;
  getComplianceReportsByRequirement(requirementId: string): Promise<ComplianceReport[]>;
  createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport>;
}

export class DatabaseStorage implements IStorage {
  // Requirements
  async getRequirement(id: string): Promise<Requirement | undefined> {
    const [requirement] = await db.select().from(requirements).where(eq(requirements.id, id));
    return requirement || undefined;
  }

  async getRequirementByJiraKey(jiraKey: string): Promise<Requirement | undefined> {
    const [requirement] = await db.select().from(requirements).where(eq(requirements.jiraKey, jiraKey));
    return requirement || undefined;
  }

  async getAllRequirements(): Promise<Requirement[]> {
    return await db.select().from(requirements);
  }

  async createRequirement(insertRequirement: InsertRequirement): Promise<Requirement> {
    const [requirement] = await db
      .insert(requirements)
      .values(insertRequirement)
      .returning();
    return requirement;
  }

  async updateRequirement(id: string, updateData: Partial<InsertRequirement>): Promise<Requirement> {
    const [requirement] = await db
      .update(requirements)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(requirements.id, id))
      .returning();
    return requirement;
  }

  // Test Cases
  async getTestCase(id: string): Promise<TestCase | undefined> {
    const [testCase] = await db.select().from(testCases).where(eq(testCases.id, id));
    return testCase || undefined;
  }

  async getTestCasesByRequirement(requirementId: string): Promise<TestCase[]> {
    return await db.select().from(testCases).where(eq(testCases.requirementId, requirementId));
  }

  async getAllTestCases(): Promise<TestCase[]> {
    return await db.select().from(testCases);
  }

  async createTestCase(insertTestCase: InsertTestCase): Promise<TestCase> {
    const [testCase] = await db
      .insert(testCases)
      .values(insertTestCase)
      .returning();
    return testCase;
  }

  async updateTestCase(id: string, updateData: Partial<InsertTestCase>): Promise<TestCase> {
    const [testCase] = await db
      .update(testCases)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(testCases.id, id))
      .returning();
    return testCase;
  }

  // Compliance Reports
  async getComplianceReport(id: string): Promise<ComplianceReport | undefined> {
    const [report] = await db.select().from(complianceReports).where(eq(complianceReports.id, id));
    return report || undefined;
  }

  async getComplianceReportsByRequirement(requirementId: string): Promise<ComplianceReport[]> {
    return await db.select().from(complianceReports).where(eq(complianceReports.requirementId, requirementId));
  }

  async createComplianceReport(insertReport: InsertComplianceReport): Promise<ComplianceReport> {
    const [report] = await db
      .insert(complianceReports)
      .values(insertReport)
      .returning();
    return report;
  }
}

export const storage = new DatabaseStorage();