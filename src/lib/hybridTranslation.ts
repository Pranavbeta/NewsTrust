import { supabase } from './supabase';

interface TranslationConfig {
  lingvanexKey?: string;
  deeplKey?: string;
  lingoKey?: string;
  preferredService: 'lingvanex' | 'deepl' | 'lingo' | 'auto';
  cacheEnabled: boolean;
}

interface TranslationResult {
  translatedText: string;
  service: 'lingvanex' | 'deepl' | 'cache' | 'mock' | 'none';
  cached: boolean;
  confidence: number;
}

export class HybridTranslationService {
  private static instance: HybridTranslationService;
  private cache = new Map<string, string>();
  private config: TranslationConfig;
  private isSupabaseConfigured:boolean;

  private constructor() {
    this.config = {
      preferredService : 'auto',
      cacheEnabled : true,
    }
    this.isSupabaseConfigured = this.checkSupabaseConfig();
  }

  static getInstance(): HybridTranslationService {
    if (!HybridTranslationService.instance) {
      HybridTranslationService.instance = new HybridTranslationService();
    }
    return HybridTranslationService.instance;
  }

  private getCacheKey(text: string, fromLang: string, toLang: string, type: string) {
    return `${type}-${fromLang}-${toLang}-${text.substring(0, 100)}`;
  }

  private checkSupabaseConfig(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(url && key && 
             !url.includes('placeholder') && 
             !key.includes('placeholder'));
  }
  /**
   * Translate dynamic news content using Lingvanex → DeepL fallback
   */
   async translate(
    text: string,
    fromLang: string,
    toLang: string,
    type: 'news' | 'ui' | 'chat' = 'news'
  ): Promise<TranslationResult> {
    const cacheKey = this.getCacheKey(text, fromLang, toLang, type);

    if (fromLang === toLang) {
      return {
        translatedText: text,
        service: 'none',
        cached: true,
        confidence: 1.0
      };
    }

    if (this.cache.has(cacheKey)) {
      return {
        translatedText: this.cache.get(cacheKey)!,
        service: 'cache',
        cached: true,
        confidence: 0.9
      };
    }

    try {
      const cached = await this.getCachedTranslation(text, fromLang, toLang, type);
      if (cached) {
        this.cache.set(cacheKey, cached);
        return {
          translatedText: cached,
          service: 'cache',
          cached: true,
          confidence: 0.9
        };
      }
    } catch (e) {
      console.warn('Cache lookup failed:', e);
    }

    try {
      const result = await this.callLingvanexAPI(text, fromLang, toLang);
      this.cache.set(cacheKey, result);
      return {
        translatedText: result,
        service: 'lingvanex',
        cached: false,
        confidence: 0.95
      }; 
    } catch (e) {
      if (e instanceof Error) {
        console.warn('Lingvanex failed, falling back to DeepL:', e.message);
      } else {
        console.warn('Lingvanex failed, falling back to DeepL:', e);
      }
    }

    try {
      const result = await this.callDeepLAPI(text, fromLang, toLang);
      this.cache.set(cacheKey, result);
      return {
        translatedText: result,
        service: 'deepl',
        cached: false,
        confidence: 0.92
      };
    } catch (e) {
      console.warn('DeepL failed too. Falling back to mock.');
      const mock = this.createNewsSpecificMock(text, toLang);
      this.cache.set(cacheKey, mock);
      return {
        translatedText: mock,
        service: 'mock',
        cached: false,
        confidence: 0.6
      };
    }
  }


