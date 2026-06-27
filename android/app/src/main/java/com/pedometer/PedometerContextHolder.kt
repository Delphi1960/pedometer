package com.pedometer

import com.facebook.react.bridge.ReactApplicationContext

object PedometerContextHolder {
    private var reactContext: ReactApplicationContext? = null

    fun setContext(context: ReactApplicationContext?) {
        reactContext = context
    }

    fun getContext(): ReactApplicationContext? {
        return reactContext
    }
}
