@echo off
cd /d "%~dp0"
title SpecForge AI Server
echo =======================================
echo SpecForge AI - Startup Script
echo =======================================
echo.
echo Step 1: Installing dependencies...
call npm install
echo.
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies. Check your internet connection or Node.js installation.
    pause
    exit /b
)
echo Step 2: Starting the development server...
echo You should see "Ready in XXXms" below.
echo Do not close this window while you are using the app!
echo.
call npm run dev
echo.
echo Server stopped or failed to start.
pause
