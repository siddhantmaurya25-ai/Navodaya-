# Navodaya Vijeta — GitHub Actions APK source

यह प्रोजेक्ट मौजूदा V7 HTML/PWA को Capacitor Android wrapper में पैक करता है। GitHub Actions पर **debug APK** बनता है। यह अभी Play Store release के लिए signed release APK/AAB नहीं है।

## GitHub से APK बनाएं (मोबाइल से भी)

1. ZIP डाउनलोड करके extract करें।
2. GitHub पर `Navodaya-Vijeta` नाम की नई repository बनाएं।
3. Repository में ZIP के अंदर की सभी फाइलें/फ़ोल्डर अपलोड करें — ZIP फ़ाइल को अकेले अपलोड न करें। सुनिश्चित करें कि `.github/workflows/build-apk.yml` अपनी सही जगह पर मौजूद हो।
4. `Commit changes` करें।
5. Repository में **Actions** टैब खोलें। `Build Navodaya Vijeta APK` workflow चुनें।
6. Push पर build अपने-आप शुरू होगा; या `Run workflow` दबाएं।
7. Build सफल होने पर workflow run के नीचे **Artifacts** में `Navodaya-Vijeta-debug-apk` डाउनलोड करें और ZIP extract करके `app-debug.apk` लें।
8. APK फोन में खोलें। Android पूछे तो केवल इसी अपने build के लिए browser/files app को “Install unknown apps” अनुमति दें।

## जरूरी बातें

- यह workflow **debug APK** बनाता है, जिसे परीक्षण के लिए इंस्टॉल किया जा सकता है। Play Store पर प्रकाशित करने के लिए अलग release signing और Android App Bundle की प्रक्रिया चाहिए।
- ऐप के अंदर के YouTube वीडियो/बाहरी लिंक और अन्य नेटवर्क सुविधाओं के लिए इंटरनेट चाहिए हो सकता है।
- Repository में passwords, signing keys या secrets कभी commit न करें।
- यदि Actions build fail हो, तो लाल error lines या log का screenshot भेजें; उसके अनुसार workflow ठीक किया जा सकता है।
