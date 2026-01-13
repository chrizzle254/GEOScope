import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './env';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser } from './middleware/auth';

const app = express();
app.use(cors());
app.use(express.json());

// Helper to get a Supabase client that respects the specific user's RLS
const getScopedClient = (req: Request) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  return createClient(env.SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
};

// Admin client - Keep this internal, NEVER use in standard user flows unless forced
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Protected: Get current user profile
app.get('/users/me', authenticateUser, async (req, res) => {
  try {
    const client = getScopedClient(req);
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('auth_id', req.user!.id)
      .single();

    if (error) return res.status(404).json({ error: 'User not found' });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error: ' + err });
  }
});

// Admin Only: Get all users
app.get('/users', authenticateUser, async (req, res) => {
  try {
    // 1. Check if the requester is actually an admin in your 'users' table
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('auth_id', req.user!.id)
      .single();

    if (adminUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin eyes only, lad.' });
    }

    // 2. Use admin client to fetch all (bypassing RLS)
    const { data, error } = await supabaseAdmin.from('users').select('*');

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users: ' + err });
  }
});

// Protected: Create organization
app.post('/organizations', authenticateUser, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  try {
    const client = getScopedClient(req);

    // Get the internal UUID for the user
    const { data: userData } = await client
      .from('users')
      .select('id')
      .eq('auth_id', req.user!.id)
      .single();

    if (!userData) return res.status(404).json({ error: 'User record missing' });

    // Using an RPC call here is the "Bro" way to ensure atomicity (both happen or neither)
    // You'll need to create this function in Supabase SQL editor
    const { data, error } = await client.rpc('create_organization_with_owner', {
      org_name: name,
      user_id: userData.id,
    });

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error: ' + err });
  }
});

app.listen(env.PORT, () => {
  console.log(`🚀 API live on port ${env.PORT}`);
});
