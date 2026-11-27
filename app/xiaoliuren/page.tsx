'use client';

import { useState, useEffect } from 'react';
import SiteHeader from '@/components/SiteHeader';
import { useAppPreferences } from '@/components/AppPreferencesProvider';
import {
  XIAOLIUREN_PALACES,
  calculateXiaoLiuRen,
  getCurrentLunarXiaoLiuRenInput,
  type XiaoLiuRenResult,
} from '@/lib/ziwei/xiaoliuren';
import { RefreshCw, Compass, Hash, Clock } from 'lucide-react';

type DivinationMode = 'now' | 'numbers';

// Traditional 6-palace visual arrangement on hand (2 rows × 3 columns)
// Top row: 留连 (1), 速喜 (2), 赤口 (3)
// Bottom row: 大安 (0), 空亡 (5), 小吉 (4)
const GRID_ORDER = [1, 2, 3, 0, 5, 4];

export default function XiaoLiuRenPage() {
  const { lang, t } = useAppPreferences();
  const [mode, setMode] = useState<DivinationMode>('now');
  const [question, setQuestion] = useState('');
  const [num1, setNum1] = useState('3');
  const [num2, setNum2] = useState('7');
  const [num3, setNum3] = useState('9');
  const [result, setResult] = useState<XiaoLiuRenResult | null>(null);

  const castByNow = () => {
    const cur = getCurrentLunarXiaoLiuRenInput(new Date());
    setResult(
      calculateXiaoLiuRen(
        cur.lunarMonth,
        cur.lunarDay,
        cur.shichenNum,
        lang === 'vi' ? cur.labelVi : cur.labelZh,
      ),
    );
  };

  useEffect(() => {
    castByNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const castByNumbers = () => {
    const a = parseInt(num1, 10) || 1;
    const b = parseInt(num2, 10) || 1;
    const c = parseInt(num3, 10) || 1;
    setResult(
      calculateXiaoLiuRen(
        a,
        b,
        c,
        t(`Báo số: ${a} · ${b} · ${c}`, `报数起课：${a} · ${b} · ${c}`),
      ),
    );
  };

  const castRandomNumbers = () => {
    const r = () => Math.floor(Math.random() * 99) + 1;
    const a = r();
    const b = r();
    const c = r();
    setNum1(String(a));
    setNum2(String(b));
    setNum3(String(c));
    setResult(
      calculateXiaoLiuRen(
        a,
        b,
        c,
        t(`Ngẫu số: ${a} · ${b} · ${c}`, `随机三数：${a} · ${b} · ${c}`),
      ),
    );
  };

  const final = result?.finalPalace;
  const verdictColor =
    final?.level === 'good'
      ? 'var(--lu)'
      : final?.level === 'caution'
      ? 'var(--ji)'
      : 'var(--ac)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-0)' }}>
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-[1120px] px-6 py-10 md:py-14">
        {/* Editorial Header */}
        <div className="mb-10 pb-6" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <p className="text-[12px] tracking-[0.18em] mb-2" style={{ color: 'var(--tx-3)' }}>
            03 · {t('CHƯỞNG TRUNG LỤC THẦN · CHIÊM ĐOÁN TỨC THỜI', '掌中六神 · 即时占断')}
          </p>
          <h1 className="font-editorial text-[28px] md:text-[34px] font-semibold tracking-tight" style={{ color: 'var(--tx-0)' }}>
            {t('Tiểu Lục Nhâm (小六壬)', '小六壬掌诀占断')}
          </h1>
          <p className="mt-2 text-[13.5px] max-w-2xl" style={{ color: 'var(--tx-2)' }}>
            {t(
              'Phép bấm độn 6 cung truyền thống (Đại An · Lưu Liên · Tốc Hỷ · Xích Khẩu · Tiểu Cát · Không Vong) dựa trên lịch Âm tức thời hoặc 3 con số khởi tâm.',
              '以大安、留连、速喜、赤口、小吉、空亡六宫顺推，可依当前农历月日时自动起课，或静心默念所问后任取三数起卦。',
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)] gap-8 items-start">
          {/* Left Controls */}
          <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}>
            {/* Mode Switch */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-1)' }}>
              <button
                type="button"
                onClick={() => { setMode('now'); castByNow(); }}
                className="flex items-center justify-center gap-1.5 rounded-md py-2 text-[12.5px] font-medium transition-colors"
                style={{
                  background: mode === 'now' ? 'var(--bg-card)' : 'transparent',
                  color: mode === 'now' ? 'var(--tx-0)' : 'var(--tx-3)',
                  boxShadow: mode === 'now' ? 'var(--sh-xs)' : 'none',
                }}
              >
                <Clock size={13} />
                <span>{t('Giờ Âm lịch hiện tại', '当前农历起课')}</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('numbers')}
                className="flex items-center justify-center gap-1.5 rounded-md py-2 text-[12.5px] font-medium transition-colors"
                style={{
                  background: mode === 'numbers' ? 'var(--bg-card)' : 'transparent',
                  color: mode === 'numbers' ? 'var(--tx-0)' : 'var(--tx-3)',
                  boxShadow: mode === 'numbers' ? 'var(--sh-xs)' : 'none',
                }}
              >
                <Hash size={13} />
                <span>{t('Báo 3 con số', '三数起课')}</span>
              </button>
            </div>

            {/* Optional Question */}
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>
                {t('Việc cần hỏi (tuỳ chọn)', '所问之事（选填）')}
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('Vd: Buổi đàm phán hôm nay có thuận không?', '例如：今日签约合作是否顺利？')}
                className="input-base text-[13px]"
              />
            </div>

            {mode === 'now' ? (
              <div className="space-y-4">
                <div className="rounded-lg p-4 text-[12.5px]" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}>
                  <div className="text-[11px] mb-1" style={{ color: 'var(--tx-3)' }}>
                    {t('Thời điểm gieo quẻ hiện tại', '当前起课时间')}
                  </div>
                  <div className="font-medium font-mono-tabular" style={{ color: 'var(--tx-0)' }}>
                    {result?.lunarLabel}
                  </div>
                </div>
                <button type="button" onClick={castByNow} className="btn-primary w-full py-2.5">
                  <RefreshCw size={14} />
                  <span>{t('Cập nhật theo phút hiện tại', '刷新当前时辰起课')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: t('Số 1 (Sơ)', '第一数'), val: num1, set: setNum1 },
                    { label: t('Số 2 (Trung)', '第二数'), val: num2, set: setNum2 },
                    { label: t('Số 3 (Mạt)', '第三数'), val: num3, set: setNum3 },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <label className="block text-[11px] mb-1" style={{ color: 'var(--tx-3)' }}>
                        {item.label}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={item.val}
                        onChange={(e) => item.set(e.target.value)}
                        className="input-base text-center font-mono-tabular"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={castByNumbers} className="btn-primary py-2.5">
                    <Compass size={14} />
                    <span>{t('Gieo quẻ', '立即起课')}</span>
                  </button>
                  <button type="button" onClick={castRandomNumbers} className="btn-ghost py-2.5">
                    <RefreshCw size={13} />
                    <span>{t('Ngẫu nhiên', '随机三数')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step Path Breakdown */}
            {result && (
              <div className="pt-4" style={{ borderTop: '1px solid var(--bdr)' }}>
                <div className="text-[11px] mb-2.5" style={{ color: 'var(--tx-3)' }}>
                  {t('Lộ trình bấm cung (Tháng → Ngày → Giờ)', '三步落宫路径')}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { step: t('Bước 1', '初传'), n: result.inputs[0], p: result.monthPalace },
                    { step: t('Bước 2', '中传'), n: result.inputs[1], p: result.dayPalace },
                    { step: t('Kết quả', '终传'), n: result.inputs[2], p: result.finalPalace, active: true },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg p-2.5"
                      style={{
                        background: s.active ? 'var(--ac-bg)' : 'var(--bg-1)',
                        border: `1px solid ${s.active ? 'var(--ac-bdr)' : 'var(--bdr)'}`,
                      }}
                    >
                      <div className="text-[10.5px]" style={{ color: 'var(--tx-3)' }}>
                        {s.step} ({s.n})
                      </div>
                      <div
                        className="font-editorial text-[14px] font-semibold mt-0.5"
                        style={{ color: s.active ? 'var(--ac)' : 'var(--tx-0)' }}
                      >
                        {lang === 'vi' ? s.p.nameVi : s.p.nameZh}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Result Stage: 6-Palace Hand Diagram + Full Reading */}
          <div className="space-y-6">
            {/* 6-Palace Palm Grid */}
            <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-medium" style={{ color: 'var(--tx-2)' }}>
                  {t('Đồ hình 6 cung trên lòng bàn tay', '掌上六宫方位图')}
                </span>
                <span className="text-[11.5px]" style={{ color: 'var(--tx-3)' }}>
                  {t('Nhấp từng cung để tra ý nghĩa', '点击任意宫位可查看释义')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {GRID_ORDER.map((palaceIdx) => {
                  const p = XIAOLIUREN_PALACES[palaceIdx];
                  const isFinal = result?.hourStep === palaceIdx;
                  const isMonth = result?.monthStep === palaceIdx;
                  const isDay = result?.dayStep === palaceIdx;

                  return (
                    <button
                      key={p.index}
                      type="button"
                      onClick={() =>
                        setResult({
                          monthStep: palaceIdx,
                          dayStep: palaceIdx,
                          hourStep: palaceIdx,
                          monthPalace: p,
                          dayPalace: p,
                          finalPalace: p,
                          inputs: [palaceIdx + 1, 1, 1],
                          lunarLabel: t(`Tra cứu trực tiếp cung ${p.nameVi}`, `查阅宫位：${p.nameZh}`),
                        })
                      }
                      className="rounded-xl p-4 text-left transition-all duration-150"
                      style={{
                        background: isFinal ? 'var(--ac-bg)' : 'var(--bg-1)',
                        border: `1.5px solid ${isFinal ? 'var(--ac)' : 'var(--bdr)'}`,
                      }}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-editorial text-[18px] font-semibold" style={{ color: isFinal ? 'var(--ac)' : 'var(--tx-0)' }}>
                          {p.nameZh}
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--tx-3)' }}>
                          {lang === 'vi' ? p.elementVi : p.elementZh}
                        </span>
                      </div>
                      <div className="text-[12.5px] font-medium mt-0.5" style={{ color: 'var(--tx-1)' }}>
                        {p.nameVi}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 text-[10.5px]" style={{ color: 'var(--tx-3)' }}>
                        {isMonth && <span>{t('Sơ', '月')}</span>}
                        {isDay && <span>{t('Trung', '日')}</span>}
                        {isFinal && (
                          <span className="font-semibold" style={{ color: 'var(--ac)' }}>
                            {t('Lạc cung', '落宫')}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Interpretation */}
            {final && (
              <div className="rounded-xl p-6 md:p-8 space-y-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--bdr-med)' }}>
                <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5" style={{ borderBottom: '1px solid var(--bdr)' }}>
                  <div>
                    <div className="text-[12px] mb-1" style={{ color: 'var(--tx-3)' }}>
                      {question ? `${t('Câu hỏi', '所问')}：${question}` : result?.lunarLabel}
                    </div>
                    <h2 className="font-editorial text-[26px] font-semibold" style={{ color: 'var(--tx-0)' }}>
                      {final.nameVi} · {final.nameZh}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-[13.5px] font-semibold" style={{ color: verdictColor }}>
                      {lang === 'vi' ? final.verdictVi : final.verdictZh}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--tx-3)' }}>
                      {t('Ngũ hành', '五行')}: {lang === 'vi' ? final.elementVi : final.elementZh} · {t('Phương vị', '方位')}: {lang === 'vi' ? final.directionVi : final.directionZh}
                    </div>
                  </div>
                </div>

                {/* Traditional Verse */}
                <div className="rounded-lg p-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}>
                  <div className="text-[11px] mb-1.5" style={{ color: 'var(--tx-3)' }}>
                    {t('Khẩu quyết cổ truyền', '传统断辞')}
                  </div>
                  <p className="font-editorial text-[14.5px] leading-relaxed" style={{ color: 'var(--tx-0)' }}>
                    {final.verseZh}
                  </p>
                  {lang === 'vi' && (
                    <p className="text-[13px] leading-relaxed mt-2" style={{ color: 'var(--tx-2)' }}>
                      {final.verseVi}
                    </p>
                  )}
                </div>

                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--tx-1)' }}>
                  {lang === 'vi' ? final.summaryVi : final.summaryZh}
                </p>

                {/* 6 Domain Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[
                    { title: t('Sự nghiệp · Công danh', '事业谋望'), text: lang === 'vi' ? final.domains.careerVi : final.domains.careerZh },
                    { title: t('Tài lộc · Giao dịch', '求财交易'), text: lang === 'vi' ? final.domains.wealthVi : final.domains.wealthZh },
                    { title: t('Tình cảm · Nhân duyên', '感情姻缘'), text: lang === 'vi' ? final.domains.loveVi : final.domains.loveZh },
                    { title: t('Xuất hành · Tin tức', '出行行人'), text: lang === 'vi' ? final.domains.travelVi : final.domains.travelZh },
                    { title: t('Tìm đồ thất lạc', '失物寻找'), text: lang === 'vi' ? final.domains.lostVi : final.domains.lostZh },
                    { title: t('Sức khỏe · Bình an', '健康调养'), text: lang === 'vi' ? final.domains.healthVi : final.domains.healthZh },
                  ].map((d, i) => (
                    <div key={i} className="rounded-lg p-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--bdr)' }}>
                      <div className="text-[12px] font-semibold mb-1.5" style={{ color: 'var(--tx-0)' }}>
                        {d.title}
                      </div>
                      <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--tx-2)' }}>
                        {d.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
