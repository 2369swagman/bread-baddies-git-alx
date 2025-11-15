import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavigationMenu, DesktopNavigation } from "@/components/dashboard/navigation-menu";
import { OnboardingBanner } from "@/components/onboarding/onboarding-banner";
import { MyCommunities } from "@/components/dashboard/my-communities";
import { RecommendedCommunities } from "@/components/dashboard/recommended-communities";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Check onboarding status
  const hasCompletedOnboarding = profile.profile_attributes?.onboarding_completed || false;

  // Get user's communities
  const { data: membershipData } = await supabase
    .from("community_members")
    .select(`
      community_id,
      communities (
        id,
        name,
        description,
        avatar_url,
        is_private,
        is_verified,
        member_count,
        active_projects_count,
        created_at,
        community_tags (
          tag_name,
          approved
        )
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active");

  const myCommunities = membershipData
    ?.map((m: any) => m.communities)
    .filter(Boolean) || [];

  const userData = {
    email: profile.email,
    fullName: profile.full_name || undefined,
    avatarUrl: profile.avatar_url || undefined,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <NavigationMenu user={userData} />
              <h1 className="text-2xl font-bold">Bread Baddies</h1>
            </div>
            <DesktopNavigation user={userData} />
          </div>
        </div>
      </header>

      {/* Onboarding Banner */}
      {!hasCompletedOnboarding && <OnboardingBanner />}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening in your communities
          </p>
        </div>

        {/* My Communities */}
        <MyCommunities communities={myCommunities} />

        {/* Recommended Communities */}
        <RecommendedCommunities hasCompletedOnboarding={hasCompletedOnboarding} />
      </main>
    </div>
  );
}
