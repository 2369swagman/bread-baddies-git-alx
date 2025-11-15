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

    const profileData = await request.json();

    // Update profile with completed onboarding
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        profile_attributes: {
          ...profileData,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        },
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile completion error:", profileError);
      return NextResponse.json(
        { error: "Failed to complete onboarding" },
        { status: 500 }
      );
    }

    // Delete onboarding progress since it's completed
    await supabase
      .from("onboarding_progress")
      .delete()
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding completion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
