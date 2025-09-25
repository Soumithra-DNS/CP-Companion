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

// --- Type Definitions ---

interface CodeforcesProfile { handle: string; rating: number; maxRating: number; rank: string; contribution: number; lastOnline: string; friendOfCount: number; totalSolved: number; }
interface LeetCodeProfile { username: string; totalSolved: number; easySolved: number; mediumSolved: number; hardSolved: number; acceptanceRate: number; ranking: number; totalQuestions: number; totalEasy: number; totalMedium: number; totalHard: number; }
interface GitHubProfile { login: string; name: string; bio: string; public_repos: number; followers: number; following: number; html_url: string; avatar_url: string; }
interface HackerRankProfile { username: string; name: string; level: number; followers_count: number; submission_count: number; badges: any[]; }
interface AtCoderProfile { username: string; rating: number; maxRating: number; rank: number; country: string; affiliation: string; }

// --- Helper Components ---

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

// --- Sectional Components ---

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
      <PlatformHeader platformName="Codeforces" handle={data?.handle} data={data} onClear={onClear} icon={<Text style={styles.atcoderIcon}>C</Text>} iconBg="#000000ff" onTitlePress={() => data && Linking.openURL(`https://codeforces.com/profile/${data.handle}`)} />
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
      <PlatformHeader platformName="LeetCode" handle={data?.username} data={data} onClear={onClear} icon={<Text style={styles.atcoderIcon}>L</Text>} iconBg="#000000ff" onTitlePress={() => data && Linking.openURL(`https://leetcode.com/${data.username}`)} />
      {loading ? <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#000000ff" /><Text style={styles.loadingText}>Fetching data...</Text></View>
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

const GitHubProfileSection = ({ id, setId, data, error, loading, onFetch, onClear, animatedValue }: { id: string; setId: (id: string) => void; data: GitHubProfile | null; error: string | null; loading: boolean; onFetch: (id: string) => void; onClear: () => void; animatedValue: Animated.Value; }) => {
  const { translateY, opacity } = {
    translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
    opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  };

  return (
    <Animated.View style={[styles.platformSection, { transform: [{ translateY }], opacity }]}>
      <PlatformHeader platformName="GitHub" handle={data?.login} data={data} onClear={onClear} icon={<FontAwesome5 name="github" size={16} color="#FFF"/>} iconBg="#333" onTitlePress={() => data && Linking.openURL(data.html_url)} />
      {loading ? <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#333" /><Text style={styles.loadingText}>Fetching data...</Text></View>
        : error ? <Text style={styles.errorText}>{error}</Text>
        : !data ? <PlatformInput id={id} setId={setId} placeholder="GitHub Username" onConnect={() => onFetch(id)} loading={loading} />
        : (
          <View style={styles.platformData}>
            <TouchableOpacity style={[styles.mainStatsCard, { borderLeftColor: '#333' }]} onPress={() => Linking.openURL(data.html_url)}>
              <Text style={styles.statsTitle}>GitHub Profile</Text>
              <Text style={[styles.statsValue, { fontSize: 22 }]}>{data.name || data.login}</Text>
              {data.bio && <Text style={[styles.statsSubtitle, { textAlign: 'center' }]} numberOfLines={2}>{data.bio}</Text>}
            </TouchableOpacity>
            <View style={styles.statsGrid}>
              <StatItem label="Public Repos" value={data.public_repos} icon="code" color="#333" />
              <StatItem label="Followers" value={data.followers} icon="people" color="#333" />
              <StatItem label="Following" value={data.following} icon="group" color="#333" />
            </View>
          </View>
        )}
    </Animated.View>
  );
};

const HackerRankProfileSection = ({ id, setId, data, error, loading, onFetch, onClear, animatedValue }: { id: string; setId: (id: string) => void; data: HackerRankProfile | null; error: string | null; loading: boolean; onFetch: (id: string) => void; onClear: () => void; animatedValue: Animated.Value; }) => {
  const { translateY, opacity } = {
    translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
    opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  };

  return (
    <Animated.View style={[styles.platformSection, { transform: [{ translateY }], opacity }]}>
      <PlatformHeader platformName="HackerRank" handle={data?.username} data={data} onClear={onClear} icon={<FontAwesome5 name="hackerrank" size={16} color="#FFF"/>} iconBg="#000000ff" onTitlePress={() => data && Linking.openURL(`https://www.hackerrank.com/${data.username}`)} />
      {loading ? <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#00EA64" /><Text style={styles.loadingText}>Fetching data...</Text></View>
        : error ? <Text style={styles.errorText}>{error}</Text>
        : !data ? <PlatformInput id={id} setId={setId} placeholder="HackerRank Username" onConnect={() => onFetch(id)} loading={loading} />
        : (
          <View style={styles.platformData}>
            <TouchableOpacity style={[styles.mainStatsCard, { borderLeftColor: '#000000ff' }]} onPress={() => Linking.openURL(`https://www.hackerrank.com/${data.username}`)}>
              <Text style={styles.statsTitle}>HackerRank Profile</Text>
              <Text style={[styles.statsValue, { fontSize: 22 }]}>{data.name || data.username}</Text>
              <Text style={styles.statsSubtitle}>Level {data.level}</Text>
            </TouchableOpacity>
            <View style={styles.statsGrid}>
              <StatItem label="Submissions" value={data.submission_count} icon="send" color="#000000ff" />
              <StatItem label="Followers" value={data.followers_count} icon="people" color="#000000ff" />
              <StatItem label="Badges" value={data.badges?.length || 0} icon="workspace-premium" color="#000000ff" />
            </View>
          </View>
        )}
    </Animated.View>
  );
};

const AtCoderProfileSection = ({ id, setId, data, error, loading, onFetch, onClear, animatedValue }: { id: string; setId: (id: string) => void; data: AtCoderProfile | null; error: string | null; loading: boolean; onFetch: (id: string) => void; onClear: () => void; animatedValue: Animated.Value; }) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 2800) return '#FF0000'; // Red
    if (rating >= 2400) return '#FF8C00'; // Orange
    if (rating >= 2000) return '#FFFF00'; // Yellow
    if (rating >= 1600) return '#0000FF'; // Blue
    if (rating >= 1200) return '#00FFFF'; // Cyan
    if (rating >= 800) return '#008000'; // Green
    if (rating >= 400) return '#A52A2A'; // Brown
    return '#000000ff'; // Gray
  };

  const { translateY, opacity } = {
    translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
    opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  };

  return (
    <Animated.View style={[styles.platformSection, { transform: [{ translateY }], opacity }]}>
      <PlatformHeader platformName="AtCoder" handle={data?.username} data={data} onClear={onClear} icon={<Text style={styles.atcoderIcon}>A</Text>} iconBg="#222222" onTitlePress={() => data && Linking.openURL(`https://atcoder.jp/users/${data.username}`)} />
      {loading ? <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#565656" /><Text style={styles.loadingText}>Fetching data...</Text></View>
        : error ? <Text style={styles.errorText}>{error}</Text>
        : !data ? <PlatformInput id={id} setId={setId} placeholder="AtCoder Username" onConnect={() => onFetch(id)} loading={loading} />
        : (
          <View style={styles.platformData}>
            <TouchableOpacity style={[styles.mainRatingCard, { borderLeftColor: '#565656' }]} onPress={() => Linking.openURL(`https://atcoder.jp/users/${data.username}`)}>
              <Text style={styles.ratingTitle}>Current Rating</Text>
              <Text style={[styles.ratingValue, { color: getRatingColor(data.rating) }]}>{data.rating}</Text>
              <Text style={styles.ratingRank}>Rank: #{data.rank}</Text>
              <Text style={styles.maxRating}>Max: {data.maxRating}</Text>
            </TouchableOpacity>
            <View style={styles.statsGrid}>
              <StatItem label="Country" value={data.country || 'N/A'} icon="location-on" color="#565656" />
              <StatItem label="Affiliation" value={data.affiliation || 'N/A'} icon="business" color="#565656" />
            </View>
          </View>
        )}
    </Animated.View>
  );
};

