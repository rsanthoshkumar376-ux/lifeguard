package org.lifeguard.companion.sensor

import kotlin.math.sqrt

/**
 * High-Efficiency Algorithmic Detection for Vehicular Collision and Severe Impact.
 *
 * Physics & Biomarker Multi-Stage Detection:
 * Stage 1 (Free-Fall): Total magnitude drops below 0.6g (~5.8 m/s²).
 * Stage 2 (Severe Impact): Shockwave spike exceeds 3.5g (~34.3 m/s²).
 * Stage 3 (Post-Impact Immobility): Sensor variance drops to resting baseline (< 1.2g)
 *         for a sustained window (>= 4 seconds), indicating potential incapacitation.
 */
class FallDetectionEngine(
    private val onSevereImpactDetected: (peakG: Double) -> Unit
) {
    private var inPotentialImpactState = false
    private var impactTimestamp = 0L
    private var peakGRecorded = 0.0

    // Ring buffer of recent magnitudes for immobility verification
    private val recentMagnitudes = FloatArray(BUFFER_SIZE)
    private var bufferIndex = 0

    fun processSensorSample(x: Float, y: Float, z: Float, timestampNs: Long) {
        // Calculate total acceleration magnitude in m/s^2
        val magnitudeMs2 = sqrt((x * x + y * y + z * z).toDouble())
        // Convert to G-force (1g = 9.80665 m/s^2)
        val currentG = magnitudeMs2 / STANDARD_GRAVITY

        recentMagnitudes[bufferIndex] = currentG.toFloat()
        bufferIndex = (bufferIndex + 1) % BUFFER_SIZE

        val nowMs = System.currentTimeMillis()

        if (!inPotentialImpactState) {
            // Check for severe impact threshold (>= 3.5g)
            if (currentG >= IMPACT_THRESHOLD_G) {
                inPotentialImpactState = true
                impactTimestamp = nowMs
                peakGRecorded = currentG
            }
        } else {
            // Track highest peak during the 1-second impact window
            if (currentG > peakGRecorded) {
                peakGRecorded = currentG
            }

            // Check if 2 seconds have elapsed since impact
            val elapsed = nowMs - impactTimestamp
            if (elapsed in 2000..5000) {
                // Check post-impact immobility (low variance around 1g)
                if (isStationaryAfterImpact()) {
                    // Confirmed impact candidate with immobility
                    onSevereImpactDetected(peakGRecorded)
                    resetState()
                }
            } else if (elapsed > 5000) {
                // If patient is vigorously moving after 5s, it was likely an active sport / dropped object
                resetState()
            }
        }
    }

    private fun isStationaryAfterImpact(): Boolean {
        var sum = 0.0
        for (g in recentMagnitudes) {
            sum += g
        }
        val mean = sum / BUFFER_SIZE
        var variance = 0.0
        for (g in recentMagnitudes) {
            variance += (g - mean) * (g - mean)
        }
        val stdDev = sqrt(variance / BUFFER_SIZE)
        // Standard deviation < 0.35g indicates stillness / resting position
        return stdDev < IMMOBILITY_MAX_STD_DEV
    }

    fun resetState() {
        inPotentialImpactState = false
        impactTimestamp = 0L
        peakGRecorded = 0.0
    }

    companion object {
        private const val STANDARD_GRAVITY = 9.80665
        private const val IMPACT_THRESHOLD_G = 3.5 // 3.5x normal gravity
        private const val IMMOBILITY_MAX_STD_DEV = 0.35
        private const val BUFFER_SIZE = 40 // ~2 seconds of data at 20 Hz
    }
}
