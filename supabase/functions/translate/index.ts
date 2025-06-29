// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
// };

// Deno.serve(async (req) => {
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }

//   try {
//     const { text, fromLanguage = 'en', toLanguage, preferredService = 'auto' } = await req.json();
    
//     if (!text || !toLanguage) {
//       return json({
//         error: 'Text and target language are required'
//       }, 400);
//     }

//     if (fromLanguage === toLanguage) {
//       return json({
//         translatedText: text,
//         fromLanguage,
//         toLanguage,
//         service: 'none',
//         cached: true
//       });
//     }

//     console.log(`🌐 Translating from ${fromLanguage} to ${toLanguage}...`);
    
//     const supabaseClient = createClient(
//       Deno.env.get('SUPABASE_URL') ?? '', 
//       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
//     );

//     const cacheKey = text.substring(0, 1000);

//     // Check translation cache first
//     const { data: cachedTranslation, error: cacheError } = await supabaseClient
//       .from('translation_cache')
//       .select('translated_text, translation_type')
//       .eq('source_text', cacheKey)
//       .eq('source_language', fromLanguage)
//       .eq('target_language', toLanguage)
//       .maybeSingle();

//     if (cachedTranslation?.translated_text) {
//       console.log(`✅ Using cached ${cachedTranslation.translation_type} translation`);
//       return json({
//         translatedText: cachedTranslation.translated_text,
//         fromLanguage,
//         toLanguage,
//         service: `${cachedTranslation.translation_type}-cache`,
//         cached: true
//       });
//     }

//     // Try Lingvanex first (unless DeepL is preferred)
//     if (preferredService !== 'deepl') {
//       try {
//         const lingvanexResult = await tryLingvanex(text, fromLanguage, toLanguage, supabaseClient, cacheKey);
//         if (lingvanexResult.success) {
//           return json(lingvanexResult.data);
//         }
//       } catch (error) {
//         console.warn('⚠️ Lingvanex failed, trying DeepL:', error.message);
//       }
//     }

//     // Try DeepL as fallback or preferred service
//     try {
//       const deeplResult = await tryDeepL(text, fromLanguage, toLanguage, supabaseClient, cacheKey);
//       if (deeplResult.success) {
//         return json(deeplResult.data);
//       }
//     } catch (error) {
//       console.warn('⚠️ DeepL failed:', error.message);
//     }

//     // If both services fail, return mock translation
//     console.warn('⚠️ All translation services failed, using mock');
//     const mockTranslation = createMockTranslation(text, toLanguage);
//     return json({
//       translatedText: mockTranslation,
//       fromLanguage,
//       toLanguage,
//       service: 'mock-fallback',
//       cached: false,
//       error: 'All translation services unavailable'
//     });

//   } catch (error) {
//     console.error('🚨 Translation function error:', error);
//     return json({
//       error: 'Translation service failed',
//       details: error.message
//     }, 500);
//   }
// });

// async function tryLingvanex(text: string, fromLang: string, toLang: string, supabaseClient: any, cacheKey: string) {
//   const apiKey = Deno.env.get('LINGVANEX_API_KEY');
//   if (!apiKey) {
//     throw new Error('Lingvanex API key not configured');
//   }

//   console.log('🔄 Trying Lingvanex...');
//   const translatedText = await callLingvanexAPI(text, fromLang, toLang, apiKey);
  
//   // Cache the result
//   try {
//     await supabaseClient.from('translation_cache').upsert({
//       source_text: cacheKey,
//       source_language: fromLang,
//       target_language: toLang,
//       translated_text: translatedText.substring(0, 2000),
//       translation_type: 'lingvanex'
//     }, {
//       onConflict: 'source_text,source_language,target_language,translation_type'
//     });
//   } catch (cacheErr) {
//     console.warn('⚠️ Failed to cache Lingvanex translation:', cacheErr.message);
//   }

//   return {
//     success: true,
//     data: {
//       translatedText,
//       fromLanguage: fromLang,
//       toLanguage: toLang,
//       service: 'lingvanex',
//       cached: false
//     }
//   };
// }

