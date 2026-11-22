# LifeGuard Native Android Companion ProGuard Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.squareup.moshi.Json <fields>;
}
-keep class org.lifeguard.companion.data.model.** { *; }
