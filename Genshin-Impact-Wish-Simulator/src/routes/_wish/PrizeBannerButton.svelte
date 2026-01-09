<script>
	import { createEventDispatcher } from 'svelte';
	import { t } from 'svelte-i18n';

	export let active = false;
	export let title = '';
	export let coverUrl = '';
	export let soldOut = false;

	const dispatch = createEventDispatcher();
	const buttonClick = () => dispatch('click');
</script>

<button class="button" class:active class:soldOut on:click={buttonClick}>
	{#if coverUrl}
		<img src={coverUrl} alt={title} crossorigin="anonymous" />
	{/if}
	{#if soldOut}
		<span class="soldout">{$t('gift.banner.soldOut')}</span>
	{/if}
</button>

<style>
	button {
		display: block;
		background-color: var(--secondary-color);
		border-radius: 0.25rem;
		width: 90px;
		min-width: 50px;
		aspect-ratio: 2.4/1;
		margin: 0.6em;
		position: relative;
		overflow: hidden;
		transition: all 0.2s;
	}

	button::after,
	button::before {
		content: '';
		display: block;
		width: 90%;
		height: 75%;
		border: 2.5px solid #6d8fbb;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		transition: all 0.2s;
		pointer-events: none;
	}

	button::after {
		border-radius: 0.4rem;
	}

	button::before {
		border-radius: 40px;
	}

	button.active,
	button:hover {
		background-color: var(--tertiary-color);
	}

	button.active::before,
	button.active::after,
	button:hover::before,
	button:hover::after {
		border: 2.5px solid #eee2c8;
	}

	button.active,
	button:hover {
		transform: scale(1.1);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.soldout {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.65);
		color: #fff;
		font-size: 0.7rem;
		white-space: nowrap;
	}

	.soldOut img {
		filter: grayscale(1);
		opacity: 0.7;
	}
</style>
