<script>
	import { getContext, setContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { t } from 'svelte-i18n';
	import {
		activeBanner,
		bannerList,
		assets,
		authToken
	} from '$lib/store/app-stores';
	import { localConfig } from '$lib/helpers/dataAPI/api-localstore';
	import { APP_TITLE } from '$lib/env';
	import { playSfx } from '$lib/helpers/audio/audio';
	import { drawPrize } from '$lib/helpers/api/prize-api';
	import { pushToast } from '$lib/helpers/toast';

	// Components
	import Header from './_header.svelte';
	import Footer from './_footer.svelte';
	import BannerItem from './_banner-item.svelte';
	import Meteor from './wish-result/_meteor.svelte';
	import WishResult from './wish-result/WishResult.svelte';

	let result = [];

	let type;
	$: nowBanner = $bannerList[$activeBanner] || {};
	$: ({ type } = nowBanner);
	$: bannerType = type || '';

	// Wish Roller
	let multi = false;
	let onWish = getContext('onWish');

	const toPrizeResults = (items = []) => {
		return items.map((item) => ({
			name: item.name,
			rarity: item.rarity || 3,
			type: 'prize',
			imageUrl: item.imageUrl || item.image || item.coverUrl,
			isNew: item.isNew ?? true
		}));
	};

	const updatePoolState = (pool) => {
		if (!pool?.id) return;
		bannerList.update((list) =>
			list.map((entry) =>
				entry.id === pool.id
					? {
							...entry,
							remainingTotal: pool.remainingTotal ?? entry.remainingTotal,
							isSoldOut: pool.isSoldOut ?? (pool.remainingTotal ?? entry.remainingTotal) <= 0
					  }
					: entry
			)
		);
	};

	const doRoll = async (count, pool) => {
		multi = count > 1;
		onWish.set(true);

		try {
			const response = await drawPrize({
				token: $authToken,
				poolId: pool.id,
				count
			});
			const items = response?.items || response?.data?.items || [];
			result = toPrizeResults(items);
			updatePoolState(response?.pool || response?.data?.pool);
			handleMeteorAnimation();
		} catch (error) {
			onWish.set(false);
			pushToast({ message: error?.message || '抽奖失败', type: 'error' });
		}
	};
	setContext('doRoll', doRoll);

	// Wish Result Handler
	let skipSplashArt = false;
	let showWishResult = false;
	let showMeteor = false;
	let single = true;
	let meteorStar = 3;

	const closeResult = () => {
		showWishResult = false;
		onWish.set(false);
		checkObtained();
	};
	setContext('closeResult', closeResult);

	const showSplashArt = ({ skip = false } = {}) => {
		skipSplashArt = skip;
		showMeteor = false;
		showWishResult = true;
	};
	setContext('showSplashArt', showSplashArt);

	const handleMeteorAnimation = () => {
		const autoSkip = localConfig.get('autoskip');
		if (autoSkip) return showSplashArt({ skip: true });

		const stars = result.map(({ rarity }) => rarity);
		single = stars.length === 1;
		meteorStar = 3;
		if (stars.includes(4)) meteorStar = 4;
		if (stars.includes(5)) meteorStar = 5;
		showMeteor = true;
	};

	const reroll = (amount) => {
		playSfx();
		doRoll(multi ? amount : 1, nowBanner);
	};
	setContext('reroll', reroll);
	const checkObtained = () => {};
</script>

<svelte:head>
	<title>{$t('title', { default: APP_TITLE })}</title>
</svelte:head>

<div class="overlay" in:fade|local />

<div class="wish-container" class:show={showMeteor || showWishResult}>
	<Meteor show={showMeteor} isSingle={single} rarity={meteorStar} />
	{#if showWishResult}
		<WishResult list={result} skip={skipSplashArt} bannerType={bannerType} />
	{/if}
</div>

<section style="background-image: url('{$assets['wish-background.webp']}');">
	<div class="col top">
		<Header />
	</div>

	<div class="col banner">
		<div class="item">
			<BannerItem />
		</div>

		<div class="col button" in:fly={{ y: 20, duration: 1000 }}>
			<Footer />
		</div>
	</div>
</section>

<style>
	section {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		overflow: hidden;
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
		background-position: 20%;
	}

	.overlay {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: block;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.08);
		box-shadow: 0 0 50vh rgba(0, 0, 0, 0.4) inset;
	}

	.wish-container {
		position: fixed;
		width: 100%;
		height: 100%;
		z-index: 15;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	.wish-container.show {
		pointer-events: unset;
	}

	.top,
	.banner,
	.button,
	.item {
		display: block;
		width: 100%;
	}

	.top {
		min-height: 70px;
	}
	.banner,
	.item {
		height: 100%;
	}
	.item {
		position: relative;
	}
	.banner {
		display: flex;
		justify-content: center;
		flex-direction: column;
	}

	.button {
		height: 120px;
	}

	/* Mobile */
	:global(.mobile) section {
		flex-direction: row;
	}
	:global(.mobile) .top {
		height: 100%;
		width: min-content;
	}
	:global(.mobile) .banner {
		width: 120%;
		margin-left: -20px;
	}
	:global(.mobile) .button {
		height: 50px;
		margin-bottom: 0.2rem;
	}
</style>
