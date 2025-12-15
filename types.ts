export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  messages: ChatMessage[];
  currentCode?: string;
}

export type Theme = 'light' | 'dark';

export interface AccessibilitySettings {
  theme: Theme;
  soundEnabled: boolean; // Added Audio Setting
  
  // 10 Accessibility Options
  largeText: boolean;           // 1. טקסט גדול
  wordSpacing: boolean;         // 2. ריווח מילים
  letterSpacing: boolean;       // 3. ריווח אותיות
  grayscale: boolean;           // 4. גווני אפור
  invertColors: boolean;        // 5. היפוך צבעים
  highlightLinks: boolean;      // 6. הדגשת קישורים
  bigCursor: boolean;           // 7. סמן גדול
  readingGuide: boolean;        // 8. קו קריאה
  hideImages: boolean;          // 9. הסתרת תמונות
  readableFont: boolean;        // 10. גופן קריא
  
  // Base settings
  highContrast: boolean; // Kept for legacy compatibility
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
}

export enum AppView {
  WELCOME = 'WELCOME',
  AUTH = 'AUTH',
  TERMS = 'TERMS',
  SETUP_COMPLETE = 'SETUP_COMPLETE',
  HOME = 'HOME',
  PROJECT = 'PROJECT',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
}

export type Language = 'he' | 'en' | 'it' | 'fr' | 'de' | 'pl' | 'da' | 'nl' | 'es';

export interface UserPreferences {
  language: Language;
  hasSeenWelcome: boolean;
  acceptedTerms: boolean;
}