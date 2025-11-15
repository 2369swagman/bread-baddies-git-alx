import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claude, CLAUDE_CONFIG, PROMPTS, getCachedResponse, setCachedResponse } from "@/lib/claude/client";

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

    const { postId, title, description } = await request.json();

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // If postId provided, verify user has access to the community
    if (postId) {
      const { data: post } = await supabase
        .from("posts")
        .select("community_id")
        .eq("id", postId)
        .single();

      if (post) {
        const { data: membership } = await supabase
          .from("community_members")
          .select("id")
          .eq("community_id", post.community_id)
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (!membership) {
          return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
          );
        }
      }
    }

    // Check cache
    const cacheKey = `summary:${title}:${description.substring(0, 50)}`;
    const cachedSummary = getCachedResponse(cacheKey);
    if (cachedSummary) {
      return NextResponse.json({ summary: cachedSummary, cached: true });
    }

    // Call Claude API
    const response = await claude.messages.create({
      model: CLAUDE_CONFIG.model,
      max_tokens: 256,
      temperature: 0.5, // Lower temperature for more consistent summaries
      messages: [
        {
          role: "user",
          content: PROMPTS.summarizeProject(title, description),
        },
      ],
    });

    // Parse response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const summary = content.text.trim();

    // Validate summary length (max 15 words)
    const wordCount = summary.split(/\s+/).length;
    if (wordCount > 20) {
      // Allow slight overflow, Claude might be creative
      console.warn(`Summary exceeded word limit: ${wordCount} words`);
    }

    // Cache the result
    setCachedResponse(cacheKey, summary);

    // If postId provided, update the post with the summary
    if (postId) {
      await supabase
        .from("posts")
        .update({ hover_summary: summary })
        .eq("id", postId);
    }

    return NextResponse.json({
      summary,
      cached: false,
    });
  } catch (error) {
    console.error("Project summarization error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
