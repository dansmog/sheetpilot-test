export interface LoginProps {
  email: string;
  password: string;
}

// export interface LoginResponseProps {
//   success: boolean;
//   user: any;
//   company: any;
//   redirectUrl: string;
//   error?: string;
// }

export interface RegisterProps {
  fullName: string;
  email: string;
  password: string;
}

export interface CompanyProps {
  id: string;
  name: string;
  domain: string;
  slug: string;
  company_email: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  subscription_status: string | null;
  current_plan: string | null;
  employee_count: number;
  location_count: number;
  is_active: boolean;
  stripe_customer_id?: string;
  scheduled_plan_change?: string | null;
  scheduled_change_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationProps {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  timezone?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LocationsOptionsProps {
  activeOnly?: boolean;
}

export interface UpdateProfileDataProps {
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  bio?: string;
}

export interface UserProfileProps {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCompanyProps {
  id: string;
  company_id: string;
  role: "owner" | "admin" | "member";
  status: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    current_plan: string | null;
    subscription_status: string | null;
    location_count: number;
    employee_count: number;
    scheduled_plan_change?: string | null;
    scheduled_change_date?: string | null;
    subscriptions?: Array<{
      id: string;
      stripe_subscription_id: string | null;
      status: string | null;
      current_period_start: string | null;
      current_period_end: string | null;
      cancel_at_period_end: boolean | null;
      is_active: boolean | null;
      billing_interval?: string | null;
    }>;
  };
}

export interface CompanyMemberProps {
  id: string;
  company_id: string;
  user_id: string | null;
  email: string | null;
  role: "owner" | "manager" | "employee";
  status: "active" | "pending" | "suspended" | "fired" | "left" | "rejected";
  primary_location_id: string | null;
  is_location_scoped: boolean;
  admin_permissions: string[];
  suspended_at: string | null;
  suspended_by: string | null;
  suspended_reason: string | null;
  fired_at: string | null;
  fired_by: string | null;
  fired_reason: string | null;
  left_at: string | null;
  left_reason: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejected_reason: string | null;
  invitation_token: string | null;
  invitation_type: "link" | "email" | "application" | null;
  invited_by: string | null;
  invitation_sent_at: string | null;
  invitation_accepted_at: string | null;
  invitation_expires_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  company?: {
    id: string;
    name: string;
  } | null;
  primary_location?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface CompanyMembersOptionsProps {
  activeOnly?: boolean;
  locationId?: string;
}
