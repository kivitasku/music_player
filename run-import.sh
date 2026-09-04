#!/bin/bash

echo "Starting music import..."

cd "$(dirname "$0")/back" || exit 1

npx tsx scripts/import-music.ts

if [ $? -ne 0 ]; then
    echo
    echo "Music import failed."
    exit 1
fi

echo
echo "Music import completed successfully."