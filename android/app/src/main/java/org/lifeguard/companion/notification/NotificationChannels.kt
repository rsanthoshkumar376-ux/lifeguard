package org.lifeguard.companion.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.annotation.RequiresApi
import org.lifeguard.companion.R

/**
 * Manages Android Native Notification Channels with precise priority,
 * audio attributes, DND bypass, and lock-screen visibility settings.
 */
object NotificationChannels {

    // 1. Life-Critical SOS Channel (Maximum Priority, Siren Sound, DND Bypass)
    const val CHANNEL_ID_EMERGENCY_SOS = "channel_lifeguard_emergency_sos"

    // 2. Lock-Screen Medical ID Channel (Low Priority, Persistent, Public Visibility)
    const val CHANNEL_ID_MEDICAL_ID_LOCK_SCREEN = "channel_lifeguard_medical_id_lock_screen"

    // 3. Medication Reminders Channel (High Priority, Alarm Audio, Quick Actions)
    const val CHANNEL_ID_MEDICATION_REMINDERS = "channel_lifeguard_medication_reminders"

    // 4. Blood Donor Network Channel (Default Priority)
    const val CHANNEL_ID_BLOOD_NETWORK = "channel_lifeguard_blood_network"

    // 5. Permitted Background Sensor Monitoring Service Channel (Min Priority, Silent)
    const val CHANNEL_ID_SENSOR_SERVICE = "channel_lifeguard_sensor_service"

    /**
     * Initializes all 5 notification channels upon application startup.
     */
    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val channels = listOf(
                createEmergencySosChannel(context),
                createMedicalIdLockScreenChannel(context),
                createMedicationRemindersChannel(context),
                createBloodNetworkChannel(context),
                createSensorServiceChannel(context)
            )

            notificationManager.createNotificationChannels(channels)
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createEmergencySosChannel(context: Context): NotificationChannel {
        return NotificationChannel(
            CHANNEL_ID_EMERGENCY_SOS,
            context.getString(R.string.channel_emergency_sos_name),
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = context.getString(R.string.channel_emergency_sos_desc)
            enableLights(true)
            lightColor = 0xFFFF0000.toInt() // Red LED
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 400, 200, 400, 200, 800)
            lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            setBypassDnd(true)

            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build()
            setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM), audioAttributes)
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createMedicalIdLockScreenChannel(context: Context): NotificationChannel {
        return NotificationChannel(
            CHANNEL_ID_MEDICAL_ID_LOCK_SCREEN,
            context.getString(R.string.channel_medical_id_name),
            NotificationManager.IMPORTANCE_LOW // Low importance so it stays quiet and persistent
        ).apply {
            description = context.getString(R.string.channel_medical_id_desc)
            setShowBadge(false)
            enableLights(false)
            enableVibration(false)
            setSound(null, null)
            lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createMedicationRemindersChannel(context: Context): NotificationChannel {
        return NotificationChannel(
            CHANNEL_ID_MEDICATION_REMINDERS,
            context.getString(R.string.channel_medication_reminders_name),
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = context.getString(R.string.channel_medication_reminders_desc)
            enableLights(true)
            lightColor = 0xFF0284C7.toInt() // Medical Blue
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 300, 150, 300)
            lockscreenVisibility = android.app.Notification.VISIBILITY_PRIVATE

            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT)
                .build()
            setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION), audioAttributes)
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createBloodNetworkChannel(context: Context): NotificationChannel {
        return NotificationChannel(
            CHANNEL_ID_BLOOD_NETWORK,
            context.getString(R.string.channel_blood_network_name),
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = context.getString(R.string.channel_blood_network_desc)
            enableLights(true)
            lightColor = 0xFFDC2626.toInt()
            lockscreenVisibility = android.app.Notification.VISIBILITY_PRIVATE
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createSensorServiceChannel(context: Context): NotificationChannel {
        return NotificationChannel(
            CHANNEL_ID_SENSOR_SERVICE,
            context.getString(R.string.channel_sensor_service_name),
            NotificationManager.IMPORTANCE_MIN
        ).apply {
            description = context.getString(R.string.channel_sensor_service_desc)
            setShowBadge(false)
            enableLights(false)
            enableVibration(false)
            setSound(null, null)
            lockscreenVisibility = android.app.Notification.VISIBILITY_SECRET
        }
    }
}
