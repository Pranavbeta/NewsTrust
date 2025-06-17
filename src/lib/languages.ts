// Language configuration and mapping
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  gNewsSupported: boolean;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', gNewsSupported: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', gNewsSupported: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', gNewsSupported: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', gNewsSupported: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', gNewsSupported: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', gNewsSupported: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', gNewsSupported: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', gNewsSupported: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', gNewsSupported: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', gNewsSupported: true, rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', gNewsSupported: true },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', gNewsSupported: true },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', gNewsSupported: true },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', gNewsSupported: true },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', gNewsSupported: true },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', gNewsSupported: true },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', gNewsSupported: true },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', gNewsSupported: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', gNewsSupported: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', gNewsSupported: true, rtl: true },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', gNewsSupported: true },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', gNewsSupported: true },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', gNewsSupported: true },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', gNewsSupported: true },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', gNewsSupported: true },
  
  // Languages not supported by GNews (will use Lingo.dev translation)
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', gNewsSupported: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', gNewsSupported: false, rtl: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇱🇰', gNewsSupported: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', gNewsSupported: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', gNewsSupported: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', gNewsSupported: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', gNewsSupported: false },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', gNewsSupported: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', gNewsSupported: false },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', gNewsSupported: false },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', gNewsSupported: false },
  { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ', flag: '🇲🇲', gNewsSupported: false },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭', gNewsSupported: false },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', flag: '🇱🇦', gNewsSupported: false },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪', gNewsSupported: false },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', gNewsSupported: false },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', gNewsSupported: false },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', gNewsSupported: false },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', gNewsSupported: false },
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

export const getGNewsSupportedLanguages = (): Language[] => {
  return SUPPORTED_LANGUAGES.filter(lang => lang.gNewsSupported);
};

const detectBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0];
  const supportedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
  return supportedLang ? browserLang : 'en';
};

export const getUserPreferredLanguage = (): string => {
  // Check localStorage first
  const stored = localStorage.getItem('newsverify_language');
  if (stored && SUPPORTED_LANGUAGES.find(lang => lang.code === stored)) {
    return stored;
  }
  
  // Fallback to browser detection
  return detectBrowserLanguage();
};

export const setUserPreferredLanguage = (languageCode: string): void => {
  localStorage.setItem('newsverify_language', languageCode);
};