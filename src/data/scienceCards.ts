import type { ScienceCard } from '@/types/game';

export const SCIENCE_CARDS: ScienceCard[] = [
  {
    id: 'card_species_01',
    title: '黑颈鹤——高原精灵',
    category: 'species',
    rarity: 'common',
    content:
      '黑颈鹤（Grus nigricollis）是世界上唯一生长、繁殖在高原的鹤类，因其颈部黑色而得名。体长约110-120厘米，体重4-6公斤。黑颈鹤是中国国家一级保护动物，被IUCN红色名录列为"易危"。',
    imageEmoji: '🦩',
    unlockCondition: '完成任意关卡',
  },
  {
    id: 'card_species_02',
    title: '忠贞之鹤——一夫一妻制',
    category: 'species',
    rarity: 'rare',
    content:
      '黑颈鹤奉行严格的"一夫一妻制"，一旦配对就终身相伴。每年繁殖季节，成对的黑颈鹤会表演优美的"鹤舞"——彼此围绕、跳跃、展翅、鸣叫，以此巩固配偶关系。',
    imageEmoji: '💕',
    unlockCondition: '3星通关初级难度',
  },
  {
    id: 'card_species_03',
    title: '濒危亚种的危机',
    category: 'species',
    rarity: 'legendary',
    content:
      '滇西亚种是黑颈鹤种群中数量最少的一支，仅存约800只。它们的迁徙路线经过人口稠密区域，城市扩张导致栖息地严重破碎化。每一只个体的存活都关乎种群存续！',
    imageEmoji: '🕊️',
    unlockCondition: '3星通关高级难度且濒危种0减员',
  },
  {
    id: 'card_habitat_01',
    title: '湿地——鹤的加油站',
    category: 'habitat',
    rarity: 'common',
    content:
      '湿地是黑颈鹤迁徙途中最重要的停歇地。沼泽、湖泊、河流滩涂提供了丰富的植物根茎、水生昆虫和小型鱼类。一只黑颈鹤在中转站需要觅食数天才能积累继续飞行的体力。',
    imageEmoji: '🌊',
    unlockCondition: '在湿地停留超过3次',
  },
  {
    id: 'card_habitat_02',
    title: '繁殖地——青藏高原',
    category: 'habitat',
    rarity: 'rare',
    content:
      '黑颈鹤的繁殖地主要在海拔3000-5000米的青藏高原。这里人烟稀少、湿地广布，是天然的育儿天堂。每年4-6月，雌鹤产卵2枚，双亲共同孵卵约30-33天。',
    imageEmoji: '🥚',
    unlockCondition: '使用繁殖地恢复体力',
  },
  {
    id: 'card_habitat_03',
    title: '越冬地——云南大山包',
    category: 'habitat',
    rarity: 'rare',
    content:
      '云南昭通大山包是黑颈鹤最著名的越冬地之一，每年有超过1200只黑颈鹤在此过冬。当地村民与鹤和谐共处，甚至主动留出谷物供其取食，谱写了人与自然和谐共处的佳话。',
    imageEmoji: '🌾',
    unlockCondition: '带领所有队伍抵达越冬地',
  },
  {
    id: 'card_migration_01',
    title: '迁徙之谜——为什么不直接飞？',
    category: 'migration',
    rarity: 'common',
    content:
      '黑颈鹤不会沿直线飞行，而是沿着一系列湿地组成的"迁徙廊道"迁飞。这是因为它们需要频繁停歇补充体力。这些廊道就像高速公路上的"服务区"，缺一不可！',
    imageEmoji: '🗺️',
    unlockCondition: '放置第一个停歇点',
  },
  {
    id: 'card_migration_02',
    title: '万里迁徙路',
    category: 'migration',
    rarity: 'rare',
    content:
      '黑颈鹤每年春季从越冬地返回青藏高原繁殖地，秋季再次南迁，单程距离可达800-1500公里，一生迁徙的总距离足以绕地球数圈！',
    imageEmoji: '🌍',
    unlockCondition: '总步数<20完成关卡',
  },
  {
    id: 'card_migration_03',
    title: '集体飞翔的智慧',
    category: 'migration',
    rarity: 'legendary',
    content:
      '黑颈鹤迁徙时呈"V"字形编队飞行，头鹤冲破气流，后面的鹤利用翅膀产生的翼尖涡流获得升力，可节省约20%-30%的体力。这就是为什么鹤群必须共同行动、不能分散！',
    imageEmoji: '🦩🦩🦩',
    unlockCondition: '三支队伍同时抵达',
  },
  {
    id: 'card_threat_01',
    title: '城市噪声——看不见的杀手',
    category: 'threat',
    rarity: 'common',
    content:
      '城市灯光和噪声会严重干扰黑颈鹤的飞行方向和休息。研究显示，经过城市上空的鹤群心率会升高50%，幼鹤容易失散，体力大幅消耗，死亡率显著增加。',
    imageEmoji: '🏙️',
    unlockCondition: '经历首次城市减员',
  },
  {
    id: 'card_threat_02',
    title: '栖息地破碎化',
    category: 'threat',
    rarity: 'rare',
    content:
      '随着人类活动扩张，原本连续的湿地被公路、农田、城镇切割成"孤岛"。当两个停歇地之间的距离超过鹤的续航能力时，这条迁徙廊道就彻底断裂了。',
    imageEmoji: '💔',
    unlockCondition: '因停歇点不足导致任务失败',
  },
  {
    id: 'card_threat_03',
    title: '保护行动——你能做什么？',
    category: 'threat',
    rarity: 'legendary',
    content:
      '保护黑颈鹤，人人有责：①支持湿地保护公园建设 ②拒绝食用野生动物 ③向身边人普及环保知识 ④参加观鸟活动时保持安静距离。每一个小行动都在为鹤群守护回家的路！',
    imageEmoji: '🤝',
    unlockCondition: '收集全部稀有卡片',
  },
];

export const CARD_CATEGORY_NAMES: Record<string, string> = {
  species: '物种档案',
  habitat: '栖息地',
  migration: '迁徙之谜',
  threat: '威胁与保护',
};

export const CARD_RARITY_NAMES: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  legendary: '传说',
};

export const CARD_RARITY_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  common: { bg: '#F8F9FA', border: '#ADB5BD', glow: 'rgba(173,181,189,0.4)' },
  rare: { bg: '#E7F5FF', border: '#339AF0', glow: 'rgba(51,154,240,0.5)' },
  legendary: { bg: '#FFF9DB', border: '#F59F00', glow: 'rgba(245,159,0,0.6)' },
};
