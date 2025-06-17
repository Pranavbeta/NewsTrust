import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using offline mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-client-timeout': '5000',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }
);

// Database types
interface Database {
  public: {
    Tables: {
      news: {
        Row: {
          id: string;
          title: string;
          summary: string;
          content?: string;
          source: string;
          source_url: string;
          category: string;
          language: string;
          location?: string;
          image_url?: string;
          admin_status: 'valid' | 'fake' | 'pending';
          admin_note?: string;
          is_breaking: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          summary: string;
          content?: string;
          source: string;
          source_url: string;
          category: string;
          language: string;
          location?: string;
          image_url?: string;
          admin_status?: 'valid' | 'fake' | 'pending';
          admin_note?: string;
          is_breaking?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string;
          content?: string;
          source?: string;
          source_url?: string;
          category?: string;
          language?: string;
          location?: string;
          image_url?: string;
          admin_status?: 'valid' | 'fake' | 'pending';
          admin_note?: string;
          is_breaking?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          news_id: string;
          vote: 'valid' | 'fake' | 'not_sure';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          news_id: string;
          vote: 'valid' | 'fake' | 'not_sure';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          news_id?: string;
          vote?: 'valid' | 'fake' | 'not_sure';
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          news_id: string;
          comment_text: string;
          helpful_votes: number;
          is_flagged: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          news_id: string;
          comment_text: string;
          helpful_votes?: number;
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          news_id?: string;
          comment_text?: string;
          helpful_votes?: number;
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          source_url: string;
          category: string;
          location?: string;
          status: 'pending' | 'approved' | 'rejected';
          admin_note?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          source_url: string;
          category: string;
          location?: string;
          status?: 'pending' | 'approved' | 'rejected';
          admin_note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          source_url?: string;
          category?: string;
          location?: string;
          status?: 'pending' | 'approved' | 'rejected';
          admin_note?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}