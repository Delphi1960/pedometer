import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMMKVNumber, useMMKVString } from 'react-native-mmkv';

type Props = {
  isSettingsVisible: boolean;
  onClose: () => void;
};

export default function Settings({ isSettingsVisible, onClose }: Props) {
  const [userHeight = 170, setUserHeight] = useMMKVNumber('user_height');
  const [userWeight = 70, setUserWeight] = useMMKVNumber('user_weight');
  const [userGoal = 10000, setUserGoal] = useMMKVNumber('user_goal');
  const [userGender = 'male', setUserGender] = useMMKVString('user_gender');
  const [stepLengthCm = 70, setStepLengthCm] = useMMKVNumber('step_length_cm');

  const getDisplayValue = (val: number | undefined) => {
    if (val === undefined || Number.isNaN(val) || val === 0) return '';
    return val.toString();
  };

  const handleHeightChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newHeight = cleanText === '' ? 0 : parseInt(cleanText, 10);
    setUserHeight(newHeight);
    if (newHeight > 0) {
      const newStepLength = Math.round(
        userGender === 'male' ? newHeight * 0.415 : newHeight * 0.413,
      );
      setStepLengthCm(newStepLength);
    }
  };

  const handleGenderChange = (newGender: string) => {
    setUserGender(newGender);
    if (userHeight && userHeight > 0) {
      const newStepLength = Math.round(
        newGender === 'male' ? userHeight * 0.415 : userHeight * 0.413,
      );
      setStepLengthCm(newStepLength);
    }
  };

  const handleWeightChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setUserWeight(cleanText === '' ? 0 : parseInt(cleanText, 10));
  };

  const handleStepLengthChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setStepLengthCm(cleanText === '' ? 0 : parseInt(cleanText, 10));
  };

  const handleGoalChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setUserGoal(cleanText === '' ? 0 : parseInt(cleanText, 10));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isSettingsVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Настройки</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Рост (см):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={getDisplayValue(userHeight)}
                onChangeText={handleHeightChange}
                maxLength={3}
              />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Вес (кг):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={getDisplayValue(userWeight)}
                onChangeText={handleWeightChange}
                maxLength={3}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Шаг (см):</Text>
              <TextInput
                style={[styles.input]}
                keyboardType="numeric"
                value={getDisplayValue(stepLengthCm)}
                onChangeText={handleStepLengthChange}
                maxLength={6}
              />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Цель (шагов):</Text>
              <TextInput
                style={[styles.input]}
                keyboardType="numeric"
                value={getDisplayValue(userGoal)}
                onChangeText={handleGoalChange}
                maxLength={6}
              />
            </View>
          </View>

          <Text style={styles.label}>Пол:</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                userGender === 'male' && styles.genderButtonActive,
              ]}
              onPress={() => handleGenderChange('male')}
            >
              <Text
                style={[
                  styles.genderText,
                  userGender === 'male' && styles.genderTextActive,
                ]}
              >
                Мужской
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                userGender === 'female' && styles.genderButtonActive,
              ]}
              onPress={() => handleGenderChange('female')}
            >
              <Text
                style={[
                  styles.genderText,
                  userGender === 'female' && styles.genderTextActive,
                ]}
              >
                Женский
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalSave} onPress={onClose}>
              <Text style={styles.modalSaveText}>Готово</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1e1e1e',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrap: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    color: '#e2dadaff',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 18,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  genderButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  genderButtonActive: {
    backgroundColor: '#00d1ff',
    borderColor: '#00d1ff',
  },
  genderText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  genderTextActive: {
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalSave: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#2cc705ff',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
