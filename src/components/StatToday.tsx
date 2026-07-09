import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colorBackground, colorText } from '../const';
import { useMMKVNumber } from 'react-native-mmkv';
import { usePedometer } from '../Bootstrap';

type Props = {};

export default function StatToday({}: Props) {
  const [currentGoal = 10000] = useMMKVNumber('user_goal');
  const [currentWeight = 70] = useMMKVNumber('user_weight');
  const [stepLengthCm = 70] = useMMKVNumber('step_length_cm');

  const { data } = usePedometer();
  const distanceTodayKm = (data.dailySteps * stepLengthCm) / 100000;
  const caloriesToday = distanceTodayKm * currentWeight * 1.036;

  return (
    <>
      <Text style={styles.goalText}>
        ЦЕЛЬ: {currentGoal.toLocaleString('ru-RU')} ШАГОВ
      </Text>

      {/* СТАТИСТИКА СЕГОДНЯ */}
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
    </>
  );
}

const styles = StyleSheet.create({
  goalText: {
    fontSize: 16,
    color: colorText,
    fontWeight: '600',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colorBackground,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colorText,
  },
  statLabel: {
    fontSize: 14,
    color: colorText,
    fontWeight: '600',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colorText,
    marginHorizontal: 15,
  },
});
