'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ChevronUp, ChevronDown } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import { useAppPreferences } from '@/components/AppPreferencesProvider';

interface GalleryFeature {
  id: string;
  index: string;
  href: string;
  titleZh: string;
  titleVi: string;
  disciplineZh: string;
  disciplineVi: string;
  rightCaptionZh: string;
  rightCaptionVi: string;
  summaryVi: string;
  summaryZh: string;
  image: string;
  cropFrame?: boolean;
}

const GALLERY_FEATURES: GalleryFeature[] = [
  {
    id: 'ziwei',
    index: '01',
    href: '/chart',
    titleZh: '紫微命盘',
    titleVi: 'Tử Vi Mệnh Bàn',
    disciplineZh: '易经 · 倪师体系',
    disciplineVi: 'Kinh Dịch · Hệ Nghê Hải Hạ',
    rightCaptionZh: '排盘与命格解读',
    rightCaptionVi: 'Lập lá số & Luận giải',
    summaryVi: 'Lập lá số 12 cung theo Giờ Mặt Trời Thực, chuyển Bản Mệnh · Đại Hạn · Lưu Niên, 10 tùy chọn lưu phái và nhận diện cách cục cổ thư.',
    summaryZh: '支持真太阳时校正、十类流派切换、本命/大限/流年四化叠加与古籍格局自动识别。',
    image: '/images/gallery/ziwei.jpg',
    cropFrame: true,
  },
  {
    id: 'heming',
    index: '02',
    href: '/heming',
    titleZh: '合盘分析',
    titleVi: 'Hợp Bàn Phân Tích',
    disciplineZh: '双盘合参 · 缘分推演',
    disciplineVi: 'Song bàn hợp tham · Duyên phận',
    rightCaptionZh: '双人关系合参',
    rightCaptionVi: 'Đối chiếu song bàn',
    summaryVi: 'Đặt hai lá số cạnh nhau để phân tích độ tương hợp cung Mệnh – Phu Thê, Tam Phương hội chiếu và nhịp Đại Hạn đồng hành.',
    summaryZh: '输入双方生辰即时起盘，对照命宫、夫妻宫星曜呼应与大限同步节奏。',
    image: '/images/gallery/heming.jpg',
  },
  {
    id: 'xiaoliuren',
    index: '03',
    href: '/xiaoliuren',
    titleZh: '小六壬',
    titleVi: 'Tiểu Lục Nhâm',
    disciplineZh: '掌中六神 · 即时占断',
    disciplineVi: 'Lục Thần trên tay · Chiêm đoán tức thời',
    rightCaptionZh: '即时起卦推演',
    rightCaptionVi: 'Gieo quẻ tức thời',
    summaryVi: 'Phép bấm độn cổ truyền 6 cung (Đại An · Lưu Liên · Tốc Hỷ · Xích Khẩu · Tiểu Cát · Không Vong) theo lịch Âm hiện tại hoặc 3 con số.',
    summaryZh: '依据当前农历月日时或任意三数即时起课，直观推演大安至空亡六宫吉凶。',
    image: '/images/gallery/xiaoliuren.jpg',
    cropFrame: true,
  },
  {
    id: 'shuangzi',
    index: '04',
    href: '/shuangzi',
    titleZh: '命理学双子',
    titleVi: 'Mệnh Lý Song Tử',
    disciplineZh: '同辰异命 · 真太阳时',
    disciplineVi: 'Đồng thần dị mệnh · Giờ Mặt Trời Thực',
    rightCaptionZh: '经度性别对照',
    rightCaptionVi: 'So sánh Kinh độ & Giới tính',
    summaryVi: 'Giải mã vì sao sinh cùng giờ lại khác vận mệnh: đối chiếu chênh lệch kinh độ địa lý, thuận nghịch Đại Hạn Nam/Nữ và Tam Tài Thiên–Địa–Nhân.',
    summaryZh: '同一钟表时刻跨经度排盘对比、男女大限顺逆对照，直观验证天人地三才差异。',
    image: '/images/gallery/shuangzi.jpg',
  },
  {
    id: 'sanji',
    index: '05',
    href: '/sanji',
    titleZh: '三纪 · 古籍',
    titleVi: 'Tam Kỷ · Cổ Thư',
    disciplineZh: '天纪 · 地纪 · 人纪原典',
    disciplineVi: 'Thiên Kỷ · Địa Kỷ · Nhân Kỷ & Nguyên Điển',
    rightCaptionZh: '典籍检索阅览',
    rightCaptionVi: 'Lưu trữ & Tra cứu cổ thư',
    summaryVi: 'Khám phá tổng quan Tam Kỷ (64 Quẻ Dịch, Kham Dư Phong Thủy, Hán Đường Kinh Phương) cùng kho toàn văn Cốt Tủy Phú, Toàn Tập và Toàn Thư.',
    summaryZh: '查阅天纪、地纪、人纪体系全貌，并全文检索《骨髓赋》《紫微斗数全集》《全书》。',
    image: '/images/gallery/sanji.jpg',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { lang, t } = useAppPreferences();
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const activeFeature = GALLERY_FEATURES[activeIndex];

  const scrollToFeature = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(GALLERY_FEATURES.length - 1, idx));
    setActiveIndex(clamped);
    const el = itemRefs.current[clamped];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Scroll-spy to track which square exhibition painting is centered in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = -1;
        let bestRatio = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            const idxAttr = entry.target.getAttribute('data-gallery-index');
            if (idxAttr !== null) {
              bestRatio = entry.intersectionRatio;
              bestIdx = Number(idxAttr);
            }
          }
        });
        if (bestIdx >= 0) setActiveIndex(bestIdx);
      },
      {
        rootMargin: '-32% 0px -32% 0px',
        threshold: [0.15, 0.35, 0.6, 0.85],
      },
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Keyboard navigation (ArrowUp / ArrowDown / Enter)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToFeature(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToFeature(activeIndex - 1);
      } else if (e.key === 'Enter') {
        router.push(GALLERY_FEATURES[activeIndex].href);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, router, scrollToFeature]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-0)', color: 'var(--tx-0)' }}>
      <SiteHeader transparent />

      {/* Quiet Chinese Subtitle directly below Brand Zone on Desktop (matching Ouranic screenshot) */}
      <div className="pointer-events-none fixed left-6 md:left-10 top-[66px] z-30 hidden sm:block">
        <p
          className="text-[11px] tracking-[0.42em] select-none"
          style={{ color: 'var(--tx-2)' }}
        >
          {lang === 'vi' ? '紫 微 斗 数 · 三 纪' : '紫 微 斗 数 · 三 纪'}
        </p>
      </div>

      {/* Main Gallery Stage */}
      <main className="relative flex-1 mx-auto w-full max-w-[1440px] px-6 md:px-10">
        {/* Desktop Fixed Left Chapter Index + Discipline Subtitle (matches Ouranic screenshot) */}
        <aside
          aria-label={t('Danh mục tính năng', '功能目录')}
          className="hidden lg:flex fixed left-10 top-1/2 -translate-y-1/2 z-30 items-start gap-12"
        >
          <ul className="space-y-3">
            {GALLERY_FEATURES.map((feat, idx) => {
              const isActive = idx === activeIndex;
              return (
                <li key={feat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        router.push(feat.href);
                      } else {
                        scrollToFeature(idx);
                      }
                    }}
                    className="group flex items-center gap-2 text-left text-[13.5px] leading-snug transition-colors duration-150 whitespace-nowrap"
                    style={{
                      color: isActive ? 'var(--tx-0)' : 'var(--tx-3)',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <span className="group-hover:opacity-100">
                      {lang === 'vi' ? feat.titleVi : feat.titleZh}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Secondary editorial discipline column aligned horizontally with active row */}
          <div className="pt-0.5 max-w-[200px]">
            <div
              className="text-[13px] font-normal tracking-[0.04em] transition-opacity duration-200"
              style={{ color: 'var(--tx-2)' }}
            >
              {lang === 'vi' ? activeFeature.disciplineVi : activeFeature.disciplineZh}
            </div>
            <p
              className="mt-2.5 text-[12px] leading-relaxed transition-opacity duration-200"
              style={{ color: 'var(--tx-3)' }}
            >
              {lang === 'vi' ? activeFeature.summaryVi : activeFeature.summaryZh}
            </p>
            <Link
              href={activeFeature.href}
              className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
              style={{ color: 'var(--tx-0)' }}
            >
              <span>{t('Mở tính năng', '进入体验')}</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </aside>

        {/* Desktop Fixed Right Caption & Editorial Index (01..05) */}
        <aside className="hidden lg:flex fixed right-10 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-5">
          <div className="flex items-center gap-4">
            <span
              className="text-[13px] tracking-[0.04em] whitespace-nowrap"
              style={{ color: 'var(--tx-2)' }}
            >
              {lang === 'vi' ? activeFeature.rightCaptionVi : activeFeature.rightCaptionZh}
            </span>
            <span
              className="font-mono-tabular text-[13px] tracking-[0.06em]"
              style={{ color: 'var(--tx-3)' }}
            >
              {activeFeature.index}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollToFeature(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label={t('Mục trước', '上一项')}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-opacity disabled:opacity-25 hover:opacity-75"
              style={{ border: '1px solid var(--bdr)', color: 'var(--tx-1)' }}
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollToFeature(activeIndex + 1)}
              disabled={activeIndex === GALLERY_FEATURES.length - 1}
              aria-label={t('Mục tiếp theo', '下一项')}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-opacity disabled:opacity-25 hover:opacity-75"
              style={{ border: '1px solid var(--bdr)', color: 'var(--tx-1)' }}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </aside>

        {/* Mobile / Tablet Quick Horizontal Feature Selector */}
        <div
          className="lg:hidden sticky top-16 z-30 -mx-6 px-6 py-3 flex items-center gap-4 overflow-x-auto"
          style={{
            background: 'color-mix(in srgb, var(--bg-0) 94%, transparent)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--bdr)',
          }}
        >
          {GALLERY_FEATURES.map((feat, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={feat.id}
                type="button"
                onClick={() => scrollToFeature(idx)}
                className="text-[12.5px] whitespace-nowrap shrink-0 transition-colors"
                style={{
                  color: isActive ? 'var(--tx-0)' : 'var(--tx-3)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span className="font-mono-tabular mr-1 opacity-60">{feat.index}</span>
                {lang === 'vi' ? feat.titleVi : feat.titleZh}
              </button>
            );
          })}
        </div>

        {/* Center Vertical Exhibition Stream */}
        <div className="flex flex-col items-center pt-10 pb-28 lg:pt-[14vh] lg:pb-[22vh]">
          {GALLERY_FEATURES.map((feat, idx) => {
            const isActive = idx === activeIndex;
            return (
              <section
                key={feat.id}
                ref={(el) => { itemRefs.current[idx] = el; }}
                data-gallery-index={idx}
                className="flex flex-col items-center justify-center py-10 lg:py-0 lg:min-h-[64vh] w-full"
              >
                <Link
                  href={feat.href}
                  aria-label={`${feat.titleVi} — ${feat.titleZh}`}
                  className="group relative block w-[min(390px,84vw)] sm:w-[410px] aspect-square overflow-hidden transition-all duration-300"
                  style={{
                    opacity: isActive ? 1 : 0.42,
                    transform: isActive ? 'scale(1)' : 'scale(0.92)',
                    background: 'var(--bg-1)',
                    border: '1px solid var(--bdr)',
                  }}
                >
                  <img
                    src={feat.image}
                    alt={`${feat.titleVi} (${feat.titleZh})`}
                    referrerPolicy="no-referrer"
                    className={`h-full w-full object-cover transition-transform duration-500 ease-out ${
                      feat.cropFrame
                        ? 'scale-[1.32] group-hover:scale-[1.37]'
                        : 'scale-[1.04] group-hover:scale-[1.09]'
                    }`}
                  />
                  {/* Subtle hover reveal bar at bottom of square artwork */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      background: 'linear-gradient(to top, rgba(10,10,10,0.72), transparent)',
                      color: '#FFFFFF',
                    }}
                  >
                    <span className="text-[12.5px] font-medium tracking-wide">
                      {lang === 'vi' ? feat.titleVi : feat.titleZh}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11.5px] opacity-90">
                      {t('Mở', '进入')} <ArrowUpRight size={13} />
                    </span>
                  </div>
                </Link>

                {/* Mobile & Tablet editorial caption under artwork */}
                <div className="mt-5 w-[min(390px,84vw)] sm:w-[410px] lg:hidden">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-[16px] font-semibold" style={{ color: 'var(--tx-0)' }}>
                      {lang === 'vi' ? feat.titleVi : feat.titleZh}
                    </h2>
                    <span className="font-mono-tabular text-[12px]" style={{ color: 'var(--tx-3)' }}>
                      {feat.index}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px]" style={{ color: 'var(--tx-2)' }}>
                    {lang === 'vi' ? feat.disciplineVi : feat.disciplineZh}
                  </p>
                  <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: 'var(--tx-3)' }}>
                    {lang === 'vi' ? feat.summaryVi : feat.summaryZh}
                  </p>
                  <Link
                    href={feat.href}
                    className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium"
                    style={{ color: 'var(--tx-0)' }}
                  >
                    <span>{t('Khám phá ngay', '进入体验')}</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Quiet Gallery Footer (matching Ouranic bottom strip) */}
      <footer
        className="w-full py-5 px-6 md:px-10"
        style={{ borderTop: '1px solid var(--bdr)', background: 'var(--bg-0)' }}
      >
        <div className="mx-auto flex max-w-[1440px] flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px]" style={{ color: 'var(--tx-3)' }}>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/chart" className="hover:opacity-70 transition-opacity">
              {t('Tử Vi Mệnh Bàn', '紫微命盘')}
            </Link>
            <Link href="/heming" className="hover:opacity-70 transition-opacity">
              {t('Hợp Bàn', '合盘分析')}
            </Link>
            <Link href="/xiaoliuren" className="hover:opacity-70 transition-opacity">
              {t('Tiểu Lục Nhâm', '小六壬')}
            </Link>
            <Link href="/shuangzi" className="hover:opacity-70 transition-opacity">
              {t('Mệnh Lý Song Tử', '命理学双子')}
            </Link>
            <Link href="/sanji" className="hover:opacity-70 transition-opacity">
              {t('Tam Kỷ', '三纪')}
            </Link>
            <Link href="/library" className="hover:opacity-70 transition-opacity">
              {t('Cổ Thư Nguyên Điển', '古籍原典')}
            </Link>
            <Link href="/terms" className="hover:opacity-70 transition-opacity">
              {t('Điều khoản', '免责声明')}
            </Link>
            <Link href="/privacy" className="hover:opacity-70 transition-opacity">
              {t('Quyền riêng tư', '隐私')}
            </Link>
          </div>
          <div className="whitespace-nowrap">
            © 2026 Nirvaner™ · {t('Hệ thống Tử Vi & Tam Kỷ', '紫微斗数 · 三纪')}
          </div>
        </div>
      </footer>
    </div>
  );
}
