import { z } from "zod";

export const createProposalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description must be less than 2000 characters"),
});

export type CreateProposalData = z.infer<typeof createProposalSchema>;

export const voteSchema = z.object({
  proposalId: z.string().uuid(),
  voteType: z.enum(['upvote', 'downvote']),
});

export type VoteData = z.infer<typeof voteSchema>;
