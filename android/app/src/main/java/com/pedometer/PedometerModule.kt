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
        val daily = mmkv.decodeInt("daily_steps", 0)
        val total = mmkv.decodeInt("total_since_install", 0)
        val installDate = mmkv.decodeString("install_date", "")
        
        val map = Arguments.createMap()
        map.putInt("dailySteps", daily)
        map.putInt("totalNumberOfSteps", total)
        map.putString("installDate", installDate)
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
        
        // Отправляем событие в UI для мгновенного обновления экрана
        if (reactApplicationContext.hasActiveCatalystInstance()) {
            val map = Arguments.createMap()
            map.putInt("dailySteps", 0)
            map.putInt("totalNumberOfSteps", 0)
            map.putString("installDate", newInstallDate)
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
}