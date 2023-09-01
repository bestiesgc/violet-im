<script lang="ts">
	export let value: string
	export let placeholder: string | null = null
	export let name: string | null = null
</script>

<div class="textarea">
	<div aria-hidden="true" class="content">{value + ' '}</div>
	<textarea
		rows="1"
		{placeholder}
		class="content"
		{name}
		on:keydown
		on:input
		bind:value
	/>
</div>

<style lang="postcss">
	.textarea {
		display: grid;
	}
	.textarea > textarea {
		resize: none;
		overflow: hidden;
	}
	.textarea > div {
		visibility: hidden;
	}
	.textarea .content {
		white-space: pre-wrap;
		font: inherit;
		grid-area: 1 / 1 / 2 / 2;
	}
</style>
