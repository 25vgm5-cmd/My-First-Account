@echo off
setlocal
cd /d "%~dp0"

echo ==================================================
echo   MyFirst Account - Windows Single HTML Builder
echo ==================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed. Please install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies first time...
  call npm install --legacy-peer-deps
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo Building standalone MyFirstAccount.html ...
call npm run build:html
if errorlevel 1 (
  echo [ERROR] Single HTML build failed.
  pause
  exit /b 1
)

echo.
echo SUCCESS! Your standalone HTML app is ready:
echo   %cd%\dist-single\MyFirstAccount.html
echo.
start "" "dist-single"
pause
