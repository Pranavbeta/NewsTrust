// Deno.serve(async (req) => {
//   const corsHeaders = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
//   };
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }
//   if (req.method !== 'POST') {
//     return new Response(JSON.stringify({ error: 'Method not allowed' }), {
//       status: 405,
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//     });
//   }
//   try {
//     const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
//     const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
//     const body = await req.json();
//     const { user_id, title, content, source_url, category, location } = body;
//     if (!user_id || !title || !content || !source_url || !category) {
//       return new Response(JSON.stringify({ error: 'Missing required fields' }), {
//         status: 400,
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//       });
//     }
//     const now = new Date().toISOString();
//     const { error } = await supabase.from('submissions').insert({
//       user_id,
//       title,
//       content,
//       source_url,
//       category,
//       location,
//       status: 'pending',
//       created_at: now,
//       updated_at: now
//     });
//     if (error) {
//       return new Response(JSON.stringify({ error: error.message }), {
//         status: 400,
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//       });
//     }
//     return new Response(JSON.stringify({ success: true }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//     });
//   } catch (err) {
//     return new Response(JSON.stringify({ error: 'Internal server error' }), {
//       status: 500,
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//     });
//   }
// }); 