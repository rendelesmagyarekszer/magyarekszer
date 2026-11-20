#!/bin/bash
set -e

echo "=== 1. Ellenőrizzük a next.config.ts beállítást ==="
# Biztosítjuk, hogy output: 'export' benne legyen
grep -q "output: 'export'" next.config.ts || sed -i '' "s/const nextConfig: NextConfig = {/const nextConfig: NextConfig = {\n  output: 'export',/" next.config.ts

echo "=== 2. Töröljük a korábbi out mappát és gyorsítótárat ==="
rm -rf out .next

echo "=== 3. Build futtatása (HTML/CSS/JS export) ==="
npx next build

echo "=== 4. Kész! Az 'out' mappa frissült. Visszaállítjuk a dev módot a helyi szervernek... ==="
sed -i '' "/output: 'export',/d" next.config.ts

echo "Sikeres frissítés! Az 'out' mappa készen áll a MediaCenterre való feltöltésre."
