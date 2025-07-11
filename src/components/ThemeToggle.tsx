'use client'

import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className="fixed top-6 right-6 z-40 flex items-center space-x-2">
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="glass-card p-3 hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Toggle theme"
        tabIndex={0}
      >
        {theme === 'dark' ? (
          <SunIcon className="w-5 h-5 text-white drop-shadow-lg" />
        ) : (
          <MoonIcon className="w-5 h-5 text-white drop-shadow-lg" />
        )}
      </button>
    </div>
  )
}
