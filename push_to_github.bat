@echo off
cd /d "%~dp0"
echo Pushing code to GitHub...
git init
git add .
git commit -m "Initial commit of complete project"
git branch -M main
git remote add origin https://github.com/CODEWITHPRUTVHI/specforge-ai.git
git push origin main -f
echo.
echo ==============================================
echo Done pushing to GitHub! Vercel will now deploy.
echo ==============================================
pause
