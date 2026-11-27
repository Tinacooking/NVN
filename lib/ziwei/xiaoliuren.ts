import { Solar } from 'lunar-javascript';

export interface XiaoLiuRenPalace {
  index: number;
  nameZh: string;
  nameVi: string;
  elementZh: string;
  elementVi: string;
  directionZh: string;
  directionVi: string;
  verdictZh: string;
  verdictVi: string;
  level: 'good' | 'neutral' | 'caution';
  verseZh: string;
  verseVi: string;
  summaryZh: string;
  summaryVi: string;
  domains: {
    careerVi: string;
    careerZh: string;
    wealthVi: string;
    wealthZh: string;
    loveVi: string;
    loveZh: string;
    travelVi: string;
    travelZh: string;
    lostVi: string;
    lostZh: string;
    healthVi: string;
    healthZh: string;
  };
}

export const XIAOLIUREN_PALACES: XiaoLiuRenPalace[] = [
  {
    index: 0,
    nameZh: '大安',
    nameVi: 'Đại An',
    elementZh: '木',
    elementVi: 'Mộc',
    directionZh: '正东',
    directionVi: 'Chính Đông',
    verdictZh: '大吉 · 静守安稳',
    verdictVi: 'Đại Cát · Tĩnh thủ an ổn',
    level: 'good',
    verseZh: '大安事事昌，求谋在东方；失物去不远，宅舍保安康。行人身未动，病者主无妨；将军回田野，仔细更推详。',
    verseVi: 'Đại An mọi việc hanh thông, cầu mưu hướng Đông; vật mất chưa đi xa, gia trạch bình an. Người đi chưa khởi hành, người bệnh không đáng ngại; giữ vững nền tảng ắt thành.',
    summaryZh: '诸事安稳顺遂，利静不利急进。适合守成、长期规划、签约与按部就班推进。',
    summaryVi: 'Mọi sự vững vàng thuận lợi, hợp tĩnh thủ và tiến bước chắc chắn hơn là nóng vội đổi thay đột ngột.',
    domains: {
      careerVi: 'Công việc ổn định, có quý nhân phương Đông nâng đỡ, thích hợp giữ vị trí hoặc phát triển từng bước.',
      careerZh: '事业稳中有进，利长期深耕与按章推进，东方有贵人助力。',
      wealthVi: 'Tài lộc chính tài bền vững, không nên đầu cơ mạo hiểm.',
      wealthZh: '正财稳健，宜守成积累，忌短线投机。',
      loveVi: 'Tình cảm êm đềm, chung thủy, thuận lợi cho cam kết lâu dài.',
      loveZh: '感情平稳安宁，重长久承诺，相处融洽。',
      travelVi: 'Chưa cần vội lên đường; nếu đi thì bình an thuận lợi.',
      travelZh: '行人尚未动身，若已启程则一路平安。',
      lostVi: 'Đồ thất lạc chưa đi xa, nên tìm ở gần nhà hoặc hướng Đông.',
      lostZh: '失物就在近处或家中东方，耐心寻找可得。',
      healthVi: 'Sức khỏe ổn định, không có đại ngại, chú ý nghỉ ngơi điều độ.',
      healthZh: '身体无大碍，静养调理即可恢复。',
    },
  },
  {
    index: 1,
    nameZh: '留连',
    nameVi: 'Lưu Liên',
    elementZh: '土',
    elementVi: 'Thổ',
    directionZh: '西南 / 四隅',
    directionVi: 'Tây Nam / Trung cung',
    verdictZh: '中平偏迟 · 纠缠缓行',
    verdictVi: 'Chậm trễ · Cần kiên nhẫn',
    level: 'caution',
    verseZh: '留连事难成，求谋日未明；官事凡宜缓，去者未回程。失物南方见，急讨方心称；更须防口舌，人口且平平。',
    verseVi: 'Lưu Liên việc dễ chậm thành, mưu sự còn chưa sáng tỏ; việc công nên hoãn, người đi chưa kịp về. Tìm đồ hướng Nam, cần chủ động thúc giục; đề phòng thị phi lời qua tiếng lại.',
    summaryZh: '事态拖延纠结，信息尚未明朗。此时切忌急躁拍板，宜放慢节奏、核实细节再行动。',
    summaryVi: 'Tiến độ dễ bị trì hoãn hoặc dây dưa, thông tin chưa rõ ràng. Không nên quyết định vội vàng, hãy rà soát kỹ chi tiết.',
    domains: {
      careerVi: 'Dự án dễ kéo dài hoặc vướng thủ tục; cần kiên trì theo sát và tránh tranh cãi.',
      careerZh: '推进易遇拖延或反复沟通，宜耐心核对细节，忌急于求成。',
      wealthVi: 'Tiền bạc về chậm, nên thận trọng với các khoản cho vay hoặc hợp tác mập mờ.',
      wealthZh: '资金回笼较慢，防账款拖欠，暂不宜大额投入。',
      loveVi: 'Dễ giận hờn hoặc dây dưa chuyện cũ, cần nói thẳng và giảm suy diễn.',
      loveZh: '情感易反复纠结，沟通切忌含糊，宜坦诚化解误会。',
      travelVi: 'Lịch trình dễ trễ giờ hoặc đổi kế hoạch, nên dự phòng thời gian.',
      travelZh: '行程易有延误或滞留，宜提前预留缓冲。',
      lostVi: 'Khó tìm thấy ngay, nên hỏi kỹ người xung quanh và kiểm tra hướng Nam.',
      lostZh: '失物一时难寻，往南方或角落细查，需主动追问。',
      healthVi: 'Bệnh mãn tính hoặc mệt mỏi kéo dài, cần điều trị kiên trì.',
      healthZh: '留意旧疾反复或脾胃湿滞，宜循序调养。',
    },
  },
  {
    index: 2,
    nameZh: '速喜',
    nameVi: 'Tốc Hỷ',
    elementZh: '火',
    elementVi: 'Hỏa',
    directionZh: '正南',
    directionVi: 'Chính Nam',
    verdictZh: '大吉 · 喜讯速至',
    verdictVi: 'Đại Cát · Tin vui đến nhanh',
    level: 'good',
    verseZh: '速喜喜来临，求财向南行；失物申未午，逢人路上寻。官事有福德，病者无祸侵；田宅六畜吉，行人有信音。',
    verseVi: 'Tốc Hỷ tin vui sắp tới, cầu tài hướng Nam; vật mất tìm vào giờ Ngọ Mùi Thân hoặc hỏi người gặp trên đường. Việc công thuận lợi, người bệnh chóng lành, người xa sắp có tin.',
    summaryZh: '喜气临门、反馈迅速。适合把握当下窗口期果断推进，沟通、谈判与求财皆易见喜讯。',
    summaryVi: 'Tin mừng đến nhanh, phản hồi tích cực. Rất thích hợp nắm bắt cơ hội, đàm phán, ký kết hoặc khởi động ngay.',
    domains: {
      careerVi: 'Cơ hội mở ra nhanh, phỏng vấn, ký hợp đồng hay trình bày đề án đều thuận.',
      careerZh: '好消息来得快，利面试、洽谈、签约与即时推进。',
      wealthVi: 'Tài vận khởi sắc nhanh, hướng Nam thuận lợi, dễ có khoản thu bất ngờ.',
      wealthZh: '财运明快，往南方求谋易见成效，宜顺势而为。',
      loveVi: 'Tình cảm thăng hoa, dễ nhận lời hồi đáp vui vẻ hoặc gặp nhân duyên sáng.',
      loveZh: '感情升温迅速，易有喜讯、告白或愉快邀约。',
      travelVi: 'Chuyến đi thuận lợi, sắp nhận tin tức từ người phương xa.',
      travelZh: '出行顺畅，远方之人很快传来音讯。',
      lostVi: 'Dễ tìm lại nhanh chóng, chú ý hướng Nam hoặc hỏi người đi ngang.',
      lostZh: '失物很快有望找回，留意南方或在午未申时寻找。',
      healthVi: 'Khí sắc tốt, nếu đang ốm thì hồi phục nhanh.',
      healthZh: '病痛易愈，状态迅速回升，注意防上火即可。',
    },
  },
  {
    index: 3,
    nameZh: '赤口',
    nameVi: 'Xích Khẩu',
    elementZh: '金',
    elementVi: 'Kim',
    directionZh: '正西',
    directionVi: 'Chính Tây',
    verdictZh: '小凶 · 防口舌是非',
    verdictVi: 'Cần thận trọng · Phòng khẩu thiệt',
    level: 'caution',
    verseZh: '赤口主口舌，官非切宜防；失物速速讨，行人有惊慌。六畜多作怪，病者出西方；更须防咀咒，诚恐染瘟皇。',
    verseVi: 'Xích Khẩu chủ về lời qua tiếng lại, cần tránh tranh chấp pháp lý; mất đồ phải tìm gấp, người đi xa dễ gặp trục trặc nhỏ. Giữ lời nói ôn hòa để hóa giải xung đột.',
    summaryZh: '易起争执、误解或突发小摩擦。凡事留三分余地，言辞克制、核清条款即可化险为夷。',
    summaryVi: 'Dễ nảy sinh tranh cãi, hiểu lầm hoặc va chạm nhỏ. Nên giữ bình tĩnh, kiểm tra kỹ văn bản và hạn chế lời nói gay gắt.',
    domains: {
      careerVi: 'Tránh tranh luận nóng nảy nơi công sở; làm việc gì cũng cần xác nhận rõ bằng văn bản.',
      careerZh: '防职场争执与沟通误会，重要事项留好书面记录。',
      wealthVi: 'Dễ hao tài bất ngờ hoặc tranh chấp quyền lợi, không nên tranh cãi khi giao dịch.',
      wealthZh: '防意外破费或合同纠纷，交易务必看清条款。',
      loveVi: 'Coi chừng cãi vã vì lời nói thiếu kiềm chế; nhường một bước trời cao biển rộng.',
      loveZh: '易因言语冲动起争执，退一步则风平浪静。',
      travelVi: 'Đi lại chú ý an toàn giao thông và giữ bình tĩnh khi gặp sự cố nhỏ.',
      travelZh: '出行留意交通安全与突发小插曲，切忌抢行。',
      lostVi: 'Phải tìm ngay lập tức, để lâu khó lấy lại.',
      lostZh: '失物须立刻寻找，拖延则恐难追回。',
      healthVi: 'Chú ý đường hô hấp, vết thương nhỏ do kim loại hoặc căng thẳng thần kinh.',
      healthZh: '留意咽喉呼吸与外伤碰擦，情绪宜平稳。',
    },
  },
  {
    index: 4,
    nameZh: '小吉',
    nameVi: 'Tiểu Cát',
    elementZh: '水',
    elementVi: 'Thủy',
    directionZh: '正北 / 西南',
    directionVi: 'Chính Bắc / Tây Nam',
    verdictZh: '吉 · 和合贵人助',
    verdictVi: 'Cát · Hòa hợp có quý nhân',
    level: 'good',
    verseZh: '小吉最吉昌，路上好商量；阴人来报喜，失物在坤方。行人即便至，交关甚是强；凡事皆和合，病者叩穷苍。',
    verseVi: 'Tiểu Cát rất tốt lành, gặp gỡ bàn bạc đều thuận; có quý nhân báo tin vui, vật mất ở hướng Tây Nam. Người xa sắp về, giao dịch thuận lợi, mọi sự đều hòa hợp.',
    summaryZh: '和合顺畅、贵人相助。特别利于合作洽谈、人际联结、情感推进与稳健成事。',
    summaryVi: 'Hòa hợp thuận buồm xuôi gió, có quý nhân hỗ trợ. Rất tốt cho hợp tác, gặp gỡ đối tác, giao dịch và chuyện tình cảm.',
    domains: {
      careerVi: 'Hợp tác ăn ý, đàm phán dễ đạt đồng thuận, có nữ quý nhân hoặc đồng nghiệp giúp sức.',
      careerZh: '合作顺遂，洽谈易成，多得人脉与贵人相助。',
      wealthVi: 'Buôn bán, giao dịch thuận lợi, lợi nhuận đến từ sự kết nối và uy tín.',
      wealthZh: '交易顺畅，利合伙生财与稳健获益。',
      loveVi: 'Nhân duyên hòa hợp, ngọt ngào, rất tốt cho hẹn hò, cưới hỏi hoặc làm lành.',
      loveZh: '姻缘和合美满，利相亲、约会与修复关系。',
      travelVi: 'Người mong đợi sắp về tới nơi, xuất hành gặp nhiều may mắn.',
      travelZh: '行人将至，外出办事遇事好商量。',
      lostVi: 'Tìm về hướng Tây Nam, khả năng cao sẽ tìm thấy.',
      lostZh: '失物多在西南方向，有望顺利找回。',
      healthVi: 'Tình trạng khả quan, tinh thần thoải mái sẽ mau bình phục.',
      healthZh: '整体向好，保持心情舒畅有助于康复。',
    },
  },
  {
    index: 5,
    nameZh: '空亡',
    nameVi: 'Không Vong',
    elementZh: '土',
    elementVi: 'Thổ',
    directionZh: '中央',
    directionVi: 'Trung ương',
    verdictZh: '凶 / 落空 · 宜静观待时',
    verdictVi: 'Lạc không · Nên tĩnh quan đợi thời',
    level: 'caution',
    verseZh: '空亡事不祥，阴人多乖张；求财无利益，行人有灾殃。失物寻不见，官事有刑伤；病人逢暗鬼，解禳保安康。',
    verseVi: 'Không Vong việc dễ thành công cốc, cầu tài chưa có lợi, người đi dễ gặp trở ngại. Vật mất khó tìm thấy ngay; lúc này tốt nhất nên tạm dừng, tránh cưỡng cầu và chờ thời cơ mới.',
    summaryZh: '时机未熟、事易落空或徒劳无功。不宜强行推进或盲目承诺，宜沉淀复盘、待新周期再起。',
    summaryVi: 'Thời cơ chưa chín muồi, dễ tốn công vô ích hoặc kế hoạch bị hụt. Nên tạm hoãn quyết định lớn, thu gọn rủi ro và chờ chu kỳ mới.',
    domains: {
      careerVi: 'Kế hoạch dễ thay đổi phút chót hoặc chưa có kết quả; phù hợp làm việc âm thầm chuẩn bị.',
      careerZh: '计划易生变或暂落空，宜借机复盘蓄力，暂缓重大拍板。',
      wealthVi: 'Không thuận cầu tài hay đầu tư mới; ưu tiên giữ tiền mặt an toàn.',
      wealthZh: '求财暂无利，守住现金流，切勿听信空头承诺。',
      loveVi: 'Dễ có cảm giác hụt hẫng hoặc xa cách; tránh kỳ vọng quá cao trong ngắn hạn.',
      loveZh: '彼此易生疏离感，宜先安顿内心，不必强求即时答案。',
      travelVi: 'Chuyến đi dễ bị hủy hoặc không đạt mục đích ban đầu.',
      travelZh: '出行易扑空或临时取消，出发前务必再次确认。',
      lostVi: 'Rất khó tìm lại, cần chuẩn bị phương án thay thế.',
      lostZh: '失物较难寻回，宜早作替代准备。',
      healthVi: 'Chú ý nghỉ ngơi, tránh kiệt sức và kiểm tra sức khỏe nếu thấy bất thường.',
      healthZh: '注意气血虚弱与情绪低落，必要时及时检查调理。',
    },
  },
];

