@echo off
setlocal EnableDelayedExpansion
chcp 936 >nul
title Deploy to GitHub Pages
cd /d "%~dp0"

echo.
echo   ============================================
echo     Deploy Korean Study App to GitHub Pages
echo   ============================================
echo.
echo   Before running, you need:
echo     1. A GitHub account
echo     2. A Personal Access Token (classic) with "repo" scope
echo.
echo   ============================================
echo.

set /p GHUSER=GitHub username: 
set /p GHTOKEN=Personal Access Token (ghp_xxx): 
set /p REPONAME=Repository name [korean-study]: 
if "%REPONAME%"=="" set REPONAME=korean-study

if "%GHUSER%"=="" goto :missing
if "%GHTOKEN%"=="" goto :missing

echo {"name":"%REPONAME%","public":true,"auto_init":false} > _repo.json

echo.
echo   [1/4] Creating repository...
curl -s -X POST -H "Authorization: token %GHTOKEN%" -H "Accept: application/vnd.github+json" -d @_repo.json https://api.github.com/user/repos > _resp.txt
findstr /C:"full_name" _resp.txt >nul
if errorlevel 1 (
  echo   Repo may already exist. Continuing...
) else (
  echo   Repository created.
)

echo.
echo   [2/4] Committing files...
git init -b main 2>nul
git config --local user.email "deploy@local.dev"
git config --local user.name "%GHUSER%"
git add -A
git commit -m "Deploy Korean study app" >nul 2>&1
if errorlevel 1 echo   (no changes to commit, using existing)

echo.
echo   [3/4] Pushing to GitHub...
git remote remove origin >nul 2>&1
git remote add origin https://%GHUSER%:%GHTOKEN%@github.com/%GHUSER%/%REPONAME%.git
git branch -M main
git push -u origin main --force
if errorlevel 1 (
  echo.
  echo   [ERROR] Push failed. Check username/token and try again.
  goto :cleanup
)
echo   Pushed.

echo.
echo   [4/4] Enabling GitHub Pages...
echo {"source":{"branch":"main","path":"/"}} > _pages.json
curl -s -X POST -H "Authorization: token %GHTOKEN%" -H "Accept: application/vnd.github+json" -d @_pages.json https://api.github.com/repos/%GHUSER%/%REPONAME%/pages > _pages_resp.txt
findstr /C:"html_url" _pages_resp.txt >nul
if errorlevel 1 (
  echo   Pages may already be enabled, or needs enabling manually:
  echo   Repo ^> Settings ^> Pages ^> Source: main / root
) else (
  echo   Pages enabled.
)

:cleanup
del _repo.json _pages.json _resp.txt _pages_resp.txt >nul 2>&1

echo.
echo   ============================================
echo     DONE!  Your permanent URL:
echo.
echo       https://%GHUSER%.github.io/%REPONAME%/
echo.
echo     First visit may take 1-3 minutes to go live.
echo     Keep this URL - it never changes.
echo   ============================================
echo.
pause
exit /b 0

:missing
echo   [ERROR] Username and token are required.
pause
exit /b 1
