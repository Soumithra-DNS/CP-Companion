import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Linking, Dimensions, StatusBar, Platform, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Enhanced color palette with gradients
const COLORS = {
  background: '#F3E2D4',        // Light beige/cream background
  primary: '#17313E',           // Dark blue/navy for primary text
  secondary: '#415E72',         // Medium blue/gray for secondary text
  accent1: '#C5B0CD',           // Light lavender/purple accent
  accent2: '#F3E2D4',           // Light beige (same as background)
  white: '#FFFFFF',             // Pure white for cards
  
  // Enhanced colors for contest status
  live: '#4CAF50',              // Green for live contests
  liveGradient: ['#4CAF50', '#45a049'],
  upcoming: '#FF9800',          // Orange for upcoming contests
  upcomingGradient: ['#FF9800', '#F57C00'],
  past: '#9E9E9E',              // Gray for past contests
  pastGradient: ['#9E9E9E', '#757575'],
  
  // Card backgrounds
  cardBg: '#FFFFFF',
  sectionHeader: 'rgba(255, 255, 255, 0.7)',
  
  // New accent colors
  accentGradient1: ['#C5B0CD', '#A58CB3'],
  accentGradient2: ['#F3E2D4', '#E8D1C5'],
  
  // Shadows
  shadow: '#17313E',
  
  // New color for time icons for better visibility
  timeIcon: '#17313E',          // Dark blue/navy for time icons
} as const;

type PlatformKey = 'codeforces' | 'codechef' | 'leetcode';

interface PlatformData {
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  platformName: string;
  api: string;
  query?: string;
  enabled: boolean;
  gradient: [string, string, ...string[]];
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
  gradient: [string, string, ...string[]];
}

type ContestStatus = 'upcoming' | 'live' | 'completed';

const PLATFORM_DATA: Record<PlatformKey, PlatformData> = {
  codeforces: {
    color: '#FF5722',
    icon: 'code',
    platformName: 'Codeforces',
    api: 'https://codeforces.com/api/contest.list',
    enabled: true,
    gradient: ['#FF5722', '#E64A19']
  },
  codechef: {
    color: '#4CAF50',
    icon: 'restaurant',
    platformName: 'CodeChef',
    api: 'https://www.codechef.com/api/list/contests/all',
    enabled: true,
    gradient: ['#4CAF50', '#388E3C']
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
    enabled: true,
    gradient: ['#FFA500', '#F57C00']
  }
};

const ContestTimeScreen = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [loading]);

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
          platformName: PLATFORM_DATA.codeforces.platformName,
          gradient: PLATFORM_DATA.codeforces.gradient
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
            platformName: PLATFORM_DATA.codechef.platformName,
            gradient: PLATFORM_DATA.codechef.gradient
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
            platformName: PLATFORM_DATA.codechef.platformName,
            gradient: PLATFORM_DATA.codechef.gradient
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
        platformName: PLATFORM_DATA.leetcode.platformName,
        gradient: PLATFORM_DATA.leetcode.gradient
      }));
    } catch (error) {
      console.error('Error fetching LeetCode contests:', error);
      return [];
    }
  };

  const { liveContests, upcomingContests, pastContests } = useMemo(() => {
    const now = currentTime;
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
  }, [contests, currentTime]);

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
      <Animated.View 
        key={contest.id}
        style={[
          styles.contestCard,
          index !== 0 && { marginTop: 12 },
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          onPress={() => openContest(contest.url)}
          activeOpacity={0.8}
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
                    {isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'COMPLETED'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.contestName} numberOfLines={2}>{contest.name}</Text>
              
              <View style={styles.timeInfoContainer}>
                <View style={styles.timeRow}>
                  <MaterialIcons name="calendar-today" size={14} color={COLORS.timeIcon} />
                  <Text style={styles.timeText}>{formatDate(contest.startTime)}</Text>
                </View>
                
                <View style={styles.timeRow}>
                  <MaterialIcons name="timer" size={14} color={COLORS.timeIcon} />
                  <Text style={styles.timeText}>
                    {isLive ? 'Ends: ' : 'Starts: '} 
                    {calculateTimeRemaining(isLive ? contest.endTime : contest.startTime)}
                  </Text>
                </View>
              </View>
              
              {isLive && (
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill,
                        { 
                          width: `${Math.min(
                            100,
                            ((currentTime.getTime() - contest.startTime.getTime()) / 
                            (contest.endTime.getTime() - contest.startTime.getTime())) * 100
                          )}%`,
                          backgroundColor: COLORS.white
                        }
                      ]}
                    />
                  </View>
                </View>
              )}
              
              <View style={styles.cardFooter}>
                <View style={styles.durationContainer}>
                  <MaterialIcons name="hourglass-bottom" size={14} color={COLORS.timeIcon} />
                  <Text style={styles.durationText}>
                    {getDurationString(contest.startTime, contest.endTime)}
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
  }, [getContestStatus, openContest, formatDate, calculateTimeRemaining, getDurationString, currentTime, fadeAnim, scaleAnim]);

  const renderSectionHeader = (title: string, count: number) => {
    return (
      <LinearGradient
        colors={COLORS.accentGradient1}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sectionHeaderContainer}
      >
        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionHeaderText}>{title}</Text>
          <View style={styles.sectionCountBadge}>
            <Text style={styles.sectionCountText}>{count}</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient
          colors={[COLORS.background, COLORS.accent2]}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading contests...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.accent2]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <LinearGradient
          colors={COLORS.accentGradient1}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Contest Schedule</Text>
            <View style={styles.headerDecoration}>
              
            </View>
          </View>
        </LinearGradient>
      </View>

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
          <LinearGradient
            colors={['#FF6B6B', '#FF4757']}
            style={styles.errorBanner}
          >
            <MaterialIcons name="error" size={18} color={COLORS.white} />
            <Text style={styles.errorText}>{error}</Text>
          </LinearGradient>
        )}

        <View style={styles.section}>
          {renderSectionHeader('Live Contests', liveContests.length)}
          <View style={styles.sectionCardContainer}>
            {liveContests.length > 0 ? (
              liveContests.map(renderContestCard)
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>No live contests at the moment</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          {renderSectionHeader('Upcoming Contests', upcomingContests.length)}
          <View style={styles.sectionCardContainer}>
            {upcomingContests.length > 0 ? (
              upcomingContests.map(renderContestCard)
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>No upcoming contests scheduled</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          {renderSectionHeader('Past Contests', pastContests.length)}
          <View style={styles.sectionCardContainer}>
            {pastContests.length > 0 ? (
              pastContests.map(renderContestCard)
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>No past contests to show</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Stay tuned for more coding challenges!</Text>
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
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
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
    borderRadius: 0,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerGradient: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 8,
    borderRadius: 12,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 50 : 30,
  },
  decorationIcon: {
    marginHorizontal: 4,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  errorText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sectionHeaderText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionCountBadge: {
    backgroundColor: 'rgba(23, 49, 62, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
  },
  sectionCountText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionCardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  emptySectionText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  contestCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardGradient: {
    borderRadius: 16,
    padding: 1.5,
  },
  cardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
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
  platformIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  platform: {
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    color: COLORS.primary,
  },
  contestName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
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
    color: COLORS.primary,
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(23, 49, 62, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
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
    color: COLORS.primary,
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  launchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 6,
    borderRadius: 20,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.past,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: COLORS.white,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
  },
  footerText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default ContestTimeScreen;