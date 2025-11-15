import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claude, CLAUDE_CONFIG, PROMPTS, parseClaudeJSON, getCachedResponse, setCachedResponse } from "@/lib/claude/client";

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

    const { communityId, communityName, description, refine = false } = await request.json();

    // Validate required fields
    if (!communityId || !communityName) {
      return NextResponse.json(
        { error: "Community ID and name are required" },
        { status: 400 }
      );
    }

    // Check if user is the community leader
    const { data: community } = await supabase
      .from("communities")
      .select("leader_id")
      .eq("id", communityId)
      .single();

    if (!community || community.leader_id !== user.id) {
      return NextResponse.json(
        { error: "Only community leaders can manage tags" },
        { status: 403 }
      );
    }

    // Check cache
    const cacheKey = `tags:${communityId}:${refine ? 'refined' : 'initial'}`;
    const cachedTags = getCachedResponse(cacheKey);
    if (cachedTags) {
      return NextResponse.json({ tags: cachedTags, cached: true });
    }

    let prompt: string;
    let existingTags: string[] = [];

    if (refine) {
      // Get current tags
      const { data: tagData } = await supabase
        .from("community_tags")
        .select("tag_name")
        .eq("community_id", communityId)
        .eq("approved", true);

      existingTags = tagData?.map((t) => t.tag_name) || [];

      // Get recent activity
      const { data: proposals } = await supabase
        .from("proposals")
        .select("title")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: posts } = await supabase
        .from("posts")
        .select("title")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false })
        .limit(10);

      prompt = PROMPTS.refineTagsAfterActivity(
        communityName,
        existingTags,
        proposals?.map((p) => p.title) || [],
        posts?.map((p) => p.title) || []
      );
    } else {
      // Initial tag inference
      prompt = PROMPTS.inferCommunityTags(communityName, description || "");
    }

    // Call Claude API
    const response = await claude.messages.create({
      model: CLAUDE_CONFIG.model,
      max_tokens: 1024,
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

    const tags = parseClaudeJSON<string[]>(content.text);

    if (!tags || !Array.isArray(tags)) {
      throw new Error("Failed to parse tags from Claude response");
    }

    // Limit to 5 tags
    const limitedTags = tags.slice(0, 5).map((tag) => tag.toLowerCase().trim());

    // Cache the result
    setCachedResponse(cacheKey, limitedTags);

    // If this is initial tag inference, save as unapproved tags
    if (!refine) {
      const tagsToInsert = limitedTags.map((tag) => ({
        community_id: communityId,
        tag_name: tag,
        source: "ai" as const,
        approved: false, // Requires leader approval
      }));

      // Insert tags (ignore duplicates)
      await supabase.from("community_tags").upsert(tagsToInsert, {
        onConflict: "community_id,tag_name",
        ignoreDuplicates: true,
      });
    }

    return NextResponse.json({
      tags: limitedTags,
      cached: false,
      requiresApproval: !refine,
    });
  } catch (error) {
    console.error("Tag inference error:", error);
    return NextResponse.json(
      { error: "Failed to infer tags" },
      { status: 500 }
    );
  }
}
