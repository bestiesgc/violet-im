<script lang="ts">
	import type { Room } from 'matrix-js-sdk'
	import client from '$lib/client/index'
	export let room: Room
	export let size = 96
</script>

<img
	class="avatar"
	aria-hidden="true"
	draggable="false"
	width="{size}px"
	height="{size}px"
	src={client.getRoomAvatarUrl(room, size) ??
		`https://api.dicebear.com/6.x/initials/svg?seed=${room.name}&chars=1`}
	alt=""
/>

<style lang="postcss">
	.avatar {
		user-select: none;
	}
</style>
