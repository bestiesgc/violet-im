<script>
	export let room
	export let size = 96
</script>

<img
	class="avatar"
	width={size}
	height={size}
	src={room.getAvatarUrl(window.matrixClient.baseUrl, size, size) ??
		room
			.getAvatarFallbackMember()
			?.getAvatarUrl(window.matrixClient.baseUrl, size, size) ??
		`https://api.dicebear.com/6.x/initials/svg?seed=${room.name}&chars=1`}
	aria-hidden="true"
	alt=""
/>

<style>
	.avatar {
		user-select: none;
	}
</style>
