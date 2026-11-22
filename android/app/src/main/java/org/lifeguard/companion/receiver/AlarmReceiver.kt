package org.lifeguard.companion.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import org.lifeguard.companion.data.local.CompanionPreferences
import org.lifeguard.companion.data.model.MedicationDoseItem
import org.lifeguard.companion.notification.MedicationNotificationManager

/**
 * Triggered by AlarmManager (setExactAndAllowWhileIdle) to display
 * punctual medication reminders even when device is in Android Doze mode.
 */
class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val doseId = intent.getStringExtra(EXTRA_DOSE_ID) ?: return
        val prefs = CompanionPreferences(context)
        val syncData = prefs.getSyncData()

        val dose = syncData.todayMedications.find { it.id == doseId } ?: MedicationDoseItem(
            id = doseId,
            name = intent.getStringExtra(EXTRA_MED_NAME) ?: "Prescription Medicine",
            dosage = intent.getStringExtra(EXTRA_DOSAGE) ?: "1 Dose",
            scheduledTime = intent.getStringExtra(EXTRA_SCHEDULED_TIME) ?: "Now",
            mealTiming = "as_prescribed",
            status = "pending"
        )

        // Only show notification if dose has not already been marked taken
        if (dose.status != "taken") {
            val notificationManager = MedicationNotificationManager(context)
            notificationManager.showMedicationReminder(dose)
        }
    }

    companion object {
        const val EXTRA_DOSE_ID = "EXTRA_DOSE_ID"
        const val EXTRA_MED_NAME = "EXTRA_MED_NAME"
        const val EXTRA_DOSAGE = "EXTRA_DOSAGE"
        const val EXTRA_SCHEDULED_TIME = "EXTRA_SCHEDULED_TIME"
    }
}
