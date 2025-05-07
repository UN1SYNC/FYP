import { useToast } from "@/hooks/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { QuizModal } from "./QuizModal";

export default function MaterialsList({ materials }: { materials: string[] }) {
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const handleDownload = async (filePath: string, e: React.MouseEvent) => {
    // Stop event propagation to prevent conflicts with checkbox clicks
    e.stopPropagation();
    e.preventDefault();
    
    try {
      console.log("Downloading file:", filePath);
      
      // Remove any leading slashes that might cause issues
      const cleanPath = filePath.replace(/^\/+/, '');
      console.log("Clean path:", cleanPath);
      
      // Try getting the public URL first, which might work better for some setups
      const { data: publicUrlData } = await supabase
        .storage
        .from('NUST-1')
        .getPublicUrl(cleanPath);
      
      if (publicUrlData && publicUrlData.publicUrl) {
        console.log("Using public URL method");
        // Open in a new tab first as a fallback
        window.open(publicUrlData.publicUrl, '_blank');
        
        // Also try direct download
        const response = await fetch(publicUrlData.publicUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filePath.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }
      
      // Fall back to direct download if public URL doesn't work
      console.log("Falling back to direct download");
      const { data, error } = await supabase
        .storage
        .from('NUST-1')
        .download(cleanPath);

      if (error) {
        console.error("Supabase download error:", error);
        throw error;
      }

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filePath.split('/').pop() || 'download';
      console.log("Downloading file:", filePath);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Download error details:', error);
      
      // Show a more helpful error message
      toast({
        title: "Download Failed",
        description: "Could not download the file. Try refreshing the page or check your internet connection.",
        variant: "destructive",
      });
      
      // Try one more fallback option - direct bucket URL
      try {
        const fileName = filePath.split('/').pop();
        toast({
          title: "Attempting alternative download method",
          description: "Please check your downloads folder after clicking OK.",
        });
        
        // Construct a direct URL to the Supabase storage
        window.open(`https://unisync.supabase.co/storage/v1/object/public/NUST-1/${filePath}`, '_blank');
      } catch (fallbackError) {
        console.error('Fallback download attempt failed:', fallbackError);
      }
    }
  };

  const handleFileSelection = (filePath: string) => {
    setSelectedFiles(prev => 
      prev.includes(filePath) 
        ? prev.filter(f => f !== filePath) 
        : [...prev, filePath]
    );
  };

  const handleGenerateQuiz = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to generate a quiz",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating Quiz",
      description: `Creating quiz from ${selectedFiles.length} selected file(s)`,
    });
    
    setIsGenerating(true);
    
    try {
      // Get the course ID from the URL
      const pathname = window.location.pathname;
      const courseIdMatch = pathname.match(/\/cms\/([^\/]+)/);
      const courseId = courseIdMatch ? courseIdMatch[1] : null;
      
      const response = await fetch('/api/quiz-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePaths: selectedFiles,
          courseId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }
      
      const data = await response.json();
      setGeneratedQuiz(data.quiz);
      setIsQuizModalOpen(true);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseQuizModal = () => {
    setIsQuizModalOpen(false);
    // Reset selection after closing the modal
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-4">
      <ul className="list-none">
        {materials.map((file, idx) => (
          <li key={idx} className="flex items-center space-x-2 py-1">
            <Checkbox 
              id={`file-${idx}`} 
              checked={selectedFiles.includes(file)}
              onCheckedChange={() => handleFileSelection(file)}
            />
            <div className="flex items-center justify-between w-full ml-2">
              <label 
                htmlFor={`file-${idx}`}
                className="text-blue-600 hover:underline cursor-pointer flex-grow"
              >
                {file.split('/').pop()}
              </label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => handleDownload(file, e)}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
      
      {materials.length > 0 && (
        <div className="pt-4">
          <Button 
            onClick={handleGenerateQuiz}
            disabled={selectedFiles.length === 0 || isGenerating}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              `Generate Quiz from Selected Files (${selectedFiles.length})`
            )}
          </Button>
        </div>
      )}
      
      <QuizModal 
        quiz={generatedQuiz} 
        isOpen={isQuizModalOpen} 
        onClose={handleCloseQuizModal} 
      />
    </div>
  );
} 