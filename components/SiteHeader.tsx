'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Sun, Moon, Menu, X, Check, BookOpen } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAppPreferences } from './AppPreferencesProvider';

const NAV_ITEMS = [
  { href: '/chart', vi: 'Tử Vi Mệnh Bàn', zh: '紫微命盘' },
  { href: '/heming', vi: 'Hợp Bàn', zh: '合盘分析' },
  { href: '/xiaoliuren', vi: 'Tiểu Lục Nhâm', zh: '小六壬' },
  { href: '/shuangzi', vi: 'Mệnh Lý Song Tử', zh: '命理学双子' },
  { href: '/sanji', vi: 'Tam Kỷ', zh: '三纪' },
];

export default function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname() ?? '';
  const { theme, setTheme } = useTheme();
  const { lang, setLang, edition, setEdition, t } = useAppPreferences();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const editionLabel = edition === 'pro' ? t('Chuyên sâu', '专业版') : t('Tiêu chuẩn', '普通版');

  return (
    <header
      className="sticky top-0 z-50 w-full transition-colors duration-200"
      style={{
        background: transparent
          ? 'color-mix(in srgb, var(--bg-0) 90%, transparent)'
          : 'color-mix(in srgb, var(--bg-0) 94%, transparent)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: transparent ? '1px solid transparent' : '1px solid var(--bdr)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-6 md:px-10">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          href="/"
          className="text-[20px] font-extrabold tracking-[0.04em] whitespace-nowrap shrink-0 transition-opacity hover:opacity-75"
          style={{ color: 'var(--tx-0)' }}
        >
          NIRVANER<sup className="ml-0.5 text-[9px] font-semibold opacity-60">TM</sup>
        </Link>

        {/* Zone 2: 5 Clean Single-Line Nav Links (No Academy Hub) */}
        <nav
          aria-label={t('Điều hướng chính', '主导航')}
          className="hidden lg:flex items-center gap-7"
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative py-1 text-[13px] whitespace-nowrap shrink-0 transition-colors"
                style={{
                  color: active ? 'var(--tx-0)' : 'var(--tx-3)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {lang === 'vi' ? item.vi : item.zh}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                    style={{ background: 'var(--tx-0)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Direct Light/Dark Mode Toggle + Edition/Language Dropdown + Mobile Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* 2-Mode Light/Dark Background Switch */}
          <div
            role="group"
            aria-label={t('Chế độ nền sáng tối', '明暗背景模式')}
            className="flex items-center rounded-lg p-0.5 shrink-0"
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--bdr)',
            }}
          >
            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-label={t('Nền sáng', '浅色背景')}
              aria-pressed={theme === 'light'}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium transition-colors whitespace-nowrap"
              style={{
                background: theme === 'light' ? 'var(--bg-card)' : 'transparent',
                color: theme === 'light' ? 'var(--tx-0)' : 'var(--tx-3)',
                boxShadow: theme === 'light' ? 'var(--sh-xs)' : 'none',
              }}
            >
              <Sun size={12} />
              <span className="hidden sm:inline">{t('Sáng', '浅色')}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-label={t('Nền tối', '深色背景')}
              aria-pressed={theme === 'dark'}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium transition-colors whitespace-nowrap"
              style={{
                background: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
                color: theme === 'dark' ? 'var(--tx-0)' : 'var(--tx-3)',
                boxShadow: theme === 'dark' ? 'var(--sh-xs)' : 'none',
              }}
            >
              <Moon size={12} />
              <span className="hidden sm:inline">{t('Tối', '深色')}</span>
            </button>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap shrink-0 transition-colors"
              style={{
                color: 'var(--tx-1)',
                background: menuOpen ? 'var(--bg-1)' : 'transparent',
                border: '1px solid var(--bdr)',
              }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                style={{ background: 'var(--bg-2)', color: 'var(--tx-1)' }}
              >
                {lang === 'vi' ? 'V' : '中'}
              </span>
              <span>{editionLabel}</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--tx-3)' }}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 rounded-xl p-2 z-50"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--bdr-med)',
                  boxShadow: 'var(--sh-md)',
                }}
              >
                {/* Edition Switch */}
                <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium" style={{ color: 'var(--tx-3)' }}>
                  {t('Chế độ hiển thị', '排盘版本')}
                </div>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg mb-2" style={{ background: 'var(--bg-1)' }}>
                  <button
                    type="button"
                    onClick={() => setEdition('standard')}
                    className="rounded-md py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap"
                    style={{
                      background: edition === 'standard' ? 'var(--bg-card)' : 'transparent',
                      color: edition === 'standard' ? 'var(--tx-0)' : 'var(--tx-3)',
                      boxShadow: edition === 'standard' ? 'var(--sh-xs)' : 'none',
                    }}
                  >
                    {t('Tiêu chuẩn', '普通版')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEdition('pro')}
                    className="rounded-md py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap"
                    style={{
                      background: edition === 'pro' ? 'var(--bg-card)' : 'transparent',
                      color: edition === 'pro' ? 'var(--tx-0)' : 'var(--tx-3)',
                      boxShadow: edition === 'pro' ? 'var(--sh-xs)' : 'none',
                    }}
                  >
                    {t('Chuyên sâu', '专业版')}
                  </button>
                </div>

                {/* Language Switch */}
                <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium" style={{ color: 'var(--tx-3)' }}>
                  {t('Ngôn ngữ giao diện', '界面语言')}
                </div>
                <div className="space-y-0.5 mb-2">
                  {([
                    { key: 'vi', label: 'Tiếng Việt · 越中对照' },
                    { key: 'zh', label: '简体中文 · 原版' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setLang(opt.key)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] transition-colors"
                      style={{
                        color: lang === opt.key ? 'var(--tx-0)' : 'var(--tx-2)',
                        background: lang === opt.key ? 'var(--bg-1)' : 'transparent',
                      }}
                    >
                      <span>{opt.label}</span>
                      {lang === opt.key && <Check size={13} style={{ color: 'var(--ac)' }} />}
                    </button>
                  ))}
                </div>

                {/* Theme Switch */}
                <div
                  className="pt-2 mt-1 flex items-center justify-between px-2.5 py-1.5"
                  style={{ borderTop: '1px solid var(--bdr)' }}
                >
                  <span className="text-[12px]" style={{ color: 'var(--tx-2)' }}>
                    {t('Giao diện', '主题')}
                  </span>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-1)' }}>
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      aria-label={t('Chế độ sáng', '亮色模式')}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] transition-colors"
                      style={{
                        background: theme === 'light' ? 'var(--bg-card)' : 'transparent',
                        color: theme === 'light' ? 'var(--tx-0)' : 'var(--tx-3)',
                      }}
                    >
                      <Sun size={12} />
                      <span>{t('Sáng', '亮')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      aria-label={t('Chế độ tối', '暗色模式')}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] transition-colors"
                      style={{
                        background: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
                        color: theme === 'dark' ? 'var(--tx-0)' : 'var(--tx-3)',
                      }}
                    >
                      <Moon size={12} />
                      <span>{t('Tối', '暗')}</span>
                    </button>
                  </div>
                </div>

                {/* Classics Library Shortcut */}
                <div className="pt-1.5 mt-1" style={{ borderTop: '1px solid var(--bdr)' }}>
                  <Link
                    href="/library"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors hover:opacity-80"
                    style={{ color: 'var(--tx-1)' }}
                  >
                    <BookOpen size={13} style={{ color: 'var(--ac)' }} />
                    <span>{t('Thư viện Cổ thư Nguyên điển', '古籍原典库')}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t('Mở menu', '打开菜单')}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg"
            style={{ border: '1px solid var(--bdr)', color: 'var(--tx-0)' }}
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden px-6 pb-5 pt-2"
          style={{
            background: 'var(--bg-0)',
            borderBottom: '1px solid var(--bdr)',
          }}
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px]"
                  style={{
                    color: active ? 'var(--tx-0)' : 'var(--tx-2)',
                    background: active ? 'var(--bg-1)' : 'transparent',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <span>{lang === 'vi' ? item.vi : item.zh}</span>
                  <span className="text-[11px]" style={{ color: 'var(--tx-3)' }}>
                    {lang === 'vi' ? item.zh : item.vi}
                  </span>
                </Link>
              );
            })}
            <Link
              href="/library"
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px]"
              style={{ color: 'var(--tx-2)' }}
            >
              <span>{t('Cổ Thư Nguyên Điển', '古籍原典库')}</span>
              <span className="text-[11px]" style={{ color: 'var(--tx-3)' }}>
                {lang === 'vi' ? '古籍原典' : 'Classics'}
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
