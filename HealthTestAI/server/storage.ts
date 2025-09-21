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

import {
  type Requirement,
  type TestCase,
  type ComplianceReport,
  type InsertRequirement,
  type InsertTestCase,
  type InsertComplianceReport
} from "@shared/schema";
import { MemoryStorage } from "./memory-storage";
import { v4 as uuidv4 } from 'uuid';

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

// For now, use memory storage to avoid BigQuery authentication issues
console.log('Using in-memory storage');
export const storage = new MemoryStorage();