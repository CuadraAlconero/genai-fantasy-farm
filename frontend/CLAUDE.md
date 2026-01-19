# CLAUDE.md - Frontend

This file provides guidance to Claude Code (claude.ai/code) when working with the React TypeScript frontend code in this repository.

## Project Overview

Farm Village Sim is an LLM-powered simulation of life as a newcomer in a fantasy farm village. This is the **frontend** portion of the project, built with React, TypeScript, and Vite.

The frontend provides:
- Character creation wizard interface
- Character browsing and management
- Event generation interface
- Event viewer with conversation playback
- Dashboard for navigation

## Development Commands

### Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Development

```bash
# Start dev server (usually runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Run linter
npm run lint

# Run linter with auto-fix
npm run lint -- --fix
```

### TypeScript

```bash
# Type checking is built into the dev server and build process
# Vite will show type errors in the console during development
```

## Architecture

### Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   ├── pages/               # Full page components
│   │   ├── Landing.tsx      # Home page
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Characters.tsx   # Character list/browse
│   │   ├── CreateCharacter.tsx  # Character creation wizard
│   │   ├── Events.tsx       # Event list/browse
│   │   ├── CreateEvent.tsx  # Event creation interface
│   │   └── EventViewer.tsx  # Event playback viewer
│   ├── components/          # Reusable UI components
│   │   ├── WizardStep.tsx   # Wizard step wrapper
│   │   ├── CharacterPreview.tsx  # Character card display
│   │   ├── SpeechBubble.tsx      # Chat bubble for events
│   │   ├── TurnDisplay.tsx       # Event turn display
│   │   └── CharacterPortrait.tsx # Character avatar
│   ├── hooks/               # Custom React hooks
│   │   ├── useCharacters.ts     # Fetch characters from API
│   │   ├── useCreateCharacter.ts # Character creation API
│   │   └── useEvents.ts         # Fetch events from API
│   └── types/               # TypeScript type definitions
│       ├── character.ts     # Character-related types
│       └── event.ts         # Event-related types
├── public/                  # Static assets
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

### Key Technologies

- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server (fast HMR)
- **React Router**: Client-side routing
- **Fetch API**: HTTP requests to backend (no axios/other libs)
- **CSS**: Plain CSS with CSS variables (no CSS-in-JS or Tailwind)

### Component Architecture

#### Pages

Pages are full-screen components that represent routes:
- **Landing**: Welcome page with project intro
- **Dashboard**: Navigation hub to all features
- **Characters**: Browse all generated characters
- **CreateCharacter**: Multi-step wizard for character creation
- **Events**: Browse all generated events
- **CreateEvent**: Interface to select characters and generate events
- **EventViewer**: Display event conversation with turn-by-turn playback

#### Components

Reusable UI components used across pages:
- **WizardStep**: Container for wizard steps with navigation
- **CharacterPreview**: Card displaying character summary
- **SpeechBubble**: Styled chat bubble for event dialogue
- **TurnDisplay**: Single turn in event conversation
- **CharacterPortrait**: Character avatar/image display

#### Hooks

Custom hooks for API interactions and state management:

**useCharacters**
- Fetches list of all characters from `/api/characters`
- Returns: `{ characters, loading, error, refetch }`
- Used in Characters page and CreateEvent page

**useCreateCharacter**
- Handles character creation API call
- Manages loading state and errors
- Returns: `{ createCharacter, loading, error }`
- Used in CreateCharacter wizard

**useEvents**
- Fetches list of all events from `/api/events`
- Returns: `{ events, loading, error, refetch }`
- Used in Events page

### Type System

TypeScript interfaces mirror backend Pydantic models:

**Character Types** (`types/character.ts`):
```typescript
interface Character {
  id: string
  name: string
  appearance: Appearance
  personality: Personality
  backstory: Backstory
  skills: Skills
  stats: StatBlock
}

interface Appearance {
  age: number
  gender: string
  species: string
  physical_description: string
  clothing_style: string
}

// ... other interfaces
```

**Event Types** (`types/event.ts`):
```typescript
interface Event {
  id: string
  character_a: Character
  character_b: Character
  turns: Turn[]
  summary: string
  outcome: string
  created_at: string
}

interface Turn {
  speaker: string
  message: string
  mood: string
}
```

### API Integration

#### Backend Connection

The frontend expects the backend API to be running at `http://localhost:8000`.

**Key Endpoints:**
- `GET /api/characters` - List all characters
- `POST /api/characters` - Create new character
- `GET /api/characters/{id}` - Get single character
- `GET /api/events` - List all events
- `POST /api/events` - Generate new event
- `GET /api/events/{id}` - Get single event

#### API Call Pattern

```typescript
// Example: Fetching characters
const response = await fetch('http://localhost:8000/api/characters')
if (!response.ok) {
  throw new Error('Failed to fetch characters')
}
const characters: Character[] = await response.json()
```

#### Error Handling

