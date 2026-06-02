import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'token required' });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('assistant_token', token)
    .maybeSingle();

  if (!profile) return res.status(401).json({ error: 'invalid token' });

  const { data, error } = await supabase.auth.admin.createSession({
    user_id: profile.id
  });

  if (error || !data?.session) return res.status(500).json({ error: 'session creation failed' });

  res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token
  });
}
