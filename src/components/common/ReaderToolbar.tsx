import React, { useEffect, useState } from 'react';
import {
  X,
  Type,
  Sun,
  Moon,
  Coffee,
  Sparkles,
  Glasses,
  Minimize2,
  Clock,
  Check
} from 'lucide-react';

export type ReaderFontSize = 'sm' | 'md' | 'lg';
export type ReaderFontFamily = 'serif' | 'sans' | 'mono';
export type ReaderTheme = 'default' | 'sepia' | 'dark' | 'light';

interface ReaderToolbarProps {
  onExit: () => void;
  fontSize: ReaderFontSize;
  setFontSize: (size: ReaderFontSize) => void;
  fontFamily: ReaderFontFamily;
  setFontFamily: (font: ReaderFontFamily) => void;
  readerTheme: ReaderTheme;
  setReaderTheme: (theme: ReaderTheme) => void;
  readTimeMinutes: number;
  readingProgress: number;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  onExit,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  readerTheme,
  setReaderTheme,
  readTimeMinutes,
  readingProgress
}) => {
  const [showSettings, setShowSettings] = useState(false);

  // Allow exiting with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  return (
    <>
      {/* Top Fixed Reading Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 z-50">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 transition-all duration-150 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, readingProgress))}%` }}
        />
      </div>

      {/* Floating Reader Mode Header Pill */}
      <header
        aria-label="Barra de ferramentas do modo leitura"
        className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800/80 rounded-full px-3 sm:px-4 py-2 shadow-lg flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-3 duration-200"
      >
        {/* Left: Exit button */}
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          title="Sair do Modo Leitura (ESC)"
        >
          <Minimize2 className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden xs:inline">Sair do Modo Leitura</span>
          <span className="xs:hidden">Sair</span>
          <kbd className="hidden sm:inline-block ml-1 text-[10px] px-1.5 py-0.2 bg-neutral-200 dark:bg-neutral-700 rounded text-neutral-500 font-mono">
            ESC
          </kbd>
        </button>

        {/* Center: Reading time badge & progress */}
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{readTimeMinutes} min</span>
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            {Math.round(readingProgress)}%
          </span>
        </div>

        {/* Right: Typography & Theme Controls */}
        <div className="flex items-center gap-1">
          {/* Quick Font Size Buttons */}
          <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-full p-0.5 text-xs font-bold">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                fontSize === 'sm'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Texto Menor"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                fontSize === 'md'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Texto Normal"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                fontSize === 'lg'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Texto Maior"
            >
              A+
            </button>
          </div>

          {/* Theme Quick Switcher (Sepia, Light, Dark) */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-full p-0.5">
            <button
              onClick={() => setReaderTheme('light')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                readerTheme === 'light'
                  ? 'bg-white text-amber-500 shadow-xs scale-110'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
              title="Tema Claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                readerTheme === 'sepia'
                  ? 'bg-[#f4ecd8] text-[#6b4c1e] shadow-xs scale-110'
                  : 'text-neutral-400 hover:text-amber-700'
              }`}
              title="Tema Sépia (Conforto Ocular)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReaderTheme('dark')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                readerTheme === 'dark'
                  ? 'bg-neutral-950 text-amber-400 shadow-xs scale-110'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Tema Escuro"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Family Toggle */}
          <button
            onClick={() => {
              if (fontFamily === 'serif') setFontFamily('sans');
              else if (fontFamily === 'sans') setFontFamily('mono');
              else setFontFamily('serif');
            }}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-bold transition-colors flex items-center gap-1"
            title={`Fonte Atual: ${fontFamily === 'serif' ? 'Serifada' : fontFamily === 'sans' ? 'Sans-Serif' : 'Monoespaçada'}`}
          >
            <Type className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[10px] uppercase font-mono hidden md:inline">
              {fontFamily}
            </span>
          </button>
        </div>
      </header>
    </>
  );
};
