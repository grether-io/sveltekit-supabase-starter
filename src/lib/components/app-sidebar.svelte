<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { createSupabaseClient } from '$lib/supabase';
	import { ROLE_LEVELS } from '$lib/constants/roles';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Settings from '@lucide/svelte/icons/settings';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import Users from '@lucide/svelte/icons/users';
	import ScrollText from '@lucide/svelte/icons/scroll-text';
	import Home from '@lucide/svelte/icons/home';
	import { toggleMode } from 'mode-watcher';
	import type { User } from '@supabase/supabase-js';

	interface Props {
		user: User | null;
		userRole: { name: string; level: number } | null;
	}

	let { user, userRole }: Props = $props();

	const supabase = createSupabaseClient();

	async function handleSignOut() {
		await supabase.auth.signOut();
		await goto('/login');
	}

	function handleSettings() {
		goto('/settings');
	}

	// Check if user is admin or higher
	const isAdmin = $derived((userRole?.level ?? 0) >= ROLE_LEVELS.ADMIN);

	// Regular navigation items
	const navItems = $derived([
		{
			title: 'Dashboard',
			href: '/dashboard',
			icon: LayoutDashboard,
			visible: true
		}
	]);

	// Admin navigation items
	const adminNavItems = $derived([
		{
			title: 'Roles & Permissions',
			href: '/admin/users',
			icon: Users,
			visible: isAdmin
		},
		{
			title: 'Audit Log',
			href: '/admin/audit',
			icon: ScrollText,
			visible: isAdmin
		}
	]);

	// Get user initials from metadata or email
	function getUserInitials(): string {
		const firstname = user?.user_metadata?.first_name;
		const lastname = user?.user_metadata?.last_name;

		if (firstname && lastname) {
			return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
		}

		// Fallback to email
		const email = user?.email || '';
		const parts = email.split('@')[0].split('.');
		if (parts.length >= 2) {
			return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
		}
		return email.substring(0, 2).toUpperCase();
	}

	// Check if route is active
	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<Sidebar.Sidebar collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton tooltipContent="SvelteKit">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<Home />
							<span>SvelteKit</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navItems.filter((item) => item.visible) as item}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={isActive(item.href)} tooltipContent={item.title}>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		{#if isAdmin}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Administration</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each adminNavItems.filter((item) => item.visible) as item}
							<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={isActive(item.href)} tooltipContent={item.title}>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								size="lg"
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								{...props}
							>
								<div
									class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
								>
									<span class="text-xs font-semibold">{getUserInitials()}</span>
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate text-xs">{user?.email}</span>
								</div>
								<ChevronUp class="ml-auto size-4" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						side="top"
						align="end"
						class="w-[--bits-dropdown-menu-trigger-width] min-w-56 rounded-lg"
					>
						<DropdownMenu.Label class="p-0 font-normal">
							<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<div
									class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
								>
									<span class="text-xs font-semibold">{getUserInitials()}</span>
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-semibold">
										{#if user?.user_metadata?.first_name && user?.user_metadata?.last_name}
											{user.user_metadata.first_name}
											{user.user_metadata.last_name}
										{:else}
											{user?.email?.split('@')[0] || 'User'}
										{/if}
									</span>
									<span class="truncate text-xs">{user?.email}</span>
								</div>
							</div>
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={handleSettings}>
							<Settings class="size-4" />
							<span>Settings</span>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={toggleMode}>
							<Sun
								class="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
							/>
							<Moon
								class="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
							/>
							<span>Theme</span>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={handleSignOut}>
							<LogOut class="size-4" />
							<span>Log out</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Sidebar>

