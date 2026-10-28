@echo off
chcp 936 >nul
title Han-gul Study - Public Link
cd /d "%~dp0"

echo.
echo   Starting local server...
echo.

set NODEEXE=node
where node >nul 2>&1
if errorlevel 1 set NODEEXE=%USERPROFILE%\.workbuddy\binaries\node\versions\22.22.2\node.exe

start "KoreanStudy-Server" "%NODEEXE%" serve.js

echo   Waiting for server...
timeout /t 3 /nobreak >nul

echo.
echo   Creating public HTTPS link, please wait a few seconds.
echo   The URL will look like:  https://xxxx.trycloudflare.com
echo   Open it on your phone. Keep this window open.
echo.

npx --yes cloudflared@latest tunnel --url http://localhost:8138

pause
