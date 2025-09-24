import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Circle, Svg } from 'react-native-svg';

// --- Helper Components (No change in logic) ---

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const StatItem = ({ label, value, icon, color }: { label: string; value: string | number; icon?: string; color?: string }) => (
  <View style={styles.statItem}>
    {icon && <MaterialIcons name={icon as any} size={16} color={color || '#415E72'} />}
    <Text style={styles.statItemLabel}>{label}</Text>
    <Text style={[styles.statValue, { color: color || '#17313E' }]}>{value}</Text>
  </View>
);

const EnhancedLeetCodeBars = ({ easy, medium, hard, total }: { easy: number; medium: number; hard: number; total: number }) => {
  const easyPercentage = total > 0 ? Math.round((easy / total) * 100) : 0;
  const mediumPercentage = total > 0 ? Math.round((medium / total) * 100) : 0;
  const hardPercentage = total > 0 ? Math.round((hard / total) * 100) : 0;

  return (
    <View style={styles.enhancedDifficultyContainer}>
      <View style={styles.difficultyHeader}>
        <Text style={styles.difficultyTitle}>Problem Distribution</Text>
        <Text style={styles.difficultyTotal}>{total}</Text>
      </View>
      <View style={styles.difficultyBarContainer}>
        <View style={[styles.barSegment, styles.easyBar, { width: `${easyPercentage}%` }]} />
        <View style={[styles.barSegment, styles.mediumBar, { width: `${mediumPercentage}%` }]} />
        <View style={[styles.barSegment, styles.hardBar, { width: `${hardPercentage}%` }]} />
      </View>
      <View style={styles.difficultyStats}>
        <View style={styles.difficultyStat}>
          <View style={styles.difficultyInfo}><View style={[styles.legendDot, styles.easyDot]}/><Text style={styles.difficultyLabel}>Easy</Text></View>
          <Text style={styles.difficultyNumbers}>{easyPercentage}%</Text>
        </View>
        <View style={styles.difficultyStat}>
          <View style={styles.difficultyInfo}><View style={[styles.legendDot, styles.mediumDot]}/><Text style={styles.difficultyLabel}>Medium</Text></View>
          <Text style={styles.difficultyNumbers}>{mediumPercentage}%</Text>
        </View>
        <View style={styles.difficultyStat}>
          <View style={styles.difficultyInfo}><View style={[styles.legendDot, styles.hardDot]}/><Text style={styles.difficultyLabel}>Hard</Text></View>
          <Text style={styles.difficultyNumbers}>{hardPercentage}%</Text>
        </View>
      </View>
    </View>
  );
};

