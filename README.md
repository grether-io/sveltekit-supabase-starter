# SvelteKit Supabase Starter

A modern, full-featured SvelteKit starter template with Supabase integration, authentication, and a comprehensive set of reusable UI components inspired by shadcn/ui.

---

## Table of Contents
- [Features](#features)
- [Authentication](#authentication)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Admin Panel](#admin-panel)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running Supabase Locally](#running-supabase-locally)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Building & Deployment](#building--deployment)
- [UI Components](#ui-components)
- [Modules & Libraries](#modules--libraries)
- [Testing & Linting](#testing--linting)
- [Additional Resources](#additional-resources)

---

## Features
- **SvelteKit 5** with TypeScript, Vite, and Tailwind CSS 4
- **Supabase Integration**: Authentication (email/password, 2FA), database, and storage
- **Role-Based Access Control (RBAC)**: 6-tier role hierarchy (Guest → Contributor → Author → Editor → Admin → SuperAdmin)
- **Admin Panel**: User management, role assignment, and comprehensive audit logging
- **Authentication Flows**: Login, signup, password reset, email verification, and 2FA setup
- **Theme Support**: Dark mode toggle with persistent preferences (mode-watcher)
- **Sidebar Navigation**: Responsive app sidebar with role-based menu items
- **Form Management**: Zod schema validation with sveltekit-superforms and formsnap
- **UI Component Library**: 19+ accessible, themeable components (shadcn/ui style)
- **Toast Notifications**: Beautiful toast messages (svelte-sonner)
- **Production-Ready**: Vercel adapter with environment-based configuration

---

## Authentication

This starter provides a complete authentication system powered by Supabase, with ready-to-use pages and flows for all common authentication scenarios.

### Authentication Flows

#### Email/Password Authentication
- **Sign Up** (`/signup`): Create new account with email, password, first name, and last name
- **Login** (`/login`): Sign in with email and password
- **Email Verification** (`/verify-email`): Verify email address after signup
- **Forgot Password** (`/forgot-password`): Request password reset link
- **Reset Password** (`/reset-password`): Set new password using reset token

#### Two-Factor Authentication (2FA)
- **2FA Setup** (`/settings`): Enable TOTP-based 2FA with QR code
- **2FA Login** (`/login/2fa`): Verify 6-digit code during login
- **Disable 2FA** (`/settings`): Turn off two-factor authentication

### Protecting Authenticated Routes

Routes inside the `(authenticated)` folder automatically require login. The layout checks for an active session:

```typescript
// src/routes/(authenticated)/+layout.server.ts
export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session, user } = await safeGetSession();
  
  if (!session) {
    redirect(303, '/login'); // Redirect to login if not authenticated
  }
  
  return { user };
};
```

### Authentication Hook

The `hooks.server.ts` file sets up Supabase authentication and injects user data into `event.locals`:

```typescript
// Supabase client creation and session management
export const handle = sequence(
  createSupabaseServerClient,  // Creates Supabase client
  authorizationHook             // Extracts user role from JWT
);
```

This makes `locals.safeGetSession()` and `locals.userRole` available in all server-side code.

### Session Management

- **Server-Side**: Use `event.locals.safeGetSession()` to get user and session
- **Client-Side**: Use the Supabase client from `$lib/supabase.ts`
- **Automatic Refresh**: Sessions automatically refresh on the client and server
- **JWT Claims**: User roles stored in JWT for efficient access control

### Files

- **`src/hooks.server.ts`**: Global authentication and authorization hooks
- **`src/lib/supabase.ts`**: Client-side Supabase client factory
- **`src/lib/server/supabase.ts`**: Server-side Supabase client creation
- **`src/lib/schemas/auth.ts`**: Zod validation schemas for all auth forms
- **`src/routes/login/`, `/signup/`, etc.**: Authentication page implementations

---

## Role-Based Access Control (RBAC)

This starter includes a complete role-based access control system with a 6-tier hierarchy. Each role has a numeric level that determines permissions, with higher numbers granting more access.

### Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| **Guest** | 10 | Basic access - default role for new users |
| **Contributor** | 30 | Can contribute content |
| **Author** | 50 | Can create and manage own content |
| **Editor** | 70 | Can edit others' content |
| **Admin** | 90 | Full administrative access to user management and settings |
| **SuperAdmin** | 100 | Complete system access with all privileges |

### Protecting Routes

Routes can be protected at different levels depending on your needs.

#### Layout-Level Protection (Entire Section)

Protect all routes within a section using `+layout.server.ts`:

```typescript
// src/routes/(authenticated)/admin/+layout.server.ts
import { requireRole, ROLE_LEVELS } from '$lib/server/auth-guard';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async (event: RequestEvent) => {
  // Require admin role (level 90) to access all /admin routes
  requireRole(event.locals, ROLE_LEVELS.ADMIN);
  
  return {};
};
```

#### Page-Level Protection (Single Route)

Protect a specific page using `+page.server.ts`:

```typescript
// src/routes/(authenticated)/dashboard/+page.server.ts
import { requireRole, ROLE_LEVELS } from '$lib/server/auth-guard';

export const load = async ({ locals }) => {
  // Require at least Author role to access this page
  requireRole(locals, ROLE_LEVELS.AUTHOR);
  
  // Load page data...
  return { data: '...' };
};
```

#### Conditional Role Checks

For more complex logic, use the `hasRole` helper:

```typescript
export const load = async ({ locals }) => {
  const isAdmin = locals.hasRole(ROLE_LEVELS.ADMIN);
  const isEditor = locals.hasRole(ROLE_LEVELS.EDITOR);
  
  return {
    canEdit: isEditor || isAdmin,
    canDelete: isAdmin,
    userRole: locals.userRole
  };
};
```

#### Client-Side Role Display

Access user role in components for UI customization:

```svelte
<script lang="ts">
  import { ROLE_LEVELS } from '$lib/constants/roles';
  
  let { data } = $props();
  
  const isAdmin = data.userRole?.level >= ROLE_LEVELS.ADMIN;
</script>

{#if isAdmin}
  <button>Admin Controls</button>
{/if}
```

**Note**: If a user lacks sufficient permissions, `requireRole` redirects them to `/dashboard`.

### Files

- **`src/lib/constants/roles.ts`**: Role definitions, levels, and display utilities
- **`src/lib/server/auth-guard.ts`**: Server-side role validation
- **`src/lib/schemas/roles.ts`**: Zod schemas for role operations
- **`src/lib/server/roles.ts`**: Database operations for role management

### Test Users

When running Supabase locally with seed data:

- **Admin**: `admin@test.com` / `password` (SuperAdmin role)
- **Guest**: `guest@test.com` / `password` (Guest role)

---

## Admin Panel

The admin section (`/admin`) provides comprehensive tools for managing users and monitoring system activity. Access requires **Admin** role (level 90) or higher.

### User Management (`/admin/users`)

- **View All Users**: See complete user list with emails and display names
- **Role Assignment**: Assign or change user roles via dropdown selectors
- **Visual Role Indicators**: Color-coded badges show current role for each user
- **Instant Updates**: Role changes apply immediately with automatic JWT refresh

### Audit Log (`/admin/audit`)

- **Complete History**: Track all role changes across the system
- **Detailed Records**: See who changed what, when, and to what role
- **Time Tracking**: Relative timestamps (e.g., "5 minutes ago") for recent changes
- **Change Visualization**: Clear before/after role displays with arrow indicators
- **Pagination**: Navigate through historical records efficiently

The audit system automatically logs all role assignments and changes, providing full accountability and compliance tracking.

---

## Project Structure

```
src/
  lib/
    components/
      app-sidebar.svelte       # Responsive sidebar navigation
      navigation.svelte        # Navigation menu component
      theme-toggle.svelte      # Dark/light mode toggle
      ui/
        alert/         # Alert, AlertTitle, AlertDescription
        badge/         # Badge component with variants
        button/        # Button
        card/          # Card, CardHeader, CardContent, etc.
        dropdown-menu/ # Dropdown menu components
        field/         # Field, FieldSet, FieldLabel, FieldError, etc.
        input/         # Input
        input-otp/     # InputOTP, InputOTPGroup, etc.
        label/         # Label
        navigation-menu/ # Navigation menu components
        select/        # Select, SelectContent, SelectItem, etc.
        separator/     # Separator
        sheet/         # Sheet (side drawer) component
        sidebar/       # Sidebar layout components
        skeleton/      # Skeleton loading states
        sonner/        # Toaster (toast notifications)
        table/         # Table, TableHeader, TableBody, etc.
        tabs/          # Tabs, TabsList, TabsContent, TabsTrigger
        tooltip/       # Tooltip component
    constants/
      roles.ts         # Role levels, names, descriptions, badge variants
    hooks/
      is-mobile.svelte.ts  # Mobile detection hook
    schemas/
      auth.ts          # Authentication schemas (login, signup, etc.)
      roles.ts         # Role operation schemas
    server/
      auth-guard.ts    # Role-based route protection
      roles.ts         # Database operations for roles
      supabase.ts      # Server-side Supabase client
    supabase.ts        # Client-side Supabase integration
    utils.ts           # Utility functions
  routes/
    (authenticated)/   # Authenticated routes (requires login)
      admin/           # Admin section (requires Admin role)
        users/         # User management page
        audit/         # Audit log page
      dashboard/       # User dashboard
      settings/        # User settings (profile, email, password, 2FA)
    login/             # Login page
      2fa/             # Two-factor authentication verification
    signup/            # Signup page
    forgot-password/   # Forgot password page
    reset-password/    # Reset password page
    verify-email/      # Email verification page
static/                # Static assets (favicon, robots.txt)
supabase/              # Supabase configuration
  migrations/          # Database migrations (roles system)
  seed/                # Seed data (roles, test users)
```

---

## Setup & Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd sveltekit-supabase-starter
   ```
2. **Install dependencies:**
   ```sh
   yarn install
   ```
3. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local`:
     ```sh
     cp .env.local.example .env.local
     ```
   - Fill in your Supabase project credentials:
     ```env
     PUBLIC_SUPABASE_URL='https://<your-project>.supabase.co'
     PUBLIC_SUPABASE_ANON_KEY='<your-anon-key>'
     PRIVATE_SUPABASE_SERVICE_ROLE='<your-service-role-key>'
     ```

---

## Running Supabase Locally

This project is fully integrated with Supabase for authentication, database, and storage. All Supabase logic is located in `src/lib/server/supabase.ts` and `src/lib/supabase.ts`. Auth flows use Supabase's email/password and 2FA features. Environment variables configure Supabase endpoints and keys (see the [Environment Variables](#environment-variables) section).

You can run a full Supabase stack (database, authentication, storage, etc.) on your machine for local development. This allows you to develop and test all features locally, just as they would work in production.

1. **Install the Supabase CLI:**
   ```sh
   yarn global add supabase
   ```
2. **Start Supabase locally:**
   ```sh
   supabase start
   ```
   This will launch the local Supabase stack (Postgres, Auth, Storage, etc.) using the existing `supabase/` directory in this project.
3. **Get your local credentials:**
   - After running `supabase start`, the CLI will print your local project URL and anon/service keys.
   - Update your `.env.local` file with these values:
     ```env
     PUBLIC_SUPABASE_URL='http://localhost:54321'
     PUBLIC_SUPABASE_ANON_KEY='<your-local-anon-key>'
     PRIVATE_SUPABASE_SERVICE_ROLE='<your-local-service-role-key>'
     ```
4. **Access the local Supabase Studio:**
   - Visit [http://localhost:54323](http://localhost:54323) in your browser for a web UI to manage your local Supabase instance.

For more details, see the [Supabase CLI documentation](https://supabase.com/docs/guides/cli/local-development).

---

## Environment Variables

- **PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **PUBLIC_SUPABASE_ANON_KEY**: Supabase anon public key (client-side operations)
- **PRIVATE_SUPABASE_SERVICE_ROLE**: Supabase service role key (server-side admin operations, bypasses RLS)

All environment variables should be set in `.env.local` (never commit secrets to version control).

---

## Development

Start the development server:
```sh
yarn dev
```
- The app will be available at `http://localhost:5173` (or as shown in the terminal).
- Hot module reloading is enabled.

To start and open the app in your browser automatically:
```sh
yarn dev --open
```

### Shortcuts
- `yarn s` — Start the dev server
- `yarn so` — Start the dev server and open in browser

---

## Building & Deployment

To build for production:
```sh
yarn build
```
To preview the production build:
```sh
yarn preview
```

### Deployment
- Uses the [Vercel adapter](https://kit.svelte.dev/docs/adapter-vercel) by default.
- To deploy elsewhere, install and configure the appropriate SvelteKit adapter.

---

## UI Components

All UI components are located in `src/lib/components/ui/` and are inspired by [shadcn/ui](https://ui.shadcn.com/). Each component is modular, accessible, and themeable with Tailwind CSS.

### Component List

- **Alert**: `Alert`, `AlertTitle`, `AlertDescription`
- **Badge**: `Badge` with color variants
- **Button**: `Button` with size and variant options
- **Card**: `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`, `CardAction`
- **Dropdown Menu**: `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, etc.
- **Field**: `Field`, `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldLabel`, `FieldTitle`, `FieldDescription`, `FieldError`, `FieldSeparator`, `FieldContent`
- **Input**: `Input` text input component
- **InputOTP**: `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`
- **Label**: `Label` for form fields
- **Navigation Menu**: `NavigationMenu`, `NavigationMenuItem`, `NavigationMenuLink`, etc.
- **Select**: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
- **Separator**: `Separator` horizontal/vertical divider
- **Sheet**: `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` (side drawer)
- **Sidebar**: `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, etc.
- **Skeleton**: `Skeleton` loading placeholder
- **Sonner**: `Toaster` toast notifications
- **Table**: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- **Tabs**: `Tabs`, `TabsList`, `TabsContent`, `TabsTrigger`
- **Tooltip**: `Tooltip`, `TooltipTrigger`, `TooltipContent`

#### Usage Example
```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Field from '$lib/components/ui/field';
  import { Input } from '$lib/components/ui/input';
</script>

<Field.Group>
  <Field.Set>
    <Field.Legend>Sign In</Field.Legend>
    <Field.Group>
      <Field.Field>
        <Field.Label for="email">Email</Field.Label>
        <Input id="email" name="email" />
        <Field.Error errors={[{ message: 'Required' }]} />
      </Field.Field>
    </Field.Group>
  </Field.Set>
  <Field.Field orientation="horizontal">
    <Button type="submit">Submit</Button>
  </Field.Field>
</Field.Group>
```

---

## Modules & Libraries

- **SvelteKit**: Full-stack framework for Svelte
- **Supabase**: Backend-as-a-service (auth, database, storage)
- **sveltekit-superforms**: Form management and validation
- **formsnap**: Enhanced form components with accessibility
- **zod**: TypeScript-first schema validation
- **svelte-sonner**: Toast notifications
- **mode-watcher**: Dark/light theme management with persistence
- **Tailwind CSS**: Utility-first CSS framework
- **bits-ui**: Headless UI component primitives
- **@lucide/svelte**: Icon library

---

## Testing & Linting

- **Lint:**
  ```sh
  yarn lint
  ```
- **Format:**
  ```sh
  yarn format
  ```
- **Type Check:**
  ```sh
  yarn check
  ```

---

## Additional Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [sveltekit-superforms](https://superforms.rocks/)
- [zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## License

MIT
