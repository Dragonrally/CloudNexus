@echo off
setlocal

echo ==========================================
echo  Starting Fresh React + Vite + Tailwind Setup
echo ==========================================

echo [1/5] Creating Vite + React template...
call npm create vite@latest . -- --template react -y

echo [2/5] Installing project dependencies...
call npm install

echo [3/5] Installing Tailwind CSS, PostCSS, Autoprefixer, and Lucide Icons...
call npm install -D tailwindcss postcss autoprefixer
call npm install lucide-react

echo [4/5] Generating Tailwind configuration files...
call npx tailwindcss init -p

echo [5/5] Setup script finished successfully!
echo.
echo Next: We will configure tailwind.config.js and index.css.
pause