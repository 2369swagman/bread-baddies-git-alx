// Removed imports: redirect, notFound, createClient
import { CommunityHeader } from "@/components/communities/community-header";
import { CommunityTabs } from "@/components/communities/community-tabs";

// Import our new mock data
import {
  mockUser,
  mockCommunities,
  mockMembership,
  mockProposals,
  mockPosts,
} from "@/lib/mock-data";

export default async function CommunityPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // --- Removed all Supabase auth and data fetching ---

  // 1. Get user and membership from mock data
  const user = mockUser;
  const membership = mockMembership; // We'll use this for all communities for simplicity

  // 2. Get community data from mock data
  const community = mockCommunities.find((c) => c.id === id);

  if (!community) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold">Community Not Found</h2>
        <p>This community ID does not exist in the mock data.</p>
      </div>
    );
  }

  // 3. Assume user has access (we removed the private/public check)
  const isLeader = membership?.role === "leader";
  const isMember = membership?.status === "active";

  // 4. Get proposals from mock data, filtered by this community's ID
  const proposals = mockProposals.filter((p) => p.community_id === id);

  // 5. Get posts from mock data, filtered by this community's ID
  const posts = mockPosts.filter((p) => p.community_id === id);

  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader
        community={community as any} // Using 'as any' to bypass strict type matching
        isLeader={isLeader}
        isMember={isMember}
        userId={user.id}
      />

      <div className="container mx-auto px-4 py-8">
        <CommunityTabs
          communityId={id}
          proposals={proposals as any} // Using 'as any'
          posts={posts as any}         // Using 'as any'
          isLeader={isLeader}
          isMember={isMember}
        />
      </div>
    </div>
  );
}