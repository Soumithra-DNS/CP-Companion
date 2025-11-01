import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Circle, Svg } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';
const IS_MOBILE = SCREEN_WIDTH < 768;

const COLORS = {
  background: "#F3E2D4",
  primary: "#C5B0CD",
  secondary: "#415E72",
  textDark: "#17313E",
  accent: "#A78FAF",
  white: "#FFFFFF",
  lightCream: "#FAF5F0",
  mediumCream: "#E8D5C4",
  darkCream: "#D4C1A8",
  translucentPrimary: "rgba(197,176,205,0.3)",
  translucentSecondary: "rgba(65,94,114,0.1)",
  cardBg: "rgba(255,255,255,0.7)",
  borderColor: "rgba(197,176,205,0.4)",
  algoTextLight: "rgba(23,49,62,0.8)",
  shadow: "rgba(23,49,62,0.15)",
};

type CodeforcesProfile = {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  contribution: number;
  lastOnline: string;
  friendOfCount: number;
  totalSolved: number;
};

type LeetCodeProfile = {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number;
  totalQuestions: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
};

type GitHubProfile = {
  login: string;
  name?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  avatar_url?: string;
};

type HackerRankProfile = {
  username: string;
  name?: string;
  level: number;
  followers_count: number;
  submission_count: number;
  badges?: any[];
};

