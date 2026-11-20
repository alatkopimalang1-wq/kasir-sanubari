# Proguard rules for Sanubari POS
-keepattributes *Annotation*
-dontwarn okhttp3.**
-dontwarn okio.**
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
