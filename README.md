# bread-baddies-git-alx
A modern, full-stack community crowdfunding platform where users can create or join communities, propose ideas through a bulletin board system, vote on proposals, and create crowdfunding campaigns with smart payment authorization.

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple)

## 🎯 Use Cases

- Communal financing of group trips
- Club and organization fundraising
- Shared workspace/living space purchases
- Community events and projects

## ✨ Features

### ✅ Implemented

- **OAuth Authentication** - Sign in with Google or GitHub via Supabase Auth
- **Smart Onboarding** - 5-step personalized onboarding with skip/resume functionality
- **AI-Powered Recommendations** - Claude AI generates personalized community suggestions based on user profiles
- **Community Management** - Create public/private communities with role-based permissions
- **Proposal System** - Member-driven proposal creation with upvote/downvote voting
- **Tag System** - AI-inferred tags with leader approval workflow
- **Responsive Design** - Mobile-first UI with shadcn/ui components
- **Real-time Updates** - Database triggers for automatic vote counting and status updates

### 🚧 Planned

- **Crowdfunding Projects** - Stripe integration with manual payment capture
- **Nested Comments** - Discussion threads on proposals and projects
- **Notifications** - Real-time alerts for community activity
- **Advanced Search** - Filter communities by tags, location, and activity
- **Analytics Dashboard** - Community insights and funding statistics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up free](https://supabase.com))
- A Stripe account ([sign up](https://stripe.com))
- An Anthropic API key ([get key](https://console.anthropic.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bread-baddies.git
   cd bread-baddies
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - From Supabase Dashboard → Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Dashboard → Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Dashboard → Settings → API
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard → Developers → API Keys
   - `STRIPE_SECRET_KEY` - From Stripe Dashboard → Developers → API Keys
   - `ANTHROPIC_API_KEY` - From Anthropic Console

4. **Set up Supabase database**

   Go to your Supabase Dashboard → SQL Editor and run these files in order:

   a. First, run `supabase-schema.sql` - Creates all tables and triggers

   b. Then, run `supabase-rls-policies.sql` - Sets up security policies

5. **Configure OAuth providers**

   In Supabase Dashboard → Authentication → Providers:
   - Enable **Google** and/or **GitHub**
   - Add callback URL: `http://localhost:3000/auth/callback`

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.3 with App Router
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with OAuth
- **Payments**: Stripe with manual capture
- **AI**: Claude API (Anthropic Sonnet 4)

### Key Libraries
- `@supabase/ssr` - Server-side Supabase client
- `@anthropic-ai/sdk` - Claude AI integration
- `stripe` - Payment processing
- `date-fns` - Date utilities
- `zod` - Schema validation

## 📁 Project Structure

```
bread-baddies/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Landing page
│   ├── login/                   # OAuth login
│   ├── auth/callback/           # OAuth callback handler
│   ├── dashboard/               # User dashboard
│   ├── onboarding/              # 5-step onboarding
│   ├── communities/             # Community pages
│   │   ├── browse/             # Discover communities
│   │   ├── create/             # Create community
│   │   └── [id]/               # Community detail
│   ├── profile/edit/           # Edit profile
│   ├── settings/               # User settings
│   └── api/                    # API routes
│       ├── auth/               # Authentication
│       ├── communities/        # Community CRUD
│       ├── claude/             # AI endpoints
│       └── proposals/          # Proposal voting
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard/              # Dashboard components
│   ├── communities/            # Community components
│   ├── onboarding/             # Onboarding forms
│   └── proposals/              # Proposal components
├── lib/                        # Utilities
│   ├── supabase/              # Supabase clients
│   ├── claude/                # Claude AI client
│   ├── recommendations/       # Recommendation algorithm
│   └── validations/           # Zod schemas
├── types/                      # TypeScript types
├── public/                     # Static assets
└── supabase-*.sql             # Database migrations
```

## 🔐 Security

- **Row Level Security (RLS)** - All database tables protected with granular permissions
- **OAuth Only** - No password storage, reduced attack surface
- **Environment Variables** - Secrets never committed to repository
- **Type Safety** - TypeScript for compile-time error checking
- **Input Validation** - Zod schemas validate all user input
- **CSRF Protection** - Built-in Next.js protection

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Git Workflow

**Always create a feature branch:**

```bash
git checkout -b feature/your-feature-name
# Make changes
git add .
git commit -m "[feat] Your descriptive commit message"
git push origin feature/your-feature-name
```

**Commit Message Format:**

- `[feat]` - New features
- `[fix]` - Bug fixes
- `[refactor]` - Code improvements
- `[docs]` - Documentation
- `[test]` - Testing
- `[style]` - Formatting
- `[chore]` - Maintenance

### Database Migrations

When you make schema changes:

1. Update `supabase-schema.sql` or `supabase-rls-policies.sql`
2. Test locally in Supabase SQL Editor
3. Commit changes to repository
4. Run migrations in production Supabase instance

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Add Environment Variables**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Update OAuth Redirect URLs**
   - In Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL: `https://your-app.vercel.app/auth/callback`

5. **Deploy**
   - Vercel auto-deploys on every push to main

### Environment-Specific Configuration

- **Development**: Use test API keys, `http://localhost:3000`
- **Staging**: Use test API keys, staging domain
- **Production**: Use live API keys, production domain

## 📊 Database Schema

### Core Tables

- `profiles` - Extended user profiles with JSONB attributes
- `onboarding_progress` - Track partial onboarding completion
- `communities` - Community information
- `community_members` - User-community junction with roles
- `community_tags` - AI-inferred + leader-curated tags

### Engagement Tables

- `proposals` - Member-submitted ideas
- `proposal_votes` - Upvote/downvote system
- `posts` - Crowdfunding campaigns
- `pledges` - User contributions with Stripe tracking
- `comments` - Nested comment system

### Recommendations

- `recommendation_dismissals` - Track "Not Interested" actions

### Automated Features

- **Triggers** - Auto-update vote counts, funding amounts, member counts
- **RLS Policies** - Enforce permissions at database level
- **Indexes** - Optimized for common query patterns

## 🤖 AI Integration

### Claude API Features

1. **Community Tag Inference**
   - Input: Community name + description
   - Output: 3-5 relevant tags
   - Requires leader approval

2. **Personalized Recommendations**
   - Analyzes user profile attributes
   - Scores communities based on 8 factors:
     - Shared tags (30%)
     - Mutual members (25%)
     - Shared interests (20%)
     - Demographics (15%)
     - Geography (5%)
     - Activity level (bonus)
     - Size (bonus)
     - Success rate (bonus)

3. **Project Summarization** (Planned)
   - Generates hover previews for crowdfunding projects

## 🐛 Troubleshooting

### Common Issues

**"Invalid supabaseUrl" error**
- Check that `.env.local` has valid Supabase URL and keys
- Restart dev server after changing environment variables

**404 errors on routes**
- Verify all page files exist in `app/` directory
- Check browser console for client-side routing errors

**Database errors**
- Ensure SQL migrations ran successfully
- Check RLS policies aren't blocking your queries
- Verify user is authenticated

**OAuth not working**
- Confirm callback URL in Supabase matches `http://localhost:3000/auth/callback`
- Enable providers in Supabase Dashboard
- Check browser console for redirect errors

## 📚 Documentation

- [CLAUDE.md](CLAUDE.md) - Comprehensive technical documentation
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database setup guide
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Claude API Docs](https://docs.anthropic.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m '[feat] Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes. All rights reserved.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Database powered by [Supabase](https://supabase.com)
- Payments by [Stripe](https://stripe.com)
- AI by [Anthropic Claude](https://anthropic.com)

---

**Built with Claude Code** 🤖
