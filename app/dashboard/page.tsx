// Removed imports: redirect, createClient
import { NavigationMenu, DesktopNavigation } from "@/components/dashboard/navigation-menu";
import { OnboardingBanner } from "@/components/onboarding/onboarding-banner";
import { MyCommunities } from "@/components/dashboard/my-communities";
import { RecommendedCommunities } from "@/components/dashboard/recommended-communities";

// Import our new mock data
import { mockUser, mockProfile, mockCommunities } from "@/lib/mock-data";

export default async function DashboardPage() {
  // --- Removed all Supabase auth and data fetching ---

  // 1. Get user and profile from mock data
  const user = mockUser;
  const profile = mockProfile;

  // 2. Check onboarding status from mock profile
  const hasCompletedOnboarding = profile.profile_attributes?.onboarding_completed || false;

  // 3. Get communities from mock data
  // We'll just show all mock communities as "My Communities" for this demo
  const myCommunities = mockCommunities;

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
              <h1 className="text-2xl font-bold">Bread Baddies (Demo)</h1>
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
            Here's what's happening in your demo communities
          </p>
        </div>

        {/* My Communities */}
        <MyCommunities communities={myCommunities} />

        {/* Recommended Communities (Still uses Claude) */}
        <RecommendedCommunities hasCompletedOnboarding={hasCompletedOnboarding} />
      </main>
    </div>
  );
}