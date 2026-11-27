'use client';

import { useState, useMemo } from 'react';
import SiteHeader from '@/components/SiteHeader';
import { useAppPreferences } from '@/components/AppPreferencesProvider';
import { generateTrueSolarChart } from '@/lib/ziwei/chart-entry';
import { calculateTrueSolarTime } from '@/lib/ziwei/true-solar-time';
import { generateChart } from '@/lib/ziwei/algorithm';
import { BRANCHES, STEMS } from '@/lib/ziwei/constants';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { Globe, Users, Layers, ArrowRight } from 'lucide-react';

interface CityPreset {
  id: string;
  nameVi: string;
  nameZh: string;
  longitude: number;
  utcOffsetMinutes: number;
}

const CITY_PRESETS: CityPreset[] = [
  { id: 'shanghai', nameVi: 'Thượng Hải (UTC+8)', nameZh: '上海 (东经121.47°)', longitude: 121.47, utcOffsetMinutes: 480 },
  { id: 'beijing', nameVi: 'Bắc Kinh (UTC+8)', nameZh: '北京 (东经116.40°)', longitude: 116.40, utcOffsetMinutes: 480 },
  { id: 'chengdu', nameVi: 'Thành Đô (UTC+8)', nameZh: '成都 (东经104.07°)', longitude: 104.07, utcOffsetMinutes: 480 },
  { id: 'urumqi', nameVi: 'Urumqi (UTC+8)', nameZh: '乌鲁木齐 (东经87.62°)', longitude: 87.62, utcOffsetMinutes: 480 },
  { id: 'hanoi', nameVi: 'Hà Nội (UTC+7)', nameZh: '河内 (东经105.85°)', longitude: 105.85, utcOffsetMinutes: 420 },
  { id: 'hcm', nameVi: 'TP. Hồ Chí Minh (UTC+7)', nameZh: '胡志明市 (东经106.66°)', longitude: 106.66, utcOffsetMinutes: 420 },
  { id: 'tokyo', nameVi: 'Tokyo (UTC+9)', nameZh: '东京 (东经139.69°)', longitude: 139.69, utcOffsetMinutes: 540 },
  { id: 'newyork', nameVi: 'New York (UTC-5)', nameZh: '纽约 (西经74.01°)', longitude: -74.01, utcOffsetMinutes: -300 },
];

type CompareTab = 'longitude' | 'gender' | 'sancai';

