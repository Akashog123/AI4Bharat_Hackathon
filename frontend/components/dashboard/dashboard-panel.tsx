import { UserProfile, Course, Job, ConversationState } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./profile-tab";
import { CoursesTab } from "./courses-tab";
import { JobsTab } from "./jobs-tab";
import { InterviewTab } from "./interview-tab";
import { ResumeTab } from "./resume-tab";
import { UserCircle, BookOpen, Briefcase, FileText, Target } from "lucide-react";

interface DashboardPanelProps {
  profile: UserProfile;
  courses: Course[];
  jobs: Job[];
  state: ConversationState;
  onStateChange: (state: string) => void;
}

export function DashboardPanel({ profile, courses, jobs, state, onStateChange }: DashboardPanelProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <Tabs value={state} onValueChange={onStateChange} className="flex-1 flex flex-col w-full h-full">
        <div className="bg-white px-4 border-b">
          <TabsList className="w-full justify-start gap-4 bg-transparent p-0 h-14">
            <TabsTrigger
              value="discovery"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-4 gap-2 font-medium"
            >
              <UserCircle className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-4 gap-2 font-medium"
            >
              <BookOpen className="w-4 h-4" /> Courses
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-4 gap-2 font-medium"
            >
              <Briefcase className="w-4 h-4" /> Jobs
            </TabsTrigger>
            <TabsTrigger
              value="interview"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-4 gap-2 font-medium"
            >
              <Target className="w-4 h-4" /> Mock Interview
            </TabsTrigger>
            <TabsTrigger
              value="resume"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-4 gap-2 font-medium"
            >
              <FileText className="w-4 h-4" /> Resume
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <TabsContent value="greeting" className="mt-0 h-full">
            <ProfileTab profile={profile} />
          </TabsContent>
          <TabsContent value="discovery" className="mt-0 h-full">
            <ProfileTab profile={profile} />
          </TabsContent>
          <TabsContent value="profile_complete" className="mt-0 h-full">
            <ProfileTab profile={profile} />
          </TabsContent>
          <TabsContent value="courses" className="mt-0 h-full">
            <CoursesTab courses={courses} />
          </TabsContent>
          <TabsContent value="jobs" className="mt-0 h-full">
            <JobsTab jobs={jobs} />
          </TabsContent>
          <TabsContent value="interview" className="mt-0 h-full">
            <InterviewTab />
          </TabsContent>
          <TabsContent value="resume" className="mt-0 h-full">
            <ResumeTab profile={profile} />
          </TabsContent>
          <TabsContent value="resume_ready" className="mt-0 h-full">
            <ResumeTab profile={profile} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}