const EnhancedSubmissionItem = ({ submission, platform }: { submission: any; platform: string }) => {
  const getProblemTitle = (sub: any) => {
    if (platform === 'codeforces') return sub.problem?.name || `Problem ${sub.problem?.index || 'N/A'}`;
    return sub.title || 'Unknown Problem';
  };
  const getVerdictColor = (verdict: string) => {
    if (verdict === 'OK' || verdict === 'AC') return '#27AE60';
    if (verdict === 'WRONG_ANSWER' || verdict === 'WA') return '#E74C3C';
    if (verdict === 'TIME_LIMIT_EXCEEDED' || verdict === 'TLE') return '#F39C12';
    if (verdict === 'RUNTIME_ERROR' || verdict === 'RE') return '#9B59B6';
    return '#95A5A6';
  };
  const formatVerdict = (verdict: string) => {
    if (verdict === 'OK' || verdict === 'AC') return 'Accepted';
    if (platform === 'codeforces') {
      const formatted = verdict.replace(/_/g, ' ');
      return formatted.charAt(0) + formatted.slice(1).toLowerCase();
    }
    return verdict;
  };
  return (
    <TouchableOpacity style={styles.enhancedSubmissionItem} onPress={() => { if (platform === 'codeforces' && submission.contestId) { Linking.openURL(`https://codeforces.com/contest/${submission.contestId}/submission/${submission.id}`); }}}>
      <View style={styles.submissionContent}>
        <Text style={styles.submissionProblem} numberOfLines={1}>{getProblemTitle(submission)}</Text>
        <View style={styles.submissionMeta}>
          <Text style={styles.submissionTime}>{submission.creationTimeSeconds ? new Date(submission.creationTimeSeconds * 1000).toLocaleDateString() : 'Unknown date'}</Text>
          <Text style={[styles.submissionVerdict, { color: getVerdictColor(submission.verdict) }]}>{formatVerdict(submission.verdict)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PlatformHeader = ({ platformName, handle, data, onClear, icon, iconBg, onTitlePress }: { platformName: string; handle: string | undefined | null; data: any; onClear: () => void; icon: React.ReactNode; iconBg: string; onTitlePress: () => void; }) => (
  <View style={styles.platformHeader}>
    <TouchableOpacity style={styles.platformTitleContainer} onPress={onTitlePress} disabled={!data}>
      <View style={[styles.platformIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.platformTextContainer}>
        <Text style={styles.platformName}>{platformName}</Text>
        {handle && <Text style={styles.handleText}>@{handle}</Text>}
      </View>
    </TouchableOpacity>
    {data && (
      <TouchableOpacity style={styles.connectedBadge} onPress={onClear}>
        <MaterialIcons name="check-circle" size={14} color="#4CAF50" /><Text style={styles.connectedText}>Connected</Text>
      </TouchableOpacity>
    )}
  </View>
);

const PlatformInput = ({ id, setId, placeholder, onConnect, loading }: { id: string; setId: (id: string) => void; placeholder: string; onConnect: () => void; loading: boolean; }) => (
  <View style={styles.inputContainer}>
    <TextInput style={styles.textInput} placeholder={placeholder} value={id} onChangeText={setId} placeholderTextColor="#999" autoCapitalize="none" />
    <TouchableOpacity style={[styles.connectButton, loading && styles.loadingButton]} onPress={onConnect} disabled={loading}>
      {loading ? <ActivityIndicator size="small" color="#FFF" /> : <><MaterialIcons name="link" size={16} color="#FFF" /><Text style={styles.connectButtonText}>Connect</Text></>}
    </TouchableOpacity>
  </View>
);

const ConfirmationModal = ({ visible, onCancel, onConfirm, platform }: { visible: boolean; onCancel: () => void; onConfirm: () => void; platform: string | null; }) => (
  <Modal transparent={true} visible={visible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Disconnect {platform}?</Text>
        <Text style={styles.modalMessage}>Your data will be cleared from this app.</Text>
        <View style={styles.modalActions}>
          <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}><Text style={styles.confirmButtonText}>Disconnect</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// --- Refactored Sectional Components ---

const LearningJourneyTab = ({ learnedTopics, progressAnimation, animatedValue }: { learnedTopics: number; progressAnimation: Animated.Value; animatedValue: Animated.Value; }) => {
  const progressPercentage = Math.round((learnedTopics / 15) * 100);
  const { strokeDashoffset, translateY, opacity } = {
    strokeDashoffset: progressAnimation.interpolate({ inputRange: [0, 1], outputRange: [2 * Math.PI * 80, 0] }),
    translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
    opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  };

  return (
    <>
      <Animated.View style={[styles.header, { transform: [{ translateY }], opacity }]}><Text style={styles.heading}>Learning Journey</Text></Animated.View>
      <Animated.View style={[styles.progressContainer, { transform: [{ translateY }], opacity }]}>
        <View style={styles.circleWrapper}>
          <Svg width="200" height="200" viewBox="0 0 200 200">
            <Circle cx="100" cy="100" r={80} stroke="#E8D5C4" strokeWidth="12" fill="none" />
            <AnimatedCircle cx="100" cy="100" r={80} stroke="#17313E" strokeWidth="12" fill="none" strokeDasharray={2 * Math.PI * 80} strokeDashoffset={strokeDashoffset} strokeLinecap="round" rotation="-90" origin="100, 100" />
          </Svg>
          <View style={styles.progressTextContainer}><Text style={styles.percentage}>{progressPercentage}%</Text><Text style={styles.completed}>Complete</Text></View>
        </View>
      </Animated.View>
      <Animated.View style={[styles.statsContainer, { transform: [{ translateY }], opacity }]}>
        <View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: '#C5B0CD' }]}><MaterialIcons name="check-circle" size={20} color="#17313E" /></View><View style={styles.statContent}><Text style={styles.statNumber}>{learnedTopics}</Text><Text style={styles.statLabel}>Mastered</Text></View></View>
        <View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: '#F3E2D4' }]}><MaterialIcons name="schedule" size={20} color="#17313E" /></View><View style={styles.statContent}><Text style={styles.statNumber}>{15 - learnedTopics}</Text><Text style={styles.statLabel}>To Explore</Text></View></View>
        <View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: '#E8D5C4' }]}><MaterialIcons name="functions" size={20} color="#17313E" /></View><View style={styles.statContent}><Text style={styles.statNumber}>15</Text><Text style={styles.statLabel}>Total</Text></View></View>
      </Animated.View>
      <Animated.View style={[styles.quoteContainer, { transform: [{ translateY }], opacity }]}><Text style={styles.quoteText}>{progressPercentage < 50 ? "Great progress! Consistency is key." : progressPercentage < 80 ? "Amazing! You're doing great!" : "Outstanding! Almost there!"}</Text></Animated.View>
    </>
  );
};

