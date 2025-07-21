
import { useToast, toast } from "@/hooks/use-toast";

// Helper functions for different toast types
const showSuccess = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: "default",
  });
};

const showError = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: "destructive",
  });
};

const showWarning = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: "destructive",
  });
};

const showInfo = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: "default",
  });
};

export { 
  useToast, 
  toast,
  showSuccess,
  showError,
  showWarning,
  showInfo
};
