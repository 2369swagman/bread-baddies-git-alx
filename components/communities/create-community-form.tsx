"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, Globe } from "lucide-react";
import { createCommunitySchema, type CreateCommunityData } from "@/lib/validations/community";

export function CreateCommunityForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const router = useRouter();

  const form = useForm<CreateCommunityData>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });

  const generateTags = async () => {
    const name = form.getValues("name");
    const description = form.getValues("description");

    if (!name || !description) {
      return;
    }

    setIsGeneratingTags(true);

    try {
      const response = await fetch("/api/claude/infer-community-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: "preview", // Temporary ID for preview
          communityName: name,
          description,
          refine: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedTags(data.tags || []);
      }
    } catch (error) {
      console.error("Error generating tags:", error);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const onSubmit = async (data: CreateCommunityData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/communities/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create community");
      }

      const { community } = await response.json();

      // Redirect to the new community page
      router.push(`/communities/${community.id}`);
    } catch (error) {
      console.error("Error creating community:", error);
      alert(error instanceof Error ? error.message : "Failed to create community. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPrivate = form.watch("isPrivate");

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a Community</h1>
        <p className="text-muted-foreground">
          Start a new community to bring people together around shared interests
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Details</CardTitle>
              <CardDescription>
                Tell us about your community. AI will suggest relevant tags.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tech Enthusiasts" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a clear, descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what your community is about, what you do, and who should join..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A good description helps people understand your community (10-500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy</FormLabel>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={!field.value ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => field.onChange(false)}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Public
                      </Button>
                      <Button
                        type="button"
                        variant={field.value ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => field.onChange(true)}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Private
                      </Button>
                    </div>
                    <FormDescription>
                      {isPrivate
                        ? "Only members can see and join this community"
                        : "Anyone can discover and join this community"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* AI Tag Preview */}
          {(form.watch("name") && form.watch("description")) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Tag Suggestions
                </CardTitle>
                <CardDescription>
                  Preview tags that will help others discover your community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateTags}
                    disabled={isGeneratingTags}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGeneratingTags ? "Generating..." : "Generate Tag Suggestions"}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  You can approve or modify these tags after creating your community
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Community"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
