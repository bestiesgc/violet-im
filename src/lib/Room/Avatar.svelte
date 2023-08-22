<script>
	import client from '$lib/client/index.js'
	export let room
	export let size = 96
</script>

<img
	class="avatar"
	width={size}
	height={size}
	src={client.getRoomAvatarUrl(room, size) ??
		`https://api.dicebear.com/6.x/initials/svg?seed=${room.name}&chars=1`}
	aria-hidden="true"
	alt=""
/>

<style lang="postcss">
	.avatar {
		user-select: none;
	}
</style>
