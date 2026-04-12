export interface SubTheme {
  id: string;
  name: string;
  icon: string;
  description: string;
  presetQuestions: string[];
}

export interface MainTheme {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subThemes: SubTheme[];
}

type ThemeId = 'love' | 'career' | 'spiritual' | 'health' | 'finance';

function buildPresetQuestions(themeId: ThemeId, subThemeName: string) {
  const general = [
    `Điều cốt lõi mình cần hiểu về ${subThemeName.toLowerCase()} lúc này là gì?`,
    `Năng lượng nào đang ảnh hưởng mạnh nhất đến ${subThemeName.toLowerCase()} của mình?`,
    `Mình nên ưu tiên điều gì để xử lý ${subThemeName.toLowerCase()} rõ ràng hơn?`,
    `Bài học lớn nhất mà ${subThemeName.toLowerCase()} đang mang đến cho mình là gì?`,
  ];

  const themeSpecific: Record<ThemeId, string[]> = {
    love: [
      `${subThemeName} đang phản chiếu cảm xúc thật nào của mình?`,
      `Nếu mình chủ động hơn trong ${subThemeName.toLowerCase()}, điều gì có thể thay đổi?`,
    ],
    career: [
      `Hướng đi nào trong ${subThemeName.toLowerCase()} đang có tiềm năng nhất với mình?`,
      `Mình cần tránh điều gì để ${subThemeName.toLowerCase()} không bị chững lại?`,
    ],
    spiritual: [
      `${subThemeName} đang mở ra thông điệp nội tâm nào cho mình?`,
      `Trực giác muốn nhắc mình điều gì qua chủ đề ${subThemeName.toLowerCase()}?`,
    ],
    health: [
      `Điều gì trong ${subThemeName.toLowerCase()} đang cần được lắng nghe sớm hơn?`,
      `Mình nên chăm sóc bản thân thế nào để ${subThemeName.toLowerCase()} cân bằng hơn?`,
    ],
    finance: [
      `Điểm mạnh tài chính nào mình chưa tận dụng tốt trong ${subThemeName.toLowerCase()}?`,
      `Quyết định nào sẽ giúp ${subThemeName.toLowerCase()} bền vững hơn về lâu dài?`,
    ],
  };

  return [...general, ...themeSpecific[themeId]];
}

function createSubThemes(
  themeId: ThemeId,
  defaultIcon: string,
  entries: Array<{ id: string; name: string; description: string; icon?: string }>,
): SubTheme[] {
  return entries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    icon: entry.icon ?? defaultIcon,
    description: entry.description,
    presetQuestions: buildPresetQuestions(themeId, entry.name),
  }));
}

