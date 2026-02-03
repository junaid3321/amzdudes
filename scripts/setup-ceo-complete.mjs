#!/usr/bin/env node
/**
 * Complete CEO Account Setup Script
 * Creates both the employee record AND the auth user with password
 * 
 * Usage (from repo root):
 *   node scripts/setup-ceo-complete.mjs
 *   (Loads backend/.env automatically if SUPABASE_* are not set.)
 * 
 * This script:
 * 1. Creates/updates employee record in database
 * 2. Creates auth user with password
 * 3. Links them together
 * 
 * CEO login credentials:
 *   Email: junaid@amzdudes.com
 *   Password: admin123 (change after first login)
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

// Load backend/.env if vars not set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const envPath = join(repoRoot, 'backend', '.env');
  if (existsSync(envPath)) {
    const buf = readFileSync(envPath, 'utf8');
    for (const line of buf.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CEO_EMAIL = 'junaid@amzdudes.com';
const CEO_PASSWORD = 'admin123';
const CEO_NAME = 'Junaid';
const CEO_ROLE = 'CEO';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in backend/.env or as env vars.');
  process.exit(1);
}

const authUrl = `${SUPABASE_URL}/auth/v1`;
const restUrl = `${SUPABASE_URL}/rest/v1`;
const headersAuth = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function createOrUpdateEmployee() {
  console.log('📝 Creating/updating employee record...');
  const res = await fetch(`${restUrl}/employees`, {
    method: 'POST',
    headers: { ...headersAuth, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      name: CEO_NAME,
      email: CEO_EMAIL,
      role: CEO_ROLE,
    }),
  });
  
  if (!res.ok) {
    // Try PATCH if POST fails (record might exist)
    const patchRes = await fetch(
      `${restUrl}/employees?email=eq.${encodeURIComponent(CEO_EMAIL)}`,
      {
        method: 'PATCH',
        headers: { ...headersAuth, Prefer: 'return=representation' },
        body: JSON.stringify({
          name: CEO_NAME,
          role: CEO_ROLE,
        }),
      }
    );
    if (!patchRes.ok) {
      const text = await patchRes.text();
      throw new Error(`Failed to create/update employee: ${text || patchRes.statusText}`);
    }
    return await patchRes.json();
  }
  return await res.json();
}

async function createAuthUser() {
  console.log('👤 Creating auth user...');
  const res = await fetch(`${authUrl}/admin/users`, {
    method: 'POST',
    headers: headersAuth,
    body: JSON.stringify({
      email: CEO_EMAIL,
      password: CEO_PASSWORD,
      email_confirm: true,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    if (json.msg && (json.msg.includes('already') || json.message?.includes('registered'))) {
      return { existing: true };
    }
    throw new Error(json.msg || json.message || res.statusText);
  }
  const id = json.id ?? json.user?.id;
  return id ? { id } : { existing: true };
}

async function findAuthUserByEmail() {
  const res = await fetch(`${authUrl}/admin/users?per_page=1000`, {
    headers: headersAuth,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || json.message || res.statusText);
  const user = (json.users || []).find((x) => x.email === CEO_EMAIL);
  return user ? user.id : null;
}

async function linkEmployeeToAuth(employeeId, authUserId) {
  console.log('🔗 Linking employee record to auth user...');
  const res = await fetch(
    `${restUrl}/employees?id=eq.${employeeId}`,
    {
      method: 'PATCH',
      headers: { ...headersAuth, Prefer: 'return=representation' },
      body: JSON.stringify({ auth_user_id: authUserId }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to link employee: ${text || res.statusText}`);
  }
  return await res.json();
}

async function main() {
  console.log('🚀 Complete CEO Account Setup\n');
  console.log('Email:', CEO_EMAIL);
  console.log('Password:', CEO_PASSWORD);
  console.log('─'.repeat(50));

  try {
    // Step 1: Create/update employee record
    const employeeResult = await createOrUpdateEmployee();
    const employee = Array.isArray(employeeResult) ? employeeResult[0] : employeeResult;
    const employeeId = employee.id;
    console.log('✅ Employee record:', {
      id: employeeId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    });

    // Step 2: Create auth user
    let authUserId;
    const authResult = await createAuthUser();
    if (authResult.existing) {
      console.log('ℹ️  Auth user already exists. Looking up...');
      authUserId = await findAuthUserByEmail();
      if (!authUserId) throw new Error('Could not find existing auth user');
      console.log('✅ Found existing auth user:', authUserId);
    } else {
      authUserId = authResult.id;
      console.log('✅ Created auth user:', authUserId);
    }

    // Step 3: Link employee to auth user
    const linkedResult = await linkEmployeeToAuth(employeeId, authUserId);
    const linkedEmployee = Array.isArray(linkedResult) ? linkedResult[0] : linkedResult;
    console.log('✅ Employee linked to auth user:', {
      employee_id: linkedEmployee.id,
      auth_user_id: linkedEmployee.auth_user_id,
    });

    console.log('\n✅ Setup Complete!\n');
    console.log('CEO account is ready to use:');
    console.log('  Email:    ', CEO_EMAIL);
    console.log('  Password: admin123');
    console.log('\n⚠️  Important: Change password after first login in Settings → Security');

  } catch (e) {
    console.error('\n❌ Error:', e.message);
    if (e.cause) console.error('  Cause:', e.cause.message || e.cause);
    if (e.code) console.error('  Code:', e.code);
    console.error('\nCheck: 1) Internet connection 2) SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env');
    process.exit(1);
  }
}

main();
