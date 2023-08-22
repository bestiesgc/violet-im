<script>
	import Timeline from '$lib/Room/Timeline.svelte'
	export let data
</script>

{#if !data.roomId}
	<div class="center">
		<h1>pick a conversation</h1>
	</div>
{:else}
	<Timeline room={data.room}></Timeline>
{/if}

<style>
	.center {
		height: 100%;
		display: grid;
		place-items: center;
	}
</style>
