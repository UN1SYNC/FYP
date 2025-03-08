import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"
import { StudentGradesTable } from "./StudentGradesTable"
import { GradeEditModal } from "./GradeEditModal"
import { AssessmentData, InstructorDataProps } from "./types"
import { createClient } from "@/utils/supabase/client"
import { AddResultModal } from "./AddResultModal"

export const InstructorCourseGrades = ({ instructorData }: InstructorDataProps) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [openAssessments, setOpenAssessments] = useState<{ [key: string]: boolean }>({});
  const [editingAssessment, setEditingAssessment] = useState<AssessmentData | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const courseId = window.location.pathname.split("/")[2];
  const supabase = createClient();
  
  // Add refresh function
  const refreshData = async () => {
    const { data: refreshedData, error } = await supabase.rpc('get_all_course_assessments_data', {
      p_course_id: window.location.pathname.split("/")[2]
    });
    
    if (error) {
      console.error('Error refreshing data:', error);
      return;
    }
    
    // Update the instructorData state in the parent component
    window.location.reload(); // Temporary solution - ideally use state management
  };

  if (!instructorData || Object.keys(instructorData).length === 0) {
    return <div className="text-center py-8">No assessment data available</div>;
  }

  const renderAssessmentSection = (
    assessmentType: string,
    assessments: AssessmentData[]
  ) => {
    if (!assessments || assessments.length === 0) return null;

    return (
      <Collapsible
        open={openSections[assessmentType]}
        onOpenChange={(isOpen) => 
          setOpenSections(prev => ({ ...prev, [assessmentType]: isOpen }))
        }
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CollapsibleTrigger className="w-full">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg capitalize">{assessmentType}</CardTitle>
                {openSections[assessmentType] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {assessments.map((assessment, index) => (
                <Collapsible
                  key={assessment.assessment_id}
                  open={openAssessments[assessment.assessment_id]}
                  onOpenChange={(isOpen) =>
                    setOpenAssessments(prev => ({ ...prev, [assessment.assessment_id]: isOpen }))
                  }
                  className="mb-4"
                >
                  <Card>
                    <CardHeader className="py-3">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <h3 className="text-lg font-medium">{assessment.name}</h3>
                            <div className="text-sm text-gray-500">
                              Class Average: {assessment.average}/{assessment.total} (
                              {((assessment.average / assessment.total) * 100).toFixed(1)}%)
                            </div>
                          </div>
                          {openAssessments[assessment.assessment_id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="py-2">
                        <StudentGradesTable assessment={assessment} />
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-4"
                          onClick={() => setEditingAssessment(assessment)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Records
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Course Assessments Overview</h2>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Result
        </Button>
      </div>
      
      {Object.entries(instructorData).map(([assessmentType, assessments]) => (
        <React.Fragment key={assessmentType}>
          {renderAssessmentSection(assessmentType, assessments as AssessmentData[])}
        </React.Fragment>
      ))}

      {editingAssessment && (
        <GradeEditModal
          assessment={editingAssessment}
          open={!!editingAssessment}
          onOpenChange={(open) => !open && setEditingAssessment(null)}
          onSaveSuccess={refreshData}
        />
      )}

      <AddResultModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSaveSuccess={refreshData}
        courseId={courseId}
      />
    </div>
  );
}; 