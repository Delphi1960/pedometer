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
  //   heightStr: string;
  //   weightStr: string;
  //   goalStr: string;
  //   gender: string;
  //   setHeightStr: (value: string) => void;
  //   setWeightStr: (value: string) => void;
  //   setGoalStr: (value: string) => void;
  //   setGender: (value: string) => void;
  //   saveSettings: () => void;
};

export default function Settings({
  isSettingsVisible,
  onClose,
}: //   saveSettings,
Props) {
  const [userHeight, setUserHeight] = useMMKVNumber('user_height');
  const [userWeight, setUserWeight] = useMMKVNumber('user_weight');
  const [userGoal, setUserGoal] = useMMKVNumber('user_goal');
  const [userGender, setUserGender] = useMMKVString('user_gender');
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
                value={userHeight?.toString()}
                onChangeText={text => setUserHeight(parseInt(text, 10))}
                maxLength={3}
              />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Вес (кг):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={userWeight?.toString()}
                onChangeText={text => setUserWeight(parseInt(text, 10))}
                maxLength={3}
              />
            </View>
          </View>

          <Text style={styles.label}>Цель (шагов):</Text>
          <TextInput
            style={[styles.input]}
            keyboardType="numeric"
            value={userGoal?.toString()}
            onChangeText={text => setUserGoal(parseInt(text, 10))}
            maxLength={6}
          />

          <Text style={styles.label}>Пол:</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                userGender === 'male' && styles.genderButtonActive,
              ]}
              onPress={() => setUserGender('male')}
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
              onPress={() => setUserGender('female')}
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
