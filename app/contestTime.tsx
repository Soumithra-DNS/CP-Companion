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
    color: "#7A3E00",
    icon: "restaurant",
    platformName: "CodeChef",
    api: "https://www.codechef.com/api/list/contests/all",
    enabled: true,
    gradient: ["#7A3E00", "#5A2E00"],
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
    enabled: true,
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

  // State for "Show More" functionality
  const [visibleLiveCount, setVisibleLiveCount] = useState(10);
  const [visibleUpcomingCount, setVisibleUpcomingCount] = useState(10);
  const [visiblePastCount, setVisiblePastCount] = useState(10);

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

  /* helper: validate contest object before adding to list */
  const isValidContest = (c: Partial<Contest> | any): c is Contest => {
    if (!c) return false;
    if (!c.name || typeof c.name !== "string") return false;
    if (!c.url || typeof c.url !== "string") return false;

    const s = c.startTime instanceof Date ? c.startTime : new Date(c.startTime);
    const e = c.endTime instanceof Date ? c.endTime : new Date(c.endTime);
    if (!(s instanceof Date) || isNaN(s.getTime())) return false;
    if (!(e instanceof Date) || isNaN(e.getTime())) return false;
    // end must be >= start (basic sanity)
    if (e.getTime() < s.getTime()) return false;

    return true;
  };

  const fetchContests = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        Object.entries(PLATFORM_DATA)
          .filter(([, d]) => d.enabled)
          .map(async ([key, data]) => {
            try {
              if (key === "codeforces") {
                const resp = await axios.get(data.api);
                if (resp.data.status !== "OK" || !Array.isArray(resp.data.result)) return [];
                return resp.data.result
                  .map((c: any) => {
                    const start = Number(c.startTimeSeconds);
                    const dur = Number(c.durationSeconds);
                    const contest: Partial<Contest> = {
                      id: `codeforces-${c.id}`,
                      platform: "codeforces",
                      name: c.name,
                      startTime: isFinite(start) ? new Date(start * 1000) : undefined,
                      endTime: isFinite(start) && isFinite(dur) ? new Date((start + dur) * 1000) : undefined,
                      url: c.id ? `https://codeforces.com/contests/${c.id}` : undefined,
                      color: data.color,
                      icon: data.icon,
                      platformName: data.platformName,
                      gradient: data.gradient,
                    };
                    return isValidContest(contest) ? (contest as Contest) : null;
                  })
                  .filter(Boolean) as Contest[];
              }

              if (key === "codechef") {
                const resp = await axios.get(data.api);
                const payload = resp.data;
                
                // CodeChef API returns present_contests and future_contests
                const presentContests = Array.isArray(payload.present_contests) ? payload.present_contests : [];
                const futureContests = Array.isArray(payload.future_contests) ? payload.future_contests : [];
                const allContests = [...presentContests, ...futureContests];

                if (!Array.isArray(allContests) || allContests.length === 0) return [];

                return allContests
                  .map((c: any) => {
                    const contestCode = c.contest_code;
                    const contestName = c.contest_name;
                    const startTimeStr = c.contest_start_date_iso;
                    const endTimeStr = c.contest_end_date_iso;

                    const contest: Partial<Contest> = {
                      id: `codechef-${contestCode}`,
                      platform: "codechef",
                      name: contestName,
                      startTime: startTimeStr ? new Date(startTimeStr) : undefined,
                      endTime: endTimeStr ? new Date(endTimeStr) : undefined,
                      url: contestCode ? `https://www.codechef.com/${contestCode}` : "https://www.codechef.com/contests",
                      color: data.color,
                      icon: data.icon,
                      platformName: data.platformName,
                      gradient: data.gradient,
                    };

                    return isValidContest(contest) ? (contest as Contest) : null;
                  })
                  .filter(Boolean) as Contest[];
              }

              if (key === "leetcode") {
                try {
                  const resp = await axios.post(data.api, { query: data.query }, { headers: { "Content-Type": "application/json" } });
                  if (resp.data.data?.allContests) {
                    return resp.data.data.allContests
                      .map((c: any) => {
                        const start = Number(c.startTime);
                        const dur = Number(c.duration);
                        const contest: Partial<Contest> = {
                          id: c.titleSlug ? `leetcode-${c.titleSlug}-${Date.now()}` : `leetcode-${Math.random()}`,
                          platform: "leetcode",
                          name: c.title,
                          startTime: isFinite(start) ? new Date(start * 1000) : undefined,
                          endTime: isFinite(start) && isFinite(dur) ? new Date((start + dur) * 1000) : undefined,
                          url: c.titleSlug ? `https://leetcode.com/contest/${c.titleSlug}` : undefined,
                          color: data.color,
                          icon: data.icon,
                          platformName: data.platformName,
                          gradient: data.gradient,
                        };
                        return isValidContest(contest) ? (contest as Contest) : null;
                      })
                      .filter(Boolean) as Contest[];
                  }
                } catch (leetcodeError) {
                  // ignore leetcode failures silently
                }
                return [];
              }

              return [];
            } catch (e) {
              console.error(`Platform ${key} fetch error:`, e);
              return [];
            }
          })
      );

      const successfulResults = results
        .filter((r): r is PromiseFulfilledResult<Contest[]> => r.status === "fulfilled")
        .map(r => r.value)
        .flat();

      // dedupe by url + name + startTime
      const seen = new Map<string, Contest>();
      successfulResults.forEach((c) => {
        if (!isValidContest(c)) return;
        const key = `${c.url}::${c.name}::${c.startTime.getTime()}`;
        if (!seen.has(key)) seen.set(key, c);
      });

      const merged = Array.from(seen.values()).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      setContests(merged);
    } catch (e) {
      setError("Failed to fetch contests");
      console.error("Overall fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const formatDate = useCallback((d: Date) => 
    d.toLocaleString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: true 
    }), []);

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

  const openContest = useCallback((url: string) => 
    Linking.openURL(url).catch((e) => console.error("Failed to open URL:", e)), []);

  const { liveContests, upcomingContests, pastContests } = useMemo(() => {
    const live: Contest[] = [];
    const upcoming: Contest[] = [];
    const past: Contest[] = [];

    // Use centralized getStatus so classification matches UI badges/timers
    contests.forEach((c) => {
      const status = getStatus(c.startTime, c.endTime);
      if (status === "live") live.push(c);
      else if (status === "upcoming") upcoming.push(c);
      else past.push(c);
    });

    return {
      liveContests: live,
      upcomingContests: upcoming,
      pastContests: past.reverse(),
    };
  }, [contests]);

  // Reset visible counts when contests change
  useEffect(() => {
    setVisibleLiveCount(10);
    setVisibleUpcomingCount(10);
    setVisiblePastCount(10);
  }, [contests]);

  // Show more functionality
  const showMoreLive = useCallback(() => {
    setVisibleLiveCount(prev => prev + 5);
  }, []);

  const showMoreUpcoming = useCallback(() => {
    setVisibleUpcomingCount(prev => prev + 5);
  }, []);

  const showMorePast = useCallback(() => {
    setVisiblePastCount(prev => prev + 5);
  }, []);

  const renderContestCard = (contest: Contest, idx: number) => {
    const status = getStatus(contest.startTime, contest.endTime);
    const isLive = status === "live";
    const isUpcoming = status === "upcoming";
    
    return (
      <Animated.View 
        key={contest.id} 
        style={[
          styles.contestCard, 
          idx !== 0 && { marginTop: 12 }, 
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <TouchableOpacity 
          onPress={() => openContest(contest.url)} 
          activeOpacity={0.85}
        >
          <LinearGradient 
            colors={contest.gradient} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }} 
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.platformInfo}>
                  <View style={styles.platformIconContainer}>
                    <MaterialIcons name={contest.icon} size={16} color={COLORS.white} />
                  </View>
                  <Text style={styles.platform}>{contest.platformName}</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  isLive && { backgroundColor: COLORS.live }, 
                  isUpcoming && { backgroundColor: COLORS.upcoming }
                ]}>
                  <Text style={styles.statusText}>
                    {isLive ? "LIVE" : isUpcoming ? "UPCOMING" : "COMPLETED"}
                  </Text>
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
                  <Text style={styles.durationText}>
                    {Math.max(0, Math.round((contest.endTime.getTime() - contest.startTime.getTime()) / (1000 * 60))) + "m"}
                  </Text>
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

  const renderShowMoreButton = (onPress: () => void, show: boolean) => {
    if (!show) return null;
    
    return (
      <TouchableOpacity onPress={onPress} style={styles.showMoreButton}>
        <Text style={styles.showMoreText}>Show More</Text>
        <MaterialIcons name="expand-more" size={16} color={COLORS.primary} />
      </TouchableOpacity>
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

  const visibleLive = liveContests.slice(0, visibleLiveCount);
  const visibleUpcoming = upcomingContests.slice(0, visibleUpcomingCount);
  const visiblePast = pastContests.slice(0, visiblePastCount);

  const hasMoreLive = liveContests.length > visibleLiveCount;
  const hasMoreUpcoming = upcomingContests.length > visibleUpcomingCount;
  const hasMorePast = pastContests.length > visiblePastCount;

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={[styles.container, Platform.OS === "web" && styles.webContainer]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>
              Contest <Text style={styles.pageTitleAccent}>Schedule</Text>
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={[
            styles.content,
            Platform.OS === "web" ? ({ 
              scrollbarWidth: "none", 
              msOverflowStyle: "none" 
            } as any) : {},
          ]}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={fetchContests} 
              tintColor={COLORS.primary} 
              colors={[COLORS.primary]} 
            />
          }
        >
          {error ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error" size={18} color={COLORS.white} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Live Contests Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Live Contests</Text>
              <View style={styles.sectionCountBadge}>
                <Text style={styles.sectionCountText}>{liveContests.length}</Text>
              </View>
            </View>
            <View style={styles.sectionBody}>
              {visibleLive.length ? 
                visibleLive.map(renderContestCard) : 
                <Text style={styles.emptyText}>No live contests</Text>
              }
              {renderShowMoreButton(showMoreLive, hasMoreLive)}
            </View>
          </View>

          {/* Upcoming Contests Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Upcoming Contests</Text>
              <View style={styles.sectionCountBadge}>
                <Text style={styles.sectionCountText}>{upcomingContests.length}</Text>
              </View>
            </View>
            <View style={styles.sectionBody}>
              {visibleUpcoming.length ? 
                visibleUpcoming.map(renderContestCard) : 
                <Text style={styles.emptyText}>No upcoming contests</Text>
              }
              {renderShowMoreButton(showMoreUpcoming, hasMoreUpcoming)}
            </View>
          </View>

          {/* Past Contests Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Past Contests</Text>
              <View style={styles.sectionCountBadge}>
                <Text style={styles.sectionCountText}>{pastContests.length}</Text>
              </View>
            </View>
            <View style={styles.sectionBody}>
              {visiblePast.length ? 
                visiblePast.map(renderContestCard) : 
                <Text style={styles.emptyText}>No past contests</Text>
              }
              {renderShowMoreButton(showMorePast, hasMorePast)}
            </View>
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    // COMMENT: কন্টেইনারের উপরের প্যাডিং কমানো হলো যাতে স্ক্রল সেকশন উপরে ওঠে।
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 20) : 0, 
    paddingHorizontal: ,
  },
  webContainer: {
    alignSelf: "center",
    width: "80%",
    maxWidth: 920,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.primary,
    fontSize: 14,
  },
  header: {
    // COMMENT: হেডার সেকশনের প্যাডিং এবং টপ মার্জিন কমানো হলো যাতে টাইটেল সেকশন ছোট হয় এবং উপরে উঠে যায়।
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 12) + 1 : 12, 
    paddingHorizontal: 0,
    paddingBottom: 0,
    alignItems: "center",
    top: -25, // আরও উপরে তোলার জন্য কমানো হয়েছে। আগের মান ছিল -40
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
    paddingHorizontal: 14,
  },
  scrollContent: {
    // COMMENT: স্ক্রল কন্টেন্টের উপরের প্যাডিং কমানো হলো যাতে কন্টেন্ট উপরে শুরু হয়।
    paddingTop: 10, 
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
    fontSize: 14,
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
    fontSize: 14,
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
    fontSize: 13,
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
    fontSize: 13,
  },
  launchButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 6,
    borderRadius: 18,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    backgroundColor: 'rgba(23,49,62,0.08)',
    borderRadius: 8,
  },
  showMoreText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});