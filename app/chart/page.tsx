'use client';
import { useState, useEffect } from 'react';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import { generateChart, setBrightnessSchool } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart, Palace, Star } from '@/lib/ziwei/types';
import SiteHeader from '../../components/SiteHeader';
import StarDetailPanel from '../../components/StarDetailPanel';
import ShareModal from '../../components/ShareModal';
import { useAppPreferences } from '../../components/AppPreferencesProvider';
import {
  loadSchoolConfig,
  saveSchoolConfig,
  resetSchoolConfig,
  SCHOOL_DEFAULT_CONFIG,
  SCHOOL_OPTIONS,
  type SchoolConfig,
} from '../../lib/ziwei/school-config';
import { formToBirthInfo, searchParamsToForm } from '../../lib/ziwei/share';
import { ArrowLeft, SlidersHorizontal, Share2, RotateCcw, Clock, Trash2, Sparkles, X } from 'lucide-react';

interface FamousPreset {
  id: string;
  name: string;
  category: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
  notable: string;
}

const FAMOUS_PRESETS: FamousPreset[] = [
  { id: 'ma-yun', name: '马云 · Jack Ma', category: '商业', year: 1964, month: 9, day: 10, hour: 5, gender: 'male', notable: '官禄宫破格重建，开创互联网生态' },
  { id: 'li-jiacheng', name: '李嘉诚 · Li Ka-shing', category: '商业', year: 1928, month: 7, day: 29, hour: 3, gender: 'male', notable: '财帛四化与禄存守财经典案例' },
  { id: 'ren-zhengfei', name: '任正非 · Ren Zhengfei', category: '商业', year: 1944, month: 10, day: 25, hour: 3, gender: 'male', notable: '七杀入命，逆风越压越强' },
  { id: 'steve-jobs', name: '乔布斯 · Steve Jobs', category: '科技', year: 1955, month: 2, day: 24, hour: 10, gender: 'male', notable: '破军革新与完美主义设计美学' },
  { id: 'ni-haixia', name: '倪海厦 · Ni Haixia', category: '学术', year: 1954, month: 6, day: 15, hour: 5, gender: 'male', notable: '天纪、人纪、地纪传承体系宗师' },
  { id: 'zhang-ailing', name: '张爱玲 · Eileen Chang', category: '文艺', year: 1920, month: 9, day: 30, hour: 2, gender: 'female', notable: '文昌文曲才情与清冷孤高格局' },
];

interface HistoryRecord {
  id: string;
  name: string;
  mainStar: string;
  wuxingJu: string;
  birthInfo: BirthInfo;
  savedAt: number;
}

const CHART_HISTORY_KEY = 'nirvaner_chart_history_v1';

