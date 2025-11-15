"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OnboardingBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                Complete your profile to get personalized community recommendations
              </p>
              <p className="text-xs text-muted-foreground">
                It only takes a minute and helps us match you with the right communities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/onboarding">Complete Profile</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsDismissed(true)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Red indicator dot */}
      <div className="absolute top-2 left-2 w-2 h-2 bg-destructive rounded-full animate-pulse" />
    </div>
  );
}
