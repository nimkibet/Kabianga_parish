import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Helper to verify admin privileges
async function verifyAdmin(request: NextRequest, adminClient: any) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Unauthorized access');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !user || !user.email) {
    throw new Error('Invalid session credentials');
  }

  // Verify caller is in the administrators table
  const { data: callerProfile, error: callerError } = await adminClient
    .from('administrators')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  if (callerError || !callerProfile) {
    throw new Error('Access denied: Administrator privileges required');
  }

  return callerProfile;
}

// 1. GET: List all users in Supabase Auth + their public administrator profiles
export async function GET(request: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    await verifyAdmin(request, adminClient);

    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();
    if (authError) throw authError;

    const { data: dbAdmins, error: dbError } = await adminClient
      .from('administrators')
      .select('*');
    if (dbError) throw dbError;

    return NextResponse.json({ 
      success: true, 
      users: authData.users || [],
      profiles: dbAdmins || []
    });
  } catch (err: any) {
    console.error('[Admin List Users API Error]:', err.message);
    const status = err.message.includes('Access denied') || err.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ success: false, message: err.message }, { status });
  }
}

// 2. POST: Create a user account in Supabase Auth AND public.administrators
export async function POST(request: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    await verifyAdmin(request, adminClient);

    const { email, password, name, role } = await request.json();
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, message: 'Name, email and password are required' }, { status: 400 });
    }

    console.log(`[Admin User Creation] Creating user ${email} in Supabase Auth...`);
    const { data, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError) throw createError;

    console.log(`[Admin User Creation] Creating profile row for ${email} in administrators table...`);
    const { error: profileError } = await adminClient
      .from('administrators')
      .insert({
        id: data.user.id,
        email,
        name,
        role: role || 'admin'
      });

    if (profileError) {
      console.error(`[Admin User Creation] Failed to insert profile for ${email}:`, profileError.message);
      // Clean up the created auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(data.user.id);
      throw profileError;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Account for ${name} (${email}) created successfully!`
    });
  } catch (err: any) {
    console.error('[Admin Create User API Error]:', err.message);
    const status = err.message.includes('Access denied') || err.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ success: false, message: err.message }, { status });
  }
}

// 3. PATCH: Update password for a user in Supabase Auth
export async function PATCH(request: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    await verifyAdmin(request, adminClient);

    const { userId, password } = await request.json();
    if (!userId || !password) {
      return NextResponse.json({ success: false, message: 'User ID and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    console.log(`[Admin Update Password] Updating password for user ${userId}...`);
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      password: password
    });

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Password updated successfully!' });
  } catch (err: any) {
    console.error('[Admin Update Password API Error]:', err.message);
    const status = err.message.includes('Access denied') || err.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ success: false, message: err.message }, { status });
  }
}

// 4. DELETE: Delete a user from Supabase Auth & public.administrators
export async function DELETE(request: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const caller = await verifyAdmin(request, adminClient);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    // Prevent self-deletion
    const { data: { user: currentUser } } = await adminClient.auth.getUser(
      request.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );
    if (currentUser && currentUser.id === userId) {
      return NextResponse.json({ success: false, message: 'Cannot delete your own administrator account' }, { status: 400 });
    }

    console.log(`[Admin User Deletion] Deleting user ${userId} from Supabase Auth...`);
    
    // Also delete from public.administrators if exists
    await adminClient
      .from('administrators')
      .delete()
      .eq('id', userId);

    // Delete from auth.users
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'User account deleted successfully!' });
  } catch (err: any) {
    console.error('[Admin Delete User API Error]:', err.message);
    const status = err.message.includes('Access denied') || err.message.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ success: false, message: err.message }, { status });
  }
}