function loadHistory(): HistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CHART_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryRecord[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(birthInfo: BirthInfo, chart: ZiweiChart): void {
  if (typeof window === 'undefined') return;
  try {
    const ming = chart.palaces.find((p) => p.branch === chart.mingGongBranch);
    const mainStar = ming?.stars.filter((s) => s.type === 'major').map((s) => s.name).join('·') || '空宫';
    const nextRec: HistoryRecord = {
      id: `${Date.now()}`,
      name: birthInfo.name || '',
      mainStar,
      wuxingJu: chart.wuxingJuName,
      birthInfo,
      savedAt: Date.now(),
    };
    const existing = loadHistory().filter(
      (r) =>
        !(
          r.birthInfo.year === birthInfo.year &&
          r.birthInfo.month === birthInfo.month &&
          r.birthInfo.day === birthInfo.day &&
          r.birthInfo.hour === birthInfo.hour &&
          r.birthInfo.gender === birthInfo.gender
        ),
    );
    window.localStorage.setItem(CHART_HISTORY_KEY, JSON.stringify([nextRec, ...existing].slice(0, 10)));
  } catch {
    // ignore storage errors
  }
}

function deleteHistory(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = loadHistory().filter((r) => r.id !== id);
    window.localStorage.setItem(CHART_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

/**
 * 紫微命盘工作台 — giữ tương thích regression test `chart-demo-layout.test.tsx`
 * (hai useState đầu tiên là chart & selectedPalace; ChartBoard sở hữu duy nhất TimeNav).
 */
export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [selectedStar, setSelectedStar] = useState<{ star: Star; palaceName: string } | null>(null);
  const [selectedSiHua, setSelectedSiHua] = useState<{ starName: string; siHua: string; view: 'mingpan' | 'daxian' | 'liunian' } | null>(null);
  const [activeBirth, setActiveBirth] = useState<BirthInfo | null>(null);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(SCHOOL_DEFAULT_CONFIG);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const { edition, t } = useAppPreferences();

  const buildWithConfig = (info: BirthInfo, cfg: SchoolConfig): ZiweiChart => {
    setBrightnessSchool(cfg.brightnessSchool);
    return generateChart(info, { leapMonth: cfg.leapMonth });
  };

  const handleSubmit = (info: BirthInfo) => {
    const nextChart = buildWithConfig(info, schoolConfig);
    setActiveBirth(info);
    setChart(nextChart);
    setSelectedPalace(null);
    setSelectedStar(null);
    saveHistory(info, nextChart);
    setHistory(loadHistory());
  };

  const handleSelectFamous = (person: FamousPreset) => {
    const info: BirthInfo = {
      year: person.year,
      month: person.month,
      day: person.day,
      hour: person.hour,
      gender: person.gender,
      name: person.name,
    };
    handleSubmit(info);
  };

  const handleUpdateSchool = (patch: Partial<SchoolConfig>) => {
    const next = { ...schoolConfig, ...patch };
    setSchoolConfig(next);
    saveSchoolConfig(next);
    if (activeBirth) {
      const rebuilt = buildWithConfig(activeBirth, next);
      setChart(rebuilt);
      setSelectedPalace(null);
    }
  };

  const handleResetSchool = () => {
    resetSchoolConfig();
    setSchoolConfig(SCHOOL_DEFAULT_CONFIG);
    if (activeBirth) {
      setChart(buildWithConfig(activeBirth, SCHOOL_DEFAULT_CONFIG));
    }
  };

  // ── Chưa lập lá số: Studio nhập thông tin sinh ──
  if (!chart) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-0)' }}>
        <ClientStorageSync
          onHydrate={(cfg, hist, sharedInfo) => {
            setSchoolConfig(cfg);
            setHistory(hist);
            if (sharedInfo) {
              setBrightnessSchool(cfg.brightnessSchool);
              setActiveBirth(sharedInfo);
              setChart(generateChart(sharedInfo, { leapMonth: cfg.leapMonth }));
            }
          }}
        />
        <SiteHeader />

        <main className="flex-1 mx-auto w-full max-w-[1160px] px-6 py-10 md:py-14">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6" style={{ borderBottom: '1px solid var(--bdr)' }}>
            <div>
              <p className="text-[12px] tracking-[0.18em] mb-2" style={{ color: 'var(--tx-3)' }}>
                01 · {t('TỬ VI ĐẨU SỐ · HỆ THỐNG NGHÊ HẢI HẠ', '紫微斗数 · 倪海厦体系')}
              </p>
              <h1 className="font-editorial text-[28px] md:text-[34px] font-semibold tracking-tight" style={{ color: 'var(--tx-0)' }}>
                {t('Lập Lá Số Tử Vi Mệnh Bàn', '紫微斗数排盘')}
              </h1>
              <p className="mt-2 text-[13.5px] max-w-2xl" style={{ color: 'var(--tx-2)' }}>
                {t(
                  'Hỗ trợ hiệu chỉnh Giờ Mặt Trời Thực theo kinh độ, 10 tùy chọn lưu phái, tự động nhận diện cách cục cổ thư và luận giải Bản Mệnh · Đại Hạn · Lưu Niên.',
                  '输入出生年月日时，支持真太阳时校正、十类流派切换与本命/大限/流年四化推演。',
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSchoolOpen(true)}
              className="btn-ghost self-start md:self-auto"
            >
              <SlidersHorizontal size={14} />
              <span>{t('Cấu hình Lưu phái', '流派设置')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-10 items-start">
            {/* Main BirthForm */}
            <div
              className="rounded-xl p-6 md:p-8"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}
            >
              <BirthForm onSubmit={handleSubmit} />
            </div>

            {/* Right Editorial Rail: History + Famous Presets */}
            <aside className="space-y-8">
              {/* Recent History */}
              {history.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[12px] font-medium mb-3" style={{ color: 'var(--tx-2)' }}>
                    <Clock size={13} style={{ color: 'var(--ac)' }} />
                    <span>{t('Lá số gần đây', '最近命盘')}</span>
                  </div>
                  <div className="space-y-2">
                    {history.slice(0, 4).map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 transition-colors"
                        style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSubmit(rec.birthInfo)}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="text-[13px] font-medium truncate" style={{ color: 'var(--tx-0)' }}>
                            {rec.name || t('Không tên', '未命名')} · {rec.mainStar}
                          </div>
                          <div className="text-[11px] font-mono-tabular mt-0.5" style={{ color: 'var(--tx-3)' }}>
                            {rec.birthInfo.year}-{String(rec.birthInfo.month).padStart(2, '0')}-{String(rec.birthInfo.day).padStart(2, '0')} · {rec.wuxingJu}
                          </div>
                        </button>
                        <button
                          type="button"
                          aria-label={t('Xóa', '删除')}
                          onClick={() => {
                            deleteHistory(rec.id);
                            setHistory(loadHistory());
                          }}
                          className="p-1.5 rounded opacity-50 hover:opacity-100"
                          style={{ color: 'var(--tx-2)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Famous Chart Presets */}
              <div>
                <div className="flex items-center gap-2 text-[12px] font-medium mb-3" style={{ color: 'var(--tx-2)' }}>
                  <Sparkles size={13} style={{ color: 'var(--ac)' }} />
                  <span>{t('Lá số Danh nhân mẫu (1 chạm)', '名人命盘示例')}</span>
                </div>
                <div className="divide-y rounded-xl overflow-hidden" style={{ border: '1px solid var(--bdr)', background: 'var(--bg-card)' }}>
                  {FAMOUS_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectFamous(p)}
                      className="w-full px-4 py-3 text-left transition-colors hover:opacity-80 flex items-center justify-between gap-3"
                      style={{ borderColor: 'var(--bdr)' }}
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium truncate" style={{ color: 'var(--tx-0)' }}>
                          {p.name}
                          <span className="ml-2 text-[11px] font-normal" style={{ color: 'var(--tx-3)' }}>
                            {p.category}
                          </span>
                        </div>
                        <div className="text-[11.5px] truncate mt-0.5" style={{ color: 'var(--tx-3)' }}>
                          {p.notable}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono-tabular shrink-0" style={{ color: 'var(--tx-3)' }}>
                        {p.year}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* School Settings Drawer */}
        {schoolOpen && (
          <SchoolSettingsDrawer
            config={schoolConfig}
            onUpdate={handleUpdateSchool}
            onReset={handleResetSchool}
            onClose={() => setSchoolOpen(false)}
          />
        )}
      </div>
    );
  }

  // ── Đã lập lá số: Không gian làm việc 12 cung + Luận giải ──
  const mingPalace = chart.palaces.find((p) => p.branch === chart.mingGongBranch);
  const mingMainStars = mingPalace?.stars.filter((s) => s.type === 'major').map((s) => s.name).join(' · ') || '空宫';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-0)' }}>
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-[1360px] px-4 sm:px-6 py-6">
        {/* Clean Editorial Chart Toolbar */}
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-3 pb-4"
          style={{ borderBottom: '1px solid var(--bdr)' }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => { setChart(null); setSelectedPalace(null); setSelectedStar(null); }}
              className="btn-ghost py-1.5 px-3 text-[12.5px]"
            >
              <ArrowLeft size={13} />
              <span>{t('Lập lá mới', '重新起盘')}</span>
            </button>

            <div className="h-4 w-px hidden sm:block" style={{ background: 'var(--bdr-med)' }} />

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]" style={{ color: 'var(--tx-2)' }}>
              {chart.birthInfo.name && (
                <strong style={{ color: 'var(--tx-0)' }}>{chart.birthInfo.name}</strong>
              )}
              <span>{chart.yinYangGender}</span>
              <span aria-hidden="true">·</span>
              <span style={{ color: 'var(--ac)', fontWeight: 500 }}>{chart.wuxingJuName}</span>
              <span aria-hidden="true">·</span>
              <span>{t('Mệnh', '命宫')} {mingMainStars}</span>
              {chart.lunarInfo.fourPillars && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular text-[12px]" style={{ color: 'var(--tx-3)' }}>
                    {chart.lunarInfo.fourPillars.join(' ')}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(edition === 'pro' || true) && (
              <button
                type="button"
                onClick={() => setSchoolOpen(true)}
                className="btn-ghost py-1.5 px-3 text-[12px]"
              >
                <SlidersHorizontal size={13} />
                <span>{t('Lưu phái', '流派')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="btn-primary py-1.5 px-3.5 text-[12px]"
            >
              <Share2 size={13} />
              <span>{t('Chia sẻ / Xuất ảnh', '分享命盘')}</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Workspace (ChartBoard + InsightPanel) */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,410px)]"
          style={{ gap: 20, alignItems: 'start' }}
        >
          <div className="min-w-0">
            <ChartBoard
              chart={chart}
              onPalaceSelect={setSelectedPalace}
              onStarSelect={(star, palace) => setSelectedStar({ star, palaceName: palace.name })}
              onSiHuaClick={(starName, siHua, view) => setSelectedSiHua({ starName, siHua, view })}
            />
            <p className="mt-2.5 text-[11.5px]" style={{ color: 'var(--tx-3)' }}>
              {t(
                'Mẹo: Nhấp vào từng cung để chiếu Tam Phương Tứ Chính và xem luận giải cung; nhấp vào tên Chính Tinh để mở chi tiết học thuyết Nghê Hải Hạ.',
                '提示：点击任意宫位高亮三方四正并解读该宫；点击主星名称可展开星曜详析面板。',
              )}
            </p>
          </div>

          <InsightPanel
            key={`${chart.birthInfo.year}-${chart.birthInfo.month}-${chart.birthInfo.day}-${chart.birthInfo.hour}-${chart.birthInfo.gender}-${schoolConfig.brightnessSchool}-${schoolConfig.leapMonth}`}
            chart={chart}
            selectedPalace={selectedPalace}
            selectedSiHua={selectedSiHua}
          />
        </div>
      </main>

      {/* Star Detail Slide-Over Panel */}
      <StarDetailPanel
        star={selectedStar?.star ?? null}
        palaceName={selectedStar?.palaceName}
        onClose={() => setSelectedStar(null)}
      />

      {/* Share & Export Modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
        chart={chart}
        birth={{
          year: String(chart.birthInfo.origInput?.year ?? chart.birthInfo.year),
          month: String(chart.birthInfo.origInput?.month ?? chart.birthInfo.month),
          day: String(chart.birthInfo.origInput?.day ?? chart.birthInfo.day),
          hour: String(chart.birthInfo.origInput?.clockHour ?? chart.birthInfo.hour),
          minute: String(chart.birthInfo.origInput?.clockMinute ?? 0),
          gender: chart.birthInfo.gender,
          city: chart.birthInfo.city,
        }}
        highlight={`${chart.wuxingJuName} · 命宫 ${mingMainStars}`}
      />

      {/* School Settings Drawer */}
      {schoolOpen && (
        <SchoolSettingsDrawer
          config={schoolConfig}
          onUpdate={handleUpdateSchool}
          onReset={handleResetSchool}
          onClose={() => setSchoolOpen(false)}
        />
      )}
    </div>
  );
}

