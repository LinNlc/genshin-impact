<script>
	import { t } from 'svelte-i18n';

	import { playSfx } from '$lib/helpers/audio/audio';
	import {
		mobileMode,
		viewportHeight,
		assets,
		isPWA,
		isMobile,
		bannerList,
		activeBanner
	} from '$lib/store/app-stores';

	import BannerButton from './_banner-button.svelte';
	import PrizeBannerButton from './PrizeBannerButton.svelte';

	const selectBanner = (banner) => {
		if ($activeBanner === banner) return;
		activeBanner.set(banner);
		playSfx('changebanner');
	};

	$: headerHeightstyle = $mobileMode ? `height: ${$viewportHeight}px` : '';
	$: fullscreen = $viewportHeight === window.screen.height;

	const handleFullscreen = () => {
		if (!fullscreen) {
			const body = document.body;
			if (body.requestFullscreen) return body.requestFullscreen();
			if (body.webkitRequestFullscreen) return body.webkitRequestFullscreen();
			if (body.msRequestFullscreen) return body?.msRequestFullscreen();
		} else {
			if (document.exitFullscreen) return document?.exitFullscreen();
			if (document.webkitExitFullscreen) return document?.webkitExitFullscreen();
			if (document.msExitFullscreen) return document?.msExitFullscreen();
		}
	};
</script>

<div id="header" style={headerHeightstyle}>
	<div class="top">
		<h1 class="wish-title">
			<img src={$assets['brand.png']} alt="Brand" crossorigin="anonymous" />
			<span> {$t('gift.title')} </span>

			{#if !$isPWA || !$isMobile}
				<button
					class="fullscreen"
					on:click={handleFullscreen}
					title="FullScreen"
					aria-label="Fullscreen"
				>
					<i class="gi-{!fullscreen ? 'fullscreen' : 'shrink'}" />
				</button>
			{/if}
		</h1>
	</div>

	<div class="banner-button">
		<div class="bg" style={headerHeightstyle}>
			<img src={$assets['brand.png']} alt="Brand" crossorigin="anonymous" />
		</div>

		{#each $bannerList as banner, i}
			{#if banner.type === 'prize'}
				<PrizeBannerButton
					title={banner.bannerName}
					coverUrl={banner.thumbnailUrl}
					soldOut={banner.isSoldOut}
					active={$activeBanner === i}
					on:click={() => selectBanner(i)}
				/>
			{:else}
				<BannerButton
					type={banner.type}
					featured={banner.featured}
					character={banner.character}
					index={i}
					active={$activeBanner === i}
					on:click={() => selectBanner(i)}
				/>
			{/if}
		{/each}
	</div>
</div>

<style>
	#header {
		position: relative;
		display: block;
		width: 100%;
		padding: 30px 2%;
		z-index: 5;
	}

	h1 button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		margin-left: 0.7rem;
		line-height: 0;
		transition: all 0.2s;
	}

	.fullscreen {
		border-color: transparent;
		transform: scale(1.3);
		width: 1.3rem;
		height: 1.3rem;
	}

	.bg {
		display: none;
	}
	.top {
		display: flex;
		justify-content: space-between;
		width: 100%;
		position: relative;
	}

	.wish-title {
		display: flex;
		align-items: center;
		font-weight: normal;
		color: #fff;
		font-size: 1.5rem;
		letter-spacing: 0.1rem;
		line-height: 1;
	}

	.wish-title img {
		height: 2.2rem;
		margin-right: 0.8rem;
	}

	.banner-button {
		display: flex;
		justify-content: center;
		flex-wrap: nowrap;
		overflow-x: auto;
		padding: 0.5rem 0;
	}

	:global(.mobile) .banner-button {
		justify-content: flex-start;
		padding: 0.4rem 0.2rem;
	}
	:global(.mobile) .wish-title {
		font-size: 1.2rem;
	}
	:global(.mobile) .wish-title img {
		height: 1.8rem;
	}
</style>
