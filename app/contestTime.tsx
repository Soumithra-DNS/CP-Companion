import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Linking, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_GAP = 16;
const CARD_WIDTH = (width - 48) / 2; // 32 total padding + 16 gap

// Color palette matching the HomeScreen design
const COLORS = {
  primary: '#3A59D1',
  secondary: '#3D90D7',
  accent1: '#7AC6D2',
  accent2: '#B5FCCD',
  darkBg: '#0f172a',
  white: '#ffffff',
  translucentWhite: 'rgba(255, 255, 255, 0.7)',
  cardBg: 'rgba(255, 255, 255, 0.08)',
  highlight: '#e74c3c'
};

type PlatformKey = 'codeforces' | 'codechef' | 'leetcode' | 'atcoder';

// Platform data with colors and icons
const PLATFORM_DATA: Record<PlatformKey, {
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  platformName: string;
  api: string;
  query?: string;
}> = {
  codeforces: {
    color: '#FF5722',
    icon: 'code',
    platformName: 'Codeforces',
    api: 'https://codeforces.com/api/contest.list'
  },
  codechef: {
    color: '#8BC34A',
    icon: 'restaurant',
    platformName: 'CodeChef',
    api: 'https://www.codechef.com/api/list/contests/all'
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
    }`
  },
  atcoder: {
    color: '#9C27B0',
    icon: 'alpha-a',
    platformName: 'AtCoder',
    api: 'https://kenkoooo.com/atcoder/atcoder-api/v3/contest/upcoming'
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

const ContestTimeScreen = () => {
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchContests = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const fetchedContests = await Promise.all([
        fetchCodeforcesContests(),
        fetchCodechefContests(),
        fetchLeetcodeContests(),
        fetchAtcoderContests()
      ]);
      
      // Combine and sort all contests by start time
      const allContests = fetchedContests.flat()
        .filter((contest): contest is Contest => contest !== null)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      setContests(allContests);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch some contests. Showing partial data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCodeforcesContests = async (): Promise<(Contest | null)[]> => {
    try {
      const response = await axios.get(PLATFORM_DATA.codeforces.api);
      const contests = response.data.result
        .filter((contest: any) => contest.phase === 'BEFORE' || contest.phase === 'CODING')
        .map((contest: any) => {
          const startTime = new Date(contest.startTimeSeconds * 1000);
          const endTime = new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000);
          
          return {
            id: `codeforces-${contest.id}`,
            platform: 'codeforces',
            name: contest.name,
            startTime,
            endTime,
            url: `https://codeforces.com/contests/${contest.id}`,
            color: PLATFORM_DATA.codeforces.color,
            icon: PLATFORM_DATA.codeforces.icon,
            platformName: PLATFORM_DATA.codeforces.platformName
          };
        });
      return contests;
    } catch (error) {
      console.error('Error fetching Codeforces contests:', error);
      return [];
    }
  };

  const fetchCodechefContests = async (): Promise<(Contest | null)[]> => {
    try {
      const response = await axios.get(PLATFORM_DATA.codechef.api);
      const contests: Contest[] = [];
      
      // Current contests
      if (response.data.present_contests) {
        response.data.present_contests.forEach((contest: any) => {
          const startTime = new Date(contest.contest_start_date);
          const endTime = new Date(contest.contest_end_date);
          
          contests.push({
            id: `codechef-present-${contest.contest_code}`,
            platform: 'codechef',
            name: contest.contest_name,
            startTime,
            endTime,
            url: `https://www.codechef.com/${contest.contest_code}`,
            color: PLATFORM_DATA.codechef.color,
            icon: PLATFORM_DATA.codechef.icon,
            platformName: PLATFORM_DATA.codechef.platformName
          });
        });
      }
      
      // Future contests
      if (response.data.future_contests) {
        response.data.future_contests.forEach((contest: any) => {
          const startTime = new Date(contest.contest_start_date);
          const endTime = new Date(contest.contest_end_date);
          
          contests.push({
            id: `codechef-future-${contest.contest_code}`,
            platform: 'codechef',
            name: contest.contest_name,
            startTime,
            endTime,
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

  const fetchLeetcodeContests = async (): Promise<(Contest | null)[]> => {
    try {
      const response = await axios.post(PLATFORM_DATA.leetcode.api, {
        query: PLATFORM_DATA.leetcode.query
      });
      
      return response.data.data.allContests.map((contest: any) => {
        const startTime = new Date(contest.startTime * 1000);
        const endTime = new Date((contest.startTime + contest.duration) * 1000);
        
        return {
          id: `leetcode-${contest.titleSlug}`,
          platform: 'leetcode',
          name: contest.title,
          startTime,
          endTime,
          url: `https://leetcode.com/contest/${contest.titleSlug}`,
          color: PLATFORM_DATA.leetcode.color,
          icon: PLATFORM_DATA.leetcode.icon,
          platformName: PLATFORM_DATA.leetcode.platformName
        };
      });
    } catch (error) {
      console.error('Error fetching LeetCode contests:', error);
      return [];
    }
  };

  const fetchAtcoderContests = async (): Promise<(Contest | null)[]> => {
    try {
      const response = await axios.get(PLATFORM_DATA.atcoder.api);
      
      return response.data.map((contest: any) => {
        const startTime = new Date(contest.start_time);
        const endTime = new Date(contest.start_time);
        endTime.setSeconds(endTime.getSeconds() + contest.duration);
        
        return {
          id: `atcoder-${contest.id}`,
          platform: 'atcoder',
          name: contest.title,
          startTime,
          endTime,
          url: `https://atcoder.jp/contests/${contest.id}`,
          color: PLATFORM_DATA.atcoder.color,
          icon: PLATFORM_DATA.atcoder.icon,
          platformName: PLATFORM_DATA.atcoder.platformName
        };
      });
    } catch (error) {
      console.error('Error fetching AtCoder contests:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateTimeRemaining = (targetTime: Date) => {
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
  };

  const getContestStatus = (startTime: Date, endTime: Date) => {
    const now = new Date();
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'live';
    return 'completed';
  };

  const openContest = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  const getDurationString = (startTime: Date, endTime: Date) => {
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
  };

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading contests...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.container}>
      {/* Header - Matching HomeScreen style */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.menuButton}
          >
            <MaterialIcons name="arrow-back" size={32} color={COLORS.white} />
          </TouchableOpacity>
          <MaterialIcons name="access-time" size={38} color={COLORS.primary} style={styles.logoIcon} />
          <Text style={styles.title}>
            <Text style={{ color: COLORS.primary }}>Contest</Text>
            <Text style={{ color: COLORS.white }}> Time</Text>
          </Text>
        </View>
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
      >
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error" size={18} color={COLORS.white} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Contests List */}
        {contests.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="calendar-today" size={50} color={COLORS.translucentWhite} />
            <Text style={styles.emptyText}>No contests scheduled</Text>
            <Text style={styles.emptySubText}>Check back later for updates</Text>
          </View>
        ) : (
          contests.map((contest) => {
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
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.platformInfo}>
                    <MaterialIcons name={contest.icon} size={20} color={contest.color} />
                    <Text style={[styles.platform, { color: contest.color }]}>{contest.platformName}</Text>
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
                
                {/* Contest Name */}
                <Text style={styles.contestName}>{contest.name}</Text>
                
                {/* Time Info */}
                <View style={styles.timeInfoContainer}>
                  <View style={styles.timeRow}>
                    <MaterialIcons name="calendar-today" size={14} color={COLORS.translucentWhite} />
                    <Text style={styles.timeText}>{formatDate(contest.startTime)}</Text>
                  </View>
                  
                  <View style={styles.timeRow}>
                    <MaterialIcons name="timer" size={14} color={COLORS.translucentWhite} />
                    <Text style={styles.timeText}>
                      {isLive ? 'Ends: ' : 'Starts: '} 
                      {calculateTimeRemaining(isLive ? contest.endTime : contest.startTime)}
                    </Text>
                  </View>
                </View>
                
                {/* Progress Bar */}
                {isLive && (
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <LinearGradient 
                        colors={[contest.color, COLORS.accent2]}
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
                
                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.durationContainer}>
                    <MaterialIcons name="hourglass-bottom" size={14} color={COLORS.translucentWhite} />
                    <Text style={styles.durationText}>
                      {getDurationString(contest.startTime, contest.endTime)}
                    </Text>
                  </View>
                  <MaterialIcons name="launch" size={16} color={COLORS.translucentWhite} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.lastUpdated}>
          <MaterialIcons name="update" size={12} color={COLORS.translucentWhite} /> 
          Updated: {formatDate(lastUpdated)}
        </Text>
        <TouchableOpacity 
          onPress={fetchContests} 
          style={styles.refreshButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
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
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    marginBottom: 15,
    paddingHorizontal: 16,
    paddingTop: 20,
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
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  errorBanner: {
    backgroundColor: COLORS.highlight,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.white,
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.translucentWhite,
    marginTop: 5,
  },
  contestCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.translucentWhite,
  },
  upcomingCard: {
    borderLeftColor: COLORS.primary,
  },
  liveCard: {
    borderLeftColor: COLORS.highlight,
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
    color: COLORS.translucentWhite,
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
    color: COLORS.translucentWhite,
    fontSize: 12,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  upcomingBadge: {
    backgroundColor: 'rgba(58, 89, 209, 0.2)',
  },
  liveBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: COLORS.white,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: COLORS.darkBg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    color: COLORS.translucentWhite,
    fontSize: 12,
  },
  refreshButton: {
    padding: 6,
  },
});

export default ContestTimeScreen;