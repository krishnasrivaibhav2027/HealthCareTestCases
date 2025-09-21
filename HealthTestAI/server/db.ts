import { BigQuery } from '@google-cloud/bigquery';
import { v4 as uuidv4 } from 'uuid';

// Initialize BigQuery client
export const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  ...(process.env.GOOGLE_APPLICATION_CREDENTIALS && 
      process.env.GOOGLE_APPLICATION_CREDENTIALS.startsWith('/') ? 
      { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS } : 
      {}
  ),
});

// Dataset and table configuration
export const DATASET_ID = process.env.BIGQUERY_DATASET_ID || 'healthtestai';
export const TABLES = {
  requirements: 'requirements',
  testCases: 'test_cases',
  complianceReports: 'compliance_reports'
} as const;

// Initialize dataset and tables if they don't exist
export async function initializeBigQuery() {
  try {
    // Check if credentials are properly set
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID is not set');
    }
    
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || 
        !process.env.GOOGLE_APPLICATION_CREDENTIALS.startsWith('/')) {
      console.warn('GOOGLE_APPLICATION_CREDENTIALS must be a valid Linux file path starting with /');
      console.warn('Please upload your service account JSON file to Replit and set the full path');
      return; // Skip initialization for now
    }

    const dataset = bigquery.dataset(DATASET_ID);
    
    // Check if dataset exists, create if not
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
      await dataset.create();
      console.log(`Dataset ${DATASET_ID} created.`);
    }

    // Create tables if they don't exist
    await createRequirementsTable();
    await createTestCasesTable();
    await createComplianceReportsTable();
    
    console.log('BigQuery initialization completed successfully');
  } catch (error) {
    console.error('BigQuery initialization failed:', error);
    console.log('The application will continue without BigQuery functionality');
  }
}

async function createRequirementsTable() {
  const table = bigquery.dataset(DATASET_ID).table(TABLES.requirements);
  const [exists] = await table.exists();
  
  if (!exists) {
    const schema = [
      { name: 'id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'jira_key', type: 'STRING', mode: 'REQUIRED' },
      { name: 'title', type: 'STRING', mode: 'REQUIRED' },
      { name: 'description', type: 'STRING', mode: 'REQUIRED' },
      { name: 'priority', type: 'STRING', mode: 'REQUIRED' },
      { name: 'status', type: 'STRING', mode: 'REQUIRED' },
      { name: 'assignee', type: 'STRING', mode: 'NULLABLE' },
      { name: 'compliance_standards', type: 'STRING', mode: 'REPEATED' },
      { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'updated_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
    ];
    
    await table.create({ schema });
    console.log(`Table ${TABLES.requirements} created.`);
  }
}

async function createTestCasesTable() {
  const table = bigquery.dataset(DATASET_ID).table(TABLES.testCases);
  const [exists] = await table.exists();
  
  if (!exists) {
    const schema = [
      { name: 'id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'requirement_id', type: 'STRING', mode: 'NULLABLE' },
      { name: 'title', type: 'STRING', mode: 'REQUIRED' },
      { name: 'description', type: 'STRING', mode: 'REQUIRED' },
      { name: 'steps', type: 'JSON', mode: 'NULLABLE' },
      { name: 'priority', type: 'STRING', mode: 'REQUIRED' },
      { name: 'compliance_checks', type: 'STRING', mode: 'REPEATED' },
      { name: 'ai_generated', type: 'BOOLEAN', mode: 'REQUIRED' },
      { name: 'reviewed', type: 'BOOLEAN', mode: 'REQUIRED' },
      { name: 'reviewed_by', type: 'STRING', mode: 'NULLABLE' },
      { name: 'version', type: 'INTEGER', mode: 'REQUIRED' },
      { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'updated_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
    ];
    
    await table.create({ schema });
    console.log(`Table ${TABLES.testCases} created.`);
  }
}

async function createComplianceReportsTable() {
  const table = bigquery.dataset(DATASET_ID).table(TABLES.complianceReports);
  const [exists] = await table.exists();
  
  if (!exists) {
    const schema = [
      { name: 'id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'requirement_id', type: 'STRING', mode: 'NULLABLE' },
      { name: 'test_case_id', type: 'STRING', mode: 'NULLABLE' },
      { name: 'standard', type: 'STRING', mode: 'REQUIRED' },
      { name: 'status', type: 'STRING', mode: 'REQUIRED' },
      { name: 'findings', type: 'JSON', mode: 'NULLABLE' },
      { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
    ];
    
    await table.create({ schema });
    console.log(`Table ${TABLES.complianceReports} created.`);
  }
}

// Helper functions for common BigQuery operations
export class BigQueryRepository {
  static async insertRequirement(data: any) {
    const table = bigquery.dataset(DATASET_ID).table(TABLES.requirements);
    const row = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await table.insert([row]);
    return row;
  }

  static async insertTestCase(data: any) {
    const table = bigquery.dataset(DATASET_ID).table(TABLES.testCases);
    const row = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await table.insert([row]);
    return row;
  }

  static async insertComplianceReport(data: any) {
    const table = bigquery.dataset(DATASET_ID).table(TABLES.complianceReports);
    const row = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString()
    };
    await table.insert([row]);
    return row;
  }

  static async queryRequirements() {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.requirements}\` ORDER BY created_at DESC`;
    const [rows] = await bigquery.query(query);
    return rows;
  }

  static async queryTestCases() {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.testCases}\` ORDER BY created_at DESC`;
    const [rows] = await bigquery.query(query);
    return rows;
  }

  static async queryComplianceReports() {
    const query = `SELECT * FROM \`${DATASET_ID}.${TABLES.complianceReports}\` ORDER BY created_at DESC`;
    const [rows] = await bigquery.query(query);
    return rows;
  }
}