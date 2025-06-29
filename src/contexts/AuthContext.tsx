import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  connectionError: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  retryConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return url && key && 
           url !== 'https://placeholder.supabase.co' && 
           key !== 'placeholder-key' &&
           !url.includes('placeholder') &&
           !key.includes('placeholder');
  };

  const testSupabaseConnection = async (): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured()) {
        setConnectionError('Supabase environment variables are not properly configured. Please check your .env file.');
        return false;
      }

      // Test basic connection with a simple query
      const { error } = await Promise.race([
        supabase.from('profiles').select('count').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 3000)
        )
      ]) as any;

      if (error) {
        if (error.code === '42P01') {
          setConnectionError('Database tables not found. Please run the migration scripts as described in MIGRATION_SETUP_GUIDE.md');
        } else if (error.message.includes('JWT')) {
          setConnectionError('Invalid Supabase credentials. Please check your VITE_SUPABASE_ANON_KEY in .env file.');
        } else {
          setConnectionError(`Database connection error: ${error.message}`);
        }
        return false;
      }

      setConnectionError(null);
      return true;
    } catch (error: any) {
      if (error.message.includes('timeout')) {
        setConnectionError('Unable to connect to Supabase. Please check your VITE_SUPABASE_URL and ensure your Supabase project is active.');
      } else {
        setConnectionError(`Connection test failed: ${error.message}`);
      }
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First test the connection
        const connectionOk = await testSupabaseConnection();
        if (!connectionOk || !mounted) {
          setLoading(false);
          return;
        }

        // Get initial session with shorter timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 3000)
        );

        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Session error:', error);
          setConnectionError(`Authentication error: ${error.message}`);
          setLoading(false);
          return;
        }

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfileWithFallback(session.user);
        } else {
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          if (error.message.includes('timeout')) {
            setConnectionError('Connection timeout. Please check your internet connection and Supabase project status.');
          } else {
            setConnectionError(`Initialization failed: ${error.message}`);
          }
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes only if Supabase is configured
    let subscription: any = null;
    if (isSupabaseConfigured()) {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfileWithFallback(session.user);
        } else {
          setProfile(null);
          setLoading(false);
        }
      });
      subscription = authSubscription;
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchProfileWithFallback = async (user: User) => {
    try {
      // Check connection first
      const connectionOk = await testSupabaseConnection();
      if (!connectionOk) {
        const fallbackProfile = createFallbackProfile(user);
        setProfile(fallbackProfile);
        setLoading(false);
        return;
      }

      // Try to fetch profile with shorter timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 2000)
      );

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching profile:', error);
        
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, try to create it
          console.log('Profile not found, creating new profile...');
          await createProfileInBackground(user);
        } else if (error.code === '42P01') {
          // Table doesn't exist
          setConnectionError('Profiles table not found. Please run the database migrations.');
        }
        
        // Always provide fallback profile
        const fallbackProfile = createFallbackProfile(user);
        setProfile(fallbackProfile);
      } else {
        setProfile(data);
        setConnectionError(null);
      }
    } catch (error: any) {
      console.error('Profile fetch failed:', error);
      
      if (error.message.includes('timeout')) {
        setConnectionError('Profile fetch timed out. Using offline mode.');
      } else {
        setConnectionError(`Profile error: ${error.message}`);
      }
      
      // Always provide fallback profile
      const fallbackProfile = createFallbackProfile(user);
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const createFallbackProfile = (user: User): Profile => {
    return {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
      is_admin: user.email === 'admin@newsverify.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const createProfileInBackground = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          is_admin: user.email === 'admin@newsverify.com'
        });

      if (!error) {
        console.log('Profile created successfully');
        // Refresh profile data
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
          setConnectionError(null);
        }
      } else {
        console.error('Failed to create profile:', error);
      }
    } catch (error) {
      console.error('Background profile creation failed:', error);
    }
  };

  const retryConnection = async () => {
    setLoading(true);
    setConnectionError(null);
    
    try {
      const connectionOk = await testSupabaseConnection();
      if (connectionOk && user) {
        await fetchProfileWithFallback(user);
      }
    } catch (error: any) {
      setConnectionError(`Retry failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not properly configured. Please check your environment variables.');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      console.log('User signed up successfully:', data.user?.email);
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw new Error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not properly configured. Please check your environment variables.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        }
        throw error;
      }

      console.log('User signed in successfully:', data.user?.email);
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else {
        // Just clear local state if Supabase isn't configured
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not properly configured. Please check your environment variables.');
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error resending confirmation:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    if (!isSupabaseConfigured()) {
      // Update local state only if Supabase isn't configured
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    connectionError,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resendConfirmation,
    retryConnection,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};