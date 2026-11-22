package org.lifeguard.companion.sensor

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.IBinder
import androidx.core.app.NotificationCompat
import org.lifeguard.companion.MainActivity
import org.lifeguard.companion.data.local.CompanionPreferences
import org.lifeguard.companion.notification.EmergencyAlertNotificationManager
import org.lifeguard.companion.notification.NotificationChannels

/**
 * Permitted Background Sensor Monitoring Service.
 * Runs as a foreground service with low power consumption (< 1% battery / 24h).
 * Monitors 3-axis accelerometer at 20 Hz (SENSOR_DELAY_NORMAL).
 *
 * SAFETY GUARDRAIL:
 * Does NOT silently dispatch messages or contact emergency services.
 * Upon severe impact detection, notifies the user and launches an interactive
 * confirmation screen for manual verification.
 */
class SensorMonitoringService : Service(), SensorEventListener {

    private lateinit var sensorManager: SensorManager
    private var accelerometer: Sensor? = null
    private lateinit var fallEngine: FallDetectionEngine
    private lateinit var prefs: CompanionPreferences

    override fun onCreate() {
        super.onCreate()
        prefs = CompanionPreferences(this)
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

        fallEngine = FallDetectionEngine { peakG ->
            handlePotentialEmergency(peakG)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 1. Post required ongoing notification for foreground service compliance
        val notification = buildForegroundNotification()
        startForeground(NOTIFICATION_ID_SENSOR_SERVICE, notification)

        // 2. Register accelerometer listener at SENSOR_DELAY_NORMAL (20Hz, battery efficient)
        accelerometer?.let {
            sensorManager.registerListener(
                this,
                it,
                SensorManager.SENSOR_DELAY_NORMAL,
                1000000 // 1-second batching latency to allow CPU sleep
            )
        }

        prefs.setSensorMonitoringEnabled(true)
        return START_STICKY
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            fallEngine.processSensorSample(
                event.values[0],
                event.values[1],
                event.values[2],
                event.timestamp
            )
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // No-op
    }

    private fun handlePotentialEmergency(peakG: Double) {
        // Trigger high-priority heads-up notification with interactive confirmation
        val alertManager = EmergencyAlertNotificationManager(this)
        alertManager.showEmergencySosAlert(
            "Severe Impact Detected (${String.format("%.1f", peakG)}g)",
            "LifeGuard detected a potential vehicle collision or hard fall. Tap here to confirm if you need emergency assistance."
        )

        // Also broadcast or launch confirmation dialog in MainActivity if device is awake
        val promptIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("EXTRA_SHOW_IMPACT_CONFIRMATION", true)
            putExtra("EXTRA_PEAK_G", peakG)
        }
        startActivity(promptIntent)
    }

    private fun buildForegroundNotification(): Notification {
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, NotificationChannels.CHANNEL_ID_SENSOR_SERVICE)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("LifeGuard Safety Monitoring Active")
            .setContentText("Background sensor protection running in battery-efficient mode.")
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        sensorManager.unregisterListener(this)
        prefs.setSensorMonitoringEnabled(false)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val NOTIFICATION_ID_SENSOR_SERVICE = 3001

        fun start(context: Context) {
            val intent = Intent(context, SensorMonitoringService::class.java)
            context.startForegroundService(intent)
        }

        fun stop(context: Context) {
            val intent = Intent(context, SensorMonitoringService::class.java)
            context.stopService(intent)
        }
    }
}
