import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }

  // Create admin client with service role key to perform user management
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // 1. Authenticate caller (they must be an existing administrator)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !user || !user.email) {
      return NextResponse.json({ success: false, message: 'Invalid session credentials' }, { status: 401 });
    }

    // Verify caller is in the administrators table
    const { data: callerProfile, error: callerError } = await adminClient
      .from('administrators')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (callerError || !callerProfile) {
      return NextResponse.json({ success: false, message: 'Access denied: Administrator privileges required' }, { status: 403 });
    }

    // 2. Parse request payload
    const { email, password, name, role } = await request.json();
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, message: 'Email, password, and name are required' }, { status: 400 });
    }

    // 3. Create user in Supabase Auth using admin auth API
    console.log(`[Admin Invite] Registering user ${email} in Supabase Auth...`);
    const { data: authUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createUserError) {
      return NextResponse.json({ success: false, message: `Auth creation failed: ${createUserError.message}` }, { status: 400 });
    }

    // 4. Insert into administrators profiles table
    console.log(`[Admin Invite] Adding user ${email} to administrators profiles...`);
    const { error: profileError } = await adminClient
      .from('administrators')
      .insert({
        id: authUser.user.id,
        email,
        name,
        role: role || 'admin'
      });

    if (profileError) {
      console.error(`[Admin Invite] Failed to insert profile for ${email}:`, profileError.message);
      // Clean up the created auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ success: false, message: `Profile creation failed: ${profileError.message}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Administrator ${name} (${email}) created successfully!` });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Admin Invite API Error]:', msg);
    return NextResponse.json({ success: false, message: msg || 'Internal server error' }, { status: 500 });
  }
}
