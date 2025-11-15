"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, DollarSign, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProjectsBoardProps {
  communityId: string;
  posts: any[];
  isLeader: boolean;
  isMember: boolean;
}

export function ProjectsBoard({ communityId, posts, isLeader }: ProjectsBoardProps) {
  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Crowdfunding Projects</h2>
            <p className="text-muted-foreground">
              Leader-approved projects seeking funding
            </p>
          </div>
          {isLeader && (
            <Button asChild>
              <Link href={`/communities/${communityId}/projects/create`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold">No active projects</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isLeader
                ? "Create your first crowdfunding project"
                : "No crowdfunding campaigns at the moment"}
            </p>
            {isLeader && (
              <Button asChild className="mt-4">
                <Link href={`/communities/${communityId}/projects/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
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
          <h2 className="text-2xl font-bold">Crowdfunding Projects</h2>
          <p className="text-muted-foreground">
            {posts.length} {posts.length === 1 ? "project" : "projects"}
          </p>
        </div>
        {isLeader && (
          <Button asChild>
            <Link href={`/communities/${communityId}/projects/create`}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => {
          const progress = (post.current_amount / post.goal_amount) * 100;
          const daysLeft = Math.ceil(
            (new Date(post.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Card key={post.id} className="group hover:shadow-lg transition-shadow relative overflow-hidden">
              {post.image_url && (
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${post.image_url})` }}
                />
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  <Badge
                    variant={post.status === "funded" ? "default" : "secondary"}
                  >
                    {post.status}
                  </Badge>
                </div>
                {post.hover_summary && (
                  <CardDescription className="line-clamp-2">
                    {post.hover_summary}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Funding Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">${post.current_amount.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      of ${post.goal_amount.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress)}% funded</span>
                    {daysLeft > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {daysLeft} days left
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/communities/${communityId}/projects/${post.id}`}>
                      View Details
                    </Link>
                  </Button>
                  {post.status === "active" && (
                    <Button size="sm" asChild>
                      <Link href={`/communities/${communityId}/projects/${post.id}/pledge`}>
                        <DollarSign className="h-4 w-4 mr-1" />
                        Pledge
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
