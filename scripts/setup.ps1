$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$apiDirectory = Join-Path $root "services\api"
$webDirectory = Join-Path $root "apps\web"
$venvPython = Join-Path $apiDirectory ".venv\Scripts\python.exe"

if (-not (Test-Path -LiteralPath $venvPython)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
    & python -m venv (Join-Path $apiDirectory ".venv")
}

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
& $venvPython -m pip install -r (Join-Path $apiDirectory "requirements.txt")
if ($LASTEXITCODE -ne 0) {
    throw "Backend dependency installation failed."
}

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
& npm.cmd --prefix $webDirectory install
if ($LASTEXITCODE -ne 0) {
    throw "Frontend dependency installation failed."
}

Write-Host ""
Write-Host "Setup complete. Run npm run dev from the repository root." -ForegroundColor Green
