# My GitHub Workday

A single-pane-of-glass dashboard that cuts through the noise of GitHub notifications. It tells you exactly what needs your attention *right now*, what you're waiting on, and what you've recently been involved in, so you can start your day focused and productive.

## 🎯 Core Principles

1. **Action-Oriented:** The primary goal is to surface items that require an action from *you*.
2. **Signal over Noise:** Aggregate information from across all your repositories, but present it in a prioritized, de-duplicated way.
3. **Reduce Mental Overhead:** No more manually checking 10 different PRs to see their status. The dashboard does it for you.
4. **Personalized Context:** The dashboard is *your* view, reflecting your direct work and recent interactions.

## ✨ Features

### 📥 Triage Widget: What Needs My Immediate Attention?
- **Smart Review Assignment Grouping:** PRs organized by how they're assigned to you:
  - **🎯 Directly Assigned** - PRs specifically assigned to you (highlighted with high priority styling)
  - **👥 Team Assignments** - PRs assigned to your skill groups (e.g., skill-backend, skill-frontend)
  - **❓ No Assignment** - PRs that need review but lack clear assignment
- **Priority-Based Sorting:** Direct assignments appear first, then sorted by most recent activity
- Shows CI/CD status (passing checks, failing builds)
- Displays PR title, repository, author, and last updated time

### 🚀 In-Flight Widget: My Active Workstream
- **My Open Pull Requests:** All PRs you have authored, grouped by status:
  - `Draft`, `Awaiting Review`, `In Review`, `Approved`
- **Issues Assigned to Me:** Personal backlog of assigned issues not yet linked to PRs

### 👀 On My Radar Widget: Keeping Context *(Key Feature!)*
- **PRs I've Reviewed:** Lists PRs you have already approved or commented on
- **🔥 Highlights new commits since your last review** - this is a major pain point solver!
- **PRs I've Contributed To:** Shows PRs you've pushed commits to (collaborative work)
- **Threads I'm In:** PRs/Issues where you've participated in discussions

### 🎯 Focus for Today Widget
- Manually pin 1-5 important issues or PRs for your daily focus
- Stored in browser localStorage - your personal to-do list
- Add items via GitHub URL with auto-parsing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- A GitHub account

### Setup

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd github-workday-dashboard
   npm install
   ```

2. **For the demo version (easiest):**
   ```bash
   npm start
   ```
   - The app will prompt for a GitHub Personal Access Token
   - Go to [GitHub Settings > Personal access tokens](https://github.com/settings/tokens)
   - Generate a token with the following scopes:
     - `repo` - Access to repositories
     - `read:user` - Read user profile information
     - `read:org` - Read organization and team information (required for team review assignments)
     - `read:discussion` - Read discussions (required for advanced team features)
   - Paste it when prompted in the app

3. **For full OAuth setup (production):**
   - Go to [GitHub Settings > OAuth Apps](https://github.com/settings/applications/new)
   - Set **Authorization callback URL** to: `http://localhost:3000/callback`
   - Copy the Client ID
   - Create `.env` file: `cp .env.example .env`
   - Add your GitHub Client ID to `.env`

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with **TypeScript** - Modern, type-safe development
- **Material-UI (MUI)** - Professional, accessible component library
- **Apollo Client** - Efficient GraphQL state management with caching
- **date-fns** - Lightweight date formatting

### GitHub Integration
- **GitHub GraphQL API v4** - Single, efficient API calls instead of dozens of REST requests
- **OAuth 2.0 Authentication** - Secure, standard GitHub login flow
- **Comprehensive Data Fetching** - All dashboard data in one GraphQL query

### Key Technical Features
- **Auto-refresh every 5 minutes** - Stay up-to-date without manual refreshing
- **Intelligent PR status detection** - Draft, Awaiting Review, In Review, Approved, Changes Requested
- **New commits detection** - Highlights PRs with commits since your last review
- **Responsive design** - Works on desktop and mobile
- **Dark mode ready** - Theme toggle in navigation

## 🎨 UI/UX Highlights

- **Single-pane dashboard** - Everything visible at once, no navigation needed
- **Color-coded status indicators** - Immediate visual understanding
- **Smart sorting** - Items needing attention appear first
- **Click-to-open** - Direct links to GitHub for detailed actions
- **Contextual information** - Repository, authors, timestamps, CI status
- **Focus management** - Personal pinning system to avoid distraction

## 🛠️ Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

## 🔮 Future Enhancements

### Potential Extensions
- **Repository filtering** - Focus on specific repositories
- **Notification preferences** - Customize what appears in each widget
- **Time-based insights** - "You've been waiting on review for X days"
- **Team views** - See your team's workstream
- **Push notifications** - Browser notifications for urgent items
- **Slack/Teams integration** - Daily digest messages

---

**Built with ❤️ for developers who want to focus on what matters most.**
