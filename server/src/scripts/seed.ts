import sequelize, { connectDatabase } from '../config/database';
import { Card } from '../models';
import dotenv from 'dotenv';

dotenv.config();

// Import card data from frontend
interface TarotCard {
  id: number;
  name: string;
  slug: string;
  imagePath: string;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  description: string;
  group: string;
}

// Define all tarot cards (copied from frontend)
const getCardImage = (cardName: string): string => {
  return `/src/tarrotcard/${cardName}.jpg`;
};

const majorArcana: TarotCard[] = [
  { id: 0, name: 'The Fool', slug: 'the-fool', imagePath: getCardImage('The Fool'), keywords: ['Khởi đầu', 'Tự do', 'Phiêu lưu'], uprightMeaning: 'Một khởi đầu mới đầy hứng khởi. Hãy tin vào trực giác và dũng cảm bước đi.', reversedMeaning: 'Liều lĩnh, thiếu suy nghĩ. Cần cẩn trọng hơn trước khi hành động.', description: 'The Fool đại diện cho sự ngây thơ, tự do và những bước đầu tiên trên hành trình mới.', group: 'major' },
  { id: 1, name: 'The Magician', slug: 'the-magician', imagePath: getCardImage('The Magician'), keywords: ['Sáng tạo', 'Ý chí', 'Kỹ năng'], uprightMeaning: 'Bạn có mọi công cụ cần thiết. Hãy hành động với sự tập trung và quyết tâm.', reversedMeaning: 'Lãng phí tài năng, thiếu tập trung hoặc lừa dối.', description: 'The Magician tượng trưng cho sức mạnh sáng tạo, ý chí và khả năng biến ước mơ thành hiện thực.', group: 'major' },
  { id: 2, name: 'The High Priestess', slug: 'the-high-priestess', imagePath: getCardImage('RWS_Tarot_02_High_Priestess'), keywords: ['Trực giác', 'Bí ẩn', 'Tiềm thức'], uprightMeaning: 'Hãy lắng nghe trực giác. Câu trả lời nằm trong nội tâm bạn.', reversedMeaning: 'Bỏ qua trực giác, bí mật bị che giấu.', description: 'The High Priestess đại diện cho trí tuệ nội tâm, sự bí ẩn và tri thức ẩn giấu.', group: 'major' },
  { id: 3, name: 'The Empress', slug: 'the-empress', imagePath: getCardImage('The Empress'), keywords: ['Nuôi dưỡng', 'Dồi dào', 'Thiên nhiên'], uprightMeaning: 'Thời kỳ màu mỡ, sáng tạo dồi dào. Hãy chăm sóc bản thân và người xung quanh.', reversedMeaning: 'Phụ thuộc, sáng tạo bị tắc nghẽn, thiếu chăm sóc bản thân.', description: 'The Empress tượng trưng cho sự nuôi dưỡng, vẻ đẹp và sự phong phú của cuộc sống.', group: 'major' },
  { id: 4, name: 'The Emperor', slug: 'the-emperor', imagePath: getCardImage('The Emperor'), keywords: ['Quyền lực', 'Kỷ luật', 'Ổn định'], uprightMeaning: 'Cần sự kỷ luật và tổ chức. Lãnh đạo bằng lý trí và cấu trúc.', reversedMeaning: 'Kiểm soát quá mức, cứng nhắc, lạm quyền.', description: 'The Emperor đại diện cho quyền uy, sự ổn định và khả năng lãnh đạo.', group: 'major' },
  { id: 5, name: 'The Hierophant', slug: 'the-hierophant', imagePath: getCardImage('The Hierophant'), keywords: ['Truyền thống', 'Đức tin', 'Giáo huấn'], uprightMeaning: 'Tìm kiếm sự hướng dẫn từ truyền thống, thầy cô hoặc tổ chức đáng tin.', reversedMeaning: 'Phá vỡ quy tắc, tự do tư tưởng, thách thức truyền thống.', description: 'The Hierophant tượng trưng cho truyền thống, giáo dục và sự kết nối tâm linh.', group: 'major' },
  { id: 6, name: 'The Lovers', slug: 'the-lovers', imagePath: getCardImage('The Lovers'), keywords: ['Tình yêu', 'Lựa chọn', 'Hòa hợp'], uprightMeaning: 'Tình yêu và sự hòa hợp. Một lựa chọn quan trọng cần được đưa ra từ trái tim.', reversedMeaning: 'Mâu thuẫn trong mối quan hệ, lựa chọn sai lầm.', description: 'The Lovers đại diện cho tình yêu, sự lựa chọn và mối quan hệ đối tác.', group: 'major' },
  { id: 7, name: 'The Chariot', slug: 'the-chariot', imagePath: getCardImage('The Chariot'), keywords: ['Chiến thắng', 'Quyết tâm', 'Kiểm soát'], uprightMeaning: 'Chiến thắng qua ý chí mạnh mẽ. Kiểm soát cảm xúc để tiến về phía trước.', reversedMeaning: 'Mất phương hướng, thiếu kiểm soát, hung hăng.', description: 'The Chariot tượng trưng cho sự chiến thắng, quyết tâm và khả năng vượt qua trở ngại.', group: 'major' },
  { id: 8, name: 'Strength', slug: 'strength', imagePath: getCardImage('Strength'), keywords: ['Sức mạnh', 'Dũng cảm', 'Kiên nhẫn'], uprightMeaning: 'Sức mạnh nội tâm và lòng dũng cảm. Kiên nhẫn sẽ giúp bạn vượt qua.', reversedMeaning: 'Tự ti, yếu đuối, thiếu tự tin.', description: 'Strength đại diện cho sức mạnh nội tâm, lòng dũng cảm và sự kiên nhẫn.', group: 'major' },
  { id: 9, name: 'The Hermit', slug: 'the-hermit', imagePath: getCardImage('The Hermit'), keywords: ['Nội tâm', 'Cô độc', 'Tìm kiếm'], uprightMeaning: 'Thời gian để suy ngẫm và tìm kiếm nội tâm. Sự cô đơn mang lại trí tuệ.', reversedMeaning: 'Cô lập quá mức, từ chối sự giúp đỡ.', description: 'The Hermit tượng trưng cho sự tìm kiếm nội tâm, thiền định và trí tuệ.', group: 'major' },
  { id: 10, name: 'Wheel of Fortune', slug: 'wheel-of-fortune', imagePath: getCardImage('Wheel of Fortune'), keywords: ['Vận mệnh', 'Thay đổi', 'Chu kỳ'], uprightMeaning: 'Vận may đang quay. Thay đổi tích cực sắp đến, hãy nắm bắt cơ hội.', reversedMeaning: 'Vận xui, kháng cự thay đổi, mất kiểm soát.', description: 'Wheel of Fortune đại diện cho sự thay đổi, chu kỳ của cuộc sống và số phận.', group: 'major' },
  { id: 11, name: 'Justice', slug: 'justice', imagePath: getCardImage('Justice'), keywords: ['Công bằng', 'Sự thật', 'Cân bằng'], uprightMeaning: 'Công bằng sẽ được thực thi. Hành động đúng đắn sẽ được đền đáp.', reversedMeaning: 'Bất công, thiếu trung thực, hậu quả xấu.', description: 'Justice tượng trưng cho sự công bằng, trung thực và cân bằng.', group: 'major' },
  { id: 12, name: 'The Hanged Man', slug: 'the-hanged-man', imagePath: getCardImage('The Hanged Man'), keywords: ['Hy sinh', 'Buông bỏ', 'Góc nhìn mới'], uprightMeaning: 'Hãy buông bỏ và nhìn mọi thứ từ góc độ khác. Sự hy sinh mang lại giác ngộ.', reversedMeaning: 'Bế tắc, từ chối thay đổi, hy sinh vô ích.', description: 'The Hanged Man đại diện cho sự buông bỏ, hy sinh và những góc nhìn mới.', group: 'major' },
  { id: 13, name: 'Death', slug: 'death', imagePath: getCardImage('Death'), keywords: ['Kết thúc', 'Chuyển hóa', 'Tái sinh'], uprightMeaning: 'Kết thúc một chương cũ để bắt đầu chương mới. Chuyển hóa sâu sắc.', reversedMeaning: 'Kháng cự thay đổi, sợ hãi kết thúc, trì trệ.', description: 'Death tượng trưng cho sự kết thúc, chuyển hóa và tái sinh — không phải cái chết thể xác.', group: 'major' },
  { id: 14, name: 'Temperance', slug: 'temperance', imagePath: getCardImage('Temperance'), keywords: ['Cân bằng', 'Kiên nhẫn', 'Hòa hợp'], uprightMeaning: 'Tìm sự cân bằng và hài hòa. Kiên nhẫn và điều độ là chìa khóa.', reversedMeaning: 'Mất cân bằng, vội vàng, quá độ.', description: 'Temperance đại diện cho sự cân bằng, kiên nhẫn và con đường trung dung.', group: 'major' },
  { id: 15, name: 'The Devil', slug: 'the-devil', imagePath: getCardImage('The Devil'), keywords: ['Ràng buộc', 'Cám dỗ', 'Bóng tối'], uprightMeaning: 'Cảnh báo về sự ràng buộc, nghiện ngập hoặc mối quan hệ độc hại.', reversedMeaning: 'Giải thoát, phá vỡ xiềng xích, nhận ra sự thật.', description: 'The Devil tượng trưng cho sự cám dỗ, ràng buộc và bóng tối nội tâm.', group: 'major' },
  { id: 16, name: 'The Tower', slug: 'the-tower', imagePath: getCardImage('The Tower'), keywords: ['Sụp đổ', 'Giác ngộ', 'Thay đổi đột ngột'], uprightMeaning: 'Sự thay đổi đột ngột, đau đớn nhưng cần thiết. Sự thật được phơi bày.', reversedMeaning: 'Tránh được thảm họa, thay đổi nhỏ, sợ thay đổi.', description: 'The Tower đại diện cho sự sụp đổ đột ngột, giác ngộ và xây dựng lại.', group: 'major' },
  { id: 17, name: 'The Star', slug: 'the-star', imagePath: getCardImage('The Star'), keywords: ['Hy vọng', 'Cảm hứng', 'Thanh thản'], uprightMeaning: 'Hy vọng và cảm hứng sau cơn bão. Tương lai tươi sáng đang chờ.', reversedMeaning: 'Mất hy vọng, thất vọng, thiếu niềm tin.', description: 'The Star tượng trưng cho hy vọng, sự chữa lành và cảm hứng thiêng liêng.', group: 'major' },
  { id: 18, name: 'The Moon', slug: 'the-moon', imagePath: getCardImage('The Moon'), keywords: ['Ảo giác', 'Trực giác', 'Lo sợ'], uprightMeaning: 'Mọi thứ không như bề ngoài. Tin vào trực giác nhưng cẩn thận với ảo tưởng.', reversedMeaning: 'Sự thật được sáng tỏ, vượt qua nỗi sợ.', description: 'The Moon đại diện cho sự bí ẩn, ảo tưởng và thế giới tiềm thức.', group: 'major' },
  { id: 19, name: 'The Sun', slug: 'the-sun', imagePath: getCardImage('The Sun'), keywords: ['Niềm vui', 'Thành công', 'Tích cực'], uprightMeaning: 'Niềm vui, thành công và sự tích cực. Mọi thứ sáng sủa và rõ ràng.', reversedMeaning: 'Niềm vui tạm thời, quá tự tin, thiếu rõ ràng.', description: 'The Sun tượng trưng cho niềm vui thuần khiết, sự thành công và năng lượng tích cực.', group: 'major' },
  { id: 20, name: 'Judgement', slug: 'judgement', imagePath: getCardImage('Judgement'), keywords: ['Phán xét', 'Hồi sinh', 'Tỉnh thức'], uprightMeaning: 'Thời điểm đánh giá lại cuộc sống. Lời kêu gọi thức tỉnh và tái sinh.', reversedMeaning: 'Tự phán xét quá khắt khe, từ chối thay đổi.', description: 'Judgement đại diện cho sự phán xét, tỉnh thức và hồi sinh tinh thần.', group: 'major' },
  { id: 21, name: 'The World', slug: 'the-world', imagePath: getCardImage('The World'), keywords: ['Hoàn thành', 'Trọn vẹn', 'Thành tựu'], uprightMeaning: 'Hoàn thành một chu kỳ lớn. Thành tựu và sự trọn vẹn đang đến.', reversedMeaning: 'Chưa hoàn thành, thiếu kết thúc, trì hoãn.', description: 'The World tượng trưng cho sự hoàn thành, trọn vẹn và thành tựu cuối cùng.', group: 'major' },
];

