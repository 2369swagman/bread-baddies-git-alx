"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Lock, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityCardProps {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  tags?: string[];
  memberCount: number;
  activeProjects: number;
  isPrivate: boolean;
  isVerified: boolean;
  recentActivity?: string;
  showDismiss?: boolean;
  onDismiss?: () => void;
}

export function CommunityCard({
  id,
  name,
  description,
  avatarUrl,
  tags = [],
  memberCount,
  activeProjects,
  isPrivate,
  isVerified,
  recentActivity,
  showDismiss = false,
  onDismiss,
}: CommunityCardProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="group relative hover:shadow-lg transition-shadow duration-200">
      <Link href={`/communities/${id}`}>
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  {isVerified && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {isPrivate && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                  {!isPrivate && (
                    <Badge variant="secondary" className="text-xs">
                      Public
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {description && (
            <CardDescription className="line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{memberCount} members</span>
            </div>
            {activeProjects > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>{activeProjects} active</span>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {recentActivity && (
            <div className="text-xs text-muted-foreground">
              {recentActivity}
            </div>
          )}
        </CardContent>
      </Link>

      {/* Dismiss Button */}
      {showDismiss && onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDismiss();
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </Card>
  );
}
