# CP Companion

Unify your competitive programming journey across platforms with a clean, animated, and responsive experience (mobile + web).

<p align="center">
  <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white" alt="Expo" /></a>
  <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React%20Native-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React Native" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Notes & Limitations](#notes--limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

CP Companion is an Expo + React Native app that brings your profiles, contests and learning progress into one elegant view. The UI is responsive for both mobile and web: on desktop/web the main content is centered and constrained for better readability.

---

## Features

- Unified Profiles & Stats
  - Codeforces: rating, rank, contribution, recent submissions (verdicts normalized to AC / WA)
  - AtCoder: contest listing integration (uses kenkoooo aggregated feed)
  - LeetCode: optional (disabled by default)
  - GitHub: basic profile info (if configured)
- Contest Schedule
  - Aggregates contests from Codeforces and AtCoder
  - Validates incoming contest data and hides invalid entries
  - Sections: Live, Upcoming, Past
  - "See more" buttons for Live / Upcoming / Past to incrementally reveal items
  - Clean cards with gradient backgrounds and status badges
  - Web: scrollbar hidden and main container centered with max width for desktop
- Learning Journey
  - Animated progress & checklist for algorithm topics
  - Algorithm detail pages match Resources layout and are constrained on web
- UX & Accessibility
  - High-contrast palette, subtle elevation, consistent card styling
  - Local persistence via AsyncStorage for progress/ticks

---

## Tech Stack

- Expo (React Native, TypeScript)
- Expo Router (file-based navigation)
- react-native-svg
- @expo/vector-icons
- @react-native-async-storage/async-storage
- axios for network requests

APIs used:
- Codeforces API (contest list + user submissions)
- AtCoder contests feed (kenkoooo.com aggregated contests.json)
- LeetCode GraphQL (optional / disabled by default)

---

## Getting Started

Prerequisites:
- Node.js LTS
- npm or yarn
- Expo CLI (npx expo start works)

Install and run:
```bash
npm install
npx expo start
```

Open the app:
- Press `a` for Android emulator
- Press `i` for iOS simulator (macOS)
- Press `w` for web
- Or scan the QR with Expo Go

---

## Usage

- Profiles:
  - Enter platform handles and connect (persisted locally).
  - Submissions verdicts are normalized (OK/AC -> AC, WRONG_* -> WA).
- Contests:
  - Open the Contests tab to see Live / Upcoming / Past sections.
  - Use "See more" to reveal more items.
  - Invalid contest entries (bad/missing timestamps or URL) are filtered out.
- Learning / Resources:
  - Algorithm Resources and Algorithm Detail pages share the same centered, card-based layout on web and mobile.

---

## Project Structure

```
CP_Companion/
├─ app/
│  ├─ progress.tsx        # Profiles + Learning Journey
│  ├─ resources.tsx       # Algorithm resources (responsive)
│  ├─ algorithmDetail.tsx # Topic details (responsive)
│  ├─ contestTime.tsx     # Contest schedule (Codeforces + AtCoder)
│  └─ ...other screens
├─ assets/
├─ package.json
└─ README.md
```

---

## Notes & Limitations

- LeetCode integration is optional and may be disabled by default.
- AtCoder uses a community-aggregated feed (kenkoooo) as a reliable source.
- Browser (web) requests are subject to CORS — some remote APIs may not be reachable from the browser.
- The back button was removed from the algorithm detail header for a simplified layout (use navigation history).

---

## Roadmap

- Add deeper AtCoder profile integration
- Improve LeetCode reliability (rate limiting handling)
- Add user settings and theming (dark mode)
- Offline caching and background updates

---

## Contributing

- Fork → branch → commit → PR
- Follow code style and include brief tests where applicable

---

## License

Add your license (e.g., MIT) and include a LICENSE file.

---

## Acknowledgments

- Codeforces, AtCoder community feeds, LeetCode community
- Expo and React Native community
