import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ResumeTab({ profile }: { profile: UserProfile }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isProfileCompleteEnough = profile.name && profile.skills?.length > 0 && profile.education_level;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const userId = localStorage.getItem("sahaj_user_id");
      if (!userId) {
        throw new Error("User ID not found. Please start a conversation first.");
      }

      const resumeData = {
        name: profile.name,
        education: [
          profile.education_level,
          profile.education_stream
        ].filter(Boolean).join(" - "),
        skills: profile.skills || [],
        experience: profile.work_experience?.map(e => ({
          role: e.type,
          domain: e.domain,
          years: e.years
        })) || [],
        location: profile.location_preference,
      };

      const response = await fetch(`${API_URL}/api/resume/generate/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setDownloadUrl(`${API_URL}${data.download_url}`);
    } catch (err: any) {
      console.error("Failed to generate resume:", err);
      setError(err.message || "Failed to generate resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 max-w-2xl mx-auto py-12 px-4">
      <div className="space-y-4 relative">
        <div className="absolute -top-6 -right-6 h-20 w-20 bg-emerald-100 rounded-full blur-2xl opacity-50" />
        <div className="absolute -bottom-6 -left-6 h-20 w-20 bg-teal-100 rounded-full blur-2xl opacity-50" />

        <div className="h-24 w-24 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner mx-auto transform -rotate-3 z-10 relative">
          <FileText className="h-12 w-12 transform rotate-3" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight z-10 relative">AI Resume Builder</h2>
        <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed z-10 relative">
          Create a professional resume instantly based on your conversation with Sahaj. No formatting headaches, just results.
        </p>
      </div>

      {!isProfileCompleteEnough ? (
        <Card className="border-red-100 bg-red-50/50 shadow-sm w-full max-w-md">
          <CardContent className="pt-6 pb-6 flex flex-col items-center text-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="font-semibold text-red-900 mb-1">More Information Needed</p>
              <p className="text-sm text-red-800/80">
                Please chat with Sahaj to complete your profile (name, education, and skills) before generating a resume.
              </p>
            </div>
            <div className="w-full mt-4 space-y-1">
              <div className="flex justify-between text-xs text-red-700 font-medium px-1">
                <span>Profile Completion</span>
                <span>{Math.round((Object.values(profile).filter(Boolean).length / Object.keys(profile).length) * 100)}%</span>
              </div>
              <Progress value={(Object.values(profile).filter(Boolean).length / Object.keys(profile).length) * 100} className="h-1.5 bg-red-100" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full space-y-6">
          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="pb-3 text-left">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                <Sparkles className="w-5 h-5" /> Ready to Generate
              </CardTitle>
              <CardDescription>
                We'll use your completed profile to build a tailored ATS-friendly PDF resume.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left">
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>Professional formatting automatically applied</li>
                <li>Skills and experience highlighted for your target jobs</li>
                <li>Translated to English if needed</li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2 flex flex-col gap-4">
              {error && (
                <div className="w-full p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 text-left">
                  {error}
                </div>
              )}

              {downloadUrl ? (
                <div className="w-full flex flex-col gap-3">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-emerald-600" />
                      <div className="text-left">
                        <p className="font-semibold text-emerald-900">sahaj_resume.pdf</p>
                        <p className="text-xs text-emerald-700">Ready to download</p>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="lg" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-md">
                    <a href={downloadUrl} download>
                      <Download className="w-5 h-5 mr-2" /> Download Resume
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => setDownloadUrl(null)} className="w-full text-gray-600">
                    Generate New Version
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full h-12 text-md rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
                  onClick={handleGenerateResume}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" /> Generate Resume
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}