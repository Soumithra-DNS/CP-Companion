import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  background: "#F3E2D4",
  primary: "#17313E",
  secondary: "#415E72",
  accent1: "#C5B0CD",
  accent2: "#E8D1C5",
  white: "#FFFFFF",
  live: "#4CAF50",
  upcoming: "#FF9800",
  past: "#9E9E9E",
  cardBg: "rgba(255,255,255,0.9)",
  sectionCardBg: "rgba(255,255,255,0.6)",
  shadow: "rgba(23,49,62,0.12)",
};

type PlatformKey = "codeforces" | "codechef" | "leetcode";

interface PlatformData {
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  platformName: string;
  api: string;
  query?: string;
  enabled: boolean;
  gradient: [string, string];
}

interface Contest {
  id: string;
  platform: PlatformKey;
  name: string;
  startTime: Date;
  endTime: Date;
  url: string;
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  platformName: string;
  gradient: [string, string];
}

type ContestStatus = "upcoming" | "live" | "completed";

const PLATFORM_DATA: Record<PlatformKey, PlatformData> = {
  codeforces: {
    color: "#FF5722",
    icon: "code",
    platformName: "Codeforces",
    api: "https://codeforces.com/api/contest.list",
    enabled: true,
    gradient: ["#FF5722", "#E64A19"],
  },
  codechef: {
    color: "#4CAF50",
    icon: "restaurant",
    platformName: "CodeChef",
    api: "https://www.codechef.com/api/list/contests/all",
    enabled: true,
    gradient: ["#4CAF50", "#388E3C"],
  },
  leetcode: {
    color: "#FFA500",
    icon: "code",
    platformName: "LeetCode",
    api: "https://leetcode.com/graphql",
    query: `{
      allContests {
        title
        titleSlug
        startTime
        duration
      }
    }`,
    enabled: false, // disabled by default to avoid GraphQL setup
    gradient: ["#FFA500", "#F57C00"],
  },
};

