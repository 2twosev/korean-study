@echo off
chcp 936 >nul
title Han-gul Study Server
cd /d "%~dp0"

echo.
echo   Starting Korean Study App...
echo   Keep this window open while using it.
echo.

where node >nul 2>&1
if not errorlevel 1 (
  node serve.js
  goto :end
)

if exist "%USERPROFILE%\.workbuddy\binaries\node\versions\22.22.2\node.exe" (
  "%USERPROFILE%\.workbuddy\binaries\node\versions\22.22.2\node.exe" serve.js
  goto :end
)

where python >nul 2>&1
if not errorlevel 1 (
  python serve.py
  goto :end
)

echo   [ERROR] Node.js or Python not found.
echo   Install Node.js first: https://nodejs.org/
echo.

:end
pause
