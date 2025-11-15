import Anthropic from "@anthropic-ai/sdk";

// Initialize Claude client
export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude configuration
export const CLAUDE_CONFIG = {
  model: "claude-sonnet-4-20250514", // Sonnet for balance of speed/quality
  max_tokens: 4096,
  temperature: 0.7,
};

// Prompt templates
export const PROMPTS = {
  inferCommunityTags: (communityName: string, description: string, existingPosts?: string[]) => `
You are helping categorize a community on a crowdfunding platform. Based on the community information provided, suggest 3-5 relevant tags that describe what this community is about.

Community Name: ${communityName}
Description: ${description || "No description provided"}
${existingPosts?.length ? `Recent Activity: ${existingPosts.join(", ")}` : ""}

Requirements:
- Suggest 3-5 tags maximum
- Tags should be single words or short phrases (max 2 words)
- Focus on themes, activities, or interests
- Be specific and relevant
- Use lowercase

Return ONLY a JSON array of tags, nothing else.
Example: ["technology", "education", "community-service"]
`,

  generateRecommendations: (
    userProfile: any,
    communities: any[],
    userCommunities: string[],
    dismissedCommunities: string[]
  ) => `
You are an AI recommendation system for a community crowdfunding platform. Your task is to recommend communities to a user based on their profile and interests.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Communities user is already in: ${userCommunities.join(", ") || "None"}
Communities user dismissed: ${dismissedCommunities.join(", ") || "None"}

Available Communities to Recommend:
${JSON.stringify(communities, null, 2)}

Task:
1. Analyze the user's profile (interests, location, occupation, etc.)
2. Match them with communities that align with their profile
3. Consider geographic proximity for local communities
4. Ensure diversity in recommendations (mix of sizes, topics, activity levels)
5. Exclude communities they're already in or have dismissed
6. Return top 10 community recommendations

Return a JSON array of community IDs ranked by relevance (best matches first).
Example: ["uuid-1", "uuid-2", "uuid-3", ...]
`,

  summarizeProject: (title: string, description: string) => `
Summarize this crowdfunding project in ONE sentence (max 15 words) suitable for a hover preview.

Project Title: ${title}
Description: ${description}

Requirements:
- Exactly one sentence
- Maximum 15 words
- Focus on what's being funded and why
- Be concise and compelling
- No emojis or special characters

Return ONLY the summary sentence, nothing else.
`,

  refineTagsAfterActivity: (
    communityName: string,
    currentTags: string[],
    recentProposals: string[],
    recentPosts: string[]
  ) => `
You are refining tags for a community based on recent activity. Review the current tags and recent activity, then suggest updated tags that better reflect what the community is actually doing.

Community Name: ${communityName}
Current Tags: ${currentTags.join(", ")}

Recent Proposals: ${recentProposals.join(", ") || "None"}
Recent Crowdfunding Projects: ${recentPosts.join(", ") || "None"}

Task:
1. Review if current tags still fit
2. Suggest new tags based on actual activity
3. Remove tags that no longer apply
4. Return 3-5 tags maximum

Return ONLY a JSON array of refined tags, nothing else.
Example: ["technology", "education", "community-service"]
`,
};

// Helper function to parse JSON response
export function parseClaudeJSON<T>(content: string): T | null {
  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;

    return JSON.parse(jsonString.trim());
  } catch (error) {
    console.error("Failed to parse Claude response:", error);
    return null;
  }
}

// Response caching helper
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export function getCachedResponse(key: string): any | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  responseCache.delete(key);
  return null;
}

export function setCachedResponse(key: string, data: any): void {
  responseCache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(): void {
  responseCache.clear();
}
