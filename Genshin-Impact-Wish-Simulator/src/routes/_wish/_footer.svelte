<script>
	import { getContext } from 'svelte';
	import { t } from 'svelte-i18n';
	import hotkeys from 'hotkeys-js';
	import { assets, activeBanner, bannerList } from '$lib/store/app-stores';
	import { playSfx } from '$lib/helpers/audio/audio';

	$: currentBanner = $bannerList[$activeBanner] || {};
	$: hasPool = !!currentBanner?.id;
	$: allowTenRoll = currentBanner.showTenRoll ?? true;
	$: isSoldOut = currentBanner.isSoldOut ?? false;

	const onWish = getContext('onWish');
	const readyToPull = getContext('readyToPull');

	const roll = getContext('doRoll');
	const handleSingleRollClick = () => {
		playSfx('roll');
		if (!hasPool) return;
		roll(1, currentBanner);
	};
	const handleMultiRollClick = () => {
		if (!hasPool) return;
		playSfx('roll');
		roll(10, currentBanner);
	};

	// ShortCut
	const appReady = getContext('appReady');
	hotkeys('enter', 'index', (e) => {
		if (!$appReady || $onWish || isSoldOut || !hasPool) return;
		e.preventDefault();
		handleMultiRollClick();
	});

	hotkeys('shift+enter', 'index', (e) => {
		if (!$appReady || $onWish || isSoldOut || !hasPool) return;
		e.preventDefault();
		handleSingleRollClick();
	});
</script>

<div id="footer" style="width: 100%; height: 100%">
	<div class="row" style="--bg:url({$assets['button.webp']})">
		<div class="left menu-button" />

		<div class="right roll-button">
			<button
				class="single wish-button"
				on:click={handleSingleRollClick}
				disabled={$onWish || !$readyToPull || isSoldOut || !hasPool}
			>
				<div class="top">{$t('gift.draw.single')}</div>
			</button>

			{#if allowTenRoll}
				<button
					class="ten wish-button"
					on:click={handleMultiRollClick}
					disabled={$onWish || !$readyToPull || isSoldOut || !hasPool}
				>
					<div class="top">{$t('gift.draw.ten')}</div>
				</button>
			{/if}
		</div>
	</div>
</div>
