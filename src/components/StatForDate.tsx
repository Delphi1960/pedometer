import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  NativeModules,
  StyleSheet,
} from 'react-native';
import { usePedometer } from '../Bootstrap';
import { useMMKVNumber } from 'react-native-mmkv';
import { colorBackground, colorText } from '../const';

type Props = {};

export default function StatForDate({}: Props) {
  const { data } = usePedometer();

  const [stepLengthCm = 70] = useMMKVNumber('step_length_cm');

  const distanceAllTimeKm = (data.totalNumberOfSteps * stepLengthCm) / 100000;

  let dayCount = 0;
  if (data.installDate) {
    const parts = data.installDate.split('.');
    if (parts.length === 3) {
      const installDateObj = new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0]),
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

  return (
    <View>
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

      {/* КНОПКА СБРОСА */}
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
    </View>
  );
}
const styles = StyleSheet.create({
  totalContainer: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: colorText,
  },
  totalBox: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  totalValue: {
    fontSize: 16,
    color: colorText,
    fontWeight: 'bold',
    marginTop: 2,
  },
  totalDivider: {
    width: 1,
    height: 10,
    backgroundColor: colorText,
    marginHorizontal: 15,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d8d4d4ff',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 25,
  },
  resetButtonText: {
    color: colorText,
    fontWeight: 'bold',
  },
});
