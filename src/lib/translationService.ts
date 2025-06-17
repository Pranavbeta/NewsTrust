// Enhanced translation service without Lingo.dev
interface TranslationResult {
  translatedText: string;
  service: 'lingvanex' | 'deepl' | 'cache' | 'mock';
  cached: boolean;
  confidence: number;
}

export class TranslationService {
  private static instance: TranslationService;
  private cache = new Map<string, string>();
  
  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  private getCacheKey(text: string, fromLang: string, toLang: string): string {
    return `${fromLang}-${toLang}-${text.substring(0, 100)}`;
  }

  async translateText(
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

    const cacheKey = this.getCacheKey(text, fromLanguage, toLanguage);
    
    // Check memory cache
    if (this.cache.has(cacheKey)) {
      return {
        translatedText: this.cache.get(cacheKey)!,
        service: 'cache',
        cached: true,
        confidence: 0.9
      };
    }

    try {
      // Try Lingvanex first
      const lingvanexResult = await this.callLingvanexAPI(text, fromLanguage, toLanguage);
      this.cache.set(cacheKey, lingvanexResult);
      
      return {
        translatedText: lingvanexResult,
        service: 'lingvanex',
        cached: false,
        confidence: 0.95
      };
    } catch (lingvanexError) {
      console.warn('Lingvanex failed, trying DeepL:', lingvanexError.message);
      
      try {
        // Fallback to DeepL
        const deeplResult = await this.callDeepLAPI(text, fromLanguage, toLanguage);
        this.cache.set(cacheKey, deeplResult);
        
        return {
          translatedText: deeplResult,
          service: 'deepl',
          cached: false,
          confidence: 0.92
        };
      } catch (deeplError) {
        console.warn('DeepL also failed:', deeplError.message);
        
        // Fallback to mock translation
        const mockResult = this.createMockTranslation(text, toLanguage);
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
    const apiKey = import.meta.env.VITE_LINGVANEX_KEY;
    
    if (!apiKey) {
      throw new Error('Lingvanex API key not configured');
    }

    const response = await fetch('https://api-b2b.backenster.com/b1/api/v3/translate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromLang,
        to: toLang,
        data: text,
        platform: 'api'
      }),
    });

    if (!response.ok) {
      throw new Error(`Lingvanex API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.result) {
      throw new Error('Invalid response from Lingvanex API');
    }

    return result.result;
  }

  private async callDeepLAPI(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<string> {
    const apiKey = import.meta.env.VITE_DEEPL_KEY;
    
    if (!apiKey) {
      throw new Error('DeepL API key not configured');
    }

    // Map language codes to DeepL format
    const deeplLangMap: Record<string, string> = {
      'en': 'EN',
      'es': 'ES',
      'fr': 'FR',
      'de': 'DE',
      'it': 'IT',
      'pt': 'PT',
      'ru': 'RU',
      'ja': 'JA',
      'zh': 'ZH',
      'nl': 'NL',
      'pl': 'PL'
    };

    const targetLang = deeplLangMap[toLang] || toLang.toUpperCase();

    const params = new URLSearchParams({
      auth_key: apiKey,
      text: text,
      target_lang: targetLang
    });

    if (fromLang !== 'auto') {
      params.append('source_lang', deeplLangMap[fromLang] || fromLang.toUpperCase());
    }

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.translations || result.translations.length === 0) {
      throw new Error('Invalid response from DeepL API');
    }

    return result.translations[0].text;
  }

  private createMockTranslation(text: string, targetLanguage: string): string {
    const translations: Record<string, Record<string, string>> = {
      'es': {
        'Breaking News': 'Noticias de Última Hora',
        'Global Climate Summit': 'Cumbre Climática Global',
        'Technology Breakthrough': 'Avance Tecnológico',
        'Business Update': 'Actualización de Negocios',
        'Sports Championship': 'Campeonato Deportivo',
        'Political Development': 'Desarrollo Político',
        'Hello': 'Hola',
        'World': 'Mundo',
        'News': 'Noticias'
      },
      'fr': {
        'Breaking News': 'Dernières Nouvelles',
        'Global Climate Summit': 'Sommet Climatique Mondial',
        'Technology Breakthrough': 'Percée Technologique',
        'Business Update': 'Mise à Jour Business',
        'Sports Championship': 'Championnat Sportif',
        'Political Development': 'Développement Politique',
        'Hello': 'Bonjour',
        'World': 'Monde',
        'News': 'Actualités'
      },
      'de': {
        'Breaking News': 'Eilmeldungen',
        'Global Climate Summit': 'Globaler Klimagipfel',
        'Technology Breakthrough': 'Technologischer Durchbruch',
        'Business Update': 'Business-Update',
        'Sports Championship': 'Sportmeisterschaft',
        'Political Development': 'Politische Entwicklung',
        'Hello': 'Hallo',
        'World': 'Welt',
        'News': 'Nachrichten'
      }
    };

    const languageTranslations = translations[targetLanguage];
    if (!languageTranslations) {
      return `[${targetLanguage.toUpperCase()}] ${text}`;
    }

    let result = text;
    Object.entries(languageTranslations).forEach(([english, translated]) => {
      result = result.replace(new RegExp(english, 'gi'), translated);
    });

    return result;
  }

  async translateBatch(
    texts: string[],
    fromLanguage: string,
    toLanguage: string
  ): Promise<TranslationResult[]> {
    const results = await Promise.all(
      texts.map(text => this.translateText(text, fromLanguage, toLanguage))
    );
    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const translationService = TranslationService.getInstance();