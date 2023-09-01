<script lang="ts">
	import client from '$lib/client/index'
	import { RoomMember, User } from 'matrix-js-sdk'
	export let member: RoomMember | User
	export let size = 96
</script>

{#if member instanceof RoomMember}
	<img
		class="avatar"
		aria-hidden="true"
		draggable="false"
		width="{size}px"
		height="{size}px"
		src={client.getMemberAvatarUrl(member, size) ??
			`https://api.dicebear.com/6.x/initials/svg?seed=${member.name}&chars=1`}
		alt=""
	/>
{:else if member instanceof User}
	<img
		class="avatar"
		aria-hidden="true"
		draggable="false"
		width="{size}px"
		height="{size}px"
		src={client.getUserAvatarUrl(member, size) ??
			`https://api.dicebear.com/6.x/initials/svg?seed=${member.displayName}&chars=1`}
		alt=""
	/>
{/if}

<style lang="postcss">
	.avatar {
		user-select: none;
	}
</style>
