package com.pedometer

import com.tencent.mmkv.MMKV
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class StepData(val dailySteps: Int, val totalNumberOfSteps: Int, val installDate: String, val history: IntArray)

object StepCounterHelper {
    fun processStepEvent(currentSteps: Int): StepData {
        val mmkv = MMKV.defaultMMKV()
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val displayDateFormat = SimpleDateFormat("dd.MM.yyyy", Locale.getDefault())
        
        var installDate = mmkv.decodeString("install_date", "")
        if (installDate.isNullOrEmpty()) {
            installDate = displayDateFormat.format(Date())
            mmkv.encode("install_date", installDate)
        }

        var lastSteps = mmkv.decodeInt("last_sensor_value", -1)

        if (lastSteps == -1) {
            // Первый запуск, инициализация
            lastSteps = currentSteps
            // На всякий случай обновляем дату при первой инициализации сенсора
            installDate = displayDateFormat.format(Date())
            mmkv.encode("install_date", installDate)
        }

        var delta = currentSteps - lastSteps
        if (delta < 0) {
            // Устройство было перезагружено (текущее значение сбросилось на 0 или меньше предыдущего)
            delta = currentSteps
        }

        var totalNumberOfSteps = mmkv.decodeInt("total_since_install", 0)
        totalNumberOfSteps += delta
        mmkv.encode("total_since_install", totalNumberOfSteps)


        val currentDayString = dateFormat.format(Date())
        val savedDayString = mmkv.decodeString("current_day", "")

        var dailySteps = mmkv.decodeInt("daily_steps", 0)
        if (savedDayString != currentDayString) {
            // Сохраняем вчерашние шаги в историю для графика
            if (!savedDayString.isNullOrEmpty()) {
                mmkv.encode("history_$savedDayString", dailySteps)
            }
            
            // Новый день
            dailySteps = delta
            mmkv.encode("current_day", currentDayString)
        } else {
            // Тот же день
            dailySteps += delta
        }
        mmkv.encode("daily_steps", dailySteps)

        // Сохраняем текущее значение датчика для следующего вычисления
        mmkv.encode("last_sensor_value", currentSteps)

        val historyArray = IntArray(7)
        val dateFormatHistory = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val calendar = java.util.Calendar.getInstance()
        for (i in 6 downTo 1) {
            calendar.time = Date()
            calendar.add(java.util.Calendar.DAY_OF_YEAR, -i)
            val dateStr = dateFormatHistory.format(calendar.time)
            historyArray[6 - i] = mmkv.decodeInt("history_$dateStr", 0)
        }
        historyArray[6] = dailySteps

        return StepData(dailySteps, totalNumberOfSteps, installDate ?: "", historyArray)
    }

    fun getCurrentData(): StepData {
        val mmkv = MMKV.defaultMMKV()
        val dailySteps = mmkv.decodeInt("daily_steps", 0)
        val totalNumberOfSteps = mmkv.decodeInt("total_since_install", 0)
        val installDate = mmkv.decodeString("install_date", "")

        val historyArray = IntArray(7)
        val dateFormatHistory = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val calendar = java.util.Calendar.getInstance()
        for (i in 6 downTo 1) {
            calendar.time = Date()
            calendar.add(java.util.Calendar.DAY_OF_YEAR, -i)
            val dateStr = dateFormatHistory.format(calendar.time)
            historyArray[6 - i] = mmkv.decodeInt("history_$dateStr", 0)
        }
        historyArray[6] = dailySteps

        return StepData(dailySteps, totalNumberOfSteps, installDate ?: "", historyArray)
    }
}
