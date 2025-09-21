import {
  type Requirement,
  type TestCase,
  type ComplianceReport,
  type InsertRequirement,
  type InsertTestCase,
  type InsertComplianceReport
} from "@shared/schema";
import { BigQueryRepository, bigquery, DATASET_ID, TABLES } from "./db";
import { v4 as uuidv4 } from 'uuid';

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

export class BigQueryStorage implements IStorage {
  // Requirements
  async getRequirement(id: string): Promise<Requirement | undefined> {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.requirements}\` WHERE id = @id LIMIT 1`;
    const options = {
      query,
      params: { id }
    };
    
    const [rows] = await bigquery.query(options);
    return rows.length > 0 ? rows[0] as Requirement : undefined;
  }

  async getRequirementByJiraKey(jiraKey: string): Promise<Requirement | undefined> {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.requirements}\` WHERE jira_key = @jiraKey LIMIT 1`;
    const options = {
      query,
      params: { jiraKey }
    };
    
    const [rows] = await bigquery.query(options);
    return rows.length > 0 ? rows[0] as Requirement : undefined;
  }

  async getAllRequirements(): Promise<Requirement[]> {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.requirements}\` ORDER BY created_at DESC`;
    const [rows] = await bigquery.query(query);
    return rows as Requirement[];
  }

  async createRequirement(insertRequirement: InsertRequirement): Promise<Requirement> {
    const table = bigquery.dataset(DATASET_ID).table(TABLES.requirements);
    const row = {
      id: uuidv4(),
      ...insertRequirement,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await table.insert([row]);
    return row as Requirement;
  }

  async updateRequirement(id: string, updateData: Partial<InsertRequirement>): Promise<Requirement> {
    // BigQuery doesn't support UPDATE directly, so we need to use MERGE or recreate
    // For now, we'll use a simpler approach by getting the existing record and recreating
    const existing = await this.getRequirement(id);
    if (!existing) {
      throw new Error(`Requirement with id ${id} not found`);
    }

    // Delete existing record (BigQuery DELETE)
    const deleteQuery = `DELETE FROM \`${DATASET_ID}.${TABLES.requirements}\` WHERE id = @id`;
    await bigquery.query({
      query: deleteQuery,
      params: { id }
    });

    // Insert updated record
    const table = bigquery.dataset(DATASET_ID).table(TABLES.requirements);
    const updatedRow = {
      ...existing,
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    await table.insert([updatedRow]);
    return updatedRow as Requirement;
  }

  // Test Cases
  async getTestCase(id: string): Promise<TestCase | undefined> {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.testCases}\` WHERE id = @id LIMIT 1`;
    const options = {
      query,
      params: { id }
    };
    
    const [rows] = await bigquery.query(options);
    return rows.length > 0 ? rows[0] as TestCase : undefined;
  }

  async getTestCasesByRequirement(requirementId: string): Promise<TestCase[]> {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.testCases}\` WHERE requirement_id = @requirementId ORDER BY created_at DESC`;
    const options = {
      query,
      params: { requirementId }
    };
    
    const [rows] = await bigquery.query(options);
    return rows as TestCase[];
  }

  async getAllTestCases(): Promise<TestCase[]> {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.testCases}\` ORDER BY created_at DESC`;
    const [rows] = await bigquery.query(query);
    return rows as TestCase[];
  }

  async createTestCase(insertTestCase: InsertTestCase): Promise<TestCase> {
    const table = bigquery.dataset(DATASET_ID).table(TABLES.testCases);
    const row = {
      id: uuidv4(),
      ...insertTestCase,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await table.insert([row]);
    return row as TestCase;
  }

  async updateTestCase(id: string, updateData: Partial<InsertTestCase>): Promise<TestCase> {
    const existing = await this.getTestCase(id);
    if (!existing) {
      throw new Error(`Test case with id ${id} not found`);
    }

    // Delete existing record
    const deleteQuery = `DELETE FROM \`${DATASET_ID}.${TABLES.testCases}\` WHERE id = @id`;
    await bigquery.query({
      query: deleteQuery,
      params: { id }
    });

    // Insert updated record
    const table = bigquery.dataset(DATASET_ID).table(TABLES.testCases);
    const updatedRow = {
      ...existing,
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    await table.insert([updatedRow]);
    return updatedRow as TestCase;
  }

  // Compliance Reports
  async getComplianceReport(id: string): Promise<ComplianceReport | undefined> {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.complianceReports}\` WHERE id = @id LIMIT 1`;
    const options = {
      query,
      params: { id }
    };
    
    const [rows] = await bigquery.query(options);
    return rows.length > 0 ? rows[0] as ComplianceReport : undefined;
  }

  async getComplianceReportsByRequirement(requirementId: string): Promise<ComplianceReport[]> {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.complianceReports}\` WHERE requirement_id = @requirementId ORDER BY created_at DESC`;
    const options = {
      query,
      params: { requirementId }
    };
    
    const [rows] = await bigquery.query(options);
    return rows as ComplianceReport[];
  }

  async createComplianceReport(insertReport: InsertComplianceReport): Promise<ComplianceReport> {
    const table = bigquery.dataset(DATASET_ID).table(TABLES.complianceReports);
    const row = {
      id: uuidv4(),
      ...insertReport,
      created_at: new Date().toISOString()
    };
    
    await table.insert([row]);
    return row as ComplianceReport;
  }
}

export const storage = new BigQueryStorage();