param(
    [int]$ApiPort = 8000,
    [int]$WebPort = 3000
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$apiDirectory = Join-Path $root "services\api"
$webDirectory = Join-Path $root "apps\web"
$venvPython = Join-Path $apiDirectory ".venv\Scripts\python.exe"
$backend = $null

function Test-ListeningPort([int]$Port) {
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $task = $client.ConnectAsync("127.0.0.1", $Port)
        return $task.Wait(250) -and $client.Connected
    }
    catch {
        return $false
    }
    finally {
        $client.Dispose()
    }
}

function Test-ApiHealth([int]$Port) {
    try {
        $response = Invoke-RestMethod "http://127.0.0.1:$Port/health" -TimeoutSec 1
        return $response.status -eq "ok"
    }
    catch {
        return $false
    }
}

if (-not (Test-Path -LiteralPath $venvPython)) {
    throw "Backend virtual environment is missing. Run 'npm run setup' from the repository root first."
}

if (-not (Test-Path -LiteralPath (Join-Path $webDirectory "node_modules"))) {
    throw "Frontend dependencies are missing. Run 'npm run setup' from the repository root first."
}

if (Test-ListeningPort $ApiPort) {
    if (-not (Test-ApiHealth $ApiPort)) {
        throw "Port $ApiPort is already occupied by a service that is not this FastAPI app."
    }
    Write-Host "Reusing the healthy API already running on port $ApiPort." -ForegroundColor Yellow
}
else {
    Write-Host "Starting FastAPI on http://127.0.0.1:$ApiPort ..." -ForegroundColor Cyan
    $backend = Start-Process `
        -FilePath $venvPython `
        -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "$ApiPort" `
        -WorkingDirectory $apiDirectory `
        -WindowStyle Hidden `
        -PassThru

    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        Start-Sleep -Milliseconds 250
        if (Test-ApiHealth $ApiPort) {
            $ready = $true
            break
        }
        if ($backend.HasExited) {
            throw "FastAPI exited before becoming healthy."
        }
    }
    if (-not $ready) {
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
        throw "FastAPI did not become healthy on port $ApiPort."
    }
}

if (Test-ListeningPort $WebPort) {
    if ($backend) {
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    }
    throw "Port $WebPort is already in use. Stop the existing frontend, then run 'npm run dev' again."
}

Write-Host ""
Write-Host "Flowlie Raise Readiness Copilot is ready:" -ForegroundColor Green
Write-Host "  App:      http://localhost:$WebPort/demo"
Write-Host "  API docs: http://127.0.0.1:$ApiPort/docs"
Write-Host "Press Ctrl+C to stop the stack."
Write-Host ""

$env:API_INTERNAL_URL = "http://127.0.0.1:$ApiPort"
try {
    & npm.cmd --prefix $webDirectory run dev -- --hostname 0.0.0.0 --port $WebPort
}
finally {
    if ($backend -and -not $backend.HasExited) {
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    }
}
