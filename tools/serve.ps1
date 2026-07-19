param(
    [int]$Port = 4173
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$webPath = Join-Path $projectRoot 'dist\web'
$pythonPath = 'C:\Users\admin-beats\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'

if (-not (Test-Path -LiteralPath (Join-Path $webPath 'index.html'))) {
    throw 'Web export is missing. Run build.ps1 first.'
}

& $pythonPath -m http.server $Port --directory $webPath
