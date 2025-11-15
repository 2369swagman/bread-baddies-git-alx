"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, ThumbsUp, ThumbsDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProposalsBoardProps {
  communityId: string;
  proposals: any[];
  isLeader: boolean;
  isMember: boolean;
}

export function ProposalsBoard({ communityId, proposals, isMember }: ProposalsBoardProps) {
  if (proposals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Proposals</h2>
            <p className="text-muted-foreground">
              Member-submitted ideas for discussion and voting
            </p>
          </div>
          {isMember && (
            <Button asChild>
              <Link href={`/communities/${communityId}/proposals/create`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Proposal
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold">No proposals yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Be the first to propose an idea to this community!
            </p>
            {isMember && (
              <Button asChild className="mt-4">
                <Link href={`/communities/${communityId}/proposals/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Proposal
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Proposals</h2>
          <p className="text-muted-foreground">
            {proposals.length} {proposals.length === 1 ? "proposal" : "proposals"}
          </p>
        </div>
        {isMember && (
          <Button asChild>
            <Link href={`/communities/${communityId}/proposals/create`}>
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {proposals.map((proposal) => {
          const authorInitials = proposal.author?.full_name
            ? proposal.author.full_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "??";

          return (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={proposal.author?.avatar_url} />
                      <AvatarFallback>{authorInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{proposal.title}</CardTitle>
                      <CardDescription>
                        by {proposal.author?.full_name || "Anonymous"} •{" "}
                        {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{proposal.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground line-clamp-3">
                  {proposal.description}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {proposal.upvotes || 0}
                    </Button>
                    <Button variant="outline" size="sm">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {proposal.downvotes || 0}
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/communities/${communityId}/proposals/${proposal.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
