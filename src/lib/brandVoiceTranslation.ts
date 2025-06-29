import { supabase } from './supabase';
import { hybridTranslationService } from './hybridTranslation';

interface BrandVoiceConfig {
  usePrebuiltTranslations: boolean;
  fallbackToAPI: boolean;
  cacheAPIResults: boolean;
}

interface UITranslation {
  key: string;
  en: string;
  translations: Record<string, string>;
  context?: string;
  lastUpdated: string;
}

// Pre-built translations for core UI elements (CI/CD approach)
const CORE_UI_TRANSLATIONS: Record<string, UITranslation> = {
  'nav.home': {
    key: 'nav.home',
    en: 'Home',
    translations: {
      'es': 'Inicio',
      'fr': 'Accueil',
      'de': 'Startseite',
      'it': 'Home',
      'pt': 'Início',
      'ru': 'Главная',
      'zh': '首页',
      'ja': 'ホーム',
      'ar': 'الرئيسية',
      'hi': 'होम'
    },
    context: 'navigation',
    lastUpdated: '2024-01-15T00:00:00Z'
  },
  'nav.realtime': {
    key: 'nav.realtime',
    en: 'Real-Time',
    translations: {
      'es': 'Tiempo Real',
      'fr': 'Temps Réel',
      'de': 'Echtzeit',
      'it': 'Tempo Reale',
      'pt': 'Tempo Real',
      'ru': 'В реальном времени',
      'zh': '实时',
      'ja': 'リアルタイム',
      'ar': 'الوقت الفعلي',
      'hi': 'रियल-टाइम'
    },
    context: 'navigation',
    lastUpdated: '2024-01-15T00:00:00Z'
  },
  'nav.validator': {
    key: 'nav.validator',
    en: 'Validator',
    translations: {
      'es': 'Validador',
      'fr': 'Validateur',
      'de': 'Validator',
      'it': 'Validatore',
      'pt': 'Validador',
      'ru': 'Валидатор',
      'zh': '验证器',
      'ja': 'バリデーター',
      'ar': 'المدقق',
      'hi': 'सत्यापनकर्ता'
    },
    context: 'navigation',
    lastUpdated: '2024-01-15T00:00:00Z'
  },
  'auth.signin': {
    key: 'auth.signin',
    en: 'Sign In',
    translations: {
      'es': 'Iniciar Sesión',
      'fr': 'Se Connecter',
      'de': 'Anmelden',
      'it': 'Accedi',
      'pt': 'Entrar',
      'ru': 'Войти',
      'zh': '登录',
      'ja': 'サインイン',
      'ar': 'تسجيل الدخول',
      'hi': 'साइन इन'
    },
    context: 'authentication',
    lastUpdated: '2024-01-15T00:00:00Z'
  },
  'auth.signup': {
    key: 'auth.signup',
    en: 'Sign Up',
    translations: {
      'es': 'Registrarse',
      'fr': 'S\'inscrire',
      'de': 'Registrieren',
      'it': 'Registrati',
      'pt': 'Cadastrar',
      'ru': 'Регистрация',
      'zh': '注册',
      'ja': 'サインアップ',
      'ar': 'إنشاء حساب',
      'hi': 'साइन अप'
    },
    context: 'authentication',
    lastUpdated: '2024-01-15T00:00:00Z'
  },
  'actions.submit': {
    key: 'actions.submit',
    en: 'Submit',
    translations: {
      'es': 'Enviar',
      'fr': 'Soumettre',
      'de': 'Senden',
      'it': 'Invia',
      'pt': 'Enviar',
      'ru': 'Отправить',
      'zh': '提交',
      'ja': '送信',
      'ar': 'إرسال',
      'hi': 'जमा करें'
    },
    context: 'actions',
    lastUpdated: '2024-01-15T00:00:00Z'
  },
  'actions.cancel': {
    key: 'actions.cancel',
    en: 'Cancel',
    translations: {
      'es': 'Cancelar',
      'fr': 'Annuler',
      'de': 'Abbrechen',
      'it': 'Annulla',
      'pt': 'Cancelar',
      'ru': 'Отмена',
      'zh': '取消',
      'ja': 'キャンセル',
      'ar': 'إلغاء',
      'hi': 'रद्द करें'
    },
    context: 'actions',
    lastUpdated: '2024-01-15T00:00:00Z'
  },
  'status.loading': {
    key: 'status.loading',
    en: 'Loading',
    translations: {
      'es': 'Cargando',
      'fr': 'Chargement',
      'de': 'Laden',
      'it': 'Caricamento',
      'pt': 'Carregando',
      'ru': 'Загрузка',
      'zh': '加载中',
      'ja': '読み込み中',
      'ar': 'جاري التحميل',
      'hi': 'लोड हो रहा है'
    },
    context: 'status',
    lastUpdated: '2024-01-15T00:00:00Z'
  },
  'verification.credible': {
    key: 'verification.credible',
    en: 'Credible',
    translations: {
      'es': 'Creíble',
      'fr': 'Crédible',
      'de': 'Glaubwürdig',
      'it': 'Credibile',
      'pt': 'Credível',
      'ru': 'Достоверный',
      'zh': '可信',
      'ja': '信頼できる',
      'ar': 'موثوق',
      'hi': 'विश्वसनीय'
    },
    context: 'verification',
    lastUpdated: '2024-01-15T00:00:00Z'
  },
  'verification.suspicious': {
    key: 'verification.suspicious',
    en: 'Suspicious',
    translations: {
      'es': 'Sospechoso',
      'fr': 'Suspect',
      'de': 'Verdächtig',
      'it': 'Sospetto',
      'pt': 'Suspeito',
      'ru': 'Подозрительный',
      'zh': '可疑',
      'ja': '疑わしい',
      'ar': 'مشبوه',
      'hi': 'संदिग्ध'
    },
    context: 'verification',
    lastUpdated: '2024-01-15T00:00:00Z'
  }
};

