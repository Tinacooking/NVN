'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { useAppPreferences } from '@/components/AppPreferencesProvider';
import {
  TIANJI_MODULES,
  HEXAGRAMS,
  FENGSHUI_ENTRIES,
  DIJI_MODULES,
  RENJI_MODULES,
  HANTANG_FORMULAS,
  CLASSIC_FORMULAS,
  NI_HAIXIA_BIO,
} from '@/lib/nihai';
import { ALL_BOOKS, TOTAL_PARAGRAPHS } from '@/lib/classics';
import { ArrowUpRight, BookOpen, Search } from 'lucide-react';

type SanjiTab = 'tianji' | 'diji' | 'renji' | 'classics';

export default function SanjiPage() {
  const { t } = useAppPreferences();
  const [tab, setTab] = useState<SanjiTab>('tianji');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHexagrams = HEXAGRAMS.filter(
    (h) => !searchTerm || h.name.includes(searchTerm) || h.composition.includes(searchTerm) || h.meaning.includes(searchTerm),
  );

  const filteredFormulas = HANTANG_FORMULAS.filter(
    (f) => !searchTerm || f.name.includes(searchTerm) || f.indication.includes(searchTerm),
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-0)' }}>
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-[1160px] px-6 py-10 md:py-14">
        {/* Archival Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <div>
            <p className="text-[12px] tracking-[0.18em] mb-2" style={{ color: 'var(--tx-3)' }}>
              05 · {t('THƯỢNG TRI THIÊN VĂN · HẠ TRI ĐỊA LÝ · TRUNG TRI NHÂN SỰ', '上知天文 · 下知地理 · 中知人事')}
            </p>
            <h1 className="font-editorial text-[28px] md:text-[34px] font-semibold tracking-tight" style={{ color: 'var(--tx-0)' }}>
              {t('Tam Kỷ & Cổ Thư Nguyên Điển', '三纪体系与古籍原典')}
            </h1>
            <p className="mt-2 text-[13.5px] max-w-2xl" style={{ color: 'var(--tx-2)' }}>
              {t(
                'Thư mục lưu trữ hệ thống Thiên Kỷ (Tử Vi · Kinh Dịch · Phong Thủy), Địa Kỷ, Nhân Kỷ (Đông Y Kinh Phương) và 3 bộ cổ thư Tử Vi nguyên văn.',
                '收录倪海厦天纪、地纪、人纪脉络索引，以及《骨髓赋》《紫微斗数全集》《紫微斗数全书》公版原典。',
              )}
            </p>
          </div>
          <Link href="/library" className="btn-ghost self-start md:self-auto">
            <BookOpen size={14} />
            <span>{t('Mở trình đọc Cổ thư', '进入古籍检索')}</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Clean Archival Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'tianji' as const, label: t('Thiên Kỷ (天纪)', '天纪 · 天文术数') },
              { key: 'diji' as const, label: t('Địa Kỷ (地纪)', '地纪 · 堪舆地理') },
              { key: 'renji' as const, label: t('Nhân Kỷ (人纪)', '人纪 · 中医经方') },
              { key: 'classics' as const, label: t(`Cổ Thư Nguyên Điển (${ALL_BOOKS.length})`, `古籍原典 (${ALL_BOOKS.length})`) },
            ].map((item) => {
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => { setTab(item.key); setSearchTerm(''); }}
                  className="rounded-lg px-4 py-2 text-[13px] font-medium transition-colors"
                  style={{
                    background: active ? 'var(--tx-0)' : 'var(--bg-1)',
                    color: active ? 'var(--bg-0)' : 'var(--tx-2)',
                    border: `1px solid ${active ? 'var(--tx-0)' : 'var(--bdr)'}`,
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {(tab === 'tianji' || tab === 'renji') && (
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--tx-3)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={tab === 'tianji' ? t('Lọc quẻ Dịch...', '筛选六十四卦…') : t('Lọc bài thuốc Hán Đường...', '筛选汉唐方剂…')}
                className="input-base pl-9 py-2 text-[12.5px]"
              />
            </div>
          )}
        </div>

        {/* TIANJI */}
        {tab === 'tianji' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {TIANJI_MODULES.map((m) => (
                <div key={m.id} className="rounded-xl p-6 space-y-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-editorial text-[19px] font-semibold" style={{ color: 'var(--tx-0)' }}>
                      {m.name}
                    </h2>
                    <span className="text-[11.5px]" style={{ color: 'var(--ac)' }}>{m.school || m.subtitle}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--tx-2)' }}>{m.description}</p>
                  {m.references && m.references.length > 0 && (
                    <div className="pt-2 text-[11.5px]" style={{ color: 'var(--tx-3)' }}>
                      {m.references.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 64 Hexagrams Compact Catalog */}
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-editorial text-[18px] font-semibold" style={{ color: 'var(--tx-0)' }}>
                  {t('Mục lục Kinh Dịch 64 Quẻ', '易经六十四卦索引')}
                </h3>
                <span className="font-mono-tabular text-[12px]" style={{ color: 'var(--tx-3)' }}>
                  {filteredHexagrams.length} / {HEXAGRAMS.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {filteredHexagrams.map((h) => (
                  <div key={h.number} className="rounded-lg p-3" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}>
                    <div className="flex items-center justify-between text-[11px] font-mono-tabular" style={{ color: 'var(--tx-3)' }}>
                      <span>{String(h.number).padStart(2, '0')}</span>
                      <span className="text-[11px]" style={{ color: 'var(--tx-2)' }}>{h.upper}/{h.lower}</span>
                    </div>
                    <div className="font-editorial text-[14px] font-semibold mt-1" style={{ color: 'var(--tx-0)' }}>
                      {h.name}
                    </div>
                    <div className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--tx-3)' }}>
                      {h.composition} · {h.meaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fengshui Entries */}
            <div>
              <h3 className="font-editorial text-[18px] font-semibold mb-4" style={{ color: 'var(--tx-0)' }}>
                {t('Kham Dư Dương Trạch yếu quyết', '堪舆阳宅要点')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FENGSHUI_ENTRIES.map((fs) => (
                  <div key={fs.id} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr)' }}>
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <span className="font-medium text-[14px]" style={{ color: 'var(--tx-0)' }}>{fs.title}</span>
                      <span className="text-[11px]" style={{ color: 'var(--tx-3)' }}>
                        {fs.category === 'yangzhai' ? '阳宅' : fs.category === 'yinzhai' ? '阴宅' : '堪舆心法'}
                      </span>
                    </div>
                    <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--tx-2)' }}>{fs.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DIJI */}
        {tab === 'diji' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {DIJI_MODULES.map((m) => (
                <div key={m.id} className="rounded-xl p-6 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-editorial text-[20px] font-semibold" style={{ color: 'var(--tx-0)' }}>{m.name}</h2>
                    <span className="text-[11.5px]" style={{ color: 'var(--tx-3)' }}>{m.subtitle}</span>
                  </div>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--tx-2)' }}>{m.description}</p>
                  {m.chapters && (
                    <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bdr)' }}>
                      {m.chapters.map((ch) => (
                        <div key={ch.id} className="rounded-lg p-3" style={{ background: 'var(--bg-1)' }}>
                          <div className="text-[13px] font-medium" style={{ color: 'var(--tx-0)' }}>{ch.title}</div>
                          <div className="text-[12px] mt-0.5" style={{ color: 'var(--tx-3)' }}>{ch.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RENJI */}
        {tab === 'renji' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {RENJI_MODULES.map((m) => (
                <div key={m.id} className="rounded-xl p-5 space-y-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}>
                  <div className="text-[11px]" style={{ color: 'var(--ac)' }}>{m.subtitle}</div>
                  <h2 className="font-editorial text-[18px] font-semibold" style={{ color: 'var(--tx-0)' }}>{m.name}</h2>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--tx-2)' }}>{m.description}</p>
                  {m.lessons && <div className="text-[11px] pt-1" style={{ color: 'var(--tx-3)' }}>{m.lessons}</div>}
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-editorial text-[18px] font-semibold" style={{ color: 'var(--tx-0)' }}>
                  {t('Tra cứu Hán Đường Phương & Kinh Phương', '汉唐方剂与经方摘录')}
                </h3>
                <span className="font-mono-tabular text-[12px]" style={{ color: 'var(--tx-3)' }}>
                  {filteredFormulas.length} + {CLASSIC_FORMULAS.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredFormulas.slice(0, 18).map((f) => (
                  <div key={f.id} className="rounded-lg p-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-[13.5px]" style={{ color: 'var(--tx-0)' }}>{f.name}</span>
                      <span className="font-mono-tabular text-[11px]" style={{ color: 'var(--ac)' }}>HT-{f.id}</span>
                    </div>
                    <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: 'var(--tx-2)' }}>{f.indication}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11.5px] mt-4" style={{ color: 'var(--tx-3)' }}>
                {t(
                  'Lưu ý: Toàn bộ tư liệu Đông Y chỉ mang tính tra cứu văn hóa cổ truyền, không thay thế chẩn đoán hay điều trị y khoa.',
                  '注：以上人纪资料仅作传统文化文献摘录，不构成任何医疗诊断或用药建议。',
                )}
              </p>
            </div>
          </div>
        )}

        {/* CLASSICS ARCHIVE */}
        {tab === 'classics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ALL_BOOKS.map((book) => (
                <Link
                  key={book.slug}
                  href={`/library/${book.slug}`}
                  className="group rounded-xl p-6 flex flex-col justify-between transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}
                >
                  <div>
                    <div className="text-[11.5px] mb-2" style={{ color: 'var(--tx-3)' }}>
                      {book.dynasty} · {book.author.split(' ')[0]}
                    </div>
                    <h2 className="font-editorial text-[21px] font-semibold mb-2" style={{ color: 'var(--tx-0)' }}>
                      《{book.title}》
                    </h2>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--tx-2)' }}>
                      {book.intro}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 flex items-center justify-between text-[12px]" style={{ borderTop: '1px solid var(--bdr)' }}>
                    <span className="font-mono-tabular" style={{ color: 'var(--tx-3)' }}>
                      {book.chapters.length} {t('chương', '章')} · {book.chapters.reduce((s, c) => s + c.paragraphs.length, 0)} {t('đoạn', '段')}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium group-hover:opacity-70" style={{ color: 'var(--tx-0)' }}>
                      {t('Đọc ngay', '阅览')} <ArrowUpRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}>
              <div>
                <div className="text-[14px] font-semibold" style={{ color: 'var(--tx-0)' }}>
                  {t(`Tìm kiếm toàn văn trong ${TOTAL_PARAGRAPHS} đoạn cổ thư nguyên bản`, `全文检索 ${TOTAL_PARAGRAPHS} 段公版古籍原典`)}
                </div>
                <p className="text-[12.5px] mt-1" style={{ color: 'var(--tx-3)' }}>
                  {NI_HAIXIA_BIO.corePhilosophy[0]} · {NI_HAIXIA_BIO.corePhilosophy[1]}
                </p>
              </div>
              <Link href="/library" className="btn-primary shrink-0">
                <Search size={14} />
                <span>{t('Mở tìm kiếm Cổ thư', '前往古籍库')}</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
