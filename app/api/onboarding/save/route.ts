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

    const body = await request.json();
    const { current_step, skipped, ...profileData } = body;

    // Update profile attributes
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        profile_attributes: {
          ...profileData,
          onboarding_completed: false,
        },
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Update or insert onboarding progress
    const { error: progressError } = await supabase
      .from("onboarding_progress")
      .upsert({
        user_id: user.id,
        current_step,
        skipped_at: skipped ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      });

    if (progressError) {
      console.error("Progress update error:", progressError);
      return NextResponse.json(
        { error: "Failed to save progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