const CodeforcesProfileSection = ({ id, setId, data, submissions, error, loading, onFetch, onClear, animatedValue }: { id: string; setId: (id: string) => void; data: CodeforcesProfile | null; submissions: any[]; error: string | null; loading: boolean; onFetch: (id: string) => void; onClear: () => void; animatedValue: Animated.Value; }) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return '#FF0000'; if (rating >= 2100) return '#FF8C00'; if (rating >= 1900) return '#AA00AA'; if (rating >= 1600) return '#0000FF'; if (rating >= 1400) return '#03A89E'; if (rating >= 1200) return '#008000'; return '#808080';
  };
  const { translateY, opacity } = {
    translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
    opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  };

  return (
    <Animated.View style={[styles.platformSection, { transform: [{ translateY }], opacity }]}>
      <PlatformHeader platformName="Codeforces" handle={data?.handle} data={data} onClear={onClear} icon={<FontAwesome5 name="code" size={16} color="#FFF"/>} iconBg="#1F63A6" onTitlePress={() => data && Linking.openURL(`https://codeforces.com/profile/${data.handle}`)} />
      {loading ? <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#1F63A6" /><Text style={styles.loadingText}>Fetching data...</Text></View>
        : error ? <Text style={styles.errorText}>{error}</Text>
        : !data ? <PlatformInput id={id} setId={setId} placeholder="Codeforces Handle" onConnect={() => onFetch(id)} loading={loading} />
        : (
          <View style={styles.platformData}>
            <TouchableOpacity style={styles.mainRatingCard} onPress={() => Linking.openURL(`https://codeforces.com/profile/${data.handle}`)}>
              <Text style={styles.ratingTitle}>Current Rating</Text><Text style={[styles.ratingValue, { color: getRatingColor(data.rating) }]}>{data.rating}</Text><Text style={styles.ratingRank}>{data.rank}</Text><Text style={styles.maxRating}>Max: {data.maxRating}</Text>
            </TouchableOpacity>
            <View style={styles.statsGrid}>
              <StatItem label="Total Solved" value={data.totalSolved} icon="check" /><StatItem label="Contribution" value={data.contribution} icon="group" /><StatItem label="Friends" value={data.friendOfCount} icon="people" /><StatItem label="Last Online" value={data.lastOnline} icon="online-prediction" />
            </View>
            <Text style={styles.subSectionTitle}>Recent Activity</Text>
            <View style={styles.submissionContainer}>
              {submissions.length > 0 ? submissions.map((sub, index) => <EnhancedSubmissionItem key={sub.id || index} submission={sub} platform="codeforces" />) : <Text style={styles.noSubmissionsText}>No recent submissions</Text>}
            </View>
          </View>
        )}
    </Animated.View>
  );
};

