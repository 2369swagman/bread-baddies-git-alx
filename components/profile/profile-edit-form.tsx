"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemographicsStep } from "@/components/onboarding/steps/demographics-step";
import { LocationStep } from "@/components/onboarding/steps/location-step";
import { AffiliationStep } from "@/components/onboarding/steps/affiliation-step";
import { InterestsStep } from "@/components/onboarding/steps/interests-step";
import { PreferencesStep } from "@/components/onboarding/steps/preferences-step";
import { onboardingSchema, type OnboardingFormData } from "@/lib/validations/onboarding";
import type { Profile } from "@/types/database";

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: profile.profile_attributes,
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-muted-foreground">
          Update your information to refine your community recommendations.
        </p>
      </div>

      {/* Form with Tabs */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="demographics" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="affiliation">Affiliation</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="demographics">
              <DemographicsStep form={form} />
            </TabsContent>

            <TabsContent value="location">
              <LocationStep form={form} />
            </TabsContent>

            <TabsContent value="affiliation">
              <AffiliationStep form={form} />
            </TabsContent>

            <TabsContent value="interests">
              <InterestsStep form={form} />
            </TabsContent>

            <TabsContent value="preferences">
              <PreferencesStep form={form} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Info Notice */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Updating your profile will refresh your community
          recommendations. Changes are reflected immediately.
        </p>
      </div>
    </div>
  );
}
