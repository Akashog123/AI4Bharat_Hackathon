import { UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, MapPin, Briefcase, GraduationCap, CheckCircle2 } from "lucide-react";

export function ProfileTab({ profile }: { profile: UserProfile }) {
  const calculateCompletion = () => {
    let score = 0;
    if (profile.name) score += 15;
    if (profile.education_level) score += 15;
    if (profile.skills?.length > 0) score += 20;
    if (profile.work_experience?.length > 0) score += 20;
    if (profile.location_preference) score += 15;
    if (profile.job_type_preference) score += 15;
    return score;
  };

  const progress = calculateCompletion();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <User className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">
              {profile.name || "Your Profile"}
            </h2>
            <p className="text-gray-500 flex items-center gap-1">
              {profile.profile_complete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">Profile Complete</span>
                </>
              ) : (
                "Complete your profile through conversation"
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-600">Completion</span>
            <span className="text-blue-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education & Basics */}
        <Card className="shadow-sm">
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

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-500 mb-2">Location Preference</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{profile.location_preference || "Not specified"}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
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
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-500" /> Skills & Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length > 0 ? (
                  profile.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">No skills listed yet</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-500 mb-3">Work Experience</p>
              <div className="space-y-3">
                {profile.work_experience?.length > 0 ? (
                  profile.work_experience.map((exp, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
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