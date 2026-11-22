package org.lifeguard.companion.receiver

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import android.widget.Toast
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.lifeguard.companion.data.local.CompanionPreferences
import org.lifeguard.companion.data.repository.CompanionRepository
import org.lifeguard.companion.notification.MedicationNotificationManager

/**
 * Handles interactive Notification Action clicks ("Mark Taken", "Snooze 15m")
 * without requiring the user to open the foreground application.
 */
class DoseActionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val doseId = intent.getStringExtra(EXTRA_DOSE_ID) ?: return
        val notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, -1)

        val notificationManager = MedicationNotificationManager(context)
        val repository = CompanionRepository(context)

        when (action) {
            ACTION_MARK_TAKEN -> {
                // 1. Dismiss notification
                if (notificationId != -1) {
                    notificationManager.dismissMedicationReminder(notificationId)
                }

                // 2. Persist taken status locally & sync to backend
                CoroutineScope(Dispatchers.IO).launch {
                    repository.updateDoseStatus(doseId, "taken")
                }

                Toast.makeText(context, "✅ Marked medicine as taken", Toast.LENGTH_SHORT).show()
            }

            ACTION_SNOOZE_DOSE -> {
                // 1. Dismiss notification
                if (notificationId != -1) {
                    notificationManager.dismissMedicationReminder(notificationId)
                }

                // 2. Schedule snooze alarm in 15 minutes
                scheduleSnoozeAlarm(context, doseId)

                Toast.makeText(context, "⏰ Snoozed medicine reminder for 15 minutes", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun scheduleSnoozeAlarm(context: Context, doseId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val snoozeIntent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra(AlarmReceiver.EXTRA_DOSE_ID, doseId)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            doseId.hashCode() + 500,
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 15 minutes = 15 * 60 * 1000 ms
        val triggerAt = SystemClock.elapsedRealtime() + (15 * 60 * 1000)

        try {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                triggerAt,
                pendingIntent
            )
        } catch (e: Exception) {
            alarmManager.set(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                triggerAt,
                pendingIntent
            )
        }
    }

    companion object {
        const val ACTION_MARK_TAKEN = "org.lifeguard.companion.ACTION_MARK_TAKEN"
        const val ACTION_SNOOZE_DOSE = "org.lifeguard.companion.ACTION_SNOOZE_DOSE"
        const val EXTRA_DOSE_ID = "EXTRA_DOSE_ID"
        const val EXTRA_NOTIFICATION_ID = "EXTRA_NOTIFICATION_ID"
    }
}
