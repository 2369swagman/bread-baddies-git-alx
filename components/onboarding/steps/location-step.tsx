"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OnboardingFormData } from "@/lib/validations/onboarding";

interface LocationStepProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function LocationStep({ form }: LocationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Location</h2>
        <p className="text-muted-foreground">
          Where are you based? This helps us recommend local communities.
        </p>
      </div>

      <FormField
        control={form.control}
        name="location.city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input placeholder="e.g., San Francisco" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location.state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>State / Province</FormLabel>
            <FormControl>
              <Input placeholder="e.g., California" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location.country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input placeholder="e.g., United States" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
