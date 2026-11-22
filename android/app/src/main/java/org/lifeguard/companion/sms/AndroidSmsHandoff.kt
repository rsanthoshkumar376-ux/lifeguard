package org.lifeguard.companion.sms

import android.content.Context
import android.content.Intent
import android.net.Uri
import org.lifeguard.companion.data.model.CompanionSyncData

/**
 * Android SMS & Dialer Handoff Manager.
 *
 * SAFETY PRINCIPLE:
 * Strictly complies with the mandate: "Do not silently send messages or automatically contact emergency services."
 * Never uses SmsManager to background-send SMS without user consent.
 * Never uses ACTION_CALL to automatically dial 108/112 without confirmation.
 * Uses ACTION_SENDTO and ACTION_DIAL to present pre-composed distress details in native system apps
 * for explicit human review and delivery.
 */
object AndroidSmsHandoff {

    /**
     * Formats emergency distress message and launches the system SMS application.
     */
    fun openSmsHandoff(
        context: Context,
        data: CompanionSyncData,
        latitude: Double? = null,
        longitude: Double? = null,
        customNote: String? = null
    ) {
        val primaryPhones = data.emergencyContacts.map { it.phone.trim() }.filter { it.isNotBlank() }
        val phoneNumbersJoined = if (primaryPhones.isNotEmpty()) {
            primaryPhones.joinToString(";")
        } else {
            ""
        }

        // Build comprehensive, life-saving distress message
        val messageBody = buildString {
            append("🚨 EMERGENCY DISTRESS ALERT (via LifeGuard)\n\n")
            append("Patient: ${data.patientName}\n")
            append("Blood Group: ${data.bloodGroup}\n")
            if (data.allergies.isNotEmpty()) {
                append("⚠️ Allergies: ${data.allergies.joinToString(", ")}\n")
            }
            if (data.criticalConditions.isNotEmpty()) {
                append("🏥 Conditions: ${data.criticalConditions.joinToString(", ")}\n")
            }

            if (latitude != null && longitude != null) {
                append("\n📍 Live GPS Location:\n")
                append("https://maps.google.com/?q=$latitude,$longitude\n")
                append("(${String.format("%.5f", latitude)}, ${String.format("%.5f", longitude)})\n")
            }

            if (!customNote.isNullOrBlank()) {
                append("\nNote: $customNote\n")
            }

            append("\n🪪 Public Medical ID & Direct ER Summary:\n")
            append("https://lifeguard-azure.vercel.app/emergency/view?token=${data.emergencyToken}\n\n")
            append("Please call Ambulance 108 or attend immediately.")
        }

        val smsUri = if (phoneNumbersJoined.isNotBlank()) {
            Uri.parse("smsto:$phoneNumbersJoined")
        } else {
            Uri.parse("smsto:")
        }

        val smsIntent = Intent(Intent.ACTION_SENDTO, smsUri).apply {
            putExtra("sms_body", messageBody)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }

        try {
            context.startActivity(smsIntent)
        } catch (e: Exception) {
            // Fallback to generic ACTION_SEND if smsto handler is unavailable
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, messageBody)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(Intent.createChooser(shareIntent, "Send LifeGuard Emergency SMS via:"))
        }
    }

    /**
     * Opens the native Android dialer with Ambulance 108 pre-filled.
     */
    fun openAmbulanceDialer(context: Context) {
        openDialer(context, "108")
    }

    /**
     * Opens the native Android dialer with All-India Emergency 112 pre-filled.
     */
    fun openEmergencyDialer(context: Context) {
        openDialer(context, "112")
    }

    /**
     * Opens the native Android dialer for a specific contact.
     */
    fun openDialer(context: Context, phoneNumber: String) {
        val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phoneNumber")).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        try {
            context.startActivity(dialIntent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
