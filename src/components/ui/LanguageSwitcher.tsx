import React from 'react';
import { LanguageToggle } from './LanguageToggle';

export interface LanguageSwitcherProps {
  variant?: 'ghost' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = () => {
  return <LanguageToggle />;
};
