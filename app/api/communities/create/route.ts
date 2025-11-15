import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCommunitySchema } from "@/lib/validations/community";

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

    const body = await request.json();

    // Validate input
    const validationResult = createCommunitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, isPrivate } = validationResult.data;

    // Create community
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .insert({
        name,
        description,
        leader_id: user.id,
        is_private: isPrivate,
      })
      .select()
      .single();

    if (communityError) {
      console.error("Community creation error:", communityError);
      return NextResponse.json(
        { error: "Failed to create community" },
        { status: 500 }
      );
    }

    // Generate AI tags in the background (don't wait for it)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/claude/infer-community-tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communityId: community.id,
        communityName: name,
        description,
        refine: false,
      }),
    }).catch((error) => console.error("Background tag generation error:", error));

    return NextResponse.json({ success: true, community });
  } catch (error) {
    console.error("Create community error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
