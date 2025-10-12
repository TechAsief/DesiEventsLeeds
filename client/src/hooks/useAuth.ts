import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types";

export function useAuth() {
  const { data: response, isLoading } = useQuery<{authenticated: boolean, user: User | null}>({
    queryKey: ["/api/auth/status"],
    retry: false,
  });

  return {
    user: response?.user || null,
    isLoading,
    isAuthenticated: response?.authenticated || false,
  };
}
