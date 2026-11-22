package org.lifeguard.companion.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import org.lifeguard.companion.data.model.CompanionSyncResponse
import org.lifeguard.companion.data.model.DoseUpdateRequest
import org.lifeguard.companion.data.model.TelemetryReportRequest
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

interface CompanionApiService {

    @GET("api/companion/sync")
    suspend fun fetchSyncBundle(
        @Header("Authorization") authToken: String? = null
    ): Response<CompanionSyncResponse>

    @POST("api/companion/dose")
    suspend fun reportDoseStatus(
        @Body request: DoseUpdateRequest,
        @Header("Authorization") authToken: String? = null
    ): Response<Map<String, Any>>

    @POST("api/companion/telemetry")
    suspend fun reportSensorTelemetry(
        @Body request: TelemetryReportRequest,
        @Header("Authorization") authToken: String? = null
    ): Response<Map<String, Any>>

    companion object {
        // Default emulator host; can be configured to live production API
        private const val BASE_URL = "http://10.0.2.2:5000/"

        fun create(): CompanionApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BASIC
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(MoshiConverterFactory.create())
                .build()
                .create(CompanionApiService::class.java)
        }
    }
}
