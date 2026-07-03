package com.pedometer

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.tencent.mmkv.MMKV

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val mmkv = MMKV.defaultMMKV()
            val isEnabled = mmkv.decodeBool("is_tracking_enabled", true)
            
            if (isEnabled) {
                val serviceIntent = Intent(context, PedometerService::class.java).apply {
                    action = PedometerService.ACTION_START
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }
}
