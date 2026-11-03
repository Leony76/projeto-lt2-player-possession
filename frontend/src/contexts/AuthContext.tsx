
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import axios from "axios";
import { AuthService } from "../services/auth.service";
import type { LoggedUserMainInfosResponse } from "@shared/dtos/loggedUserMainInfos.dto";
import type { UserCredentials } from "@/types/userCredentials.type";

interface AuthContextValue {
  user        : LoggedUserMainInfosResponse | null;
  loading     : boolean;
  signIn      : (credentials: UserCredentials) => Promise<void>;
  signOut     : () => Promise<void>;
  refreshUser : () => Promise<void>;
  updateUser  : (data: Partial<LoggedUserMainInfosResponse>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<LoggedUserMainInfosResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await AuthService.me();
      setUser(currentUser);
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        setUser(null);
      } else {
        throw error;
      }
    }
  }, []);



  useEffect(() => {
    refreshUser()
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [refreshUser]);



  const signIn = useCallback(async (credentials: UserCredentials) => {
    setLoading(true);

    try {
      const authenticatedUser = await AuthService.signIn(credentials);
      setUser(authenticatedUser);
    } finally {
      setLoading(false);
    }
  }, []);



  const updateUser = useCallback((
    data: Partial<LoggedUserMainInfosResponse>
  ) => {
    setUser(currentUser => {
      if (!currentUser) return null;

      return {
        ...currentUser,
        ...data,
      };
    });
  }, []);



  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      await AuthService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);



  return (
    <AuthContext.Provider
    value={{ user, loading, signIn, signOut, refreshUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
