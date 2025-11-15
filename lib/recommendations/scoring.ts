import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ProfileAttributes } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

export interface CommunityScore {
  total: number;
  breakdown: {
    sharedTags: number;
    mutualMembers: number;
    demographicAlignment: number;
    sharedInterests: number;
    geographicProximity: number;
    activityLevel: number;
    communitySize: number;
    fundingSuccessRate: number;
  };
}

/**
 * Calculate a relevance score for a community based on user profile
 * Higher scores = better match
 */
export async function calculateCommunityScore(
  supabase: TypedSupabaseClient,
  userId: string,
  communityId: string,
  userProfile: ProfileAttributes
): Promise<CommunityScore> {
  const scores = {
    sharedTags: 0,
    mutualMembers: 0,
    demographicAlignment: 0,
    sharedInterests: 0,
    geographicProximity: 0,
    activityLevel: 0,
    communitySize: 0,
    fundingSuccessRate: 0,
  };

  // Get community data
  const { data: community } = await supabase
    .from("communities")
    .select(`
      *,
      community_tags (tag_name, approved)
    `)
    .eq("id", communityId)
    .single();

  if (!community) {
    return { total: 0, breakdown: scores };
  }

  // 1. Shared Tags Score (30% weight)
  const communityTags = community.community_tags
    ?.filter((t: any) => t.approved)
    .map((t: any) => t.tag_name.toLowerCase()) || [];

  const userInterests = (userProfile.interests || []).map((i) => i.toLowerCase());

  const sharedTagsCount = communityTags.filter((tag: string) =>
    userInterests.some((interest) => tag.includes(interest) || interest.includes(tag))
  ).length;

  scores.sharedTags = communityTags.length > 0
    ? (sharedTagsCount / communityTags.length) * 30
    : 0;

  // 2. Mutual Members Score (25% weight)
  const { data: userCommunities } = await supabase
    .from("community_members")
    .select("community_id")
    .eq("user_id", userId)
    .eq("status", "active");

  const userCommunityIds = userCommunities?.map((m) => m.community_id) || [];

  if (userCommunityIds.length > 0) {
    // Count members in this community who are also in user's communities
    const { count } = await supabase
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId)
      .eq("status", "active")
      .in("user_id", userCommunityIds);

    const mutualCount = count || 0;
    scores.mutualMembers = Math.min((mutualCount / 5) * 25, 25); // Max out at 5 mutual members
  }

  // 3. Demographic Alignment (15% weight)
  // Check age range and student status alignment
  let demographicMatches = 0;
  let demographicChecks = 0;

  if (userProfile.age_range && userProfile.student_status) {
    // Get sample of community members' profiles
    const { data: memberProfiles } = await supabase
      .from("community_members")
      .select("user_id")
      .eq("community_id", communityId)
      .eq("status", "active")
      .limit(20);

    if (memberProfiles && memberProfiles.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("profile_attributes")
        .in("user_id", memberProfiles.map((m) => m.user_id));

      if (profiles) {
        profiles.forEach((p) => {
          const attrs = p.profile_attributes as ProfileAttributes;
          if (attrs.age_range === userProfile.age_range) {
            demographicMatches++;
          }
          demographicChecks++;

          if (attrs.student_status === userProfile.student_status) {
            demographicMatches++;
          }
          demographicChecks++;
        });

        scores.demographicAlignment = demographicChecks > 0
          ? (demographicMatches / demographicChecks) * 15
          : 0;
      }
    }
  }

  // 4. Shared Interests (20% weight)
  if (userInterests.length > 0) {
    // This is similar to shared tags but more direct
    scores.sharedInterests = Math.min((sharedTagsCount / userInterests.length) * 20, 20);
  }

  // 5. Geographic Proximity (5% weight)
  if (userProfile.location?.city) {
    // Get community leader's location as proxy for community location
    const { data: leaderProfile } = await supabase
      .from("profiles")
      .select("profile_attributes")
      .eq("id", community.leader_id)
      .single();

    if (leaderProfile) {
      const leaderAttrs = leaderProfile.profile_attributes as ProfileAttributes;
      if (leaderAttrs.location?.city === userProfile.location.city) {
        scores.geographicProximity = 5; // Same city
      } else if (leaderAttrs.location?.state === userProfile.location.state) {
        scores.geographicProximity = 3; // Same state
      } else if (leaderAttrs.location?.country === userProfile.location.country) {
        scores.geographicProximity = 1; // Same country
      }
    }
  }

  // 6. Activity Level (5% weight)
  // More active communities score higher
  const activityScore = Math.min(community.active_projects_count / 5, 1) * 5;
  scores.activityLevel = activityScore;

  // 7. Community Size Normalization (bonus/penalty)
  // Prefer medium-sized communities (sweet spot: 10-100 members)
  const memberCount = community.member_count;
  if (memberCount >= 10 && memberCount <= 100) {
    scores.communitySize = 3; // Bonus for ideal size
  } else if (memberCount > 100) {
    scores.communitySize = 1; // Small bonus for large communities
  } else {
    scores.communitySize = 0; // Small communities get no bonus
  }

  // 8. Funding Success Rate (bonus)
  // Get completion rate of posts
  const { data: posts } = await supabase
    .from("posts")
    .select("status")
    .eq("community_id", communityId);

  if (posts && posts.length > 0) {
    const completedCount = posts.filter((p) => p.status === "completed" || p.status === "funded").length;
    const successRate = completedCount / posts.length;
    scores.fundingSuccessRate = successRate * 2; // Small bonus for successful communities
  }

  // Calculate total score
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return {
    total: Math.round(total * 100) / 100, // Round to 2 decimals
    breakdown: scores,
  };
}

/**
 * Helper function to find communities with similar members
 */
export async function findCommunitiesWithMutualMembers(
  supabase: TypedSupabaseClient,
  userId: string,
  limit = 10
): Promise<string[]> {
  // Get user's communities
  const { data: userCommunities } = await supabase
    .from("community_members")
    .select("community_id")
    .eq("user_id", userId)
    .eq("status", "active");

  if (!userCommunities || userCommunities.length === 0) {
    return [];
  }

  const userCommunityIds = userCommunities.map((m) => m.community_id);

  // Find other members in those communities
  const { data: otherMembers } = await supabase
    .from("community_members")
    .select("user_id, community_id")
    .in("community_id", userCommunityIds)
    .neq("user_id", userId)
    .eq("status", "active");

  if (!otherMembers || otherMembers.length === 0) {
    return [];
  }

  // Find what other communities those members are in
  const otherUserIds = [...new Set(otherMembers.map((m) => m.user_id))];

  const { data: recommendedCommunities } = await supabase
    .from("community_members")
    .select("community_id")
    .in("user_id", otherUserIds)
    .not("community_id", "in", `(${userCommunityIds.join(",")})`)
    .eq("status", "active")
    .limit(limit);

  return [...new Set(recommendedCommunities?.map((c) => c.community_id) || [])];
}
