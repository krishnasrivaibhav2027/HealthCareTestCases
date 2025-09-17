import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Bot, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Download,
  Eye
} from "lucide-react";

interface TestCase {
  id: string;
  title: string;
  description: string;
  requirementId: string;
  jiraKey: string;
  priority: string;
  status: "passed" | "failed" | "pending" | "not-run";
  aiGenerated: boolean;
  reviewed: boolean;
  reviewedBy?: string;
  complianceChecks: string[];
  lastExecuted?: string;
  createdAt: string;
}

// TODO: remove mock functionality - replace with real test case data
const mockTestCases: TestCase[] = [
  {
    id: "tc-1001",
    title: "Verify AES-256 Encryption Implementation",
    description: "Test that patient data is properly encrypted using AES-256 standards",
    requirementId: "1",
    jiraKey: "HSW-1001",
    priority: "Critical",
    status: "passed",
    aiGenerated: true,
    reviewed: true,
    reviewedBy: "John Smith",
    complianceChecks: ["FDA 21 CFR Part 11", "ISO 27001:2013"],
    lastExecuted: "2024-01-15 14:30",
    createdAt: "2024-01-10 09:15",
  },
  {
    id: "tc-1002",
    title: "Validate Data Transmission Security",
    description: "Ensure patient data remains encrypted during transmission",
    requirementId: "1",
    jiraKey: "HSW-1001",
    priority: "Critical",
    status: "passed",
    aiGenerated: true,
    reviewed: true,
    reviewedBy: "Sarah Johnson",
    complianceChecks: ["IEC 62304:2006", "ISO 27001:2013"],
    lastExecuted: "2024-01-15 15:45",
    createdAt: "2024-01-10 09:20",
  },
  {
    id: "tc-2001",
    title: "Multi-factor Authentication Flow",
    description: "Test complete MFA authentication process for healthcare users",
    requirementId: "2",
    jiraKey: "HSW-1002",
    priority: "High",
    status: "failed",
    aiGenerated: true,
    reviewed: false,
    complianceChecks: ["FDA 21 CFR Part 11"],
    lastExecuted: "2024-01-15 11:20",
    createdAt: "2024-01-12 16:30",
  },
  {
    id: "tc-2002",
    title: "Session Management Validation",
    description: "Verify secure session handling and timeout mechanisms",
    requirementId: "2",
    jiraKey: "HSW-1002",
    priority: "High",
    status: "pending",
    aiGenerated: true,
    reviewed: true,
    reviewedBy: "Mike Chen",
    complianceChecks: ["ISO 9001:2015"],
    createdAt: "2024-01-12 16:35",
  },
  {
    id: "tc-4001",
    title: "API Security Validation",
    description: "Test API endpoint security and authorization mechanisms",
    requirementId: "4",
    jiraKey: "HSW-1004",
    priority: "High",
    status: "not-run",
    aiGenerated: false,
    reviewed: true,
    reviewedBy: "Emily Davis",
    complianceChecks: ["IEC 62304:2006", "ISO 13485:2016"],
    createdAt: "2024-01-14 10:15",
  },
];

export default function TestCases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");

  const filteredTestCases = mockTestCases.filter((testCase) => {
    const matchesSearch = 
      testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.jiraKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || testCase.status === filterStatus;
    const matchesSource = filterSource === "all" || 
      (filterSource === "ai" && testCase.aiGenerated) ||
      (filterSource === "manual" && !testCase.aiGenerated);
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "destructive";
      case "High": return "default";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed": return "default";
      case "failed": return "destructive";
      case "pending": return "secondary";
      case "not-run": return "outline";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed": return <CheckCircle className="h-4 w-4 text-chart-1" />;
      case "failed": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "pending": return <Clock className="h-4 w-4 text-chart-2" />;
      case "not-run": return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const totalTestCases = mockTestCases.length;
  const aiGeneratedCount = mockTestCases.filter(tc => tc.aiGenerated).length;
  const passedCount = mockTestCases.filter(tc => tc.status === "passed").length;
  const failedCount = mockTestCases.filter(tc => tc.status === "failed").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Cases</h1>
        <p className="text-muted-foreground mt-2">
          Manage and execute AI-generated and manual test cases for healthcare compliance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Test Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTestCases}</div>
            <p className="text-xs text-muted-foreground">
              {aiGeneratedCount} AI generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{passedCount}</div>
            <p className="text-xs text-muted-foreground">
              {((passedCount / totalTestCases) * 100).toFixed(1)}% pass rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{failedCount}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              {mockTestCases.filter(tc => !tc.reviewed).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Cases Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Test Cases</CardTitle>
            <Button variant="outline" size="sm" data-testid="button-export-test-cases">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search test cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-test-cases"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-filter-status">
                  <Filter className="h-4 w-4 mr-2" />
                  Status: {filterStatus}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("passed")}>Passed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("failed")}>Failed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("not-run")}>Not Run</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-filter-source">
                  <Filter className="h-4 w-4 mr-2" />
                  Source: {filterSource}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterSource("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("ai")}>AI Generated</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("manual")}>Manual</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Case</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Last Executed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTestCases.map((testCase) => (
                <TableRow key={testCase.id} data-testid={`row-testcase-${testCase.id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{testCase.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {testCase.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">{testCase.jiraKey}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(testCase.priority)}>
                      {testCase.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testCase.status)}
                      <Badge variant={getStatusColor(testCase.status)}>
                        {testCase.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {testCase.aiGenerated ? (
                        <>
                          <Bot className="h-4 w-4 text-primary" />
                          <span className="text-sm">AI Generated</span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Manual</span>
                        </>
                      )}
                      {!testCase.reviewed && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Needs Review
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {testCase.complianceChecks.map((check) => (
                        <Badge key={check} variant="outline" className="text-xs">
                          {check.split(':')[0]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {testCase.lastExecuted || "Never"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-view-${testCase.id}`}
                    >
                      <Eye className="h-4 w-4" />
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