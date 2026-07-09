import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { usePedometer } from '../Bootstrap';
import { useMMKVNumber } from 'react-native-mmkv';
import { colorBackground, colorText } from '../const';

type Props = {};

export default function CircularProgress({}: Props) {
  const [currentGoal = 10000] = useMMKVNumber('user_goal');
  const { data } = usePedometer();

  const { width } = Dimensions.get('window');

  // --- SVG PROGRESS CALCULATION ---
  const size = width * 0.7; // 70% of screen width
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Progress clamped between 0 and 1
  const progress = Math.min(Math.max(data.dailySteps / currentGoal, 0), 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={styles.progressContainer}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#00d1ff" stopOpacity="1" />
            <Stop offset="1" stopColor="#00ff88" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {/* Background Circle */}
        <Circle
          stroke={colorBackground}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Foreground Progress Circle */}
        <Circle
          stroke="url(#grad)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercent}>
          {Math.round(progress * 100)}%
        </Text>
        <Text style={styles.progressSteps}>{data.dailySteps}</Text>
        <Text style={styles.progressLabel}>ШАГОВ</Text>
        <Text style={styles.progressLabel}>СЕГОДНЯ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressPercent: {
    color: colorText,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  progressSteps: {
    fontSize: 56,
    fontWeight: '900',
    color: colorText,
    letterSpacing: -1,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colorText,
    letterSpacing: 2,
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
