import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Linking, Dimensions, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Updated color palette from ColorHunt, aligned with HomeScreen's aesthetic
const COLORS = {
  primary: '#3A59D1',      // Vibrant blue, from HomeScreen
  secondary: '#3D90D7',    // Deep purple-blue, from HomeScreen
  accent1: '#7AC6D2',      // Light blue/cyan, from HomeScreen
  accent2: '#B5FCCD',      // Light green/cyan, from HomeScreen
  darkBg: '#0f172a',      // Dark navy background, from HomeScreen
  lightBg: 'rgba(255, 255, 255, 0.08)', // Card background, from HomeScreen
  white: '#FFFFFF',        // Pure white
  gray: 'rgba(255, 255, 255, 0.7)', // Translucent white for secondary text
  highlight: '#3DC2EC',    // Bright cyan (retained for progress bar)
  error: '#FF6B6B',        // Soft red
  success: '#4CAF50',      // Green
  live: '#FF6B6B',         // Red for live contests (retained)
  upcoming: '#3A59D1',     // Primary blue for upcoming (aligned with primary)
  past: '#7AC6D2',         // Accent color for past (aligned with accent1)
  sectionBg: '#1e293b',    // Section header background (darker shade from HomeScreen gradient)
};

type PlatformKey = 'codeforces' | 'codechef' | 'leetcode';

// Platform data with updated colors
const PLATFORM_DATA: Record<PlatformKey, {
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  platformName: string;
  api: string;
  query?: string;
  enabled: boolean;
}> = {
  codeforces: {
    color: '#FF5722',     // Keeping orange for Codeforces
    icon: 'code',
    platformName: 'Codeforces',
    api: 'https://codeforces.com/api/contest.list',
    enabled: true
  },
  codechef: {
    color: '#4CAF50',     // Green for CodeChef
    icon: 'restaurant',
    platformName: 'CodeChef',
    api: 'https://www.codechef.com/api/list/contests/all',
    enabled: true
  },
  leetcode: {
    color: '#FFA500',     // Keeping orange for LeetCode
    icon: 'code',
    platformName: 'LeetCode',
    api: 'https://leetcode.com/graphql',
    query: `{
      allContests {
        title
        titleSlug
        startTime
        duration
      }
    }`,
    enabled: true
  }
};

type Contest = {
  id: string;
  platform: PlatformKey;
  name: string;
  startTime: Date;
  endTime: Date;
  url: string;
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  platformName: string;
};

type ContestStatus = 'upcoming' | 'live' | 'completed';