export class BrandVoiceTranslationService {
  private static instance: BrandVoiceTranslationService;
  private cache = new Map<string, string>();
  private config: BrandVoiceConfig;
  private isSupabaseConfigured: boolean;

  constructor() {
    this.config = {
      usePrebuiltTranslations: true,
      fallbackToAPI: true,
      cacheAPIResults: true,
    };
    this.isSupabaseConfigured = this.checkSupabaseConfig();
  }

  static getInstance(): BrandVoiceTranslationService {
    if (!BrandVoiceTranslationService.instance) {
      BrandVoiceTranslationService.instance = new BrandVoiceTranslationService();
    }
    return BrandVoiceTranslationService.instance;
  }

  private checkSupabaseConfig(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(url && key && 
             !url.includes('placeholder') && 
             !key.includes('placeholder'));
  }

  /**
   * Translate UI text using hybrid approach:
   * 1. Check pre-built translations (CI/CD)
   * 2. Check runtime cache
   * 3. Call Lingvanex/DeepL through hybrid service
   * 4. Fallback to enhanced mock
   */
  async translateUI(
    key: string,
    fallbackText: string,
    targetLanguage: string,
    context?: string
  ): Promise<string> {
    if (targetLanguage === 'en') {
      return fallbackText;
    }

    // Step 1: Check pre-built translations (CI/CD approach)
    if (this.config.usePrebuiltTranslations) {
      const prebuiltTranslation = this.getPrebuiltTranslation(key, targetLanguage);
      if (prebuiltTranslation) {
        console.log(`Using pre-built translation for ${key}`);
        return prebuiltTranslation;
      }
    }

    // Step 2: Check runtime cache
    const cacheKey = `${key}-${targetLanguage}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Step 3: Check database cache (read-only)
    if (this.isSupabaseConfigured) {
      const cachedTranslation = await this.getCachedUITranslation(key, targetLanguage);
      if (cachedTranslation) {
        this.cache.set(cacheKey, cachedTranslation);
        return cachedTranslation;
      }
    }

    // Step 4: Call Lingvanex/DeepL through hybrid service
    if (this.config.fallbackToAPI) {
      try {
        const result = await hybridTranslationService.translateUIContent(fallbackText, 'en', targetLanguage);
        
        // Cache the result in memory only (database writes are handled by Edge Functions)
        this.cache.set(cacheKey, result.translatedText);
        
        console.log(`Using ${result.service} translation for ${key}`);
        return result.translatedText;
      } catch (error) {
        console.warn(`Translation API failed for ${key}:`, error.message);
      }
    }

    // Step 5: Fallback to enhanced mock
    const mockTranslation = this.createBrandVoiceMock(fallbackText, targetLanguage, context);
    this.cache.set(cacheKey, mockTranslation);
    
    console.log(`Using mock translation for ${key}`);
    return mockTranslation;
  }

  private getPrebuiltTranslation(key: string, targetLanguage: string): string | null {
    const translation = CORE_UI_TRANSLATIONS[key];
    if (translation && translation.translations[targetLanguage]) {
      return translation.translations[targetLanguage];
    }
    return null;
  }

  private async getCachedUITranslation(key: string, targetLanguage: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('ui_translations')
        .select('translated_text')
        .eq('translation_key', key)
        .eq('target_language', targetLanguage)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) {
        console.warn('Error reading UI translation cache:', error);
        return null;
      }

      return data?.translated_text || null;
    } catch (error) {
      console.warn('Failed to read UI translation cache:', error);
      return null;
    }
  }

  private createBrandVoiceMock(text: string, targetLanguage: string, context?: string): string {
    // Context-aware mock translations that maintain brand voice
    const contextualTransforms: Record<string, Record<string, Record<string, string>>> = {
      'navigation': {
        'es': {
          'Home': 'Inicio',
          'Real-Time': 'Tiempo Real',
          'Validator': 'Validador',
          'Submit': 'Enviar',
          'Local': 'Local',
          'Profile': 'Perfil'
        },
        'fr': {
          'Home': 'Accueil',
          'Real-Time': 'Temps Réel',
          'Validator': 'Validateur',
          'Submit': 'Soumettre',
          'Local': 'Local',
          'Profile': 'Profil'
        },
        'de': {
          'Home': 'Startseite',
          'Real-Time': 'Echtzeit',
          'Validator': 'Validator',
          'Submit': 'Senden',
          'Local': 'Lokal',
          'Profile': 'Profil'
        },
        'hi': {
          'Home': 'होम',
          'Real-Time': 'रियल-टाइम',
          'Validator': 'सत्यापनकर्ता',
          'Submit': 'जमा करें',
          'Local': 'स्थानीय',
          'Profile': 'प्रोफाइल'
        }
      },
      'verification': {
        'es': {
          'Credible': 'Creíble',
          'Suspicious': 'Sospechoso',
          'Verified': 'Verificado',
          'Pending': 'Pendiente',
          'Authentic': 'Auténtico',
          'Reliable': 'Confiable'
        },
        'fr': {
          'Credible': 'Crédible',
          'Suspicious': 'Suspect',
          'Verified': 'Vérifié',
          'Pending': 'En attente',
          'Authentic': 'Authentique',
          'Reliable': 'Fiable'
        },
        'de': {
          'Credible': 'Glaubwürdig',
          'Suspicious': 'Verdächtig',
          'Verified': 'Verifiziert',
          'Pending': 'Ausstehend',
          'Authentic': 'Authentisch',
          'Reliable': 'Zuverlässig'
        },
        'hi': {
          'Credible': 'विश्वसनीय',
          'Suspicious': 'संदिग्ध',
          'Verified': 'सत्यापित',
          'Pending': 'लंबित',
          'Authentic': 'प्रामाणिक',
          'Reliable': 'भरोसेमंद'
        }
      },
      'actions': {
        'es': {
          'Submit': 'Enviar',
          'Cancel': 'Cancelar',
          'Save': 'Guardar',
          'Delete': 'Eliminar',
          'Edit': 'Editar',
          'Search': 'Buscar'
        },
        'fr': {
          'Submit': 'Soumettre',
          'Cancel': 'Annuler',
          'Save': 'Sauvegarder',
          'Delete': 'Supprimer',
          'Edit': 'Modifier',
          'Search': 'Rechercher'
        },
        'de': {
          'Submit': 'Senden',
          'Cancel': 'Abbrechen',
          'Save': 'Speichern',
          'Delete': 'Löschen',
          'Edit': 'Bearbeiten',
          'Search': 'Suchen'
        },
        'hi': {
          'Submit': 'जमा करें',
          'Cancel': 'रद्द करें',
          'Save': 'सेव करें',
          'Delete': 'डिलीट करें',
          'Edit': 'एडिट करें',
          'Search': 'खोजें'
        }
      }
    };

    const contextTransforms = contextualTransforms[context || 'general'];
    if (contextTransforms && contextTransforms[targetLanguage]) {
      const transforms = contextTransforms[targetLanguage];
      let result = text;
      
      Object.entries(transforms).forEach(([en, translated]) => {
        result = result.replace(new RegExp(`\\b${en}\\b`, 'gi'), translated);
      });
      
      if (result !== text) {
        return result;
      }
    }

    // Fallback to generic brand voice mock
    return `[${targetLanguage.toUpperCase()}] ${text}`;
  }

  // Batch translate multiple UI elements using hybrid service
  async translateUIBatch(
    items: Array<{ key: string; text: string; context?: string }>,
    targetLanguage: string
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    // Separate items that need API translation vs pre-built/cached
    const needsTranslation: Array<{ key: string; text: string; context?: string }> = [];
    
    for (const item of items) {
      // Check pre-built first
      const prebuilt = this.getPrebuiltTranslation(item.key, targetLanguage);
      if (prebuilt) {
        results[item.key] = prebuilt;
        continue;
      }
      
      // Check cache
      const cacheKey = `${item.key}-${targetLanguage}`;
      if (this.cache.has(cacheKey)) {
        results[item.key] = this.cache.get(cacheKey)!;
        continue;
      }
      
      needsTranslation.push(item);
    }
    
    // Use hybrid service for remaining items
    if (needsTranslation.length > 0) {
      try {
        const batchTexts = needsTranslation.map(item => ({ text: item.text, type: 'ui' as const }));
        const batchResults = await hybridTranslationService.translateBatch(batchTexts, 'en', targetLanguage);
        
        // Cache and store results
        needsTranslation.forEach((item, index) => {
          const translated = batchResults[index].translatedText;
          results[item.key] = translated;
          
          const cacheKey = `${item.key}-${targetLanguage}`;
          this.cache.set(cacheKey, translated);
        });
      } catch (error) {
        console.warn('Batch translation failed, falling back to individual:', error);
        
        // Fallback to individual translations
        for (const item of needsTranslation) {
          results[item.key] = await this.translateUI(item.key, item.text, targetLanguage, item.context);
        }
      }
    }
    
    return results;
  }

  // Update pre-built translations (for CI/CD pipeline)
  updatePrebuiltTranslations(newTranslations: Record<string, UITranslation>): void {
    Object.assign(CORE_UI_TRANSLATIONS, newTranslations);
  }

  // Clear caches
  clearCache(): void {
    this.cache.clear();
    hybridTranslationService.clearCache();
  }

  // Get statistics
  getStats(): {
    cacheSize: number;
    prebuiltKeys: number;
    isConfigured: boolean;
    hybridStats: any;
  } {
    return {
      cacheSize: this.cache.size,
      prebuiltKeys: Object.keys(CORE_UI_TRANSLATIONS).length,
      isConfigured: this.isSupabaseConfigured,
      hybridStats: hybridTranslationService.getStats(),
    };
  }
}

export const brandVoiceTranslation = BrandVoiceTranslationService.getInstance();