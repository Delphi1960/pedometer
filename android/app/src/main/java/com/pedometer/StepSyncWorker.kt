package com.pedometer

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.tencent.mmkv.MMKV
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class StepSyncWorker(context: Context, workerParams: WorkerParameters) : CoroutineWorker(context, workerParams) {
    
    override suspend fun doWork(): Result = suspendCancellableCoroutine { continuation ->
        val sensorManager = applicationContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

        if (stepSensor == null) {
            continuation.resume(Result.failure())
            return@suspendCancellableCoroutine
        }

        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent?) {
                event?.values?.get(0)?.toInt()?.let { currentSteps ->
                    StepCounterHelper.processStepEvent(currentSteps)
                }
                sensorManager.unregisterListener(this)
                if (continuation.isActive) {
                    continuation.resume(Result.success())
                }
            }
            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
        }
        
        sensorManager.registerListener(listener, stepSensor, SensorManager.SENSOR_DELAY_NORMAL)
        
        continuation.invokeOnCancellation {
            sensorManager.unregisterListener(listener)
        }
    }
}