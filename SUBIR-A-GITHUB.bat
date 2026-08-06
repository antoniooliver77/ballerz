@echo off
chcp 65001 >nul
echo.
echo   ================================================
echo    Subiendo el sitio de Ballerz a GitHub
echo   ================================================
echo.
cd /d "%~dp0"
git --version >nul 2>&1
if errorlevel 1 (
  echo   [X] No tienes Git instalado.
  echo       Descargalo aqui: https://git-scm.com/download/win
  echo       Instala con todas las opciones por defecto y vuelve a
  echo       hacer doble clic en este archivo.
  echo.
  pause
  exit /b
)
echo   [1/2] Verificando el repositorio...
git remote set-url origin https://github.com/antoniooliver77/ballerz.git
echo   [2/2] Subiendo... (si pide usuario y contrasena, se abrira el navegador)
git push -u origin main
if errorlevel 1 (
  echo.
  echo   [X] Algo fallo. Copia el mensaje de arriba y mandaselo a Claude.
) else (
  echo.
  echo   [OK] Listo. Ya esta en:
  echo        https://github.com/antoniooliver77/ballerz
  echo.
  echo   Siguiente paso: entra a vercel.com e importa ese repositorio.
)
echo.
pause
