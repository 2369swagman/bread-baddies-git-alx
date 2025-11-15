import { z } from "zod";

export const createCommunitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  isPrivate: z.boolean().default(false),
});

export type CreateCommunityData = z.infer<typeof createCommunitySchema>;

export const updateCommunitySchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  isPrivate: z.boolean().optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type UpdateCommunityData = z.infer<typeof updateCommunitySchema>;
