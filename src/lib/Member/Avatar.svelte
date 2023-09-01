<script lang="ts">
	import type { RoomMember } from 'matrix-js-sdk'
	import client from '$lib/client/index'
	export let member: RoomMember
	export let size = 96
</script>

<img
	loading="lazy"
	class="avatar"
	aria-hidden="true"
	draggable="false"
	width="{size}px"
	height="{size}px"
	src={client.getMemberAvatarUrl(member, size)}
	alt=""
/>

<style lang="postcss">
	.avatar {
		user-select: none;
	}
</style>
