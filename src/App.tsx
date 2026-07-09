import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainScreen from './components/MainScreen';
import Bootstrap from './Bootstrap';

export default function App() {
  return (
    <SafeAreaProvider>
      <Bootstrap>
        <MainScreen />
      </Bootstrap>
    </SafeAreaProvider>
  );
}
