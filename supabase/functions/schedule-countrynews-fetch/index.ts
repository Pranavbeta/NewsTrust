// Deno.serve(async (req) => {
//   const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
//   const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
//   const lastFetchKey = 'country_news_last_fetch';
//   const fetchUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/country-news`;
//   console.log('fetchUrl:', fetchUrl);
//   // Check last fetch time
//   const { data, error } = await supabase.from('fetch_logs').select('*').eq('key', lastFetchKey).single();
//   const now = Date.now();
//   let shouldFetch = true;
//   if (data && data.value) {
//     const lastFetch = Number(data.value);
//     if (now - lastFetch < 30 * 60 * 1000) {
//       shouldFetch = false;
//     }
//   }
//   if (shouldFetch) {
//     await fetch(fetchUrl, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     // Update last fetch time
//     await supabase.from('fetch_logs').upsert({
//       key: lastFetchKey,
//       value: now.toString()
//     }, {
//       onConflict: 'key'
//     });
//     // Cleanup: Delete news older than 1 day
//     const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
//     await supabase.from('country_news').delete().lt('published_at', cutoff.toISOString());
//   }
//   return new Response(JSON.stringify({
//     fetched: shouldFetch
//   }), {
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });
// }); 