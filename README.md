# CP Companion

Track and grow your competitive programming journey across platforms with a clean, animated, and consistent mobile experience.

[![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Overview

CP Companion is an Expo + React Native app that unifies your coding profiles and learning progress. It features elegant visuals, smooth animations, and simple inputs to connect Codeforces, LeetCode, GitHub, AtCoder, and HackerRank in one place.

---

## Features

- Unified Profiles (consistent layout and colors)
  - Codeforces: rating, rank, contribution, friends, recent submissions
  - LeetCode: total solved, difficulty breakdown, acceptance rate, ranking
  - GitHub: name/bio, public repos, followers/following
  - AtCoder: rating, max rating, rank, basic profile info (mock for now)
  - HackerRank: level, followers, submissions, badges (mock for now)
- Learning Journey
  - Animated circular progress for mastered topics
  - Quick stats and motivational tips
- Clean UI/UX
  - Consistent palette, accessible contrast, and subtle elevation
  - Reusable components (headers, stat tiles, inputs, modals)
- Local Persistence
  - Handles cached with AsyncStorage; auto-restores on app open
- Smooth Animations
  - React Native Animated + react-native-svg progress ring

---

## Tech Stack

- Expo (React Native, TypeScript)
- Expo Router
- react-native-svg
- @expo/vector-icons (MaterialIcons, FontAwesome5)
- @react-native-async-storage/async-storage
- Fetch-based API integration

APIs used:
- Codeforces API (user.info, user.status)
- LeetCode community stats API (unofficial)
- GitHub REST API v3
- AtCoder and HackerRank currently mocked (no simple public APIs)

---

## Getting Started

Prerequisites:
- Node.js LTS
- npm or yarn
- Expo CLI (npx works fine)

Install and run:
```bash
npm install
npx expo start
```

Open the app:
- Press a to open Android emulator
- Press i to open iOS simulator (macOS)
- Press w for web
- Or scan the QR in Expo Go

Builds (optional):
```bash
# Android / iOS with EAS
npx eas build --platform android
npx eas build --platform ios
```

---

## Usage

- Open Profiles tab
- Enter your handles:
  - Codeforces handle (e.g., tourist)
  - LeetCode username
  - GitHub username
  - AtCoder username (uses mock data)
  - HackerRank username (uses mock data)
- Tap Connect to fetch and persist
- Tap header to open the platform profile in browser
- Use Disconnect to clear saved IDs

Learning Journey:
- Tracks number of mastered topics (0–15) and animates a progress ring

---

## Project Structure (simplified)

```
CP_Companion/
├─ app/
│  ├─ _layout.tsx
│  ├─ index.tsx
│  ├─ progress.tsx        # Profiles + Learning Journey
│  └─ ...other screens
├─ assets/                # (optional) images, fonts
├─ package.json
└─ README.md
```

Key file: app/progress.tsx
- Modular sections per platform (header, stats, inputs, modals)
- Animated progress ring (Svg + Animated)
- AsyncStorage for persisted handles
- Network calls with basic error handling and loading states

---

## Notes and Limitations

- LeetCode stats rely on an unofficial community API and may be rate-limited.
- AtCoder and HackerRank show placeholder/mock data.
- Network errors are handled gracefully with short messages.

---

## Roadmap

- Real AtCoder/HackerRank integrations
- Contest calendar and reminders
- Offline-first caches for stats
- Theming and dark mode
- Deeper analytics and streaks

---

## Contributing

- Fork the repo
- Create a branch: git checkout -b feat/your-feature
- Commit: git commit -m "feat: add your feature"
- Push: git push origin feat/your-feature
- Open a Pull Request

---

## License

Specify your license here (e.g., MIT). Add a LICENSE file if not present.

---

## Acknowledgments

- Codeforces, LeetCode community, GitHub APIs
- Expo and React Native community
