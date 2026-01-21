import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type GameData, type Level } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useLevels() {
  return useQuery({
    queryKey: [api.levels.list.path],
    queryFn: async () => {
      const res = await fetch(api.levels.list.path);
      if (!res.ok) throw new Error("Failed to fetch levels");
      return api.levels.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateLevels() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: GameData) => {
      // Validate with schema before sending
      const validated = api.levels.update.input.parse(data);
      
      const res = await fetch(api.levels.update.path, {
        method: api.levels.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.levels.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to update levels");
      }
      
      return api.levels.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.levels.list.path] });
      toast({
        title: "Levels Saved",
        description: "Your changes have been successfully saved to the server.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useExportScript() {
  const { toast } = useToast();

  return async () => {
    try {
      const res = await fetch(api.levels.export.path);
      if (!res.ok) throw new Error("Failed to export script");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gd.py';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Exported!",
        description: "gd.py has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
}
