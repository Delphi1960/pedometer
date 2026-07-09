package com.pedometer

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.tencent.mmkv.MMKV
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class PedometerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val mmkv: MMKV by lazy { MMKV.defaultMMKV() }

    init {
        // Устанавливаем контекст для сервиса, чтобы он мог отправлять события
        PedometerContextHolder.setContext(reactContext)
    }

    override fun getName(): String {
        return "PedometerModule"
    }

    // Метод для старта фоновой службы из JS
    @ReactMethod
    fun startListening() {
        mmkv.encode("is_tracking_enabled", true)
        val intent = Intent(reactApplicationContext, PedometerService::class.java).apply {
            action = PedometerService.ACTION_START
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(intent)
        } else {
            reactApplicationContext.startService(intent)
        }
    }

    // Метод для остановки фоновой службы (опционально)
    @ReactMethod
    fun stopListening() {
        mmkv.encode("is_tracking_enabled", false)
        val intent = Intent(reactApplicationContext, PedometerService::class.java).apply {
            action = PedometerService.ACTION_STOP
        }
        reactApplicationContext.stopService(intent)
    }

    // Экстренный метод получения текущего значения датчика «прямо сейчас» (берет из MMKV)
    @ReactMethod
    fun getCurrentSensorValue(promise: Promise) {
        val stepData = StepCounterHelper.getCurrentData()
        
        val map = Arguments.createMap()
        map.putInt("dailySteps", stepData.dailySteps)
        map.putInt("totalNumberOfSteps", stepData.totalNumberOfSteps)
        map.putString("installDate", stepData.installDate)
        
        val historyArray = Arguments.createArray()
        for (steps in stepData.history) {
            historyArray.pushInt(steps)
        }
        map.putArray("history", historyArray)
        
        promise.resolve(map)
    }

    // Сброс статистики по желанию пользователя
    @ReactMethod
    fun resetStatistics() {
        val displayDateFormat = SimpleDateFormat("dd.MM.yyyy", Locale.getDefault())
        val newInstallDate = displayDateFormat.format(Date())
        
        // Сбрасываем счетчики в MMKV
        mmkv.encode("daily_steps", 0)
        mmkv.encode("total_since_install", 0)
        mmkv.encode("install_date", newInstallDate)
        
        // Сбрасываем историю за неделю
        val dateFormatHistory = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val calendar = java.util.Calendar.getInstance()
        for (i in 6 downTo 1) {
            calendar.time = Date()
            calendar.add(java.util.Calendar.DAY_OF_YEAR, -i)
            val dateStr = dateFormatHistory.format(calendar.time)
            mmkv.encode("history_$dateStr", 0)
        }
        
        // Отправляем событие в UI для мгновенного обновления экрана
        if (reactApplicationContext.hasActiveCatalystInstance()) {
            val stepData = StepCounterHelper.getCurrentData()
            val map = Arguments.createMap()
            map.putInt("dailySteps", stepData.dailySteps)
            map.putInt("totalNumberOfSteps", stepData.totalNumberOfSteps)
            map.putString("installDate", stepData.installDate)
            
            val historyArray = Arguments.createArray()
            for (steps in stepData.history) {
                historyArray.pushInt(steps)
            }
            map.putArray("history", historyArray)
            
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onStepCountChanged", map)
        }
        
        // Обновляем уведомление сервиса, перезапустив его
        val intent = Intent(reactApplicationContext, PedometerService::class.java).apply {
            action = PedometerService.ACTION_START
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(intent)
        } else {
            reactApplicationContext.startService(intent)
        }
    }

    // Обязательные методы для NativeEventEmitter
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Double) {}

    @ReactMethod
    fun injectMockData(promise: Promise) {
        val today = java.util.Date()
        val calendar = java.util.Calendar.getInstance()
        val dateFormat = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
        val mockSteps = intArrayOf(5430, 11200, 8750, 3200, 14500, 9100)
        
        for (i in 1..6) {
            calendar.time = today
            calendar.add(java.util.Calendar.DAY_OF_YEAR, -i)
            val dateStr = dateFormat.format(calendar.time)
            val mmkv = com.tencent.mmkv.MMKV.defaultMMKV()
            mmkv.encode("history_$dateStr", mockSteps[6 - i])
        }
        
        // Сразу отправляем обновленные данные в UI
        if (reactApplicationContext.hasActiveCatalystInstance()) {
            val stepData = StepCounterHelper.getCurrentData()
            val map = Arguments.createMap()
            map.putInt("dailySteps", stepData.dailySteps)
            map.putInt("totalNumberOfSteps", stepData.totalNumberOfSteps)
            map.putString("installDate", stepData.installDate)
            
            val historyArray = Arguments.createArray()
            for (steps in stepData.history) {
                historyArray.pushInt(steps)
            }
            map.putArray("history", historyArray)
            
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onStepCountChanged", map)
        }
        
        promise.resolve(true)
    }
}