type AtCoderProfile = {
  username: string;
  rating: number;
  maxRating: number;
  rank: number;
  country?: string;
  affiliation?: string;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ---------- Small presentational helpers ---------- */

const StatItem = ({ label, value, icon, color }: { label: string; value: string | number; icon?: string; color?: string }) => (
  <View style={styles.statItem}>
    {icon && <MaterialIcons name={icon as any} size={16} color={color || COLORS.secondary} />}
    <Text style={styles.statItemLabel}>{label}</Text>
    <Text style={[styles.statValue, { color: color || COLORS.textDark }]}>{value}</Text>
  </View>
);

const EnhancedLeetCodeBars = ({ easy, medium, hard, total }: { easy: number; medium: number; hard: number; total: number }) => {
  const safeTotal = total || 1;
  const easyPct = Math.round((easy / safeTotal) * 100);
  const mediumPct = Math.round((medium / safeTotal) * 100);
  const hardPct = Math.round((hard / safeTotal) * 100);

  return (
    <View style={styles.enhancedDifficultyContainer}>
      <View style={styles.difficultyHeader}>
        <Text style={styles.difficultyTitle}>Problem Distribution</Text>
        <Text style={styles.difficultyTotal}>{total}</Text>
      </View>

      <View style={styles.difficultyBarContainer}>
        <View style={[styles.barSegment, styles.easyBar, { width: `${easyPct}%` }]} />
        <View style={[styles.barSegment, styles.mediumBar, { width: `${mediumPct}%` }]} />
        <View style={[styles.barSegment, styles.hardBar, { width: `${hardPct}%` }]} />
      </View>

      <View style={styles.difficultyStats}>
        <View style={styles.difficultyStat}>
          <View style={styles.difficultyInfo}>
            <View style={[styles.legendDot, styles.easyDot]} />
            <Text style={styles.difficultyLabel}>Easy</Text>
          </View>
          <Text style={styles.difficultyNumbers}>{easyPct}%</Text>
        </View>

        <View style={styles.difficultyStat}>
          <View style={styles.difficultyInfo}>
            <View style={[styles.legendDot, styles.mediumDot]} />
            <Text style={styles.difficultyLabel}>Medium</Text>
          </View>
          <Text style={styles.difficultyNumbers}>{mediumPct}%</Text>
        </View>

        <View style={styles.difficultyStat}>
          <View style={styles.difficultyInfo}>
            <View style={[styles.legendDot, styles.hardDot]} />
            <Text style={styles.difficultyLabel}>Hard</Text>
          </View>
          <Text style={styles.difficultyNumbers}>{hardPct}%</Text>
        </View>
      </View>
    </View>
  );
};

const normalizeVerdict = (raw?: any) => {
  const v = String(raw ?? "").toUpperCase().trim();
  if (v === "OK" || v === "AC") return "AC";
  if (v.includes("WRONG") || v.includes("WRONG_ANSWER") || v.includes("WRONG-ANSWER")) return "WA";
  return v || "N/A";
};

const EnhancedSubmissionItem = ({ submission, platform }: { submission: any; platform: string }) => {
  const title = platform === "codeforces" ? submission.problem?.name ?? "Unknown" : submission.title ?? "Unknown";
  const rawVerdict = submission.verdict ?? "";
  const verdict = normalizeVerdict(rawVerdict);

  const verdictColor = (v: string) => {
    if (v === "AC") return "#27AE60";
    if (/WA/i.test(v)) return "#E74C3C";
    if (/TIME|TLE/i.test(v)) return "#F39C12";
    if (/RUNTIME|RE/i.test(v)) return "#9B59B6";
    return "#95A5A6";
  };

  const openSubmission = () => {
    if (platform === "codeforces" && submission.contestId && submission.id) {
      Linking.openURL(`https://codeforces.com/contest/${submission.contestId}/submission/${submission.id}`).catch(() => {});
    }
  };

  return (
    <TouchableOpacity style={styles.enhancedSubmissionItem} onPress={openSubmission}>
      <View style={styles.submissionContent}>
        <Text style={styles.submissionProblem} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.submissionMeta}>
          <Text style={styles.submissionTime}>
            {submission.creationTimeSeconds ? new Date(submission.creationTimeSeconds * 1000).toLocaleDateString() : "Unknown date"}
          </Text>
          <Text style={[styles.submissionVerdict, { color: verdictColor(verdict) }]}>{verdict}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ---------- Progress Stats Component ---------- */

const ProgressStatsBox = ({ learnedTopics }: { learnedTopics: number }) => {
  const totalTopics = 15;
  const percentage = Math.round((learnedTopics / totalTopics) * 100);

  return (
    <View style={styles.progressStatsContainer}>
      <View style={styles.progressStatsBox}>
        <View style={styles.progressStatItem}>
          <Text style={styles.progressStatNumber}>{learnedTopics}</Text>
          <Text style={styles.progressStatLabel}>Completed Topics</Text>
        </View>
        <View style={styles.progressStatDivider} />
        <View style={styles.progressStatItem}>
          <Text style={styles.progressStatNumber}>{totalTopics}</Text>
          <Text style={styles.progressStatLabel}>Total Topics</Text>
        </View>
      </View>
    </View>
  );
};

/* ---------- Reusable platform components ---------- */

const PlatformHeader = ({
  platformName,
  handle,
  data,
  onClear,
  icon,
  iconBg,
  onTitlePress,
}: {
  platformName: string;
  handle?: string | null;
  data?: any;
  onClear: () => void;
  icon: React.ReactNode;
  iconBg: string;
  onTitlePress: () => void;
}) => (
  <View style={styles.platformHeader}>
    <TouchableOpacity style={styles.platformTitleContainer} onPress={onTitlePress} disabled={!data}>
      <View style={[styles.platformIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.platformTextContainer}>
        <Text style={styles.platformName}>{platformName}</Text>
        {handle ? <Text style={styles.handleText}>@{handle}</Text> : null}
      </View>
    </TouchableOpacity>

    {data ? (
      <TouchableOpacity style={styles.connectedBadge} onPress={onClear}>
        <MaterialIcons name="check-circle" size={14} color="#4CAF50" />
        <Text style={styles.connectedText}>Connected</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const PlatformInput = ({ id, setId, placeholder, onConnect, loading }: { id: string; setId: (v: string) => void; placeholder: string; onConnect: () => void; loading: boolean }) => (
  <View style={styles.inputContainer}>
    <TextInput style={styles.textInput} placeholder={placeholder} value={id} onChangeText={setId} placeholderTextColor="#999" autoCapitalize="none" />
    <TouchableOpacity style={[styles.connectButton, loading && styles.loadingButton]} onPress={onConnect} disabled={loading}>
      {loading ? <ActivityIndicator size="small" color="#FFF" /> : <><MaterialIcons name="link" size={16} color="#FFF" /><Text style={styles.connectButtonText}>Connect</Text></>}
    </TouchableOpacity>
  </View>
);

const ConfirmationModal = ({ visible, onCancel, onConfirm, platform }: { visible: boolean; onCancel: () => void; onConfirm: () => void; platform: string | null }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Disconnect {platform}?</Text>
        <Text style={styles.modalMessage}>Your data will be cleared from this app.</Text>
        <View style={styles.modalActions}>
          <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

/* ---------- Main page ---------- */

export default function ProgressPage() {
  const [learnedTopics, setLearnedTopics] = useState<number>(0);
  const [animatedValue] = useState(new Animated.Value(0));
  const [progressAnimation] = useState(new Animated.Value(0));

  // platform ids & data
  const [codeforcesId, setCodeforcesId] = useState("");
  const [leetcodeId, setLeetcodeId] = useState("");
  const [githubId, setGithubId] = useState("");
  const [hackerrankId, setHackerrankId] = useState("");
  const [atcoderId, setAtcoderId] = useState("");

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

  const [activeTab, setActiveTab] = useState<"progress" | "profiles">("progress");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [platformToClear, setPlatformToClear] = useState<null | string>(null);

  useFocusEffect(
    useCallback(() => {
      const loadAndAnimate = async () => {
        await loadSavedData();
        Animated.timing(animatedValue, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
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

      const tryLoad = async (key: string, fetcher: (id: string, init?: boolean) => void, setter: (v: string) => void) => {
        const id = await AsyncStorage.getItem(key);
        if (id) {
          setter(id);
          fetcher(id, true);
        }
      };

      await Promise.all([
        tryLoad("codeforcesId", fetchCodeforcesData, setCodeforcesId),
        tryLoad("leetcodeId", fetchLeetcodeData, setLeetcodeId),
        tryLoad("githubId", fetchGitHubData, setGithubId),
        tryLoad("hackerrankId", fetchHackerRankData, setHackerrankId),
        tryLoad("atcoderId", fetchAtCoderData, setAtcoderId),
      ]);

      Animated.timing(progressAnimation, { toValue: Math.min(1, topics / 15), duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    } catch (err) {
      console.error("Failed to load saved data", err);
    }
  };

  /* ---------- Fetchers (clean, with basic error handling) ---------- */

  const fetchCodeforcesData = async (id: string, isInitialLoad = false) => {
    if (!id.trim()) {
      setCfError("Please enter a Codeforces handle.");
      return;
    }
    setLoadingCodeforces(!isInitialLoad);
    setCfError(null);
    try {
      const [infoResp, statusResp] = await Promise.all([
        fetch(`https://codeforces.com/api/user.info?handles=${id}`),
        fetch(`https://codeforces.com/api/user.status?handle=${id}`),
      ]);
      const info = await infoResp.json();
      const status = await statusResp.json();

      if (info.status === "OK" && info.result.length > 0) {
        const u = info.result[0];
        const solvedSet = new Set<string>();
        if (status.status === "OK" && Array.isArray(status.result)) {
          status.result.forEach((s: any) => {
            const n = normalizeVerdict(s.verdict);
            if (n === "AC" && s.problem) {
              solvedSet.add(`${s.problem.contestId}-${s.problem.index}`);
            }
          });
          setCodeforcesSubmissions(status.result.slice(0, 5));
        }
        const profile: CodeforcesProfile = {
          handle: u.handle,
          rating: u.rating || 0,
          maxRating: u.maxRating || 0,
          rank: u.rank || "Unranked",
          contribution: u.contribution || 0,
          lastOnline: new Date((u.lastOnlineTimeSeconds || 0) * 1000).toLocaleDateString(),
          friendOfCount: u.friendOfCount || 0,
          totalSolved: solvedSet.size,
        };
        setCodeforcesData(profile);
        await AsyncStorage.setItem("codeforcesId", id);
      } else {
        setCfError("User not found on Codeforces.");
        setCodeforcesData(null);
      }
    } catch (e) {
      setCfError("Failed to fetch data. Check connection.");
    } finally {
      setLoadingCodeforces(false);
    }
  };

  const fetchLeetcodeData = async (id: string, isInitialLoad = false) => {
    if (!id.trim()) {
      setLcError("Please enter a LeetCode username.");
      return;
    }
    setLoadingLeetcode(!isInitialLoad);
    setLcError(null);
    try {
      const resp = await fetch(`https://leetcode-stats-api.herokuapp.com/${id}`);
      const data = await resp.json();
      if (data.status === "success") {
        const profile: LeetCodeProfile = {
          username: id,
          totalSolved: data.totalSolved || 0,
          easySolved: data.easySolved || 0,
          mediumSolved: data.mediumSolved || 0,
          hardSolved: data.hardSolved || 0,
          acceptanceRate: Math.round(data.acceptanceRate) || 0,
          ranking: data.ranking || 0,
          totalQuestions: data.totalQuestions || 0,
          totalEasy: data.totalEasy || 0,
          totalMedium: data.totalMedium || 0,
          totalHard: data.totalHard || 0,
        };
        setLeetcodeData(profile);
        await AsyncStorage.setItem("leetcodeId", id);
      } else {
        setLcError(data.message || "User not found or has no submissions.");
        setLeetcodeData(null);
      }
    } catch (e) {
      setLcError("Failed to fetch data. API might be down.");
    } finally {
      setLoadingLeetcode(false);
    }
  };

  const fetchGitHubData = async (id: string, isInitialLoad = false) => {
    if (!id.trim()) {
      setGhError("Please enter a GitHub username.");
      return;
    }
    setLoadingGithub(!isInitialLoad);
    setGhError(null);
    try {
      const resp = await fetch(`https://api.github.com/users/${id}`);
      const data = await resp.json();
      if (data.message === "Not Found") {
        setGhError("User not found on GitHub.");
        setGithubData(null);
      } else {
        setGithubData(data);
        await AsyncStorage.setItem("githubId", id);
      }
    } catch (e) {
      setGhError("Failed to fetch data. Check connection.");
    } finally {
      setLoadingGithub(false);
    }
  };

  const fetchHackerRankData = async (id: string, isInitialLoad = false) => {
    if (!id.trim()) {
      setHrError("Please enter a HackerRank username.");
      return;
    }
    setLoadingHackerrank(!isInitialLoad);
    setHrError(null);
    try {
      // Placeholder data (official API not available)
      await new Promise((r) => setTimeout(r, 800));
      const profile: HackerRankProfile = {
        username: id,
        name: `User ${id}`,
        level: 5,
        followers_count: 123,
        submission_count: 456,
        badges: new Array(5),
      };
      setHackerrankData(profile);
      await AsyncStorage.setItem("hackerrankId", id);
    } catch {
      setHrError("Failed to fetch data.");
    } finally {
      setLoadingHackerrank(false);
    }
  };

  const fetchAtCoderData = async (id: string, isInitialLoad = false) => {
    if (!id.trim()) {
      setAcError("Please enter an AtCoder username.");
      return;
    }
    setLoadingAtcoder(!isInitialLoad);
    setAcError(null);
    try {
      await new Promise((r) => setTimeout(r, 800));
      if (id.toLowerCase() === "notfound") throw new Error("Not found");
      const rating = Math.floor(Math.random() * 2600) + 200;
      const profile: AtCoderProfile = {
        username: id,
        rating,
        maxRating: rating + Math.floor(Math.random() * 200),
        rank: Math.floor(Math.random() * 5000) + 1,
        country: "Japan",
        affiliation: "University",
      };
      setAtcoderData(profile);
      await AsyncStorage.setItem("atcoderId", id);
    } catch {
      setAcError("User not found or failed to fetch data.");
      setAtcoderData(null);
    } finally {
      setLoadingAtcoder(false);
    }
  };

  const clearPlatformData = async (platform: string) => {
    try {
      await AsyncStorage.removeItem(`${platform}Id`);
      switch (platform) {
        case "codeforces":
          setCodeforcesData(null);
          setCodeforcesId("");
          break;
        case "leetcode":
          setLeetcodeData(null);
          setLeetcodeId("");
          break;
        case "github":
          setGithubData(null);
          setGithubId("");
          break;
        case "hackerrank":
          setHackerrankData(null);
          setHackerrankId("");
          break;
        case "atcoder":
          setAtcoderData(null);
          setAtcoderId("");
          break;
      }
    } catch (e) {
      console.error("Failed to clear platform data", e);
    }
  };

  const handleConfirmClear = () => {
    if (platformToClear) clearPlatformData(platformToClear);
    setIsModalVisible(false);
    setPlatformToClear(null);
  };

  const openClearModal = (platform: string) => {
    setPlatformToClear(platform);
    setIsModalVisible(true);
  };

  /* ---------- Render ---------- */

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={[styles.container, IS_WEB && styles.webContainer]}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>
              <Text style={{ color: COLORS.textDark }}>Progress</Text>
              <Text style={{ color: COLORS.secondary }}> Tracker</Text>
            </Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === "progress" && styles.activeTab]} onPress={() => setActiveTab("progress")}>
            <MaterialIcons name="trending-up" size={16} color={activeTab === "progress" ? "#FFF" : COLORS.textDark} />
            <Text style={[styles.tabText, activeTab === "progress" && styles.activeTabText]}>Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, activeTab === "profiles" && styles.activeTab]} onPress={() => setActiveTab("profiles")}>
            <MaterialIcons name="link" size={16} color={activeTab === "profiles" ? "#FFF" : COLORS.textDark} />
            <Text style={[styles.tabText, activeTab === "profiles" && styles.activeTabText]}>Profiles</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[
            styles.contentContainer, 
            IS_WEB && styles.webContentContainer
          ]}
        >
          {activeTab === "progress" ? (
            <>
              <Animated.View style={[styles.header, { transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }], opacity: animatedValue }]}>
                <Text style={styles.heading}>Learning Journey</Text>
              </Animated.View>

              <Animated.View style={[styles.progressContainer, { opacity: animatedValue }]}>
                <View style={styles.circleWrapper}>
                  <Svg width={200} height={200} viewBox="0 0 200 200">
                    <Circle cx="100" cy="100" r={80} stroke={COLORS.mediumCream} strokeWidth="12" fill="none" />
                    <AnimatedCircle
                      cx="100"
                      cy="100"
                      r={80}
                      stroke={COLORS.textDark}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 80}
                      strokeDashoffset={progressAnimation.interpolate({ inputRange: [0, 1], outputRange: [2 * Math.PI * 80, 0] })}
                      strokeLinecap="round"
                      rotation="-90"
                      origin="100, 100"
                    />
                  </Svg>

                  <View style={styles.progressTextContainer}>
                    <Text style={styles.percentage}>{Math.round((learnedTopics / 15) * 100)}%</Text>
                    <Text style={styles.completed}>Complete</Text>
                  </View>
                </View>
              </Animated.View>

              {/* Progress Stats Box - NEW ADDITION */}
              <ProgressStatsBox learnedTopics={learnedTopics} />
            </>
          ) : (
            <View style={IS_WEB ? styles.webProfilesContainer : {}}>
              {/* Profiles sections */}
              <View style={styles.platformSection}>
                <PlatformHeader platformName="Codeforces" handle={codeforcesData?.handle} data={codeforcesData} onClear={() => openClearModal("codeforces")} icon={<Text style={styles.atcoderIcon}>C</Text>} iconBg="#000" onTitlePress={() => codeforcesData && Linking.openURL(`https://codeforces.com/profile/${codeforcesData.handle}`)} />
                {loadingCodeforces ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#1F63A6" />
                    <Text style={styles.loadingText}>Fetching data...</Text>
                  </View>
                ) : cfError ? (
                  <Text style={styles.errorText}>{cfError}</Text>
                ) : !codeforcesData ? (
                  <PlatformInput id={codeforcesId} setId={setCodeforcesId} placeholder="Codeforces Handle" onConnect={() => fetchCodeforcesData(codeforcesId)} loading={loadingCodeforces} />
                ) : (
                  <>
                    <View style={styles.mainRatingCard}>
                      <Text style={styles.ratingTitle}>Current Rating</Text>
                      <Text style={[styles.ratingValue, { color: "#1F63A6" }]}>{codeforcesData.rating}</Text>
                      <Text style={styles.ratingRank}>{codeforcesData.rank}</Text>
                      <Text style={styles.maxRating}>Max: {codeforcesData.maxRating}</Text>
                    </View>
                    <View style={styles.statsGrid}>
                      <StatItem label="Total Solved" value={codeforcesData.totalSolved} icon="check" />
                      <StatItem label="Contribution" value={codeforcesData.contribution} icon="group" />
                      <StatItem label="Friends" value={codeforcesData.friendOfCount} icon="people" />
                      <StatItem label="Last Online" value={codeforcesData.lastOnline} icon="online-prediction" />
                    </View>

                    <Text style={styles.subSectionTitle}>Recent Activity</Text>
                    <View style={styles.submissionContainer}>
                      {codeforcesSubmissions.length > 0 ? codeforcesSubmissions.map((s, i) => <EnhancedSubmissionItem key={s.id ?? i} submission={s} platform="codeforces" />) : <Text style={styles.noSubmissionsText}>No recent submissions</Text>}
                    </View>
                  </>
                )}
              </View>

              {/* LeetCode */}
              <View style={styles.platformSection}>
                <PlatformHeader platformName="LeetCode" handle={leetcodeData?.username} data={leetcodeData} onClear={() => openClearModal("leetcode")} icon={<Text style={styles.atcoderIcon}>L</Text>} iconBg="#000" onTitlePress={() => leetcodeData && Linking.openURL(`https://leetcode.com/${leetcodeData.username}`)} />
                {loadingLeetcode ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#0000ff" />
                    <Text style={styles.loadingText}>Fetching data...</Text>
                  </View>
                ) : lcError ? (
                  <Text style={styles.errorText}>{lcError}</Text>
                ) : !leetcodeData ? (
                  <PlatformInput id={leetcodeId} setId={setLeetcodeId} placeholder="LeetCode Username" onConnect={() => fetchLeetcodeData(leetcodeId)} loading={loadingLeetcode} />
                ) : (
                  <>
                    <View style={styles.mainStatsCard}>
                      <Text style={styles.statsTitle}>Problems Solved</Text>
                      <Text style={styles.statsValue}>{leetcodeData.totalSolved}</Text>
                      <Text style={styles.statsSubtitle}>Total Solved</Text>
                      <View style={styles.acceptanceContainer}>
                        <Text style={styles.acceptanceRate}>Acceptance: {leetcodeData.acceptanceRate}%</Text>
                        {leetcodeData.ranking > 0 && <Text style={styles.ranking}>Rank: #{leetcodeData.ranking.toLocaleString()}</Text>}
                      </View>
                    </View>

                    <EnhancedLeetCodeBars easy={leetcodeData.easySolved} medium={leetcodeData.mediumSolved} hard={leetcodeData.hardSolved} total={leetcodeData.totalSolved} />

                    <View style={styles.leetcodeStats}>
                      <View style={styles.leetcodeStatItem}>
                        <Text style={styles.leetcodeStatLabel}>Easy</Text>
                        <Text style={[styles.leetcodeStatValue, styles.easyStat]}>{leetcodeData.easySolved}</Text>
                      </View>
                      <View style={styles.leetcodeStatItem}>
                        <Text style={styles.leetcodeStatLabel}>Medium</Text>
                        <Text style={[styles.leetcodeStatValue, styles.mediumStat]}>{leetcodeData.mediumSolved}</Text>
                      </View>
                      <View style={styles.leetcodeStatItem}>
                        <Text style={styles.leetcodeStatLabel}>Hard</Text>
                        <Text style={[styles.leetcodeStatValue, styles.hardStat]}>{leetcodeData.hardSolved}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* AtCoder / GitHub / HackerRank (kept concise & consistent) */}
              <View style={styles.platformSection}>
                <PlatformHeader platformName="AtCoder" handle={atcoderData?.username} data={atcoderData} onClear={() => openClearModal("atcoder")} icon={<Text style={styles.atcoderIcon}>A</Text>} iconBg="#222" onTitlePress={() => atcoderData && Linking.openURL(`https://atcoder.jp/users/${atcoderData.username}`)} />
                {loadingAtcoder ? (
                  <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#565656" /><Text style={styles.loadingText}>Fetching data...</Text></View>
                ) : acError ? (
                  <Text style={styles.errorText}>{acError}</Text>
                ) : !atcoderData ? (
                  <PlatformInput id={atcoderId} setId={setAtcoderId} placeholder="AtCoder Username" onConnect={() => fetchAtCoderData(atcoderId)} loading={loadingAtcoder} />
                ) : (
                  <>
                    <View style={styles.mainRatingCard}>
                      <Text style={styles.ratingTitle}>Current Rating</Text>
                      <Text style={[styles.ratingValue, { color: "#565656" }]}>{atcoderData.rating}</Text>
                      <Text style={styles.ratingRank}>Rank: #{atcoderData.rank}</Text>
                      <Text style={styles.maxRating}>Max: {atcoderData.maxRating}</Text>
                    </View>
                    <View style={styles.statsGrid}>
                      <StatItem label="Country" value={atcoderData.country || "N/A"} icon="location-on" />
                      <StatItem label="Affiliation" value={atcoderData.affiliation || "N/A"} icon="business" />
                    </View>
                  </>
                )}
              </View>

              <View style={styles.platformSection}>
                <PlatformHeader platformName="GitHub" handle={githubData?.login} data={githubData} onClear={() => openClearModal("github")} icon={<FontAwesome5 name="github" size={16} color="#FFF" />} iconBg="#333" onTitlePress={() => githubData && Linking.openURL(githubData.html_url)} />
                {loadingGithub ? (
                  <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#333" /><Text style={styles.loadingText}>Fetching data...</Text></View>
                ) : ghError ? (
                  <Text style={styles.errorText}>{ghError}</Text>
                ) : !githubData ? (
                  <PlatformInput id={githubId} setId={setGithubId} placeholder="GitHub Username" onConnect={() => fetchGitHubData(githubId)} loading={loadingGithub} />
                ) : (
                  <>
                    <View style={[styles.mainStatsCard, { borderLeftColor: "#333" }]}>
                      <Text style={styles.statsTitle}>GitHub Profile</Text>
                      <Text style={[styles.statsValue, { fontSize: 22 }]}>{githubData.name || githubData.login}</Text>
                      {githubData.bio ? <Text style={[styles.statsSubtitle, { textAlign: "center" }]} numberOfLines={2}>{githubData.bio}</Text> : null}
                    </View>
                    <View style={styles.statsGrid}>
                      <StatItem label="Public Repos" value={githubData.public_repos} icon="code" color="#333" />
                      <StatItem label="Followers" value={githubData.followers} icon="people" color="#333" />
                      <StatItem label="Following" value={githubData.following} icon="group" color="#333" />
                    </View>
                  </>
                )}
              </View>

              <View style={styles.platformSection}>
                <PlatformHeader platformName="HackerRank" handle={hackerrankData?.username} data={hackerrankData} onClear={() => openClearModal("hackerrank")} icon={<FontAwesome5 name="hackerrank" size={16} color="#FFF" />} iconBg="#000" onTitlePress={() => hackerrankData && Linking.openURL(`https://www.hackerrank.com/${hackerrankData.username}`)} />
                {loadingHackerrank ? (
                  <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#00EA64" /><Text style={styles.loadingText}>Fetching data...</Text></View>
                ) : hrError ? (
                  <Text style={styles.errorText}>{hrError}</Text>
                ) : !hackerrankData ? (
                  <PlatformInput id={hackerrankId} setId={setHackerrankId} placeholder="HackerRank Username" onConnect={() => fetchHackerRankData(hackerrankId)} loading={loadingHackerrank} />
                ) : (
                  <>
                    <View style={[styles.mainStatsCard, { borderLeftColor: "#000" }]}>
                      <Text style={styles.statsTitle}>HackerRank Profile</Text>
                      <Text style={[styles.statsValue, { fontSize: 22 }]}>{hackerrankData.name || hackerrankData.username}</Text>
                      <Text style={styles.statsSubtitle}>Level {hackerrankData.level}</Text>
                    </View>
                    <View style={styles.statsGrid}>
                      <StatItem label="Submissions" value={hackerrankData.submission_count} icon="send" color="#000" />
                      <StatItem label="Followers" value={hackerrankData.followers_count} icon="people" color="#000" />
                      <StatItem label="Badges" value={hackerrankData.badges?.length ?? 0} icon="workspace-premium" color="#000" />
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      <ConfirmationModal visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onConfirm={handleConfirmClear} platform={platformToClear} />
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  // base container used on mobile and small screens
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 40 : 60,
    paddingHorizontal: 24,
  },
  // center and constrain width on web (desktop)
  webContainer: {
    alignSelf: "center",
    width: "70%",
    maxWidth: 920,
  },
  header: { marginBottom: 20, paddingHorizontal: 4 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  pageTitle: { fontSize: 30, fontWeight: "800", color: COLORS.textDark, letterSpacing: 0.2, textAlign: "left" },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.mediumCream,
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
    alignSelf: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: IS_WEB ? 'auto' : '100%',
    maxWidth: 300,
  },
  tab: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 8, 
    paddingHorizontal: 20, 
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: { 
    fontWeight: "600", 
    color: COLORS.textDark, 
    marginLeft: 6, 
    fontSize: 14,
    textAlign: 'center',
  },
  activeTabText: { color: COLORS.white },

  contentContainer: { paddingBottom: 40 },
  webContentContainer: {
    paddingHorizontal: IS_MOBILE ? 0 : 20,
  },
  webProfilesContainer: {
    maxWidth: '100%',
  },
  headerContainer: { marginBottom: 20, alignItems: "center" },

  title: { fontSize: 28, fontWeight: "bold", color: COLORS.textDark, textAlign: "center" },
  subtitle: { fontSize: 16, color: COLORS.secondary, marginTop: 4, textAlign: "center" },

  heading: { fontSize: 22, fontWeight: "700", color: COLORS.textDark, textAlign: "center", marginBottom: 10 },

  progressContainer: { alignItems: "center", marginVertical: 20 },
  circleWrapper: { width: 200, height: 200, alignItems: "center", justifyContent: "center" },
  progressTextContainer: { position: "absolute", alignItems: "center", justifyContent: "center" },
  percentage: { fontSize: 42, fontWeight: "700", color: COLORS.textDark },
  completed: { fontSize: 14, color: COLORS.secondary, marginTop: -5 },

  // Progress Stats Box Styles - NEW
  progressStatsContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  progressStatsBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    minWidth: IS_MOBILE ? '90%' : 300,
    maxWidth: 400,
    justifyContent: 'space-between',
  },
  progressStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  progressStatDivider: {
    width: 1,
    backgroundColor: COLORS.borderColor,
    marginHorizontal: 10,
  },

  statsContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20 },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  statIcon: { padding: 8, borderRadius: 8, marginRight: 10 },
  statContent: {},
  statNumber: { fontSize: 18, fontWeight: "700", color: COLORS.textDark },
  statLabel: { fontSize: 12, color: COLORS.secondary },

  quoteContainer: { backgroundColor: COLORS.mediumCream, padding: 15, borderRadius: 16, marginTop: 10, borderWidth: 1, borderColor: COLORS.borderColor },

  platformSection: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    width: '100%',
  },
  platformHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 12,
    flexWrap: IS_MOBILE ? 'wrap' : 'nowrap',
  },
  platformTitleContainer: { 
    flexDirection: "row", 
    alignItems: "center",
    flex: 1,
    flexWrap: 'wrap',
  },
  platformIcon: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: 10 
  },
  platformTextContainer: {
    flexShrink: 1,
  },
  platformName: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: COLORS.textDark,
    flexWrap: 'wrap',
  },
  handleText: { 
    fontSize: 12, 
    color: COLORS.algoTextLight,
    flexWrap: 'wrap',
  },
  connectedBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#E8F5E9", 
    paddingVertical: 4, 
    paddingHorizontal: 8, 
    borderRadius: 12 
  },
  connectedText: { color: "#4CAF50", fontSize: 12, marginLeft: 4, fontWeight: "500" },

  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 8,
    flexWrap: IS_MOBILE ? 'wrap' : 'nowrap',
  },
  textInput: {
    flex: 1,
    height: 44,
    borderColor: COLORS.borderColor,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightCream,
    color: COLORS.textDark,
    fontSize: 14,
    minWidth: IS_MOBILE ? '100%' : 'auto',
    marginBottom: IS_MOBILE ? 8 : 0,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: IS_MOBILE ? 0 : 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    width: IS_MOBILE ? '100%' : 'auto',
  },
  loadingButton: { backgroundColor: COLORS.accent },
  connectButtonText: { color: COLORS.white, fontWeight: "700", marginLeft: 6, fontSize: 14 },

  loadingContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: { marginLeft: 8, color: COLORS.algoTextLight },
  errorText: { color: "#E74C3C", textAlign: "center", marginTop: 10 },

  mainRatingCard: {
    backgroundColor: COLORS.lightCream,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#1F63A6",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  ratingTitle: { fontSize: 14, color: COLORS.algoTextLight },
  ratingValue: { fontSize: 36, fontWeight: "700", marginVertical: 4 },
  ratingRank: { fontSize: 16, fontWeight: "600", color: COLORS.textDark },
  maxRating: { fontSize: 12, color: COLORS.algoTextLight, marginTop: 4 },

  mainStatsCard: {
    backgroundColor: COLORS.lightCream,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#FFA116",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  statsTitle: { fontSize: 14, color: COLORS.algoTextLight },
  statsValue: { fontSize: 36, fontWeight: "700", color: COLORS.textDark, marginVertical: 4 },
  statsSubtitle: { fontSize: 16, fontWeight: "600", color: COLORS.textDark },

  acceptanceContainer: { 
    flexDirection: "row", 
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  acceptanceRate: { fontSize: 12, color: "#007BFF", marginRight: 16 },
  ranking: { fontSize: 12, color: "#28A745" },

  statsGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between",
    width: '100%',
  },
  statItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.lightCream, 
    borderRadius: 12, 
    padding: 10, 
    width: IS_MOBILE ? "100%" : "48%", 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: COLORS.borderColor,
    minWidth: IS_MOBILE ? '100%' : 140,
  },
  statItemLabel: { 
    fontSize: 12, 
    color: COLORS.algoTextLight, 
    marginLeft: 6, 
    flex: 1,
    flexWrap: 'wrap',
  },
  statValue: { fontSize: 14, fontWeight: "700" },

  subSectionTitle: { fontSize: 16, fontWeight: "600", color: COLORS.textDark, marginTop: 16, marginBottom: 8 },
  submissionContainer: { width: '100%' },
  noSubmissionsText: { color: COLORS.algoTextLight, textAlign: "center", padding: 10 },

  enhancedSubmissionItem: { 
    backgroundColor: COLORS.lightCream, 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: COLORS.borderColor,
    width: '100%',
  },
  submissionContent: {},
  submissionProblem: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: COLORS.textDark, 
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  submissionMeta: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    flexWrap: 'wrap',
  },
  submissionTime: { fontSize: 12, color: COLORS.algoTextLight },
  submissionVerdict: { fontSize: 12, fontWeight: "700" },

  enhancedDifficultyContainer: { 
    backgroundColor: COLORS.lightCream, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: COLORS.borderColor,
    width: '100%',
  },
  difficultyHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "baseline", 
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  difficultyTitle: { fontSize: 16, fontWeight: "600", color: COLORS.textDark },
  difficultyTotal: { fontSize: 14, fontWeight: "700", color: COLORS.textDark },

  difficultyBarContainer: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", backgroundColor: COLORS.mediumCream, marginBottom: 12, width: '100%' },
  barSegment: { height: "100%" },
  easyBar: { backgroundColor: "#27AE60" },
  mediumBar: { backgroundColor: "#F39C12" },
  hardBar: { backgroundColor: "#E74C3C" },

  difficultyStats: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    flexWrap: IS_MOBILE ? 'wrap' : 'nowrap',
  },
  difficultyStat: { 
    flex: 1, 
    alignItems: "center",
    marginBottom: IS_MOBILE ? 8 : 0,
  },
  difficultyInfo: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  easyDot: { backgroundColor: "#27AE60" },
  mediumDot: { backgroundColor: "#F39C12" },
  hardDot: { backgroundColor: "#E74C3C" },
  difficultyLabel: { fontSize: 12, color: COLORS.algoTextLight },
  difficultyNumbers: { fontSize: 14, fontWeight: "600", color: COLORS.textDark },

  leetcodeStats: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    backgroundColor: COLORS.lightCream, 
    padding: 12, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: COLORS.borderColor,
    width: '100%',
    flexWrap: IS_MOBILE ? 'wrap' : 'nowrap',
  },
  leetcodeStatItem: { 
    alignItems: "center",
    marginHorizontal: IS_MOBILE ? 10 : 0,
    marginBottom: IS_MOBILE ? 8 : 0,
  },
  leetcodeStatLabel: { fontSize: 12, color: COLORS.algoTextLight },
  leetcodeStatValue: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  easyStat: { color: "#27AE60" },
  mediumStat: { color: "#F39C12" },
  hardStat: { color: "#E74C3C" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "80%", backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 20, alignItems: "center", shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, borderWidth: 1, borderColor: COLORS.borderColor, maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark, marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: COLORS.secondary, textAlign: "center", marginBottom: 20 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalButton: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: COLORS.mediumCream, borderWidth: 1, borderColor: COLORS.borderColor },
  cancelButtonText: { color: COLORS.textDark, fontWeight: "700" },
  confirmButton: { backgroundColor: "#E74C3C", shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  confirmButtonText: { color: COLORS.white, fontWeight: "700" },

  atcoderIcon: { color: "#FFF", fontWeight: "700", fontSize: 18 },

  bottomSpacing: { height: 20 },
});