'use client';
import { useState, useCallback, useRef } from 'react';
import BirthForm, { type BirthFormState } from '@/components/BirthForm';
import { formToBirthInfo } from '@/lib/ziwei/share';
import { generateChart as buildChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';
import { useTheme } from '@/components/ThemeProvider';
import { BRANCHES, STEMS } from '@/lib/ziwei/constants';
import SiteHeader from '@/components/SiteHeader';
import ChartBoard from '@/components/ChartBoard';
import { useAppPreferences } from '@/components/AppPreferencesProvider';
import { Sparkles, Send } from 'lucide-react';

// ─── AiContent Renderer ────────────────
function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n');
  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, i) => {
        const sectionMatch = line.match(/^\*\*【(.+?)】\*\*$/);
        if (sectionMatch) {
          return (
            <div key={i} style={{ paddingTop: i === 0 ? 0 : '16px', paddingBottom: '4px' }}>
              <span className="text-[13px] font-semibold tracking-wider" style={{ color: 'var(--ac)' }}>
                【{sectionMatch[1]}】
              </span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        const parts = line.split(/\*\*(.+?)\*\*/);
        return (
          <div key={i} className="text-[13.5px] leading-relaxed" style={{ color: 'var(--tx-2)' }}>
            {parts.map((part, j) =>
              j % 2 === 0
                ? part
                : <strong key={j} style={{ fontWeight: 600, color: 'var(--tx-0)' }}>{part}</strong>,
            )}
          </div>
        );
      })}
      {streaming && (
        <span
          className="inline-block w-1.5 h-3.5 rounded-sm align-middle ml-1 animate-pulse"
          style={{ background: 'var(--ac)', opacity: 0.6 }}
        />
      )}
    </div>
  );
}

const SAMPLE_COUPLE: { a: Partial<BirthFormState>; b: Partial<BirthFormState> } = {
  a: {
    name: 'Minh Quân',
    year: '1993',
    month: '5',
    day: '18',
    clockHour: '9',
    clockMinute: '30',
    unknownTime: false,
    province: '北京',
    city: '北京',
    longitude: 116.4,
    gender: 'male',
  },
  b: {
    name: 'Ngọc Lan',
    year: '1995',
    month: '10',
    day: '8',
    clockHour: '15',
    clockMinute: '15',
    unknownTime: false,
    province: '上海',
    city: '上海',
    longitude: 121.47,
    gender: 'female',
  },
};

