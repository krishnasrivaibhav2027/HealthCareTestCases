import { AIChat } from "@/components/AIChat";

export default function AIGeneration() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Test Case Generation</h1>
        <p className="text-muted-foreground mt-2">
          Generate compliant test cases using AI with human-in-the-loop validation
        </p>
      </div>

      <AIChat />
    </div>
  );
}