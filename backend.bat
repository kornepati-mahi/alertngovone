@echo off
setlocal EnableExtensions
title ALERT NGO - Backend Server
color 0A

echo ====================================================
echo Starting ALERT NGO PHP Backend Server...
echo ====================================================
echo.

set "PORT=8001"

cd /d "%~dp0backend"
if errorlevel 1 (
    echo [ERROR] backend folder not found next to this script.
    pause
    exit /b 1
)

rem ---- Find PHP: system PATH first, then XAMPP, then Laragon ----
set "PHP_BIN="
where php >nul 2>nul
if not errorlevel 1 set "PHP_BIN=php"
if not defined PHP_BIN if exist "C:\xampp\php\php.exe" set "PHP_BIN=C:\xampp\php\php.exe"
if not defined PHP_BIN if exist "C:\laragon\bin\php\php.exe" set "PHP_BIN=C:\laragon\bin\php\php.exe"
if not defined PHP_BIN (
    echo [ERROR] PHP executable not found in PATH, C:\xampp\php\php.exe or C:\laragon\bin\php\php.exe
    pause
    exit /b 1
)

rem ---- Port must be free ----
netstat -an | findstr /C:":%PORT% " | findstr /C:"LISTENING" >nul
if not errorlevel 1 (
    echo [ERROR] Port %PORT% is already in use.
    echo Stop the other server or change PORT near the top of this file.
    pause
    exit /b 1
)

rem ---- MySQL must be running on 3306 (API uses alertngo_db) ----
netstat -an | findstr /C:":3306 " | findstr /C:"LISTENING" >nul
if errorlevel 1 if exist "C:\xampp\mysql_start.bat" (
    echo MySQL is not running - starting XAMPP MySQL ...
    start "XAMPP MySQL" /min "C:\xampp\mysql_start.bat"
    timeout /t 6 /nobreak >nul
)

rem ---- Create database and tables on first run ----
if exist "C:\xampp\mysql\bin\mysql.exe" (
    "C:\xampp\mysql\bin\mysql.exe" -u root -h 127.0.0.1 -P 3306 -N -e "SHOW DATABASES LIKE 'alertngo_db';" 2>nul | findstr /C:"alertngo_db" >nul
    if errorlevel 1 (
        echo Creating database alertngo_db from schema.sql ...
        "C:\xampp\mysql\bin\mysql.exe" -u root -h 127.0.0.1 -P 3306 < schema.sql
    )
)

echo Using PHP: %PHP_BIN%
echo Server running at: http://127.0.0.1:%PORT%
echo Health check:       http://127.0.0.1:%PORT%/get_stats.php
echo Press Ctrl+C to stop the server.
echo ----------------------------------------------------
echo.

"%PHP_BIN%" -d upload_max_filesize=1024M -d post_max_size=1024M -d memory_limit=1024M -d max_execution_time=1800 -d max_input_time=1800 -S 127.0.0.1:%PORT%

echo.
echo Server stopped.
pause
