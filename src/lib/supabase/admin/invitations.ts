import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export interface SendInvitationEmailParams {
    email: string;
    redirectTo: string;
    data: {
        company_id: string;
        company_name: string;
        role: string;
        invitation_token: string;
    };
}

export async function sendInvitationEmail({
    email,
    redirectTo,
    data,
}: SendInvitationEmailParams) {
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data,
    });

    if (error) throw error;
}
