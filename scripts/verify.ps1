$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$apiDirectory = Join-Path $root "services\api"
$webDirectory = Join-Path $root "apps\web"
$venvPython = Join-Path $apiDirectory ".venv\Scripts\python.exe"

if (-not (Test-Path -LiteralPath $venvPython)) {
    throw "Backend virtual environment is missing. Run 'npm run setup' first."
}

Write-Host "Running backend tests..." -ForegroundColor Cyan
Push-Location $apiDirectory
try {
    & $venvPython -m pytest -q
    if ($LASTEXITCODE -ne 0) {
        throw "Backend tests failed."
    }
}
finally {
    Pop-Location
}

Write-Host "Running frontend type-check..." -ForegroundColor Cyan
& npm.cmd --prefix $webDirectory run typecheck
if ($LASTEXITCODE -ne 0) {
    throw "Frontend type-check failed."
}

Write-Host "Running frontend production build..." -ForegroundColor Cyan
& npm.cmd --prefix $webDirectory run build
if ($LASTEXITCODE -ne 0) {
    throw "Frontend production build failed."
}

Write-Host "Running dependency audit..." -ForegroundColor Cyan
& npm.cmd --prefix $webDirectory audit --audit-level=moderate
if ($LASTEXITCODE -ne 0) {
    throw "Dependency audit failed."
}

Write-Host "Verification complete." -ForegroundColor Green
