import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Minus,
  Filter
} from "lucide-react";

interface TraceabilityItem {
  requirementId: string;
  jiraKey: string;
  requirementTitle: string;
  testCases: Array<{
    id: string;
    title: string;
    status: "passed" | "failed" | "pending";
    coverage: number;
  }>;
  complianceStandards: string[];
  coverage: number;
  status: "complete" | "partial" | "missing";
}

// TODO: remove mock functionality - replace with real traceability data
const mockTraceabilityData: TraceabilityItem[] = [
  {
    requirementId: "1",
    jiraKey: "HSW-1001",
    requirementTitle: "Patient Data Encryption",
    testCases: [
      {
        id: "tc-1001",
        title: "Verify AES-256 Encryption Implementation",
        status: "passed",
        coverage: 95,
      },
      {
        id: "tc-1002",
        title: "Validate Data Transmission Security",
        status: "passed",
        coverage: 88,
      },
      {
        id: "tc-1003",
        title: "Test Key Management System",
        status: "pending",
        coverage: 75,
      },
    ],
    complianceStandards: ["FDA", "ISO 27001", "IEC 62304"],
    coverage: 86,
    status: "complete",
  },
  {
    requirementId: "2",
    jiraKey: "HSW-1002",
    requirementTitle: "User Authentication System",
    testCases: [
      {
        id: "tc-2001",
        title: "Multi-factor Authentication Flow",
        status: "passed",
        coverage: 92,
      },
      {
        id: "tc-2002",
        title: "Session Management Validation",
        status: "failed",
        coverage: 45,
      },
    ],
    complianceStandards: ["FDA", "ISO 9001"],
    coverage: 68,
    status: "partial",
  },
  {
    requirementId: "3",
    jiraKey: "HSW-1003",
    requirementTitle: "Audit Logging Module",
    testCases: [],
    complianceStandards: ["FDA", "ISO 13485", "ISO 27001"],
    coverage: 0,
    status: "missing",
  },
  {
    requirementId: "4",
    jiraKey: "HSW-1004",
    requirementTitle: "Device Integration API",
    testCases: [
      {
        id: "tc-4001",
        title: "API Security Validation",
        status: "passed",
        coverage: 85,
      },
      {
        id: "tc-4002",
        title: "Data Format Compliance",
        status: "pending",
        coverage: 60,
      },
      {
        id: "tc-4003",
        title: "Error Handling Verification",
        status: "passed",
        coverage: 78,
      },
    ],
    complianceStandards: ["IEC 62304", "ISO 13485"],
    coverage: 74,
    status: "partial",
  },
];

interface TraceabilityMatrixProps {
  className?: string;
}

export function TraceabilityMatrix({ className }: TraceabilityMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = mockTraceabilityData.filter((item) => {
    const matchesSearch = 
      item.jiraKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "default";
      case "partial":
        return "secondary";
      case "missing":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getTestCaseStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-chart-1" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "pending":
        return <Minus className="h-4 w-4 text-chart-2" />;
      default:
        return null;
    }
  };

  const totalRequirements = mockTraceabilityData.length;
  const completeRequirements = mockTraceabilityData.filter(item => item.status === "complete").length;
  const partialRequirements = mockTraceabilityData.filter(item => item.status === "partial").length;
  const missingRequirements = mockTraceabilityData.filter(item => item.status === "missing").length;

  const overallCoverage = mockTraceabilityData.reduce((sum, item) => sum + item.coverage, 0) / totalRequirements;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequirements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Complete Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{completeRequirements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Partial Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{partialRequirements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">No Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{missingRequirements}</div>
          </CardContent>
        </Card>
      </div>

      {/* Traceability Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Requirement to Test Case Traceability</CardTitle>
            <div className="flex gap-2">
              <div className="text-sm text-muted-foreground">
                Overall Coverage: <span className="font-semibold">{overallCoverage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requirements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-traceability"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                data-testid="filter-all"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "complete" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("complete")}
                data-testid="filter-complete"
              >
                Complete
              </Button>
              <Button
                variant={statusFilter === "partial" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("partial")}
                data-testid="filter-partial"
              >
                Partial
              </Button>
              <Button
                variant={statusFilter === "missing" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("missing")}
                data-testid="filter-missing"
              >
                Missing
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requirement</TableHead>
                <TableHead>Test Cases</TableHead>
                <TableHead>Compliance Standards</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.requirementId} data-testid={`row-requirement-${item.jiraKey}`}>
                  <TableCell>
                    <div>
                      <div className="font-mono text-sm">{item.jiraKey}</div>
                      <div className="font-medium">{item.requirementTitle}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.testCases.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No test cases</div>
                      ) : (
                        item.testCases.map((testCase) => (
                          <div key={testCase.id} className="flex items-center gap-2">
                            {getTestCaseStatusIcon(testCase.status)}
                            <span className="text-sm">{testCase.title}</span>
                            <span className="text-xs text-muted-foreground">
                              ({testCase.coverage}%)
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.complianceStandards.map((standard) => (
                        <Badge key={standard} variant="outline" className="text-xs">
                          {standard}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{item.coverage}%</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-view-${item.jiraKey}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}