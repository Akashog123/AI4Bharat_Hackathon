import { UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, MapPin, Briefcase, GraduationCap, CheckCircle2 } from "lucide-react";
import { calculateProfileCompletion } from "@/lib/utils";

export function ProfileTab({ profile }: { profile: UserProfile }) {
  const progress = calculateProfileCompletion(profile);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-5 mb-8">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-inner">
            <User className="h-10 w-10" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold text-slate-800 truncate tracking-tight mb-1">
              {profile.name || "Your Profile"}
            </h2>
            <p className="text-slate-500 flex items-center gap-1.5 font-medium">
              {profile.profile_complete ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-600">Profile Complete</span>
                </>
              ) : (
                "Complete your profile through conversation"
              )}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold tracking-wide uppercase">
            <span className="text-slate-500">Completion</span>
            <span className="text-blue-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-slate-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education & Basics */}
        <Card className="shadow-sm border-white bg-white/70 backdrop-blur-sm rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" /> Education & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Highest Education</p>
              <p className="text-gray-900 font-medium">{profile.education_level || "Not specified"}</p>
              {profile.education_stream && (
                <p className="text-sm text-gray-600 mt-0.5">{profile.education_stream}</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm font-medium text-gray-500 mb-2">Location Preference</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{profile.location_preference || "Not specified"}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm font-medium text-gray-500 mb-2">Job Type Preference</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={profile.job_type_preference ? "default" : "secondary"}>
                  {profile.job_type_preference || "Not specified"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Experience */}
        <Card className="shadow-sm border-white bg-white/70 backdrop-blur-sm rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" /> Skills & Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length > 0 ? (
                  profile.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">No skills listed yet</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm font-medium text-gray-500 mb-3">Work Experience</p>
              <div className="space-y-3">
                {profile.work_experience?.length > 0 ? (
                  profile.work_experience.map((exp, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{exp.domain}</p>
                        <p className="text-gray-500">
                          {exp.type} • {exp.years} {exp.years === 1 ? 'year' : 'years'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">No experience listed yet</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}