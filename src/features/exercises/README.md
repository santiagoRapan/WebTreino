# Exercises Feature

This feature module handles all exercise-related functionality including exercise catalog, search, and filtering.

## Structure

```
exercises/
├── hooks/
│   ├── useExercises.ts         # Core exercise fetching hook with pagination
│   └── useExerciseSearch.ts    # Optimized search hook with debouncing
├── constants.ts                 # Fallback exercises for offline mode
├── types.ts                     # Exercise-related TypeScript types
├── index.ts                     # Barrel exports
└── README.md                    # This file
```

## Hooks

### `useExercises`
Core hook for fetching exercises from the database with filtering and pagination.

**Features:**
- Pagination support with infinite scroll
- Search by exercise name
- Filter by category/body part
- Filter by equipment
- Configurable page size
- Optional initial load (can defer loading until search)

**Usage:**
```tsx
import { useExercises } from '@/features/exercises'

const { 
  exercises, 
  loading, 
  error, 
  hasMore, 
  loadMore, 
  refetch 
} = useExercises({
  searchTerm: 'squat',
  category: 'lower body',
  equipment: 'barbell',
  pageSize: 50,
  initialLoad: true
})
```

**Parameters:**
- `searchTerm`: Filter exercises by name (case-insensitive)
- `category`: Filter by category or body part
- `equipment`: Filter by required equipment
- `pageSize`: Number of exercises per page (default: 50)
- `initialLoad`: Load exercises on mount (default: false)

**Returns:**
- `exercises`: Array of Exercise objects
- `loading`: Boolean loading state
- `error`: Error message if any
- `hasMore`: Whether more results are available
- `loadMore`: Function to load next page
- `refetch`: Function to reload from page 0
- `search`: Function to search with new filters

### `useExerciseSearch`
Optimized search hook with debouncing and automatic filter extraction.

**Features:**
- Debounced search (300ms default)
- Always loads initial exercises
- Automatic category extraction from loaded exercises
- Automatic equipment extraction from loaded exercises
- Search active indicator

**Usage:**
```tsx
import { useExerciseSearch } from '@/features/exercises'

const {
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  equipment,
  setEquipment,
  exercises,
  loading,
  uniqueCategories,
  uniqueEquipments,
  isSearchActive
} = useExerciseSearch({
  debounceMs: 300,
  pageSize: 50
})
```

**Parameters:**
- `debounceMs`: Debounce delay in milliseconds (default: 300)
- `pageSize`: Number of exercises per page (default: 50)

**Returns:**
- **Search State:**
  - `searchTerm`: Current search term
  - `setSearchTerm`: Update search term
  - `category`: Selected category filter
  - `setCategory`: Update category filter
  - `equipment`: Selected equipment filter
  - `setEquipment`: Update equipment filter

- **Results:**
  - `exercises`: Filtered exercise array
  - `loading`: Boolean loading state
  - `error`: Error message if any
  - `hasMore`: Whether more results available
  - `loadMore`: Load next page
  - `refetch`: Reload from start

- **Filter Options:**
  - `uniqueCategories`: Array of unique categories from loaded exercises
  - `uniqueEquipments`: Array of unique equipment from loaded exercises

- **Helper:**
  - `isSearchActive`: True if any filter is active

## Constants

### `FALLBACK_EXERCISES`
Array of 8 basic exercises used as fallback when database is unavailable or during development.

**Includes:**
- Push-ups
- Squats
- Plank
- Burpees
- Lunges
- Pull-ups
- Deadlifts
- Bench Press

## Types

### `Exercise`
Main exercise data structure.

**Properties:**
- `id`: Unique identifier (UUID)
- `name`: Exercise name
- `gif_URL`: URL to animated GIF demonstration (optional)
- `target_muscles`: Primary muscles targeted
- `body_parts`: Body parts involved
- `equipments`: Required equipment
- `description`: Exercise description (optional)
- `category`: Exercise category (optional)
- `secondary_muscles`: Secondary muscles worked

### `UseExercisesOptions`
Configuration options for `useExercises` hook.

### `UseExercisesReturn`
Return type for `useExercises` hook.

### `UseExerciseSearchOptions`
Configuration options for `useExerciseSearch` hook.

### `UseExerciseSearchReturn`
Return type for `useExerciseSearch` hook.

## Database Schema

The exercises are stored in the `exercises` table:

```sql
CREATE TABLE exercises (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    gif_URL text,
    target_muscles text[],
    body_parts text[],
    equipments text[],
    secundary_muscles text[]
);
```

**Indexes:**
- `idx_exercises_name` - B-tree index on name for fast search
- `idx_exercises_target_muscles` - GIN index for array searching
- `idx_exercises_body_parts` - GIN index for array searching

## Performance Optimizations

1. **Debouncing**: Search queries are debounced to reduce API calls
2. **Pagination**: Results are paginated to avoid loading all exercises at once
3. **Lazy Loading**: Exercises can be loaded on-demand instead of on mount
4. **GIN Indexes**: Database uses GIN indexes for fast array searching
5. **Result Caching**: React Query can be integrated for additional caching

## Usage in Routines

The exercise feature is used extensively in the routines feature:

- Exercise selection when building routine blocks
- Exercise catalog browsing
- Exercise filtering by muscle group and equipment
- Exercise search during routine creation

## Notes

- Exercise GIF URLs should point to valid animated demonstrations
- Target muscles and body parts use lowercase, hyphenated naming
- Equipment names are standardized (e.g., "barbell", "dumbbells", "body weight")
- The search is case-insensitive and uses PostgreSQL's `ILIKE` operator

