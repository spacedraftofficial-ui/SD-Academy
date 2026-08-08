@echo off
title SD Academy — Local Office LMS Server
color 0B
cls

echo ================================================================
echo          SD ACADEMY — LOCAL OFFICE LMS SERVER (24/7)
echo ================================================================
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this computer.
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists, otherwise install dependencies
if not exist "node_modules\" (
    echo [SETUP] Installing required dependencies...
    call npm install
    echo [SETUP] Seeding database with initial users and courses...
    call npm run seed
)

:: Get Local IP Address for other office computers
set LOCAL_IP=localhost
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "Persistent"') do (
    set LOCAL_IP=%%a
    goto :ip_found
)
:ip_found

echo [INFO] Starting SD Academy LMS Server on Port 3001...
echo.
echo ================================================================
echo   * This Computer Access:   http://localhost:3001/login.html
echo   * Other Office PCs Access: http://%LOCAL_IP%:3001/login.html
echo ================================================================
echo.
echo DEFAULT LOGIN CREDENTIALS:
echo   - Admin:    admin@sdacademy.in      (Password: admin123)
echo   - Learner:  john.abraham@sdacademy.in (Password: learner123)
echo   - Reviewer: david.k@sdacademy.in      (Password: learner123)
echo.
echo ================================================================
echo   Keep this window open to allow other office computers to connect.
echo   To run silently in background at startup, run Install-AutoStart.bat
echo ================================================================
echo.

:: Automatically open browser after 2 seconds
start "" "http://localhost:3001/login.html"

:: Run Node.js Application
node app.js

pause
