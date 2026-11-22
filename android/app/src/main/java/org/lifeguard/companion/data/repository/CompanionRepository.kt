package org.lifeguard.companion.data.repository

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import org.lifeguard.companion.data.api.CompanionApiService
import org.lifeguard.companion.data.local.CompanionPreferences
import org.lifeguard.companion.data.model.CompanionSettings
import org.lifeguard.companion.data.model.CompanionSyncData
import org.lifeguard.companion.data.model.DoseUpdateRequest
import org.lifeguard.companion.data.model.TelemetryReportRequest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CompanionRepository(
    private val context: Context,
    private val preferences: CompanionPreferences = CompanionPreferences(context),
    private val apiService: CompanionApiService = CompanionApiService.create()
) {
    private val _syncData = MutableStateFlow(preferences.getSyncData())
    val syncData: StateFlow<CompanionSyncData> = _syncData.asStateFlow()

    private val _settings = MutableStateFlow(preferences.getSettings())
    val settings: StateFlow<CompanionSettings> = _settings.asStateFlow()

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()

    suspend fun refreshDataFromCloud(authToken: String? = null): Result<CompanionSyncData> = withContext(Dispatchers.IO) {
        _isSyncing.value = true
        try {
            val response = apiService.fetchSyncBundle(authToken)
            if (response.isSuccessful && response.body()?.data != null) {
                val fresh = response.body()!!.data
                preferences.saveSyncData(fresh)
                _syncData.value = fresh
                Result.success(fresh)
            } else {
                // Return cached data on HTTP error
                Result.success(preferences.getSyncData())
            }
        } catch (e: Exception) {
            // Offline fallback
            Result.success(preferences.getSyncData())
        } finally {
            _isSyncing.value = false
        }
    }

    suspend fun updateDoseStatus(doseId: String, newStatus: String, authToken: String? = null) = withContext(Dispatchers.IO) {
        // 1. Immediate local update
        preferences.updateMedicationStatus(doseId, newStatus)
        _syncData.value = preferences.getSyncData()

        // 2. Asynchronous backend sync
        try {
            val req = DoseUpdateRequest(
                doseId = doseId,
                status = newStatus,
                recordedAt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
            )
            apiService.reportDoseStatus(req, authToken)
        } catch (e: Exception) {
            // Logged for background WorkManager retry
            e.printStackTrace()
        }
    }

    suspend fun reportTelemetry(event: TelemetryReportRequest, authToken: String? = null) = withContext(Dispatchers.IO) {
        try {
            apiService.reportSensorTelemetry(event, authToken)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun setLockScreenEnabled(enabled: Boolean) {
        preferences.setLockScreenEnabled(enabled)
        _settings.value = preferences.getSettings()
    }

    fun setSensorMonitoringEnabled(enabled: Boolean) {
        preferences.setSensorMonitoringEnabled(enabled)
        _settings.value = preferences.getSettings()
    }

    fun getSyncDataSync(): CompanionSyncData = preferences.getSyncData()
}
