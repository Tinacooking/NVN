import { NextRequest } from 'next/server';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import { detectPatterns } from '@/lib/ziwei/patterns';
import { STAR_DESCRIPTIONS, STEMS, BRANCHES } from '@/lib/ziwei/constants';
import { STAR_IN_FUQI_GU } from '@/lib/ziwei/heming-knowledge';

function findPalace(chart: ZiweiChart, keyword: string): Palace | undefined {
  return chart.palaces.find((p) => p.name.includes(keyword));
}

function getEffectiveMajors(chart: ZiweiChart, palace?: Palace): { names: string[]; borrowed: boolean } {
  if (!palace) return { names: [], borrowed: false };
  const direct = (palace.stars ?? []).filter((s) => s.type === 'major').map((s) => s.name);
  if (direct.length > 0) return { names: direct, borrowed: false };
  const opp = chart.palaces.find((p) => p.branch === (palace.branch + 6) % 12);
  const oppMajors = opp ? (opp.stars ?? []).filter((s) => s.type === 'major').map((s) => s.name) : [];
  return { names: oppMajors, borrowed: true };
}

function formatStarList(palace?: Palace, lang: 'vi' | 'zh' = 'zh'): string {
  if (!palace) return lang === 'vi' ? 'Không có' : '无';
  const stars = palace.stars ?? [];
  const majors = stars
    .filter((s) => s.type === 'major')
    .map((s) => `${s.name}${s.brightnessRaw ? `(${s.brightnessRaw})` : ''}${s.siHua ? `[化${s.siHua}]` : ''}`);
  const luckies = stars.filter((s) => s.type === 'lucky').map((s) => s.name);
  const shas = stars.filter((s) => s.type === 'sha').map((s) => s.name);
  const parts: string[] = [];
  if (majors.length) {
    parts.push(lang === 'vi' ? `Chính tinh: ${majors.join(' · ')}` : `主星：${majors.join('、')}`);
  } else {
    parts.push(lang === 'vi' ? 'Chính tinh: Vô Chính Diệu (mượn đối cung)' : '主星：空宫（需借对宫星曜参看）');
  }
  if (luckies.length) parts.push(lang === 'vi' ? `Cát tinh: ${luckies.join(' · ')}` : `吉星：${luckies.join('、')}`);
  if (shas.length) parts.push(lang === 'vi' ? `Sát tinh: ${shas.join(' · ')}` : `煞星：${shas.join('、')}`);
  return parts.join(lang === 'vi' ? '; ' : '；');
}

function safeDetectPatterns(chart: ZiweiChart): ReturnType<typeof detectPatterns> {
  try {
    if (!Array.isArray(chart.palaces) || chart.palaces.length < 12) return [];
    return detectPatterns(chart);
  } catch {
    return [];
  }
}

