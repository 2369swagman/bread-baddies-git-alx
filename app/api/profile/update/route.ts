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

    // Get existing profile attributes
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("profile_attributes")
      .eq("id", user.id)
      .single();

    // Update profile with new data while preserving onboarding completion status
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        profile_attributes: {
          ...profileData,
          onboarding_completed: existingProfile?.profile_attributes?.onboarding_completed || true,
          onboarding_completed_at: existingProfile?.profile_attributes?.onboarding_completed_at || new Date().toISOString(),
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
