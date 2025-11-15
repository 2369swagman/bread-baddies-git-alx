import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CommunityCard } from "./community-card";
import { Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Community {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_private: boolean;
  is_verified: boolean;
  member_count: number;
  active_projects_count: number;
  created_at: string;
  community_tags?: Array<{ tag_name: string; approved: boolean }>;
}

interface MyCommunitiesProps {
  communities: Community[];
}

export function MyCommunities({ communities }: MyCommunitiesProps) {
  if (communities.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Communities</h2>
            <p className="text-muted-foreground">
              Communities you're a part of
            </p>
          </div>
          <Button asChild>
            <Link href="/communities/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold">No communities yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You haven't joined any communities yet. Create your first community
              or browse recommendations below.
            </p>
            <div className="flex gap-2 justify-center pt-4">
              <Button asChild>
                <Link href="/communities/create">Create Community</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/communities/browse">Browse Communities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Communities</h2>
          <p className="text-muted-foreground">
            {communities.length} {communities.length === 1 ? "community" : "communities"}
          </p>
        </div>
        <Button asChild>
          <Link href="/communities/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Community
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map((community) => {
          const approvedTags = community.community_tags
            ?.filter((t) => t.approved)
            .map((t) => t.tag_name) || [];

          const recentActivity = `Joined ${formatDistanceToNow(new Date(community.created_at), { addSuffix: true })}`;

          return (
            <CommunityCard
              key={community.id}
              id={community.id}
              name={community.name}
              description={community.description || undefined}
              avatarUrl={community.avatar_url || undefined}
              tags={approvedTags}
              memberCount={community.member_count}
              activeProjects={community.active_projects_count}
              isPrivate={community.is_private}
              isVerified={community.is_verified}
              recentActivity={recentActivity}
            />
          );
        })}
      </div>
    </section>
  );
}