// async function tryDeepL(text: string, fromLang: string, toLang: string, supabaseClient: any, cacheKey: string) {
//   const apiKey = Deno.env.get('DEEPL_API_KEY');
//   if (!apiKey) {
//     throw new Error('DeepL API key not configured');
//   }

//   console.log('🔄 Trying DeepL...');
//   const translatedText = await callDeepLAPI(text, fromLang, toLang, apiKey);
  
//   // Cache the result
//   try {
//     await supabaseClient.from('translation_cache').insert({
//       source_text: cacheKey,
//       source_language: fromLang,
//       target_language: toLang,
//       translated_text: translatedText.substring(0, 2000),
//       translation_type: 'deepl'
//     });
//   } catch (cacheErr) {
//     console.warn('⚠️ Failed to cache DeepL translation:', cacheErr.message);
//   }

//   return {
//     success: true,
//     data: {
//       translatedText,
//       fromLanguage: fromLang,
//       toLanguage: toLang,
//       service: 'deepl',
//       cached: false
//     }
//   };
// }

// async function callLingvanexAPI(text: string, fromLang: string, toLang: string, apiKey: string): Promise<string> {
//   const response = await fetch('https://api-b2b.backenster.com/b1/api/v3/translate', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${apiKey}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       from: fromLang,
//       to: toLang,
//       data: text,
//       platform: 'api'
//     })
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`Lingvanex API error: ${response.status} - ${errorText}`);
//   }

//   const data = await response.json();
//   if (!data.result) {
//     throw new Error('Invalid Lingvanex API response');
//   }

//   return data.result;
// }

// async function callDeepLAPI(text: string, fromLang: string, toLang: string, apiKey: string): Promise<string> {
//   const isFree = apiKey.endsWith(':fx');
//   const baseUrl = isFree ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';
  
//   const langMap: Record<string, string> = {
//     en: 'EN', es: 'ES', fr: 'FR', de: 'DE', it: 'IT', pt: 'PT', 
//     ru: 'RU', ja: 'JA', zh: 'ZH', nl: 'NL', pl: 'PL'
//   };

//   const source_lang = langMap[fromLang] || fromLang.toUpperCase();
//   const target_lang = langMap[toLang] || toLang.toUpperCase();

//   const response = await fetch(baseUrl, {
//     method: 'POST',
//     headers: {
//       'Authorization': `DeepL-Auth-Key ${apiKey}`,
//       'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     body: new URLSearchParams({
//       text,
//       source_lang,
//       target_lang
//     })
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
//   }

//   const data = await response.json();
//   if (!data.translations?.[0]?.text) {
//     throw new Error('Invalid response from DeepL');
//   }

//   return data.translations[0].text;
// }

// function createMockTranslation(text: string, toLanguage: string): string {
//   const mockPhrases: Record<string, Record<string, string>> = {
//     es: {
//       'Hello': 'Hola',
//       'World': 'Mundo',
//       'News': 'Noticias',
//       'Update': 'Actualización',
//       'Report': 'Informe'
//     },
//     fr: {
//       'Hello': 'Bonjour',
//       'World': 'Monde',
//       'News': 'Actualités',
//       'Update': 'Mise à jour',
//       'Report': 'Rapport'
//     },
//     de: {
//       'Hello': 'Hallo',
//       'World': 'Welt',
//       'News': 'Nachrichten',
//       'Update': 'Aktualisierung',
//       'Report': 'Bericht'
//     },
//     hi: {
//       'Hello': 'नमस्ते',
//       'World': 'दुनिया',
//       'News': 'समाचार',
//       'Update': 'अपडेट',
//       'Report': 'रिपोर्ट'
//     }
//   };

//   const map = mockPhrases[toLanguage];
//   if (!map) {
//     return `[${toLanguage.toUpperCase()}] ${text}`;
//   }

//   let translated = text;
//   for (const [en, translatedWord] of Object.entries(map)) {
//     translated = translated.replace(new RegExp(`\\b${en}\\b`, 'gi'), translatedWord);
//   }

//   return translated;
// }

// function json(obj: any, status = 200) {
//   return new Response(JSON.stringify(obj), {
//     status,
//     headers: {
//       ...corsHeaders,
//       'Content-Type': 'application/json'
//     }
//   });
// } 