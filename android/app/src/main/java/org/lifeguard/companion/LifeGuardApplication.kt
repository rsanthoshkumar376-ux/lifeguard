package org.lifeguard.companion

import android.app.Application
import org.lifeguard.companion.data.local.CompanionPreferences
import org.lifeguard.companion.notification.LockScreenNotificationManager
import org.lifeguard.companion.notification.NotificationChannels
import org.lifeguard.companion.worker.LifeGuardSyncWorker

class LifeGuardApplication : Application() {

    lateinit var preferences: CompanionPreferences
        private set

    lateinit var lockScreenManager: LockScreenNotificationManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // 1. Initialize Android Native Notification Channels
        NotificationChannels.createNotificationChannels(this)

        preferences = CompanionPreferences(this)
        lockScreenManager = LockScreenNotificationManager(this)

        // 2. Schedule battery-efficient WorkManager periodic sync
        LifeGuardSyncWorker.enqueue(this)

        // 3. Post lock-screen notification if enabled
        if (preferences.isLockScreenEnabled()) {
            val syncData = preferences.getSyncData()
            lockScreenManager.showOrUpdateLockScreenNotification(syncData)
        }
    }

    companion object {
        lateinit var instance: LifeGuardApplication
            private set
    }
}
