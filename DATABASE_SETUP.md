# Database Setup Instructions

This document provides instructions for setting up the Supabase database for the Bread Baddies platform.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

## Setup Steps

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Update the following variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)

### 2. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the SQL

This will create:
- All database tables (profiles, communities, posts, etc.)
- Database triggers for automation
- Helper functions for recommendations
- Indexes for performance

### 3. Enable Row Level Security (RLS)

1. In the SQL Editor, copy and paste the contents of `supabase-rls-policies.sql`
2. Execute the SQL

This will:
- Enable RLS on all tables
- Create security policies for data access control
- Ensure users can only access data they're authorized to see

### 4. Configure OAuth Providers

1. Navigate to **Authentication** > **Providers** in your Supabase dashboard
2. Enable **Google** and **GitHub** OAuth providers:

**For Google:**
- Create a Google OAuth app in the [Google Cloud Console](https://console.cloud.google.com/)
- Add authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
- Copy Client ID and Client Secret to Supabase

**For GitHub:**
- Create a GitHub OAuth app in [GitHub Developer Settings](https://github.com/settings/developers)
- Add callback URL: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
- Copy Client ID and Client Secret to Supabase

### 5. Verify Setup

Run this query in the SQL Editor to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 11 tables:
- profiles
- onboarding_progress
- communities
- community_tags
- community_members
- proposals
- proposal_votes
- posts
- pledges
- comments
- recommendation_dismissals

## Database Schema Overview

### Core Tables

**profiles**
- User profiles with onboarding data (JSONB attributes)
- Auto-created via trigger when user signs up

**communities**
- Community information with leader and verification status
- Tracks member count and active projects

**community_members**
- Junction table for user-community relationships
- Supports roles (leader/member) and status (pending/active/rejected)

**community_tags**
- AI-inferred and leader-curated tags
- Supports approval workflow

### Proposal System

**proposals**
- Member-created ideas for discussion
- Pending approval from leaders

**proposal_votes**
- Upvote/downvote system
- One vote per user per proposal

### Crowdfunding

**posts**
- Leader-approved crowdfunding campaigns
- Auto-updates status when goal met
- Includes AI-generated hover summaries

**pledges**
- User pledges with Stripe payment tracking
- Supports manual capture workflow

**comments**
- Nested comment system for posts

### Recommendations

**recommendation_dismissals**
- Tracks "Not Interested" actions
- Used to refine AI recommendations

## Key Features

### Automatic Updates (Triggers)

1. **Auto-create profile**: When user signs up via OAuth
2. **Auto-add leader**: When community is created
3. **Update amounts**: When pledge is added/removed
4. **Update vote counts**: When votes change
5. **Update member counts**: When members join/leave
6. **Auto-fund posts**: When goal amount is reached

### Security (RLS Policies)

- **Public communities**: Visible to all authenticated users
- **Private communities**: Only visible to members
- **Role-based access**: Leaders can manage, members can participate
- **User ownership**: Users own their profiles, votes, comments

### Performance (Indexes)

- All foreign keys indexed
- Status fields indexed for filtering
- Common query patterns optimized

## Development Workflow

### Local Development

For local development, you can:
1. Use Supabase hosted database (recommended for start)
2. Run Supabase locally with Docker (advanced)

### Migrations

When making schema changes:
1. Test changes in SQL Editor
2. Add migration to `supabase/migrations/` directory
3. Apply via Supabase CLI or manually

## Troubleshooting

### "relation does not exist" errors
- Ensure schema SQL was executed successfully
- Check that you're connected to the correct project

### RLS policy errors
- Verify RLS policies were applied
- Check that user is authenticated
- Review policy conditions in `supabase-rls-policies.sql`

### OAuth not working
- Verify redirect URIs match exactly
- Check that OAuth providers are enabled
- Ensure client ID/secret are correct

## Next Steps

After database setup:
1. Test authentication flow (sign up, sign in)
2. Create a test community
3. Verify RLS policies work as expected
4. Set up Claude API for recommendations
5. Configure Stripe for payments

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
