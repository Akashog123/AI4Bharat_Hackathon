import { Course } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, GraduationCap, Building2, CheckCircle, ExternalLink } from "lucide-react";

export function CoursesTab({ courses }: { courses: Course[] }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto py-12">
        <div className="h-20 w-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
          <GraduationCap className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">No Courses Yet</h3>
        <p className="text-gray-500">
          Tell Sahaj more about your interests and education to get personalized course recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommended Courses</h2>
        <p className="text-gray-500">Based on your skills and career goals</p>
      </div>

      <div className="grid gap-6">
        {courses.map((course, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                      Free Course
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-gray-900 mb-1">{course.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm font-medium">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Building2 className="w-4 h-4" /> {course.provider}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-4 h-4" /> {course.duration}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-lg p-4 mb-4 flex gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Why this course fits you:</p>
                  <p className="text-blue-800/80 leading-relaxed">{course.reason}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 justify-end">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href={course.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  View Course <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}