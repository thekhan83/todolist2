@echo off
chcp 65001 >nul
echo ========================================================
echo   TaskFlow Focus - GitHub 원클릭 자동 업로드
echo ========================================================
echo.

echo [1/3] 변경된 파일을 확인하고 추가합니다...
git add .

echo.
set /p commitMsg="커밋 메시지를 입력하세요 (그냥 Enter를 누르면 자동 생성됩니다): "
if "%commitMsg%"=="" (
    set commitMsg=업데이트: %date% %time%
)

echo.
echo [2/3] 변경 내용을 저장(Commit)합니다...
git commit -m "%commitMsg%"

echo.
echo [3/3] GitHub (thekhan83/todolist2)로 업로드(Push)합니다...
git push origin main

echo.
echo ========================================================
echo   성공적으로 GitHub에 업로드되었습니다!
echo   (Vercel에 연동되어 있다면 웹사이트도 자동 갱신됩니다)
echo ========================================================
echo.
pause
