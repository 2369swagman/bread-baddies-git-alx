import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { communityId } = await request.json();

    if (!communityId) {
      return NextResponse.json(
        { error: "Community ID is required" },
        { status: 400 }
      );
    }

    // Add to dismissals
    const { error } = await supabase
      .from("recommendation_dismissals")
      .insert({
        user_id: user.id,
        community_id: communityId,
      });

    if (error) {
      // Check if already dismissed (unique constraint violation)
      if (error.code === "23505") {
        return NextResponse.json({ success: true, message: "Already dismissed" });
      }

      console.error("Dismissal error:", error);
      return NextResponse.json(
        { error: "Failed to dismiss community" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dismiss community error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Allow un-dismissing
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId } = await request.json();

    if (!communityId) {
      return NextResponse.json(
        { error: "Community ID is required" },
        { status: 400 }
      );
    }

    // Remove from dismissals
    const { error } = await supabase
      .from("recommendation_dismissals")
      .delete()
      .eq("user_id", user.id)
      .eq("community_id", communityId);

    if (error) {
      console.error("Un-dismiss error:", error);
      return NextResponse.json(
        { error: "Failed to un-dismiss community" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Un-dismiss community error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
