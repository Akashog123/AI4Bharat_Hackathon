import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Target, RefreshCw, MessageSquare } from "lucide-react";

export function InterviewTab() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 max-w-2xl mx-auto py-12 px-4">
      <div className="space-y-4">
        <div className="h-24 w-24 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner mx-auto transform -rotate-6">
          <Target className="h-12 w-12 transform rotate-6" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Mock Interview Mode</h2>
        <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
          Practice for your next job interview with Sahaj. You'll get real-time feedback on your answers, body language tips, and a summary report.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 w-full">
        <Card className="border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-700">
              <MessageSquare className="w-5 h-5" /> 5-Stage Process
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            From "Tell me about yourself" to situational questions tailored to your target role.
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <RefreshCw className="w-5 h-5" /> Instant Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Get tips on how to improve your answers and build confidence before the real thing.
          </CardContent>
        </Card>
      </div>

      <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto mt-8">
        <Mic className="w-5 h-5 mr-2" /> Start Mock Interview
      </Button>
    </div>
  );
}