// Database Types
export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  hasResidence: boolean;
  hasInternet: boolean;
  hasSpace: boolean;
  referralSource?: string;
  referralCode?: string;
  sessionId?: string;
  ipAddress?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent?: string;
  screenResolution?: string;
  submissionTime: string;
  timeToComplete?: number;
  status: 'new' | 'contacted' | 'qualified' | 'approved' | 'rejected' | 'installed';
  monthlyEarnings?: number;
  equipmentType?: string;
  installationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'user' | 'admin' | 'affiliate';
  emailVerified: boolean;
  lastLogin?: string;
  referralCode?: string;
  referralCount?: number;
  totalEarnings?: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Affiliate {
  id: string;
  userId: string;
  user?: User;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingCommission: number;
  paidCommission: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  user?: User;
  amount: number;
  type: 'commission' | 'bonus' | 'monthly_earnings';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'check';
  referenceNumber?: string;
  processedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate?: string;
  endDate?: string;
  winningVariant?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  conversions: number;
  views: number;
  conversionRate: number;
}

// Form Types
export interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  hasResidence: boolean;
  hasInternet: boolean;
  hasSpace: boolean;
  referralCode?: string;
}

export interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  hasResidence?: string;
  hasInternet?: string;
  hasSpace?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatsResponse {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  approvedLeads: number;
  conversionRate: number;
  averageTimeToComplete: number;
  topStates: Array<{ state: string; count: number }>;
  topReferralSources: Array<{ source: string; count: number }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// Component Props Types
export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  userId?: string;
  properties?: Record<string, any>;
}

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// Auth Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

// Session Types
export interface SessionData {
  sessionId: string;
  startTime: number;
  currentStep: 'overview' | 'application' | 'confirmation';
  formProgress: number;
  events: AnalyticsEvent[];
}