  /**
   * Translate UI elements using Lingvanex → DeepL fallback
   */
  async translateUIContent(
    text: string,
    fromLanguage: string = 'en',
    toLanguage: string
  ): Promise<TranslationResult> {
    if (fromLanguage === toLanguage) {
      return {
        translatedText: text,
        service: 'cache',
        cached: true,
        confidence: 1.0
      };
    }

    const cacheKey = this.getCacheKey(text, fromLanguage, toLanguage, 'ui');
    
    // Check memory cache first
    if (this.cache.has(cacheKey)) {
      return {
        translatedText: this.cache.get(cacheKey)!,
        service: 'cache',
        cached: true,
        confidence: 0.9
      };
    }

    try {
      // Check database cache (read-only)
      if (this.isSupabaseConfigured) {
        const cachedResult = await this.getCachedTranslation(text, fromLanguage, toLanguage, 'ui');
        if (cachedResult) {
          this.cache.set(cacheKey, cachedResult);
          return {
            translatedText: cachedResult,
            service: 'cache',
            cached: true,
            confidence: 0.9
          };
        }
      }

      // Try Lingvanex first for UI content
      try {
        const result = await this.callLingvanexAPI(text, fromLanguage, toLanguage);
        
        // Cache the result in memory only
        this.cache.set(cacheKey, result);

        return {
          translatedText: result,
          service: 'lingvanex',
          cached: false,
          confidence: 0.95
        };
      } catch (lingvanexError) {
        if (lingvanexError instanceof Error) {
          console.warn('Lingvanex failed for UI content, trying DeepL:', lingvanexError.message);
        } else {
          console.warn('Lingvanex failed for UI content, trying DeepL:', lingvanexError);
        }
        
        // Fallback to DeepL
        try {
          const result = await this.callDeepLAPI(text, fromLanguage, toLanguage);
          
          // Cache the result in memory only
          this.cache.set(cacheKey, result);

          return {
            translatedText: result,
            service: 'deepl',
            cached: false,
            confidence: 0.92
          };
        } catch (deeplError) {
          if (deeplError instanceof Error) {
            console.warn('DeepL also failed for UI content:', deeplError.message);
          } else {
            console.warn('DeepL also failed for UI content:', deeplError);
          }
          throw new Error('Both Lingvanex and DeepL failed for UI content');
        }
      }
    } catch (error) {
      console.error('UI content translation failed:', error);
      
      // Fallback to UI-specific mock
      const mockResult = this.createUISpecificMock(text, toLanguage);
      this.cache.set(cacheKey, mockResult);
      
      return {
        translatedText: mockResult,
        service: 'mock',
        cached: false,
        confidence: 0.6
      };
    }
  }

  /**
   * Translate chat responses using Lingvanex → DeepL fallback
   */
  async translateChatResponse(
    text: string,
    fromLanguage: string = 'en',
    toLanguage: string
  ): Promise<TranslationResult> {
    if (fromLanguage === toLanguage) {
      return {
        translatedText: text,
        service: 'cache',
        cached: true,
        confidence: 1.0
      };
    }

    const cacheKey = this.getCacheKey(text, fromLanguage, toLanguage, 'chat');
    
    // Check memory cache first
    if (this.cache.has(cacheKey)) {
      return {
        translatedText: this.cache.get(cacheKey)!,
        service: 'cache',
        cached: true,
        confidence: 0.9
      };
    }

    try {
      // Try Lingvanex first for chat responses
      const result = await this.callLingvanexAPI(text, fromLanguage, toLanguage);
      
      // Cache the result in memory only
      this.cache.set(cacheKey, result);

      return {
        translatedText: result,
        service: 'lingvanex',
        cached: false,
        confidence: 0.95
      };
    } catch (lingvanexError) {
      if (lingvanexError instanceof Error) {
        console.warn('Lingvanex failed for UI content, trying DeepL:', lingvanexError.message);
      } else {
        console.warn('Lingvanex failed for UI content, trying DeepL:', lingvanexError);
      };
      
      try {
        const result = await this.callDeepLAPI(text, fromLanguage, toLanguage);
        
        // Cache the result in memory only
        this.cache.set(cacheKey, result);

        return {
          translatedText: result,
          service: 'deepl',
          cached: false,
          confidence: 0.92
        };
      } catch (deeplError) {
        console.error('Both Lingvanex and DeepL failed for chat response:', deeplError);
        
        // Fallback to chat-specific mock
        const mockResult = this.createChatSpecificMock(text, toLanguage);
        this.cache.set(cacheKey, mockResult);
        
        return {
          translatedText: mockResult,
          service: 'mock',
          cached: false,
          confidence: 0.7
        };
      }
    }
  }

  private async callLingvanexAPI(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<string> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/lingvanex-translate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        fromLanguage: fromLang,
        toLanguage: toLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lingvanex API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.translatedText) {
      throw new Error('Invalid response from Lingvanex API');
    }

