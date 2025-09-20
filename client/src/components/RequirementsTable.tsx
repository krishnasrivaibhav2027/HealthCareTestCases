import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type Requirement } from "@/lib/api";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot, ChevronDown, Filter, Plus, RefreshCw, AlertCircle } from "lucide-react";

interface RequirementsTableProps {
  onGenerateTestCases?: (requirement: Requirement) => void;
}

export function RequirementsTable({ onGenerateTestCases }: RequirementsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  
  const { data: requirements = [], isLoading, error, refetch } = useQuery({
    queryKey: ['requirements'],
    queryFn: api.getRequirements,
  });

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
    refetch();
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load requirements. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Requirements from Jira</CardTitle>
          <Button 
            onClick={handleRefreshFromJira} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            data-testid="button-refresh-jira"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        ) : (
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
                    <span className="text-sm text-muted-foreground">None</span>
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
        )}
      </CardContent>
    </Card>
  );
}