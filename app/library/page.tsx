/**
 * 古籍原典查询库 · 主页
 */
import Link from 'next/link';
import { ALL_BOOKS, TOTAL_PARAGRAPHS } from '@/lib/classics';
import LibrarySearch from './LibrarySearch';
import SiteHeader from '@/components/SiteHeader';

export const metadata = {
  title: '古籍原典库 · Nirvaner · 紫微斗数全集 / 全书 / 骨髓赋',
  description: '紫微斗数权威古籍全文检索：《紫微斗数全集》《紫微斗数全书》《骨髓赋》',
};

export default function LibraryHomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-0)' }}>
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-[1120px] px-6 py-12 md:py-16">
        <div className="mb-10 pb-6" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <p className="text-[12px] tracking-[0.2em] mb-2" style={{ color: 'var(--tx-3)' }}>
            CLASSICS ARCHIVE · 古籍原典库
          </p>
          <h1 className="font-editorial text-[28px] md:text-[36px] font-semibold tracking-tight" style={{ color: 'var(--tx-0)' }}>
            紫微斗数古籍原典库
          </h1>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--tx-2)' }}>
            收录 <strong style={{ color: 'var(--tx-0)' }}>{ALL_BOOKS.length}</strong> 部公版古籍 · 共{' '}
            <strong className="font-mono-tabular" style={{ color: 'var(--ac)' }}>{TOTAL_PARAGRAPHS}</strong> 段原文，支持即时全文检索。
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mb-12">
          <LibrarySearch />
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ALL_BOOKS.map((book) => (
            <Link
              key={book.slug}
              href={`/library/${book.slug}`}
              className="group rounded-xl p-6 flex flex-col justify-between transition-all hover:opacity-90"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--bdr-med)',
                textDecoration: 'none',
              }}
            >
              <div>
                <div className="text-[11.5px] tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>
                  {book.dynasty} · {book.author.split(' ')[0]}
                </div>
                <h2 className="font-editorial text-[21px] font-semibold mb-3" style={{ color: 'var(--tx-0)' }}>
                  《{book.title}》
                </h2>
                <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--tx-2)' }}>
                  {book.intro}
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-[12px]" style={{ borderTop: '1px solid var(--bdr)' }}>
                <span className="font-mono-tabular" style={{ color: 'var(--tx-3)' }}>
                  {book.chapters.length} 章节 · {book.chapters.reduce((s, c) => s + c.paragraphs.length, 0)} 段
                </span>
                <span className="font-medium" style={{ color: 'var(--tx-0)' }}>
                  进入查阅 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