    return result.translatedText;
  }

  private async callDeepLAPI(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<string> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/deepl-translate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        fromLanguage: fromLang,
        toLanguage: toLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.translatedText) {
      throw new Error('Invalid response from DeepL API');
    }

    return result.translatedText;
  }

  private createNewsSpecificMock(text: string, toLanguage: string): string {
    const newsTransforms: Record<string, Record<string, string>> = {
      'es': {
        'Breaking': 'Última Hora',
        'News': 'Noticias',
        'Global': 'Global',
        'Climate': 'Clima',
        'Summit': 'Cumbre',
        'Agreement': 'Acuerdo',
        'Technology': 'Tecnología',
        'Business': 'Negocios',
        'Sports': 'Deportes',
        'Politics': 'Política',
        'Update': 'Actualización',
        'Report': 'Informe'
      },
      'fr': {
        'Breaking': 'Dernière Minute',
        'News': 'Actualités',
        'Global': 'Mondial',
        'Climate': 'Climat',
        'Summit': 'Sommet',
        'Agreement': 'Accord',
        'Technology': 'Technologie',
        'Business': 'Affaires',
        'Sports': 'Sports',
        'Politics': 'Politique',
        'Update': 'Mise à jour',
        'Report': 'Rapport'
      },
      'de': {
        'Breaking': 'Eilmeldung',
        'News': 'Nachrichten',
        'Global': 'Global',
        'Climate': 'Klima',
        'Summit': 'Gipfel',
        'Agreement': 'Abkommen',
        'Technology': 'Technologie',
        'Business': 'Wirtschaft',
        'Sports': 'Sport',
        'Politics': 'Politik',
        'Update': 'Update',
        'Report': 'Bericht'
      },
      'hi': {
        'Breaking': 'ब्रेकिंग',
        'News': 'समाचार',
        'Global': 'वैश्विक',
        'Climate': 'जलवायु',
        'Summit': 'शिखर सम्मेलन',
        'Agreement': 'समझौता',
        'Technology': 'प्रौद्योगिकी',
        'Business': 'व्यापार',
        'Sports': 'खेल',
        'Politics': 'राजनीति',
        'Update': 'अपडेट',
        'Report': 'रिपोर्ट'
      }
    };

    const transforms = newsTransforms[toLanguage];
    if (!transforms) {
      return `[${toLanguage.toUpperCase()}] ${text}`;
    }

    let transformed = text;
    Object.entries(transforms).forEach(([en, translated]) => {
      transformed = transformed.replace(new RegExp(en, 'gi'), translated);
    });

    return transformed;
  }

  private createUISpecificMock(text: string, toLanguage: string): string {
    const uiTransforms: Record<string, Record<string, string>> = {
      'es': {
        'Sign In': 'Iniciar Sesión',
        'Sign Up': 'Registrarse',
        'Home': 'Inicio',
        'Profile': 'Perfil',
        'Settings': 'Configuración',
        'Search': 'Buscar',
        'Submit': 'Enviar',
        'Cancel': 'Cancelar',
        'Save': 'Guardar',
        'Delete': 'Eliminar',
        'Edit': 'Editar',
        'Loading': 'Cargando',
        'Error': 'Error',
        'Success': 'Éxito'
      },
      'fr': {
        'Sign In': 'Se Connecter',
        'Sign Up': 'S\'inscrire',
        'Home': 'Accueil',
        'Profile': 'Profil',
        'Settings': 'Paramètres',
        'Search': 'Rechercher',
        'Submit': 'Soumettre',
        'Cancel': 'Annuler',
        'Save': 'Sauvegarder',
        'Delete': 'Supprimer',
        'Edit': 'Modifier',
        'Loading': 'Chargement',
        'Error': 'Erreur',
        'Success': 'Succès'
      },
      'de': {
        'Sign In': 'Anmelden',
        'Sign Up': 'Registrieren',
        'Home': 'Startseite',
        'Profile': 'Profil',
        'Settings': 'Einstellungen',
        'Search': 'Suchen',
        'Submit': 'Senden',
        'Cancel': 'Abbrechen',
        'Save': 'Speichern',
        'Delete': 'Löschen',
        'Edit': 'Bearbeiten',
        'Loading': 'Laden',
        'Error': 'Fehler',
        'Success': 'Erfolg'
      },
      'hi': {
        'Sign In': 'साइन इन',
        'Sign Up': 'साइन अप',
        'Home': 'होम',
        'Profile': 'प्रोफाइल',
        'Settings': 'सेटिंग्स',
        'Search': 'खोजें',
        'Submit': 'जमा करें',
        'Cancel': 'रद्द करें',
        'Save': 'सेव करें',
        'Delete': 'डिलीट करें',
        'Edit': 'एडिट करें',
        'Loading': 'लोड हो रहा है',
        'Error': 'त्रुटि',
        'Success': 'सफलता'
      }
    };

    const transforms = uiTransforms[toLanguage];
    if (!transforms) {
      return `[${toLanguage.toUpperCase()}] ${text}`;
    }

    let transformed = text;
    Object.entries(transforms).forEach(([en, translated]) => {
      transformed = transformed.replace(new RegExp(`\\b${en}\\b`, 'gi'), translated);
    });

    return transformed;
  }

  private createChatSpecificMock(text: string, toLanguage: string): string {
    // For chat responses, maintain the structure but translate key phrases
    const chatPhrases: Record<string, Record<string, string>> = {
      'es': {
        'I apologize': 'Me disculpo',
        'Please try again': 'Por favor, inténtalo de nuevo',
        'The content appears': 'El contenido parece',
        'Based on my analysis': 'Basado en mi análisis',
        'I recommend': 'Recomiendo',
        'This appears to be': 'Esto parece ser',
        'credible': 'creíble',
        'reliable': 'confiable',
        'suspicious': 'sospechoso',
        'verification': 'verificación'
      },
      'fr': {
        'I apologize': 'Je m\'excuse',
        'Please try again': 'Veuillez réessayer',
        'The content appears': 'Le contenu semble',
        'Based on my analysis': 'Basé sur mon analyse',
        'I recommend': 'Je recommande',
        'This appears to be': 'Cela semble être',
        'credible': 'crédible',
        'reliable': 'fiable',
        'suspicious': 'suspect',
        'verification': 'vérification'
      },
      'de': {
        'I apologize': 'Ich entschuldige mich',
        'Please try again': 'Bitte versuchen Sie es erneut',
        'The content appears': 'Der Inhalt scheint',
        'Based on my analysis': 'Basierend auf meiner Analyse',
        'I recommend': 'Ich empfehle',
        'This appears to be': 'Dies scheint zu sein',
        'credible': 'glaubwürdig',
        'reliable': 'zuverlässig',
        'suspicious': 'verdächtig',
        'verification': 'Überprüfung'
      },
      'hi': {
        'I apologize': 'मैं माफी चाहता हूं',
        'Please try again': 'कृपया पुनः प्रयास करें',
        'The content appears': 'सामग्री प्रतीत होती है',
        'Based on my analysis': 'मेरे विश्लेषण के आधार पर',
        'I recommend': 'मैं सुझाता हूं',
        'This appears to be': 'यह प्रतीत होता है',
        'credible': 'विश्वसनीय',
        'reliable': 'भरोसेमंद',
        'suspicious': 'संदिग्ध',
        'verification': 'सत्यापन'
      }
    };

    const phrases = chatPhrases[toLanguage];
    if (!phrases) {
      return `[${toLanguage.toUpperCase()}] ${text}`;
    }

    let transformed = text;
    Object.entries(phrases).forEach(([en, translated]) => {
      transformed = transformed.replace(new RegExp(en, 'gi'), translated);
    });

    return transformed;
  }

  private async getCachedTranslation(
    text: string,
    fromLanguage: string,
    toLanguage: string,
    type: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('translation_cache')
        .select('translated_text')
        .eq('source_text', text.substring(0, 1000))
        .eq('source_language', fromLanguage)
        .eq('target_language', toLanguage)
        .eq('translation_type', type)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) {
        console.warn('Error reading translation cache:', error);
        return null;
      }

      return data?.translated_text || null;
    } catch (error) {
      console.warn('Failed to read translation cache:', error);
      return null;
    }
  }

  // Batch translation for better performance
  async translateBatch(
    texts: Array<{ text: string; type: 'news' | 'ui' | 'chat' }>,
    fromLanguage: string,
    toLanguage: string
  ): Promise<TranslationResult[]> {
    const results = await Promise.all(
      texts.map(async ({ text, type }) => {
        switch (type) {
          case 'news':
            return await this.translate(text, fromLanguage, toLanguage);
          case 'ui':
            return await this.translateUIContent(text, fromLanguage, toLanguage);
          case 'chat':
            return await this.translateChatResponse(text, fromLanguage, toLanguage);
          default:
            return await this.translate(text, fromLanguage, toLanguage);
        }
      })
    );
    return results;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get performance stats
  getStats(): {
    cacheSize: number;
    isConfigured: boolean;
    services: string[];
    config:TranslationConfig
  } {
    return {
      cacheSize: this.cache.size,
      isConfigured: this.isSupabaseConfigured,
      config: this.config,
      services: ['lingvanex', 'deepl', 'cache', 'mock']
    };
  }
}

export const hybridTranslationService = HybridTranslationService.getInstance();