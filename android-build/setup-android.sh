#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22+ इंस्टॉल करें और फिर दोबारा चलाएँ।" >&2
  exit 1
fi
if ! node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"; then
  echo "Node.js 22 या नया संस्करण चाहिए।" >&2
  exit 1
fi
if grep -q 'REPLACE-WITH-YOUR-DEPLOYED-APP-URL' capacitor.config.ts; then
  echo "पहले capacitor.config.ts में अपना असली HTTPS deployment URL डालें।" >&2
  exit 1
fi
npm ci
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
if [ ! -d android ]; then
  npx cap add android
fi
npx cap sync android
echo "तैयार! Android Studio खोलने के लिए चलाएँ: npx cap open android"
