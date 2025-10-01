export function rollDice(times = 6) {
	const dice = [];
	for (let i = 0; i < times; i++) {
		dice.push(1 + Math.floor(Math.random() * 6));
	}
	return dice.sort((a, b) => a - b);
}

export const RANKS = {
	ZJ_IN_FLOWER: '状元插金花',
	SIX_RED: '六杯红',
	SIX_BLACK: '六杯黑',
	FIVE_KINGS: '五王',
	FIVE_TWOS_WITH_ONE_FOUR: '五子带一秀',
	FIVE_TWOS: '五子登科',
	ZHUANGYUAN: '状元',
	BANGYAN: '榜眼（对堂）',
	TANHUA: '探花（三红）',
	JINSHI: '进士（四进）',
	JUREN: '举人（二举）',
	XIUCAI: '秀才（一秀)',
	NONE: '无'
};

export function judgeRank(dice) {
	const counts = new Map();
	for (const d of dice) counts.set(d, (counts.get(d) || 0) + 1);
	const c = (n) => counts.get(n) || 0;
	const values = [...counts.values()].sort((a,b)=>b-a);
	const isStraight = [1,2,3,4,5,6].every(v => (counts.get(v) || 0) === 1);

	// 按优先级从高到低
	if (c(4) === 4 && c(1) === 2) return RANKS.ZJ_IN_FLOWER; // 四个4 + 两个1
	if (c(4) === 6) return RANKS.SIX_RED; // 6个4
	if (c(2) === 6) return RANKS.SIX_BLACK; // 6个2
	if (c(4) === 5) return RANKS.FIVE_KINGS; // 5个4
	if (c(2) === 5 && c(4) === 1) return RANKS.FIVE_TWOS_WITH_ONE_FOUR; // 5个2 + 1个4
	if (c(2) === 5) return RANKS.FIVE_TWOS; // 5个2
	if (c(4) === 4) return RANKS.ZHUANGYUAN; // 四个4
	if (isStraight) return RANKS.BANGYAN; // 1-6
	if (c(4) === 3) return RANKS.TANHUA; // 三个4
	if (values[0] === 4) return RANKS.JINSHI; // 任意四个同点（含2，排除已命中的四个4与六黑等情况）
	if (c(4) === 2) return RANKS.JUREN; // 两个4
	if (c(4) === 1) return RANKS.XIUCAI; // 一个4
	return RANKS.NONE;
}

export function rankWeight(rank) {
	const order = [
		RANKS.ZJ_IN_FLOWER,
		RANKS.SIX_RED,
		RANKS.SIX_BLACK,
		RANKS.FIVE_KINGS,
		RANKS.FIVE_TWOS_WITH_ONE_FOUR,
		RANKS.FIVE_TWOS,
		RANKS.ZHUANGYUAN,
		RANKS.BANGYAN,
		RANKS.TANHUA,
		RANKS.JINSHI,
		RANKS.JUREN,
		RANKS.XIUCAI,
		RANKS.NONE
	];
	return order.indexOf(rank);
}

