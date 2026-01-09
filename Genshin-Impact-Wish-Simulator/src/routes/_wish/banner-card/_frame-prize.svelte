<script>
	import { t } from 'svelte-i18n';

	export let bannerName = '';
	export let rules = '';
	export let remainingTotal = 0;
	export let isSoldOut = false;
	export let status = 'draft';
	export let description = '';
</script>

<div class="info">
	<h2 class="title">{bannerName}</h2>
	{#if description}
		<p class="description">{description}</p>
	{/if}

	{#if rules}
		<div class="rules">
			<span class="label">{$t('gift.banner.rules')}</span>
			<p>{@html rules}</p>
		</div>
	{/if}

	<div class="meta">
		{#if status !== 'active'}
			<span class="status">{$t(`gift.banner.status.${status}`)}</span>
		{/if}
		{#if isSoldOut}
			<span class="soldout">{$t('gift.banner.soldOut')}</span>
		{:else}
			<span class="remaining">
				{$t('gift.banner.remaining', { values: { count: remainingTotal } })}
			</span>
		{/if}
	</div>
</div>

<style>
	.info {
		position: absolute;
		inset: 0;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		color: #fff;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0));
	}

	.title {
		margin: 0 0 0.5rem;
		font-size: 1.8rem;
		text-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.5);
	}

	.description {
		margin: 0 0 0.6rem;
		max-width: 65%;
		font-size: 0.9rem;
		line-height: 1.4;
		color: rgba(255, 255, 255, 0.9);
	}

	.rules {
		max-width: 65%;
		font-size: 0.9rem;
		line-height: 1.4;
		background: rgba(0, 0, 0, 0.35);
		padding: 0.6rem 0.8rem;
		border-radius: 0.6rem;
	}

	.label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.3rem;
	}

	.rules p {
		margin: 0;
	}

	.meta {
		margin-top: 0.8rem;
		font-size: 0.95rem;
	}

	.remaining,
	.soldout,
	.status {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.6);
	}

	.status {
		margin-right: 0.5rem;
	}
</style>
