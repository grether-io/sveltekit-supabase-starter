<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { ROLE_BADGE_VARIANTS } from '$lib/constants/roles';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	// Track selected roles for each user (storing role IDs as strings)
	let selectedRoles = $state<Record<string, string | undefined>>({});

	// Handle role assignment
	async function handleAssignRole(userId: string) {
		const selectedRoleId = selectedRoles[userId];
		if (!selectedRoleId) {
			toast.error('Please select a role');
			return;
		}

		try {
			const formData = new FormData();
			formData.append('userId', userId);
			formData.append('roleId', selectedRoleId);

			const response = await fetch('?/assignRole', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success') {
				toast.success('Role assigned successfully');

				// Check if we're updating the current user's role
				const currentUser = data.session?.user;
				if (currentUser && userId === currentUser.id) {
					// Force JWT token refresh for current user
					const supabase = (await import('$lib/supabase')).createSupabaseClient();
					await supabase.auth.refreshSession();
					// Reload the page to reflect changes
					window.location.reload();
				} else {
					// Just reload to update the table
					window.location.reload();
				}
			} else {
				toast.error(result.data?.message || 'Failed to assign role');
			}
		} catch (error) {
			console.error('Error assigning role:', error);
			toast.error('An unexpected error occurred');
		}
	}

	// Get display name for user
	function getDisplayName(user: (typeof data.users)[0]): string {
		if (user.user_metadata.display_name) {
			return user.user_metadata.display_name;
		}
		if (user.user_metadata.first_name && user.user_metadata.last_name) {
			return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
		}
		return user.email;
	}

	// Get selected role name for display in trigger
	function getSelectedRoleName(userId: string): string {
		const roleId = selectedRoles[userId];
		if (!roleId) return 'Select role';
		const role = data.availableRoles.find(r => r.id === roleId);
		return role?.name || 'Select role';
	}
</script>

<div class="min-h-screen px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="mb-8">
			<h1 class="text-3xl font-bold">User Management</h1>
			<p class="text-gray-600 dark:text-gray-400" >Manage user roles and permissions</p>
		</div>

			{#if data.users.length === 0}
				<p class="text-sm text-muted-foreground">No users to manage.</p>
			{:else}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Email</TableHead>
							<TableHead>Display Name</TableHead>
							<TableHead>Current Role</TableHead>
							<TableHead>Assign Role</TableHead>
							<TableHead class="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.users as user (user.id)}
							<TableRow>
								<TableCell class="font-medium">{user.email}</TableCell>
								<TableCell>{getDisplayName(user)}</TableCell>
								<TableCell>
									<Badge variant={ROLE_BADGE_VARIANTS[user.role.level]}>
										{user.role.name}
									</Badge>
								</TableCell>
								<TableCell>
									<Select
										type="single"
										bind:value={selectedRoles[user.id]}
										disabled={user.role.level >= data.currentUserLevel}
									>
										<SelectTrigger class="w-45">
											<span>
												{getSelectedRoleName(user.id)}
											</span>
										</SelectTrigger>
										<SelectContent>
											{#each data.availableRoles as role (role.id)}
												<SelectItem value={role.id}>
													{role.name}
												</SelectItem>
											{/each}
										</SelectContent>
									</Select>
								</TableCell>
								<TableCell class="text-right">
									<Button
										size="sm"
										disabled={!selectedRoles[user.id] || user.role.level >= data.currentUserLevel}
										onclick={() => handleAssignRole(user.id)}
									>
										Assign
									</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
</div>

</div>