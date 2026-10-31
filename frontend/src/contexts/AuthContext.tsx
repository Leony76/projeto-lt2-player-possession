
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
import type { LoggedUserMainInfos } from "@/dtos/loggedUserMainInfos.dto";
import type { UserCredentials } from "@/dtos/userCredentials.dto";

interface AuthContextValue {
  user: LoggedUserMainInfos | null;
  loading: boolean;
  signIn: (credentials: UserCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoggedUserMainInfos | null>(null);
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
    const authenticatedUser = await AuthService.signIn(credentials);
    setUser(authenticatedUser);
  }, []);

  const signOut = useCallback(async () => {
    await AuthService.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, refreshUser }}
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
