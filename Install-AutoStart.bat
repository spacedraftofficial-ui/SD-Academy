@echo off
title SD Academy — Auto-Start Installer
color 0A
cls

echo ================================================================
echo      SD ACADEMY — AUTOMATIC 24/7 WINDOWS STARTUP INSTALLER
echo ================================================================
echo.

cd /d "%~dp0"

set "TARGET_DIR=%~dp0"
set "VBS_FILE=%TARGET_DIR%run-hidden.vbs"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\SD-Academy-Server.lnk"

:: 1. Create a VBScript to launch node silently in the background (no black CMD popup)
echo Set WshShell = CreateObject("WScript.Shell") > "%VBS_FILE%"
echo WshShell.CurrentDirectory = "%TARGET_DIR:~0,-1%" >> "%VBS_FILE%"
echo WshShell.Run "node app.js", 0, False >> "%VBS_FILE%"

:: 2. Create a Windows Shortcut in the Startup Folder
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"%VBS_FILE%\"'; $s.WorkingDirectory = '%TARGET_DIR:~0,-1%'; $s.Save()"

echo [SUCCESS] SD Academy is now installed to start automatically on Windows boot!
echo.
echo ================================================================
echo   * Background Launcher: %VBS_FILE%
echo   * Windows Startup:     %SHORTCUT_PATH%
echo ================================================================
echo.
echo The server will now start silently in the background every time
echo this computer turns on.
echo.
echo Starting the server right now in the background...
wscript.exe "%VBS_FILE%"

echo.
echo Opening browser to login page...
start "" "http://localhost:3001/login.html"
echo.
echo All set! You can close this window.
echo.
pause