// --- Main Page Component ---

export default function ProgressPage() {
  const [learnedTopics, setLearnedTopics] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));
  const [progressAnimation] = useState(new Animated.Value(0));
  
  // Platform states
  const [codeforcesId, setCodeforcesId] = useState('');
  const [leetcodeId, setLeetcodeId] = useState('');
  const [githubId, setGithubId] = useState('');
  const [hackerrankId, setHackerrankId] = useState('');
  const [atcoderId, setAtcoderId] = useState('');
  
  const [codeforcesData, setCodeforcesData] = useState<CodeforcesProfile | null>(null);
  const [codeforcesSubmissions, setCodeforcesSubmissions] = useState<any[]>([]);
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeProfile | null>(null);
  const [githubData, setGithubData] = useState<GitHubProfile | null>(null);
  const [hackerrankData, setHackerrankData] = useState<HackerRankProfile | null>(null);
  const [atcoderData, setAtcoderData] = useState<AtCoderProfile | null>(null);
  
  const [loadingCodeforces, setLoadingCodeforces] = useState(false);
  const [loadingLeetcode, setLoadingLeetcode] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingHackerrank, setLoadingHackerrank] = useState(false);
  const [loadingAtcoder, setLoadingAtcoder] = useState(false);
  
  const [cfError, setCfError] = useState<string | null>(null);
  const [lcError, setLcError] = useState<string | null>(null);
  const [ghError, setGhError] = useState<string | null>(null);
  const [hrError, setHrError] = useState<string | null>(null);
  const [acError, setAcError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('progress');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [platformToClear, setPlatformToClear] = useState<'codeforces' | 'leetcode' | 'github' | 'hackerrank' | 'atcoder' | null>(null);

  useFocusEffect(
    useCallback(() => {
        const loadAndAnimate = async () => {
            await loadSavedData();
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        };
        loadAndAnimate();

        return () => {
            animatedValue.setValue(0);
            progressAnimation.setValue(0);
        };
    }, [])
  );

  const loadSavedData = async () => {
    try {
      const savedLearned = await AsyncStorage.getItem("learnedTopics");
      const topics = savedLearned ? parseInt(savedLearned, 10) : 0;
      setLearnedTopics(topics);

      const loadAndFetchPlatform = async (platform: string, fetchFunction: (id: string, isInitial: boolean) => void, setIdFunction: (id: string) => void) => {
        const id = await AsyncStorage.getItem(`${platform}Id`);
        if (id) {
          setIdFunction(id);
          fetchFunction(id, true);
        }
      };

      await Promise.all([
        loadAndFetchPlatform('codeforces', fetchCodeforcesData, setCodeforcesId),
        loadAndFetchPlatform('leetcode', fetchLeetcodeData, setLeetcodeId),
        loadAndFetchPlatform('github', fetchGitHubData, setGithubId),
        loadAndFetchPlatform('hackerrank', fetchHackerRankData, setHackerrankId),
        loadAndFetchPlatform('atcoder', fetchAtCoderData, setAtcoderId),
      ]);

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
        await AsyncStorage.setItem("leetcodeId", id);
      } else {
        setLcError(data.message || "User not found or has no submissions.");
        setLeetcodeData(null);
      }
    } catch (error) { setLcError("Failed to fetch data. API might be down."); } 
    finally { setLoadingLeetcode(false); }
  };

  const fetchGitHubData = async (id: string, isInitialLoad = false) => {
    if (!id.trim()) { setGhError("Please enter a GitHub username."); return; }
    setLoadingGithub(!isInitialLoad);
    setGhError(null);
    try {
      const response = await fetch(`https://api.github.com/users/${id}`);
      const data = await response.json();
      if (data.message === "Not Found") {
        setGhError("User not found on GitHub.");
        setGithubData(null);
      } else {
        setGithubData(data);
        await AsyncStorage.setItem("githubId", id);
      }
    } catch (error) { setGhError("Failed to fetch data. Check connection."); } 
    finally { setLoadingGithub(false); }
  };

  const fetchHackerRankData = async (id: string, isInitialLoad = false) => {
    if (!id.trim()) { setHrError("Please enter a HackerRank username."); return; }
    setLoadingHackerrank(!isInitialLoad);
    setHrError(null);
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const profileData = { username: id, name: `User ${id}`, level: 5, followers_count: 123, submission_count: 456, badges: new Array(5) };
        setHackerrankData(profileData);
        await AsyncStorage.setItem("hackerrankId", id);
        // Note: Using placeholder data as official API access is restricted.
    } catch (error) { 
        setHrError("Failed to fetch data."); 
    } finally { 
        setLoadingHackerrank(false); 
    }
  };
  
  const fetchAtCoderData = async (id: string, isInitialLoad = false) => {
    if (!id.trim()) { setAcError("Please enter an AtCoder username."); return; }
    setLoadingAtcoder(!isInitialLoad);
    setAcError(null);
    try {
      // Using placeholder data as there's no simple public API.
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (id.toLowerCase() === 'notfound') {
          throw new Error("User not found");
      }
      
      const rating = Math.floor(Math.random() * 2800) + 200;
      const profileData: AtCoderProfile = {
        username: id,
        rating: rating,
        maxRating: rating + Math.floor(Math.random() * 200),
        rank: Math.floor(Math.random() * 5000) + 1,
        country: "Japan",
        affiliation: "University of Tokyo",
      };
      setAtcoderData(profileData);
      await AsyncStorage.setItem("atcoderId", id);
    } catch (error) {
      setAcError("User not found or failed to fetch data.");
      setAtcoderData(null);
    } finally {
      setLoadingAtcoder(false);
    }
  };

  const clearPlatformData = async (platform: 'codeforces' | 'leetcode' | 'github' | 'hackerrank' | 'atcoder') => {
    try {
        await AsyncStorage.removeItem(`${platform}Id`);
        switch(platform) {
            case 'codeforces': setCodeforcesData(null); setCodeforcesId(''); break;
            case 'leetcode': setLeetcodeData(null); setLeetcodeId(''); break;
            case 'github': setGithubData(null); setGithubId(''); break;
            case 'hackerrank': setHackerrankData(null); setHackerrankId(''); break;
            case 'atcoder': setAtcoderData(null); setAtcoderId(''); break;
        }
    } catch (error) {
        console.error(`Failed to clear ${platform} data:`, error);
    }
  };

  const handleConfirmClear = () => {
    if (platformToClear) {
        clearPlatformData(platformToClear);
    }
    setIsModalVisible(false);
    setPlatformToClear(null);
  };
  
  const openClearModal = (platform: 'codeforces' | 'leetcode' | 'github' | 'hackerrank' | 'atcoder') => {
      setPlatformToClear(platform);
      setIsModalVisible(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerContainer}>
            <Text style={styles.title}>Progress Tracker</Text>
        </View>

        <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, activeTab === 'progress' && styles.activeTab]} onPress={() => setActiveTab('progress')}>
                <MaterialIcons name="trending-up" size={16} color={activeTab === 'progress' ? '#FFF' : '#17313E'} />
                <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>Journey</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'profiles' && styles.activeTab]} onPress={() => setActiveTab('profiles')}>
                <MaterialIcons name="link" size={16} color={activeTab === 'profiles' ? '#FFF' : '#17313E'} />
                <Text style={[styles.tabText, activeTab === 'profiles' && styles.activeTabText]}>Profiles</Text>
            </TouchableOpacity>
        </View>

        {activeTab === 'progress' ? (
            <LearningJourneyTab learnedTopics={learnedTopics} progressAnimation={progressAnimation} animatedValue={animatedValue} />
        ) : (
            <>
              <CodeforcesProfileSection id={codeforcesId} setId={setCodeforcesId} data={codeforcesData} submissions={codeforcesSubmissions} error={cfError} loading={loadingCodeforces} onFetch={fetchCodeforcesData} onClear={() => openClearModal('codeforces')} animatedValue={animatedValue} />
              <LeetCodeProfileSection id={leetcodeId} setId={setLeetcodeId} data={leetcodeData} error={lcError} loading={loadingLeetcode} onFetch={fetchLeetcodeData} onClear={() => openClearModal('leetcode')} animatedValue={animatedValue} />
              <AtCoderProfileSection id={atcoderId} setId={setAtcoderId} data={atcoderData} error={acError} loading={loadingAtcoder} onFetch={fetchAtCoderData} onClear={() => openClearModal('atcoder')} animatedValue={animatedValue} />
              <GitHubProfileSection id={githubId} setId={setGithubId} data={githubData} error={ghError} loading={loadingGithub} onFetch={fetchGitHubData} onClear={() => openClearModal('github')} animatedValue={animatedValue} />
              <HackerRankProfileSection id={hackerrankId} setId={setHackerrankId} data={hackerrankData} error={hrError} loading={loadingHackerrank} onFetch={fetchHackerRankData} onClear={() => openClearModal('hackerrank')} animatedValue={animatedValue} />
            </>
        )}

        <ConfirmationModal visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onConfirm={handleConfirmClear} platform={platformToClear} />
    </ScrollView>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F2' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  headerContainer: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#17313E', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#415E72', marginTop: 4, textAlign: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#E8D5C4', borderRadius: 25, padding: 5, marginBottom: 20, alignSelf: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  activeTab: { backgroundColor: '#17313E' },
  tabText: { fontWeight: '600', color: '#17313E', marginLeft: 6 },
  activeTabText: { color: '#FFF' },
  header: { marginBottom: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#17313E' },
  progressContainer: { alignItems: 'center', marginVertical: 20 },
  circleWrapper: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  progressTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  percentage: { fontSize: 42, fontWeight: 'bold', color: '#17313E' },
  completed: { fontSize: 14, color: '#415E72', marginTop: -5 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginHorizontal: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  statIcon: { padding: 8, borderRadius: 8, marginRight: 10 },
  statContent: {},
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#17313E' },
  statLabel: { fontSize: 12, color: '#415E72' },
  quoteContainer: { backgroundColor: '#E8D5C4', padding: 15, borderRadius: 12, marginTop: 10 },
  quoteText: { fontSize: 14, color: '#415E72', fontStyle: 'italic', textAlign: 'center' },
  platformSection: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 3 },
  platformHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  platformTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  platformIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  platformTextContainer: {},
  platformName: { fontSize: 18, fontWeight: 'bold', color: '#17313E' },
  handleText: { fontSize: 12, color: '#666' },
  connectedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  connectedText: { color: '#4CAF50', fontSize: 12, marginLeft: 4, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  textInput: { flex: 1, height: 44, borderColor: '#DDD', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#F8F9FA', color: '#333' },
  connectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#17313E', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  loadingButton: { backgroundColor: '#999' },
  connectButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 6 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: { marginLeft: 8, color: '#666' },
  errorText: { color: '#E74C3C', textAlign: 'center', marginTop: 10 },
  platformData: {},
  mainRatingCard: { backgroundColor: '#F8F9FA', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#1F63A6' },
  ratingTitle: { fontSize: 14, color: '#666' },
  ratingValue: { fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
  ratingRank: { fontSize: 16, fontWeight: '600', color: '#444' },
  maxRating: { fontSize: 12, color: '#888', marginTop: 4 },
  mainStatsCard: { backgroundColor: '#F8F9FA', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#FFA116' },
  statsTitle: { fontSize: 14, color: '#666' },
  statsValue: { fontSize: 36, fontWeight: 'bold', color: '#17313E', marginVertical: 4 },
  statsSubtitle: { fontSize: 16, fontWeight: '600', color: '#444' },
  acceptanceContainer: { flexDirection: 'row', marginTop: 8 },
  acceptanceRate: { fontSize: 12, color: '#007BFF', marginRight: 16 },
  ranking: { fontSize: 12, color: '#28A745' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 8, padding: 10, width: '48%', marginBottom: 10 },
  statItemLabel: { fontSize: 12, color: '#666', marginLeft: 6, flex: 1 },
  statValue: { fontSize: 14, fontWeight: 'bold' },
  subSectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
  submissionContainer: {},
  noSubmissionsText: { color: '#888', textAlign: 'center', padding: 10 },
  enhancedSubmissionItem: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, marginBottom: 8 },
  submissionContent: {},
  submissionProblem: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 6 },
  submissionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  submissionTime: { fontSize: 12, color: '#777' },
  submissionVerdict: { fontSize: 12, fontWeight: 'bold' },
  enhancedDifficultyContainer: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, marginBottom: 12 },
  difficultyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  difficultyTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  difficultyTotal: { fontSize: 14, fontWeight: 'bold', color: '#17313E' },
  difficultyBarContainer: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: '#E0E0E0', marginBottom: 12 },
  barSegment: { height: '100%' },
  easyBar: { backgroundColor: '#27AE60' },
  mediumBar: { backgroundColor: '#F39C12' },
  hardBar: { backgroundColor: '#E74C3C' },
  difficultyStats: { flexDirection: 'row', justifyContent: 'space-between' },
  difficultyStat: { flex: 1, alignItems: 'center' },
  difficultyInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  easyDot: { backgroundColor: '#27AE60' },
  mediumDot: { backgroundColor: '#F39C12' },
  hardDot: { backgroundColor: '#E74C3C' },
  difficultyLabel: { fontSize: 12, color: '#666' },
  difficultyNumbers: { fontSize: 14, fontWeight: '600', color: '#333' },
  leetcodeStats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#F8F9FA', padding: 12, borderRadius: 12 },
  leetcodeStatItem: { alignItems: 'center' },
  leetcodeStatLabel: { fontSize: 12, color: '#666' },
  leetcodeStatValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  easyStat: { color: '#000000ff' },
  mediumStat: { color: '#000000ff' },
  hardStat: { color: '#000000ff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#FFF', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#17313E', marginBottom: 8 },
  modalMessage: { fontSize: 14, color: '#415E72', textAlign: 'center', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#E8D5C4', marginRight: 10 },
  cancelButtonText: { color: '#415E72', fontWeight: 'bold' },
  confirmButton: { backgroundColor: '#E74C3C' },
  confirmButtonText: { color: '#FFF', fontWeight: 'bold' },
  atcoderIcon: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});