'use client';

import { useTheme } from 'next-themes';
import { FaSun, FaMoon } from 'react-icons/fa6';

function ThemeButton() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Theme Button">
      <FaMoon name="light" size={20} className="absolute scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
      <FaSun name="dark" size={20} className="absolute scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
    </button>
  );
}
export default ThemeButton;
