# AI Agent Instructions for ReactJS_UsedCarPortal

## Project Architecture Overview

This is a modern Laravel + React application for a used car marketplace with the following key components:

- **Frontend**: React (TypeScript) with Inertia.js for seamless SPA-like experience
- **Backend**: Laravel 12+ with SQLite database
- **UI**: TailwindCSS with custom components using Radix UI primitives
- **Authentication**: Laravel Sanctum + Social login support
- **API Integration**: External car data API (crazy-rabbit-api.carro.sg)

## Key Technical Patterns

### Frontend Architecture
- React components live in `resources/js/components/`
- Pages are in `resources/js/pages/` following Inertia.js conventions
- TypeScript types in `resources/js/types/`
- Route definitions use type-safe helpers from `@/routes`
- Component examples: `CarSelector.tsx`, `CarSearchBar.tsx` demonstrate data fetching patterns

### Backend Architecture
- Models in `app/Models/` follow Laravel conventions 
- Controllers in `app/Http/Controllers/` grouped by feature
- Database structure defined in `database/migrations/`
- Routes organized in feature-specific files (`web.php`, `api.php`, `settings.php`)
- Uses repository pattern with service layer where needed

## Development Workflow

### Setup New Development Environment
```bash
# Install dependencies
composer install
npm install

# Environment setup
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate

# Start development servers
composer dev      # Runs all services
# OR
composer dev:ssr  # Runs with SSR enabled
```

### Key Development Commands
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run lint` - ESLint with auto-fix
- `npm run format` - Prettier formatting
- `composer test` - Run test suite
- `php artisan serve` - Start Laravel server

## Common Patterns

### Adding New Features
1. Add routes in appropriate route file (`routes/*.php`)
2. Create controller in `app/Http/Controllers/`
3. Add React page in `resources/js/pages/`
4. Create components in `resources/js/components/`
5. Add types in `resources/js/types/` if needed

### State Management
- Use React hooks for local state
- Inertia.js shared props for global state
- Laravel sessions for server-side state
- Avoid prop drilling - prefer composition or context

### Data Fetching
- Use Inertia.js forms for mutations
- External API calls wrapped in dedicated service classes
- Example pattern in `CarSelector.tsx` for third-party API integration

### Type Safety
- All new React components should use TypeScript
- Define interfaces for API responses in `types/`
- Use Laravel form requests for validation
- Reference existing components for typing patterns

## Configuration
- Environment variables in `.env` (see `.env.example`)
- Frontend config in `vite.config.ts`
- Laravel config in `config/*.php`
- Database schema in `database/migrations/`

## Testing
- PHP tests in `tests/` directory
- Run tests with `composer test`
- GitHub Actions workflow in `.github/workflows/tests.yml`
- Follows Laravel's testing conventions