import { NextRequest } from 'next/server';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import { STAR_IN_FUQI_GU } from '@/lib/ziwei/heming-knowledge';
import { BRANCHES, STEMS, STAR_DESCRIPTIONS } from '@/lib/ziwei/constants';

function getMainStars(chart: ZiweiChart, palace?: Palace): { stars: string[]; borrowed: boolean } {
  if (!palace) return { stars: [], borrowed: false };
  const direct = (palace.stars ?? []).filter((s) => s.type === 'major').map((s) => s.name);
  if (direct.length > 0) return { stars: direct, borrowed: false };
  const opp = (chart.palaces ?? []).find((p) => p.branch === (palace.branch + 6) % 12);
  const oppStars = opp ? (opp.stars ?? []).filter((s) => s.type === 'major').map((s) => s.name) : [];
  return { stars: oppStars, borrowed: true };
}

function branchRelation(a: number, b: number, lang: 'vi' | 'zh'): { label: string; detail: string } {
  const diff = ((b - a) % 12 + 12) % 12;
  if (lang === 'vi') {
    if (diff === 0) return { label: 'Đồng Cung Cộng Hưởng', detail: 'Mệnh cung hai người an cùng một Địa Chi, tần số tư duy và bài học cuộc đời tương đồng sâu sắc.' };
    if (diff === 4 || diff === 8) return { label: 'Tam Hợp Tương Trợ', detail: 'Hai cung Mệnh hợp thành cục Tam Hợp, khí trường thuận hòa, rất tốt cho cả tình cảm lẫn hợp tác.' };
    if (diff === 6) return { label: 'Đối Cung Bổ Trợ', detail: 'Mệnh cung đối chiếu lẫn nhau qua trục Di – Mệnh, cá tính bổ sung rõ nét và lực hút mạnh mẽ.' };
    if (diff === 3 || diff === 9) return { label: 'Hình Xung Ma Sát', detail: 'Nhịp độ hành động có sự khác biệt; giai đoạn đầu thu hút mạnh nhưng về lâu dài cần phân công rõ ràng.' };
    return { label: 'Bình Hòa Tiệm Tiến', detail: 'Không có xung khắc gay gắt ở tiên thiên, sự bền vững phụ thuộc nhiều vào giao tiếp và mục tiêu chung.' };
  }
  if (diff === 0) return { label: '同宫共振', detail: '双方命宫落于同一地支，思维频率与人生议题高度相似，极易产生共鸣。' };
  if (diff === 4 || diff === 8) return { label: '三合相助', detail: '命宫成三合之局，气场天然顺畅，无论情感陪伴或事业合伙皆能互为助力。' };
  if (diff === 6) return { label: '对宫互补', detail: '命宫互为迁移对宫，性格呈现鲜明互补与强烈吸引力，需以包容取代执拗。' };
  if (diff === 3 || diff === 9) return { label: '刑冲磨合', detail: '行事节奏与处事方式存在落差，初期火花鲜明，长期相处重在建立清晰分工与边界。' };
  return { label: '平和渐进', detail: '先天宫位无剧烈冲克，关系走向更多取决于双方后天沟通与共同目标。' };
}

