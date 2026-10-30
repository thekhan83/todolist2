@echo off
cd /d "%~dp0"
title TaskFlow Focus - GitHub Auto Upload

echo ========================================================
echo    TaskFlow Focus - GitHub Auto Upload
echo ========================================================
echo.

echo [1/3] Adding changes to Git...
git add .
echo.

echo [2/3] Saving changes (Commit)...
git commit -m "Auto Update: %date% %time%"
echo.

echo [3/3] Uploading to GitHub (Push)...
git push origin main
echo.

echo ========================================================
echo    [SUCCESS] Upload Completed!
echo    Your live website on Vercel is being updated.
echo ========================================================
echo.
pause
