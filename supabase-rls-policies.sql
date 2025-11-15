-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Bread Baddies Platform Security
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_dismissals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Public profiles are readable based on visibility settings
CREATE POLICY "Public profiles are readable"
  ON profiles FOR SELECT
  USING (
    profile_attributes->>'visibility' = 'public'
    OR auth.uid() = id
  );

-- ============================================================================
-- ONBOARDING PROGRESS POLICIES
-- ============================================================================

-- Users can read their own onboarding progress
CREATE POLICY "Users can read own onboarding progress"
  ON onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own onboarding progress
CREATE POLICY "Users can insert own onboarding progress"
  ON onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own onboarding progress
CREATE POLICY "Users can update own onboarding progress"
  ON onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMUNITIES POLICIES
-- ============================================================================

-- Public communities are visible to all authenticated users
CREATE POLICY "Public communities are visible"
  ON communities FOR SELECT
  USING (
    is_private = FALSE
    OR EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = communities.id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Authenticated users can create communities
CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() = leader_id);

-- Leaders can update their communities
CREATE POLICY "Leaders can update own communities"
  ON communities FOR UPDATE
  USING (auth.uid() = leader_id);

-- Leaders can delete their communities
CREATE POLICY "Leaders can delete own communities"
  ON communities FOR DELETE
  USING (auth.uid() = leader_id);

-- ============================================================================
-- COMMUNITY TAGS POLICIES
-- ============================================================================

-- Tags visible for visible communities
CREATE POLICY "Tags visible for visible communities"
  ON community_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = community_tags.community_id
        AND (
          is_private = FALSE
          OR EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = communities.id
              AND user_id = auth.uid()
              AND status = 'active'
          )
        )
    )
  );

-- Leaders can insert tags (will be from AI or manual)
CREATE POLICY "Leaders can insert tags"
  ON community_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = community_tags.community_id
        AND leader_id = auth.uid()
    )
  );

-- Leaders can update tags (approve AI suggestions)
CREATE POLICY "Leaders can update tags"
  ON community_tags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = community_tags.community_id
        AND leader_id = auth.uid()
    )
  );

-- Leaders can delete tags
CREATE POLICY "Leaders can delete tags"
  ON community_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = community_tags.community_id
        AND leader_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMUNITY MEMBERS POLICIES
-- ============================================================================

-- Members can see other members in their communities
CREATE POLICY "Members can see community members"
  ON community_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM communities
      WHERE id = community_members.community_id
        AND is_private = FALSE
    )
  );

-- Users can join public communities (insert with status='active')
-- Users can request to join private communities (insert with status='pending')
CREATE POLICY "Users can join/request to join communities"
  ON community_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- Public communities: auto-active
      (
        EXISTS (
          SELECT 1 FROM communities
          WHERE id = community_members.community_id
            AND is_private = FALSE
        )
        AND status = 'active'
      )
      OR
      -- Private communities: pending
      (
        EXISTS (
          SELECT 1 FROM communities
          WHERE id = community_members.community_id
            AND is_private = TRUE
        )
        AND status = 'pending'
      )
    )
  );

-- Leaders can update member status (approve/reject)
CREATE POLICY "Leaders can manage members"
  ON community_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = community_members.community_id
        AND leader_id = auth.uid()
    )
  );

-- Leaders can remove members
CREATE POLICY "Leaders can remove members"
  ON community_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = community_members.community_id
        AND leader_id = auth.uid()
    )
  );

-- Users can leave communities
CREATE POLICY "Users can leave communities"
  ON community_members FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PROPOSALS POLICIES
-- ============================================================================

-- Members can view proposals in their communities
CREATE POLICY "Members can view community proposals"
  ON proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = proposals.community_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Members can create proposals in their communities
CREATE POLICY "Members can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = proposals.community_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Users can update their own proposals (pending only)
CREATE POLICY "Users can update own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Leaders can update any proposal (approve/reject)
CREATE POLICY "Leaders can manage proposals"
  ON proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = proposals.community_id
        AND leader_id = auth.uid()
    )
  );

-- Users can delete their own proposals
CREATE POLICY "Users can delete own proposals"
  ON proposals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PROPOSAL VOTES POLICIES
-- ============================================================================

-- Members can view votes on proposals in their communities
CREATE POLICY "Members can view proposal votes"
  ON proposal_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals p
      INNER JOIN community_members cm ON p.community_id = cm.community_id
      WHERE p.id = proposal_votes.proposal_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
    )
  );

-- Members can vote on proposals in their communities
CREATE POLICY "Members can vote on proposals"
  ON proposal_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM proposals p
      INNER JOIN community_members cm ON p.community_id = cm.community_id
      WHERE p.id = proposal_votes.proposal_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
    )
  );

-- Users can update their own votes
CREATE POLICY "Users can update own votes"
  ON proposal_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
  ON proposal_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- POSTS POLICIES
-- ============================================================================

-- Members can view posts in their communities
CREATE POLICY "Members can view community posts"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = posts.community_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Only leaders can create posts (crowdfunding campaigns)
CREATE POLICY "Leaders can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = posts.community_id
        AND leader_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

-- Leaders can update posts in their communities
CREATE POLICY "Leaders can update posts"
  ON posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = posts.community_id
        AND leader_id = auth.uid()
    )
  );

-- Leaders can delete posts
CREATE POLICY "Leaders can delete posts"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = posts.community_id
        AND leader_id = auth.uid()
    )
  );

-- ============================================================================
-- PLEDGES POLICIES
-- ============================================================================

-- Users can view their own pledges
CREATE POLICY "Users can view own pledges"
  ON pledges FOR SELECT
  USING (auth.uid() = user_id);

-- Leaders can view all pledges for their community posts
CREATE POLICY "Leaders can view community pledges"
  ON pledges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts p
      INNER JOIN communities c ON p.community_id = c.id
      WHERE p.id = pledges.post_id
        AND c.leader_id = auth.uid()
    )
  );

-- Members can create pledges for posts in their communities
CREATE POLICY "Members can create pledges"
  ON pledges FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM posts p
      INNER JOIN community_members cm ON p.community_id = cm.community_id
      WHERE p.id = pledges.post_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
        AND p.status = 'active'
    )
  );

-- Users can update their own pledges (status changes from Stripe)
CREATE POLICY "Users can update own pledges"
  ON pledges FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can update pledge status (Stripe webhooks)
-- This is handled via service_role key, not RLS

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================

-- Members can view comments on posts in their communities
CREATE POLICY "Members can view community comments"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts p
      INNER JOIN community_members cm ON p.community_id = cm.community_id
      WHERE p.id = comments.post_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
    )
  );

-- Members can create comments on posts in their communities
CREATE POLICY "Members can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM posts p
      INNER JOIN community_members cm ON p.community_id = cm.community_id
      WHERE p.id = comments.post_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RECOMMENDATION DISMISSALS POLICIES
-- ============================================================================

-- Users can view their own dismissals
CREATE POLICY "Users can view own dismissals"
  ON recommendation_dismissals FOR SELECT
  USING (auth.uid() = user_id);

-- Users can dismiss recommendations
CREATE POLICY "Users can dismiss recommendations"
  ON recommendation_dismissals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can un-dismiss (delete dismissal)
CREATE POLICY "Users can un-dismiss"
  ON recommendation_dismissals FOR DELETE
  USING (auth.uid() = user_id);
