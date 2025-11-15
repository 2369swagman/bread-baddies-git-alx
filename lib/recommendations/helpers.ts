import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Dismiss a community recommendation
 */
export async function dismissCommunity(
  supabase: TypedSupabaseClient,
  userId: string,
  communityId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("recommendation_dismissals")
    .insert({
      user_id: userId,
      community_id: communityId,
    });

  return !error;
}

/**
 * Un-dismiss a community (remove from dismissals)
 */
export async function undismissCommunity(
  supabase: TypedSupabaseClient,
  userId: string,
  communityId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("recommendation_dismissals")
    .delete()
    .eq("user_id", userId)
    .eq("community_id", communityId);

  return !error;
}

/**
 * Get dismissed community IDs for a user
 */
export async function getDismissedCommunities(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("recommendation_dismissals")
    .select("community_id")
    .eq("user_id", userId);

  return data?.map((d) => d.community_id) || [];
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("profile_attributes")
    .eq("id", userId)
    .single();

  return data?.profile_attributes?.onboarding_completed || false;
}

/**
 * Get communities by tags
 */
export async function getCommunitiesByTags(
  supabase: TypedSupabaseClient,
  tags: string[],
  limit = 20
): Promise<any[]> {
  if (tags.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from("community_tags")
    .select(`
      community_id,
      communities (
        id,
        name,
        description,
        is_private,
        is_verified,
        member_count,
        active_projects_count
      )
    `)
    .in("tag_name", tags)
    .eq("approved", true);

  if (!data) {
    return [];
  }

  // Deduplicate communities
  const communityMap = new Map();
  data.forEach((item: any) => {
    if (item.communities && !item.communities.is_private) {
      communityMap.set(item.community_id, item.communities);
    }
  });

  return Array.from(communityMap.values()).slice(0, limit);
}

/**
 * Get trending communities (high activity, recent growth)
 */
export async function getTrendingCommunities(
  supabase: TypedSupabaseClient,
  limit = 10
): Promise<any[]> {
  const { data } = await supabase
    .from("communities")
    .select("*")
    .eq("is_private", false)
    .gt("active_projects_count", 0)
    .order("active_projects_count", { ascending: false })
    .order("member_count", { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Get nearby communities based on location
 */
export async function getNearbyCommunities(
  supabase: TypedSupabaseClient,
  city: string,
  state: string,
  country: string,
  limit = 10
): Promise<any[]> {
  // Get communities whose leaders are in the same location
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .or(`profile_attributes->>city.eq.${city},profile_attributes->>state.eq.${state},profile_attributes->>country.eq.${country}`);

  if (!profiles || profiles.length === 0) {
    return [];
  }

  const leaderIds = profiles.map((p) => p.id);

  const { data: communities } = await supabase
    .from("communities")
    .select("*")
    .in("leader_id", leaderIds)
    .eq("is_private", false)
    .limit(limit);

  return communities || [];
}

/**
 * Ensure diversity in recommendations
 * Returns a diverse set based on community size, tags, and activity
 */
export function ensureDiversity<T extends {
  memberCount: number;
  tags?: string[];
  activeProjects: number;
}>(
  communities: T[],
  maxCount = 10
): T[] {
  if (communities.length <= maxCount) {
    return communities;
  }

  const diverse: T[] = [];
  const sizeBuckets = { small: [] as T[], medium: [] as T[], large: [] as T[] };
  const usedTags = new Set<string>();

  // Categorize by size
  communities.forEach((community) => {
    if (community.memberCount < 20) {
      sizeBuckets.small.push(community);
    } else if (community.memberCount < 100) {
      sizeBuckets.medium.push(community);
    } else {
      sizeBuckets.large.push(community);
    }
  });

  // Pick from each bucket to ensure size diversity
  const pickFromBucket = (bucket: T[], count: number) => {
    return bucket.slice(0, count).filter((c) => {
      // Prefer communities with tags we haven't seen much
      if (!c.tags || c.tags.length === 0) return true;

      const hasNewTag = c.tags.some((tag) => !usedTags.has(tag));
      c.tags.forEach((tag) => usedTags.add(tag));

      return hasNewTag || diverse.length < maxCount / 2; // Allow some overlap
    });
  };

  diverse.push(...pickFromBucket(sizeBuckets.medium, Math.floor(maxCount * 0.5)));
  diverse.push(...pickFromBucket(sizeBuckets.small, Math.floor(maxCount * 0.25)));
  diverse.push(...pickFromBucket(sizeBuckets.large, Math.floor(maxCount * 0.25)));

  return diverse.slice(0, maxCount);
}

/**
 * Filter communities user has access to
 */
export async function filterAccessibleCommunities(
  supabase: TypedSupabaseClient,
  userId: string,
  communityIds: string[]
): Promise<string[]> {
  const { data: publicCommunities } = await supabase
    .from("communities")
    .select("id")
    .in("id", communityIds)
    .eq("is_private", false);

  const { data: privateMemberships } = await supabase
    .from("community_members")
    .select("community_id")
    .in("community_id", communityIds)
    .eq("user_id", userId)
    .eq("status", "active");

  const accessibleIds = new Set([
    ...(publicCommunities?.map((c) => c.id) || []),
    ...(privateMemberships?.map((m) => m.community_id) || []),
  ]);

  return Array.from(accessibleIds);
}