const LeetCodeProfileSection = ({ id, setId, data, error, loading, onFetch, onClear, animatedValue }: { id: string; setId: (id: string) => void; data: LeetCodeProfile | null; error: string | null; loading: boolean; onFetch: (id: string) => void; onClear: () => void; animatedValue: Animated.Value; }) => {
  const { translateY, opacity } = {
    translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
    opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  };

  return (
    <Animated.View style={[styles.platformSection, { transform: [{ translateY }], opacity }]}>
      <PlatformHeader platformName="LeetCode" handle={data?.username} data={data} onClear={onClear} icon={<FontAwesome5 name="code" size={16} color="#333"/>} iconBg="#FFA116" onTitlePress={() => data && Linking.openURL(`https://leetcode.com/${data.username}`)} />
      {loading ? <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#FFA116" /><Text style={styles.loadingText}>Fetching data...</Text></View>
        : error ? <Text style={styles.errorText}>{error}</Text>
        : !data ? <PlatformInput id={id} setId={setId} placeholder="LeetCode Username" onConnect={() => onFetch(id)} loading={loading} />
        : (
          <View style={styles.platformData}>
            <TouchableOpacity style={styles.mainStatsCard} onPress={() => Linking.openURL(`https://leetcode.com/${data.username}`)}>
              <Text style={styles.statsTitle}>Problems Solved</Text><Text style={styles.statsValue}>{data.totalSolved}</Text><Text style={styles.statsSubtitle}>Total Solved</Text>
              <View style={styles.acceptanceContainer}>
                <Text style={styles.acceptanceRate}>Acceptance: {data.acceptanceRate}%</Text>
                {data.ranking > 0 && <Text style={styles.ranking}>Rank: #{data.ranking.toLocaleString()}</Text>}
              </View>
            </TouchableOpacity>
            <EnhancedLeetCodeBars easy={data.easySolved} medium={data.mediumSolved} hard={data.hardSolved} total={data.totalSolved} />
            <View style={styles.leetcodeStats}>
              <View style={styles.leetcodeStatItem}><Text style={styles.leetcodeStatLabel}>Easy</Text><Text style={[styles.leetcodeStatValue, styles.easyStat]}>{data.easySolved}</Text></View>
              <View style={styles.leetcodeStatItem}><Text style={styles.leetcodeStatLabel}>Medium</Text><Text style={[styles.leetcodeStatValue, styles.mediumStat]}>{data.mediumSolved}</Text></View>
              <View style={styles.leetcodeStatItem}><Text style={styles.leetcodeStatLabel}>Hard</Text><Text style={[styles.leetcodeStatValue, styles.hardStat]}>{data.hardSolved}</Text></View>
            </View>
          </View>
        )}
    </Animated.View>
  );
};

// --- Type Definitions ---

interface CodeforcesProfile { handle: string; rating: number; maxRating: number; rank: string; contribution: number; lastOnline: string; friendOfCount: number; totalSolved: number; }
interface LeetCodeProfile { username: string; totalSolved: number; easySolved: number; mediumSolved: number; hardSolved: number; acceptanceRate: number; ranking: number; totalQuestions: number; totalEasy: number; totalMedium: number; totalHard: number; }

// --- Main Page Component ---

export default function ProgressPage() {
  const [learnedTopics, setLearnedTopics] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));
  const [progressAnimation] = useState(new Animated.Value(0));
  
  const [codeforcesId, setCodeforcesId] = useState('');
  const [leetcodeId, setLeetcodeId] = useState('');
  const [codeforcesData, setCodeforcesData] = useState<CodeforcesProfile | null>(null);
  const [codeforcesSubmissions, setCodeforcesSubmissions] = useState<any[]>([]);
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeProfile | null>(null);
  const [loadingCodeforces, setLoadingCodeforces] = useState(false);
  const [loadingLeetcode, setLoadingLeetcode] = useState(false);
  const [cfError, setCfError] = useState<string | null>(null);
  const [lcError, setLcError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('progress');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [platformToClear, setPlatformToClear] = useState<'codeforces' | 'leetcode' | null>(null);

  const loadSavedData = async () => {
    try {
      const savedLearned = await AsyncStorage.getItem("learnedTopics");
      const topics = savedLearned ? parseInt(savedLearned, 10) : 0;
      setLearnedTopics(topics);

      const savedCfId = await AsyncStorage.getItem("codeforcesId");
      if (savedCfId) { setCodeforcesId(savedCfId); fetchCodeforcesData(savedCfId, true); }
      
      const savedLcId = await AsyncStorage.getItem("leetcodeId");
      if (savedLcId) { setLeetcodeId(savedLcId); fetchLeetcodeData(savedLcId, true); }

      Animated.timing(progressAnimation, { toValue: topics / 15, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    } catch (error) { console.error("Failed to load progress data:", error); }
  };
  
  const fetchCodeforcesData = async (id: string, isInitialLoad = false) => {
    if (!id.trim()) { setCfError("Please enter a Codeforces handle."); return; }
    setLoadingCodeforces(!isInitialLoad);
    setCfError(null);
    try {
      const [infoResponse, statusResponse] = await Promise.all([
        fetch(`https://codeforces.com/api/user.info?handles=${id}`),
        fetch(`https://codeforces.com/api/user.status?handle=${id}`)
      ]);
      const infoData = await infoResponse.json();
      const statusData = await statusResponse.json();
      
      if (infoData.status === 'OK' && infoData.result.length > 0) {
        const userData = infoData.result[0];
        let totalSolved = 0;
        if (statusData.status === 'OK') {
          const solvedProblems = new Set();
            statusData.result.forEach((sub: { verdict: string; problem: { contestId: number; index: string; }; }) => {
            if (sub.verdict === 'OK') {
              solvedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
            }
            });
          totalSolved = solvedProblems.size;
          setCodeforcesSubmissions(statusData.result.slice(0, 5));
        }
        const profileData = { handle: userData.handle, rating: userData.rating || 0, maxRating: userData.maxRating || 0, rank: userData.rank || 'Unranked', contribution: userData.contribution || 0, lastOnline: new Date(userData.lastOnlineTimeSeconds * 1000).toLocaleDateString(), friendOfCount: userData.friendOfCount || 0, totalSolved: totalSolved };
        setCodeforcesData(profileData);
        await AsyncStorage.setItem("codeforcesData", JSON.stringify(profileData));
        await AsyncStorage.setItem("codeforcesId", id);
      } else {
        setCfError("User not found on Codeforces.");
        setCodeforcesData(null);
      }
    } catch (error) { setCfError("Failed to fetch data. Check connection."); } 
    finally { setLoadingCodeforces(false); }
  };

  const fetchLeetcodeData = async (id: string, isInitialLoad = false) => {
    if (!id.trim()) { setLcError("Please enter a LeetCode username."); return; }
    setLoadingLeetcode(!isInitialLoad);
    setLcError(null);
    try {
      const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${id}`);
      const data = await response.json();
      if (data.status === 'success') {
        const profileData = { username: id, totalSolved: data.totalSolved || 0, easySolved: data.easySolved || 0, mediumSolved: data.mediumSolved || 0, hardSolved: data.hardSolved || 0, acceptanceRate: Math.round(data.acceptanceRate) || 0, ranking: data.ranking || 0, totalQuestions: data.totalQuestions || 0, totalEasy: data.totalEasy || 0, totalMedium: data.totalMedium || 0, totalHard: data.totalHard || 0 };
        setLeetcodeData(profileData);
        await AsyncStorage.setItem("leetcodeData", JSON.stringify(profileData));
        await AsyncStorage.setItem("leetcodeId", id);
      } else {
        setLcError(data.message || "User not found or has no submissions.");
        setLeetcodeData(null);
      }
    } catch (error) { setLcError("Failed to fetch data. API might be down."); } 
    finally { setLoadingLeetcode(false); }
  };

  const handleClearRequest = (platform: 'codeforces' | 'leetcode') => {
    setPlatformToClear(platform);
    setIsModalVisible(true);
  };

  const handleConfirmClear = async () => {
    if (platformToClear === 'codeforces') {
      setCodeforcesId(''); setCodeforcesData(null); setCodeforcesSubmissions([]);
      await AsyncStorage.multiRemove(['codeforcesId', 'codeforcesData']);
    } else if (platformToClear === 'leetcode') {
      setLeetcodeId(''); setLeetcodeData(null);
      await AsyncStorage.multiRemove(['leetcodeId', 'leetcodeData']);
    }
    setIsModalVisible(false);
    setPlatformToClear(null);
  };
  
  useFocusEffect(
    useCallback(() => {
      Animated.timing(animatedValue, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      loadSavedData();
      return () => { animatedValue.setValue(0); progressAnimation.setValue(0); };
    }, [])
  );

  const { translateY, opacity } = {
    translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
    opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  };

  return (
    <View style={styles.container}>
      <ConfirmationModal visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onConfirm={handleConfirmClear} platform={platformToClear} />
      <Animated.View style={[styles.tabContainer, { transform: [{ translateY }], opacity }]}>
        <TouchableOpacity style={[styles.tab, activeTab === 'progress' && styles.activeTab]} onPress={() => setActiveTab('progress')}>
          <MaterialIcons name="assessment" size={18} color={activeTab === 'progress' ? '#17313E' : '#415E72'} /><Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'profiles' && styles.activeTab]} onPress={() => setActiveTab('profiles')}>
          <FontAwesome5 name="laptop-code" size={18} color={activeTab === 'profiles' ? '#17313E' : '#415E72'} /><Text style={[styles.tabText, activeTab === 'profiles' && styles.activeTabText]}>Coding Profile</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'progress' ? (
          <LearningJourneyTab learnedTopics={learnedTopics} progressAnimation={progressAnimation} animatedValue={animatedValue} />
        ) : (
          <>
            <Animated.View style={[styles.header, { transform: [{ translateY }], opacity }]}><Text style={styles.profileHeading}>Coding Profiles</Text></Animated.View>
            <CodeforcesProfileSection id={codeforcesId} setId={setCodeforcesId} data={codeforcesData} submissions={codeforcesSubmissions} error={cfError} loading={loadingCodeforces} onFetch={fetchCodeforcesData} onClear={() => handleClearRequest('codeforces')} animatedValue={animatedValue} />
            <LeetCodeProfileSection id={leetcodeId} setId={setLeetcodeId} data={leetcodeData} error={lcError} loading={loadingLeetcode} onFetch={fetchLeetcodeData} onClear={() => handleClearRequest('leetcode')} animatedValue={animatedValue} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

// --- Styles (No changes) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F4EF' },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 30 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 6, marginHorizontal: 16, marginVertical: 8, elevation: 2, shadowColor: "#17313E", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  activeTab: { backgroundColor: '#F3E2D4' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#415E72' },
  activeTabText: { color: '#17313E' },
  header: { alignItems: 'center', marginBottom: 24, paddingHorizontal: 8 },
  heading: { fontSize: 24, fontWeight: "700", color: "#17313E", textAlign: "center", marginBottom: 6 },
  profileHeading: { fontSize: 24, fontWeight: "700", color: "#17313E", textAlign: "center", marginBottom: 6 },
  progressContainer: { alignItems: 'center', marginBottom: 24 },
  circleWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  progressTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  percentage: { fontSize: 32, fontWeight: "bold", color: "#17313E", marginBottom: 2 },
  completed: { fontSize: 14, color: "#415E72", fontWeight: '500' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 4, shadowColor: "#17313E", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  statIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statContent: { flex: 1 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#17313E", marginBottom: 2 },
  statLabel: { fontSize: 12, color: "#415E72" },
  quoteContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', elevation: 4, shadowColor: "#17313E", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  quoteText: { fontSize: 14, color: "#17313E", textAlign: 'center', lineHeight: 20, marginTop: 6, fontWeight: '500' },
  platformSection: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 4, shadowColor: "#17313E", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  platformHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  platformTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  platformTextContainer: { flex: 1 },
  platformIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  platformName: { fontSize: 16, fontWeight: '700', color: '#17313E' },
  handleText: { fontSize: 12, color: '#1F63A6', marginTop: 2 },
  connectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#F0F9F0', borderRadius: 10 },
  connectedText: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
  inputContainer: { gap: 10, marginTop: 8 },
  textInput: { backgroundColor: '#F8F8F8', borderRadius: 10, padding: 14, fontSize: 14, color: "#17313E", borderWidth: 1, borderColor: '#E8E8E8' },
  connectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#17313E', borderRadius: 10, padding: 14, gap: 6 },
  loadingButton: { opacity: 0.7 },
  connectButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  loadingContainer: { alignItems: 'center', paddingVertical: 30 },
  loadingText: { marginTop: 8, color: '#415E72', fontSize: 12 },
  errorText: { color: '#E74C3C', textAlign: 'center', marginVertical: 16, fontSize: 14, fontWeight: '500' },
  platformData: { gap: 16 },
  mainRatingCard: { backgroundColor: '#F8F9FA', borderRadius: 14, padding: 16, alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#1F63A6' },
  mainStatsCard: { backgroundColor: '#F8F9FA', borderRadius: 14, padding: 16, alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#FFA116' },
  ratingTitle: { fontSize: 12, color: '#415E72', marginBottom: 6 },
  statsTitle: { fontSize: 12, color: '#415E72', marginBottom: 6 },
  ratingValue: { fontSize: 28, fontWeight: 'bold', marginBottom: 2 },
  statsValue: { fontSize: 28, fontWeight: 'bold', color: '#17313E', marginBottom: 2 },
  ratingRank: { fontSize: 14, color: '#415E72', marginBottom: 6, textTransform: 'capitalize' },
  statsSubtitle: { fontSize: 14, color: '#415E72', marginBottom: 6 },
  maxRating: { fontSize: 11, color: '#888', backgroundColor: '#EEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  acceptanceContainer: { alignItems: 'center', marginTop: 6 },
  acceptanceRate: { fontSize: 12, color: '#415E72', fontWeight: '600' },
  ranking: { fontSize: 10, color: '#888', marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', minWidth: '48%', padding: 10, backgroundColor: '#F8F9FA', borderRadius: 8, gap: 6 },
  statItemLabel: { fontSize: 12, color: '#415E72', flex: 1 },
  statValue: { fontSize: 12, fontWeight: 'bold', color: '#17313E' },
  enhancedDifficultyContainer: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12 },
  difficultyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  difficultyTitle: { fontSize: 14, fontWeight: '600', color: '#17313E' },
  difficultyTotal: { fontSize: 12, color: '#415E72' },
  difficultyBarContainer: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: '#E0E0E0', marginBottom: 10 },
  barSegment: { height: '100%' },
  easyBar: { backgroundColor: '#27AE60' },
  mediumBar: { backgroundColor: '#F39C12' },
  hardBar: { backgroundColor: '#E74C3C' },
  difficultyStats: { gap: 6 },
  difficultyStat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  difficultyInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  easyDot: { backgroundColor: '#27AE60' },
  mediumDot: { backgroundColor: '#F39C12' },
  hardDot: { backgroundColor: '#E74C3C' },
  difficultyLabel: { fontSize: 12, color: '#415E72', minWidth: 50 },
  difficultyNumbers: { fontSize: 12, fontWeight: '600', color: '#17313E' },
  leetcodeStats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12 },
  leetcodeStatItem: { alignItems: 'center' },
  leetcodeStatLabel: { fontSize: 11, color: '#415E72', marginBottom: 2 },
  leetcodeStatValue: { fontSize: 16, fontWeight: 'bold' },
  easyStat: { color: '#27AE60' },
  mediumStat: { color: '#F39C12' },
  hardStat: { color: '#E74C3C' },
  subSectionTitle: { fontSize: 14, fontWeight: '600', color: '#17313E', marginTop: 8, marginBottom: 4 },
  submissionContainer: { gap: 6 },
  enhancedSubmissionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 10, borderRadius: 6, gap: 10 },
  submissionContent: { flex: 1 },
  submissionProblem: { fontSize: 12, color: '#34495E', fontWeight: '500', marginBottom: 2 },
  submissionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  submissionTime: { fontSize: 10, color: '#888' },
  submissionVerdict: { fontSize: 10, fontWeight: 'bold' },
  noSubmissionsText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginVertical: 8, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: 'white', borderRadius: 14, padding: 20, width: '100%', maxWidth: 300, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#17313E', marginBottom: 8 },
  modalMessage: { fontSize: 14, color: '#415E72', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#F3E2D4', marginRight: 8 },
  cancelButtonText: { color: '#17313E', fontWeight: 'bold', fontSize: 14 },
  confirmButton: { backgroundColor: '#E74C3C' },
  confirmButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});