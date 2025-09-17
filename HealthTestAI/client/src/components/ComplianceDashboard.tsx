import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";

// TODO: remove mock functionality - replace with real compliance data
const complianceStandards = [
  {
    name: "FDA 21 CFR Part 11",
    coverage: 85,
    status: "compliant",
    requirements: 23,
    testCases: 42,
    lastAudit: "2024-01-15",
  },
  {
    name: "IEC 62304",
    coverage: 92,
    status: "compliant",
    requirements: 18,
    testCases: 31,
    lastAudit: "2024-01-10",
  },
  {
    name: "ISO 13485",
    coverage: 76,
    status: "review-needed",
    requirements: 15,
    testCases: 28,
    lastAudit: "2024-01-08",
  },
  {
    name: "ISO 27001",
    coverage: 68,
    status: "non-compliant",
    requirements: 21,
    testCases: 19,
    lastAudit: "2024-01-05",
  },
  {
    name: "ISO 9001",
    coverage: 88,
    status: "compliant",
    requirements: 12,
    testCases: 24,
    lastAudit: "2024-01-12",
  },
];

const coverageData = complianceStandards.map((standard) => ({
  name: standard.name.replace(/\s+/g, '\n'),
  coverage: standard.coverage,
  testCases: standard.testCases,
}));

const statusData = [
  { name: "Compliant", value: 3, color: "hsl(var(--chart-1))" },
  { name: "Review Needed", value: 1, color: "hsl(var(--chart-2))" },
  { name: "Non-Compliant", value: 1, color: "hsl(var(--destructive))" },
];

interface ComplianceDashboardProps {
  className?: string;
}

export function ComplianceDashboard({ className }: ComplianceDashboardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-chart-1" />;
      case "review-needed":
        return <Clock className="h-4 w-4 text-chart-2" />;
      case "non-compliant":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "default";
      case "review-needed":
        return "secondary";
      case "non-compliant":
        return "destructive";
      default:
        return "outline";
    }
  };

  const totalRequirements = complianceStandards.reduce((sum, std) => sum + std.requirements, 0);
  const totalTestCases = complianceStandards.reduce((sum, std) => sum + std.testCases, 0);
  const avgCoverage = complianceStandards.reduce((sum, std) => sum + std.coverage, 0) / complianceStandards.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Standards</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStandards.length}</div>
            <p className="text-xs text-muted-foreground">
              Regulatory compliance standards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requirements</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequirements}</div>
            <p className="text-xs text-muted-foreground">
              Total compliance requirements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTestCases}</div>
            <p className="text-xs text-muted-foreground">
              Generated test cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Coverage</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCoverage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average compliance coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Coverage by Standard</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coverageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fontSize: 10 }}
                  width={60}
                />
                <YAxis />
                <Bar dataKey="coverage" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {statusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Standards Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Standards Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceStandards.map((standard) => (
              <div
                key={standard.name}
                className="flex items-center justify-between p-4 border rounded-lg"
                data-testid={`compliance-standard-${standard.name.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(standard.status)}
                    <h3 className="font-medium">{standard.name}</h3>
                    <Badge variant={getStatusColor(standard.status)}>
                      {standard.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{standard.requirements} requirements</span>
                    <span>{standard.testCases} test cases</span>
                    <span>Last audit: {standard.lastAudit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{standard.coverage}%</div>
                    <div className="text-xs text-muted-foreground">Coverage</div>
                  </div>
                  <div className="w-32">
                    <Progress value={standard.coverage} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}