package org.lifeguard.companion.ui

import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.lifeguard.companion.data.local.CompanionPreferences
import org.lifeguard.companion.data.model.CompanionSyncData
import org.lifeguard.companion.sms.AndroidSmsHandoff
import org.lifeguard.companion.ui.theme.EmergencyRedPrimary
import org.lifeguard.companion.ui.theme.LifeGuardCompanionTheme

/**
 * LockScreenActivity renders directly on top of the Android Keyguard.
 * Allows emergency responders, paramedics, and bystanders to view the patient's
 * Medical ID, Blood Group, Critical Allergies, and call 108 without entering a passcode.
 */
class LockScreenActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Configure window to display over lock screen and wake display
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            keyguardManager.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }

        val prefs = CompanionPreferences(this)
        val data = prefs.getSyncData()

        setContent {
            LifeGuardCompanionTheme(darkTheme = true) {
                LockScreenContent(
                    data = data,
                    onClose = { finish() },
                    onCall108 = { AndroidSmsHandoff.openAmbulanceDialer(this) },
                    onCallContact = { phone -> AndroidSmsHandoff.openDialer(this, phone) }
                )
            }
        }
    }
}

@Composable
fun LockScreenContent(
    data: CompanionSyncData,
    onClose: () -> Unit,
    onCall108: () -> Unit,
    onCallContact: (String) -> Unit
) {
    val scrollState = rememberScrollState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF000000) // High-contrast black for emergency responders
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top Bar with Dismiss Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF22C55E))
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "EMERGENCY TRIAGE CARD",
                        color = Color(0xFFE2E8F0),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }

                IconButton(onClick = onClose) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close Lock Screen Card",
                        tint = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Patient Name & Blood Group Badge
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2E)),
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(2.dp, EmergencyRedPrimary)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = data.patientName,
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Blood Group Big Badge
                    Surface(
                        color = EmergencyRedPrimary,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "BLOOD GROUP: ${data.bloodGroup}",
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 18.sp,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Critical Allergies
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF2A1215), RoundedCornerShape(12.dp))
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = Color(0xFFF87171),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "CRITICAL ALLERGIES",
                                color = Color(0xFFF87171),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (data.allergies.isNotEmpty()) data.allergies.joinToString(", ") else "No Known Allergies",
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Medical Conditions
                    if (data.criticalConditions.isNotEmpty()) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF1E293B), RoundedCornerShape(12.dp))
                                .padding(12.dp)
                        ) {
                            Text(
                                text = "CHRONIC MEDICAL CONDITIONS",
                                color = Color(0xFF94A3B8),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = data.criticalConditions.joinToString(", "),
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Pandemic / Strangers Note
                    Text(
                        text = "\"${data.pandemicNote}\"",
                        color = Color(0xFFCBD5E1),
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 1-Tap Emergency Calling Actions (Dial 108 & Primary Contact)
            Button(
                onClick = onCall108,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EmergencyRedPrimary),
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(imageVector = Icons.Default.Phone, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "CALL 108 AMBULANCE",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            val primaryContact = data.emergencyContacts.firstOrNull { it.isPrimary } ?: data.emergencyContacts.firstOrNull()
            if (primaryContact != null) {
                OutlinedButton(
                    onClick = { onCallContact(primaryContact.phone) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF38BDF8))
                ) {
                    Icon(imageVector = Icons.Default.Phone, contentDescription = null, tint = Color(0xFF38BDF8))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Call ${primaryContact.name} (${primaryContact.relationship})",
                        color = Color(0xFF38BDF8),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // QR Code Simulation Card for Scanners
            Surface(
                color = Color.White,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .size(170.dp)
                    .border(2.dp, Color(0xFF38BDF8), RoundedCornerShape(16.dp))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "📱 [QR CODE]",
                        color = Color.Black,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Scan for full verified Medical ID & records",
                        color = Color.DarkGray,
                        fontSize = 10.sp,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "TOKEN: ${data.emergencyToken.take(12)}...",
                        color = Color.Gray,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Protected by LifeGuard • Secure Public Emergency Protocol",
                color = Color(0xFF64748B),
                fontSize = 11.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}
