import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Linking, Dimensions, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Color palette matching the HomeScreen
const COLORS = {
  primary: '#3A59D1',        // Vibrant blue
  secondary: '#3D90D7',       // Deep purple-blue
  accent1: '#7AC6D2',         // Light blue/cyan
  accent2: '#B5FCCD',         // Light green/cyan
  darkBg: '#0f172a',          // Dark navy background
  lightBg: 'rgba(255, 255, 255, 0.08)', // Card background
  white: '#FFFFFF',           // Pure white
  gray: 'rgba(255, 255, 255, 0.7)', // Translucent white for secondary text
  highlight: '#3DC2EC',       // Bright cyan (for progress bar)
  error: '#FF6B6B',           // Error banner color
  live: '#7AC6D2',            // Soft color for live contests
  upcoming: '#3A59D1',        // Primary color for upcoming contests
  past: '#B5FCCD',            // Soft color for past contests
  sectionBg: '#1e293b',       // Section header background
};

type PlatformKey = 'codeforces' | 'codechef' | 'leetcode';

interface PlatformData {
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  platformName: string;
  api: string;
  query?: string;
  enabled: boolean;
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
}

type ContestStatus = 'upcoming' | 'live' | 'completed';

const PLATFORM_DATA: Record<PlatformKey, PlatformData> = {
  codeforces: {
    color: '#FF5722',
    icon: 'code',
    platformName: 'Codeforces',
    api: 'https://codeforces.com/api/contest.list',
    enabled: true
  },
  codechef: {
    color: '#4CAF50',
    icon: 'restaurant',
    platformName: 'CodeChef',
    api: 'https://www.codechef.com/api/list/contests/all',
    enabled: true
  },
  leetcode: {
    color: '#FFA500',
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

const ContestTimeScreen = () => {
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State to hold the current time, updated every second for live countdowns
  const [currentTime, setCurrentTime] = useState(new Date());

  // Effect to update currentTime every second for live contest countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    // Cleanup the interval when the component unmounts
    return () => clearInterval(timer);
  }, []);

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
            // Return an empty array so other platforms can still be displayed
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

  // Use useMemo to categorize contests, now also dependent on `currentTime`
  // This ensures live contest countdowns update correctly
  const { liveContests, upcomingContests, pastContests } = useMemo(() => {
    const now = currentTime; // Use the ticking current time for accurate categorization
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
      // Limit the number of contests displayed for brevity and performance
      liveContests: live.slice(0, 10),
      upcomingContests: upcoming.slice(0, 10),
      pastContests: past.slice(-10).reverse() // Show most recent past contests
    };
  }, [contests, currentTime]); // Add currentTime as a dependency

  // Fetch contests on initial component mount
  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

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
    // This function implicitly uses the latest time when called,
    // as the `currentTime` state change triggers re-renders of the relevant components.
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();
    
    if (diff <= 0) return '00:00:00'; // Contest has ended or started

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`; // Show days if more than 0
    }
    // Format as HH:MM:SS for shorter durations
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getContestStatus = useCallback((startTime: Date, endTime: Date): ContestStatus => {
    const now = new Date(); // Get current time for status determination
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'live';
    return 'completed';
  }, []);

  const openContest = useCallback((url: string) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  }, []);

  const getDurationString = useCallback((startTime: Date, endTime: Date) => {
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = Math.round(durationMs / (1000 * 60 * 60));
    
    if (durationHours < 1) {
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      return `${durationMinutes}m`;
    } else if (durationHours < 24) {
      return `${durationHours}h`;
    } else {
      const durationDays = Math.round(durationHours / 24);
      return `${durationDays}d`;
    }
  }, []);

  const renderContestCard = useCallback((contest: Contest, index: number) => {
    const status = getContestStatus(contest.startTime, contest.endTime);
    const isLive = status === 'live';
    const isUpcoming = status === 'upcoming';
    
    return (
      <TouchableOpacity 
        key={contest.id}
        style={[
          styles.contestCard,
          index !== 0 && { marginTop: 12 } // Add margin to all but the first card
        ]}
        onPress={() => openContest(contest.url)}
        activeOpacity={0.8} // Reduce opacity slightly on press
      >
        <LinearGradient
          // Gradient colors change based on contest status for visual distinction
          colors={isLive ? [COLORS.accent1, COLORS.accent2] : isUpcoming ? [COLORS.primary, COLORS.secondary] : [COLORS.accent2, COLORS.accent1]}
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
                {/* Display 'Ends' for live contests, 'Starts' for upcoming */}
                {isLive ? 'Ends: ' : 'Starts: '} 
                {calculateTimeRemaining(isLive ? contest.endTime : contest.startTime)}
              </Text>
            </View>
          </View>
          
          {/* Progress bar for live contests */}
          {isLive && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient 
                  colors={[COLORS.accent1, COLORS.highlight]}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={[
                    styles.progressBarFill,
                    { 
                      // Calculate progress based on current time
                      width: `${Math.min(
                        100, // Cap at 100%
                        ((currentTime.getTime() - contest.startTime.getTime()) / 
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
  }, [getContestStatus, openContest, formatDate, calculateTimeRemaining, getDurationString, currentTime]); // Add currentTime as a dependency for re-rendering progress bar

  const renderSectionHeader = (title: string, count: number, icon: keyof typeof MaterialIcons.glyphMap, color: string) => {
    return (
      <View style={styles.sectionHeaderContainer}>
        <LinearGradient
          colors={[color, COLORS.sectionBg]} // Gradient for section headers
          start={[0, 0]}
          end={[1, 0]}
          style={styles.sectionHeaderGradient}
        >
          <View style={styles.sectionHeaderContent}>
            <MaterialIcons name={icon} size={20} color={COLORS.white} />
            <Text style={styles.sectionHeaderText}>{title}</Text>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountText}>{count}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // Display loading indicator while contests are being fetched
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
      {/* Header section with back button and title */}
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

      {/* Scrollable content area for contest lists */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchContests}
            colors={[COLORS.primary]} // Android refresh indicator color
            tintColor={COLORS.primary} // iOS refresh indicator color
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Error banner display */}
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
          <View style={styles.sectionCardContainer}>
            {liveContests.length > 0 ? (
              liveContests.map(renderContestCard)
            ) : (
              <View style={styles.emptySection}>
                <MaterialIcons name="live-tv" size={24} color={COLORS.gray} />
                <Text style={styles.emptySectionText}>No live contests at the moment</Text>
              </View>
            )}
          </View>
        </View>

        {/* Upcoming Contests Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            'Upcoming Contests', 
            upcomingContests.length, 
            'upcoming', 
            COLORS.upcoming
          )}
          <View style={styles.sectionCardContainer}>
            {upcomingContests.length > 0 ? (
              upcomingContests.map(renderContestCard)
            ) : (
              <View style={styles.emptySection}>
                <MaterialIcons name="schedule" size={24} color={COLORS.gray} />
                <Text style={styles.emptySectionText}>No upcoming contests scheduled</Text>
              </View>
            )}
          </View>
        </View>

        {/* Past Contests Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            'Past Contests', 
            pastContests.length, 
            'history', 
            COLORS.past
          )}
          <View style={styles.sectionCardContainer}>
            {pastContests.length > 0 ? (
              pastContests.map(renderContestCard)
            ) : (
              <View style={styles.emptySection}>
                <MaterialIcons name="history" size={24} color={COLORS.gray} />
                <Text style={styles.emptySectionText}>No past contests to show</Text>
              </View>
            )}
          </View>
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
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    paddingTop: 20, // Adjust for status bar on iOS
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 20,
  },
  logoIcon: {
    marginRight: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  errorBanner: {
    backgroundColor: COLORS.error,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
    marginBottom: 12,
  },
  sectionHeaderGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent2, // A subtle accent for the header
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    flex: 1,
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
  sectionCardContainer: {
    backgroundColor: COLORS.lightBg, // Semi-transparent background for card container
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle border
  },
  emptySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptySectionText: {
    color: COLORS.gray,
    fontSize: 14,
    marginLeft: 8,
  },
  contestCard: {
    borderRadius: 12,
    overflow: 'hidden', // Ensures gradient respects border radius
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // Android shadow
  },
  cardGradient: {
    padding: 16,
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
    color: COLORS.white,
  },
  contestName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
    lineHeight: 22, // Improve readability for multi-line names
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Default translucent background
  },
  upcomingBadge: {
    backgroundColor: 'rgba(58, 89, 209, 0.2)', // Specific tint for upcoming
  },
  liveBadge: {
    backgroundColor: 'rgba(122, 198, 210, 0.2)', // Specific tint for live
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: COLORS.white,
  },
});

export default ContestTimeScreen;
