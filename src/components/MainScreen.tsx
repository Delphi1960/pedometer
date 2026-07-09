import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Settings from './Settings';
import WeeklyChart from './WeeklyChart';
import CircularProgress from './CircularProgress';
import StatToday from './StatToday';
import StatForDate from './StatForDate';
import { colorText } from '../const';

type Props = {};

export default function MainScreen({}: Props) {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ШАГОМЕР</Text>
        {/* ЭКРАН НАСТРОЙКИ */}
        <Settings />
      </View>

      {/* КРУГОВОЙ ПРОГРЕСС */}
      <CircularProgress />

      {/* СТАТИСТИКА СЕГОДНЯ */}
      <StatToday />

      {/* АКТИВНОСТЬ ЗА НЕДЕЛЮ */}
      <WeeklyChart />

      {/* ВСЕГО С ДАТЫ СБРОСА */}
      <StatForDate />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colorText,
    letterSpacing: 2,
  },
});
