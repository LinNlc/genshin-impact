// 修改开始：统一卡池抽取逻辑
import { GACHA_POOL } from '$lib/data/gacha-pool.js';
import { getCharDetails, getWpDetails } from './itemdrop-base';

const RARITIES = [3, 4, 5];
const poolState = new Map(GACHA_POOL.map((entry) => [entry.id, { ...entry }]));

const cloneEntry = (entry) => ({ ...entry });

const cloneDetails = (details = {}) => JSON.parse(JSON.stringify(details || {}));

const getCurrentEntries = () => Array.from(poolState.values()).map(cloneEntry);

const splitByRarity = () => {
        const groups = new Map();
        for (const rarity of RARITIES) {
                groups.set(rarity, []);
        }

        for (const entry of getCurrentEntries()) {
                groups.get(entry.rarity)?.push(entry);
        }

        return groups;
};

const distributeWithinGroup = (entries) => {
        const available = entries.filter(({ quantity }) => quantity > 0);
        const exhausted = entries.filter(({ quantity }) => quantity <= 0);
        const exhaustedWeight = exhausted.reduce((sum, { weight }) => sum + weight, 0);

        if (available.length === 0) {
                return { available: [], redistributedWeight: exhaustedWeight };
        }

        const share = exhaustedWeight / available.length;
        const updated = available.map((entry) => ({
                ...entry,
                adjustedWeight: entry.weight + share
        }));

        return { available: updated, redistributedWeight: 0 };
};

const applyGroupRedistribution = () => {
        const groups = splitByRarity();
        let carryOver = 0;
        const finalList = [];

        for (const rarity of RARITIES) {
                const entries = groups.get(rarity) || [];
                const totalWeight = entries.reduce((sum, { weight }) => sum + weight, 0);
                const { available, redistributedWeight } = distributeWithinGroup(entries);

                if (available.length === 0) {
                        carryOver += totalWeight;
                        continue;
                }

                const bonus = (carryOver + redistributedWeight) / available.length;
                for (const item of available) {
                        finalList.push({
                                ...item,
                                adjustedWeight: item.adjustedWeight + bonus
                        });
                }
                carryOver = 0;
        }

        return finalList;
};

const getDetailsForEntry = (entry) => {
        const { name, rarity, id } = entry;
        const charDetails = getCharDetails(name);
        if (charDetails && Object.keys(charDetails).length > 0) {
                const cloned = cloneDetails(charDetails);
                return {
                        ...cloned,
                        type: 'character',
                        rarity: cloned.rarity ?? rarity,
                        name: cloned.name || name,
                        poolId: id
                };
        }

        const weaponDetails = getWpDetails(name);
        if (weaponDetails && Object.keys(weaponDetails).length > 0) {
                const cloned = cloneDetails(weaponDetails);
                return {
                        ...cloned,
                        type: 'weapon',
                        rarity: cloned.rarity ?? rarity,
                        name: cloned.name || name,
                        poolId: id
                };
        }

        return {
                itemID: id,
                name,
                rarity,
                type: 'unknown',
                poolId: id
        };
};

export const generateAvailablePool = () => {
        const redistributed = applyGroupRedistribution();
        return redistributed.map((entry) => ({
                ...entry,
                adjustedWeight: Math.max(entry.adjustedWeight, 0)
        }));
};

const pickWeightedItem = (pool) => {
        const totalWeight = pool.reduce((sum, { adjustedWeight }) => sum + adjustedWeight, 0);
        if (totalWeight <= 0) return null;

        const threshold = Math.random() * totalWeight;
        let cumulative = 0;

        for (const entry of pool) {
                cumulative += entry.adjustedWeight;
                if (threshold <= cumulative) return entry;
        }

        return pool[pool.length - 1] || null;
};

export const drawFromPool = () => {
        const pool = generateAvailablePool();
        if (!pool.length) return null;

        const selected = pickWeightedItem(pool);
        if (!selected) return null;

        const state = poolState.get(selected.id);
        if (state) {
                state.quantity = Math.max(state.quantity - 1, 0);
        }

        const details = getDetailsForEntry(selected);
        return {
                ...details,
                rarity: details.rarity ?? selected.rarity,
                poolQuantity: Math.max(state?.quantity ?? 0, 0),
                weight: selected.adjustedWeight
        };
};

export const resetPool = () => {
        poolState.clear();
        for (const entry of GACHA_POOL) {
                poolState.set(entry.id, { ...entry });
        }
};
// 修改结束
