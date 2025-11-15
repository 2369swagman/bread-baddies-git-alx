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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { OnboardingFormData, LANGUAGES_OPTIONS } from "@/lib/validations/onboarding";

interface PreferencesStepProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function PreferencesStep({ form }: PreferencesStepProps) {
  const [customLanguage, setCustomLanguage] = useState("");
  const selectedLanguages = form.watch("languages") || [];

  const toggleLanguage = (language: string) => {
    const current = selectedLanguages;
    if (current.includes(language)) {
      form.setValue("languages", current.filter((l) => l !== language));
    } else {
      form.setValue("languages", [...current, language]);
    }
  };

  const addCustomLanguage = () => {
    if (customLanguage.trim() && !selectedLanguages.includes(customLanguage.trim())) {
      form.setValue("languages", [...selectedLanguages, customLanguage.trim()]);
      setCustomLanguage("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Languages & Preferences</h2>
        <p className="text-muted-foreground">
          Final step! Tell us about languages you speak and your privacy preferences.
        </p>
      </div>

      <FormField
        control={form.control}
        name="languages"
        render={() => (
          <FormItem>
            <FormLabel>Languages</FormLabel>
            <FormDescription>
              Select languages you speak
            </FormDescription>

            {/* Selected Languages */}
            {selectedLanguages.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-md">
                {selectedLanguages.map((language) => (
                  <Badge
                    key={language}
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer hover:bg-secondary/80"
                  >
                    {language}
                    <X
                      className="ml-2 h-3 w-3"
                      onClick={() => toggleLanguage(language)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Predefined Options */}
            <div className="flex flex-wrap gap-2">
              {LANGUAGES_OPTIONS.map((language) => {
                const isSelected = selectedLanguages.includes(language);
                return (
                  <Badge
                    key={language}
                    variant={isSelected ? "default" : "outline"}
                    className="px-3 py-1 cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                    {isSelected && <X className="ml-2 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>

            {/* Custom Language Input */}
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="Add other language"
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomLanguage();
                    }
                  }}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={addCustomLanguage}
              >
                Add
              </Button>
            </div>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="visibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Privacy Settings</FormLabel>
            <FormDescription>
              Control how your profile information is used
            </FormDescription>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-xs text-muted-foreground">
                        Visible on your profile and used for recommendations
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="recommendations-only">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Recommendations Only (Default)</div>
                      <div className="text-xs text-muted-foreground">
                        Used for AI recommendations but not shown publicly
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Private</div>
                      <div className="text-xs text-muted-foreground">
                        Completely hidden, not used for recommendations
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
