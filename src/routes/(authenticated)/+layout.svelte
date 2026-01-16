<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { createSupabaseClient } from '$lib/supabase';
	import { ROLE_LEVELS } from '$lib/constants/roles';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { LayoutDashboard, Shield, Settings, LogOut, Home } from '@lucide/svelte';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';

	let { data, children } = $props();

	const supabase = createSupabaseClient();

	async function handleSignOut() {
		await supabase.auth.signOut();
		await goto('/login');
	}

	// Check if user is admin or higher
	const isAdmin = $derived((data.userRole?.level ?? 0) >= ROLE_LEVELS.ADMIN);

	// Navigation items
	const navItems = $derived([
		{
			title: 'Dashboard',
			href: '/dashboard',
			icon: LayoutDashboard,
			visible: true
		},
		{
			title: 'Admin',
			href: '/admin/users',
			icon: Shield,
			visible: isAdmin
		},
		{
			title: 'Settings',
			href: '/settings',
			icon: Settings,
			visible: true
		}
	]);

	// Check if route is active
	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<Sidebar.Provider>
	<Sidebar.Sidebar collapsible="icon">
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg">
						{#snippet child({ props })}
							<a href="/" {...props}>
								<div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Home class="size-4" />
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-semibold">Hello World</span>
								</div>
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
						{#each navItems.filter(item => item.visible) as item}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={isActive(item.href)}
									tooltipContent={item.title}
								>
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
		</Sidebar.Content>

		<Sidebar.Footer>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<div class="flex flex-col gap-2 p-2">
						<div class="flex items-center gap-2 px-2">
							<div class="flex-1 text-sm">
								<p class="truncate font-medium">Signed in as</p>
								<p class="truncate font-medium">{data.user?.email}</p>
							</div>
						</div>
						<div>

						<ThemeToggle />
						<span class="flex-1 text-xs text-muted-foreground px-2">Theme</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							class="w-full justify-start"
							onclick={handleSignOut}
						>
							<LogOut class="mr-2 size-4" />
							Sign out
						</Button>
					</div>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
		<Sidebar.Rail />
	</Sidebar.Sidebar>

	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger />
			<Separator orientation="vertical" class="mr-2 h-4" />
		</header>
		<div class="flex flex-1 flex-col">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

