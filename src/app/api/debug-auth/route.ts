import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test 1: Sign in
  const authResult = await supabase.auth.signInWithPassword({
    email: 'kyleighpayne@yahoo.com',
    password: 'OTrocks2026!',
  });

  // Test 2: Simple query
  const categoriesResult = await supabase.from('categories').select('*');

  return NextResponse.json({
    env: {
      url: supabaseUrl,
      keyPrefix: supabaseKey?.substring(0, 20) + '...',
    },
    auth: {
      data: authResult.data?.user ? { id: authResult.data.user.id, email: authResult.data.user.email } : null,
      session: authResult.data?.session ? 'present' : null,
      error: authResult.error ? { message: authResult.error.message, status: authResult.error.status } : null,
    },
    categories: {
      data: categoriesResult.data,
      error: categoriesResult.error,
    },
  });
}
