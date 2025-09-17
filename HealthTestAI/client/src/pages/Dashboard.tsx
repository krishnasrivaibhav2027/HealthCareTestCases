import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComplianceDashboard } from "@/components/ComplianceDashboard";
import { 
  Activity, 
  FileText, 
  CheckSquare, 
  Shield, 
  TrendingUp,
  AlertTriangle,
  Clock,
  Bot
} from "lucide-react";

// TODO: remove mock functionality - replace with real dashboard data
const dashboardStats = {
  totalRequirements: 89,
  generatedTestCases: 247,
  complianceStandards: 5,
  avgCoverage: 82.4,
};

const recentActivity = [
  {
    id: "1",
    type: "test-generation",
    description: "AI generated 8 test cases for HSW-1001",
    timestamp: "2 minutes ago",
    icon: Bot,
    color: "text-primary",
  },
  {
    id: "2", 
    type: "compliance-check",
    description: "FDA compliance validation completed for HSW-1002",
    timestamp: "15 minutes ago",
    icon: Shield,
    color: "text-chart-1",
  },
  {
    id: "3",
    type: "requirement-update",
    description: "New requirement HSW-1005 imported from Jira",
    timestamp: "1 hour ago",
    icon: FileText,
    color: "text-chart-3",
  },
  {
    id: "4",
    type: "test-execution",
    description: "Test case TC-2001 failed validation",
    timestamp: "2 hours ago",
    icon: AlertTriangle,
    color: "text-destructive",
  },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Healthcare Test Generation Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor compliance, track test case generation, and ensure healthcare software quality
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requirements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalRequirements}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.generatedTestCases}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +34 AI generated this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Standards</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.complianceStandards}</div>
            <p className="text-xs text-muted-foreground">
              FDA, ISO, IEC standards tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Coverage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.avgCoverage}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +5.2% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" data-testid="button-import-requirements">
              <FileText className="h-4 w-4 mr-2" />
              Import from Jira
            </Button>
            <Button className="w-full justify-start" variant="outline" data-testid="button-generate-ai">
              <Bot className="h-4 w-4 mr-2" />
              AI Test Generation
            </Button>
            <Button className="w-full justify-start" variant="outline" data-testid="button-run-compliance">
              <Shield className="h-4 w-4 mr-2" />
              Run Compliance Check
            </Button>
            <Button className="w-full justify-start" variant="outline" data-testid="button-export-reports">
              <Activity className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Overview */}
      <ComplianceDashboard />
    </div>
  );
}