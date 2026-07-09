import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { storage } from './utils/storage';

type Props = {
  children: React.ReactNode;
};

type PedometerData = {
  dailySteps: number;
  totalNumberOfSteps: number;
  installDate: string;
  history: number[];
};

type PedometerContextType = {
  data: PedometerData;
  storage: MMKV;
};

export const PedometerContext = createContext<PedometerContextType>({
  data: { dailySteps: 0, totalNumberOfSteps: 0, installDate: '', history: [0, 0, 0, 0, 0, 0, 0] },
  storage: storage,
});

export const usePedometer = () => useContext(PedometerContext);

export default function Bootstrap({ children }: Props) {
  const { PedometerModule } = NativeModules;
  const [data, setData] = useState<PedometerData>({
    dailySteps: 0,
    totalNumberOfSteps: 0,
    installDate: '',
    history: [0, 0, 0, 0, 0, 0, 0],
  });

  useEffect(() => {
    const initPedometer = async (
      onStepsUpdate: (sensorData: PedometerData) => void,
    ) => {
      if (Platform.OS !== 'android') return () => {};

      if (Platform.Version >= 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('ACTIVITY_RECOGNITION permission denied');
          return () => {};
        }
      }

      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('POST_NOTIFICATIONS permission denied');
        }
      }

      // 1. Стартуем прослушивание нативного датчика (если не выключено в настройках)
      const isTrackingEnabled = storage.getBoolean('is_tracking_enabled') ?? true;
      if (isTrackingEnabled) {
        PedometerModule.startListening();
      }

      // 2. Подписываемся на события
      const eventEmitter = new NativeEventEmitter(PedometerModule);
      const subscription = eventEmitter.addListener(
        'onStepCountChanged',
        (sensorData: PedometerData) => {
          onStepsUpdate(sensorData);
        },
      );

      return () => {
        subscription.remove();
        // Службу больше не останавливаем при закрытии компонента, так как она должна работать 24/7
      };
    };

    let isMounted = true;
    let cleanupFunction: (() => void) | undefined;

    const setup = async () => {
      // Пытаемся сразу получить текущее сохраненное значение
      try {
        if (
          Platform.OS === 'android' &&
          PedometerModule.getCurrentSensorValue
        ) {
          const initialData = await PedometerModule.getCurrentSensorValue();
          if (isMounted) setData(initialData);
        }
      } catch (e) {
        console.error('Failed to get initial steps:', e);
      }

      const cleanup = await initPedometer((sensorData: PedometerData) => {
        if (isMounted) {
          setData(sensorData);
        }
      });
      if (isMounted) {
        cleanupFunction = cleanup;
      } else {
        cleanup();
      }
    };

    setup();

    return () => {
      isMounted = false;
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [PedometerModule]);

  return (
    <PedometerContext.Provider value={{ data, storage }}>
      {children}
    </PedometerContext.Provider>
  );
}
