<script>
	import { createEventDispatcher } from 'svelte';
	import { t } from 'svelte-i18n';

	import Modal from '$lib/components/ModalTpl.svelte';

	export let requirePassword = false;
	export let processing = false;
	export let errorMessage = '';

	const dispatch = createEventDispatcher();

	let employeeId = '';
	let password = '';

	const handleConfirm = () => {
		dispatch('submit', { employeeId, password });
	};
</script>

<Modal
	title={$t('gift.login.title')}
	confirmOnly
	disabled={processing || !employeeId}
	on:confirm={handleConfirm}
>
	<div class="login">
		<label>
			<span>{$t('gift.login.employeeId')}</span>
			<input
				type="text"
				placeholder={$t('gift.login.employeeIdPlaceholder')}
				bind:value={employeeId}
			/>
		</label>

		{#if requirePassword}
			<label>
				<span>{$t('gift.login.password')}</span>
				<input
					type="password"
					placeholder={$t('gift.login.passwordPlaceholder')}
					bind:value={password}
				/>
			</label>
		{/if}

		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}
	</div>

	<svelte:fragment slot="confirmtext">
		{processing ? $t('gift.login.loading') : $t('gift.login.confirm')}
	</svelte:fragment>
</Modal>

<style>
	.login {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem 0 1.5rem;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-align: left;
		font-size: 0.95rem;
	}

	input {
		border-radius: 0.6rem;
		border: 1px solid #d7cbb7;
		padding: 0.6rem 0.8rem;
		font-size: 1rem;
		background-color: #fffaf2;
	}

	.error {
		margin: 0;
		color: #b34141;
		font-size: 0.9rem;
	}
</style>