export default function ShuangziPage() {
  const { lang, t } = useAppPreferences();
  const [tab, setTab] = useState<CompareTab>('longitude');

  // Shared birth moment
  const [year, setYear] = useState(1996);
  const [month, setMonth] = useState(11);
  const [day, setDay] = useState(3);
  const [clockHour, setClockHour] = useState(11);
  const [clockMinute, setClockMinute] = useState(5);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Two contrasting cities for Longitude Lab
  const [cityAId, setCityAId] = useState('shanghai');
  const [cityBId, setCityBId] = useState('chengdu');

  const cityA = CITY_PRESETS.find((c) => c.id === cityAId) ?? CITY_PRESETS[0];
  const cityB = CITY_PRESETS.find((c) => c.id === cityBId) ?? CITY_PRESETS[2];

  const longitudeResult = useMemo(() => {
    try {
      const solarA = calculateTrueSolarTime({
        year, month, day, clockHour, clockMinute,
        longitude: cityA.longitude,
        utcOffsetMinutes: cityA.utcOffsetMinutes,
      });
      const solarB = calculateTrueSolarTime({
        year, month, day, clockHour, clockMinute,
        longitude: cityB.longitude,
        utcOffsetMinutes: cityB.utcOffsetMinutes,
      });
      const chartA = generateTrueSolarChart(
        { year, month, day, hour: 0, gender, longitude: cityA.longitude, name: cityA.nameZh },
        { year, month, day, clockHour, clockMinute, utcOffsetMinutes: cityA.utcOffsetMinutes },
      );
      const chartB = generateTrueSolarChart(
        { year, month, day, hour: 0, gender, longitude: cityB.longitude, name: cityB.nameZh },
        { year, month, day, clockHour, clockMinute, utcOffsetMinutes: cityB.utcOffsetMinutes },
      );
      return { solarA, solarB, chartA, chartB, shifted: solarA.branch !== solarB.branch };
    } catch {
      return null;
    }
  }, [year, month, day, clockHour, clockMinute, gender, cityA, cityB]);

  const genderTwinResult = useMemo(() => {
    try {
      const branchIdx = clockHour === 23 ? 0 : Math.floor((clockHour + 1) / 2) % 12;
      const maleChart = generateChart({ year, month, day, hour: branchIdx, gender: 'male', name: t('Song sinh Nam', '男命') });
      const femaleChart = generateChart({ year, month, day, hour: branchIdx, gender: 'female', name: t('Song sinh Nữ', '女命') });
      return { maleChart, femaleChart };
    } catch {
      return null;
    }
  }, [year, month, day, clockHour, t]);

  const renderChartSnapshot = (chart: ZiweiChart, subtitle: string, accent?: boolean) => {
    const ming = chart.palaces.find((p) => p.branch === chart.mingGongBranch);
    const fuqi = chart.palaces.find((p) => p.name.includes('夫妻'));
    const guanlu = chart.palaces.find((p) => p.name.includes('官禄'));
    const caibo = chart.palaces.find((p) => p.name.includes('财帛'));
    const fmt = (p?: typeof ming) =>
      p?.stars.filter((s) => s.type === 'major').map((s) => `${s.name}${s.siHua ? `[${s.siHua}]` : ''}`).join(' · ') || '空宫';

    return (
      <div
        className="rounded-xl p-6 space-y-4"
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${accent ? 'var(--ac-bdr)' : 'var(--bdr-med)'}`,
        }}
      >
        <div className="flex items-start justify-between gap-2 pb-3" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <div>
            <div className="text-[11px] font-mono-tabular" style={{ color: 'var(--tx-3)' }}>{subtitle}</div>
            <div className="font-editorial text-[19px] font-semibold mt-0.5" style={{ color: 'var(--tx-0)' }}>
              {chart.wuxingJuName} · {chart.yinYangGender}
            </div>
          </div>
          <div className="text-right font-mono-tabular text-[12px]" style={{ color: 'var(--ac)' }}>
            {ming ? `${STEMS[ming.stem]}${BRANCHES[ming.branch]}` : ''} {t('Mệnh', '命')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[12.5px]">
          {[
            { k: t('Mệnh cung', '命宫'), v: fmt(ming) },
            { k: t('Tài bạch', '财帛宫'), v: fmt(caibo) },
            { k: t('Quan lộc', '官禄宫'), v: fmt(guanlu) },
            { k: t('Phu thê', '夫妻宫'), v: fmt(fuqi) },
          ].map((row) => (
            <div key={row.k} className="rounded-lg p-3" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}>
              <div className="text-[11px]" style={{ color: 'var(--tx-3)' }}>{row.k}</div>
              <div className="font-medium mt-0.5" style={{ color: 'var(--tx-0)' }}>{row.v}</div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div className="text-[11px] mb-2" style={{ color: 'var(--tx-3)' }}>
            {t('Lộ trình 6 Đại Hạn đầu tiên', '前六步大限走势')}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
            {chart.daXians.slice(0, 6).map((dx, i) => (
              <div key={i} className="rounded-md py-1.5 px-1" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}>
                <div className="text-[10px] font-mono-tabular" style={{ color: 'var(--tx-3)' }}>
                  {dx.startAge}–{dx.endAge}
                </div>
                <div className="text-[11.5px] font-medium mt-0.5 truncate" style={{ color: 'var(--tx-0)' }}>
                  {dx.palaceName.replace('宫', '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-0)' }}>
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-[1160px] px-6 py-10 md:py-14">
        {/* Header */}
        <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <p className="text-[12px] tracking-[0.18em] mb-2" style={{ color: 'var(--tx-3)' }}>
            04 · {t('ĐỒNG THẦN DỊ MỆNH · GIỜ MẶT TRỜI THỰC & TAM TÀI', '同辰异命 · 真太阳时与三才对照')}
          </p>
          <h1 className="font-editorial text-[28px] md:text-[34px] font-semibold tracking-tight" style={{ color: 'var(--tx-0)' }}>
            {t('Mệnh Lý Học Song Tử (命理学双子)', '命理学双子实验室')}
          </h1>
          <p className="mt-2 text-[13.5px] max-w-2xl" style={{ color: 'var(--tx-2)' }}>
            {t(
              'Kiểm chứng trực quan vì sao hai người sinh cùng giờ đồng hồ lại mang hai số phận khác nhau: từ sai lệch kinh độ mặt trời thực, thuận nghịch Âm Dương Đại Hạn đến Tam Tài Thiên–Địa–Nhân.',
              '直观验证「同年同月同日同时生为何不同命」：对比跨经度真太阳时切时辰、男女大限顺逆分化与倪师天地人三才体系。',
            )}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[
            { key: 'longitude' as const, icon: Globe, label: t('Kinh độ & Giờ Mặt Trời Thực', '跨经度真太阳时对比') },
            { key: 'gender' as const, icon: Users, label: t('Song sinh Nam / Nữ (Đại Hạn)', '龙凤胎男女大限顺逆') },
            { key: 'sancai' as const, icon: Layers, label: t('Tam Tài Thiên · Địa · Nhân', '倪师天地人三才观') },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors"
                style={{
                  background: active ? 'var(--tx-0)' : 'var(--bg-1)',
                  color: active ? 'var(--bg-0)' : 'var(--tx-2)',
                  border: `1px solid ${active ? 'var(--tx-0)' : 'var(--bdr)'}`,
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Shared Time Bar for Lab Tabs */}
        {tab !== 'sancai' && (
          <div className="rounded-xl p-5 mb-8 grid grid-cols-2 sm:grid-cols-6 gap-3" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}>
            <div>
              <label className="block text-[11px] mb-1" style={{ color: 'var(--tx-3)' }}>{t('Năm', '年份')}</label>
              <input type="number" min={1920} max={2030} value={year} onChange={(e) => setYear(Number(e.target.value) || 1996)} className="input-base font-mono-tabular py-2" />
            </div>
            <div>
              <label className="block text-[11px] mb-1" style={{ color: 'var(--tx-3)' }}>{t('Tháng', '月份')}</label>
              <input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Math.min(12, Math.max(1, Number(e.target.value) || 1)))} className="input-base font-mono-tabular py-2" />
            </div>
            <div>
              <label className="block text-[11px] mb-1" style={{ color: 'var(--tx-3)' }}>{t('Ngày', '日期')}</label>
              <input type="number" min={1} max={31} value={day} onChange={(e) => setDay(Math.min(31, Math.max(1, Number(e.target.value) || 1)))} className="input-base font-mono-tabular py-2" />
            </div>
            <div>
              <label className="block text-[11px] mb-1" style={{ color: 'var(--tx-3)' }}>{t('Giờ (0–23)', '钟表小时')}</label>
              <input type="number" min={0} max={23} value={clockHour} onChange={(e) => setClockHour(Math.min(23, Math.max(0, Number(e.target.value) || 0)))} className="input-base font-mono-tabular py-2" />
            </div>
            <div>
              <label className="block text-[11px] mb-1" style={{ color: 'var(--tx-3)' }}>{t('Phút (0–59)', '分钟')}</label>
              <input type="number" min={0} max={59} value={clockMinute} onChange={(e) => setClockMinute(Math.min(59, Math.max(0, Number(e.target.value) || 0)))} className="input-base font-mono-tabular py-2" />
            </div>
            <div>
              <label className="block text-[11px] mb-1" style={{ color: 'var(--tx-3)' }}>{t('Giới tính', '性别')}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                disabled={tab === 'gender'}
                className="input-base py-2 disabled:opacity-50"
              >
                <option value="male">{t('Nam', '男')}</option>
                <option value="female">{t('Nữ', '女')}</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 1: Longitude True Solar Time Comparison */}
        {tab === 'longitude' && longitudeResult && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr)' }}>
                <label className="block text-[11px] mb-1.5" style={{ color: 'var(--tx-3)' }}>{t('Địa điểm A', '出生地 A')}</label>
                <select value={cityAId} onChange={(e) => setCityAId(e.target.value)} className="input-base py-2 mb-3">
                  {CITY_PRESETS.map((c) => (
                    <option key={c.id} value={c.id}>{lang === 'vi' ? c.nameVi : c.nameZh}</option>
                  ))}
                </select>
                <div className="text-[12.5px] font-mono-tabular" style={{ color: 'var(--tx-2)' }}>
                  {t('Giờ Mặt Trời Thực', '真太阳时')}: <strong style={{ color: 'var(--tx-0)' }}>{String(longitudeResult.solarA.hour).padStart(2, '0')}:{String(longitudeResult.solarA.minute).padStart(2, '0')}</strong> ({BRANCHES[longitudeResult.solarA.branch]}时 · {longitudeResult.solarA.totalCorrectionMinutes >= 0 ? '+' : ''}{Math.round(longitudeResult.solarA.totalCorrectionMinutes)}m)
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr)' }}>
                <label className="block text-[11px] mb-1.5" style={{ color: 'var(--tx-3)' }}>{t('Địa điểm B', '出生地 B')}</label>
                <select value={cityBId} onChange={(e) => setCityBId(e.target.value)} className="input-base py-2 mb-3">
                  {CITY_PRESETS.map((c) => (
                    <option key={c.id} value={c.id}>{lang === 'vi' ? c.nameVi : c.nameZh}</option>
                  ))}
                </select>
                <div className="text-[12.5px] font-mono-tabular" style={{ color: 'var(--tx-2)' }}>
                  {t('Giờ Mặt Trời Thực', '真太阳时')}: <strong style={{ color: 'var(--tx-0)' }}>{String(longitudeResult.solarB.hour).padStart(2, '0')}:{String(longitudeResult.solarB.minute).padStart(2, '0')}</strong> ({BRANCHES[longitudeResult.solarB.branch]}时 · {longitudeResult.solarB.totalCorrectionMinutes >= 0 ? '+' : ''}{Math.round(longitudeResult.solarB.totalCorrectionMinutes)}m)
                </div>
              </div>
            </div>

            <div
              className="rounded-lg px-4 py-3 text-[13px] flex items-center gap-2"
              style={{
                background: longitudeResult.shifted ? 'var(--ac-bg)' : 'var(--bg-1)',
                border: `1px solid ${longitudeResult.shifted ? 'var(--ac-bdr)' : 'var(--bdr)'}`,
                color: longitudeResult.shifted ? 'var(--ac)' : 'var(--tx-2)',
              }}
            >
              <ArrowRight size={14} />
              <span>
                {longitudeResult.shifted
                  ? t(
                      `Phát hiện đổi Can Chi giờ sinh! Cùng đồng hồ ${String(clockHour).padStart(2, '0')}:${String(clockMinute).padStart(2, '0')} nhưng hai thành phố rơi vào hai giờ khác nhau (${BRANCHES[longitudeResult.solarA.branch]}时 vs ${BRANCHES[longitudeResult.solarB.branch]}时), tạo thành hai lá số hoàn toàn khác biệt.`,
                      `已发生跨时辰分化！同一钟表时间在两地分别落入 ${BRANCHES[longitudeResult.solarA.branch]}时 与 ${BRANCHES[longitudeResult.solarB.branch]}时，形成截然不同的两张命盘。`,
                    )
                  : t(
                      'Ở phút giờ này cả hai thành phố vẫn cùng Địa Chi giờ. Thử chỉnh giờ sát ranh giới giờ lẻ (vd: 11:05, 13:05, 23:10) để thấy sự phân tách lá số!',
                      '当前时刻两地仍处同一时辰。可尝试把钟表时间调到单数整点附近（如 11:05、13:05、23:10）观察跨时辰变盘。',
                    )}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderChartSnapshot(longitudeResult.chartA, `${lang === 'vi' ? cityA.nameVi : cityA.nameZh} · ${BRANCHES[longitudeResult.solarA.branch]}时`, longitudeResult.shifted)}
              {renderChartSnapshot(longitudeResult.chartB, `${lang === 'vi' ? cityB.nameVi : cityB.nameZh} · ${BRANCHES[longitudeResult.solarB.branch]}时`, longitudeResult.shifted)}
            </div>
          </div>
        )}

        {/* TAB 2: Male vs Female Twin */}
        {tab === 'gender' && genderTwinResult && (
          <div className="space-y-6">
            <div className="rounded-lg px-4 py-3 text-[13px]" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)', color: 'var(--tx-2)' }}>
              {t(
                'Song sinh long phụng cùng phút sinh có 12 cung bản mệnh giống hệt nhau, nhưng quy tắc Dương Nam Âm Nữ thuận hành — Âm Nam Dương Nữ nghịch hành khiến quỹ đạo 10 năm Đại Hạn đi ngược chiều hoàn toàn.',
                '龙凤胎同盘同宫，但因「阳男阴女顺行、阴男阳女逆行」，人生每十年大限的行运顺序截然相反。',
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderChartSnapshot(genderTwinResult.maleChart, t('Song sinh Nam · Đại Hạn', '男命 · 大限轨迹'), true)}
              {renderChartSnapshot(genderTwinResult.femaleChart, t('Song sinh Nữ · Đại Hạn', '女命 · 大限轨迹'), true)}
            </div>
          </div>
        )}

        {/* TAB 3: Ni Haixia's Tian-Di-Ren Framework */}
        {tab === 'sancai' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                index: '1 / 3',
                title: t('Thiên · Tiên Thiên Mệnh Bàn', '天 · 先天命盘'),
                desc: t(
                  'Tử Vi Đẩu Số giải mã khí chất, tài năng và nhịp thời vận 10 năm của từng người. Cùng một lá số là cùng xuất phát điểm, không phải kịch bản bất biến.',
                  '紫微斗数揭示先天格局、星性禀赋与大限节奏。同盘代表起点相近，却并非注定一模一样的人生剧本。',
                ),
              },
              {
                index: '1 / 3',
                title: t('Địa · Dương Trạch & Phương Vị', '地 · 阳宅地理位置'),
                desc: t(
                  'Trong Thiên Kỷ, thầy Nghê luôn đối chiếu lá số song song với vị trí nhà ở (Hậu Thiên Bát Quái). Hai anh em sinh đôi sống ở hai hướng phòng khác nhau sẽ kích hoạt cung vị khác nhau.',
                  '倪师强调「天文地理合参」：双胞胎即便命盘相同，若居住方位与阳宅格局不同，吉凶应期与成就领域亦随之分化。',
                ),
              },
              {
                index: '1 / 3',
                title: t('Nhân · Lựa Chọn & Tu Dưỡng', '人 · 后天人事努力'),
                desc: t(
                  'Địa + Nhân chiếm tới 2/3 (> 1/3 Thiên). Nhận thức rõ điểm mạnh – điểm yếu của lá số giúp chủ động chọn nghề, chọn môi trường và hóa giải hạn xấu.',
                  '地理加人事占三分之二，远大于先天命盘的三分之一。知命是为了借势趋吉、主动抉择，而非宿命盲从。',
                ),
              },
            ].map((card) => (
              <div key={card.title} className="rounded-xl p-6 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}>
                <div className="font-mono-tabular text-[12px]" style={{ color: 'var(--ac)' }}>{card.index}</div>
                <h2 className="font-editorial text-[20px] font-semibold" style={{ color: 'var(--tx-0)' }}>{card.title}</h2>
                <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--tx-2)' }}>{card.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
