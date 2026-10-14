# Navodaya Vijेता APK — केवल Android फोन + Termux से

## पहले समझ लें
इस ZIP में स्रोत कोड और APK बनाने की cloud workflow है; APK अभी बना हुआ नहीं है। इस प्रोजेक्ट में server-side routes हैं, इसलिए ऐप को पहले एक वास्तविक HTTPS वेबसाइट पर deploy करना ज़रूरी है। APK उस वेबसाइट को Android WebView में खोलेगा, इसलिए सामान्य उपयोग के लिए इंटरनेट चाहिए। स्थानीय प्रगति इस समय उसी डिवाइस/ब्राउज़र में रहती है।

## सबसे आसान फोन-only तरीका: GitHub Actions से APK बनाना
Android के Termux में पूरा Android SDK/Gradle build करना कठिन और अक्सर अस्थिर होता है। इसलिए फोन पर फ़ाइलें अपलोड करें और GitHub के cloud runner से APK बनवाएँ।

### 1. ZIP डाउनलोड और extract करें
1. `navodaya-vijeta-android-project.zip` डाउनलोड करें।
2. Android में ZArchiver या किसी ZIP ऐप से extract करें।
3. अंदर का `grok-workspace` फ़ोल्डर ही पूरा project है।

### 2. GitHub repository बनाएँ
1. ब्राउज़र में https://github.com खोलकर sign in करें या account बनाएँ।
2. `+` → **New repository** चुनें। नाम रखें `navodaya-vijeta` और **Create repository** दबाएँ। Public या Private में से चुन सकते हैं।
3. Repository के **Add file → Upload files** से project की फ़ाइलें अपलोड करें। `grok-workspace` फ़ोल्डर के अंदर की फ़ाइलें अपलोड करें, उसके ऊपर का फ़ोल्डर नहीं। `.github/workflows/android-apk.yml` सहित hidden `.github` फ़ोल्डर भी अपलोड होना चाहिए। यदि मोबाइल वेबसाइट hidden folders अपलोड न करे, GitHub की वेबसाइट में **Add file → Create new file** से `.github/workflows/android-apk.yml` बनाएँ और ZIP में मौजूद इसी नाम की फ़ाइल का पूरा content paste करें।
4. सबसे नीचे **Commit changes** दबाएँ।

### 3. ऐप को ऑनलाइन प्रकाशित करें
यह चरण अनिवार्य है। `capacitor.config.ts` में placeholder URL है; workflow चलते समय आप अपना प्रकाशित URL देंगे। पहले ऐप को अपने समर्थित hosting provider पर deploy करें और असली HTTPS URL लें, जैसे `https://your-app.example`। केवल उदाहरण वाला URL न डालें। इस प्रोजेक्ट में server routes/database/auth configuration हो सकती है; deployment के लिए आवश्यक environment variables भी provider में सेट होने चाहिए। यदि वेबसाइट अभी चल नहीं रही है, तो पहले उसे सफलतापूर्वक deploy और test करें।

### 4. Cloud build चलाएँ
1. GitHub repository खोलें। **Actions** टैब दबाएँ।
2. यदि GitHub कहे तो **I understand my workflows, go ahead and enable them** चुनें।
3. बाईं ओर **Build Navodaya Vijeta APK** चुनें।
4. **Run workflow** दबाएँ।
5. `app_url` में अपनी वेबसाइट का वास्तविक HTTPS URL डालें, जैसे `https://your-app.example`। फिर हरा **Run workflow** बटन दबाएँ।
6. रन के पूरा होने तक प्रतीक्षा करें। सफल होने पर हरा check दिखेगा। रन खोलें और सबसे नीचे **Artifacts** में `navodaya-vijeta-debug-apk` डाउनलोड करें। ZIP artifact को extract करने पर `app-debug.apk` मिलेगा।

### 5. फोन में APK इंस्टॉल करें
1. `app-debug.apk` पर टैप करें।
2. Android पूछे तो अपने browser/file manager के लिए **Install unknown apps / इस स्रोत से अनुमति दें** चालू करें।
3. वापस जाकर **Install** दबाएँ। APK केवल अपनी repository और अपने build से भरोसा होने पर इंस्टॉल करें। इंस्टॉल के बाद चाहें तो यह अनुमति बंद कर दें।

## सामान्य समस्याएँ
- **Actions टैब नहीं दिखता:** repository में `.github/workflows/android-apk.yml` commit हुआ है या नहीं देखें; repository की Actions सुविधा सक्षम करें।
- **URL placeholder error / invalid URL:** पूरा वास्तविक `https://...` URL डालें।
- **वेबसाइट खुलती है लेकिन error देती है:** पहले उसी URL को फोन के Chrome में खोलकर देखें। server routes, auth, database और hosting environment variables ठीक होने चाहिए।
- **Gradle/build fail:** Actions run खोलें, असफल step का log देखें; error log के बिना कारण निश्चित नहीं किया जा सकता।
- **अपडेट:** वेबसाइट का content उसी URL पर बदलने पर ऐप आम तौर पर नया content दिखाएगा। Native wrapper/permissions बदलने पर नया APK build करें।

## जरूरी सीमाएँ
- GitHub cloud build चलाने के लिए GitHub account और इंटरनेट चाहिए; GitHub की usage limits/terms लागू होती हैं।
- यह workflow **debug APK** बनाता है, Play Store के लिए signed release नहीं। Release APK/AAB के लिए signing key और अलग सुरक्षित configuration चाहिए।
- यह तरीका APK build करता है; ऐप की online deployment अपने-आप नहीं करता।
