@echo off
title Music Import

echo Starting music import...
cd /d "%~dp0back"

npx tsx scripts/import-music.ts

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Music import failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Music import completed successfully.
pause