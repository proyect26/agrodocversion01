@echo off
setlocal
title AgroDocs - Sistema de Gestión Logística
 
echo ==========================================
echo       INICIANDO SISTEMA AGRODOCS
echo ==========================================
echo.
 
:: Verificar si Node.js está instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit
)
 
:: Cerrar procesos previos en los puertos 5173 y 5174
echo [1/3] Limpiando puertos...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174') do taskkill /f /pid %%a >nul 2>&1
 
echo [2/3] Arrancando servidor local...
:: Iniciar el servidor en una ventana minimizada
start /min "Servidor AgroDocs" cmd /c "npm run dev"
 
echo [3/3] Esperando a que el servidor este listo (10 segundos)...
:: Esperar 10 segundos
timeout /t 10 /nobreak > nul
 
echo.
echo Intentando abrir la aplicacion en el navegador...
start http://localhost:5173
 
echo.
echo ==========================================
echo SI EL NAVEGADOR MUESTRA "NO SE PUEDE ACCEDER":
echo 1. Espera 5 segundos mas y recarga (F5).
echo 2. Revisa si hay errores en la ventana negra del servidor.
echo ==========================================
echo.
pause
exit
