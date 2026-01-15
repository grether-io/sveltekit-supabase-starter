<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { ROLE_BADGE_VARIANTS } from '$lib/constants/roles';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	// Track selected roles for each user
	let selectedRoles = $state<Record<string, { value: string; label: string } | undefined>>({});

	// Handle role assignment
	async function handleAssignRole(userId: string) {
		const selectedRole = selectedRoles[userId];
		if (!selectedRole) {
			toast.error('Please select a role');
			return;
		}

		try {
			const formData = new FormData();
			formData.append('userId', userId);
			formData.append('roleId', selectedRole.value);

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
		if (user.user_metadata.firstname && user.user_metadata.lastname) {
			return `${user.user_metadata.firstname} ${user.user_metadata.lastname}`;
		}
		return user.email;
	}
</script>

<div class="container mx-auto py-10">
	<Card>
		<CardHeader>
			<CardTitle>User Management</CardTitle>
			<CardDescription>Manage user roles and permissions</CardDescription>
		</CardHeader>
		<CardContent>
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
										bind:value={selectedRoles[user.id]}
										disabled={user.role.level >= data.currentUserLevel}
									>
										<SelectTrigger class="w-45">
											<span>
												{selectedRoles[user.id]?.label || 'Select role'}
											</span>
										</SelectTrigger>
										<SelectContent>
											{#each data.availableRoles as role (role.id)}
												<SelectItem value={{ value: role.id, label: role.name }}>
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
		</CardContent>
	</Card>
</div>

