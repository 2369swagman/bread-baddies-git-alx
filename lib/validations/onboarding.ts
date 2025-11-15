import { z } from "zod";

// Step 1: Demographics
export const demographicsSchema = z.object({
  age_range: z.enum(['18-24', '25-34', '35-44', '45-54', '55-64', '65+']).optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say', 'other']).optional(),
});

// Step 2: Location
export const locationSchema = z.object({
  location: z.object({
    city: z.string().min(1, "City is required").optional(),
    state: z.string().min(1, "State is required").optional(),
    country: z.string().min(1, "Country is required").optional(),
  }).optional(),
});

// Step 3: Affiliation
export const affiliationSchema = z.object({
  student_status: z.enum(['high-school', 'undergraduate', 'graduate', 'not-student']).optional(),
  school_name: z.string().optional(),
  workplace: z.string().optional(),
  occupation: z.string().optional(),
  industry: z.string().optional(),
});

// Step 4: Interests
export const interestsSchema = z.object({
  interests: z.array(z.string()).optional(),
});

// Step 5: Languages & Preferences
export const preferencesSchema = z.object({
  languages: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'recommendations-only', 'private']).default('recommendations-only'),
});

// Combined onboarding schema
export const onboardingSchema = z.object({
  ...demographicsSchema.shape,
  ...locationSchema.shape,
  ...affiliationSchema.shape,
  ...interestsSchema.shape,
  ...preferencesSchema.shape,
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Predefined options
export const INTERESTS_OPTIONS = [
  'Sports',
  'Technology',
  'Travel',
  'Cooking',
  'Music',
  'Art',
  'Photography',
  'Gaming',
  'Reading',
  'Fitness',
  'Fashion',
  'Food',
  'Movies',
  'Nature',
  'Pets',
  'Volunteering',
  'Business',
  'Science',
  'Education',
  'Health',
];

export const LANGUAGES_OPTIONS = [
  'English',
  'Spanish',
  'Mandarin',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Italian',
  'Portuguese',
  'Russian',
  'Arabic',
  'Hindi',
  'Other',
];

export const INDUSTRIES_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Hospitality',
  'Entertainment',
  'Construction',
  'Transportation',
  'Agriculture',
  'Government',
  'Non-profit',
  'Other',
];
