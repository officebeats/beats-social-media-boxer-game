param(
    [int]$Port = 4180,
    [string]$OutputPath = 'output\pass2-balance.json'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$nodePath = 'C:\Users\admin-beats\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$pythonPath = 'C:\Users\admin-beats\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$pico8Path = 'C:\Program Files (x86)\PICO-8\pico8.exe'
$generatorPath = Join-Path $projectRoot 'tools\make-balance-cart.mjs'
$checkerPath = Join-Path $projectRoot 'tools\balance-check.cjs'
$cartPath = Join-Path $projectRoot 'locked-in-ring.p8'
$tempRoot = Join-Path $projectRoot 'tmp\balance'
$tempCart = Join-Path $tempRoot 'balance.p8'
$tempWeb = Join-Path $tempRoot 'web'

New-Item -ItemType Directory -Force -Path $tempWeb | Out-Null
& $nodePath $generatorPath $cartPath $tempCart
if ($LASTEXITCODE -ne 0) { throw "Balance cart generation failed: $LASTEXITCODE" }

Push-Location $tempWeb
try {
    & $pico8Path '..\balance.p8' -export 'index.html'
    if ($LASTEXITCODE -ne 0) { throw "Balance web export failed: $LASTEXITCODE" }
}
finally {
    Pop-Location
}

$server = Start-Process -FilePath $pythonPath -ArgumentList '-m', 'http.server', $Port, '--directory', $tempWeb -WindowStyle Hidden -PassThru
try {
    $url = "http://127.0.0.1:$Port/"
    $deadline = [DateTime]::UtcNow.AddSeconds(10)
    do {
        try { $ready = (Invoke-WebRequest -UseBasicParsing $url).StatusCode -eq 200 } catch { $ready = $false }
        if (-not $ready) { Start-Sleep -Milliseconds 100 }
    } while (-not $ready -and [DateTime]::UtcNow -lt $deadline)
    if (-not $ready) { throw "Balance server did not start: $url" }

    $env:NODE_PATH = 'C:\Users\admin-beats\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules;C:\Users\admin-beats\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\.pnpm\node_modules'
    & $nodePath $checkerPath $url (Join-Path $projectRoot $OutputPath)
    if ($LASTEXITCODE -ne 0) { throw "Balance check failed: $LASTEXITCODE" }
}
finally {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
}
