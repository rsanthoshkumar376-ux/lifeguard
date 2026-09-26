/**
 * LifeGuard Cloud Functions
 *
 * Server-side logic for:
 * - Blood donor matching (geohash-based)
 * - Push notifications (FCM)
 * - Emergency SOS alerts
 * - Request expiry
 * - Admin operations
 */

import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { geohashQueryBounds, distanceBetween } from "geofire-common";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ============================================================
// BLOOD REQUEST MATCHING - Triggered when a new request is created
// ============================================================

export const onBloodRequestCreated = onDocumentCreated(
  { document: "bloodRequests/{requestId}", region: "asia-south1" },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const request = snapshot.data();
    const requestId = event.params.requestId;

    console.log(`New blood request: ${requestId}, Blood Group: ${request.bloodGroup}`);

    await matchAndNotifyDonors(requestId, request, request.currentRadiusKm || 5);
  }
);

/**
 * Core matching algorithm:
 * 1. Get hospital location
 * 2. Find donors within radius using geohash bounds
 * 3. Filter by blood group compatibility
 * 4. Filter by availability (56-day cooldown)
 * 5. Send FCM push notifications
 * 6. Log notifications in donorResponses subcollection
 */
async function matchAndNotifyDonors(
  requestId: string,
  request: admin.firestore.DocumentData,
  radiusKm: number
): Promise<number> {
  const center: [number, number] = [request.location.latitude, request.location.longitude];

  // Get geohash query bounds for the radius
  const radiusMeters = radiusKm * 1000;
  const bounds = geohashQueryBounds(center, radiusMeters);

  // Query donors within each geohash bound range
  const donorPromises = bounds.map((bound) =>
    db
      .collection("donors")
      .where("isAvailable", "==", true)
      .where("notificationsEnabled", "==", true)
      .where("bloodGroup", "==", request.bloodGroup)
      .orderBy("geohash")
      .startAt(bound[0])
      .endAt(bound[1])
      .get()
  );

  const snapshots = await Promise.all(donorPromises);

  // Deduplicate and filter by exact distance
  const matchedDonors: Array<{
    id: string;
    distance: number;
    fcmToken?: string;
    fullName?: string;
    bloodGroup: string;
  }> = [];

  const seenIds = new Set<string>();
  const DONATION_COOLDOWN_DAYS = 56;

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      if (seenIds.has(doc.id)) continue;
      seenIds.add(doc.id);

      const donor = doc.data();

      // Skip if donor is the one who created the request (if applicable)
      if (donor.userId === request.hospitalId) continue;

      // Check 56-day donation cooldown
      if (donor.lastDonationDate) {
        const lastDonation = donor.lastDonationDate.toDate();
        const daysSinceDonation = Math.floor(
          (Date.now() - lastDonation.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceDonation < DONATION_COOLDOWN_DAYS) continue;
      }

      // Check quiet hours
      if (donor.quietHoursStart != null && donor.quietHoursEnd != null) {
        const now = new Date();
        const currentHour = now.getHours();
        if (
          (donor.quietHoursStart < donor.quietHoursEnd &&
            currentHour >= donor.quietHoursStart &&
            currentHour < donor.quietHoursEnd) ||
          (donor.quietHoursStart > donor.quietHoursEnd &&
            (currentHour >= donor.quietHoursStart || currentHour < donor.quietHoursEnd))
        ) {
          continue;
        }
      }

      // Calculate exact distance
      const donorCenter: [number, number] = [
        donor.location.latitude,
        donor.location.longitude,
      ];
      const distanceKm = distanceBetween(donorCenter, center);

      if (distanceKm <= radiusKm) {
        matchedDonors.push({
          id: doc.id,
          distance: Math.round(distanceKm * 10) / 10,
          fcmToken: donor.fcmToken,
          fullName: donor.fullName,
          bloodGroup: donor.bloodGroup,
        });
      }
    }
  }

  // Sort by distance
  matchedDonors.sort((a, b) => a.distance - b.distance);

  console.log(
    `Found ${matchedDonors.length} eligible donors within ${radiusKm}km for request ${requestId}`
  );

  if (matchedDonors.length === 0) return 0;

  // Send push notifications
  const urgencyLabel =
    request.urgency === "critical"
      ? "🚨 CRITICAL"
      : request.urgency === "urgent"
      ? "⚠️ URGENT"
      : "🩸";

  const tokens = matchedDonors
    .filter((d) => d.fcmToken)
    .map((d) => d.fcmToken as string);

  if (tokens.length > 0) {
    // FCM supports up to 500 tokens per multicast
    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      try {
        const response = await messaging.sendEachForMulticast({
          tokens: batch,
          notification: {
            title: `${urgencyLabel} Blood Request - ${request.bloodGroup}`,
            body: `${request.bloodGroup} blood needed at ${request.hospitalName}. Tap to help.`,
          },
          data: {
            type: "BLOOD_REQUEST",
            requestId: requestId,
            bloodGroup: request.bloodGroup,
            hospitalName: request.hospitalName || "",
            urgency: request.urgency || "normal",
          },
          android: {
            priority: "high" as const,
            notification: {
              channelId: "emergency_blood_requests",
              sound: request.urgency === "critical" ? "emergency_alarm" : "default",
              priority: "max" as const,
            },
          },
          webpush: {
            notification: {
              icon: "/icons/icon-192.png",
              badge: "/icons/icon-192.png",
              vibrate: [200, 100, 200, 100, 200],
              requireInteraction: true,
              actions: [
                { action: "donate", title: "I CAN DONATE" },
                { action: "unavailable", title: "NOT AVAILABLE" },
              ],
            },
            fcmOptions: {
              link: `/blood/requests/${requestId}`,
            },
          },
        });

        console.log(
          `FCM batch sent: ${response.successCount} success, ${response.failureCount} failed`
        );

        // Clean up invalid tokens
        response.responses.forEach((resp, idx) => {
          if (
            resp.error &&
            (resp.error.code === "messaging/invalid-registration-token" ||
              resp.error.code === "messaging/registration-token-not-registered")
          ) {
            // Remove invalid token from database
            db.collection("fcmTokens")
              .where("token", "==", batch[idx])
              .get()
              .then((snap) => snap.forEach((doc) => doc.ref.delete()));
          }
        });
      } catch (err) {
        console.error("FCM send error:", err);
      }
    }
  }

  // Record notifications in donor responses subcollection
  const batch = db.batch();
  for (const donor of matchedDonors) {
    const responseRef = db
      .collection("bloodRequests")
      .doc(requestId)
      .collection("donorResponses")
      .doc(donor.id);

    batch.set(responseRef, {
      donorId: donor.id,
      donorName: donor.fullName || "Anonymous",
      bloodGroup: donor.bloodGroup,
      distance: donor.distance,
      status: "notified",
      notifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      respondedAt: null,
    });
  }

  // Update request with notification count
  const requestRef = db.collection("bloodRequests").doc(requestId);
  batch.update(requestRef, {
    notifiedCount: admin.firestore.FieldValue.increment(matchedDonors.length),
    currentRadiusKm: radiusKm,
    lastNotifiedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  return matchedDonors.length;
}

// ============================================================
// PROGRESSIVE RADIUS EXPANSION
// Runs every 15 minutes, expands search for unfulfilled requests
// ============================================================

export const expandSearchRadius = onSchedule(
  { schedule: "every 15 minutes", region: "asia-south1", timeoutSeconds: 300 },
  async () => {
    const RADIUS_STEPS = [5, 10, 25, 50];

    // Find active requests that need expansion
    const activeRequests = await db
      .collection("bloodRequests")
      .where("status", "==", "active")
      .where("currentRadiusKm", "<", 50) // Haven't reached max radius
      .get();

    for (const doc of activeRequests.docs) {
      const request = doc.data();
      const currentRadius = request.currentRadiusKm || 5;
      const respondedCount = request.respondedCount || 0;
      const requiredCount = request.unitsRequired || 1;

      // Only expand if not enough responses
      if (respondedCount < requiredCount * 2) {
        // Find next radius step
        const currentIndex = RADIUS_STEPS.indexOf(currentRadius);
        if (currentIndex < RADIUS_STEPS.length - 1) {
          const nextRadius = RADIUS_STEPS[currentIndex + 1];
          console.log(
            `Expanding request ${doc.id} from ${currentRadius}km to ${nextRadius}km`
          );
          await matchAndNotifyDonors(doc.id, request, nextRadius);
        }
      }
    }
  }
);

// ============================================================
// REQUEST EXPIRY - Runs hourly, expires old requests
// ============================================================

export const expireOldRequests = onSchedule(
  { schedule: "every 1 hours", region: "asia-south1" },
  async () => {
    const now = admin.firestore.Timestamp.now();

    const expiredRequests = await db
      .collection("bloodRequests")
      .where("status", "==", "active")
      .where("expiresAt", "<=", now)
      .get();

    const batch = db.batch();
    for (const doc of expiredRequests.docs) {
      batch.update(doc.ref, {
        status: "expired",
        expiredAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    if (!expiredRequests.empty) {
      await batch.commit();
      console.log(`Expired ${expiredRequests.size} blood requests`);
    }
  }
);

// ============================================================
// SOS EMERGENCY ALERT
// ============================================================

export const sendSosAlert = onCall(
  { region: "asia-south1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in to send SOS alerts.");
    }

    const userId = request.auth.uid;
    const { latitude, longitude } = request.data;

    // Get user profile
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }

    const user = userDoc.data()!;

    // Get emergency contacts
    const contactsSnap = await db
      .collection("users")
      .doc(userId)
      .collection("emergencyContacts")
      .get();

    // Get medical profile for emergency info
    const medProfileSnap = await db
      .collection("users")
      .doc(userId)
      .collection("medicalProfile")
      .doc("profile")
      .get();

    const medProfile = medProfileSnap.exists ? medProfileSnap.data() : null;

    // Build emergency message
    const locationUrl = latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : "Location unavailable";

    const bloodGroup = medProfile?.bloodGroup || user.bloodGroup || "Unknown";

    // Get emergency contacts' FCM tokens (if they're also app users)
    const contactPhones = contactsSnap.docs.map((doc) => doc.data().phone);

    // Send FCM to any contacts who are registered users
    if (contactPhones.length > 0) {
      const usersWithPhones = await db
        .collection("users")
        .where("phone", "in", contactPhones.slice(0, 10)) // Firestore 'in' limit is 10
        .get();

      const contactUserIds = usersWithPhones.docs.map((doc) => doc.id);

      if (contactUserIds.length > 0) {
        const tokenSnaps = await db
          .collection("fcmTokens")
          .where("userId", "in", contactUserIds)
          .get();

        const tokens = tokenSnaps.docs.map((doc) => doc.data().token);

        if (tokens.length > 0) {
          await messaging.sendEachForMulticast({
            tokens,
            notification: {
              title: `🚨 EMERGENCY: ${user.fullName} needs help!`,
              body: `${user.fullName} has activated an emergency SOS alert. Blood Group: ${bloodGroup}`,
            },
            data: {
              type: "SOS_ALERT",
              userId: userId,
              userName: user.fullName || "",
              bloodGroup: bloodGroup,
              locationUrl: locationUrl,
            },
            android: {
              priority: "high",
              notification: {
                channelId: "sos_alerts",
                sound: "emergency_alarm",
                priority: "max",
              },
            },
            webpush: {
              notification: {
                icon: "/icons/icon-192.png",
                vibrate: [300, 100, 300, 100, 300, 100, 300],
                requireInteraction: true,
              },
            },
          });
        }
      }
    }

    // Log the SOS event
    await db.collection("sosAlerts").add({
      userId: userId,
      userName: user.fullName,
      bloodGroup: bloodGroup,
      location:
        latitude && longitude
          ? new admin.firestore.GeoPoint(latitude, longitude)
          : null,
      locationUrl: locationUrl,
      contactsNotified: contactPhones.length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      contactsNotified: contactPhones.length,
      locationUrl,
    };
  }
);

// ============================================================
// EMERGENCY TOKEN VALIDATION (callable for public access)
// ============================================================

export const validateEmergencyToken = onCall(
  { region: "asia-south1" },
  async (request) => {
    const { token } = request.data;

    if (!token || typeof token !== "string") {
      throw new HttpsError("invalid-argument", "A valid token is required.");
    }

    // Find the token
    const tokenSnap = await db
      .collection("emergencyTokens")
      .where("token", "==", token)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (tokenSnap.empty) {
      return { valid: false, reason: "Token is invalid or has been revoked." };
    }

    const tokenDoc = tokenSnap.docs[0];
    const tokenData = tokenDoc.data();

    // Check expiry
    if (tokenData.expiresAt && tokenData.expiresAt.toDate() < new Date()) {
      return { valid: false, reason: "This emergency ID link has expired." };
    }

    const userId = tokenData.userId;

    // Get user's emergency-visible profile
    const userDoc = await db.collection("users").doc(userId).get();
    const medProfileDoc = await db
      .collection("users")
      .doc(userId)
      .collection("medicalProfile")
      .doc("profile")
      .get();

    const medicationsSnap = await db
      .collection("users")
      .doc(userId)
      .collection("medications")
      .where("emergencyVisible", "==", true)
      .get();

    const contactsSnap = await db
      .collection("users")
      .doc(userId)
      .collection("emergencyContacts")
      .get();

    if (!userDoc.exists) {
      return { valid: false, reason: "User profile not found." };
    }

    const user = userDoc.data()!;
    const medProfile = medProfileDoc.exists ? medProfileDoc.data()! : {};
    const visibility = medProfile.emergencyVisibility || {};

    // Build emergency-visible-only response
    const emergencyData: Record<string, unknown> = {
      fullName: user.fullName,
      profilePhotoUrl: user.profilePhotoUrl || null,
    };

    // Only include fields marked as emergency visible
    if (visibility.bloodGroup !== false) emergencyData.bloodGroup = medProfile.bloodGroup || user.bloodGroup;
    if (visibility.allergies) emergencyData.allergies = medProfile.allergies;
    if (visibility.conditions) emergencyData.conditions = medProfile.conditions;
    if (visibility.emergencyInstructions) emergencyData.emergencyInstructions = medProfile.emergencyInstructions;
    if (visibility.organDonor) emergencyData.organDonor = medProfile.organDonor;

    // Emergency-visible medications
    emergencyData.medications = medicationsSnap.docs.map((doc) => {
      const med = doc.data();
      return {
        medicineName: med.medicineName,
        dosage: med.dosage,
        instructions: med.instructions,
        emergencyNote: med.emergencyNote,
      };
    });

    // Emergency contacts (always shown)
    emergencyData.emergencyContacts = contactsSnap.docs.map((doc) => {
      const contact = doc.data();
      return {
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        isPrimary: contact.isPrimary || false,
      };
    });

    // Log the access
    await db.collection("emergencyAccessLogs").add({
      userId: userId,
      tokenId: tokenDoc.id,
      accessedAt: admin.firestore.FieldValue.serverTimestamp(),
      accessType: "qr",
      callerUid: request.auth?.uid || null,
    });

    return { valid: true, emergencyData };
  }
);

// ============================================================
// ADMIN: VERIFY HOSPITAL
// ============================================================

export const verifyHospital = onCall(
  { region: "asia-south1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    // Check admin role
    const adminDoc = await db.collection("users").doc(request.auth.uid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      throw new HttpsError("permission-denied", "Admin access required.");
    }

    const { hospitalId, status, notes } = request.data;

    if (!hospitalId || !status || !["verified", "rejected", "suspended"].includes(status)) {
      throw new HttpsError("invalid-argument", "Invalid hospital ID or status.");
    }

    await db.collection("hospitals").doc(hospitalId).update({
      verificationStatus: status,
      verificationNotes: notes || "",
      verifiedBy: request.auth.uid,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

// ============================================================
// ADMIN: DELETE USER ACCOUNT
// ============================================================

export const deleteUserAccount = onCall(
  { region: "asia-south1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const userId = request.auth.uid;

    // Delete subcollections
    const subcollections = [
      "medicalProfile",
      "medications",
      "emergencyContacts",
      "medicalDocuments",
    ];

    for (const sub of subcollections) {
      const snap = await db.collection("users").doc(userId).collection(sub).get();
      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      if (!snap.empty) await batch.commit();
    }

    // Delete donor profile
    await db.collection("donors").doc(userId).delete().catch(() => {});

    // Revoke emergency tokens
    const tokensSnap = await db
      .collection("emergencyTokens")
      .where("userId", "==", userId)
      .get();
    const tokenBatch = db.batch();
    tokensSnap.docs.forEach((doc) =>
      tokenBatch.update(doc.ref, { isActive: false })
    );
    if (!tokensSnap.empty) await tokenBatch.commit();

    // Delete FCM tokens
    const fcmSnap = await db
      .collection("fcmTokens")
      .where("userId", "==", userId)
      .get();
    const fcmBatch = db.batch();
    fcmSnap.docs.forEach((doc) => fcmBatch.delete(doc.ref));
    if (!fcmSnap.empty) await fcmBatch.commit();

    // Delete user document
    await db.collection("users").doc(userId).delete();

    // Delete Firebase Auth account
    await admin.auth().deleteUser(userId);

    return { success: true };
  }
);
