@echo off
title TeksaInterio - Backend Server
echo ====================================================
echo Starting TeksaInterio PHP Backend Server...
echo ====================================================

cd /d "%~dp0backend"

:: Try system PHP first, then XAMPP PHP
where php >nul 2>nul
if %errorlevel% equ 0 (
    set PHP_BIN=php
) else if exist "C:\xampp\php\php.exe" (
    set PHP_BIN=C:\xampp\php\php.exe
) else if exist "C:\laragon\bin\php\php.exe" (
    set PHP_BIN=C:\laragon\bin\php\php.exe
) else (
    echo [ERROR] PHP executable not found in PATH or C:\xampp\php\php.exe
    pause
    exit /b 1
)

echo Using PHP: %PHP_BIN%
echo Server running at: http://127.0.0.1:8000
echo Press Ctrl+C to stop the server.
echo ----------------------------------------------------

"%PHP_BIN%" -d upload_max_filesize=1024M -d post_max_size=1024M -d memory_limit=1024M -d max_execution_time=1800 -d max_input_time=1800 -S 127.0.0.1:8000
pause