function buildChartReading(chart: ZiweiChart, prompt: string, lang: 'vi' | 'zh' = 'zh'): string {
  const ming = chart.palaces.find((p) => p.branch === chart.mingGongBranch) ?? findPalace(chart, '命');
  const fuqi = findPalace(chart, '夫妻');
  const guanlu = findPalace(chart, '官禄');
  const caibo = findPalace(chart, '财帛');
  const jie = findPalace(chart, '疾厄');
  const tianzhai = findPalace(chart, '田宅');
  const qianyi = findPalace(chart, '迁移');
  const fude = findPalace(chart, '福德');
  const daXians = Array.isArray(chart.daXians) ? chart.daXians : [];
  const currentDx = daXians[chart.currentDaXianIndex ?? 0];
  const patterns = safeDetectPatterns(chart);

  const { names: mingMajors, borrowed: mingBorrowed } = getEffectiveMajors(chart, ming);
  const primaryStar = mingMajors[0] ?? '紫微';
  const primaryDesc = STAR_DESCRIPTIONS[primaryStar] ?? '主星气势独特，宜结合三方四正综合研判。';

  const isLove = prompt.includes('感情') || prompt.includes('夫妻宫') || prompt.includes('婚姻');
  const isCareer = prompt.includes('事业') || prompt.includes('官禄宫') || prompt.includes('工作');
  const isWealth = prompt.includes('财运') || prompt.includes('财帛宫') || prompt.includes('财富');
  const isHealth = prompt.includes('健康') || prompt.includes('疾厄宫') || prompt.includes('身体');
  const isPersonality = prompt.includes('性格') || prompt.includes('人格');
  const isSiHua = prompt.includes('飞化影响');
  const isSinglePalace = prompt.includes('请详细解读【') || prompt.includes('请重点分析【');

  if (lang === 'vi') {
    if (isSinglePalace) {
      const match = prompt.match(/【(.+?)】/);
      const palaceName = match?.[1] ?? '命宫';
      const target = chart.palaces.find((p) => p.name === palaceName) ?? ming;
      const opp = target ? chart.palaces.find((p) => p.branch === (target.branch + 6) % 12) : undefined;
      const { names, borrowed } = getEffectiveMajors(chart, target);
      const starText = names.map((n) => `**${n}**: ${STAR_DESCRIPTIONS[n] ?? 'Tinh hệ đặc trưng'}`).join('\n');

      return [
        `**【Cấu trúc cung ${palaceName}】**`,
        `Cung ${palaceName} an tại **${target ? `${STEMS[target.stem]}${BRANCHES[target.branch]}` : ''}**, ${formatStarList(target, 'vi')}.`,
        borrowed && opp ? `Đây là cung Vô Chính Diệu; theo phép *Thiên Kỷ* cần mượn chính tinh từ đối cung **${opp.name}** (${names.join(' · ') || '—'}) để luận.` : '',
        '',
        '**【Đặc tính Chính tinh】**',
        starText || 'Cung không có chính tinh, trọng tâm xét cát sát và Tứ Hóa hội chiếu ở Tam Phương Tứ Chính.',
        '',
        '**【Liên kết Đối cung & Đại Hạn】**',
        `Đối cung là **${opp?.name ?? 'Đối cung'}** (${formatStarList(opp, 'vi')}). ${currentDx ? `Đương vận Đại Hạn **${currentDx.startAge}–${currentDx.endAge} tuổi (${currentDx.palaceName})**` : 'Luận theo Bản Mệnh'} — khi lưu chuyển qua cung này nên lấy sự vững vàng và thuận thế làm gốc.`,
      ].filter(Boolean).join('\n');
    }

    if (isSiHua) {
      const match = prompt.match(/【(.+?)】/);
      const title = match?.[1] ?? 'Tứ Hóa Lưu Chuyển';
      return [
        `**【Ý nghĩa cốt lõi: ${title}】**`,
        'Tứ Hóa là dụng thần của Tử Vi Đẩu Số: Hóa Lộc chủ tài lộc và cơ hội phát triển, Hóa Quyền chủ năng lực điều hành và biến động, Hóa Khoa chủ danh tiếng và quý nhân hóa giải, Hóa Kỵ chủ thử thách, chấp niệm và thu liễm.',
        '',
        '**【Tác động lên lá số】**',
        `Bản mệnh thuộc **${chart.wuxingJuName || 'Ngũ Hành Cục'}**, Mệnh cung tại ${ming ? `${STEMS[ming.stem]}${BRANCHES[ming.branch]}` : '—'}${currentDx ? `, đang hành Đại Hạn ${currentDx.startAge}–${currentDx.endAge} tuổi tại ${currentDx.palaceName}` : ''}. Cung vị an sao Hóa và đối cung xung chiếu là tiêu điểm biến động chính của chu kỳ này.`,
        '',
        '**【Khuyến nghị thực hành】**',
        'Gặp Lộc/Quyền nên chủ động mở rộng thế mạnh; gặp Khoa nên học sâu và xây dựng uy tín chuyên môn; gặp Kỵ nên giữ thế thủ, dự phòng rủi ro và dùng tu dưỡng Nhân sự để hóa giải.',
      ].join('\n');
    }

    if (isLove) {
      const { names: fqMajors, borrowed } = getEffectiveMajors(chart, fuqi);
      const fqStar = fqMajors[0];
      const fqInfo = fqStar ? STAR_IN_FUQI_GU[fqStar] : undefined;
      return [
        '**【Tổng quan Tình cảm & Hôn nhân】**',
        fqInfo
          ? `Cung Phu Thê ${borrowed ? '(Vô Chính Diệu mượn đối cung) có' : 'tọa thủ'} **${fqMajors.join(' · ')}**: ${fqInfo.summary}.`
          : `Cung Phu Thê (${formatStarList(fuqi, 'vi')}) cần phối hợp với cung Phúc Đức để đánh giá độ hòa hợp tinh thần.`,
        '',
        '**【Chi tiết cung Phu Thê】**',
        `Vị trí tại ${fuqi ? `${STEMS[fuqi.stem]}${BRANCHES[fuqi.branch]}` : '—'}: ${formatStarList(fuqi, 'vi')}.`,
        fqInfo ? `**Đặc điểm bạn đời**: ${fqInfo.spouse_traits}` : '',
        fqInfo ? `**Điểm cát lợi**: ${fqInfo.good}` : '',
        fqInfo ? `**Điểm cần lưu tâm**: ${fqInfo.bad}` : '',
        '',
        '**【Tam Phương & Nhịp Đại Hạn】**',
        `Cung Phúc Đức (${formatStarList(fude, 'vi')}) phản ánh chiều sâu hạnh phúc nội tâm. ${fqInfo ? fqInfo.timing : 'Nên ưu tiên sự chín chắn và đồng điệu giá trị sống.'}`,
      ].filter(Boolean).join('\n');
    }

    if (isCareer) {
      const { names: glMajors, borrowed } = getEffectiveMajors(chart, guanlu);
      return [
        '**【Định hướng Sự nghiệp】**',
        `Cung Quan Lộc ${borrowed ? '(mượn đối cung Phu Thê)' : 'tọa thủ'} **${glMajors.join(' · ') || 'Vô Chính Diệu'}**, bản mệnh **${chart.wuxingJuName || ''}**, Mệnh Chủ **${chart.mingZhu ?? ''}** · Thân Chủ **${chart.shenZhu ?? ''}**.`,
        glMajors.map((n) => `**${n}**: ${STAR_DESCRIPTIONS[n] ?? ''}`).join('\n'),
        '',
        '**【Tam hợp Mệnh – Tài – Quan】**',
        `- Quan Lộc: ${formatStarList(guanlu, 'vi')}`,
        `- Tài Bạch: ${formatStarList(caibo, 'vi')}`,
        `- Thiên Di: ${formatStarList(qianyi, 'vi')}`,
        '',
        '**【Gợi ý theo Đại Hạn】**',
        `${currentDx ? `Hiện đang trong Đại Hạn **${currentDx.startAge}–${currentDx.endAge} tuổi (${currentDx.palaceName})**. ` : ''}Nếu Quan Lộc vượng Quyền/Khoa thích hợp quản lý chuyên môn hoặc học thuật; nếu Tài Bạch tụ Lộc thích hợp kinh doanh độc lập hoặc thương mại.`,
      ].filter(Boolean).join('\n');
    }

    if (isWealth) {
      const { names: cbMajors, borrowed } = getEffectiveMajors(chart, caibo);
      return [
        '**【Cấu trúc Tài Lộc】**',
        `Cung Tài Bạch ${borrowed ? '(mượn Phúc Đức)' : 'tọa thủ'} **${cbMajors.join(' · ') || 'Vô Chính Diệu'}**, cho thấy phương thức tạo dòng tiền của bản mệnh.`,
        cbMajors.map((n) => `**${n}**: ${STAR_DESCRIPTIONS[n] ?? ''}`).join('\n'),
        '',
        '**【Đối chiếu Tài Bạch & Điền Trạch (Kho tài sản)】**',
        `- Tài Bạch (dòng tiền): ${formatStarList(caibo, 'vi')}`,
        `- Điền Trạch (tích lũy): ${formatStarList(tianzhai, 'vi')}`,
        '',
        '**【Chiến lược giữ tài】**',
        `${currentDx ? `Đương Đại Hạn **${currentDx.startAge}–${currentDx.endAge} tuổi (${currentDx.palaceName})**. ` : ''}Trước các quyết định đầu tư lớn nên đối chiếu thêm Lưu Niên Tứ Hóa ở thanh thời gian phía trên lá số.`,
      ].filter(Boolean).join('\n');
    }

    if (isHealth) {
      const shaRanked = [...chart.palaces]
        .map((p) => ({
          palace: p,
          count: (p.stars ?? []).filter((s) => s.type === 'sha' || s.siHua === '忌').length,
        }))
        .sort((a, b) => b.count - a.count);
      const hotPalace = shaRanked[0]?.count > 0 ? shaRanked[0].palace : jie;
      const branchOrganVi: Record<number, string> = {
        0: 'Thận, bàng quang và hệ bài tiết (Tý Thủy)',
        1: 'Tỳ vị, tiêu hóa và chuyển hóa thấp khí (Sửu Thổ)',
        2: 'Gan mật, gân cơ và điều hòa khí huyết (Dần Mộc)',
        3: 'Gan mật, thần kinh và thị lực (Mão Mộc)',
        4: 'Tỳ vị, đường ruột và da liễu (Thìn Thổ)',
        5: 'Tâm, tiểu trường và tuần hoàn máu (Tỵ Hỏa)',
        6: 'Tim mạch, huyết áp, mắt và giấc ngủ (Ngọ Hỏa)',
        7: 'Tỳ vị, miễn dịch và nội tiết (Mùi Thổ)',
        8: 'Phế, đại trường và hệ hô hấp (Thân Kim)',
        9: 'Phổi, đường hô hấp và xương khớp (Dậu Kim)',
        10: 'Tỳ vị, vùng bụng và trao đổi chất (Tuất Thổ)',
        11: 'Thận, thủy dịch và vùng thắt lưng (Hợi Thủy)',
      };
      const organTip = hotPalace ? branchOrganVi[hotPalace.branch] : 'Nhịp sinh hoạt điều độ';

      return [
        '**【Cung Tật Ách & Thể chất nền】**',
        `Cung Tật Ách tại ${jie ? `${STEMS[jie.stem]}${BRANCHES[jie.branch]}` : '—'}: ${formatStarList(jie, 'vi')}.`,
        '',
        '**【Trọng điểm dưỡng sinh theo Thiên Kỷ】**',
        `Theo phép xem của Nghê Hải Hạ, cần chú ý cung tập trung nhiều Sát/Kỵ nhất trên toàn bàn — hiện là **${hotPalace ? `${hotPalace.name} (${BRANCHES[hotPalace.branch]})` : 'Tật Ách'}**, tương ứng vùng cần dưỡng: **${organTip}**.`,
        '',
        '**【Khuyến nghị Tý Ngọ Lưu Chú】**',
        'Duy trì ngủ trước 23h (giờ Tý kinh Đởm vận hành), ăn uống thanh đạm đúng bữa. Nội dung chỉ mang tính tham khảo dưỡng sinh cổ truyền.',
      ].join('\n');
    }

    if (isPersonality) {
      return [
        '**【Tính cách cốt lõi tại Cung Mệnh】**',
        `Cung Mệnh ${mingBorrowed ? '(Vô Chính Diệu mượn Thiên Di)' : 'tọa thủ'} **${mingMajors.join(' · ') || 'Vô Chính Diệu'}**, ${chart.yinYangGender ?? ''} · **${chart.wuxingJuName || ''}**.`,
        mingMajors.map((n) => `**${n}**: ${STAR_DESCRIPTIONS[n] ?? ''}`).join('\n'),
        '',
        '**【Biểu hiện bên ngoài & Nội tâm】**',
        `- Thiên Di (giao tiếp bên ngoài): ${formatStarList(qianyi, 'vi')}`,
        `- Phúc Đức (đời sống tinh thần): ${formatStarList(fude, 'vi')}`,
      ].filter(Boolean).join('\n');
    }

    const topPatterns = patterns.slice(0, 4);
    const patternSection = topPatterns.length > 0
      ? topPatterns.map((p) => `- **${p.name}** (${p.palaces.join(' · ')}): ${p.description}`).join('\n')
      : 'Lá số kết hợp hài hòa giữa chính tinh và Tam Phương Tứ Chính, thích hợp phát triển từng bước theo Đại Hạn.';

    return [
      '**【Tổng quan Bản Mệnh】**',
      `${chart.yinYangGender ?? ''} · **${chart.wuxingJuName || ''}** · Cung Mệnh tại **${ming ? `${STEMS[ming.stem]}${BRANCHES[ming.branch]}` : '—'}**, ${mingBorrowed ? 'Vô Chính Diệu mượn đối cung' : 'Chính tinh'} **${mingMajors.join(' · ') || '—'}**.`,
      `${primaryStar}: ${primaryDesc}`,
      '',
      '**【Cách cục nổi bật】**',
      patternSection,
      '',
      '**【Tam Phương Tứ Chính】**',
      `- **Mệnh cung (命宫)**: ${formatStarList(ming, 'vi')}`,
      `- **Tài Bạch (财帛)**: ${formatStarList(caibo, 'vi')}`,
      `- **Quan Lộc (官禄)**: ${formatStarList(guanlu, 'vi')}`,
      `- **Thiên Di (迁移)**: ${formatStarList(qianyi, 'vi')}`,
      '',
      '**【Đại Hạn hiện tại】**',
      currentDx
        ? `Tuổi hiện tại ${chart.currentAge}, đang hành Đại Hạn **${currentDx.startAge}–${currentDx.endAge} tuổi (${currentDx.palaceName})**. Nhấp vào bất kỳ cung nào trên lá số để xem luận giải chi tiết cung đó.`
        : 'Chuyển đổi giữa Bản Mệnh / Đại Hạn / Lưu Niên phía trên lá số để quan sát Tứ Hóa di chuyển theo thời gian.',
    ].join('\n');
  }

  // Chinese default output
  if (isSinglePalace) {
    const match = prompt.match(/【(.+?)】/);
    const palaceName = match?.[1] ?? '命宫';
    const target = chart.palaces.find((p) => p.name === palaceName) ?? ming;
    const opp = target ? chart.palaces.find((p) => p.branch === (target.branch + 6) % 12) : undefined;
    const { names, borrowed } = getEffectiveMajors(chart, target);
    const starText = names.map((n) => `**${n}**：${STAR_DESCRIPTIONS[n] ?? '星性鲜明'}`).join('\n');

    return [
      `**【${palaceName}宫位结构】**`,
      `${palaceName}落于 **${target ? `${STEMS[target.stem]}${BRANCHES[target.branch]}` : ''}** 宫，${formatStarList(target)}。`,
      borrowed && opp ? `此宫为空宫，倪师《天纪》体系强调「对宫借星」，应借对宫【${opp.name}】主星（${names.join('、') || '无'}）合参。` : '',
      '',
      '**【主星特质与象意】**',
      starText || '此宫无主星，重点观察三方四正之吉煞与四化牵动。',
      '',
      '**【三方与大限联动】**',
      `对宫为【${opp?.name ?? '对宫'}】（${formatStarList(opp)}）。当前大限行至【${currentDx?.palaceName ?? '本命'}】（${currentDx ? `${currentDx.startAge}–${currentDx.endAge}岁` : ''}），流转到此宫所主领域时，应以趋吉避凶、顺势而为为原则。`,
    ].filter(Boolean).join('\n');
  }

  if (isSiHua) {
    const match = prompt.match(/【(.+?)】/);
    const title = match?.[1] ?? '流转四化';
    return [
      `**【${title}核心象意】**`,
      `四化为紫微斗数之用神：化禄主生发财源与机缘，化权主掌控执行与变动，化科主名声贵人与化解，化忌主执念考验与收束。`,
      '',
      '**【本盘落宫联动】**',
      `当前本盘为 **${chart.wuxingJuName}**，命宫位于 ${ming ? `${STEMS[ming.stem]}${BRANCHES[ming.branch]}` : ''}，${currentDx ? `正行 ${currentDx.startAge}–${currentDx.endAge} 岁【${currentDx.palaceName}】大限` : ''}。此四化所落之宫位及其对宫（冲照宫位）将是该周期内事件最集中的焦聚点。`,
      '',
      '**【务实应对建议】**',
      `遇化禄、化权宜主动出击，放大既有优势；遇化科宜借势学习、建立专业口碑；遇化忌则宜守不宜攻，提前预留缓冲空间，以人事修为与环境调整化解先天之偏。`,
    ].join('\n');
  }

  if (isLove) {
    const { names: fqMajors, borrowed } = getEffectiveMajors(chart, fuqi);
    const fqStar = fqMajors[0];
    const fqInfo = fqStar ? STAR_IN_FUQI_GU[fqStar] : undefined;
    return [
      '**【感情格局定性】**',
      fqInfo
        ? `夫妻宫${borrowed ? '空宫借对宫' : '坐'} **${fqMajors.join('、')}**：${fqInfo.summary}。`
        : `夫妻宫为 **${formatStarList(fuqi)}**，感情模式宜结合福德宫（精神契合）与命宫性格共同衡量。`,
      '',
      '**【夫妻宫星曜细论】**',
      `夫妻宫位于 ${fuqi ? `${STEMS[fuqi.stem]}${BRANCHES[fuqi.branch]}` : ''}：${formatStarList(fuqi)}。`,
      fqInfo ? `**伴侣特质**：${fqInfo.spouse_traits}` : '',
      fqInfo ? `**吉象所在**：${fqInfo.good}` : '',
      fqInfo ? `**需留意处**：${fqInfo.bad}` : '',
      fqInfo?.ni_quote ? `倪师体系提示：「${fqInfo.ni_quote}」` : '',
      '',
      '**【三方与婚期建议】**',
      `福德宫（${formatStarList(fude)}）决定婚姻内在幸福感；${fqInfo ? fqInfo.timing : '宜选择心智成熟、价值观契合的阶段步入长期承诺。'}`,
      `当前大限行经【${currentDx?.palaceName ?? ''}】（${currentDx ? `${currentDx.startAge}–${currentDx.endAge}岁` : ''}），建议在沟通中保持边界与尊重，以「人事三分之一」主动经营关系。`,
    ].filter(Boolean).join('\n');
  }

  if (isCareer) {
    const { names: glMajors, borrowed } = getEffectiveMajors(chart, guanlu);
    return [
      '**【事业格局定性】**',
      `官禄宫${borrowed ? '空宫借夫妻宫' : '坐'} **${glMajors.join('、') || '空宫'}**，整体五行局为 **${chart.wuxingJuName}**，命主 **${chart.mingZhu ?? ''}**、身主 **${chart.shenZhu ?? ''}**。`,
      glMajors.map((n) => `**${n}**：${STAR_DESCRIPTIONS[n] ?? ''}`).join('\n'),
      '',
      '**【官禄与财帛联动】**',
      `官禄宫：${formatStarList(guanlu)}。`,
      `财帛宫：${formatStarList(caibo)}。`,
      `迁移宫：${formatStarList(qianyi)}（主外在舞台与社会评价）。`,
      '',
      '**【大限走势与实操建议】**',
      `当前正行 **${currentDx ? `${currentDx.startAge}–${currentDx.endAge}岁【${currentDx.palaceName}】` : '本命'}** 大限。倪师强调「命宫为本，三方为用」：若官禄见权、科宜在专业管理或权威领域深耕；若财帛见禄则宜以业务、商业变现或独立项目为核心抓手。`,
    ].filter(Boolean).join('\n');
  }

  if (isWealth) {
    const { names: cbMajors, borrowed } = getEffectiveMajors(chart, caibo);
    return [
      '**【财运格局总览】**',
      `财帛宫${borrowed ? '借福德宫' : '坐'} **${cbMajors.join('、') || '空宫'}**，反映命主的生财方式与现金流结构。`,
      cbMajors.map((n) => `**${n}**：${STAR_DESCRIPTIONS[n] ?? ''}`).join('\n'),
      '',
      '**【财帛与田宅（财库）对照】**',
      `财帛宫（现金流）：${formatStarList(caibo)}。`,
      `田宅宫（蓄财库）：${formatStarList(tianzhai)}。`,
      '',
      '**【理财与守成建议】**',
      `若财帛旺而田宅见煞，属于「能赚但易流散」，宜借由长期资产配置、稳健置业或制度化储蓄来固库；当前大限为【${currentDx?.palaceName ?? ''}】（${currentDx ? `${currentDx.startAge}–${currentDx.endAge}岁` : ''}），做重大投资决策前宜先核对流年四化是否冲动财田线。`,
    ].filter(Boolean).join('\n');
  }

  if (isHealth) {
    const shaRanked = [...chart.palaces]
      .map((p) => ({
        palace: p,
        count: (p.stars ?? []).filter((s) => s.type === 'sha' || s.siHua === '忌').length,
      }))
      .sort((a, b) => b.count - a.count);
    const hotPalace = shaRanked[0]?.count > 0 ? shaRanked[0].palace : jie;
    const branchOrgan: Record<number, string> = {
      0: '肾脏、膀胱与生殖泌尿系统（子水）',
      1: '脾胃、消化道与湿气代谢（丑土）',
      2: '肝胆、筋脉与情绪疏泄（寅木）',
      3: '肝胆、神经与眼目（卯木）',
      4: '脾胃、肠胃与皮肤（辰土）',
      5: '心脏、小肠与血液循环（巳火）',
      6: '心脏、血压、眼目与睡眠（午火）',
      7: '脾胃、免疫与内分泌（未土）',
      8: '肺脏、大肠与呼吸系统（申金）',
      9: '肺脏、呼吸道与筋骨（酉金）',
      10: '脾胃、腹腔与代谢循环（戌土）',
      11: '肾脏、水液代谢与腰膝（亥水）',
    };
    const organTip = hotPalace ? branchOrgan[hotPalace.branch] : '作息规律与情绪平衡';

    return [
      '**【疾厄宫与体质基础】**',
      `疾厄宫位于 ${jie ? `${STEMS[jie.stem]}${BRANCHES[jie.branch]}` : ''}：${formatStarList(jie)}。`,
      '',
      '**【倪师体系重点留意脏腑】**',
      `依照倪海厦《天纪》观法，除疾厄宫外，亦须审视全盘煞忌最集中之宫位地支。本盘煞忌重心在 **${hotPalace ? `${hotPalace.name}（${BRANCHES[hotPalace.branch]}宫）` : '疾厄宫'}**，对应需重点养护：**${organTip}**。`,
      '',
      '**【日常养生与子午流注建议】**',
      `保持晚上 11 点（子时胆经当令）前入睡，饮食温和规律，避免长期熬夜与过度思虑。本盘提示仅作传统养生参考，如有身体不适请务必及时就医。`,
    ].join('\n');
  }

  if (isPersonality) {
    return [
      '**【命宫主星核心性格】**',
      `命宫${mingBorrowed ? '为空宫（借迁移宫）' : '坐守'} **${mingMajors.join('、') || '无主星'}**，${chart.yinYangGender ?? ''} · **${chart.wuxingJuName}**。`,
      mingMajors.map((n) => `**${n}**：${STAR_DESCRIPTIONS[n] ?? ''}`).join('\n'),
      '',
      '**【外在表现与内心世界】**',
      `迁移宫（外在气质）：${formatStarList(qianyi)}。`,
      `福德宫（内心底色与精神追求）：${formatStarList(fude)}。`,
      '',
      '**【修身与成长方向】**',
      `发挥主星庙旺处的天赋，在面对化忌或煞星宫位时保持觉察：少一分急躁执念，多一分借势与合作，方能将先天格局推向更高层次。`,
    ].filter(Boolean).join('\n');
  }

  const topPatterns = patterns.slice(0, 4);
  const patternSection = topPatterns.length > 0
    ? topPatterns.map((p) => `- **${p.name}**（${p.palaces.join(' · ')}）：${p.description}`).join('\n')
    : '本盘以主星与三方四正稳健组合为主，宜结合大限走势发力。';

  return [
    '**【命格定性】**',
    `${chart.yinYangGender ?? ''} · **${chart.wuxingJuName}** · 命宫落于 **${ming ? `${STEMS[ming.stem]}${BRANCHES[ming.branch]}` : ''}**，${mingBorrowed ? '空宫借对宫' : '主星为'} **${mingMajors.join('、') || '空宫'}**。`,
    `${primaryStar}：${primaryDesc}`,
    '',
    '**【本盘核心格局】**',
    patternSection,
    '',
    '**【三方四正总览】**',
    `- **命宫**：${formatStarList(ming)}`,
    `- **财帛宫**：${formatStarList(caibo)}`,
    `- **官禄宫**：${formatStarList(guanlu)}`,
    `- **迁移宫**：${formatStarList(qianyi)}`,
    '',
    '**【当前大限与行动要点】**',
    currentDx
      ? `现年 ${chart.currentAge} 岁，正行 **${currentDx.startAge}–${currentDx.endAge} 岁【${currentDx.palaceName}】大限**。点击盘面任意宫位或星曜，可查看更细致的单宫与星性剖析。`
      : '可切换上方「本命 / 大限 / 流年」视图，观察四化随时间流转的落点变化。',
  ].join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const chart = body?.chart as ZiweiChart | undefined;
    const messages = (body?.messages ?? []) as { role: string; content: string }[];
    const lang: 'vi' | 'zh' = body?.lang === 'vi' ? 'vi' : 'zh';
    if (!chart || !Array.isArray(chart.palaces) || chart.palaces.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid chart payload' }), { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    const fullText = buildChartReading(chart, lastUserMessage, lang);

    const encoder = new TextEncoder();
    const chunks = fullText.match(/[\s\S]{1,18}/g) ?? [fullText];

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
    return new Response(JSON.stringify({ error: 'Interpretation failed' }), { status: 500 });
  }
}
