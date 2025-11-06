import { beginnerRemaining, showBeginner } from '$lib/store/app-stores';
import { HistoryManager } from '../dataAPI/api-indexeddb';
import { owneditem, rollCounter } from '../dataAPI/api-localstore';
import { drawFromPool } from './universal-pool';

const { addHistory } = HistoryManager;

/**
 * Roll and get result for the selected Banner
 * @param {string} banner Wich banner to do roll
 * @param {Object} WishInstance Wish Instance, init first, then put as argument here
 * @param {number} indexOfBanner Index Of active banner among the dual banner
 * @returns Wish Result Object
 */
// 修改开始：按统一卡池规则抽取
const roll = async (banner, WishInstance, indexOfBanner) => {
        const drawn = drawFromPool();
        if (!drawn) {
                return {
                        pity: 1,
                        isNew: false,
                        bonusType: 'stardust',
                        bonusQty: 0,
                        type: null,
                        rarity: 0,
                        name: null
                };
        }

        const date = new Date();
        const time = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        const randomItem = {
                ...drawn,
                banner,
                bannerName: banner,
                time
        };

        const rarity = randomItem.rarity ?? 3;
        let pity = 1;

        const rollQty = rollCounter.get(banner);
        rollCounter.set(banner, rollQty + 1);

        if (banner === 'beginner') {
                // hide beginner banner after 20 roll
                beginnerRemaining.update((v) => (v < 1 ? 0 : v - 1));
                if (rollQty >= 19) showBeginner.set(false);
        }

        // 本版本按业务要求关闭保底逻辑，只按当前分组权重抽取
        // if (rarity === 5) {
        //         localPity.set(`pity4-${banner}`, pity4);
        //         localPity.set(`pity5-${banner}`, 0);
        //         pity = pity5;
        // }

        // if (rarity === 4) {
        //         localPity.set(`pity4-${banner}`, 0);
        //         localPity.set(`pity5-${banner}`, pity5);
        //         pity = pity4;
        // }

        // if (rarity === 3) {
        //         localPity.set(`pity4-${banner}`, pity4);
        //         localPity.set(`pity5-${banner}`, pity5);
        // }

        const { manual, wish } = owneditem.put({ itemID: randomItem.itemID });
        const numberOfOwnedItem = manual + wish - 1;
        const isNew = numberOfOwnedItem < 1;

        // storing item to storage
	await saveResult({ pity, ...randomItem });

	// Set Constellation
	const isFullConstellation = numberOfOwnedItem > 6;
	if (randomItem.type === 'character' && !isNew) {
		randomItem.stelaFortuna = !isFullConstellation;
	}

	// Milestone Bonus (Stardust or Starglitter)
	const bonusType = randomItem.rarity === 3 ? 'stardust' : 'starglitter';
	const bonusQty = getMilestoneQty(randomItem.rarity, randomItem.type, isFullConstellation, isNew);

        const result = { pity, isNew, bonusType, bonusQty, ...randomItem };
        return result;
};
// 修改结束

const saveResult = async (result) => {
	const data = { ...result };
	delete data.release;
	delete data.limited;
	delete data.offset;
	await addHistory(data);
};

const getMilestoneQty = (rarity, type, isFullConstellation, isNew) => {
	// Always give stargliter or stardust on obtaining weapons
	if (type === 'weapon') {
		if (rarity === 3) return 15; // *3
		if (rarity === 4) return 2; // *4
		return 10; // *5
	}

	// Don't give Starglitter to newly obtained character
	if (isNew) return 0;

	// Give starglitter for duplicate characters
	if (rarity === 4) return isFullConstellation ? 5 : 2; // *4
	return isFullConstellation ? 25 : 10; // *5
};

export default roll;
