# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lofiles-dashboard** is a GitHub notification management dashboard built with React + TypeScript. It provides an action-oriented, single-pane-of-glass view of GitHub PRs and issues that require attention, reducing the noise of GitHub notifications.

The app features a lo-fi aesthetic with a dark purple theme (#21094E background, #511281 paper), pixel art styling, and integrated lofi music player.

## Development Commands

### Local Development
```bash
npm install          # Install dependencies
npm start           # Start development server (port 3000)
npm test            # Run tests in watch mode
npm run build       # Production build
npx tsc --noEmit    # Type checking only
```

### Docker Development
```bash
docker compose up -d              # Run in background on port 3003
docker compose up -d --build      # Rebuild and run
docker compose logs -f            # View logs
docker compose down               # Stop container
APP_PORT=4000 docker compose up -d  # Custom port
```

### Deployment
```bash
npm run deploy      # Deploy to GitHub Pages (gh-pages branch)
```

The app auto-deploys to GitHub Pages via `.github/workflows/gh-pages.yml` on pushes to master.

## Architecture

### Authentication Flow
- **Primary method**: GitHub Personal Access Token stored in `localStorage` under `github_token` and `github_user` keys
- Token can be provided via `.env` file (`REACT_APP_GITHUB_TOKEN`) for auto-login, or entered manually in the Login component
- OAuth flow exists but is secondary (requires GitHub OAuth app setup with `REACT_APP_GITHUB_CLIENT_ID`)
- Authentication state managed by `AuthContext` (src/context/AuthContext.tsx)

### Data Fetching Strategy
- **Apollo Client** with GraphQL queries to GitHub API v4 at `https://api.github.com/graphql`
- Single comprehensive query `GET_WORKDAY_DASHBOARD` fetches all dashboard data in one request
- Apollo caching with `cache-and-network` fetch policy for fresh data while showing cached results
- Auto-refresh every 5 minutes via `pollInterval: 300000`
- Main query located in `src/apollo/queries.ts`, returns 4 search result sets:
  - `prsToReview`: PRs awaiting user's review
  - `myOpenPRs`: User's open PRs
  - `involvedPRs`: PRs user has interacted with
  - `assignedIssues`: Issues assigned to user

### Component Structure

**App Flow**: `App.tsx` → `AuthProvider` → `FocusProvider` → Dashboard/Login

**Dashboard Layout** (src/components/Dashboard.tsx): 4-column grid
1. **Triage Widget**: PRs requiring review, grouped by direct assignment vs team assignment
2. **On Radar Widget**: PRs user has reviewed/commented on, highlights new commits since last review
3. **In-Flight Widget** (top) + **Focus Widget** (bottom): User's open PRs/issues + manually pinned items
4. **User Info Column**: Avatar, pixel art "Lo-files" title, arcade score display, "Who disturbs my peace" ranking, lofi player

**Widget Components** (src/components/widgets/):
- `TriageWidget.tsx`: Review queue with direct/team assignment grouping
- `OnRadarWidget.tsx`: Context tracking with tabs for reviewed/contributed/discussed PRs
- `InFlightWidget.tsx`: User's open work (PRs and assigned issues)
- `FocusWidget.tsx`: Manual focus list (max 5 items, stored in localStorage as `github_focus_items`)

**Context Providers**:
- `AuthContext`: User authentication and token management
- `FocusContext`: Focus list CRUD operations, parses GitHub URLs, validates format

### Styling & Theming
- Material-UI (MUI) v7 with custom dark theme in App.tsx
- Color palette: `#21094E` (bg), `#511281` (paper), `#4CA1A3` (teal accent), `#A5E1AD` (success green)
- Custom CSS keyframe animations for pixel art "Lo-files" title glitch effect
- "Press Start 2P" font for retro gaming aesthetic (loaded from Google Fonts or system fallback)

### State Management
- **Apollo Client cache** for GitHub data
- **React Context** for auth and focus state
- **localStorage** for persistence:
  - `github_token`: Auth token
  - `github_user`: Serialized user object
  - `github_focus_items`: Pinned focus items

## Key Implementation Details

### PR Status Determination
PR states are derived from GraphQL data:
- **Direct Assignment**: User in `reviewRequests.nodes` as User (not Team)
- **Team Assignment**: User belongs to team in `reviewRequests.nodes`
- **CI/CD Status**: From `commits.nodes[last].commit.statusCheckRollup.state`
- **Review State**: Latest review in `reviews.nodes` sorted by `submittedAt`
- **New Commits**: Compare `commits.nodes[last].commit.oid` with stored last-seen commit

### GitHub Search Queries
Queries use GitHub search syntax (src/apollo/queries.ts):
- `is:open is:pr review-requested:@me -author:@me`: Triage
- `is:open is:pr author:@me`: My open PRs
- `is:open is:pr involves:@me -author:@me`: Involved PRs
- `is:open is:issue assignee:@me`: Assigned issues

### Docker Multi-Stage Build
Dockerfile uses Node 18 Alpine for build stage, Nginx stable-alpine for runtime. Nginx config supports SPA routing (all routes → index.html). Build args support `REACT_APP_GITHUB_TOKEN` for baked-in authentication.

## Testing

Tests use React Testing Library + Jest. Test setup in `src/setupTests.ts`. Run `npm test` for watch mode.

## Required GitHub Token Scopes

When generating a Personal Access Token:
- `repo`: Access to repositories
- `read:user`: Read user profile
- `read:org`: Read organization and team information (for team review assignments)
- `read:discussion`: Read discussions (for advanced features)

## Common Development Tasks

### Adding a New Widget
1. Create component in `src/components/widgets/`
2. Add GraphQL query fragment to `src/apollo/queries.ts` if needed
3. Import and render in `Dashboard.tsx` with appropriate data from `GET_WORKDAY_DASHBOARD`
4. Match existing MUI theme styling and dark purple aesthetic

### Modifying PR/Issue Rendering
- Update TypeScript types in `src/types/github.ts`
- Modify GraphQL fragments in `src/apollo/queries.ts` to include new fields
- Update widget components to consume new data

### Changing Authentication
- Token storage logic in `AuthContext.tsx` (lines 51-52, 95-96, 102-103)
- Apollo auth header injection in `src/apollo/client.ts` (lines 9-20)
- Login UI in `src/components/Login.tsx`

## Security Considerations

Tokens are stored in browser localStorage, which is vulnerable to XSS attacks. The README warns users about this (line 195-202). For production hardening:
- Implement Content Security Policy (CSP)
- Consider using `sessionStorage` instead for non-persistent sessions
- Keep dependencies updated to avoid XSS vulnerabilities
