import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useMMKVNumber } from 'react-native-mmkv';
import { usePedometer } from '../Bootstrap';
import { colorBackground, colorText, modalBackground } from '../const';

type Props = {};

export default function WeeklyChart({}: Props) {
  const { data } = usePedometer();
  const [currentGoal = 10000] = useMMKVNumber('user_goal');

  const [isChartVisible, setChartVisible] = useState(false);

  const getChartData = () => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const today = new Date();
    const chartData = [];

    const history = data.history || [0, 0, 0, 0, 0, 0, data.dailySteps];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      chartData.push({
        value: history[6 - i],
        label: days[d.getDay()],
        frontColor: i === 0 ? '#00d1ff' : '#2a9d8f',
      });
    }
    return chartData;
  };

  const chartData = getChartData();

  const maxValue = Math.max(...chartData.map(d => d.value), currentGoal, 100);

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
            <BarChart
              data={chartData}
              height={200}
              barWidth={20}
              spacing={16}
              // roundedTop
              // roundedBottom
              hideRules
              xAxisThickness={1}
              yAxisThickness={1}
              xAxisColor={colorText}
              yAxisColor={colorText}
              yAxisTextStyle={styles.yAxisTextStyle}
              noOfSections={4}
              maxValue={maxValue}
              formatYLabel={(label: string) =>
                String(Math.round(Number(label)))
              }
              labelWidth={30}
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
  xAxisLabelTextStyle: {
    color: colorText,
    textAlign: 'center',
    fontSize: 10,
  },
  yAxisTextStyle: {
    color: colorText,
    fontSize: 10,
  },
});
