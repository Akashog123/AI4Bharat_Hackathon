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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
      <Tabs value={state} onValueChange={onStateChange} className="flex-1 flex flex-col w-full h-full">
        <div className="bg-white/40 backdrop-blur-md px-6 pt-4 border-b border-white/40">
          <TabsList className="w-full justify-start gap-2 bg-transparent p-0 h-12">
            <TabsTrigger
              value="discovery"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 rounded-t-xl rounded-b-none border-t border-x border-transparent data-[state=active]:border-white h-full px-5 gap-2 font-semibold text-slate-500 transition-all"
            >
              <UserCircle className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 rounded-t-xl rounded-b-none border-t border-x border-transparent data-[state=active]:border-white h-full px-5 gap-2 font-semibold text-slate-500 transition-all"
            >
              <BookOpen className="w-4 h-4" /> Courses
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-700 rounded-t-xl rounded-b-none border-t border-x border-transparent data-[state=active]:border-white h-full px-5 gap-2 font-semibold text-slate-500 transition-all"
            >
              <Briefcase className="w-4 h-4" /> Jobs
            </TabsTrigger>
            <TabsTrigger
              value="interview"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-fuchsia-700 rounded-t-xl rounded-b-none border-t border-x border-transparent data-[state=active]:border-white h-full px-5 gap-2 font-semibold text-slate-500 transition-all"
            >
              <Target className="w-4 h-4" /> Mock Interview
            </TabsTrigger>
            <TabsTrigger
              value="resume"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 rounded-t-xl rounded-b-none border-t border-x border-transparent data-[state=active]:border-white h-full px-5 gap-2 font-semibold text-slate-500 transition-all"
            >
              <FileText className="w-4 h-4" /> Resume
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-white/40">
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