function buildHemingReport(chartA: ZiweiChart, chartB: ZiweiChart, question?: string, lang: 'vi' | 'zh' = 'zh'): string {
  const nameA = chartA.birthInfo?.name || (lang === 'vi' ? 'Người thứ nhất (A)' : '甲方');
  const nameB = chartB.birthInfo?.name || (lang === 'vi' ? 'Người thứ hai (B)' : '乙方');

  const palacesA = Array.isArray(chartA.palaces) ? chartA.palaces : [];
  const palacesB = Array.isArray(chartB.palaces) ? chartB.palaces : [];
  const mingA = palacesA.find((p) => p.branch === chartA.mingGongBranch);
  const mingB = palacesB.find((p) => p.branch === chartB.mingGongBranch);
  const fqA = palacesA.find((p) => p.name.includes('夫妻'));
  const fqB = palacesB.find((p) => p.name.includes('夫妻'));

  const mA = getMainStars(chartA, mingA);
  const mB = getMainStars(chartB, mingB);
  const fA = getMainStars(chartA, fqA);
  const fB = getMainStars(chartB, fqB);

  const rel = branchRelation(chartA.mingGongBranch ?? 0, chartB.mingGongBranch ?? 0, lang);
  const mutualHitA = mA.stars.some((s) => fB.stars.includes(s));
  const mutualHitB = mB.stars.some((s) => fA.stars.includes(s));

  const fqInfoA = fA.stars[0] ? STAR_IN_FUQI_GU[fA.stars[0]] : undefined;
  const fqInfoB = fB.stars[0] ? STAR_IN_FUQI_GU[fB.stars[0]] : undefined;

  const dxA = (chartA.daXians ?? [])[chartA.currentDaXianIndex ?? 0];
  const dxB = (chartB.daXians ?? [])[chartB.currentDaXianIndex ?? 0];

  if (lang === 'vi') {
    const lines: string[] = [
      '**【Tổng luận Duyên phận Song Bàn】**',
      `${nameA} (${chartA.wuxingJuName ?? ''} · Mệnh ${mingA ? `${STEMS[mingA.stem]}${BRANCHES[mingA.branch]}` : ''} **${mA.stars.join(' · ') || 'Vô Chính Diệu'}**) và ${nameB} (${chartB.wuxingJuName ?? ''} · Mệnh ${mingB ? `${STEMS[mingB.stem]}${BRANCHES[mingB.branch]}` : ''} **${mB.stars.join(' · ') || 'Vô Chính Diệu'}**) tạo thành cách cục **${rel.label}**.`,
      rel.detail,
      mutualHitA || mutualHitB
        ? 'Điểm đặc biệt: Chính tinh cung Mệnh của một bên chiếu thẳng vào cung Phu Thê của bên kia — dấu hiệu cộng hưởng mạnh mẽ về khí chất và sức hút tự nhiên.'
        : 'Chính tinh hai lá số mang sắc thái độc lập, thuận lợi khi tôn trọng không gian phát triển riêng và hỗ trợ thế mạnh của nhau.',
      '',
      `**【Khí chất & Cung Phu Thê của ${nameA}】**`,
      `Chính tinh cung Mệnh **${mA.stars.join(' · ') || 'Vô Chính Diệu'}**: ${mA.stars[0] ? STAR_DESCRIPTIONS[mA.stars[0]] ?? '' : 'Tư duy linh hoạt, thích nghi tốt với hoàn cảnh.'}`,
      fqInfoA
        ? `Cung Phu Thê (${fA.stars.join(' · ')}): ${fqInfoA.summary}. **Điểm thuận**: ${fqInfoA.good}`
        : `Cung Phu Thê tại ${fqA ? BRANCHES[fqA.branch] : '—'}, đề cao sự tin cậy và nhịp sống ổn định.`,
      '',
      `**【Khí chất & Cung Phu Thê của ${nameB}】**`,
      `Chính tinh cung Mệnh **${mB.stars.join(' · ') || 'Vô Chính Diệu'}**: ${mB.stars[0] ? STAR_DESCRIPTIONS[mB.stars[0]] ?? '' : 'Khả năng thích ứng cao, mềm dẻo.'}`,
      fqInfoB
        ? `Cung Phu Thê (${fB.stars.join(' · ')}): ${fqInfoB.summary}. **Điểm thuận**: ${fqInfoB.good}`
        : `Cung Phu Thê tại ${fqB ? BRANCHES[fqB.branch] : '—'}, coi trọng sự chân thành và gắn bó bền lâu.`,
      '',
      '**【Nhịp Đại Hạn & Khuyến nghị Hợp Bàn】**',
      question ? `Về vấn đề bạn đang quan tâm (**${question}**):` : '',
      `1. **Nguyên tắc giao tiếp**: ${nameA} nên chia sẻ rõ kỳ vọng; ${nameB} nên giữ khoảng lặng trao đổi trước các quyết định lớn.`,
      `2. **Đồng bộ Đại Hạn**: ${nameA} đang ở Đại Hạn thứ ${(chartA.currentDaXianIndex ?? 0) + 1} (${dxA?.palaceName ?? '—'}), ${nameB} đang ở Đại Hạn thứ ${(chartB.currentDaXianIndex ?? 0) + 1} (${dxB?.palaceName ?? '—'}). Khi hai vận hạn đồng pha rất thuận tiến hành kế hoạch chung.`,
      '3. **Tam Tài Thiên – Địa – Nhân**: Hợp bàn tiên thiên chỉ chiếm 1/3; môi trường sống (Địa) và cách ứng xử hằng ngày (Nhân) chiếm 2/3 quyết định hạnh phúc lâu dài.',
    ];
    return lines.filter(Boolean).join('\n');
  }

  const lines: string[] = [
    '**【双盘缘分总评】**',
    `${nameA}（${chartA.wuxingJuName ?? ''} · 命宫 ${mingA ? `${STEMS[mingA.stem]}${BRANCHES[mingA.branch]}` : ''} **${mA.stars.join('、') || '空宫'}**）与 ${nameB}（${chartB.wuxingJuName ?? ''} · 命宫 ${mingB ? `${STEMS[mingB.stem]}${BRANCHES[mingB.branch]}` : ''} **${mB.stars.join('、') || '空宫'}**）构成了 **${rel.label}** 格局。`,
    rel.detail,
    mutualHitA || mutualHitB
      ? '更难得的是，双方存在 **命宫主星直入对方夫妻宫** 的星曜呼应，彼此容易一眼认出对方的气质特质，牵引力显著增强。'
      : '双方主星各具独立色彩，相处中更强调彼此成就、各展所长。',
    '',
    `**【${nameA} 命格与情感诉求】**`,
    `命宫主星 **${mA.stars.join('、') || '空宫'}**：${mA.stars[0] ? STAR_DESCRIPTIONS[mA.stars[0]] ?? '' : '思维灵活，受环境影响明显。'}`,
    fqInfoA
      ? `夫妻宫（${fA.stars.join('、')}）：${fqInfoA.summary}。**相处要点**：${fqInfoA.good}`
      : `夫妻宫位于 ${fqA ? BRANCHES[fqA.branch] : ''}，注重彼此的信任与节奏契合。`,
    '',
    `**【${nameB} 命格与情感诉求】**`,
    `命宫主星 **${mB.stars.join('、') || '空宫'}**：${mB.stars[0] ? STAR_DESCRIPTIONS[mB.stars[0]] ?? '' : '适应力强，弹性高。'}`,
    fqInfoB
      ? `夫妻宫（${fB.stars.join('、')}）：${fqInfoB.summary}。**相处要点**：${fqInfoB.good}`
      : `夫妻宫位于 ${fqB ? BRANCHES[fqB.branch] : ''}，重视稳定感与日常回馈。`,
    '',
    '**【相处节奏与合盘建议】**',
    question ? `针对您重点关注的问题「**${question}**」：` : '',
    `1. **沟通原则**：${nameA} 宜多表达真实期待，避免单向预设；${nameB} 宜在重要决策前留足讨论缓冲。`,
    `2. **大限同步**：${nameA} 当前行第 ${(chartA.currentDaXianIndex ?? 0) + 1} 大限（${dxA?.palaceName ?? ''}），${nameB} 当前行第 ${(chartB.currentDaXianIndex ?? 0) + 1} 大限（${dxB?.palaceName ?? ''}）。双方人生阶段节奏同步时最宜推进关键计划，节奏有别时则重在互相体谅。`,
    `3. **倪师三才观**：先天合盘占三分之一，居家空间与共同生活习惯（地理）及日常经营（人事）占三分之二，良性互动永远能把中平之局走成佳偶良伴。`,
  ];

  return lines.filter(Boolean).join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const chartA = body?.chartA as ZiweiChart | undefined;
    const chartB = body?.chartB as ZiweiChart | undefined;
    const question = typeof body?.question === 'string' ? body.question : undefined;
    const lang: 'vi' | 'zh' = body?.lang === 'vi' ? 'vi' : 'zh';

    if (!chartA || !chartB) {
      return new Response(JSON.stringify({ error: 'Both chartA and chartB are required' }), { status: 400 });
    }

    const fullText = buildHemingReport(chartA, chartB, question, lang);
    const encoder = new TextEncoder();
    const chunks = fullText.match(/[\s\S]{1,20}/g) ?? [fullText];

    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: { text: chunk } })}\n\n`));
          await new Promise((r) => setTimeout(r, 12));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Heming analysis failed' }), { status: 500 });
  }
}