function createMinorCards(suit: string, suitVi: string, group: string): TarotCard[] {
  const courtCards = ['Page', 'Knight', 'Queen', 'King'];
  const courtVi = ['Thị vệ', 'Hiệp sĩ', 'Nữ hoàng', 'Vua'];
  const cards: TarotCard[] = [];

  const suitKeywords: Record<string, string[]> = {
    Wands: ['Đam mê', 'Hành động', 'Năng lượng'],
    Cups: ['Cảm xúc', 'Tình yêu', 'Trực giác'],
    Swords: ['Tư duy', 'Xung đột', 'Sự thật'],
    Pentacles: ['Vật chất', 'Tài chính', 'Ổn định'],
  };

  const baseId = group === 'wands' ? 22 : group === 'cups' ? 36 : group === 'swords' ? 50 : 64;

  const numberNames: Record<number, string> = {
    1: 'Ace', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
    6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten'
  };

  for (let i = 1; i <= 14; i++) {
    const isNumber = i <= 10;
    const name = isNumber ? `${i === 1 ? 'Ace' : numberNames[i]} of ${suit}` : `${courtCards[i - 11]} of ${suit}`;
    const nameVi = isNumber ? `${i === 1 ? 'Át' : i} ${suitVi}` : `${courtVi[i - 11]} ${suitVi}`;
    const slug = name.toLowerCase().replace(/ /g, '-');
    const imagePath = getCardImage(name);

    cards.push({
      id: baseId + i - 1,
      name,
      slug,
      imagePath,
      keywords: [...suitKeywords[suit], nameVi],
      uprightMeaning: `${nameVi}: Năng lượng tích cực của ${suitVi.toLowerCase()}. Hãy đón nhận và phát huy.`,
      reversedMeaning: `${nameVi} ngược: Năng lượng bị chặn hoặc lệch hướng. Cần xem xét lại.`,
      description: `${name} thuộc bộ ${suit}, đại diện cho khía cạnh ${suitVi.toLowerCase()} trong cuộc sống.`,
      group,
    });
  }

  return cards;
}

const allCards: TarotCard[] = [
  ...majorArcana,
  ...createMinorCards('Wands', 'Gậy', 'wands'),
  ...createMinorCards('Cups', 'Cốc', 'cups'),
  ...createMinorCards('Swords', 'Kiếm', 'swords'),
  ...createMinorCards('Pentacles', 'Xu', 'pentacles'),
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await connectDatabase();

    // Clear existing cards
    await Card.destroy({ where: {}, truncate: true });
    console.log('🗑️  Cleared existing cards');

    // Insert all cards
    await Card.bulkCreate(allCards as any[]);
    console.log(`✅ Successfully seeded ${allCards.length} tarot cards!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
