<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Card } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ROLE_BADGE_VARIANTS } from '$lib/constants/roles';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let { data } = $props();

	// Format timestamp as relative or absolute
	function formatTimestamp(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
		if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
		if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

		// Older than a week, show absolute date
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Navigate to page
	function goToPage(pageNumber: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', pageNumber.toString());
		goto(url.toString());
	}
</script>

<div class="min-h-screen px-4 py-12">
	<div class="mx-auto max-w-6xl">
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">Audit Log</h1>
				<p class="text-gray-600 dark:text-gray-400">Track all role changes and assignments</p>
			</div>
		</div>

		<Card class="p-6">
			{#if data.auditLog.entries.length === 0}
				<p class="text-center text-sm text-muted-foreground py-8">No audit records found.</p>
			{:else}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead class="w-45">Timestamp</TableHead>
							<TableHead>User</TableHead>
							<TableHead class="w-25">Action</TableHead>
							<TableHead>Role Change</TableHead>
							<TableHead>Changed By</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.auditLog.entries as entry (entry.id)}
							<TableRow>
								<TableCell class="font-mono text-sm">
									{formatTimestamp(entry.changed_at)}
								</TableCell>
								<TableCell>
									<div class="flex flex-col">
										<span class="font-medium">{entry.user_display_name || 'Unknown'}</span>
										{#if entry.user_email}
											<span class="text-xs text-muted-foreground">{entry.user_email}</span>
										{/if}
									</div>
								</TableCell>
								<TableCell>
									<Badge variant={entry.action === 'INSERT' ? 'secondary' : 'default'}>
										{entry.action}
									</Badge>
								</TableCell>
								<TableCell>
									<div class="flex items-center gap-2">
										{#if entry.old_role_name}
											<Badge variant={ROLE_BADGE_VARIANTS[entry.old_role_level || 10]}>
												{entry.old_role_name}
											</Badge>
										{/if}
										{#if entry.old_role_name && entry.new_role_name}
											<ArrowRight class="h-4 w-4 text-muted-foreground" />
										{/if}
										{#if entry.new_role_name}
											<Badge variant={ROLE_BADGE_VARIANTS[entry.new_role_level || 10]}>
												{entry.new_role_name}
											</Badge>
										{/if}
									</div>
								</TableCell>
								<TableCell>
									<div class="flex flex-col">
										<span class="text-sm">{entry.changed_by_display_name || 'System'}</span>
										{#if entry.changed_by_email}
											<span class="text-xs text-muted-foreground">{entry.changed_by_email}</span>
										{/if}
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>

				<!-- Pagination -->
				{#if data.auditLog.totalPages > 1}
					<div class="mt-6 flex items-center justify-between border-t pt-4">
						<div class="text-sm text-muted-foreground">
							Page {data.auditLog.currentPage} of {data.auditLog.totalPages}
							({data.auditLog.totalCount} total records)
						</div>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={data.auditLog.currentPage === 1}
								onclick={() => goToPage(data.auditLog.currentPage - 1)}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={data.auditLog.currentPage === data.auditLog.totalPages}
								onclick={() => goToPage(data.auditLog.currentPage + 1)}
							>
								Next
							</Button>
						</div>
					</div>
				{/if}
			{/if}
		</Card>
	</div>
</div>

