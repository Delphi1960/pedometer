import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  NativeModules,
  Alert,
  Dimensions,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { usePedometer } from './Bootstrap';
import Settings from './Settings';
import { useMMKVNumber } from 'react-native-mmkv';

const { width } = Dimensions.get('window');

type Props = {};

export default function MainScreen({}: Props) {
  const { data } = usePedometer();

  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [currentWeight = 70] = useMMKVNumber('user_weight');
  const [currentGoal = 10000] = useMMKVNumber('user_goal');
  const [stepLengthCm = 70] = useMMKVNumber('step_length_cm');

  const distanceTodayKm = (data.dailySteps * stepLengthCm) / 100000;
  const distanceAllTimeKm = (data.totalNumberOfSteps * stepLengthCm) / 100000;
  const caloriesToday = distanceTodayKm * currentWeight * 1.036;

  let dayCount = 0;
  if (data.installDate) {
    const parts = data.installDate.split('.');
    if (parts.length === 3) {
      const installDateObj = new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0])
      );
      const today = new Date();
      installDateObj.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - installDateObj.getTime();
      dayCount = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    }
  }

  const getDaysString = (days: number) => {
    const n = Math.abs(days) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return 'дней';
    if (n1 > 1 && n1 < 5) return 'дня';
    if (n1 === 1) return 'день';
    return 'дней';
  };

  // --- SVG PROGRESS CALCULATION ---
  const size = width * 0.7; // 70% of screen width
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Progress clamped between 0 and 1
  const progress = Math.min(Math.max(data.dailySteps / currentGoal, 0), 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ШАГОМЕР</Text>
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => setSettingsVisible(true)}
        >
          <Text style={styles.settingsIconText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* CIRCULAR PROGRESS */}
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
            stroke="#2a2a2a"
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

      <Text style={styles.goalText}>
        ЦЕЛЬ: {currentGoal.toLocaleString('ru-RU')} ШАГОВ
      </Text>

      {/* BOTTOM STATS */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{distanceTodayKm.toFixed(2)}</Text>
          <Text style={styles.statLabel}>КМ</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.round(caloriesToday)}</Text>
          <Text style={styles.statLabel}>ККАЛ</Text>
        </View>
      </View>

      {/* TOTAL SINCE INSTALL */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>
          За {dayCount} {getDaysString(dayCount)} (с {data.installDate}):
        </Text>
        <View style={styles.totalBox}>
          <Text style={styles.totalValue}>{data.totalNumberOfSteps} шагов</Text>
          <View style={styles.totalDivider} />
          <Text style={styles.totalValue}>
            {distanceAllTimeKm.toFixed(2)} км
          </Text>
        </View>
      </View>

      {/* RESET BUTTON */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          Alert.alert(
            'Сброс статистики',
            'Вы уверены, что хотите обнулить счетчик шагов?',
            [
              { text: 'Отмена', style: 'cancel' },
              {
                text: 'Сбросить',
                style: 'destructive',
                onPress: () => {
                  NativeModules.PedometerModule.resetStatistics();
                },
              },
            ],
          );
        }}
      >
        <Text style={styles.resetButtonText}>Сбросить счетчики</Text>
      </TouchableOpacity>

      {/* SETTINGS MODAL */}
      <Settings
        isSettingsVisible={isSettingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingTop: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  settingsIcon: {
    padding: 8,
  },
  settingsIconText: {
    fontSize: 34,
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: -5,
  },
  progressSteps: {
    fontSize: 56,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d8d4d4ff',
    letterSpacing: 2,
  },
  goalText: {
    fontSize: 16,
    color: '#d8d4d4ff',
    fontWeight: '600',
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 30,
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#d8d4d4ff',
    fontWeight: '600',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#dad5d5ff',
    marginHorizontal: 15,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 12,
    color: '#d8d4d4ff',
  },
  totalBox: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  totalValue: {
    fontSize: 16,
    color: '#d8d4d4ff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  totalDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#dad5d5ff',
    marginHorizontal: 15,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d8d4d4ff',
    borderRadius: 10,
  },
  resetButtonText: {
    color: '#d8d4d4ff',
    fontWeight: 'bold',
  },
});
