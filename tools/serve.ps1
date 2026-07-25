param(
    [int]$Port = 4173
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$webPath = Join-Path $projectRoot 'dist\web'

if (-not (Test-Path -LiteralPath (Join-Path $webPath 'index.html'))) {
    throw 'Web export is missing. Run .\build.ps1 first.'
}

function Resolve-Python {
    $candidates = @(
        (Get-Command python -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source),
        (Get-Command py -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source),
        'C:\Users\admin-beats\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
    )
    foreach ($c in $candidates) {
        if ($c -and (Test-Path -LiteralPath $c)) { return $c }
    }
    throw 'Python not found. Install Python 3 or add it to PATH.'
}

$pythonPath = Resolve-Python
Write-Host "Serving $webPath"
Write-Host "Open http://127.0.0.1:$Port/"
Write-Host "Ctrl+C to stop."
& $pythonPath -m http.server $Port --directory $webPath
