package org.lifeguard.companion.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import org.lifeguard.companion.ui.LockScreenActivity

/**
 * Handles Emergency Quick Actions triggered from notifications.
 */
class EmergencyActionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        when (action) {
            ACTION_SHOW_LOCK_SCREEN_QR -> {
                val qrIntent = Intent(context, LockScreenActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                context.startActivity(qrIntent)
            }

            ACTION_DIAL_HOTLINE -> {
                val number = intent.getStringExtra(EXTRA_PHONE_NUMBER) ?: "108"
                // Opens system dialer with number pre-filled; requires explicit user tap
                val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$number")).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(dialIntent)
            }
        }
    }

    companion object {
        const val ACTION_SHOW_LOCK_SCREEN_QR = "org.lifeguard.companion.ACTION_SHOW_LOCK_SCREEN_QR"
        const val ACTION_DIAL_HOTLINE = "org.lifeguard.companion.ACTION_DIAL_HOTLINE"
        const val EXTRA_PHONE_NUMBER = "EXTRA_PHONE_NUMBER"
    }
}
