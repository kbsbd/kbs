#!/bin/bash
# Same as setup-media.bat, for macOS and Linux.
set -e
mkdir -p public/media
[ -f media/hero-scrub.mp4 ] && cp media/hero-scrub.mp4 public/media/
[ -f media/hero-scrub.webm ] && cp media/hero-scrub.webm public/media/
[ -f media/kbs-media-images.zip ] && unzip -oq media/kbs-media-images.zip -d public/media
echo "Media ready: $(ls public/media | wc -l) files in public/media (expected 20)"
