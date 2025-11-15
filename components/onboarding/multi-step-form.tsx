"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DemographicsStep } from "./steps/demographics-step";
import { LocationStep } from "./steps/location-step";
import { AffiliationStep } from "./steps/affiliation-step";
import { InterestsStep } from "./steps/interests-step";
import { PreferencesStep } from "./steps/preferences-step";
import { onboardingSchema, type OnboardingFormData } from "@/lib/validations/onboarding";

const STEPS = [
  { id: 1, title: "Demographics", component: DemographicsStep },
  { id: 2, title: "Location", component: LocationStep },
  { id: 3, title: "Affiliation", component: AffiliationStep },
  { id: 4, title: "Interests", component: InterestsStep },
  { id: 5, title: "Preferences", component: PreferencesStep },
];

interface MultiStepFormProps {
  initialData?: Partial<OnboardingFormData>;
  initialStep?: number;
}

export function MultiStepForm({ initialData, initialStep = 1 }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      visibility: 'recommendations-only',
      ...initialData,
    },
  });

  const progress = (currentStep / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[currentStep - 1].component;

  const handleNext = async () => {
    // Save progress before moving to next step
    await saveProgress();

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    // Save current data as skipped
    await saveProgress(true);
    router.push("/dashboard");
  };

  const saveProgress = async (skipped = false) => {
    const data = form.getValues();

    try {
      const response = await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          current_step: currentStep,
          skipped,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save progress");
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      alert("Failed to complete onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Bread Baddies!</h1>
        <p className="text-muted-foreground">
          Let's personalize your experience by learning a bit about you.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {STEPS[currentStep - 1].title}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CurrentStepComponent form={form} />

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for now
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Completing..." : "Complete"}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Privacy Notice */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          All information is optional. Your data is used to provide personalized
          community recommendations and respects your privacy settings.
        </p>
      </div>
    </div>
  );
}
