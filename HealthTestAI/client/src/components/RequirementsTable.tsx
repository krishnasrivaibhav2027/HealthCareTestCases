import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot, ChevronDown, Filter, Plus, RefreshCw } from "lucide-react";

interface Requirement {
  id: string;
  jiraKey: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignee?: string;
  complianceStandards: string[];
  testCasesGenerated?: number;
}

const mockRequirements: Requirement[] = [
  {
    id: "1",
    jiraKey: "HSW-1001",
    title: "Patient Data Encryption",
    description: "Implement AES-256 encryption for all patient data at rest and in transit",
    priority: "Critical",
    status: "In Progress",
    assignee: "John Smith",
    complianceStandards: ["FDA", "ISO 27001", "IEC 62304"],
    testCasesGenerated: 8,
  },
  {
    id: "2", 
    jiraKey: "HSW-1002",
    title: "User Authentication System",
    description: "Multi-factor authentication for healthcare professionals",
    priority: "High",
    status: "Ready for Testing",
    assignee: "Sarah Johnson",
    complianceStandards: ["FDA", "ISO 9001"],
    testCasesGenerated: 12,
  },
  {
    id: "3",
    jiraKey: "HSW-1003", 
    title: "Audit Logging Module",
    description: "Comprehensive audit trail for all system activities",
    priority: "Medium",
    status: "To Do",
    assignee: "Mike Chen",
    complianceStandards: ["FDA", "ISO 13485", "ISO 27001"],
  },
  {
    id: "4",
    jiraKey: "HSW-1004",
    title: "Device Integration API",
    description: "Secure API endpoints for medical device data integration",
    priority: "High", 
    status: "In Progress",
    assignee: "Emily Davis",
    complianceStandards: ["IEC 62304", "ISO 13485"],
  },
];

interface RequirementsTableProps {
  onGenerateTestCases?: (requirement: Requirement) => void;
}

export function RequirementsTable({ onGenerateTestCases }: RequirementsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [requirements, setRequirements] = useState(mockRequirements);

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch = 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.jiraKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = filterPriority === "All" || req.priority === filterPriority;
    
    return matchesSearch && matchesPriority;
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
      case "Ready for Testing": return "default";
      case "In Progress": return "secondary";
      case "To Do": return "outline";
      case "Done": return "outline";
      default: return "outline";
    }
  };

  const handleGenerateTestCases = (requirement: Requirement) => {
    console.log(`Generating test cases for ${requirement.jiraKey}`);
    onGenerateTestCases?.(requirement);
  };

  const handleRefreshFromJira = () => {
    console.log("Refreshing requirements from Jira...");
    // TODO: remove mock functionality - implement actual Jira integration
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Requirements from Jira</CardTitle>
          <Button 
            onClick={handleRefreshFromJira} 
            variant="outline" 
            size="sm"
            data-testid="button-refresh-jira"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh from Jira
          </Button>
        </div>
        <div className="flex gap-4 items-center mt-4">
          <Input
            placeholder="Search requirements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-requirements"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-filter-priority">
                <Filter className="h-4 w-4 mr-2" />
                Priority: {filterPriority}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterPriority("All")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("Critical")}>Critical</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("High")}>High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("Medium")}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("Low")}>Low</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jira Key</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Test Cases</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequirements.map((requirement) => (
              <TableRow key={requirement.id} data-testid={`row-requirement-${requirement.jiraKey}`}>
                <TableCell className="font-mono text-sm">{requirement.jiraKey}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{requirement.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {requirement.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(requirement.priority)}>
                    {requirement.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(requirement.status)}>
                    {requirement.status}
                  </Badge>
                </TableCell>
                <TableCell>{requirement.assignee || "Unassigned"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {requirement.complianceStandards.map((standard) => (
                      <Badge key={standard} variant="outline" className="text-xs">
                        {standard}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {requirement.testCasesGenerated ? (
                    <span className="text-sm text-muted-foreground">
                      {requirement.testCasesGenerated} generated
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleGenerateTestCases(requirement)}
                    variant="default"
                    size="sm"
                    data-testid={`button-generate-${requirement.jiraKey}`}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Generate Test Cases
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}