# HealthTestAI - Healthcare Test Case Generation Application

## Overview
HealthTestAI is a GenAI-powered application for generating test cases for healthcare systems. It features a React frontend with a Node.js/Express backend, designed to help healthcare organizations create comprehensive test cases for their systems.

## Project Architecture
- **Frontend**: React 18 with TypeScript, Vite build system, TailwindCSS styling
- **Backend**: Node.js with Express, serving both API and static files
- **Database**: Google BigQuery for data warehouse and analytics
- **AI Integration**: Google Generative AI for test case generation
- **UI Components**: Radix UI components for consistent design

## Recent Changes (September 21, 2025)
- Successfully imported from GitHub and configured for Replit environment
- Installed Node.js 20 and all project dependencies
- **MIGRATED DATABASE**: Changed from PostgreSQL to Google BigQuery
- Removed Drizzle ORM and implemented direct BigQuery client integration
- Updated storage layer with BigQuery-specific operations
- Configured development workflow on port 5000 with proper host settings
- Set up deployment configuration for production (autoscale)

## Project Structure
```
HealthTestAI/
├── client/           # React frontend application
│   ├── src/
│   │   ├── components/   # UI components including Radix UI
│   │   ├── pages/        # Application pages
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and API client
├── server/           # Express backend
│   ├── index.ts      # Main server entry point
│   ├── routes.ts     # API routes
│   ├── vite.ts       # Vite dev server configuration
│   └── storage.ts    # Storage utilities
├── shared/           # Shared TypeScript schemas
└── attached_assets/  # Static assets
```

## Development
- **Port**: Application runs on port 5000 (both frontend and backend)
- **Host Configuration**: Properly configured for Replit proxy with allowedHosts: true
- **Database**: Uses environment variable DATABASE_URL for PostgreSQL connection
- **Hot Reload**: Vite HMR enabled for frontend development

## Key Features
- AI-powered test case generation for healthcare systems
- Compliance dashboard for healthcare standards
- Requirements management and traceability matrix
- Real-time chat interface for AI assistance
- Responsive design with modern UI components

## Dependencies
- React ecosystem with TypeScript
- Express.js with session management
- Google Cloud BigQuery client for database operations
- Google Generative AI for AI capabilities
- Radix UI for component library
- TailwindCSS for styling

## Environment Variables
- `GOOGLE_CLOUD_PROJECT_ID`: Google Cloud project ID (gen-ai-project-472608)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account JSON file
- `BIGQUERY_DATASET_ID`: BigQuery dataset name (healthtestai_dataset)
- `NODE_ENV`: Environment mode (development/production)

## BigQuery Setup Status
- ✅ BigQuery client configured and credentials working
- ✅ Database schema migrated from PostgreSQL to BigQuery format
- ⚠️ **Action Required**: Service account needs `bigquery.datasets.create` permission
  - Either grant "BigQuery Data Editor" role to service account
  - Or manually create dataset `healthtestai_dataset` in Google Cloud Console

## Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run db:setup`: Initialize BigQuery dataset and tables (when permissions are available)

## User Preferences
- None specified yet

## Deployment
Configured for Replit autoscale deployment:
- Build command: `npm run build`
- Run command: `npm start`
- Suitable for stateless web applications with database state