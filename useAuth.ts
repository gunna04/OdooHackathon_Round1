import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  isPublic: boolean;
  isAdmin: boolean;
  profileImageUrl?: string;
  skills: any[];
  availability: any[];
}

interface AuthResponse {
  user: User;
  token: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      console.log('Fetching user with token:', token ? 'Token present' : 'No token');
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('User fetch failed:', response.status, response.statusText);
        throw new Error('Failed to fetch user');
      }
      
      const userData = await response.json();
      console.log('User data received:', userData);
      return userData;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      console.log('Login successful, setting token:', data.token ? 'Token received' : 'No token');
      setToken(data.token);
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(["/api/auth/user"], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(["/api/auth/user"], data.user);
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    queryClient.clear();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!token,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
