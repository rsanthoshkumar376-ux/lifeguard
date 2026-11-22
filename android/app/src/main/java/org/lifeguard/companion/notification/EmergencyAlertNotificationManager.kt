package org.lifeguard.companion.notification

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.app.NotificationCompat
import org.lifeguard.companion.MainActivity
import org.lifeguard.companion.R

/**
 * Manages High-Priority Emergency Alerts & Sirens.
 */
class EmergencyAlertNotificationManager(private val context: Context) {

    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    fun showEmergencySosAlert(title: String, message: String) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_NAVIGATE_TAB", "emergency")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID_SOS_ALERT,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val dial108Intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108")).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val dial108PendingIntent = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID_SOS_ALERT + 1,
            dial108Intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, NotificationChannels.CHANNEL_ID_EMERGENCY_SOS)
            .setSmallIcon(android.R.drawable.stat_notify_error)
            .setContentTitle("🚨 $title")
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(false)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .addAction(android.R.drawable.stat_sys_phone_call, context.getString(R.string.action_call_108), dial108PendingIntent)
            .build()

        notificationManager.notify(NOTIFICATION_ID_SOS_ALERT, notification)
    }

    companion object {
        const val NOTIFICATION_ID_SOS_ALERT = 9901
    }
}
