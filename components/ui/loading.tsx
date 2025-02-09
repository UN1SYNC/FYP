import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  );
}
