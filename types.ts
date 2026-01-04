
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  twoFactorEnabled?: boolean;
  lastLogin?: string;
}

export interface LoginActivity {
  id: string;
  device: string;
  location: string;
  ip: string;
  timestamp: string;
  isCurrent: boolean;
}

export interface DonorLead {
  name: string;
  type: 'Foundation' | 'Corporate' | 'Individual' | 'Government';
  relevanceScore: number;
  description: string;
  focusAreas: string[];
  email: string; // Added email field
}

export interface DraftProposal {
  id: string;
  donorName: string;
  projectTitle: string;
  content: string;
  createdAt: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  analysis: string;
  leads: DonorLead[];
  sources: GroundingSource[];
}

export interface NonprofitProfile {
  name: string;
  mission: string;
  impactStatement: string;
  website: string;
}

export interface NonprofitProjectInfo {
  projectTitle: string;
  projectGoals: string;
  amountRequested: string;
  timeline: string;
  beneficiaries: string;
  nonprofitName: string;
  mission: string;
}

export interface VerificationInfo {
  status: 'Verified' | 'Unverified' | 'Pending' | 'Flagged';
  officialName: string;
  registrationId: string;
  taxStatus: string;
  lastUpdated: string;
  verificationSources: GroundingSource[];
  summary: string;
}

export interface Review {
  id: string;
  donorName: string;
  donorType: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

export enum NonprofitCategory {
  EDUCATION = 'Education',
  HEALTHCARE = 'Healthcare',
  ENVIRONMENT = 'Environment',
  ANIMAL_WELFARE = 'Animal Welfare',
  ARTS_CULTURE = 'Arts & Culture',
  HUMAN_SERVICES = 'Human Services',
  INTERNATIONAL_AID = 'International Aid',
  TECHNOLOGY = 'Technology'
}

export type AppView = 'discovery' | 'trust-center' | 'billing' | 'account';

export interface SubscriptionPlan {
  id: 'free' | 'pro';
  name: string;
  price: string;
  features: string[];
}