- Display user-friendly error messages
- Show loading states during API calls
- Handle network errors gracefully
- Provide retry mechanisms where appropriate

### State Management

- **Local state**: `useState` for component-local state
- **API state**: Custom hooks manage data fetching and caching
- **URL state**: React Router for navigation state
- **No global state management library** (Redux, Zustand, etc.) - not needed for current scope

### Styling

#### CSS Strategy

- Plain CSS files (no preprocessors)
- CSS modules can be used for component-scoped styles
- CSS variables for theming (defined in `index.css`)
- Mobile-responsive design with media queries

#### Design Principles

- Clean, readable interface
- Fantasy/medieval aesthetic (where appropriate)
- Consistent spacing and typography
- Accessible color contrasts
- Loading states for async operations
- Error states with helpful messages

## Code Style

### TypeScript Style Guide

- **Linter**: ESLint with React and TypeScript rules
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Exports**: Named exports preferred over default exports
- **Types**: Prefer interfaces over type aliases for object shapes
- **Strictness**: Strict mode enabled (`tsconfig.json`)

### React Best Practices

**Component Structure:**
```typescript
import React, { useState, useEffect } from 'react'
import type { Character } from '../types/character'

interface MyComponentProps {
  character: Character
  onUpdate: (id: string) => void
}

export function MyComponent({ character, onUpdate }: MyComponentProps) {
  const [loading, setLoading] = useState(false)

  // Hooks first
  useEffect(() => {
    // effect logic
  }, [])

  // Event handlers
  const handleClick = () => {
    onUpdate(character.id)
  }

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

**Hooks Rules:**
- Always use hooks at the top level (not in conditionals/loops)
- Custom hooks start with `use` prefix
- Properly declare dependencies in `useEffect`

**Props:**
- Destructure props in function signature
- Use TypeScript interfaces for prop types
- Avoid prop drilling (consider composition instead)

**Event Handlers:**
- Prefix with `handle` (e.g., `handleClick`, `handleSubmit`)
- Inline arrow functions for simple cases only
- Use `useCallback` for functions passed to child components (when needed for performance)

### Import Organization

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react'

// 2. Third-party imports
import { useNavigate } from 'react-router-dom'

// 3. Local imports - types
import type { Character } from '../types/character'

// 4. Local imports - hooks
import { useCharacters } from '../hooks/useCharacters'

// 5. Local imports - components
import { CharacterPreview } from '../components/CharacterPreview'

// 6. Styles
import './MyComponent.css'
```

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/MyPage.tsx`
2. Add route in `App.tsx` (React Router)
3. Add navigation link in Dashboard or header
4. Create any necessary types in `src/types/`
5. Create any necessary hooks in `src/hooks/`
6. Test routing and navigation

### Creating a Reusable Component

1. Create component file in `src/components/MyComponent.tsx`
2. Define prop interface with TypeScript
3. Implement component with proper typing
4. Add component-specific styles if needed
5. Export component (named export)
6. Use in relevant pages

### Adding a New API Hook

1. Create hook file in `src/hooks/useMyFeature.ts`
2. Define return type interface
3. Implement fetch logic with error handling
4. Handle loading states
5. Return data, loading, error, and refetch function
6. Use hook in page components

### Updating Types

When backend models change:
1. Update TypeScript interfaces in `src/types/`
2. Ensure interfaces match backend Pydantic models exactly
3. Update any components using the changed types
4. Test that data displays correctly

### Styling a Component

1. Create CSS file or use inline styles
2. Use CSS variables for colors/spacing (defined in `index.css`)
3. Add responsive breakpoints if needed
4. Test on different screen sizes
5. Ensure accessibility (color contrast, focus states)

## Development Workflow

### Starting Development

```bash
# Terminal 1: Start backend
cd /path/to/project
uv run uvicorn farm_village_sim.api.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Backend runs on `http://localhost:8000`
Frontend runs on `http://localhost:5173`

### Testing Features

1. Use browser DevTools for debugging
2. Check Network tab for API requests
3. Check Console for errors/logs
4. Use React DevTools extension for component inspection

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Output in frontend/dist/
# Serve with any static file server
```

## Troubleshooting

### Backend Connection Issues

- Ensure backend is running on `http://localhost:8000`
- Check CORS configuration in backend (`main.py`)
- Verify API endpoints match frontend URLs
- Check browser console for network errors

### Type Errors

- Ensure TypeScript interfaces match backend models
- Check that API responses match expected types
- Use type assertions only when necessary (`as Type`)
- Enable strict mode for better type checking

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check for TypeScript errors: Look at build output
- Verify all imports are correct

### Styling Issues

- Check CSS specificity conflicts
- Verify CSS variables are defined
- Use browser DevTools to inspect computed styles
- Test on different browsers

## Related Documentation

- Backend documentation: See `/CLAUDE.md` (root of repository)
- Main project README: See `/README.md`
- React documentation: https://react.dev
- TypeScript documentation: https://www.typescriptlang.org
- Vite documentation: https://vitejs.dev