export default function HemingPage() {
  const { theme } = useTheme();
  const { t } = useAppPreferences();
  const isDark = theme === 'dark';

  // ─── 双方命盘状态 ─────────────────────────────────────────
  const [chartA, setChartA] = useState<ZiweiChart | null>(null);
  const [chartB, setChartB] = useState<ZiweiChart | null>(null);
  const [formA, setFormA] = useState<BirthFormState | null>(null);
  const [formB, setFormB] = useState<BirthFormState | null>(null);
  const [presetKey, setPresetKey] = useState(0);
  const [presetData, setPresetData] = useState<typeof SAMPLE_COUPLE | null>(null);

  // ─── AI 合盘分析状态 ─────────────────────────────────────
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [question, setQuestion] = useState('');
  const [analysisError, setAnalysisError] = useState(false);
  const [apiMissing, setApiMissing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [inspectTab, setInspectTab] = useState<'reading' | 'chartA' | 'chartB'>('reading');
  const analysisRef = useRef<HTMLDivElement>(null);

  const generateChart = useCallback(async (info: BirthInfo): Promise<ZiweiChart | null> => {
    try {
      return buildChart(info);
    } catch {
      return null;
    }
  }, []);

  // 表单是否填齐
  const isFormReady = (f: BirthFormState | null): boolean =>
    !!(f && f.year && f.month && f.day && f.gender && (f.unknownTime || (f.clockHour !== '' && f.clockMinute !== '')));

  // ─── 统一入口：起盘 + 合盘分析 ─────────────────────────────
  const runAnalysis = useCallback(async (q?: string) => {
    setFormError(null);
    if (!isFormReady(formA) || !isFormReady(formB)) {
      setFormError('请先填写双方完整出生信息');
      return;
    }
    setAnalyzing(true);
    setAnalysis('');
    setAnalysisError(false);

    try {
      // 每次按当前表单起盘，避免编辑出生信息后复用旧盘。
      const [cA, cB] = await Promise.all([
        generateChart(formToBirthInfo(formA!)),
        generateChart(formToBirthInfo(formB!)),
      ]);
      if (!cA || !cB) {
        setAnalysisError(true);
        setAnalyzing(false);
        return;
      }
      setChartA(cA);
      setChartB(cB);

      const activeLang = typeof window !== 'undefined' && (window.localStorage.getItem('nirvaner-lang') ?? window.localStorage.getItem('ouranic-lang')) === 'zh' ? 'zh' : 'vi';
      const res = await fetch('/api/heming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartA: cA, chartB: cB, question: q ?? undefined, lang: activeLang }),
      });
      if (res.status === 404) { setApiMissing(true); throw new Error('api-missing'); }
      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      let pendingLine = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        pendingLine += decoder.decode(value, { stream: true });
        const lines = pendingLine.split('\n');
        pendingLine = lines.pop() ?? '';
        for (const rawLine of lines) {
          const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const delta = JSON.parse(data).delta?.text ?? '';
            text += delta;
            setAnalysis(text);
          } catch { /* skip */ }
        }
      }
      // scroll to analysis
      setTimeout(() => analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch {
      setAnalysisError(true);
    } finally {
      setAnalyzing(false);
    }
  }, [formA, formB, generateChart]);

  const cardStyle = {
    background: 'var(--bg-card)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,10,0.09)'}`,
    borderRadius: '14px',
    padding: '24px',
  };

  const applySample = () => {
    setPresetData(SAMPLE_COUPLE);
    setPresetKey((k) => k + 1);
  };

  const renderChartBadgeSummary = (chart: ZiweiChart, label: string) => {
    const ming = chart.palaces.find((p) => p.branch === chart.mingGongBranch);
    const fuqi = chart.palaces.find((p) => p.name.includes('夫妻'));
    const mingStars = ming?.stars.filter((s) => s.type === 'major').map((s) => s.name).join(' · ') || '空宫';
    const fqStars = fuqi?.stars.filter((s) => s.type === 'major').map((s) => s.name).join(' · ') || '空宫';
    return (
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] tracking-[0.16em]" style={{ color: 'var(--tx-3)' }}>
            {label}
          </span>
          <span className="text-[12px] font-medium" style={{ color: 'var(--ac)' }}>
            {chart.wuxingJuName}
          </span>
        </div>
        <div className="text-[16px] font-semibold mb-2" style={{ color: 'var(--tx-0)' }}>
          {chart.birthInfo.name || label}
          <span className="ml-2 text-[12px] font-normal" style={{ color: 'var(--tx-3)' }}>
            {chart.yinYangGender}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[12.5px] pt-3" style={{ borderTop: '1px solid var(--bdr)' }}>
          <div>
            <div className="text-[11px]" style={{ color: 'var(--tx-3)' }}>{t('Cung Mệnh', '命宫')}</div>
            <div className="font-medium mt-0.5" style={{ color: 'var(--tx-0)' }}>
              {ming ? `${STEMS[ming.stem]}${BRANCHES[ming.branch]}` : ''} · {mingStars}
            </div>
          </div>
          <div>
            <div className="text-[11px]" style={{ color: 'var(--tx-3)' }}>{t('Cung Phu Thê', '夫妻宫')}</div>
            <div className="font-medium mt-0.5" style={{ color: 'var(--tx-0)' }}>
              {fuqi ? `${STEMS[fuqi.stem]}${BRANCHES[fuqi.branch]}` : ''} · {fqStars}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-0)' }}>
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-[1160px] px-6 py-10 md:py-14">
        {/* Editorial Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <div>
            <p className="text-[12px] tracking-[0.18em] mb-2" style={{ color: 'var(--tx-3)' }}>
              02 · {t('SONG BÀN HỢP THAM · TÌNH CẢM · HỢP TÁC · GIA ĐẠO', '双盘合参 · 感情 · 合伙 · 亲子')}
            </p>
            <h1 className="font-editorial text-[28px] md:text-[34px] font-semibold tracking-tight" style={{ color: 'var(--tx-0)' }}>
              {t('Hợp Bàn Tử Vi Phân Tích', '紫微合盘分析')}
            </h1>
            <p className="mt-2 text-[13.5px] max-w-2xl" style={{ color: 'var(--tx-2)' }}>
              {t(
                'Nhập ngày giờ sinh của hai người để lập đồng thời hai lá số, đối chiếu cung Mệnh, cung Phu Thê, Tam Phương tương ứng và chu kỳ Đại Hạn.',
                '输入两个人的出生信息，系统即时生成双盘并对照双方命宫、夫妻宫星曜呼应与相处节奏。',
              )}
            </p>
          </div>
          <button type="button" onClick={applySample} className="btn-ghost self-start md:self-auto">
            <Sparkles size={14} />
            <span>{t('Điền cặp đôi mẫu', '填入示例生辰')}</span>
          </button>
        </div>

        {/* Dual BirthForm Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div style={cardStyle}>
            <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid var(--bdr)' }}>
              <span className="text-[13px] font-semibold" style={{ color: 'var(--tx-0)' }}>
                {t('Người thứ nhất (Giáp)', '甲方出生信息')}
              </span>
              <span className="font-mono-tabular text-[11px]" style={{ color: 'var(--tx-3)' }}>A</span>
            </div>
            <BirthForm
              key={`a-${presetKey}`}
              initialData={presetData?.a}
              hideSubmit
              onFormSave={setFormA}
              onSubmit={() => {}}
            />
          </div>

          <div style={cardStyle}>
            <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid var(--bdr)' }}>
              <span className="text-[13px] font-semibold" style={{ color: 'var(--tx-0)' }}>
                {t('Người thứ hai (Ất)', '乙方出生信息')}
              </span>
              <span className="font-mono-tabular text-[11px]" style={{ color: 'var(--tx-3)' }}>B</span>
            </div>
            <BirthForm
              key={`b-${presetKey}`}
              initialData={presetData?.b}
              hideSubmit
              onFormSave={setFormB}
              onSubmit={() => {}}
            />
          </div>
        </div>

        {/* Unified Action Strip */}
        <div
          className="rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('Câu hỏi trọng tâm (tuỳ chọn), vd: Hợp làm ăn hay hôn nhân?', '想重点了解什么？（选填，如：适合结婚或长期合伙吗？）')}
            className="input-base flex-1"
          />
          <button
            type="button"
            disabled={analyzing}
            onClick={() => runAnalysis(question.trim() || undefined)}
            className="btn-primary py-2.5 px-6 shrink-0 disabled:opacity-50"
          >
            <Send size={14} />
            <span>{analyzing ? t('Đang phân tích…', '合盘推演中…') : t('Bắt đầu Hợp Bàn', '开始合盘分析')}</span>
          </button>
        </div>

        {formError && (
          <div className="mb-6 rounded-lg px-4 py-3 text-[13px]" style={{ background: 'rgba(180,35,24,0.08)', color: 'var(--ji)', border: '1px solid rgba(180,35,24,0.2)' }}>
            {formError}
          </div>
        )}

        {/* Dual Chart Summary & Streaming Analysis */}
        {(chartA && chartB) && (
          <div ref={analysisRef} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderChartBadgeSummary(chartA, t('LÁ SỐ GIÁP (A)', '甲方命盘'))}
              {renderChartBadgeSummary(chartB, t('LÁ SỐ ẤT (B)', '乙方命盘'))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'reading' as const, label: t('Luận giải Hợp Bàn', '双盘合参解读') },
                { key: 'chartA' as const, label: t('Xem lá số Giáp (A)', '查看甲方 12 宫') },
                { key: 'chartB' as const, label: t('Xem lá số Ất (B)', '查看乙方 12 宫') },
              ].map((item) => {
                const active = inspectTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setInspectTab(item.key)}
                    className="rounded-lg px-4 py-2 text-[12.5px] font-medium transition-colors"
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

            {inspectTab === 'reading' && (
              <div className="rounded-xl p-6 md:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}>
                <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: '1px solid var(--bdr)' }}>
                  <h2 className="font-editorial text-[18px] font-semibold" style={{ color: 'var(--tx-0)' }}>
                    {t('Luận giải Hợp Bàn Song Phương', '双盘合参解读')}
                  </h2>
                  <span className="text-[11.5px]" style={{ color: 'var(--tx-3)' }}>
                    {t('Hệ thống Nghê Hải Hạ · Cổ Thư', '倪海厦体系 · 古籍合参')}
                  </span>
                </div>

                {apiMissing ? (
                  <p className="text-[13.5px]" style={{ color: 'var(--tx-2)' }}>
                    {t('Không tìm thấy API /api/heming.', '未检测到 /api/heming 接口。')}
                  </p>
                ) : analysisError && !analysis ? (
                  <p className="text-[13.5px]" style={{ color: 'var(--ji)' }}>
                    {t('Phân tích thất bại, vui lòng thử lại.', '分析失败，请稍后重试。')}
                  </p>
                ) : (
                  <AiContent text={analysis} streaming={analyzing} />
                )}
              </div>
            )}

            {inspectTab === 'chartA' && (
              <div className="rounded-xl p-4 md:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}>
                <ChartBoard chart={chartA} />
              </div>
            )}

            {inspectTab === 'chartB' && (
              <div className="rounded-xl p-4 md:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}>
                <ChartBoard chart={chartB} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
