export type UserRole = "admin" | "investor";
export type UserStatus = "pending" | "approved" | "rejected";
export type ProjectStatus = "open" | "funded" | "closed";
export type InvestmentStatus = "pending" | "accepted" | "rejected";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};

export type ProjectStat = {
  id: string;
  label: string;
  sortOrder: number;
  capitalRaised: string | number;
  investorsCount: number;
  projectedReturn: string | number;
};

export type RiskLevel = "low" | "medium" | "high";
export type Allocation = { label: string; percent: number };
export type TicketTier = { label: string; amount: number; note: string };
export type MilestoneStatus = "done" | "active" | "upcoming";
export type Milestone = { label: string; date: string; status: MilestoneStatus };

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string | null;
  sector: string;
  location: string;
  imageUrl: string | null;
  cloudinaryPublicId: string | null;
  targetAmount: string | number;
  raisedAmount: string | number;
  minInvestment: string | number;
  expectedReturn: string | number;
  durationMonths: number;
  status: ProjectStatus;
  visible: boolean;
  highlights: string[] | null;
  presentationUrl: string | null;
  riskLevel: RiskLevel | null;
  instrument: string | null;
  maxInvestment: string | number | null;
  ticketStep: string | number | null;
  closingDate: string | null;
  payoutFrequency: string | null;
  exitStrategy: string | null;
  securityGuarantees: string | null;
  useOfProceeds: Allocation[];
  capitalStructure: Allocation[];
  ticketTiers: TicketTier[];
  milestones: Milestone[];
  risks: string[];
  stats: ProjectStat[];
  createdAt: string;
};

export type InvestmentRequest = {
  id: string;
  amount: string | number;
  message: string | null;
  status: InvestmentStatus;
  createdAt: string;
  project: Project;
  investor?: AuthUser;
};

export type PublishStatus = "draft" | "published";
export type InquiryType = "proposition" | "question" | "interest";
export type InquiryStatus = "nouveau" | "traité";

export type ServicePlatform = {
  id: string;
  name: string;
  description: string;
  link: string | null;
  imageUrl: string | null;
  imagePublicId?: string | null;
  secondImageUrl: string | null;
  secondImagePublicId?: string | null;
  sortOrder: number;
  status?: PublishStatus;
};

export type HannonService = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  cloudinaryPublicId?: string | null;
  sortOrder: number;
  status?: PublishStatus;
  platforms?: ServicePlatform[];
};

export type InquiryAttachment = {
  name: string;
  size: number;
  url: string | null;
};

export type InvestorInquiry = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  budget: string | number | null;
  projectId: string | null;
  projectTitle: string | null;
  jobTitle: string | null;
  country: string | null;
  investorType: string | null;
  websiteUrl: string | null;
  preferredContact: string | null;
  horizon: string | null;
  activities: string | null;
  ticketTier: string | null;
  attachments: InquiryAttachment[];
  type: InquiryType;
  message: string;
  receivedAt: string;
  status: InquiryStatus;
};