function ClientStorageSync({
  onHydrate,
}: {
  onHydrate: (cfg: SchoolConfig, hist: HistoryRecord[], sharedInfo: BirthInfo | null) => void;
}) {
  useEffect(() => {
    const cfg = loadSchoolConfig();
    const hist = loadHistory();
    let sharedInfo: BirthInfo | null = null;
    if (typeof window !== 'undefined' && window.location.search) {
      const parsed = searchParamsToForm(new URLSearchParams(window.location.search));
      if (parsed && parsed.year && parsed.month && parsed.day) {
        sharedInfo = formToBirthInfo({
          name: parsed.name ?? '',
          year: parsed.year,
          month: parsed.month,
          day: parsed.day,
          clockHour: parsed.clockHour ?? '8',
          clockMinute: parsed.clockMinute ?? '0',
          unknownTime: parsed.unknownTime ?? false,
          province: parsed.province ?? '',
          city: parsed.city ?? '',
          longitude: parsed.longitude ?? 120,
          gender: parsed.gender ?? 'male',
        });
      }
    }
    onHydrate(cfg, hist, sharedInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function SchoolSettingsDrawer({
  config,
  onUpdate,
  onReset,
  onClose,
}: {
  config: SchoolConfig;
  onUpdate: (patch: Partial<SchoolConfig>) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const { t } = useAppPreferences();
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(10,10,10,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full overflow-y-auto p-6 flex flex-col gap-6"
        style={{ background: 'var(--bg-0)', borderLeft: '1px solid var(--bdr-med)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: 'var(--tx-0)' }}>
              {t('Cấu hình Lưu phái An sao', '排盘流派配置')}
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--tx-3)' }}>
              {t('Áp dụng ngay lập tức khi thay đổi', '修改后即时重新排盘')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Đóng', '关闭')}
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ border: '1px solid var(--bdr)', color: 'var(--tx-1)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Brightness School */}
        <div>
          <div className="text-[12.5px] font-medium mb-2.5" style={{ color: 'var(--tx-0)' }}>
            {t('Bảng Miếu Vượng Chính Tinh', '星曜亮度表')}
          </div>
          <div className="space-y-2">
            {SCHOOL_OPTIONS.brightnessSchool.map((opt) => {
              const active = config.brightnessSchool === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdate({ brightnessSchool: opt.value as SchoolConfig['brightnessSchool'] })}
                  className="w-full rounded-lg px-3.5 py-2.5 text-left transition-colors"
                  style={{
                    background: active ? 'var(--ac-bg)' : 'var(--bg-1)',
                    border: `1px solid ${active ? 'var(--ac-bdr)' : 'var(--bdr)'}`,
                  }}
                >
                  <div className="text-[13px] font-medium" style={{ color: active ? 'var(--ac)' : 'var(--tx-0)' }}>
                    {opt.label}
                  </div>
                  {opt.desc && (
                    <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--tx-3)' }}>
                      {opt.desc}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Leap Month Policy */}
        <div>
          <div className="text-[12.5px] font-medium mb-2.5" style={{ color: 'var(--tx-0)' }}>
            {t('Quy tắc Tháng Nhuận', '闰月归属口径')}
          </div>
          <div className="space-y-2">
            {SCHOOL_OPTIONS.leapMonth.map((opt) => {
              const active = config.leapMonth === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdate({ leapMonth: opt.value as SchoolConfig['leapMonth'] })}
                  className="w-full rounded-lg px-3.5 py-2.5 text-left transition-colors"
                  style={{
                    background: active ? 'var(--ac-bg)' : 'var(--bg-1)',
                    border: `1px solid ${active ? 'var(--ac-bdr)' : 'var(--bdr)'}`,
                  }}
                >
                  <div className="text-[13px] font-medium" style={{ color: active ? 'var(--ac)' : 'var(--tx-0)' }}>
                    {opt.label}
                  </div>
                  {opt.desc && (
                    <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--tx-3)' }}>
                      {opt.desc}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--bdr)' }}>
          <button type="button" onClick={onReset} className="btn-ghost text-[12px] py-2 px-3">
            <RotateCcw size={13} />
            <span>{t('Khôi phục mặc định', '重置默认')}</span>
          </button>
          <button type="button" onClick={onClose} className="btn-primary text-[12px] py-2 px-4">
            {t('Hoàn tất', '完成')}
          </button>
        </div>
      </div>
    </div>
  );
}
