@echo off
echo ========================================================
echo   INICIANDO O FLUXO PLANEJADOS ERP
echo   Por favor, aguarde... (A primeira vez demora um pouco)
echo ========================================================
echo.

REM Verifica se o Docker esta rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] O Docker nao parece estar rodando!
    echo Por favor, abra o "Docker Desktop" primeiro e tente novamente.
    echo.
    pause
    exit /b
)

echo [OK] Docker detectado. Construindo e iniciando...
echo.

docker-compose up --build

pause