export default function ContestTimeScreen(): React.JSX.Element {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.98))[0];

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const fetchContests = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const results = await Promise.all(
        Object.entries(PLATFORM_DATA)
          .filter(([, d]) => d.enabled)
          .map(async ([key, data]) => {
            try {
              if (key === "codeforces") {
                const resp = await axios.get(data.api);
                if (resp.data.status !== "OK") return [];
                return resp.data.result
                  .filter((c: any) => c.phase === "BEFORE" || c.phase === "CODING")
                  .map((c: any) => ({
                    id: `codeforces-${c.id}`,
                    platform: "codeforces" as const,
                    name: c.name,
                    startTime: new Date(c.startTimeSeconds * 1000),
                    endTime: new Date((c.startTimeSeconds + c.durationSeconds) * 1000),
                    url: `https://codeforces.com/contests/${c.id}`,
                    color: data.color,
                    icon: data.icon,
                    platformName: data.platformName,
                    gradient: data.gradient,
                  }));
              }
              if (key === "codechef") {
                const resp = await axios.get(data.api);
                const arr: Contest[] = [];
                const pushIf = (list: any[]) =>
                  list?.forEach((c: any) =>
                    arr.push({
                      id: `codechef-${c.contest_code}-${Math.random()}`,
                      platform: "codechef" as const,
                      name: c.contest_name,
                      startTime: new Date(c.contest_start_date),
                      endTime: new Date(c.contest_end_date),
                      url: `https://www.codechef.com/${c.contest_code}`,
                      color: data.color,
                      icon: data.icon,
                      platformName: data.platformName,
                      gradient: data.gradient,
                    })
                  );
                pushIf(resp.data.present_contests);
                pushIf(resp.data.future_contests);
                return arr;
              }
              // leetcode disabled for safety
              return [];
            } catch (e) {
              console.error("platform fetch error", e);
              return [];
            }
          })
      );
      const merged = results.flat().sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      setContests(merged);
    } catch (e) {
      setError("Failed to fetch contests");
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const formatDate = useCallback((d: Date) => d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }), []);

  const calculateTimeRemaining = useCallback((t: Date) => {
    const diff = t.getTime() - Date.now();
    if (diff <= 0) return "00:00:00";
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, []);

  const getStatus = useCallback((s: Date, e: Date): ContestStatus => {
    const now = Date.now();
    if (now < s.getTime()) return "upcoming";
    if (now >= s.getTime() && now <= e.getTime()) return "live";
    return "completed";
  }, []);

  const openContest = useCallback((url: string) => Linking.openURL(url).catch((e) => console.error(e)), []);

  const { liveContests, upcomingContests, pastContests } = useMemo(() => {
    const now = Date.now();
    const live: Contest[] = [];
    const upcoming: Contest[] = [];
    const past: Contest[] = [];
    contests.forEach((c) => {
      if (c.startTime.getTime() > now) upcoming.push(c);
      else if (c.endTime.getTime() > now) live.push(c);
      else past.push(c);
    });
    return { liveContests: live, upcomingContests: upcoming, pastContests: past.slice(-10).reverse() };
  }, [contests]);

  const renderContestCard = (contest: Contest, idx: number) => {
    const status = getStatus(contest.startTime, contest.endTime);
    const isLive = status === "live";
    const isUpcoming = status === "upcoming";
    return (
      <Animated.View key={contest.id} style={[styles.contestCard, idx !== 0 && { marginTop: 12 }, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity onPress={() => openContest(contest.url)} activeOpacity={0.85}>
          <LinearGradient colors={contest.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardGradient}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.platformInfo}>
                  <View style={styles.platformIconContainer}>
                    <MaterialIcons name={contest.icon} size={16} color={COLORS.white} />
                  </View>
                  <Text style={styles.platform}>{contest.platformName}</Text>
                </View>
                <View style={[styles.statusBadge, isLive && { backgroundColor: COLORS.live }, isUpcoming && { backgroundColor: COLORS.upcoming }]}>
                  <Text style={styles.statusText}>{isLive ? "LIVE" : isUpcoming ? "UPCOMING" : "COMPLETED"}</Text>
                </View>
              </View>

              <Text style={styles.contestName} numberOfLines={2}>
                {contest.name}
              </Text>

              <View style={styles.timeInfoContainer}>
                <View style={styles.timeRow}>
                  <MaterialIcons name="calendar-today" size={14} color={COLORS.primary} />
                  <Text style={styles.timeText}>{formatDate(contest.startTime)}</Text>
                </View>
                <View style={styles.timeRow}>
                  <MaterialIcons name="timer" size={14} color={COLORS.primary} />
                  <Text style={styles.timeText}>
                    {isLive ? "Ends: " : "Starts: "}
                    {calculateTimeRemaining(isLive ? contest.endTime : contest.startTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.durationContainer}>
                  <MaterialIcons name="hourglass-bottom" size={14} color={COLORS.primary} />
                  <Text style={styles.durationText}>{Math.max(0, Math.round((contest.endTime.getTime() - contest.startTime.getTime()) / (1000 * 60))) + "m"}</Text>
                </View>
                <View style={styles.launchButton}>
                  <MaterialIcons name="launch" size={16} color={contest.color} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.page, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading contests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Fixed header (matches resources design) */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>
            Contest{" "}
            <Text style={styles.pageTitleAccent}>Schedule</Text>
          </Text>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchContests} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error" size={18} color={COLORS.white} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Live Contests</Text>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountText}>{liveContests.length}</Text>
            </View>
          </View>
          <View style={styles.sectionBody}>{liveContests.length ? liveContests.map(renderContestCard) : <Text style={styles.emptyText}>No live contests</Text>}</View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Upcoming Contests</Text>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountText}>{upcomingContests.length}</Text>
            </View>
          </View>
          <View style={styles.sectionBody}>{upcomingContests.length ? upcomingContests.map(renderContestCard) : <Text style={styles.emptyText}>No upcoming contests</Text>}</View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Past Contests</Text>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountText}>{pastContests.length}</Text>
            </View>
          </View>
          <View style={styles.sectionBody}>{pastContests.length ? pastContests.map(renderContestCard) : <Text style={styles.emptyText}>No past contests</Text>}</View>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.primary,
    fontSize: 14,
  },
  header: {
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 6 : 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
    textAlign: "center",
  },
  pageTitleAccent: {
    color: COLORS.secondary,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  errorBanner: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.white,
    marginLeft: 8,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    flex: 1,
  },
  sectionCountBadge: {
    backgroundColor: "rgba(23,49,62,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionCountText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionBody: {
    backgroundColor: COLORS.sectionCardBg,
    borderRadius: 14,
    padding: 12,
  },
  emptyText: {
    color: COLORS.secondary,
    padding: 16,
    textAlign: "center",
  },
  contestCard: {
    borderRadius: 14,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 14,
    padding: 1.5,
  },
  cardContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  platformInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  platformIconContainer: {
    backgroundColor: "rgba(0,0,0,0.12)",
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  platform: {
    fontWeight: "700",
    fontSize: 12,
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.past,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 10,
  },
  contestName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
  },
  timeInfoContainer: {
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  timeText: {
    color: COLORS.primary,
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    marginLeft: 6,
    color: COLORS.primary,
  },
  launchButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 6,
    borderRadius: 18,
  },
});