export const mainThemes: MainTheme[] = [
  {
    id: 'love',
    name: 'Tình cảm',
    icon: '💞',
    color: 'rose',
    description: 'Soi sâu cảm xúc, kết nối, người cũ và tương lai của các mối quan hệ.',
    subThemes: createSubThemes('love', '💗', [
      { id: 'ex', name: 'Người yêu cũ', description: 'Nhìn lại mối quan hệ đã qua và khả năng khép lại hoặc quay về.' },
      { id: 'current-love', name: 'Người yêu hiện tại', description: 'Hiểu nhịp cảm xúc và điều cần vun đắp trong mối quan hệ hiện nay.' },
      { id: 'future-love', name: 'Người yêu tương lai', description: 'Khám phá năng lượng tình duyên sắp đến.' },
      { id: 'ambiguous', name: 'Mối quan hệ mập mờ', description: 'Làm rõ cảm xúc và tín hiệu chưa rõ ràng.' },
      { id: 'crush', name: 'Crush / Thầm thích', description: 'Đọc nhịp rung động và khả năng tiến thêm một bước.' },
      { id: 'secret-admirer', name: 'Người thương bạn', description: 'Ai đang âm thầm để ý hoặc quan sát bạn.' },
      { id: 'someone', name: 'Người ấy', description: 'Tập trung vào một người cụ thể bạn đang nghĩ đến.' },
      { id: 'marriage', name: 'Hôn nhân', description: 'Cam kết, đời sống vợ chồng và bài học dài hạn.' },
      { id: 'conflict', name: 'Giải quyết xung đột', description: 'Tháo gỡ mâu thuẫn, hiểu lầm hoặc khoảng cách.' },
      { id: 'breakup', name: 'Chia tay và hàn gắn', description: 'Năng lượng sau chia tay và khả năng nối lại.' },
      { id: 'reconciliation', name: 'Gương vỡ lại lành', description: 'Liệu hai người có thể quay lại với nhau không.' },
      { id: 'long-distance', name: 'Yêu xa', description: 'Khoảng cách địa lý ảnh hưởng thế nào đến kết nối.' },
      { id: 'jealousy', name: 'Người thứ ba / Ghen tuông', description: 'Nghi ngờ, mất an toàn và điều cần nhìn thẳng.' },
      { id: 'self-love', name: 'Yêu bản thân', description: 'Chữa lành trái tim và xây lại giá trị cá nhân.' },
      { id: 'friendship', name: 'Tình bạn / Tri kỷ', description: 'Kết nối bền chặt ngoài tình yêu lãng mạn.' },
      { id: 'family-love', name: 'Gia đình', description: 'Nhịp cảm xúc và gắn kết trong gia đình.' },
      { id: 'pregnancy', name: 'Con cái / Thai kỳ', description: 'Năng lượng về kế hoạch gia đình và chăm sóc.' },
      { id: 'gossip', name: 'Thị phi / Đàm tiếu', description: 'Những tiếng nói bên ngoài tác động đến mối quan hệ.' },
      { id: 'toxic-relationship', name: 'Quan hệ độc hại', description: 'Nhận diện vòng lặp mệt mỏi và cách thoát ra.' },
      { id: 'soulmate', name: 'Soulmate / Tri kỷ', description: 'Sự đồng điệu sâu sắc và bài học linh hồn.' },
    ]),
  },
  {
    id: 'career',
    name: 'Sự nghiệp',
    icon: '💼',
    color: 'amber',
    description: 'Công việc, định hướng nghề nghiệp, môi trường làm việc và cơ hội phát triển.',
    subThemes: createSubThemes('career', '📈', [
      { id: 'career-general', name: 'Sự nghiệp tổng quan', description: 'Nhìn tổng thể đường nghề nghiệp hiện tại.' },
      { id: 'job-search', name: 'Xin việc làm', description: 'Cơ hội mới, hồ sơ, nhà tuyển dụng và thời điểm phù hợp.' },
      { id: 'promotion', name: 'Thăng tiến', description: 'Khả năng bước lên vị trí hoặc mức đãi ngộ mới.' },
      { id: 'business', name: 'Kinh doanh', description: 'Sự vận hành, cơ hội tăng trưởng và rủi ro.' },
      { id: 'colleague', name: 'Đồng nghiệp và cấp trên', description: 'Đọc thế tương tác ở nơi làm việc.' },
      { id: 'career-change', name: 'Chuyển nghề', description: 'Đổi hướng đi, thử lĩnh vực mới và dấu hiệu nên dịch chuyển.' },
      { id: 'freelance', name: 'Freelance / Tự do', description: 'Làm việc độc lập, khách hàng và nhịp tài chính.' },
      { id: 'interview', name: 'Phỏng vấn', description: 'Cơ hội đậu, cách thể hiện và điều cần chuẩn bị.' },
      { id: 'legal', name: 'Pháp lý / Hợp đồng', description: 'Giấy tờ, cam kết, thủ tục cần chú ý.' },
      { id: 'moving', name: 'Chuyển chỗ / Xuất ngoại', description: 'Dịch chuyển vì công việc hoặc cơ hội sống mới.' },
      { id: 'burnout', name: 'Kiệt sức / Áp lực', description: 'Dấu hiệu quá tải và cách lấy lại nhịp.' },
      { id: 'startup', name: 'Khởi nghiệp', description: 'Độ chín của ý tưởng và đường triển khai.' },
      { id: 'workplace-politics', name: 'Thị phi công sở', description: 'Đấu đá, ngầm cạnh tranh hoặc căng thẳng nội bộ.' },
      { id: 'side-hustle', name: 'Nghề tay trái', description: 'Nguồn thu phụ, dự án cá nhân và khả năng mở rộng.' },
    ]),
  },
  {
    id: 'spiritual',
    name: 'Tâm linh',
    icon: '🔮',
    color: 'purple',
    description: 'Tâm linh, trực giác, định hướng bản thân và hành trình phát triển nội tâm.',
    subThemes: createSubThemes('spiritual', '✨', [
      { id: 'study', name: 'Học tập', description: 'Định hướng học hành, năng lực và nhịp tiến bộ.' },
      { id: 'study-abroad', name: 'Du học', description: 'Hướng đi xa, cơ hội học tập quốc tế.' },
      { id: 'self-direction', name: 'Định hướng bản thân', description: 'Tìm lại trục cá nhân và điều mình thật sự muốn.' },
      { id: 'purpose', name: 'Sứ mệnh / Mục đích sống', description: 'Điều sâu nhất bạn đang được mời gọi theo đuổi.' },
      { id: 'shadow-self', name: 'Bóng đậm nội tâm', description: 'Những phần bị kìm nén hoặc né tránh bên trong.' },
      { id: 'decision', name: 'Ra quyết định', description: 'Đọc trực giác trước lựa chọn quan trọng.' },
      { id: 'travel', name: 'Du lịch / Di chuyển', description: 'Năng lượng dịch chuyển và trải nghiệm mới.' },
      { id: 'spiritual-awakening', name: 'Thức tỉnh tâm linh', description: 'Dấu hiệu mở rộng nhận thức và thay đổi bên trong.' },
      { id: 'dream', name: 'Giải mã giấc mơ', description: 'Thông điệp từ vô thức và trực giác trong giấc mơ.' },
      { id: 'past-life', name: 'Tiền kiếp', description: 'Những mối dây cũ ảnh hưởng đến hiện tại.' },
      { id: 'karma', name: 'Nghiệp quả', description: 'Vòng lặp bài học và cách hóa giải.' },
      { id: 'lost-item', name: 'Tìm đồ thất lạc', description: 'Manh mối, hướng tìm và thông điệp ẩn sau mất mát.' },
      { id: 'exams', name: 'Thi cử / Kiểm tra', description: 'Tập trung, tâm lý và kết quả.' },
      { id: 'scholarship', name: 'Học bổng', description: 'Cơ hội vươn xa, ghi nhận và nỗ lực cần thiết.' },
      { id: 'talent', name: 'Năng khiếu / Đam mê', description: 'Điểm sáng bẩm sinh bạn nên nuôi lớn.' },
      { id: 'spirit-guide', name: 'Thần hộ mệnh', description: 'Những tín hiệu dẫn lối tinh tế quanh bạn.' },
      { id: 'intuition', name: 'Trực giác', description: 'Cách lắng nghe tiếng nói bên trong rõ hơn.' },
      { id: 'manifestation', name: 'Manifest / Thu hút', description: 'Điều gì đang đồng điệu hoặc nghịch pha với mong muốn của bạn.' },
      { id: 'inner-child', name: 'Chữa lành đứa trẻ bên trong', description: 'Chạm vào nhu cầu cũ để trưởng thành dịu dàng hơn.' },
      { id: 'boundaries', name: 'Ranh giới cá nhân', description: 'Học cách bảo vệ năng lượng của chính mình.' },
    ]),
  },
  {
    id: 'health',
    name: 'Sức khỏe',
    icon: '🌿',
    color: 'emerald',
    description: 'Cân bằng thể chất, tinh thần, năng lượng và tiến trình chữa lành.',
    subThemes: createSubThemes('health', '🕊️', [
      { id: 'health-general', name: 'Sức khỏe thể chất', description: 'Lắng nghe cơ thể và nhịp sinh hoạt hiện tại.' },
      { id: 'mental', name: 'Sức khỏe tinh thần', description: 'Cảm xúc, lo âu, mệt mỏi tinh thần và hồi phục.' },
      { id: 'energy', name: 'Năng lượng / Chakra', description: 'Dòng chảy năng lượng, tắc nghẽn và cân bằng.' },
      { id: 'diet', name: 'Điều độ / Chăm sóc', description: 'Lối sống, ăn uống và nhịp chăm sóc bản thân.' },
      { id: 'pet', name: 'Thú cưng', description: 'Kết nối, quan tâm và tín hiệu từ người bạn nhỏ.' },
      { id: 'healing', name: 'Chữa lành tâm hồn', description: 'Quá trình phục hồi sau tổn thương.' },
      { id: 'stress', name: 'Căng thẳng / Âu lo', description: 'Nguồn áp lực đang bào mòn năng lượng của bạn.' },
      { id: 'trauma', name: 'Tổn thương quá khứ', description: 'Vết thương cũ và hành trình đi qua nó.' },
      { id: 'sleep', name: 'Giấc ngủ', description: 'Đọc nhịp nghỉ ngơi và lý do cơ thể chưa thật sự hồi phục.' },
      { id: 'balance', name: 'Cân bằng cuộc sống', description: 'Điểm lệch giữa làm việc, nghỉ ngơi và cảm xúc.' },
    ]),
  },
  {
    id: 'finance',
    name: 'Tài chính',
    icon: '💰',
    color: 'yellow',
    description: 'Dòng tiền, tích lũy, đầu tư và các quyết định tiền bạc quan trọng.',
    subThemes: createSubThemes('finance', '💎', [
      { id: 'finance-general', name: 'Tài chính tổng quan', description: 'Bức tranh tiền bạc và độ ổn định hiện tại.' },
      { id: 'investment', name: 'Đầu tư / Chứng khoán', description: 'Cơ hội, rủi ro và nhịp thời điểm.' },
      { id: 'debt', name: 'Nợ nần / Vay mượn', description: 'Áp lực tài chính, trả nợ và cách tháo gỡ.' },
      { id: 'savings', name: 'Tiết kiệm', description: 'Tích lũy, kỷ luật và sự an toàn dài hạn.' },
      { id: 'luck-money', name: 'Lộc tài / May mắn', description: 'Năng lượng thu hút tiền và thời vận.' },
      { id: 'real-estate', name: 'Bất động sản', description: 'Mua bán, chuyển nhượng và đầu tư nhà đất.' },
      { id: 'financial-loss', name: 'Thua lỗ / Khó khăn', description: 'Những rò rỉ tiền bạc cần nhìn rõ.' },
      { id: 'sudden-wealth', name: 'Vận may bất ngờ', description: 'Khoản thu đến nhanh, cơ hội hiếm hoặc cú hích tài chính.' },
      { id: 'budgeting', name: 'Quản lý chi tiêu', description: 'Kế hoạch chi tiêu và chỗ cần siết lại.' },
      { id: 'pricing', name: 'Định giá bản thân', description: 'Mức thu nhập bạn xứng đáng nhận và cách thể hiện giá trị.' },
    ]),
  },
];

