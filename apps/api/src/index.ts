import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './env';
import { authenticateUser } from './middleware/auth';
import { supabaseAdmin } from './lib/supabase';
import brandRoutes from './routes/brandRoutes';
import analysisRoutes from './routes/analysisRoutes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Modular, prefixed routes
app.use('/api/brands', brandRoutes);
app.use('/api/analyses', analysisRoutes);

// Protected: Get current user profile
app.get('/users/me', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', req.user!.auth_id) // Correctly use auth_id
      .single();

    if (error) {
      console.error('[GET /users/me] Supabase Error:', error);
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ data });
  } catch (err) {
    console.error('[GET /users] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error('[GET /users] Error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Protected: Create organization
app.post('/organizations', authenticateUser, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  try {
    // Get the internal UUID for the user from our public.users table
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_id', req.user!.id)
      .single();

    if (!userData) return res.status(404).json({ error: 'User record missing' });

    // This RPC creates the org and sets the creator as owner in organization_members
    const { data, error } = await supabaseAdmin.rpc('create_organization_with_owner', {
      org_name: name,
      user_id: userData.id,
    });

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ data });
  } catch (err) {
    console.error('[GET /users] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(env.PORT, () => {
  console.log(`🚀 API live on port ${env.PORT}`);
});
