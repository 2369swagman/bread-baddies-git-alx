// This file holds all the preset values for your local demo.

// --- Mock User & Profile ---
// We'll define a single demo user.
export const mockUser = {
  id: "demo-user-123",
  email: "demo@example.com",
};

export const mockProfile = {
  id: "demo-user-123",
  full_name: "Demo User",
  email: "demo@example.com",
  avatar_url: "https://github.com/shadcn.png", // Use a placeholder avatar
  profile_attributes: {
    onboarding_completed: true, // Set to true to hide the onboarding banner
  },
};

// --- Mock Community Data ---
// We'll create two demo communities.
const demoCommunity1 = {
  id: "comm-1-local-bakers",
  name: "Local Bakers",
  description: "A community for local bakers to share recipes and tips.",
  avatar_url: "/placeholder.png", // Add a placeholder image to /public
  is_private: false,
  is_verified: true,
  member_count: 12,
  active_projects_count: 1,
  created_at: new Date().toISOString(),
  community_tags: [
    { tag_name: "baking", approved: true },
    { tag_name: "local", approved: true },
  ],
  leader: {
    id: "leader-1",
    full_name: "Jane Dough",
    avatar_url: "https://github.com/shadcn.png",
  },
};

const demoCommunity2 = {
  id: "comm-2-garden-club",
  name: "Neighborhood Garden Club",
  description: "All things gardening in our local neighborhood.",
  avatar_url: "/placeholder.png",
  is_private: true,
  is_verified: false,
  member_count: 8,
  active_projects_count: 0,
  created_at: new Date().toISOString(),
  community_tags: [{ tag_name: "gardening", approved: true }],
  leader: {
    id: "leader-2",
    full_name: "Pat Green",
    avatar_url: "https://github.com/shadcn.png",
  },
};

export const mockCommunities = [demoCommunity1, demoCommunity2];

// --- Mock Membership ---
// This defines the user's relationship to a community.
// We'll make the demo user a leader of the first community.
export const mockMembership = {
  role: "leader",
  status: "active",
};

// --- Mock Bulletin Board Data ---
// Add some proposals and posts for the first community.
export const mockProposals = [
  {
    id: "prop-1",
    community_id: "comm-1-local-bakers",
    title: "Proposal: Sourdough Starter Workshop",
    description: "I think we should host a workshop to teach sourdough.",
    status: "active",
    upvotes: 10,
    downvotes: 1,
    created_at: new Date().toISOString(),
    author: {
      full_name: "Demo User",
      avatar_url: "https://github.com/shadcn.png",
    },
  },
];

export const mockPosts = [
  {
    id: "post-1",
    community_id: "comm-1-local-bakers",
    title: "Fundraiser for New Community Oven",
    description: "We need a new oven! Let's raise money for it.",
    goal_amount: 1000,
    current_amount: 350,
    deadline: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
    status: "active",
    created_at: new Date().toISOString(),
  },
];