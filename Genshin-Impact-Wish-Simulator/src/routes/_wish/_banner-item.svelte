<script>
	import { getContext } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import hotkeys from 'hotkeys-js';

	import { playSfx } from '$lib/helpers/audio/audio';
	import { activeBanner, bannerList, isMobile, mobileMode, viewportHeight, viewportWidth } from '$lib/store/app-stores';
	import BannerCard from './banner-card/BannerCard.svelte';

	$: landscape = $viewportWidth / 2.1 > $viewportHeight;
	$: tabletBannerStyle = landscape ? 'width: 90vh' : '';

	$: mobileBannerStyle = $mobileMode
		? `max-width: ${(150 / 100) * $viewportHeight}px;`
		: tabletBannerStyle;

	$: style =
		$viewportHeight > 800 ||
		$viewportHeight > $viewportWidth ||
		$viewportHeight / $viewportWidth > 0.5
			? 'align-items:center;'
			: '';

	const navigateBanner = (target) => {
		if (target === 'right') {
			if ($activeBanner >= $bannerList.length - 1) return;
			playSfx('changebanner');
			return activeBanner.update((n) => n + 1);
		}

		if (target === 'left') {
			if ($activeBanner <= 0) return;
			playSfx('changebanner');
			return activeBanner.update((n) => n - 1);
		}
	};

	// Shortcut
	const onWish = getContext('onWish');
	hotkeys('right,left,up,down', 'index', (e) => {
		if ($onWish) return;
		e.preventDefault();
		const [to] = hotkeys.getPressedKeyString();
		if (to === 'up') return navigateBanner('left');
		if (to === 'down') return navigateBanner('right');
		navigateBanner(to);
	});

	hotkeys('1,2,3,4,5', 'index', (e) => {
		if ($onWish) return;
		e.preventDefault();
		const to = hotkeys.getPressedKeyString();
		const bannerIndex = parseInt(to) - 1;
		if (to > $bannerList.length) return;
		activeBanner.set(bannerIndex);
		playSfx('changebanner');
	});
</script>

<div class="banner-container" {style}>
	{#if $bannerList.length > 0}
		{#each $bannerList as data, index}
			{#if $activeBanner === index}
				<div
					class="banner-item"
					class:fullscreen={$isMobile && $mobileMode}
					style={mobileBannerStyle}
					in:fly={{ x: 25, duration: 580 }}
				>
					<BannerCard {data} {index} fullscreenEditor={$isMobile && $mobileMode} />
				</div>
			{/if}
		{/each}

		<div class="navigate">
			{#if $activeBanner > 0}
				<button
					class="left"
					style="margin-right: auto;"
					on:click={() => navigateBanner('left')}
					transition:fade|local={{ duration: 200 }}
				>
					<i class="gi-arrow-left" />
				</button>
			{/if}

			{#if $activeBanner < $bannerList.length - 1}
				<button
					class="left"
					style="margin-left: auto;"
					on:click={() => navigateBanner('right')}
					transition:fade|local={{ duration: 200 }}
				>
					<i class="gi-arrow-right" />
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.banner-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global(.mobile) .banner-container {
		align-items: flex-end;
		padding: 0;
	}

	.banner-item {
		max-width: 900px;
		width: 80%;
		max-height: 75vh;
		aspect-ratio: 27/14;
		perspective: 1000px;
	}

	.fullscreen.banner-item {
		perspective: unset;
	}

	.navigate {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 85%;
		transform: translate(-50%, -50%);
		display: flex;
		justify-content: space-between;
		align-items: center;
		pointer-events: none;
	}

	.navigate button {
		background: rgba(0, 0, 0, 0.35);
		border-radius: 999px;
		width: 2.2rem;
		height: 2.2rem;
		color: #fff;
		pointer-events: auto;
	}
</style>
