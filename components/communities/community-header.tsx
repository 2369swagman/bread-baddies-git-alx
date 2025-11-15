"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Lock, Globe, CheckCircle, Settings, ArrowLeft } from "lucide-react";

interface CommunityHeaderProps {
  community: {
    id: string;
    name: string;
    description: string | null;
    avatar_url: string | null;
    is_private: boolean;
    is_verified: boolean;
    member_count: number;
    active_projects_count: number;
    community_tags?: Array<{ tag_name: string; approved: boolean }>;
    leader?: {
      full_name: string | null;
      avatar_url: string | null;
    };
  };
  isLeader: boolean;
  isMember: boolean;
  userId: string;
}

export function CommunityHeader({ community, isLeader, isMember }: CommunityHeaderProps) {
  const initials = community.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const approvedTags = community.community_tags?.filter((t) => t.approved) || [];

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          {/* Avatar */}
          <Avatar className="h-24 w-24">
            <AvatarImage src={community.avatar_url || undefined} alt={community.name} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            {/* Title and badges */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-3xl font-bold">{community.name}</h1>
                {community.is_verified && (
                  <CheckCircle className="h-6 w-6 text-primary" />
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={community.is_private ? "secondary" : "outline"}>
                  {community.is_private ? (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  )}
                </Badge>

                {isLeader && (
                  <Badge variant="default">Leader</Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {community.description && (
              <p className="text-muted-foreground">{community.description}</p>
            )}

            {/* Tags */}
            {approvedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {approvedTags.map((tag) => (
                  <Badge key={tag.tag_name} variant="outline">
                    {tag.tag_name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{community.member_count} members</span>
              </div>
              {community.active_projects_count > 0 && (
                <div>
                  <span>{community.active_projects_count} active projects</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isLeader && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/communities/${community.id}/admin`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Community
                  </Link>
                </Button>
              )}

              {!isMember && !community.is_private && (
                <Button size="sm">
                  Join Community
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
