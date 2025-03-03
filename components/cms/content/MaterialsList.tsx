import { useToast } from "@/hooks/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function MaterialsList({ materials }: { materials: string[] }) {
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const handleDownload = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('NUST-1')  //change this to dynamic based on UNIVERSITY NAME  MUST DO ---------
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
      console.error('Download error:', error);
    }
  };

  return (
    <ul className="list-disc list-inside text-gray-700">
      {materials.map((file, idx) => (
        <li 
          key={idx} 
          onClick={() => handleDownload(file)}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          {file.split('/').pop()}
        </li>
      ))}
    </ul>
  );
} 