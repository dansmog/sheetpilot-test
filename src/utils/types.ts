export interface RegisterProps {
  fullName: string;
  email: string;
  password: string;
}

export interface CompanyProps {
  id: string;
  name: string;
  domain: string;
  console_slug: string;
  company_email: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  subscription_status: string | null;
  current_plan: string | null;
  employee_count: number;
  location_count: number;
  is_active: boolean;
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
