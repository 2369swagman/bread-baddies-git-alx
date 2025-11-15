"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { OnboardingFormData, INDUSTRIES_OPTIONS } from "@/lib/validations/onboarding";

interface AffiliationStepProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function AffiliationStep({ form }: AffiliationStepProps) {
  const studentStatus = form.watch("student_status");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Affiliation</h2>
        <p className="text-muted-foreground">
          Tell us about your school or work.
        </p>
      </div>

      <FormField
        control={form.control}
        name="student_status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Student Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your student status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="high-school">High School</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="not-student">Not a Student</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {studentStatus && studentStatus !== "not-student" && (
        <FormField
          control={form.control}
          name="school_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Stanford University" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="workplace"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Workplace</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Acme Corp" {...field} />
            </FormControl>
            <FormDescription>Current or most recent employer</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="occupation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Occupation</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Software Engineer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Industry</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {INDUSTRIES_OPTIONS.map((industry) => (
                  <SelectItem key={industry} value={industry.toLowerCase()}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