const ContestTimeScreen = () => {
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContests = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const platformPromises = Object.entries(PLATFORM_DATA)
        .filter(([_, data]) => data.enabled)
        .map(async ([platformKey]) => {
          const key = platformKey as PlatformKey;
          try {
            switch (key) {
              case 'codeforces': return await fetchCodeforcesContests();
              case 'codechef': return await fetchCodechefContests();
              case 'leetcode': return await fetchLeetcodeContests();
              default: return [];
            }
          } catch (err) {
            console.error(`Error fetching ${key} contests:`, err);
            return [];
          }
        });

      const fetchedContests = await Promise.all(platformPromises);
      const allContests = fetchedContests.flat()
        .filter((contest): contest is Contest => contest !== null)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      setContests(allContests);
    } catch (err) {
      console.error('Global fetch error:', err);
      setError('Failed to fetch contests. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Platform-specific fetch functions remain the same
  const fetchCodeforcesContests = async (): Promise<Contest[]> => {
    try {
      const response = await axios.get(PLATFORM_DATA.codeforces.api);
      if (response.data.status !== 'OK') throw new Error('API returned non-OK status');
      
      return response.data.result
        .filter((contest: any) => contest.phase === 'BEFORE' || contest.phase === 'CODING')
        .map((contest: any) => ({
          id: `codeforces-${contest.id}`,
          platform: 'codeforces',
          name: contest.name,
          startTime: new Date(contest.startTimeSeconds * 1000),
          endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000),
          url: `https://codeforces.com/contests/${contest.id}`,
          color: PLATFORM_DATA.codeforces.color,
          icon: PLATFORM_DATA.codeforces.icon,
          platformName: PLATFORM_DATA.codeforces.platformName
        }));
    } catch (error) {
      console.error('Error fetching Codeforces contests:', error);
      return [];
    }
  };

  const fetchCodechefContests = async (): Promise<Contest[]> => {
    try {
      const response = await axios.get(PLATFORM_DATA.codechef.api);
      const contests: Contest[] = [];
      
      if (response.data.present_contests) {
        response.data.present_contests.forEach((contest: any) => {
          contests.push({
            id: `codechef-present-${contest.contest_code}`,
            platform: 'codechef',
            name: contest.contest_name,
            startTime: new Date(contest.contest_start_date),
            endTime: new Date(contest.contest_end_date),
            url: `https://www.codechef.com/${contest.contest_code}`,
            color: PLATFORM_DATA.codechef.color,
            icon: PLATFORM_DATA.codechef.icon,
            platformName: PLATFORM_DATA.codechef.platformName
          });
        });
      }
      
      if (response.data.future_contests) {
        response.data.future_contests.forEach((contest: any) => {
          contests.push({
            id: `codechef-future-${contest.contest_code}`,
            platform: 'codechef',
            name: contest.contest_name,
            startTime: new Date(contest.contest_start_date),
            endTime: new Date(contest.contest_end_date),
            url: `https://www.codechef.com/${contest.contest_code}`,
            color: PLATFORM_DATA.codechef.color,
            icon: PLATFORM_DATA.codechef.icon,
            platformName: PLATFORM_DATA.codechef.platformName
          });
        });
      }
      
      return contests;
    } catch (error) {
      console.error('Error fetching CodeChef contests:', error);
      return [];
    }
  };

  const fetchLeetcodeContests = async (): Promise<Contest[]> => {
    try {
      const response = await axios.post(PLATFORM_DATA.leetcode.api, {
        query: PLATFORM_DATA.leetcode.query
      });
      
      return response.data.data.allContests.map((contest: any) => ({
        id: `leetcode-${contest.titleSlug}`,
        platform: 'leetcode',
        name: contest.title,
        startTime: new Date(contest.startTime * 1000),
        endTime: new Date((contest.startTime + contest.duration) * 1000),
        url: `https://leetcode.com/contest/${contest.titleSlug}`,
        color: PLATFORM_DATA.leetcode.color,
        icon: PLATFORM_DATA.leetcode.icon,
        platformName: PLATFORM_DATA.leetcode.platformName
      }));
    } catch (error) {
      console.error('Error fetching LeetCode contests:', error);
      return [];
    }
  };

  // Process contests data with limits
  const { liveContests, upcomingContests, pastContests } = useMemo(() => {
    const now = new Date();
    const live: Contest[] = [];
    const upcoming: Contest[] = [];
    const past: Contest[] = [];

    contests.forEach(contest => {
      if (contest.startTime > now) {
        upcoming.push(contest);
      } else if (contest.endTime > now) {
        live.push(contest);
      } else {
        past.push(contest);
      }
    });

    return {
      liveContests: live.slice(0, 10),
      upcomingContests: upcoming.slice(0, 10),
      pastContests: past.slice(-10).reverse()
    };
  }, [contests]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  // Helper functions remain the same
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }, []);

  const calculateTimeRemaining = useCallback((targetTime: Date) => {
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();
    
    if (diff <= 0) return '00:00:00';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getContestStatus = useCallback((startTime: Date, endTime: Date): ContestStatus => {
    const now = new Date();
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'live';
    return 'completed';
  }, []);

  const openContest = useCallback((url: string) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  }, []);

  const getDurationString = useCallback((startTime: Date, endTime: Date) => {
    const durationHours = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
    if (durationHours < 1) {
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      return `${durationMinutes}m`;
    } else if (durationHours < 24) {
      return `${durationHours}h`;
    } else {
      const durationDays = Math.round(durationHours / 24);
      return `${durationDays}d`;
    }
  }, []);

  const renderContestCard = useCallback((contest: Contest) => {
    const status = getContestStatus(contest.startTime, contest.endTime);
    const isLive = status === 'live';
    const isUpcoming = status === 'upcoming';
    
    return (
      <TouchableOpacity 
        key={contest.id}
        style={[
          styles.contestCard,
          isLive && styles.liveCard,
          isUpcoming && styles.upcomingCard
        ]}
        onPress={() => openContest(contest.url)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isLive ? [COLORS.live, COLORS.error] : isUpcoming ? [COLORS.primary, COLORS.secondary] : [COLORS.accent1, COLORS.accent2]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.platformInfo}>
              <MaterialIcons name={contest.icon} size={20} color={COLORS.white} />
              <Text style={styles.platform}>{contest.platformName}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              isLive && styles.liveBadge,
              isUpcoming && styles.upcomingBadge
            ]}>
              <Text style={styles.statusText}>
                {isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'COMPLETED'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.contestName} numberOfLines={2}>{contest.name}</Text>
          
          <View style={styles.timeInfoContainer}>
            <View style={styles.timeRow}>
              <MaterialIcons name="calendar-today" size={14} color={COLORS.gray} />
              <Text style={styles.timeText}>{formatDate(contest.startTime)}</Text>
            </View>
            
            <View style={styles.timeRow}>
              <MaterialIcons name="timer" size={14} color={COLORS.gray} />
              <Text style={styles.timeText}>
                {isLive ? 'Ends: ' : 'Starts: '} 
                {calculateTimeRemaining(isLive ? contest.endTime : contest.startTime)}
              </Text>
            </View>
          </View>
          
          {isLive && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient 
                  colors={[contest.color, COLORS.highlight]}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={[
                    styles.progressBarFill,
                    { 
                      width: `${Math.min(
                        100, 
                        ((new Date().getTime() - contest.startTime.getTime()) / 
                        (contest.endTime.getTime() - contest.startTime.getTime())) * 100
                      )}%`
                    }
                  ]}
                />
              </View>
            </View>
          )}
          
          <View style={styles.cardFooter}>
            <View style={styles.durationContainer}>
              <MaterialIcons name="hourglass-bottom" size={14} color={COLORS.gray} />
              <Text style={styles.durationText}>
                {getDurationString(contest.startTime, contest.endTime)}
              </Text>
            </View>
            <MaterialIcons name="launch" size={16} color={COLORS.gray} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [getContestStatus, openContest, formatDate, calculateTimeRemaining, getDurationString]);

  const renderSectionHeader = (title: string, count: number, icon: string, color: string) => {
    return (
      <View style={styles.sectionHeaderContainer}>
        <LinearGradient
          colors={[color, COLORS.sectionBg]}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.sectionHeaderGradient}
        >
          <View style={styles.sectionHeaderContent}>
            <MaterialIcons name={icon as any} size={20} color={COLORS.white} />
            <Text style={styles.sectionHeaderText}>{title}</Text>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountText}>{count}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading contests...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.menuButton}
          >
            <MaterialIcons name="arrow-back" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <MaterialIcons name="schedule" size={28} color={COLORS.accent2} style={styles.logoIcon} />
          <Text style={styles.title}>Contest Schedule</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchContests}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error" size={18} color={COLORS.white} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Live Contests Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            'Live Contests', 
            liveContests.length, 
            'live-tv', 
            COLORS.live
          )}
          {liveContests.length > 0 ? (
            liveContests.map(renderContestCard)
          ) : (
            <View style={styles.emptySection}>
              <MaterialIcons name="live-tv" size={24} color={COLORS.gray} />
              <Text style={styles.emptySectionText}>No live contests at the moment</Text>
            </View>
          )}
        </View>

        {/* Upcoming Contests Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            'Upcoming Contests', 
            upcomingContests.length, 
            'upcoming', 
            COLORS.upcoming
          )}
          {upcomingContests.length > 0 ? (
            upcomingContests.map(renderContestCard)
          ) : (
            <View style={styles.emptySection}>
              <MaterialIcons name="schedule" size={24} color={COLORS.gray} />
              <Text style={styles.emptySectionText}>No upcoming contests scheduled</Text>
            </View>
          )}
        </View>

        {/* Past Contests Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            'Past Contests', 
            pastContests.length, 
            'history', 
            COLORS.past
          )}
          {pastContests.length > 0 ? (
            pastContests.map(renderContestCard)
          ) : (
            <View style={styles.emptySection}>
              <MaterialIcons name="history" size={24} color={COLORS.gray} />
              <Text style={styles.emptySectionText}>No past contests to show</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    color: COLORS.white,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15, // Aligned with HomeScreen's scrollContainer
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    paddingTop: 20, // Adjusted for better spacing
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)', // Aligned with HomeScreen's menuHeader
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 20, // Aligned with HomeScreen
  },
  logoIcon: {
    marginRight: 6, // Aligned with HomeScreen
  },
  title: {
    fontSize: 22, // Slightly smaller than HomeScreen title but still prominent
    fontWeight: '800', // Aligned with HomeScreen
    color: COLORS.white,
    letterSpacing: 0.5, // Aligned with HomeScreen
  },
  errorBanner: {
    backgroundColor: COLORS.error,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 0, // Ensure it spans full width of scrollContent
  },
  errorText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginBottom: 32, // Aligned with HomeScreen's section margin
  },
  sectionHeaderContainer: {
    marginBottom: 16, // Spacing between header and cards
  },
  sectionHeaderGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8, // Rounded corners for the header itself
    overflow: 'hidden',
    borderLeftWidth: 4, // Aligned with HomeScreen's sectionTitle
    borderLeftColor: COLORS.accent2, // Aligned with HomeScreen's sectionTitle
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    color: COLORS.white,
    fontSize: 18, // Slightly larger for prominence
    fontWeight: '700', // Aligned with HomeScreen
    marginLeft: 10,
    flex: 1, // Allow text to take available space
  },
  sectionCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  sectionCountText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: COLORS.lightBg, // Use cardBg for consistency
    borderRadius: 16, // Larger border radius for consistency
    marginHorizontal: 0, // Ensure it spans full width of scrollContent
    marginTop: 0, // Remove top margin as sectionHeaderContainer handles spacing
    borderWidth: 1, // Add border for consistency
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptySectionText: {
    color: COLORS.gray,
    fontSize: 14,
    marginLeft: 8,
  },
  contestCard: {
    marginBottom: 16, // Spacing between cards
    borderRadius: 16, // Larger border radius for consistency
    overflow: 'hidden',
    shadowColor: '#000', // Add shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: 16,
    borderLeftWidth: 4, // Retain border for status indication
    borderLeftColor: 'transparent', // Will be set dynamically by live/upcomingCard styles
  },
  upcomingCard: {
    borderLeftColor: COLORS.primary, // Primary blue for upcoming
  },
  liveCard: {
    borderLeftColor: COLORS.live, // Red for live
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platform: {
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 8,
    textTransform: 'uppercase',
    color: COLORS.white, // Platform name should also be white for consistency
  },
  contestName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
    lineHeight: 22,
  },
  timeInfoContainer: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeText: {
    color: COLORS.gray,
    fontSize: 13,
    marginLeft: 8,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    color: COLORS.gray,
    fontSize: 12,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Slightly more opaque for visibility
  },
  upcomingBadge: {
    backgroundColor: 'rgba(75, 112, 245, 0.2)', // Retain original upcoming color
  },
  liveBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)', // Retain original live color
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: COLORS.white,
  },
});

export default ContestTimeScreen;
