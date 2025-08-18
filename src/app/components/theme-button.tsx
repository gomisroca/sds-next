'use client';

import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa6';

import { useMessage } from '@/hooks/useMessage';

import Button from './ui/button';

function ThemeButton() {
  const { theme, setTheme } = useTheme();
  const { setMessage } = useMessage();

  return (
    <Button
      arialabel="Theme Button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      onError={(error) => setMessage({ content: error.message, error: true })}>
      <FaMoon name="light" size={20} className="absolute scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
      <FaSun name="dark" size={20} className="absolute scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
export default ThemeButton;
