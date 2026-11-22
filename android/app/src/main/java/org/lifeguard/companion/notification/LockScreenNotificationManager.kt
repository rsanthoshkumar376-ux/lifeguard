package org.lifeguard.companion.notification

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.app.NotificationCompat
import org.lifeguard.companion.R
import org.lifeguard.companion.data.model.CompanionSyncData
import org.lifeguard.companion.ui.LockScreenActivity

/**
 * Manages the Persistent Lock-Screen Medical ID Notification.
 * Configured with VISIBILITY_PUBLIC so EMTs, paramedics, and responders
 * can view critical allergies, blood group, and emergency contacts on locked devices.
 */
class LockScreenNotificationManager(private val context: Context) {

    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    /**
     * Publishes or updates the persistent lock-screen notification.
     */
    fun showOrUpdateLockScreenNotification(data: CompanionSyncData) {
        val notification = buildLockScreenNotification(data)
        notificationManager.notify(NOTIFICATION_ID_LOCK_SCREEN_MEDICAL_ID, notification)
    }

    fun dismissLockScreenNotification() {
        notificationManager.cancel(NOTIFICATION_ID_LOCK_SCREEN_MEDICAL_ID)
    }

    private fun buildLockScreenNotification(data: CompanionSyncData): Notification {
        // 1. Full-Screen Intent to open LockScreenActivity directly over the Keyguard
        val qrIntent = Intent(context, LockScreenActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val qrPendingIntent = PendingIntent.getActivity(
            context,
            REQUEST_CODE_SHOW_QR,
            qrIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 2. Dial 108 Ambulance Intent (ACTION_DIAL requires explicit tap, never silent)
        val dial108Intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108")).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val dial108PendingIntent = PendingIntent.getActivity(
            context,
            REQUEST_CODE_DIAL_108,
            dial108Intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 3. Dial Primary Emergency Contact Intent
        val primaryPhone = data.emergencyContacts.firstOrNull { it.isPrimary }?.phone ?: "108"
        val dialContactIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$primaryPhone")).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val dialContactPendingIntent = PendingIntent.getActivity(
            context,
            REQUEST_CODE_DIAL_CONTACT,
            dialContactIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val allergiesSummary = if (data.allergies.isNotEmpty()) {
            data.allergies.joinToString(", ")
        } else {
            "No Known Allergies"
        }

        // Expanded InboxStyle formatting
        val inboxStyle = NotificationCompat.InboxStyle()
            .setBigContentTitle("🚨 Emergency Medical ID: ${data.patientName}")
            .setSummaryText("Blood: ${data.bloodGroup} • LifeGuard")
            .addLine("🩸 Blood Group: ${data.bloodGroup}")
            .addLine("⚠️ Allergies: $allergiesSummary")
            .addLine("🏥 Conditions: ${data.criticalConditions.joinToString(", ")}")
            .addLine("📞 Primary Contact: ${data.emergencyContacts.firstOrNull()?.name ?: "108 Ambulance"}")

        // Public version (shown on lock screen)
        val publicNotification = NotificationCompat.Builder(context, NotificationChannels.CHANNEL_ID_MEDICAL_ID_LOCK_SCREEN)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("🚨 EMERGENCY MEDICAL ID: ${data.patientName} (${data.bloodGroup})")
            .setContentText("Allergies: $allergiesSummary")
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setContentIntent(qrPendingIntent)
            .addAction(android.R.drawable.ic_menu_camera, context.getString(R.string.action_show_qr), qrPendingIntent)
            .addAction(android.R.drawable.stat_sys_phone_call, context.getString(R.string.action_call_108), dial108PendingIntent)
            .build()

        return NotificationCompat.Builder(context, NotificationChannels.CHANNEL_ID_MEDICAL_ID_LOCK_SCREEN)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("Emergency Medical ID: ${data.patientName} (${data.bloodGroup})")
            .setContentText("Allergies: $allergiesSummary")
            .setStyle(inboxStyle)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPublicVersion(publicNotification)
            .setContentIntent(qrPendingIntent)
            .addAction(android.R.drawable.ic_menu_camera, context.getString(R.string.action_show_qr), qrPendingIntent)
            .addAction(android.R.drawable.stat_sys_phone_call, context.getString(R.string.action_call_108), dial108PendingIntent)
            .addAction(android.R.drawable.sym_action_call, context.getString(R.string.action_call_contact), dialContactPendingIntent)
            .build()
    }

    companion object {
        const val NOTIFICATION_ID_LOCK_SCREEN_MEDICAL_ID = 1001
        private const val REQUEST_CODE_SHOW_QR = 2001
        private const val REQUEST_CODE_DIAL_108 = 2002
        private const val REQUEST_CODE_DIAL_CONTACT = 2003
    }
}
