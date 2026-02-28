import { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, IndianRupee, Briefcase, CheckCircle, Navigation } from "lucide-react";

export function JobsTab({ jobs }: { jobs: Job[] }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto py-12">
        <div className="h-20 w-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
          <Briefcase className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">No Jobs Found</h3>
        <p className="text-gray-500">
          We need to know more about your skills and experience to find the right job opportunities for you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Matches</h2>
        <p className="text-gray-500">Opportunities that align with your profile</p>
      </div>

      <div className="grid gap-6">
        {jobs.map((job, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={job.job_type === "full-time" ? "default" : "secondary"}>
                      {job.job_type.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-gray-900 mb-2">{job.title}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-4 text-sm font-medium">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <Briefcase className="w-4 h-4 text-gray-400" /> {job.company}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-green-700 font-semibold bg-green-50 px-2.5 py-1 rounded-md">
                      <IndianRupee className="w-4 h-4" /> {job.salary}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 rounded-lg p-4 mb-4 flex gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 mb-1">Why this fits your profile:</p>
                  <p className="text-orange-900/80 leading-relaxed">{job.reason}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 justify-end gap-3">
              <Button variant="outline" className="text-gray-600">
                Save Job
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Navigation className="w-4 h-4 mr-2" /> Apply Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}