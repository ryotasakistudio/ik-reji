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

  const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
  if (!userData?.user) return res.status(404).json({ error: 'user not found' });

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: userData.user.email,
    options: { redirectTo: 'https://ik-reji-three.vercel.app/' }
  });

  if (error) return res.status(500).json({ error: error.message });

  res.redirect(302, data.properties.action_link);
}
