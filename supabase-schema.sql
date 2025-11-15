-- ============================================================================
-- BREAD BADDIES DATABASE SCHEMA
-- Community Crowdfunding Platform with AI-Powered Recommendations
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- Extended user profiles with onboarding data
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- Profile attributes (JSONB for flexibility)
  profile_attributes JSONB DEFAULT '{
    "onboarding_completed": false,
    "visibility": "recommendations-only"
  }'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile attributes structure (for reference):
-- {
--   "age_range": "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+",
--   "gender": "male" | "female" | "non-binary" | "prefer-not-to-say" | "other",
--   "student_status": "high-school" | "undergraduate" | "graduate" | "not-student",
--   "location": { "city": "", "state": "", "country": "" },
--   "school_name": "",
--   "workplace": "",
--   "occupation": "",
--   "industry": "",
--   "languages": ["english", "spanish"],
--   "interests": ["sports", "technology", "travel"],
--   "visibility": "public" | "recommendations-only" | "private",
--   "onboarding_completed": boolean,
--   "onboarding_completed_at": timestamp
-- }

-- ============================================================================
-- ONBOARDING PROGRESS TABLE
-- Track partial onboarding completion
-- ============================================================================
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  skipped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================================================
-- COMMUNITIES TABLE
-- Community information with verification status
-- ============================================================================
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  member_count INTEGER DEFAULT 1,
  active_projects_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_communities_leader ON communities(leader_id);
CREATE INDEX idx_communities_private ON communities(is_private);
CREATE INDEX idx_communities_verified ON communities(is_verified);

-- ============================================================================
-- COMMUNITY TAGS TABLE
-- AI-inferred and leader-curated tags
-- ============================================================================
CREATE TABLE community_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('ai', 'leader')),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(community_id, tag_name)
);

CREATE INDEX idx_community_tags_community ON community_tags(community_id);
CREATE INDEX idx_community_tags_tag ON community_tags(tag_name);

-- ============================================================================
-- COMMUNITY MEMBERS TABLE
-- User-community junction with roles
-- ============================================================================
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('leader', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(community_id, user_id)
);

CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_status ON community_members(status);

-- ============================================================================
-- PROPOSALS TABLE
-- Member-created ideas for voting (bulletin board 1)
-- ============================================================================
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'archived')),

  -- Vote counts (denormalized for performance)
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_proposals_community ON proposals(community_id);
CREATE INDEX idx_proposals_user ON proposals(user_id);
CREATE INDEX idx_proposals_status ON proposals(status);

-- ============================================================================
-- PROPOSAL VOTES TABLE
-- Upvote/downvote system for proposals
-- ============================================================================
CREATE TABLE proposal_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(proposal_id, user_id)
);

CREATE INDEX idx_proposal_votes_proposal ON proposal_votes(proposal_id);
CREATE INDEX idx_proposal_votes_user ON proposal_votes(user_id);

-- ============================================================================
-- POSTS TABLE
-- Leader-approved crowdfunding campaigns (bulletin board 2)
-- ============================================================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) <= 1000), -- ~200 words

  -- Funding details
  goal_amount DECIMAL(10, 2) NOT NULL CHECK (goal_amount > 0),
  current_amount DECIMAL(10, 2) DEFAULT 0 CHECK (current_amount >= 0),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Media
  image_url TEXT,

  -- AI-generated hover summary
  hover_summary TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'funded', 'expired', 'completed')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_community ON posts(community_id);
CREATE INDEX idx_posts_created_by ON posts(created_by);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_deadline ON posts(deadline);

-- ============================================================================
-- PLEDGES TABLE
-- User pledges to crowdfunding campaigns
-- ============================================================================
CREATE TABLE pledges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),

  -- Stripe payment tracking
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'captured', 'refunded', 'failed')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pledges_post ON pledges(post_id);
CREATE INDEX idx_pledges_user ON pledges(user_id);
CREATE INDEX idx_pledges_status ON pledges(status);
CREATE INDEX idx_pledges_stripe ON pledges(stripe_payment_intent_id);

-- ============================================================================
-- COMMENTS TABLE
-- Nested comment system for posts
-- ============================================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- ============================================================================
-- RECOMMENDATION DISMISSALS TABLE
-- Track "Not Interested" user actions
-- ============================================================================
CREATE TABLE recommendation_dismissals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, community_id)
);

CREATE INDEX idx_recommendation_dismissals_user ON recommendation_dismissals(user_id);

-- ============================================================================
-- TRIGGERS
-- Automated database operations
-- ============================================================================

-- Trigger: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger: Auto-add leader as community member
CREATE OR REPLACE FUNCTION handle_new_community()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_members (community_id, user_id, role, status)
  VALUES (NEW.id, NEW.leader_id, 'leader', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_community_created
  AFTER INSERT ON communities
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_community();

-- Trigger: Update post current_amount when pledge added/updated
CREATE OR REPLACE FUNCTION update_post_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate total for the post
  UPDATE posts
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM pledges
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
      AND status IN ('authorized', 'captured')
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pledge_change
  AFTER INSERT OR UPDATE OR DELETE ON pledges
  FOR EACH ROW
  EXECUTE FUNCTION update_post_amount();

-- Trigger: Auto-update post status to "funded" when goal met
CREATE OR REPLACE FUNCTION check_funding_goal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_amount >= NEW.goal_amount AND NEW.status = 'active' THEN
    NEW.status = 'funded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_amount_updated
  BEFORE UPDATE ON posts
  FOR EACH ROW
  WHEN (OLD.current_amount IS DISTINCT FROM NEW.current_amount)
  EXECUTE FUNCTION check_funding_goal();

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger: Update proposal vote counts
CREATE OR REPLACE FUNCTION update_proposal_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE proposals
  SET
    upvotes = (
      SELECT COUNT(*)
      FROM proposal_votes
      WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id)
        AND vote_type = 'upvote'
    ),
    downvotes = (
      SELECT COUNT(*)
      FROM proposal_votes
      WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id)
        AND vote_type = 'downvote'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_proposal_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON proposal_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_votes();

-- Trigger: Update community member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE communities
  SET
    member_count = (
      SELECT COUNT(*)
      FROM community_members
      WHERE community_id = COALESCE(NEW.community_id, OLD.community_id)
        AND status = 'active'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.community_id, OLD.community_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_community_member_change
  AFTER INSERT OR UPDATE OR DELETE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_member_count();

-- Trigger: Update community active projects count
CREATE OR REPLACE FUNCTION update_community_projects_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE communities
  SET
    active_projects_count = (
      SELECT COUNT(*)
      FROM posts
      WHERE community_id = COALESCE(NEW.community_id, OLD.community_id)
        AND status IN ('active', 'funded')
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.community_id, OLD.community_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_status_change
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_projects_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- Utility functions for recommendation algorithm
-- ============================================================================

-- Function: Get mutual communities between users
CREATE OR REPLACE FUNCTION get_mutual_communities(user_id_1 UUID, user_id_2 UUID)
RETURNS TABLE(community_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT cm1.community_id
  FROM community_members cm1
  INNER JOIN community_members cm2 ON cm1.community_id = cm2.community_id
  WHERE cm1.user_id = user_id_1
    AND cm2.user_id = user_id_2
    AND cm1.status = 'active'
    AND cm2.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function: Get communities by tag
CREATE OR REPLACE FUNCTION get_communities_by_tag(tag TEXT)
RETURNS TABLE(community_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ct.community_id
  FROM community_tags ct
  WHERE ct.tag_name ILIKE tag
    AND ct.approved = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- You can add seed data here if needed
