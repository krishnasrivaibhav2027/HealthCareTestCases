import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const requirements = pgTable("requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jiraKey: text("jira_key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  assignee: text("assignee"),
  complianceStandards: text("compliance_standards").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const testCases = pgTable("test_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requirementId: varchar("requirement_id").references(() => requirements.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  steps: jsonb("steps").$type<Array<{step: string, expectedResult: string}>>(),
  priority: text("priority").notNull(),
  complianceChecks: text("compliance_checks").array(),
  aiGenerated: boolean("ai_generated").default(true),
  reviewed: boolean("reviewed").default(false),
  reviewedBy: text("reviewed_by"),
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complianceReports = pgTable("compliance_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requirementId: varchar("requirement_id").references(() => requirements.id),
  testCaseId: varchar("test_case_id").references(() => testCases.id),
  standard: text("standard").notNull(),
  status: text("status").notNull(), // compliant, non-compliant, review-needed
  findings: jsonb("findings").$type<Array<{issue: string, severity: string}>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRequirementSchema = createInsertSchema(requirements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTestCaseSchema = createInsertSchema(testCases).omit({ id: true, createdAt: true, updatedAt: true });
export const insertComplianceReportSchema = createInsertSchema(complianceReports).omit({ id: true, createdAt: true });

export type InsertRequirement = z.infer<typeof insertRequirementSchema>;
export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type InsertComplianceReport = z.infer<typeof insertComplianceReportSchema>;

export type Requirement = typeof requirements.$inferSelect;
export type TestCase = typeof testCases.$inferSelect;
export type ComplianceReport = typeof complianceReports.$inferSelect;

// Enums for consistency
export const COMPLIANCE_STANDARDS = ['FDA', 'IEC 62304', 'ISO 9001', 'ISO 13485', 'ISO 27001'] as const;
export const PRIORITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const;
export const COMPLIANCE_STATUS = ['compliant', 'non-compliant', 'review-needed'] as const;