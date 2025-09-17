import { ComplianceDashboard } from "@/components/ComplianceDashboard";
import { TraceabilityMatrix } from "@/components/TraceabilityMatrix";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Compliance() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor compliance standards, track coverage, and maintain traceability for healthcare software
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" data-testid="tab-compliance-dashboard">
            Compliance Dashboard
          </TabsTrigger>
          <TabsTrigger value="traceability" data-testid="tab-traceability-matrix">
            Traceability Matrix
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <ComplianceDashboard />
        </TabsContent>
        
        <TabsContent value="traceability" className="mt-6">
          <TraceabilityMatrix />
        </TabsContent>
      </Tabs>
    </div>
  );
}