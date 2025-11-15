"use client";

import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { OnboardingFormData, INTERESTS_OPTIONS } from "@/lib/validations/onboarding";

interface InterestsStepProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function InterestsStep({ form }: InterestsStepProps) {
  const [customInterest, setCustomInterest] = useState("");
  const selectedInterests = form.watch("interests") || [];

  const toggleInterest = (interest: string) => {
    const current = selectedInterests;
    if (current.includes(interest)) {
      form.setValue("interests", current.filter((i) => i !== interest));
    } else {
      form.setValue("interests", [...current, interest]);
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      form.setValue("interests", [...selectedInterests, customInterest.trim()]);
      setCustomInterest("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Interests</h2>
        <p className="text-muted-foreground">
          Select your interests to help us recommend relevant communities.
        </p>
      </div>

      <FormField
        control={form.control}
        name="interests"
        render={() => (
          <FormItem>
            <FormLabel>Your Interests</FormLabel>
            <FormDescription>
              Click to select from common interests or add your own
            </FormDescription>

            {/* Selected Interests */}
            {selectedInterests.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-md">
                {selectedInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer hover:bg-secondary/80"
                  >
                    {interest}
                    <X
                      className="ml-2 h-3 w-3"
                      onClick={() => toggleInterest(interest)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Predefined Options */}
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <Badge
                    key={interest}
                    variant={isSelected ? "default" : "outline"}
                    className="px-3 py-1 cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                    {isSelected && <X className="ml-2 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>

            {/* Custom Interest Input */}
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="Add custom interest"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomInterest();
                    }
                  }}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={addCustomInterest}
              >
                Add
              </Button>
            </div>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
