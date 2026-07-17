import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useMMKVNumber } from 'react-native-mmkv';
import { usePedometer } from '../Bootstrap';
import { colorBackground, colorText, modalBackground } from '../const';

type Props = {};

const TopLabel = ({ val }: { val: number }) => (
  <View style={styles.topLabelContainer}>
    <Text style={styles.topLabelText}>{val}</Text>
  </View>
);

const makeTopLabel = (val: number) => () => <TopLabel val={val} />;

export default function WeeklyChart({}: Props) {
  const { data } = usePedometer();
  const [currentGoal = 10000] = useMMKVNumber('user_goal');

  const [isChartVisible, setChartVisible] = useState(false);
  const [stepLengthCm = 70] = useMMKVNumber('step_length_cm');
  const [selectedItem, setSelectedItem] = useState<{
    dateStr: string;
    steps: number;
    distance: string;
    percent: number;
  } | null>(null);

  const getChartData = () => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const fullDays = [
      'Воскресенье',
      'Понедельник',
      'Вторник',
      'Среда',
      'Четверг',
      'Пятница',
      'Суббота',
    ];
    const months = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря',
    ];
    const today = new Date();
    const chartData = [];

    const history = data.history || [0, 0, 0, 0, 0, 0, data.dailySteps];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const val = history[6 - i];

      const distanceKm = ((val * stepLengthCm) / 100000).toFixed(2);
      const percent = Math.round((val / currentGoal) * 100);
      const dateStr = `${fullDays[d.getDay()]}, ${d.getDate()} ${
        months[d.getMonth()]
      }`;

      chartData.push({
        value: val,
        label: days[d.getDay()],
        frontColor: i === 0 ? '#00d1ff' : '#2a9d8f',
        topLabelComponent: makeTopLabel(val),
        onPress: () =>
          setSelectedItem({ dateStr, steps: val, distance: distanceKm, percent }),
      });
    }
    return chartData;
  };

  const chartData = getChartData();

  const maxValue =
    Math.max(...chartData.map(d => d.value), currentGoal, 100) * 1.5;

  return (
    <>
      <TouchableOpacity
        style={styles.chartButton}
        onPress={() => setChartVisible(true)}
      >
        <Text style={styles.chartButtonText}>АКТИВНОСТЬ ЗА НЕДЕЛЮ</Text>
      </TouchableOpacity>

      <Modal
        visible={isChartVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChartVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colorBackground }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.chartTitle}>АКТИВНОСТЬ ЗА НЕДЕЛЮ</Text>
              <TouchableOpacity onPress={() => setChartVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedItem ? (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>{selectedItem.dateStr}</Text>
                <Text style={styles.detailsText}>
                  {selectedItem.steps} шагов ({selectedItem.distance} км) —{' '}
                  {selectedItem.percent}% от цели
                </Text>
              </View>
            ) : (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsHint}>
                  Нажмите на любой столбик для деталей
                </Text>
              </View>
            )}

            <BarChart
              data={chartData}
              height={300}
              barWidth={24}
              spacing={16}
              hideRules
              xAxisThickness={1}
              yAxisThickness={0}
              hideYAxisText={true}
              xAxisColor={colorText}
              noOfSections={4}
              maxValue={maxValue}
              labelWidth={24}
              xAxisLabelTextStyle={styles.xAxisLabelTextStyle}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  chartButton: {
    width: '85%',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: colorBackground,
    borderRadius: 20,
    paddingVertical: 15,
  },
  chartButtonText: {
    color: colorText,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: modalBackground,
    borderColor: colorText,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  chartTitle: {
    color: colorText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeModalText: {
    color: colorText,
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 10,
  },
  detailsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    height: 45,
    justifyContent: 'center',
  },
  detailsTitle: {
    color: '#00d1ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsText: {
    color: colorText,
    fontSize: 14,
  },
  detailsHint: {
    color: 'gray',
    fontSize: 14,
    fontStyle: 'italic',
  },
  xAxisLabelTextStyle: {
    color: colorText,
    textAlign: 'center',
    fontSize: 14,
  },
  yAxisTextStyle: {
    color: colorText,
    fontSize: 14,
  },
  topLabelContainer: {
    height: 70,
    width: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  topLabelText: {
    color: colorText,
    fontSize: 14,
    transform: [{ rotate: '-90deg' }],
    width: 70,
    textAlign: 'center',
  },
});
