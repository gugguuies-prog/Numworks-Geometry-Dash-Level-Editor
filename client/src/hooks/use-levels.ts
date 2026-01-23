import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type GameData, type User, type InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const userQuery = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error("Invalid email or password");
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: [api.levels.list.path] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (user: InsertUser) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: [api.levels.list.path] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: [api.levels.list.path] });
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}

type LoginCredentials = Pick<InsertUser, "email" | "password">;

export function useLevels() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [api.levels.list.path, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(api.levels.list.path);
      if (!res.ok) throw new Error("Failed to fetch levels");
      return res.json() as Promise<GameData>;
    },
  });
}

export function useUpdateLevels() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: GameData) => {
      const res = await fetch(api.levels.update.path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update levels");
      return res.json() as Promise<GameData>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.levels.list.path, user?.id] });
      toast({
        title: "Success",
        description: "Levels saved successfully.",
      });
    },
  });
}

export function useExportScript() {
  const { toast } = useToast();

  return async () => {
    try {
      const res = await fetch("/api/export");
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
