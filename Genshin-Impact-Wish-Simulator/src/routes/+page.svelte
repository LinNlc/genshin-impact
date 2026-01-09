<script>
	import { fade } from 'svelte/transition';
	import { writable } from 'svelte/store';
	import { getContext, onMount, setContext } from 'svelte';
	import hotkeys from 'hotkeys-js';

	import { assets, authToken, bannerList, activeBanner, userId } from '$lib/store/app-stores';
	import { localConfig } from '$lib/helpers/dataAPI/api-localstore';
	import { pauseSfx, playSfx } from '$lib/helpers/audio/audio';
	import { fetchPools, loginWithEmployeeId } from '$lib/helpers/api/prize-api';

	import MainWish from './_wish/index.svelte';
	import ModalEmployeeLogin from './_index/ModalEmployeeLogin.svelte';

	let status = 'ok';
	let pageActive = 'index';
	let showLoginModal = true;
	let loginProcessing = false;
	let loginError = '';
	let requirePassword = false;

	let appReady = writable(false);
	let onWish = writable(false);

	setContext('onWish', onWish);
	setContext('appReady', appReady);
	setContext('query', writable('')); //query store to help finding a banner
	setContext('readyToPull', writable(true)); // Ready to pull if meteor animation are loaded already

	// Background animation
	let animatedBG = localConfig.get('animatedBG');
	const animatebg = () => (animatedBG = localConfig.get('animatedBG'));
	setContext('animateBG', animatebg);

	// Background Music
	$: if (!showLoginModal) {
		if (pageActive !== 'index' || $onWish) pauseSfx('wishBacksound');
		else playSfx('wishBacksound');
	}

	const bgmHandle = () => {
		if (showLoginModal) return; // User is not ready to Wish
		if ($onWish) return; // dont resume/pause if user on wishing
		if (pageActive !== 'index') return; // dont handle BGM if not index page

		const mode = document.visibilityState;
		if (mode === 'visible') return playSfx('wishBacksound');
		return pauseSfx('wishBacksound');
	};

	const startApp = () => {
		appReady.set(true);
		hotkeys.setScope('index');
		showLoginModal = false;
		playSfx();
	};
	// Welcome Modal && Custom Banner Modal
	setContext('startApp', startApp);

	// Page Navigation
	const navigate = (page) => {
		let beforeNavigate = pageActive;
		pageActive = page;
		hotkeys.setScope(page);

		if (beforeNavigate === pageActive) return;
		hotkeys.deleteScope(beforeNavigate);

		return;
	};
	setContext('navigate', navigate);

	// Component Loader
	let ObtainedItem, ModalConvert;
	const asyncLoadComponent = async () => {
		ObtainedItem = (await import('$lib/components/ObtainedItem.svelte')).default;
		ModalConvert = (await import('./_index/ModalConvert.svelte')).default;
	};

	const bannerLoaded = getContext('bannerLoaded');

	const normalizePools = (pools = []) => {
		return pools.map((pool, index) => ({
			id: pool.id ?? `${index}`,
			type: 'prize',
			bannerName: pool.name,
			coverUrl: pool.coverUrl || pool.cover || pool.imageUrl,
			thumbnailUrl: pool.thumbnailUrl || pool.coverUrl || pool.cover || pool.imageUrl,
			pinned: !!pool.pinned,
			showTenRoll: pool.showTenRoll ?? true,
			drawMode: pool.drawMode || 'rarity',
			rules: pool.rules || '',
			remainingTotal: pool.remainingTotal ?? pool.stock ?? 0,
			isSoldOut: pool.isSoldOut ?? (pool.remainingTotal ?? pool.stock ?? 0) <= 0
		}));
	};

	const loadPools = async (token) => {
		const response = await fetchPools(token);
		const list = normalizePools(response?.data || response?.pools || response || []);
		list.sort((a, b) => Number(b.pinned) - Number(a.pinned));
		bannerList.set(list);
		activeBanner.set(0);
		status = 'ok';
		bannerLoaded();
	};

	const handleLogin = async ({ detail }) => {
		const { employeeId, password } = detail;
		loginProcessing = true;
		loginError = '';
		try {
			const response = await loginWithEmployeeId({ userId: employeeId, password });
			const token = response?.token || response?.data?.token || '';
			const requirePwd = response?.requirePassword || response?.data?.requirePassword;
			if (requirePwd && !password) {
				requirePassword = true;
				loginError = response?.message || '需要输入密码';
				return;
			}
			authToken.set(token);
			userId.set(response?.userId || response?.data?.userId || employeeId);
			await loadPools(token);
			startApp();
		} catch (error) {
			loginError = error?.message || '登录失败';
		} finally {
			loginProcessing = false;
		}
	};

	onMount(() => {
		asyncLoadComponent();
		animatebg();
		bannerLoaded();

		window.addEventListener('popstate', (e) => {
			if (e.state.page) return;
			if (pageActive === 'index') return;
			navigate('index');
		});
		document.addEventListener('visibilitychange', bgmHandle);
	});

	// Obtained
	let showObtained = false;
	let obtainedData = {};
	const openObtained = (data) => {
		obtainedData = data;
		showObtained = true;
	};
	const closeObtained = () => {
		showObtained = false;
		obtainedData = {};
		playSfx('close');
	};
	setContext('openObtained', openObtained);
	setContext('closeObtained', closeObtained);

	// Modal to Convert Genesis
	let showConvertModal = false;
	setContext('openConvertModal', () => (showConvertModal = true));
	setContext('closeConvertModal', () => (showConvertModal = false));
</script>

{#if status !== 'ok'}
	error bos
{/if}

{#if animatedBG && pageActive.match(/(index|detail|history)/) && !$onWish}
	<video
		transition:fade|local={{ duration: 2000 }}
		muted
		loop
		autoplay
		type="video/webm"
		src={$assets['bg.webm']}
		poster={$assets['wish-background.webp']}
	>
		<track kind="captions" />
	</video>
{/if}

<!-- Main Banner -->
{#if pageActive === 'index'}
	<MainWish />
{/if}

{#if showLoginModal}
	<ModalEmployeeLogin
		bind:requirePassword
		processing={loginProcessing}
		errorMessage={loginError}
		on:submit={handleLogin}
	/>
{/if}

{#if showObtained}
	<svelte:component this={ObtainedItem} data={obtainedData} />
{/if}

<!-- Utility -->
{#if showConvertModal}
	<svelte:component this={ModalConvert} />
{/if}

<!-- {#if chatLoaded}
	<svelte:component this={Feedback} show={showChat} />
{/if} -->

<style>
	video {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 20%;
	}
</style>
