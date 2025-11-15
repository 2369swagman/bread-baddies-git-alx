import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claude, CLAUDE_CONFIG, PROMPTS, parseClaudeJSON } from "@/lib/claude/client";
import { calculateCommunityScore } from "@/lib/recommendations/scoring";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with attributes
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_attributes")
      .eq("id", user.id)
      .single();

    if (!profile?.profile_attributes) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Get user's current communities
    const { data: userCommunityData } = await supabase
      .from("community_members")
      .select("community_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    const userCommunityIds = userCommunityData?.map((m) => m.community_id) || [];

    // Get dismissed communities
    const { data: dismissedData } = await supabase
      .from("recommendation_dismissals")
      .select("community_id")
      .eq("user_id", user.id);

    const dismissedIds = dismissedData?.map((d) => d.community_id) || [];

    // Get all public communities (excluding user's and dismissed)
    const { data: communities } = await supabase
      .from("communities")
      .select(`
        id,
        name,
        description,
        is_verified,
        member_count,
        active_projects_count,
        created_at,
        community_tags (
          tag_name,
          approved
        )
      `)
      .eq("is_private", false)
      .not("id", "in", `(${[...userCommunityIds, ...dismissedIds].join(",") || "00000000-0000-0000-0000-000000000000"})`)
      .order("member_count", { ascending: false })
      .limit(50); // Get top 50 communities for Claude to analyze

    if (!communities || communities.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Prepare community data for Claude (simplified)
    const communitiesForClaude = communities.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      tags: c.community_tags
        ?.filter((t: any) => t.approved)
        .map((t: any) => t.tag_name) || [],
      memberCount: c.member_count,
      activeProjects: c.active_projects_count,
      verified: c.is_verified,
    }));

    // Call Claude for AI-powered recommendations
    const prompt = PROMPTS.generateRecommendations(
      profile.profile_attributes,
      communitiesForClaude,
      userCommunityIds,
      dismissedIds
    );

    const response = await claude.messages.create({
      model: CLAUDE_CONFIG.model,
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const recommendedIds = parseClaudeJSON<string[]>(content.text);

    if (!recommendedIds || !Array.isArray(recommendedIds)) {
      throw new Error("Failed to parse recommendations from Claude response");
    }

    // Calculate detailed scores for recommended communities
    const recommendationsWithScores = await Promise.all(
      recommendedIds.slice(0, 10).map(async (communityId) => {
        const community = communities.find((c) => c.id === communityId);
        if (!community) return null;

        const score = await calculateCommunityScore(
          supabase,
          user.id,
          communityId,
          profile.profile_attributes
        );

        return {
          id: community.id,
          name: community.name,
          description: community.description,
          tags: community.community_tags
            ?.filter((t: any) => t.approved)
            .map((t: any) => t.tag_name) || [],
          memberCount: community.member_count,
          activeProjects: community.active_projects_count,
          verified: community.is_verified,
          score,
        };
      })
    );

    // Filter out nulls and sort by score
    const validRecommendations = recommendationsWithScores
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.score.total - a.score.total);

    return NextResponse.json({
      recommendations: validRecommendations,
      count: validRecommendations.length,
    });
  } catch (error) {
    console.error("Recommendation generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
