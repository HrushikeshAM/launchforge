@echo off
echo Stopping LaunchForge servers...

:: We kill any process listening on 5000 and 5173 to effectively stop LaunchForge without killing all nodes
echo Finding processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| find "5000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find "5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo Servers stopped gracefully.
pause
