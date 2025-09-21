import {
  type Requirement,
  type TestCase,
  type ComplianceReport,
  type InsertRequirement,
  type InsertTestCase,
  type InsertComplianceReport
} from "@shared/schema";
import { IStorage } from "./storage";
import { v4 as uuidv4 } from 'uuid';

export class MemoryStorage implements IStorage {
  private requirements: Map<string, Requirement> = new Map();
  private testCases: Map<string, TestCase> = new Map();
  private complianceReports: Map<string, ComplianceReport> = new Map();
  private jiraKeyIndex: Map<string, string> = new Map(); // jiraKey -> id

  // Requirements
  async getRequirement(id: string): Promise<Requirement | undefined> {
    return this.requirements.get(id);
  }

  async getRequirementByJiraKey(jiraKey: string): Promise<Requirement | undefined> {
    const id = this.jiraKeyIndex.get(jiraKey);
    return id ? this.requirements.get(id) : undefined;
  }

  async getAllRequirements(): Promise<Requirement[]> {
    return Array.from(this.requirements.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async createRequirement(insertRequirement: InsertRequirement): Promise<Requirement> {
    const now = new Date().toISOString();
    const requirement: Requirement = {
      id: uuidv4(),
      ...insertRequirement,
      created_at: now,
      updated_at: now
    };
    
    this.requirements.set(requirement.id, requirement);
    this.jiraKeyIndex.set(requirement.jira_key, requirement.id);
    return requirement;
  }

  async updateRequirement(id: string, updateData: Partial<InsertRequirement>): Promise<Requirement> {
    const existing = this.requirements.get(id);
    if (!existing) {
      throw new Error(`Requirement with id ${id} not found`);
    }

    const updated: Requirement = {
      ...existing,
      ...updateData,
      updated_at: new Date().toISOString()
    };

    this.requirements.set(id, updated);
    
    // Update jira key index if changed
    if (updateData.jira_key && updateData.jira_key !== existing.jira_key) {
      this.jiraKeyIndex.delete(existing.jira_key);
      this.jiraKeyIndex.set(updateData.jira_key, id);
    }

    return updated;
  }

  // Test Cases
  async getTestCase(id: string): Promise<TestCase | undefined> {
    return this.testCases.get(id);
  }

  async getTestCasesByRequirement(requirementId: string): Promise<TestCase[]> {
    return Array.from(this.testCases.values())
      .filter(tc => tc.requirement_id === requirementId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getAllTestCases(): Promise<TestCase[]> {
    return Array.from(this.testCases.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async createTestCase(insertTestCase: InsertTestCase): Promise<TestCase> {
    const now = new Date().toISOString();
    const testCase: TestCase = {
      id: uuidv4(),
      ...insertTestCase,
      created_at: now,
      updated_at: now
    };
    
    this.testCases.set(testCase.id, testCase);
    return testCase;
  }

  async updateTestCase(id: string, updateData: Partial<InsertTestCase>): Promise<TestCase> {
    const existing = this.testCases.get(id);
    if (!existing) {
      throw new Error(`Test case with id ${id} not found`);
    }

    const updated: TestCase = {
      ...existing,
      ...updateData,
      updated_at: new Date().toISOString()
    };

    this.testCases.set(id, updated);
    return updated;
  }

  // Compliance Reports
  async getComplianceReport(id: string): Promise<ComplianceReport | undefined> {
    return this.complianceReports.get(id);
  }

  async getComplianceReportsByRequirement(requirementId: string): Promise<ComplianceReport[]> {
    return Array.from(this.complianceReports.values())
      .filter(cr => cr.requirement_id === requirementId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createComplianceReport(insertReport: InsertComplianceReport): Promise<ComplianceReport> {
    const report: ComplianceReport = {
      id: uuidv4(),
      ...insertReport,
      created_at: new Date().toISOString()
    };
    
    this.complianceReports.set(report.id, report);
    return report;
  }

  // Utility methods for memory storage
  clear() {
    this.requirements.clear();
    this.testCases.clear();
    this.complianceReports.clear();
    this.jiraKeyIndex.clear();
  }

  getStats() {
    return {
      requirements: this.requirements.size,
      testCases: this.testCases.size,
      complianceReports: this.complianceReports.size
    };
  }
}