export interface XiaoLiuRenResult {
  monthStep: number;
  dayStep: number;
  hourStep: number;
  monthPalace: XiaoLiuRenPalace;
  dayPalace: XiaoLiuRenPalace;
  finalPalace: XiaoLiuRenPalace;
  inputs: [number, number, number];
  lunarLabel?: string;
}

export function calculateXiaoLiuRen(n1: number, n2: number, n3: number, lunarLabel?: string): XiaoLiuRenResult {
  const a = Math.max(1, Math.floor(Math.abs(n1)));
  const b = Math.max(1, Math.floor(Math.abs(n2)));
  const c = Math.max(1, Math.floor(Math.abs(n3)));

  const monthStep = (a - 1) % 6;
  const dayStep = (monthStep + b - 1) % 6;
  const hourStep = (dayStep + c - 1) % 6;

  return {
    monthStep,
    dayStep,
    hourStep,
    monthPalace: XIAOLIUREN_PALACES[monthStep],
    dayPalace: XIAOLIUREN_PALACES[dayStep],
    finalPalace: XIAOLIUREN_PALACES[hourStep],
    inputs: [a, b, c],
    lunarLabel,
  };
}

const SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHICHEN_NAMES_VI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

export function getCurrentLunarXiaoLiuRenInput(date = new Date()): {
  lunarMonth: number;
  lunarDay: number;
  shichenNum: number; // 1..12
  labelZh: string;
  labelVi: string;
} {
  const lunar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunar();
  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();
  const h = date.getHours();
  const branchIdx = h === 23 ? 0 : Math.floor((h + 1) / 2) % 12;
  const shichenNum = branchIdx + 1;
  return {
    lunarMonth,
    lunarDay,
    shichenNum,
    labelZh: `农历 ${lunarMonth}月${lunarDay}日 ${SHICHEN_NAMES[branchIdx]}时`,
    labelVi: `Âm lịch tháng ${lunarMonth} ngày ${lunarDay} giờ ${SHICHEN_NAMES_VI[branchIdx]} (${SHICHEN_NAMES[branchIdx]}时)`,
  };
}
