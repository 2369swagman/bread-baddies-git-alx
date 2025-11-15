"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CommunityCard } from "./community-card";
import { Sparkles, RefreshCw, ExternalLink } from "lucide-react";

interface Recommendation {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  memberCount: number;
  activeProjects: number;
  verified: boolean;
  score: {
    total: number;
    breakdown: {
      sharedTags: number;
      mutualMembers: number;
      demographicAlignment: number;
      sharedInterests: number;
      geographicProximity: number;
      activityLevel: number;
      communitySize: number;
      fundingSuccessRate: number;
    };
  };
}

interface RecommendedCommunitiesProps {
  hasCompletedOnboarding: boolean;
}

export function RecommendedCommunities({ hasCompletedOnboarding }: RecommendedCommunitiesProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!hasCompletedOnboarding) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/claude/generate-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasCompletedOnboarding) {
      fetchRecommendations();
    }
  }, [hasCompletedOnboarding]);

  const handleDismiss = async (communityId: string) => {
    try {
      const response = await fetch("/api/communities/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId }),
      });

      if (response.ok) {
        // Remove from local state
        setRecommendations((prev) =>
          prev.filter((rec) => rec.id !== communityId)
        );
      }
    } catch (err) {
      console.error("Error dismissing community:", err);
    }
  };

  if (!hasCompletedOnboarding) {
    return (
      <section className="space-y-4 mt-12">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Recommended For You</h2>
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg bg-muted/20">
          <div className="text-center space-y-3">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Get Personalized Recommendations</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Complete your profile to receive AI-powered community recommendations
              tailored to your interests and preferences.
            </p>
            <Button asChild className="mt-4">
              <Link href="/onboarding">Complete Profile</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 mt-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Recommended For You</h2>
            <p className="text-muted-foreground text-sm">
              AI-powered suggestions based on your profile
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/communities/browse">
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse All
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {isLoading && recommendations.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold">No recommendations available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We couldn't find any communities matching your profile right now.
              Try updating your profile or browse all communities.
            </p>
            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/profile/edit">Update Profile</Link>
              </Button>
              <Button asChild>
                <Link href="/communities/browse">Browse All</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <CommunityCard
              key={rec.id}
              id={rec.id}
              name={rec.name}
              description={rec.description || undefined}
              tags={rec.tags}
              memberCount={rec.memberCount}
              activeProjects={rec.activeProjects}
              isPrivate={false} // Recommendations are only public communities
              isVerified={rec.verified}
              recentActivity={`Match score: ${Math.round(rec.score.total)}%`}
              showDismiss
              onDismiss={() => handleDismiss(rec.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
