@echo off
REM Copies the media that ships beside this project into public\media.
REM The video files are too big to travel inside the source zip, so they
REM arrive in a media folder next to it and this puts them where the app
REM expects them. Run once, after unzipping.

setlocal
if not exist "public\media" mkdir "public\media"

if exist "media\hero-scrub.mp4"  copy /Y "media\hero-scrub.mp4"  "public\media\" >nul
if exist "media\hero-scrub.webm" copy /Y "media\hero-scrub.webm" "public\media\" >nul

if exist "media\kbs-media-images.zip" (
  powershell -NoProfile -Command "Expand-Archive -Force -LiteralPath 'media\kbs-media-images.zip' -DestinationPath 'public\media'"
)

echo.
dir /b "public\media" | find /c /v "" > "%TEMP%\kbscount.txt"
set /p COUNT=<"%TEMP%\kbscount.txt"
del "%TEMP%\kbscount.txt"
echo Media ready: %COUNT% files in public\media
echo Expected: 20
echo.
endlocal
