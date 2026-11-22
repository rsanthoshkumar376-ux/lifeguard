package org.lifeguard.companion.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Data bundle synchronized from LifeGuard PWA / Backend to Native Companion
 */
@JsonClass(generateAdapter = true)
data class CompanionSyncResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "data") val data: CompanionSyncData,
    @Json(name = "serverTime") val serverTime: String
)

@JsonClass(generateAdapter = true)
data class CompanionSyncData(
    @Json(name = "patientName") val patientName: String,
    @Json(name = "bloodGroup") val bloodGroup: String,
    @Json(name = "allergies") val allergies: List<String>,
    @Json(name = "criticalConditions") val criticalConditions: List<String>,
    @Json(name = "pandemicNote") val pandemicNote: String,
    @Json(name = "emergencyToken") val emergencyToken: String,
    @Json(name = "emergencyContacts") val emergencyContacts: List<EmergencyContact>,
    @Json(name = "todayMedications") val todayMedications: List<MedicationDoseItem>,
    @Json(name = "nearestHospital") val nearestHospital: NearestHospitalInfo,
    @Json(name = "syncTimestamp") val syncTimestamp: String
)

@JsonClass(generateAdapter = true)
data class EmergencyContact(
    @Json(name = "name") val name: String,
    @Json(name = "relationship") val relationship: String,
    @Json(name = "phone") val phone: String,
    @Json(name = "isPrimary") val isPrimary: Boolean
)

@JsonClass(generateAdapter = true)
data class MedicationDoseItem(
    @Json(name = "id") val id: String,
    @Json(name = "name") val name: String,
    @Json(name = "dosage") val dosage: String,
    @Json(name = "scheduledTime") val scheduledTime: String, // HH:MM
    @Json(name = "mealTiming") val mealTiming: String,
    @Json(name = "status") val status: String // "pending" | "taken" | "missed"
)

@JsonClass(generateAdapter = true)
data class NearestHospitalInfo(
    @Json(name = "name") val name: String,
    @Json(name = "emergencyPhone") val emergencyPhone: String,
    @Json(name = "address") val address: String,
    @Json(name = "emergencyDepartmentAvailable") val emergencyDepartmentAvailable: Boolean
)

@JsonClass(generateAdapter = true)
data class DoseUpdateRequest(
    @Json(name = "doseId") val doseId: String,
    @Json(name = "status") val status: String,
    @Json(name = "recordedAt") val recordedAt: String
)

@JsonClass(generateAdapter = true)
data class TelemetryReportRequest(
    @Json(name = "eventType") val eventType: String,
    @Json(name = "peakAccelerationG") val peakAccelerationG: Double,
    @Json(name = "userConfirmed") val userConfirmed: Boolean,
    @Json(name = "latitude") val latitude: Double?,
    @Json(name = "longitude") val longitude: Double?,
    @Json(name = "timestamp") val timestamp: String
)

/**
 * Local settings and permission telemetry
 */
data class CompanionSettings(
    val isLockScreenMedicalIdEnabled: Boolean = true,
    val isBackgroundSensorMonitoringEnabled: Boolean = false,
    val isPunctualMedicationAlarmsEnabled: Boolean = true,
    val isLowPowerSensorMode: Boolean = true,
    val sensorSampleRateHz: Int = 20, // 20Hz for battery efficiency
    val lastSyncTimestamp: String = "",
    val isOfflineMode: Boolean = false
)
