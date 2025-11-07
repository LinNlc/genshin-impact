import { beginner } from '$lib/data/banners/beginner.json';
import { standard } from '$lib/data/banners/standard.json';
import { member } from '$lib/data/banners/member.json';
import { version, wishPhase } from '$lib/data/wish-setup.json';

import { imageCDN } from './assets';
import { BannerManager } from './dataAPI/api-indexeddb';
import { localConfig, rollCounter } from './dataAPI/api-localstore';
import {
	activeBanner,
	activeVersion,
	bannerList,
	customData,
	editorMode,
	isCustomBanner,
	isFatepointSystem,
	preloadVersion,
	showBeginner
} from '$lib/store/app-stores';

const idb = BannerManager;

const useCustomBanner = async (bannerID) => {
	try {
		const data = await idb.get(bannerID);
		if (!data) return preloadVersion.set({ patch: version, phase: wishPhase });

		const {
			bannerName = '',
			character = '',
			rateup = [],
			images = {},
			hostedImages = {},
			vision = 'pyro',
			charTitle = '',
			artPosition = {},
			watermark = '',
			status = null
		} = data;

		const dataIMG = status === 'owned' ? images : imageCDN(hostedImages);
		customData.set({ ...data, name: character, images: dataIMG });
		bannerList.set([
			{
				type: 'character-event',
				bannerName,
				character,
				rateup,
				images: dataIMG,
				vision,
				charTitle,
				artPosition,
				watermark
			}
		]);

		activeVersion.set({ patch: 'Custom', phase: bannerID });
		activeBanner.set(0);
		editorMode.set(false);
		isCustomBanner.set(true);
		localConfig.set('version', `Custom-${bannerID}`);
		return { status: 'ok' };
	} catch (e) {
		console.error(e);
		return { status: 'error' };
	}
};

const checkBeginnerBanner = () => {
	// const starterRollCount = rollCounter.get('beginner');
	// const isShowBeginner = starterRollCount < 20;
	const isShowBeginner = false;
	showBeginner.set(isShowBeginner);
	return isShowBeginner;
};

export const initializeBanner = async ({ patch, phase }) => {
        try {
                if (!patch || !phase) return;
                if (patch.match(/(local|custom)/gi)) return useCustomBanner(phase);

                // 修改开始：仅保留名单抽取卡池
                const list = [];
                const normalizedPhase = Number.parseInt(phase, 10);
                const memberEntry =
                        member.find(({ version }) => version === normalizedPhase) || member[0] || {};
                const { version: stdver = 1, featured: memFeatured = {} } = memberEntry;

                if (Object.keys(memFeatured).length > 0) {
                        list.push({ type: 'member', stdver, ...memFeatured });
                }

                bannerList.set(list);
                isFatepointSystem.set(false);
                // 修改结束

                activeVersion.set({ patch, phase });
                activeBanner.set(0);
                localConfig.set('version', `${patch}-${phase}`);

                customData.set({});
                isCustomBanner.set(false);
                return { status: 'ok' };
        } catch (e) {
                console.error(e);
                return { status: 'error', e };
        }
};

export const handleShowStarter = (isShow) => {
        if (!isShow) {
                return bannerList.update((bn) => {
                        return bn.filter(({ type }) => type !== 'beginner');
                });
        }
        // 修改开始：名单卡池模式下不再添加新手池
        return bannerList.update((bn) => bn);
        // 修改结束
};
