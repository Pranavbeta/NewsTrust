// // @ts-ignore: Deno Deploy/Edge Function import
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// // Simple hash function (FNV-1a, fast and good enough for deduplication)
// function hashString(str: string): string {
//   let hash = 2166136261;
//   for (let i = 0; i < str.length; i++) {
//     hash ^= str.charCodeAt(i);
//     hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
//   }
//   // Convert to unsigned and hex
//   return (hash >>> 0).toString(16);
// }

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
// };

// // @ts-ignore: Deno global
// Deno.serve(async (req) => {
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }
//   try {
//     const { text, url, language = 'en' } = await req.json();
//     if (!text && !url) {
//       return new Response(JSON.stringify({ error: 'Either text or url must be provided' }), {
//         status: 400,
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//       });
//     }
//     const supabaseClient = createClient(
//       // @ts-ignore: Deno.env for edge function
//       Deno.env.get('SUPABASE_URL') ?? '',
//       // @ts-ignore: Deno.env for edge function
//       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
//     );
//     let contentToAnalyze = text;

//     // If URL is provided, fetch the content
//     if (url && !text) {
//       try {
//         const response = await fetch(url);
//         const html = await response.text();
//         contentToAnalyze = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
//       } catch (error) {
//         // Log the actual error and return it in the response for debugging
//         const errorMsg = error instanceof Error ? error.message : String(error);
//         console.error('Failed to fetch content from URL:', errorMsg);
//         return new Response(JSON.stringify({ error: `Failed to fetch content from URL: ${errorMsg}` }), {
//           status: 400,
//           headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//         });
//       }
//     }

//     // --- Compute content hash ---
//     const contentHash = hashString(contentToAnalyze || '');

//     // --- Caching Logic: Check for existing verification by content_hash ---
//     let { data: existing, error: fetchError } = await supabaseClient
//       .from('ai_verifications')
//       .select('*')
//       .eq('content_hash', contentHash)
//       .eq('language', language)
//       .order('created_at', { ascending: false })
//       .limit(1)
//       .maybeSingle();

//     if (existing) {
//       // Always log the request
//       await supabaseClient.from('verification_logs').insert({
//         content: contentToAnalyze?.substring(0, 1000),
//         url: url,
//         language: language,
//         credibility_score: existing.confidence,
//         analysis: existing.explanation,
//         recommendation: existing.verdict,
//         sources_checked: existing.sources_checked,
//         flags: existing.flags,
//         content_hash: contentHash
//       });
//       // Return cached result
//       return new Response(JSON.stringify({
//         credibilityScore: existing.confidence,
//         analysis: existing.explanation,
//         recommendation: existing.verdict,
//         sources: existing.sources_checked || [],
//         flags: existing.flags || []
//       }), {
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//       });
//     }

//     // --- If not found, run analysis and insert into ai_verifications ---
//     const analysis = await analyzeNewsContent(contentToAnalyze, language);

//     // Insert new canonical result into ai_verifications
//     let aiInsertResult = await supabaseClient.from('ai_verifications').insert({
//       title: '', // You can extract from content/url if available
//       content: contentToAnalyze?.substring(0, 1000),
//       source_url: url,
//       verdict: analysis.credibilityScore >= 70 ? 'valid' : analysis.credibilityScore >= 40 ? 'unclear' : 'fake',
//       confidence: analysis.credibilityScore,
//       explanation: analysis.analysis,
//       sources_checked: analysis.sources,
//       flags: analysis.flags,
//       reasoning: '', // optional
//       ai_model: 'mock', // or actual model name
//       content_hash: contentHash,
//       language: language
//     });

//     // Always log the request
//     await supabaseClient.from('verification_logs').insert({
//       content: contentToAnalyze?.substring(0, 1000),
//       url: url,
//       language: language,
//       credibility_score: analysis.credibilityScore,
//       analysis: analysis.analysis,
//       recommendation: aiInsertResult.data?.[0]?.verdict || analysis.recommendation,
//       sources_checked: analysis.sources,
//       flags: analysis.flags,
//       content_hash: contentHash
//     });

//     return new Response(JSON.stringify({
//       credibilityScore: analysis.credibilityScore,
//       analysis: analysis.analysis,
//       recommendation: aiInsertResult.data?.[0]?.verdict || analysis.recommendation,
//       sources: analysis.sources,
//       flags: analysis.flags
//     }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//     });
//   } catch (error) {
//     console.error('Error in verify-news function:', error);
//     return new Response(JSON.stringify({ error: 'Internal server error' }), {
//       status: 500,
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//     });
//   }
// });

// // --- Your existing analyzeNewsContent function here ---
// async function analyzeNewsContent(content: string, language: string) {
//   // Simulate AI analysis - replace with actual API calls
//   const suspiciousKeywords = [
//     'shocking', 'unbelievable', 'secret', 'they don\'t want you to know',
//     'miracle cure', 'instant', 'guaranteed', 'exclusive'
//   ];
//   const reliabilityIndicators = [
//     'according to', 'study shows', 'research indicates', 'experts say',
//     'data reveals', 'statistics show'
//   ];
//   let credibilityScore = 70; // Base score
//   const flags: string[] = [];
//   const sources = ['Reuters', 'Associated Press', 'BBC News'];
//   const suspiciousCount = suspiciousKeywords.filter((keyword) => content.toLowerCase().includes(keyword)).length;
//   if (suspiciousCount > 2) {
//     credibilityScore -= 30;
//     flags.push('Contains sensationalist language');
//   }
//   const reliabilityCount = reliabilityIndicators.filter((indicator) => content.toLowerCase().includes(indicator)).length;
//   if (reliabilityCount > 0) {
//     credibilityScore += 10;
//   } else {
//     credibilityScore -= 15;
//     flags.push('Lacks authoritative sources');
//   }
//   if (content.length < 100) {
//     credibilityScore -= 20;
//     flags.push('Content too short for proper verification');
//   }
//   credibilityScore = Math.max(0, Math.min(100, credibilityScore));
//   let analysis;
//   let recommendation;
//   if (credibilityScore >= 70) {
//     analysis = `The content appears to be credible based on language analysis and source verification. The text uses professional journalism standards and includes verifiable claims.`;
//     recommendation = 'This content appears reliable, but always cross-reference with multiple sources for important decisions.';
//   } else if (credibilityScore >= 40) {
//     analysis = `The content shows mixed signals regarding authenticity. Some elements appear factual while others require additional verification.`;
//     recommendation = 'Exercise caution with this content. Seek additional verification from established news sources.';
//   } else {
//     analysis = `The content contains several red flags that suggest it may be misleading or fabricated. Language patterns and claims do not align with standard journalistic practices.`;
//     recommendation = 'High caution advised. This content appears unreliable and should not be shared without proper fact-checking.';
//   }
//   if (flags.length > 0) {
//     analysis += `\n\nFlags detected: ${flags.join(', ')}`;
//   }
//   return {
//     credibilityScore,
//     analysis,
//     recommendation,
//     sources,
//     flags
//   };
// }
