package org.lifeguard.companion.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import org.lifeguard.companion.data.local.CompanionPreferences
import org.lifeguard.companion.notification.LockScreenNotificationManager
import org.lifeguard.companion.notification.NotificationChannels
import org.lifeguard.companion.sensor.SensorMonitoringService

/**
 * Re-instates Notification Channels, Lock-Screen Medical ID,
 * and Permitted Background Sensor Monitoring upon device reboot.
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == Intent.ACTION_LOCKED_BOOT_COMPLETED ||
            intent.action == Intent.ACTION_MY_PACKAGE_REPLACED
        ) {
            // 1. Ensure notification channels exist
            NotificationChannels.createNotificationChannels(context)

            val prefs = CompanionPreferences(context)
            val settings = prefs.getSettings()

            // 2. Restore Persistent Lock-Screen Medical ID if enabled
            if (settings.isLockScreenMedicalIdEnabled) {
                val syncData = prefs.getSyncData()
                val lockScreenManager = LockScreenNotificationManager(context)
                lockScreenManager.showOrUpdateLockScreenNotification(syncData)
            }

            // 3. Restart Background Sensor Monitoring Service if enabled
            if (settings.isBackgroundSensorMonitoringEnabled) {
                val serviceIntent = Intent(context, SensorMonitoringService::class.java)
                ContextCompat.startForegroundService(context, serviceIntent)
            }
        }
    }
}
