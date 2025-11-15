import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CommunityHeader } from "@/components/communities/community-header";
import { CommunityTabs } from "@/components/communities/community-tabs";

export default async function CommunityPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/communities/${id}`);
  }

  // Get community data
  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select(`
      *,
      community_tags (
        id,
        tag_name,
        approved,
        source
      ),
      leader:profiles!communities_leader_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("id", id)
    .single();

  if (communityError || !community) {
    notFound();
  }

  // Check if user is a member
  const { data: membership } = await supabase
    .from("community_members")
    .select("role, status")
    .eq("community_id", id)
    .eq("user_id", user.id)
    .single();

  // Check access (public communities OR user is a member)
  const hasAccess = !community.is_private || membership?.status === "active";

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Private Community</h2>
          <p className="text-muted-foreground">
            You need to be a member to view this community.
          </p>
          {membership?.status === "pending" && (
            <p className="text-sm text-muted-foreground">
              Your membership request is pending approval.
            </p>
          )}
        </div>
      </div>
    );
  }

  const isLeader = membership?.role === "leader";
  const isMember = membership?.status === "active";

  // Get proposals
  const { data: proposals } = await supabase
    .from("proposals")
    .select(`
      *,
      author:profiles!proposals_user_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq("community_id", id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Get posts (crowdfunding projects)
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("community_id", id)
    .in("status", ["active", "funded"])
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader
        community={community}
        isLeader={isLeader}
        isMember={isMember}
        userId={user.id}
      />

      <div className="container mx-auto px-4 py-8">
        <CommunityTabs
          communityId={id}
          proposals={proposals || []}
          posts={posts || []}
          isLeader={isLeader}
          isMember={isMember}
        />
      </div>
    </div>
  );
}
