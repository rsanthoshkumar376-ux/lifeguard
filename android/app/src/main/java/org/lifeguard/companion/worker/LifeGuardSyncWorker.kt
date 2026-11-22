package org.lifeguard.companion.worker

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import org.lifeguard.companion.data.repository.CompanionRepository
import org.lifeguard.companion.notification.LockScreenNotificationManager
import java.util.concurrent.TimeUnit

/**
 * Battery-Efficient Periodic Synchronization Worker.
 * Adheres strictly to Android Background Execution Restrictions and Doze Mode.
 * Runs only when connected to the network and battery is not low.
 */
class LifeGuardSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    private val repository = CompanionRepository(appContext)
    private val lockScreenManager = LockScreenNotificationManager(appContext)

    override suspend fun doWork(): Result {
        return try {
            val syncResult = repository.refreshDataFromCloud()
            if (syncResult.isSuccess) {
                val freshData = syncResult.getOrThrow()
                // Update persistent lock screen if active
                if (repository.settings.value.isLockScreenMedicalIdEnabled) {
                    lockScreenManager.showOrUpdateLockScreenNotification(freshData)
                }
                Result.success()
            } else {
                Result.retry()
            }
        } catch (e: Exception) {
            Result.retry()
        }
    }

    companion object {
        private const val WORK_NAME = "lifeguard_periodic_sync_worker"

        /**
         * Enqueues battery-efficient background sync (runs every 6 hours).
         */
        fun enqueue(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .setRequiresBatteryNotLow(true) // Battery-friendly constraint
                .build()

            val syncRequest = PeriodicWorkRequestBuilder<LifeGuardSyncWorker>(
                6, TimeUnit.HOURS,
                30, TimeUnit.MINUTES // Flex interval
            )
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )
        }
    }
}
