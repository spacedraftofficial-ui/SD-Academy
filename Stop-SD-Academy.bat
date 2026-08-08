@echo off
title SD Academy — Stop Server
color 0C
cls

echo ================================================================
echo               SD ACADEMY — STOPPING LOCAL SERVER
echo ================================================================
echo.

:: Find and kill process running on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo Stopping SD Academy process with PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo [OK] SD Academy server has been stopped.
echo.
pause
