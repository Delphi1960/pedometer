package com.pedometer

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.tencent.mmkv.MMKV

class PedometerService : Service(), SensorEventListener {

    private lateinit var sensorManager: SensorManager
    private var stepSensor: Sensor? = null
    private lateinit var notificationManager: NotificationManager

    companion object {
        const val CHANNEL_ID = "pedometer_channel"
        const val NOTIFICATION_ID = 5678
        const val ACTION_START = "com.pedometer.START"
        const val ACTION_STOP = "com.pedometer.STOP"
    }

    override fun onCreate() {
        super.onCreate()
        
        notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Pedometer Tracking",
                NotificationManager.IMPORTANCE_LOW
            )
            notificationManager.createNotificationChannel(channel)
        }

        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val mmkv = MMKV.defaultMMKV()
                val dailySteps = mmkv.decodeInt("daily_steps", 0)
                startForeground(NOTIFICATION_ID, buildNotification("Шагов сегодня: $dailySteps"))
                stepSensor?.let {
                    sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
                }
            }
            ACTION_STOP -> {
                stopForeground(STOP_FOREGROUND_REMOVE)
                sensorManager.unregisterListener(this)
                stopSelf()
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        sensorManager.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_STEP_COUNTER) {
            val currentSensorValue = event.values[0].toInt()
            
            // Обрабатываем шаги через общий хелпер (сохраняет в MMKV)
            val stepData = StepCounterHelper.processStepEvent(currentSensorValue)
            
            // Обновляем уведомление, чтобы показать актуальные шаги за сегодня
            updateNotification("Шагов сегодня: ${stepData.dailySteps}")
            
            // Если React Native жив, отправляем событие в UI
            val reactContext = PedometerContextHolder.getContext()
            if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
                val map = Arguments.createMap()
                map.putInt("dailySteps", stepData.dailySteps)
                map.putInt("totalSinceInstall", stepData.totalSinceInstall)
                map.putString("installDate", stepData.installDate)
                
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onStepCountChanged", map)
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun buildNotification(msg: String): Notification {
        // Пытаемся получить класс MainActivity через рефлексию или явным указанием.
        // Так как пакет com.pedometer, мы можем использовать com.pedometer.MainActivity
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Шагомер")
            .setContentText(msg)
            .setSmallIcon(R.mipmap.ic_launcher) // Заглушка, желательно использовать специальную иконку
            .setLargeIcon(BitmapFactory.decodeResource(resources, R.mipmap.ic_launcher))
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun updateNotification(msg: String) {
        notificationManager.notify(NOTIFICATION_ID, buildNotification(msg))
    }
}
