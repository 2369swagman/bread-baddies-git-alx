# Bread Baddies - Platform Documentation

## Project Overview

Bread Baddies is a modern, full-stack community crowdfunding platform where users can create or join communities, propose ideas through a bulletin board system, vote on proposals, and create crowdfunding campaigns with smart payment authorization using Stripe.

**Use Cases:**
- Communal financing of group trips
- Club and organization fundraising
- Shared workspace/living space purchases
- Community events and projects

---

## Tech Stack

### Core Technologies
- **Framework**: Next.js 16.0.3 with App Router
- **Runtime**: React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Icons**: lucide-react

### Backend & Services
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth with OAuth (Google & GitHub)
- **Payments**: Stripe with manual capture
- **AI**: Claude API (Anthropic) for recommendations and tagging

### Form & Validation
- **Form Management**: React Hook Form 7.66.0
- **Validation**: Zod 4.1.12
- **Date Handling**: date-fns 4.1.0

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│                                                          │
│  Next.js 16 App Router + React 19 + Tailwind CSS 4     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Dashboard │  │Communities│  │Onboarding│             │
│  └──────────┘  └──────────┘  └──────────┘             │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│               API Routes (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Auth      │  │Communities│  │Claude AI │             │
│  │Routes    │  │CRUD       │  │Routes    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└───────┬─────────────┬─────────────┬────────────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌──────────┐ ┌────────────┐
│  Supabase   │ │PostgreSQL│ │Claude API  │
│  Auth       │ │Database  │ │(Sonnet)    │
│  (OAuth)    │ │+ RLS     │ │            │
└─────────────┘ └──────────┘ └────────────┘
                      │
                      ▼
               ┌──────────┐
               │ Stripe   │
               │ Payments │
               └──────────┘
```

### Data Flow

**1. User Onboarding:**
```
User Sign Up (OAuth) → Profile Creation (Trigger) → Onboarding Form →
Profile Attributes (JSONB) → Claude Recommendations
```

**2. Community Discovery:**
```
User Profile → Claude API → Scoring Algorithm (8 factors) →
Ranked Communities → Dashboard Display
```

**3. Crowdfunding:**
```
Project Creation → Stripe Payment Intent (Manual Capture) →
Pledge Authorization → Goal Met → Auto-Capture → Project Funded
```

---

## Database Schema

### Tables (11 Total)

**Core Tables:**
1. **profiles** - User profiles with JSONB attributes
2. **onboarding_progress** - Track partial completion
3. **communities** - Community information
4. **community_members** - User-community junction
5. **community_tags** - AI-inferred + leader-curated tags

**Engagement Tables:**
6. **proposals** - Member-submitted ideas
7. **proposal_votes** - Upvote/downvote system
8. **posts** - Crowdfunding campaigns
9. **pledges** - User contributions with Stripe tracking
10. **comments** - Nested comment system

**Recommendations:**
11. **recommendation_dismissals** - Track user preferences

### Key Features

**Row Level Security (RLS):**
- Public communities visible to all
- Private communities only to members
- Role-based permissions (leader/member)
- User ownership of votes and comments

**Automated Triggers:**
- Auto-create profile on signup
- Auto-add leader as member
- Auto-update funding amounts
- Auto-change status when goal met
- Auto-update vote counts

**Indexes:**
- All foreign keys indexed
- Status fields indexed for filtering
- Optimized for common query patterns

---

## AI Integration

### Claude API Implementation

**Model:** Claude Sonnet 4 (balance of speed/quality/cost)

**Use Cases:**

1. **Community Tag Inference**
   - Input: Community name + description
   - Output: 3-5 relevant tags
   - Caching: 1 hour TTL
   - Approval: Requires leader confirmation

2. **Recommendation Engine**
   - Input: User profile attributes
   - Scoring Factors (weighted):
     - Shared tags (30%)
     - Mutual members (25%)
     - Shared interests (20%)
     - Demographic alignment (15%)
     - Geographic proximity (5%)
     - Activity level (bonus)
     - Community size (bonus)
     - Funding success rate (bonus)
   - Output: Ranked list of communities
   - Diversity: Ensures varied recommendations

3. **Project Summarization**
   - Input: Project title + description
   - Output: 1-sentence summary (max 15 words)
   - Usage: Hover previews on project cards
   - Caching: Permanent (updates project record)

**Prompt Engineering:**
- Structured prompts with clear requirements
- JSON output format
- Examples for consistency
- Error handling and fallbacks

---

## Component Architecture

### Page Structure

```
app/
├── page.tsx                      # Landing page
├── dashboard/page.tsx            # User dashboard
├── onboarding/page.tsx          # 5-step onboarding
├── profile/edit/page.tsx        # Profile editing
├── communities/
│   ├── create/page.tsx          # Create community
│   ├── [id]/page.tsx            # Community detail
│   │   └── proposals/
│   │       └── create/page.tsx  # Create proposal
└── api/
    ├── auth/logout/route.ts
    ├── onboarding/
    │   ├── save/route.ts
    │   └── complete/route.ts
    ├── communities/
    │   ├── create/route.ts
    │   ├── dismiss/route.ts
    │   └── [id]/proposals/route.ts
    ├── claude/
    │   ├── infer-community-tags/route.ts
    │   ├── generate-recommendations/route.ts
    │   └── summarize-project/route.ts
    └── proposals/[id]/vote/route.ts
```

### Component Hierarchy

**Dashboard:**
- NavigationMenu (mobile + desktop)
- OnboardingBanner (conditional)
- MyCommunities
  - CommunityCard[]
- RecommendedCommunities
  - CommunityCard[]

**Community Page:**
- CommunityHeader
- CommunityTabs
  - ProposalsBoard
    - ProposalCard[]
  - ProjectsBoard
    - ProjectCard[]

**Onboarding:**
- MultiStepForm
  - DemographicsStep
  - LocationStep
  - AffiliationStep
  - InterestsStep
  - PreferencesStep

---

## Git Best Practices

### Workflow Requirements

**⚠️ MANDATORY:**
1. **ALWAYS create a feature branch BEFORE making changes**
   ```bash
   git checkout -b feature/[feature-name]
   # or
   git checkout -b fix/[bug-name]
   ```

2. **Commit changes REGULARLY during development**
   - After completing each major step
   - When switching between different files/features
   - Before running build/tests
   - Use meaningful commit messages with [Type] prefix

3. **NEVER work directly on main branch**
   - All changes must go through feature branches
   - Create pull requests for review

### Commit Message Format

```
[Type] Brief description

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `[feat]` - New features
- `[fix]` - Bug fixes
- `[refactor]` - Code improvements
- `[docs]` - Documentation
- `[test]` - Testing
- `[style]` - Formatting
- `[chore]` - Maintenance

### Branch Naming

- `feature/[feature-name]` - New features
- `fix/[bug-name]` - Bug fixes
- `refactor/[scope]` - Code improvements
- `docs/[topic]` - Documentation
- `test/[scope]` - Testing

### Pull Request Guidelines

- Create PR for each feature/phase
- Review before merging to main
- Include testing checklist
- Document breaking changes

**⚠️ If you complete a task without proper Git commits = TASK INCOMPLETE**

---

## Testing Strategy

### Test Coverage

**Unit Tests:**
- Recommendation algorithm logic
- Form validation schemas
- Utility functions (cn, date formatting)
- Component rendering (shadcn/ui)

**Integration Tests:**
- API routes (auth, communities, proposals)
- Database operations (CRUD, triggers)
- RLS policy enforcement
- Supabase client operations

**E2E Tests (Playwright/Cypress):**
- Onboarding complete/skip/resume flow
- Community creation → project creation → pledge → funding
- Browse → join community → create proposal → vote
- Admin approval workflows
- Payment flow with Stripe test mode

### Test Files Structure

```
__tests__/
├── unit/
│   ├── scoring.test.ts
│   ├── validation.test.ts
│   └── utils.test.ts
├── integration/
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── communities.test.ts
│   │   └── claude.test.ts
│   └── database/
│       ├── triggers.test.ts
│       └── rls.test.ts
└── e2e/
    ├── onboarding.spec.ts
    ├── community-flow.spec.ts
    └── crowdfunding.spec.ts
```

### Claude API Testing

- **Unit tests:** Mock Claude responses
- **Integration tests:** Test Claude API key with limited calls
- **Manual testing:** Edge cases (to save API costs)

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all

# Coverage report
npm run test:coverage
```

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Deployment

### Prerequisites

1. **Supabase Project**
   - Run `supabase-schema.sql`
   - Run `supabase-rls-policies.sql`
   - Enable OAuth providers
   - Configure redirect URLs

2. **Stripe Account**
   - Get test/live API keys
   - Configure webhook endpoint
   - Set up payment methods

3. **Claude API**
   - Get API key from Anthropic Console
   - Monitor usage and costs

### Deployment Steps

**Vercel (Recommended):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

**Environment-Specific:**
- Development: Use test keys
- Production: Use live keys
- Staging: Use test keys with production build

### Post-Deployment

1. Test OAuth flows
2. Verify Stripe webhooks
3. Test Claude API responses
4. Monitor error tracking (Sentry recommended)
5. Set up analytics (Vercel Analytics)

---

## Key Features

### Completed Features ✅

1. **Authentication**
   - OAuth (Google, GitHub)
   - Session management
   - Protected routes

2. **Onboarding**
   - 5-step multi-step form
   - Skip/resume functionality
   - Profile attributes (JSONB)
   - Privacy controls

3. **Dashboard**
   - My Communities section
   - AI-powered recommendations
   - Community cards
   - Navigation (mobile + desktop)

4. **Community Management**
   - Create communities
   - Public/private toggle
   - AI tag generation
   - Two bulletin boards

5. **Proposals System**
   - Member-driven proposals
   - Upvote/downvote
   - Approval workflow

6. **AI Integration**
   - Community tagging
   - Personalized recommendations
   - Project summarization

### Planned Features 🚧

1. **Crowdfunding Projects**
   - Project creation (leaders)
   - Stripe payment integration
   - Manual capture workflow
   - Auto-fund when goal met

2. **Comments System**
   - Nested comments
   - Edit/delete functionality
   - Real-time updates

3. **Admin Features**
   - Member management
   - Tag approval
   - Content moderation

4. **Enhanced Features**
   - Activity feeds
   - Notifications
   - Search and filters
   - Mobile app

---

## Performance Optimization

### Implemented Optimizations

1. **Database**
   - Indexed foreign keys
   - Optimized queries
   - Connection pooling (Supabase)

2. **Caching**
   - Claude API responses (1 hour TTL)
   - In-memory caching for recommendations
   - Static page generation where possible

3. **Frontend**
   - Code splitting (Next.js automatic)
   - Image optimization (next/image)
   - Lazy loading components

4. **API**
   - Background jobs for tag generation
   - Debounced API calls
   - Optimistic UI updates

### Monitoring

- **Error Tracking**: Sentry (recommended)
- **Analytics**: Vercel Analytics
- **Database**: Supabase Dashboard
- **API Usage**: Claude API Console

---

## Security Considerations

### Implemented Security

1. **Row Level Security (RLS)**
   - All tables protected
   - Role-based access
   - User ownership verification

2. **Input Validation**
   - Zod schemas
   - Server-side validation
   - Type-safe queries

3. **Authentication**
   - OAuth only (no password storage)
   - Session management
   - CSRF protection (Next.js built-in)

4. **Environment Variables**
   - Never commit `.env.local`
   - Use `.env.example` template
   - Rotate keys regularly

### Security Checklist

- [ ] All environment variables set
- [ ] RLS policies tested
- [ ] OAuth redirects configured
- [ ] Stripe webhooks verified
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Error messages don't leak info

---

## Troubleshooting

### Common Issues

**1. "relation does not exist"**
- Ensure schema SQL was executed
- Check Supabase connection
- Verify table names match

**2. RLS policy errors**
- Check user authentication
- Verify policy conditions
- Review membership status

**3. Claude API errors**
- Verify API key
- Check usage limits
- Review prompt format
- Check response parsing

**4. Stripe webhook failures**
- Verify webhook secret
- Check endpoint URL
- Review payload format
- Test with Stripe CLI

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Claude API Documentation](https://docs.anthropic.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## License

This project is for educational purposes. All rights reserved.

---

**Built with Claude Code** 🤖
