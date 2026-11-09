#!/usr/bin/env bash
# Downloads the barcode scanner and text-reader libraries into site/vendor
# so the app can run with no internet. Run by the GitHub Pages workflow on every deploy.
set -euo pipefail
cd "$(dirname "$0")/.."

V=site/vendor
T=$(mktemp -d)
rm -rf "$V"
mkdir -p "$V/tesseract" "$V/core" "$V/lang"

pack() { (cd "$T" && npm pack "$1" --silent >/dev/null && mkdir -p "$2" && tar -xzf "$(ls -t *.tgz | head -1)" -C "$2" && rm -f *.tgz); }

pack @zxing/library@0.21.3   zxing
pack tesseract.js@5.1.1      tjs
pack tesseract.js-core@5.1.1 core

cp "$T/zxing/package/umd/index.min.js"        "$V/zxing.min.js"
cp "$T/tjs/package/dist/tesseract.min.js"      "$V/tesseract/"
cp "$T/tjs/package/dist/worker.min.js"         "$V/tesseract/"
cp "$T"/core/package/tesseract-core*.js        "$V/core/"
cp "$T"/core/package/tesseract-core*.wasm      "$V/core/" 2>/dev/null || true

# English language data for text recognition
if pack @tesseract.js-data/eng@1.0.0 lang 2>/dev/null && \
   f=$(find "$T/lang" -path '*4.0.0_best_int*' -name 'eng.traineddata.gz' | head -1) && [ -n "$f" ]; then
  cp "$f" "$V/lang/eng.traineddata.gz"
else
  curl -fsSL -o "$V/lang/eng.traineddata.gz" https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz
fi

echo "Vendor files:"
find "$V" -type f -exec ls -lh {} \; | awk '{print $5, $9}'
