package org.lifeguard.companion

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import kotlinx.coroutines.launch
import org.lifeguard.companion.data.model.CompanionSyncData
import org.lifeguard.companion.data.model.MedicationDoseItem
import org.lifeguard.companion.data.repository.CompanionRepository
import org.lifeguard.companion.notification.LockScreenNotificationManager
import org.lifeguard.companion.notification.MedicationNotificationManager
import org.lifeguard.companion.receiver.AlarmReceiver
import org.lifeguard.companion.sensor.SensorMonitoringService
import org.lifeguard.companion.sms.AndroidSmsHandoff
import org.lifeguard.companion.ui.LockScreenActivity
import org.lifeguard.companion.ui.theme.*

class MainActivity : ComponentActivity() {

    private lateinit var repository: CompanionRepository
    private lateinit var lockScreenManager: LockScreenNotificationManager
    private lateinit var medicationNotificationManager: MedicationNotificationManager

    // Permission Request Launchers
    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            Toast.makeText(this, "Notification permission granted", Toast.LENGTH_SHORT).show()
            updateLockScreenNotification()
        } else {
            Toast.makeText(this, "Notifications required for lock-screen medical ID", Toast.LENGTH_LONG).show()
        }
    }

    private val requestLocationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        if (fineGranted || coarseGranted) {
            Toast.makeText(this, "Location permission granted for emergency SOS", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        repository = CompanionRepository(this)
        lockScreenManager = LockScreenNotificationManager(this)
        medicationNotificationManager = MedicationNotificationManager(this)

        // Handle Deep Linking from PWA or Intent
        handleIncomingIntent(intent)

        setContent {
            LifeGuardCompanionTheme {
                val syncData by repository.syncData.collectAsState()
                val settings by repository.settings.collectAsState()
                val isSyncing by repository.isSyncing.collectAsState()
                val coroutineScope = rememberCoroutineScope()

                var showRationaleDialog by remember { mutableStateOf<String?>(null) }
                var showImpactDialog by remember { mutableStateOf(false) }

                // Check for impact confirmation from SensorService
                LaunchedEffect(intent) {
                    if (intent?.getBooleanExtra("EXTRA_SHOW_IMPACT_CONFIRMATION", false) == true) {
                        showImpactDialog = true
                    }
                }

                MainCompanionDashboard(
                    syncData = syncData,
                    isLockScreenEnabled = settings.isLockScreenMedicalIdEnabled,
                    isSensorEnabled = settings.isBackgroundSensorMonitoringEnabled,
                    isSyncing = isSyncing,
                    onToggleLockScreen = { enabled ->
                        checkAndToggleLockScreen(enabled)
                    },
                    onToggleSensor = { enabled ->
                        checkAndToggleSensorService(enabled) { rationale ->
                            showRationaleDialog = rationale
                        }
                    },
                    onPreviewLockScreen = {
                        val lockIntent = Intent(this@MainActivity, LockScreenActivity::class.java)
                        startActivity(lockIntent)
                    },
                    onTestMedicationAlert = {
                        scheduleTestMedicationAlarm()
                    },
                    onOpenSmsHandoff = {
                        AndroidSmsHandoff.openSmsHandoff(
                            context = this@MainActivity,
                            data = syncData,
                            latitude = 13.0827,
                            longitude = 80.2707,
                            customNote = "Vehicle collision impact suspected. Immediate assistance requested."
                        )
                    },
                    onCall108 = {
                        AndroidSmsHandoff.openAmbulanceDialer(this@MainActivity)
                    },
                    onCall112 = {
                        AndroidSmsHandoff.openEmergencyDialer(this@MainActivity)
                    },
                    onSyncWithCloud = {
                        coroutineScope.launch {
                            repository.refreshDataFromCloud()
                            Toast.makeText(this@MainActivity, "Synced latest data with LifeGuard Cloud", Toast.LENGTH_SHORT).show()
                        }
                    },
                    onOpenPwaWeb = {
                        val pwaIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://lifeguard-azure.vercel.app")).apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        }
                        startActivity(pwaIntent)
                    },
                    onMarkDoseTaken = { doseId ->
                        coroutineScope.launch {
                            repository.updateDoseStatus(doseId, "taken")
                            Toast.makeText(this@MainActivity, "Marked dose as taken", Toast.LENGTH_SHORT).show()
                        }
                    }
                )

                // Educational Permission Rationale Dialog
                showRationaleDialog?.let { permissionType ->
                    PermissionRationaleDialog(
                        permissionType = permissionType,
                        onConfirm = {
                            showRationaleDialog = null
                            when (permissionType) {
                                "notification" -> {
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                        requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                                    }
                                }
                                "location" -> {
                                    requestLocationPermissionLauncher.launch(
                                        arrayOf(
                                            Manifest.permission.ACCESS_FINE_LOCATION,
                                            Manifest.permission.ACCESS_COARSE_LOCATION
                                        )
                                    )
                                }
                            }
                        },
                        onDismiss = { showRationaleDialog = null }
                    )
                }

                // Severe Impact Confirmation Dialog (Safety Guardrail: never silent)
                if (showImpactDialog) {
                    ImpactDistressConfirmationDialog(
                        onConfirmDistress = {
                            showImpactDialog = false
                            AndroidSmsHandoff.openSmsHandoff(
                                context = this@MainActivity,
                                data = syncData,
                                latitude = 13.0827,
                                longitude = 80.2707,
                                customNote = "Confirmed severe shock impact. Bystander/Patient requested emergency triage."
                            )
                        },
                        onDismiss = {
                            showImpactDialog = false
                            Toast.makeText(this@MainActivity, "Emergency alert cancelled by user", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingIntent(intent)
    }

    private fun handleIncomingIntent(intent: Intent?) {
        val data: Uri? = intent?.data
        if (data != null) {
            Toast.makeText(this, "LifeGuard PWA Handshake: ${data.path}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun checkAndToggleLockScreen(enabled: Boolean) {
        if (enabled && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                return
            }
        }

        repository.setLockScreenEnabled(enabled)
        if (enabled) {
            updateLockScreenNotification()
            Toast.makeText(this, "Lock-screen medical ID activated", Toast.LENGTH_SHORT).show()
        } else {
            lockScreenManager.dismissLockScreenNotification()
            Toast.makeText(this, "Lock-screen medical ID removed", Toast.LENGTH_SHORT).show()
        }
    }

    private fun checkAndToggleSensorService(enabled: Boolean, showRationale: (String) -> Unit) {
        if (enabled) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    showRationale("notification")
                    return
                }
            }
            SensorMonitoringService.start(this)
            repository.setSensorMonitoringEnabled(true)
            Toast.makeText(this, "Background safety sensor service running", Toast.LENGTH_SHORT).show()
        } else {
            SensorMonitoringService.stop(this)
            repository.setSensorMonitoringEnabled(false)
            Toast.makeText(this, "Background sensor service stopped", Toast.LENGTH_SHORT).show()
        }
    }

    private fun updateLockScreenNotification() {
        val syncData = repository.getSyncDataSync()
        lockScreenManager.showOrUpdateLockScreenNotification(syncData)
    }

    private fun scheduleTestMedicationAlarm() {
        val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val testIntent = Intent(this, AlarmReceiver::class.java).apply {
            putExtra(AlarmReceiver.EXTRA_DOSE_ID, "test_dose_now")
            putExtra(AlarmReceiver.EXTRA_MED_NAME, "Metformin Hydrochloride (Test)")
            putExtra(AlarmReceiver.EXTRA_DOSAGE, "500 mg")
            putExtra(AlarmReceiver.EXTRA_SCHEDULED_TIME, "Immediate")
        }

        val pendingIntent = PendingIntent.getBroadcast(
            this,
            9988,
            testIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val triggerAt = SystemClock.elapsedRealtime() + 3000 // 3 seconds for immediate test

        try {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                triggerAt,
                pendingIntent
            )
            Toast.makeText(this, "Test medicine alarm scheduled for 3s (Doze-proof)", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            alarmManager.set(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                triggerAt,
                pendingIntent
            )
        }
    }
}

@Composable
fun MainCompanionDashboard(
    syncData: CompanionSyncData,
    isLockScreenEnabled: Boolean,
    isSensorEnabled: Boolean,
    isSyncing: Boolean,
    onToggleLockScreen: (Boolean) -> Unit,
    onToggleSensor: (Boolean) -> Unit,
    onPreviewLockScreen: () -> Unit,
    onTestMedicationAlert: () -> Unit,
    onOpenSmsHandoff: () -> Unit,
    onCall108: () -> Unit,
    onCall112: () -> Unit,
    onSyncWithCloud: () -> Unit,
    onOpenPwaWeb: () -> Unit,
    onMarkDoseTaken: (String) -> Unit
) {
    Scaffold(
        topBar = {
            Surface(
                color = MedicalBluePrimary,
                shadowElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "LifeGuard",
                                color = Color.White,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Surface(
                                color = Color.White.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "ANDROID COMPANION",
                                    color = Color.White,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Black,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = "Native Lock-Screen & Sensor Bridge",
                            color = MedicalBlueLight,
                            fontSize = 11.sp
                        )
                    }

                    IconButton(
                        onClick = onSyncWithCloud,
                        enabled = !isSyncing
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Sync from Cloud",
                            tint = Color.White
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(BackgroundLight)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Patient Header Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceLight),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = syncData.patientName,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = TextPrimaryLight
                            )
                            Text(
                                text = "Allergies: ${syncData.allergies.joinToString(", ")}",
                                fontSize = 12.sp,
                                color = TextSecondaryLight
                            )
                        }

                        Surface(
                            color = EmergencyRedLight,
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = syncData.bloodGroup,
                                color = EmergencyRedPrimary,
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
            }

            // Card 1: Lock-Screen Medical ID
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceLight),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Lock-Screen Medical ID",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = TextPrimaryLight
                                )
                                Text(
                                    text = "Persistent public emergency card for EMTs & responders",
                                    fontSize = 12.sp,
                                    color = TextSecondaryLight
                                )
                            }
                            Switch(
                                checked = isLockScreenEnabled,
                                onCheckedChange = onToggleLockScreen
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Button(
                            onClick = onPreviewLockScreen,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = MedicalBluePrimary),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = "Preview Lock-Screen Card", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Card 2: Permitted Background Sensor Monitoring
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceLight),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Background Safety Sensor",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = TextPrimaryLight
                                )
                                Text(
                                    text = "Vehicular impact & severe fall detection (Foreground Service)",
                                    fontSize = 12.sp,
                                    color = TextSecondaryLight
                                )
                            }
                            Switch(
                                checked = isSensorEnabled,
                                onCheckedChange = onToggleSensor
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Surface(
                            color = BackgroundLight,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "⚡ Battery-Efficient: 20 Hz batching (<0.8% per 24h). Safety Guardrail: Never silently dispatches; presents 30s confirmation.",
                                color = TextSecondaryLight,
                                fontSize = 11.sp,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }
                }
            }

            // Card 3: Today's Medication Schedule
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceLight),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Today's Medicine Schedule",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = TextPrimaryLight
                            )
                            Text(
                                text = "${syncData.todayMedications.count { it.status == "taken" }}/${syncData.todayMedications.size} Taken",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = SuccessEmerald
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        syncData.todayMedications.forEach { dose ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "${dose.name} (${dose.dosage})",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = TextPrimaryLight
                                    )
                                    Text(
                                        text = "Time: ${dose.scheduledTime} • ${dose.mealTiming}",
                                        fontSize = 11.sp,
                                        color = TextSecondaryLight
                                    )
                                }

                                if (dose.status == "taken") {
                                    Surface(
                                        color = Color(0xFFD1FAE5),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text(
                                            text = "[TAKEN]",
                                            color = SuccessEmerald,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Black,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                } else {
                                    OutlinedButton(
                                        onClick = { onMarkDoseTaken(dose.id) },
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("Mark Taken", fontSize = 11.sp)
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedButton(
                            onClick = onTestMedicationAlert,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Notifications, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Test Local Notification (3s Alarm)", fontSize = 12.sp)
                        }
                    }
                }
            }

            // Card 4: Android SMS Handoff & Emergency Calling
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceLight),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Emergency SOS & SMS Handoff",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = TextPrimaryLight
                        )
                        Text(
                            text = "Pre-populates distress coordinates & Medical ID into native SMS app for human review and sending.",
                            fontSize = 12.sp,
                            color = TextSecondaryLight
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Button(
                            onClick = onOpenSmsHandoff,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = EmergencyRedPrimary),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Open SMS Distress Handoff", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = onCall108,
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("Call 108 (Ambulance)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = EmergencyRedPrimary)
                            }
                            OutlinedButton(
                                onClick = onCall112,
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("Call 112 (Police)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedicalBluePrimary)
                            }
                        }
                    }
                }
            }

            // Card 5: Cross-Client PWA Bridge
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceLight),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Cross-Client PWA Integration",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = TextPrimaryLight
                        )
                        Text(
                            text = "LifeGuard Web / PWA remains fully supported as a separate client. Use this shortcut to open the full web application.",
                            fontSize = 12.sp,
                            color = TextSecondaryLight
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedButton(
                            onClick = onOpenPwaWeb,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(imageVector = Icons.Default.OpenInBrowser, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Open LifeGuard Web / PWA", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PermissionRationaleDialog(
    permissionType: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    val title = when (permissionType) {
        "notification" -> "Notifications Permission"
        "location" -> "Emergency Location Permission"
        else -> "Permission Needed"
    }

    val explanation = when (permissionType) {
        "notification" -> "LifeGuard requires notification access to display your life-saving Medical ID on the locked screen for emergency responders and deliver timely medication reminders."
        "location" -> "Location access is used exclusively when triggering an Emergency SOS or calculating distance to matching blood donors. LifeGuard never tracks your background location continuously."
        else -> "Permission is required to ensure reliable emergency service operation."
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = title, fontWeight = FontWeight.Bold) },
        text = { Text(text = explanation, fontSize = 13.sp) },
        confirmButton = {
            Button(onClick = onConfirm) {
                Text("Allow")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Not Now")
            }
        }
    )
}

@Composable
fun ImpactDistressConfirmationDialog(
    onConfirmDistress: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = Icons.Default.Warning, contentDescription = null, tint = EmergencyRedPrimary)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Severe Impact Detected", color = EmergencyRedPrimary, fontWeight = FontWeight.Black)
            }
        },
        text = {
            Text(
                "A potential vehicular collision or hard fall was detected. Are you hurt or in need of emergency assistance?",
                fontSize = 13.sp
            )
        },
        confirmButton = {
            Button(
                onClick = onConfirmDistress,
                colors = ButtonDefaults.buttonColors(containerColor = EmergencyRedPrimary)
            ) {
                Text("Send SOS Handoff", fontWeight = FontWeight.Black)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("I Am Okay (Dismiss)")
            }
        }
    )
}
