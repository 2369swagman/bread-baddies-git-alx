import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MultiStepForm } from "@/components/onboarding/multi-step-form";

export default async function OnboardingPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/onboarding");
  }

  // Get existing profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_attributes")
    .eq("id", user.id)
    .single();

  // Check if onboarding already completed
  if (profile?.profile_attributes?.onboarding_completed) {
    redirect("/dashboard");
  }

  // Get onboarding progress if exists
  const { data: progress } = await supabase
    .from("onboarding_progress")
    .select("current_step")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background py-12">
      <MultiStepForm
        initialData={profile?.profile_attributes}
        initialStep={progress?.current_step || 1}
      />
    </div>
  );
}
