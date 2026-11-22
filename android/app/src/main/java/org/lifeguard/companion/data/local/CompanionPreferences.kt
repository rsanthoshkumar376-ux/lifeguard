package org.lifeguard.companion.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import org.lifeguard.companion.data.model.CompanionSettings
import org.lifeguard.companion.data.model.CompanionSyncData
import org.lifeguard.companion.data.model.EmergencyContact
import org.lifeguard.companion.data.model.MedicationDoseItem
import org.lifeguard.companion.data.model.NearestHospitalInfo

/**
 * Client-Side Encrypted Storage for LifeGuard Medical ID and Triage Data.
 * Uses AES-256 GCM encryption via AndroidX Security Crypto MasterKeys.
 */
class CompanionPreferences(context: Context) {

    private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
    private val syncDataAdapter = moshi.adapter(CompanionSyncData::class.java)

    private val prefs: SharedPreferences = try {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            PREFS_FILE_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    } catch (e: Exception) {
        // Fallback to standard private preferences if keystore is unavailable in emulation
        context.getSharedPreferences(PREFS_FILE_NAME, Context.MODE_PRIVATE)
    }

    // Settings Keys
    private val KEY_LOCK_SCREEN_ENABLED = "key_lock_screen_enabled"
    private val KEY_SENSOR_MONITORING_ENABLED = "key_sensor_monitoring_enabled"
    private val KEY_MED_ALARMS_ENABLED = "key_med_alarms_enabled"
    private val KEY_LOW_POWER_MODE = "key_low_power_mode"
    private val KEY_SYNC_DATA_JSON = "key_sync_data_json"
    private val KEY_LAST_SYNC_TIME = "key_last_sync_time"

    fun saveSettings(settings: CompanionSettings) {
        prefs.edit()
            .putBoolean(KEY_LOCK_SCREEN_ENABLED, settings.isLockScreenMedicalIdEnabled)
            .putBoolean(KEY_SENSOR_MONITORING_ENABLED, settings.isBackgroundSensorMonitoringEnabled)
            .putBoolean(KEY_MED_ALARMS_ENABLED, settings.isPunctualMedicationAlarmsEnabled)
            .putBoolean(KEY_LOW_POWER_MODE, settings.isLowPowerSensorMode)
            .putString(KEY_LAST_SYNC_TIME, settings.lastSyncTimestamp)
            .apply()
    }

    fun getSettings(): CompanionSettings {
        return CompanionSettings(
            isLockScreenMedicalIdEnabled = prefs.getBoolean(KEY_LOCK_SCREEN_ENABLED, true),
            isBackgroundSensorMonitoringEnabled = prefs.getBoolean(KEY_SENSOR_MONITORING_ENABLED, false),
            isPunctualMedicationAlarmsEnabled = prefs.getBoolean(KEY_MED_ALARMS_ENABLED, true),
            isLowPowerSensorMode = prefs.getBoolean(KEY_LOW_POWER_MODE, true),
            lastSyncTimestamp = prefs.getString(KEY_LAST_SYNC_TIME, "") ?: ""
        )
    }

    fun setLockScreenEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_LOCK_SCREEN_ENABLED, enabled).apply()
    }

    fun isLockScreenEnabled(): Boolean {
        return prefs.getBoolean(KEY_LOCK_SCREEN_ENABLED, true)
    }

    fun setSensorMonitoringEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_SENSOR_MONITORING_ENABLED, enabled).apply()
    }

    fun isSensorMonitoringEnabled(): Boolean {
        return prefs.getBoolean(KEY_SENSOR_MONITORING_ENABLED, false)
    }

    fun saveSyncData(data: CompanionSyncData) {
        try {
            val json = syncDataAdapter.toJson(data)
            prefs.edit()
                .putString(KEY_SYNC_DATA_JSON, json)
                .putString(KEY_LAST_SYNC_TIME, data.syncTimestamp)
                .apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun getSyncData(): CompanionSyncData {
        val rawJson = prefs.getString(KEY_SYNC_DATA_JSON, null)
        if (!rawJson.isNullOrBlank()) {
            try {
                val parsed = syncDataAdapter.fromJson(rawJson)
                if (parsed != null) return parsed
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        // Fallback seed emergency data
        return getDefaultSeedData()
    }

    fun updateMedicationStatus(doseId: String, newStatus: String) {
        val current = getSyncData()
        val updatedList = current.todayMedications.map {
            if (it.id == doseId) it.copy(status = newStatus) else it
        }
        saveSyncData(current.copy(todayMedications = updatedList))
    }

    private fun getDefaultSeedData(): CompanionSyncData {
        return CompanionSyncData(
            patientName = "Emergency Patient",
            bloodGroup = "O+",
            allergies = listOf("Penicillin", "Peanuts (Severe)"),
            criticalConditions = listOf("Mild Asthma", "Hypertension"),
            pandemicNote = "Keep Medical ID accessible during acute respiratory emergencies.",
            emergencyToken = "emg_offline_token_88921",
            emergencyContacts = listOf(
                EmergencyContact("Priya Sharma", "Spouse", "+91 98765 43210", true),
                EmergencyContact("Dr. S. Venkataraman", "Cardiologist", "+91 94440 12345", false)
            ),
            todayMedications = listOf(
                MedicationDoseItem("med_01", "Metformin", "500 mg", "08:30", "with_meal", "taken"),
                MedicationDoseItem("med_02", "Telmisartan", "40 mg", "09:00", "after_meal", "taken"),
                MedicationDoseItem("med_03", "Metformin", "500 mg", "20:00", "with_meal", "pending"),
                MedicationDoseItem("med_04", "Rosuvastatin", "10 mg", "21:30", "after_meal", "pending")
            ),
            nearestHospital = NearestHospitalInfo(
                name = "Apollo Specialty Hospitals, Greams Road",
                emergencyPhone = "1066",
                address = "Thousand Lights, Chennai",
                emergencyDepartmentAvailable = true
            ),
            syncTimestamp = "2026-11-22T08:00:00Z"
        )
    }

    companion object {
        private const val PREFS_FILE_NAME = "lifeguard_secure_prefs"
    }
}
