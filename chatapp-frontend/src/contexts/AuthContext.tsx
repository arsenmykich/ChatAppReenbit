import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, AuthRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/api';
import { signalRService } from '../services/signalr';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      signalRService.updateToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (request: AuthRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login(request);
      
      const userData: User = {
        id: '',
        username: response.username,
        email: response.email,
      };

      setUser(userData);
      setToken(response.token);
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      signalRService.updateToken(response.token);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (request: RegisterRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.register(request);
      
      const userData: User = {
        id: '',
        username: response.username,
        email: response.email,
      };

      setUser(userData);
      setToken(response.token);
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      signalRService.updateToken(response.token);
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    await signalRService.stopConnection();
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 