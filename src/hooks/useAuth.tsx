import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session storage key for tab identification
const TAB_ID_KEY = 'evs_tab_id';
const SESSION_LOCK_KEY = 'evs_session_lock';

const generateTabId = () => Math.random().toString(36).substring(7);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const tabId = useRef<string>(generateTabId());
  const isRefreshing = useRef<boolean>(false);
  const lastEventTime = useRef<number>(0);

  // Handle session updates with deduplication
  const updateSession = useCallback((newSession: Session | null, event?: AuthChangeEvent) => {
    const now = Date.now();
    
    // Deduplicate rapid events (within 100ms)
    if (now - lastEventTime.current < 100) {
      return;
    }
    lastEventTime.current = now;

    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);
  }, []);

  // Handle token refresh errors
  const handleTokenRefreshError = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;

    try {
      // Try to get a fresh session
      const { data: { session: freshSession }, error } = await supabase.auth.getSession();
      
      if (error || !freshSession) {
        // Clear local state if refresh fails
        setSession(null);
        setUser(null);
        console.log('Session refresh failed, user logged out');
      } else {
        updateSession(freshSession);
      }
    } catch (e) {
      console.error('Token refresh error:', e);
      setSession(null);
      setUser(null);
    } finally {
      isRefreshing.current = false;
    }
  }, [updateSession]);

  useEffect(() => {
    // Store tab ID
    sessionStorage.setItem(TAB_ID_KEY, tabId.current);
    
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;

        // Handle specific events
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
          updateSession(currentSession, event);
        } else if (event === 'SIGNED_OUT') {
          updateSession(null, event);
        } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          updateSession(currentSession, event);
        } else {
          updateSession(currentSession, event);
        }
      }
    );

    // THEN check for existing session
    const initSession = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (error.message?.includes('refresh_token')) {
            await handleTokenRefreshError();
          } else {
            if (mounted) {
              setSession(null);
              setUser(null);
              setLoading(false);
            }
          }
          return;
        }

        if (mounted) {
          updateSession(existingSession);
        }
      } catch (e) {
        console.error('Session init error:', e);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initSession();

    // Handle visibility change for session refresh
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session) {
        // Silently check session when tab becomes visible
        supabase.auth.getSession().then(({ data: { session: freshSession }, error }) => {
          if (!error && freshSession && mounted) {
            updateSession(freshSession);
          } else if (error?.message?.includes('refresh_token')) {
            handleTokenRefreshError();
          }
        });
      }
    };

    // Handle storage events for cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sb-' + (import.meta.env.VITE_SUPABASE_PROJECT_ID || '') + '-auth-token') {
        // Another tab changed auth state
        supabase.auth.getSession().then(({ data: { session: freshSession } }) => {
          if (mounted) {
            updateSession(freshSession);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateSession, handleTokenRefreshError]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error) {
      toast({
        title: "Cadastro realizado!",
        description: "Sua conta foi criada com sucesso!",
        duration: 5000,
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.session) {
      // Ensure session is properly stored
      updateSession(data.session);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta à EVS.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      toast({
        title: "Sessão encerrada",
        description: "Até logo!",
      });
    } catch (e) {
      console.error('Sign out error:', e);
      // Force clear local state even if signOut fails
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};