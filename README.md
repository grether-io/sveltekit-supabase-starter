# SvelteKit Supabase Starter

A modern, full-featured SvelteKit starter template with Supabase integration, authentication, and a comprehensive set of reusable UI components inspired by shadcn/ui.

---

## Table of Contents
- [Features](#features)
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
- SvelteKit 5, TypeScript, Vite, Tailwind CSS
- Supabase authentication (email/password, 2FA)
- Zod schema validation & sveltekit-superforms
- Modular, accessible UI components (shadcn/ui style)
- Ready-to-use authentication flows (login, signup, reset, 2FA)
- Toast notifications (svelte-sonner)
- Environment-based configuration
- Production-ready (Vercel adapter)

---

## Project Structure

```
src/
  lib/
    components/
      ui/
        alert/         # Alert, AlertTitle, AlertDescription
        button/        # Button
        card/          # Card, CardHeader, CardContent, etc.
        field/         # Field, FieldSet, FieldLabel, FieldError, etc.
        input/         # Input
        input-otp/     # InputOTP, InputOTPGroup, etc.
        label/         # Label
        separator/     # Separator
        sonner/        # Toaster (toast notifications)
        tabs/          # Tabs, TabsList, TabsContent, TabsTrigger
    schemas/           # Zod schemas for forms
    server/            # Server-side Supabase integration
    utils.ts           # Utility functions
  routes/              # SvelteKit routes (pages, layouts, endpoints)
    login/             # Login, 2FA
    signup/            # Signup
    forgot-password/   # Forgot password
    reset-password/    # Reset password
    settings/          # User settings
    dashboard/         # Authenticated dashboard
static/                # Static assets (favicon, robots.txt)
supabase/              # Supabase config
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
- **PUBLIC_SUPABASE_ANON_KEY**: Supabase anon public key
- **PRIVATE_SUPABASE_SERVICE_ROLE**: Supabase service role key (server-side only)

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
- **Button**: `Button`
- **Card**: `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`, `CardAction`
- **Field**: `Field`, `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldLabel`, `FieldTitle`, `FieldDescription`, `FieldError`, `FieldSeparator`, `FieldContent`
- **Input**: `Input`
- **InputOTP**: `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`
- **Label**: `Label`
- **Separator**: `Separator`
- **Sonner**: `Toaster` (toast notifications)
- **Tabs**: `Tabs`, `TabsList`, `TabsContent`, `TabsTrigger`

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
- **zod**: TypeScript-first schema validation
- **svelte-sonner**: Toast notifications
- **Tailwind CSS**: Utility-first CSS framework
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
