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
export type InquiryType = "proposition" | "question";
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

export type InvestorInquiry = {
  id: string;
  email: string;
  type: InquiryType;
  message: string;
  receivedAt: string;
  status: InquiryStatus;
};
