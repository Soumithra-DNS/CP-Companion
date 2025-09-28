# CP Companion

Unify your competitive programming journey across platforms with a clean, animated, and consistent mobile experience.

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

CP Companion is an Expo + React Native app that brings your coding profiles and learning progress into one elegant view. It includes smooth animations, accessible colors, and simple inputs to connect Codeforces, LeetCode, GitHub, AtCoder, and HackerRank.

---

## Features

- Unified Profiles (consistent layout and colors)
  - Codeforces: rating, rank, contribution, friends, recent submissions
  - LeetCode: total solved, difficulty breakdown, acceptance rate, ranking
  - GitHub: name/bio, public repos, followers/following
  - AtCoder: rating, max rating, rank, basic info (mock for now)
  - HackerRank: level, followers, submissions, badges (mock for now)
- Learning Journey
  - Animated circular progress (0–15 topics)
  - Quick stats and concise encouragement
- Clean UI/UX
  - High-contrast palette, subtle elevation, reusable components
- Local Persistence
  - Handles cached with AsyncStorage and auto-restored
- Smooth Animations
  - Animated + SVG progress ring, subtle section transitions

---

## Tech Stack

- Expo (React Native, TypeScript)
- Expo Router (file-based navigation)
- react-native-svg
- @expo/vector-icons (MaterialIcons, FontAwesome5)
- @react-native-async-storage/async-storage
- Fetch-based API integration

APIs used:
- Codeforces API (user.info, user.status)
- LeetCode community stats API (unofficial)
- GitHub REST API v3
- AtCoder & HackerRank currently mocked (no simple public APIs)

---

## Getting Started

Prerequisites:
- Node.js LTS
- npm or yarn
- Expo (npx works fine)

Install and run:
```bash
npm install
npx expo start
```

Open the app:
- Press a for Android emulator
- Press i for iOS simulator (macOS)
- Press w for web
- Or scan the QR with Expo Go

Optional builds:
```bash
# EAS
npx eas build --platform android
npx eas build --platform ios
```

---

## Usage

Profiles:
- Open the Profiles tab
- Enter:
  - Codeforces handle (e.g., tourist)
  - LeetCode username
  - GitHub username
  - AtCoder username (mock)
  - HackerRank username (mock)
- Tap Connect to fetch and persist
- Tap the header to open the platform profile in the browser
- Use Disconnect to clear saved IDs

Learning Journey:
- Tracks mastered topics (0–15) with an animated circular progress ring

---

## Project Structure

```
CP_Companion/
├─ app/
│  ├─ progress.tsx        # Profiles + Learning Journey (core screen)
│  └─ ...other screens
├─ assets/                # (optional) images, fonts
├─ package.json
└─ README.md
```

Highlights in app/progress.tsx:
- Modular sections per platform (header, stats, inputs, modals)
- Animated progress ring (Svg + Animated)
- AsyncStorage for persisted handles
- Loading states and concise error messages

---

## Notes & Limitations

- LeetCode stats rely on an unofficial community API (may be rate-limited).
- AtCoder and HackerRank sections use placeholder/mock data.
- Network errors are handled with short, clear messages.

---

## Roadmap

- Real AtCoder/HackerRank integrations
- Contest calendar and reminders
- Offline caches for stats
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

Add your license (e.g., MIT) and include a LICENSE file.

---

## Acknowledgments

- Codeforces, LeetCode community, GitHub APIs
- Expo and React Native community
