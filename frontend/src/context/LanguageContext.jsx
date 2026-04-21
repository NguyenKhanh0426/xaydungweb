import { createContext, useCallback, useMemo, useState } from 'react';

const STORAGE_KEY = 'appLanguage';

const translations = {
  en: {
    common: {
      dashboard: 'Dashboard',
      assistant: 'EnGr',
      flashcards: 'Flashcards',
      vocabulary: 'Vocabulary',
      goals: 'Goals',
      profile: 'Profile',
      reminders: 'Reminders',
      tests: 'Mini Tests',
      skills: 'Skill Logs',
      logout: 'Logout',
      learner: 'Learner',
      loadingGoals: 'Loading goals...',
      loadingSets: 'Loading sets...',
      saving: 'Saving...',
      today: 'Today'
    },
    layout: {
      mission: 'Mission:',
      missionValue: 'Review cards...',
      overview: 'Overview',
      welcomeBack: 'Welcome back, {{name}}',
      topMessage: 'Stay consistent, review smart, and keep building your English day by day.',
      startReview: 'Start review',
      language: 'Language',
      english: 'English',
      vietnamese: 'Vietnamese'
    }
  },
  vi: {
    common: {
      dashboard: 'Trang Chủ',
      assistant: 'EnGr',
      flashcards: 'Thẻ ghi nhớ',
      vocabulary: 'Từ vựng',
      goals: 'Mục tiêu',
      profile: 'Hồ sơ',
      reminders: 'Nhắc học',
      tests: 'Mini test',
      skills: 'Nhật ký kỹ năng',
      logout: 'Đăng xuất',
      learner: 'Người học',
      loadingGoals: 'Đang tải mục tiêu...',
      loadingSets: 'Đang tải bộ từ...',
      saving: 'Đang lưu...',
      today: 'Hôm nay'
    },
    layout: {
      mission: 'Nhiệm vụ:',
      missionValue: 'Ôn thẻ...',
      overview: 'Tổng quan',
      welcomeBack: 'Chào mừng quay lại, {{name}}',
      topMessage: 'Hãy đều đặn mỗi ngày, ôn thông minh và tiếp tục tiến bộ tiếng Anh từng bước.',
      startReview: 'Bắt đầu ôn',
      language: 'Ngôn ngữ',
      english: 'Tiếng Anh',
      vietnamese: 'Tiếng Việt'
    }
  }
};

export const LanguageContext = createContext(null);

const getNestedValue = (object, path) => path.split('.').reduce((acc, key) => acc?.[key], object);

const interpolate = (template, params = {}) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => (params[key] ?? '').toString());

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem(STORAGE_KEY) || 'en');

  const updateLanguage = useCallback((value) => {
    setLanguage(value);
    localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const t = useCallback((key, params) => {
    const current = translations[language] || translations.en;
    const fallback = translations.en;
    const value = getNestedValue(current, key) ?? getNestedValue(fallback, key) ?? key;
    return typeof value === 'string' ? interpolate(value, params) : key;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: updateLanguage,
    t
  }), [language, updateLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
