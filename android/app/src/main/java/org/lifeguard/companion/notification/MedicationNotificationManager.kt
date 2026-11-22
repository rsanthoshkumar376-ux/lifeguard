package org.lifeguard.companion.notification

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import org.lifeguard.companion.MainActivity
import org.lifeguard.companion.R
import org.lifeguard.companion.data.model.MedicationDoseItem
import org.lifeguard.companion.receiver.DoseActionReceiver

/**
 * Manages Punctual Local Medication Reminders with Interactive Action Buttons.
 */
class MedicationNotificationManager(private val context: Context) {

    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    fun showMedicationReminder(dose: MedicationDoseItem) {
        val notificationId = dose.id.hashCode()

        // 1. Content Intent (Opens Main App)
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_NAVIGATE_TAB", "medications")
        }
        val openPendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 2. Action Intent: "Mark Taken"
        val markTakenIntent = Intent(context, DoseActionReceiver::class.java).apply {
            action = DoseActionReceiver.ACTION_MARK_TAKEN
            putExtra(DoseActionReceiver.EXTRA_DOSE_ID, dose.id)
            putExtra(DoseActionReceiver.EXTRA_NOTIFICATION_ID, notificationId)
        }
        val markTakenPendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId + 100,
            markTakenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 3. Action Intent: "Snooze 15m"
        val snoozeIntent = Intent(context, DoseActionReceiver::class.java).apply {
            action = DoseActionReceiver.ACTION_SNOOZE_DOSE
            putExtra(DoseActionReceiver.EXTRA_DOSE_ID, dose.id)
            putExtra(DoseActionReceiver.EXTRA_NOTIFICATION_ID, notificationId)
        }
        val snoozePendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId + 200,
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val mealInstruction = when (dose.mealTiming) {
            "before_meal" -> "Take 30 minutes before meal"
            "with_meal" -> "Take with meal / food"
            "after_meal" -> "Take after food"
            else -> "Take as prescribed"
        }

        val notification = NotificationCompat.Builder(context, NotificationChannels.CHANNEL_ID_MEDICATION_REMINDERS)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("💊 Time for Medication: ${dose.name}")
            .setContentText("${dose.dosage} • $mealInstruction")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("Time to take ${dose.name} (${dose.dosage}).\n$mealInstruction.\nScheduled for ${dose.scheduledTime}.")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(openPendingIntent)
            .addAction(
                android.R.drawable.checkbox_on_background,
                context.getString(R.string.action_mark_taken),
                markTakenPendingIntent
            )
            .addAction(
                android.R.drawable.ic_menu_recent_history,
                context.getString(R.string.action_snooze_15m),
                snoozePendingIntent
            )
            .build()

        notificationManager.notify(notificationId, notification)
    }

    fun dismissMedicationReminder(notificationId: Int) {
        notificationManager.cancel(notificationId)
    }
}
