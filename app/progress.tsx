import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, Dimensions, Animated, Easing } from 'react-native';
import { Svg, Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

export default function ProgressPage() {
  const [learnedTopics, setLearnedTopics] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));
  const [progressAnimation] = useState(new Animated.Value(0));

  const loadData = async () => {
    try {
      const savedLearned = await AsyncStorage.getItem("learnedTopics");
      const topics = savedLearned ? parseInt(savedLearned, 10) : 0;
      setLearnedTopics(topics);
      
      // Animate progress after data loads
      Animated.timing(progressAnimation, {
        toValue: topics / 15,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false
      }).start();
    } catch (error) {
      console.error("Failed to load progress data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Animate screen entrance
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }).start();
      
      loadData();
      return () => {
        animatedValue.setValue(0);
        progressAnimation.setValue(0);
      };
    }, [])
  );

  // Calculate progress percentage
  const progressPercentage = Math.round((learnedTopics / 15) * 100);
  
  // Animated progress circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0]
  });

  // Interpolate for entrance animation
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0]
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { transform: [{ translateY }], opacity }]}>
          <Text style={styles.heading}>Your Progress</Text>
          <Text style={styles.subheading}>{learnedTopics} of 15 topics completed</Text>
        </Animated.View>

        {/* Main Progress Circle */}
        <Animated.View style={[styles.progressContainer, { transform: [{ translateY }], opacity }]}>
          <View style={styles.circleWrapper}>
            <Svg width="240" height="240" viewBox="0 0 240 240">
              {/* Background circle */}
              <Circle
                cx="120"
                cy="120"
                r={radius}
                stroke="#F3E2D4"
                fill="none"
              />
              {/* Animated progress circle */}
              <AnimatedCircle
                cx="120"
                cy="120"
                r={radius}
                stroke="#17313E"
                strokeWidth="14"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin="120, 120"
              />
            </Svg>
            <View style={styles.progressTextContainer}>
              <Text style={styles.percentage}>{progressPercentage}%</Text>
              <Text style={styles.completed}>Complete</Text>
            </View>
          </View>
        </Animated.View>

        {/* Progress Status */}
        <Animated.View style={[styles.statusContainer, { transform: [{ translateY }], opacity }]}>
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: '#C5B0CD' }]}>
              <MaterialIcons name="check-circle" size={24} color="#17313E" />
            </View>
            <View style={styles.statusText}>
              <Text style={styles.statusNumber}>{learnedTopics}</Text>
              <Text style={styles.statusLabel}>Completed</Text>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: '#F3E2D4' }]}>
              <MaterialIcons name="pending" size={24} color="#17313E" />
            </View>
            <View style={styles.statusText}>
              <Text style={styles.statusNumber}>{15 - learnedTopics}</Text>
              <Text style={styles.statusLabel}>Remaining</Text>
            </View>
          </View>
        </Animated.View>

        {/* Motivational Quote */}
        <Animated.View style={[styles.quoteContainer, { transform: [{ translateY }], opacity }]}>
          <MaterialIcons name="format-quote" size={32} color="#C5B0CD" />
          <Text style={styles.quoteText}>
            {progressPercentage === 0 
              ? "Every expert was once a beginner. Start your journey today." 
              : progressPercentage < 50 
                ? "Progress, not perfection. Keep going!"
                : progressPercentage < 100
                  ? "You're doing great! More than halfway there."
                  : "Amazing! You've completed everything. Time to celebrate!"}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E2D4',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: "#17313E",
    textAlign: "center",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: "#415E72",
    textAlign: "center",
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#17313E",
    marginBottom: 4,
  },
  completed: {
    fontSize: 16,
    color: "#415E72",
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '45%',
    ...Platform.select({
      ios: {
        shadowColor: "#17313E",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0px 4px 8px rgba(23, 49, 62, 0.1)",
      }
    }),
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusText: {
    flex: 1,
  },
  statusNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#17313E",
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 14,
    color: "#415E72",
  },
  quoteContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#17313E",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0px 4px 8px rgba(23, 49, 62, 0.1)",
      }
    }),
  },
  quoteText: {
    fontSize: 16,
    color: "#17313E",
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
    fontStyle: 'italic',
  },
});