export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Profile Attributes Structure
export interface ProfileAttributes {
  age_range?: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | 'other';
  student_status?: 'high-school' | 'undergraduate' | 'graduate' | 'not-student';
  location?: {
    city: string;
    state: string;
    country: string;
  };
  school_name?: string;
  workplace?: string;
  occupation?: string;
  industry?: string;
  languages?: string[];
  interests?: string[];
  visibility: 'public' | 'recommendations-only' | 'private';
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          profile_attributes: ProfileAttributes;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          profile_attributes?: ProfileAttributes;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          profile_attributes?: ProfileAttributes;
          created_at?: string;
          updated_at?: string;
        };
      };
      onboarding_progress: {
        Row: {
          id: string;
          user_id: string;
          current_step: number;
          completed_steps: number[];
          skipped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_step?: number;
          completed_steps?: number[];
          skipped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_step?: number;
          completed_steps?: number[];
          skipped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          leader_id: string;
          is_private: boolean;
          avatar_url: string | null;
          is_verified: boolean;
          verified_at: string | null;
          member_count: number;
          active_projects_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          leader_id: string;
          is_private?: boolean;
          avatar_url?: string | null;
          is_verified?: boolean;
          verified_at?: string | null;
          member_count?: number;
          active_projects_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          leader_id?: string;
          is_private?: boolean;
          avatar_url?: string | null;
          is_verified?: boolean;
          verified_at?: string | null;
          member_count?: number;
          active_projects_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_tags: {
        Row: {
          id: string;
          community_id: string;
          tag_name: string;
          source: 'ai' | 'leader';
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          tag_name: string;
          source: 'ai' | 'leader';
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          tag_name?: string;
          source?: 'ai' | 'leader';
          approved?: boolean;
          created_at?: string;
        };
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          role: 'leader' | 'member';
          status: 'pending' | 'active' | 'rejected';
          joined_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          role: 'leader' | 'member';
          status?: 'pending' | 'active' | 'rejected';
          joined_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          role?: 'leader' | 'member';
          status?: 'pending' | 'active' | 'rejected';
          joined_at?: string;
        };
      };
      proposals: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          title: string;
          description: string;
          status: 'pending' | 'active' | 'rejected' | 'archived';
          upvotes: number;
          downvotes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          title: string;
          description: string;
          status?: 'pending' | 'active' | 'rejected' | 'archived';
          upvotes?: number;
          downvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          status?: 'pending' | 'active' | 'rejected' | 'archived';
          upvotes?: number;
          downvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposal_votes: {
        Row: {
          id: string;
          proposal_id: string;
          user_id: string;
          vote_type: 'upvote' | 'downvote';
          created_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          user_id: string;
          vote_type: 'upvote' | 'downvote';
          created_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          user_id?: string;
          vote_type?: 'upvote' | 'downvote';
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          community_id: string;
          created_by: string;
          title: string;
          description: string;
          goal_amount: number;
          current_amount: number;
          deadline: string;
          image_url: string | null;
          hover_summary: string | null;
          status: 'pending' | 'active' | 'funded' | 'expired' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          created_by: string;
          title: string;
          description: string;
          goal_amount: number;
          current_amount?: number;
          deadline: string;
          image_url?: string | null;
          hover_summary?: string | null;
          status?: 'pending' | 'active' | 'funded' | 'expired' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          created_by?: string;
          title?: string;
          description?: string;
          goal_amount?: number;
          current_amount?: number;
          deadline?: string;
          image_url?: string | null;
          hover_summary?: string | null;
          status?: 'pending' | 'active' | 'funded' | 'expired' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      pledges: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          amount: number;
          stripe_payment_intent_id: string | null;
          status: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          amount: number;
          stripe_payment_intent_id?: string | null;
          status?: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          amount?: number;
          stripe_payment_intent_id?: string | null;
          status?: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          parent_comment_id: string | null;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          parent_comment_id?: string | null;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          parent_comment_id?: string | null;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      recommendation_dismissals: {
        Row: {
          id: string;
          user_id: string;
          community_id: string;
          dismissed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          community_id: string;
          dismissed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          community_id?: string;
          dismissed_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_mutual_communities: {
        Args: { user_id_1: string; user_id_2: string };
        Returns: { community_id: string }[];
      };
      get_communities_by_tag: {
        Args: { tag: string };
        Returns: { community_id: string }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for common queries
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Community = Database['public']['Tables']['communities']['Row'];
export type CommunityTag = Database['public']['Tables']['community_tags']['Row'];
export type CommunityMember = Database['public']['Tables']['community_members']['Row'];
export type Proposal = Database['public']['Tables']['proposals']['Row'];
export type ProposalVote = Database['public']['Tables']['proposal_votes']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Pledge = Database['public']['Tables']['pledges']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type RecommendationDismissal = Database['public']['Tables']['recommendation_dismissals']['Row'];

// Extended types with relations
export type CommunityWithLeader = Community & {
  leader: Profile;
  tags: CommunityTag[];
};

export type ProposalWithVotes = Proposal & {
  author: Profile;
  vote_count: number;
  user_vote?: ProposalVote;
};

export type PostWithCommunity = Post & {
  community: Community;
  progress_percentage: number;
  pledge_count: number;
};

export type CommentWithAuthor = Comment & {
  author: Profile;
  replies?: CommentWithAuthor[];
};
