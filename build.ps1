param(
    [string]$Pico8Path = 'C:\Program Files (x86)\PICO-8\pico8.exe'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$cartName = 'ring-rush.p8'
$cartPath = Join-Path $projectRoot $cartName
$distPath = Join-Path $projectRoot 'dist'
$webPath = Join-Path $distPath 'web'
$pngPath = Join-Path $distPath 'ring-rush.p8.png'

function Resolve-Node {
    $candidates = @(
        (Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source),
        'C:\Program Files\nodejs\node.exe',
        'C:\Users\admin-beats\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    )
    foreach ($c in $candidates) {
        if ($c -and (Test-Path -LiteralPath $c)) { return $c }
    }
    throw 'Node.js not found. Install Node or add node to PATH.'
}

function Wait-ForStableFile {
    param(
        [string]$Path,
        [int]$TimeoutSeconds = 20
    )

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    $previousLength = -1
    while ([DateTime]::UtcNow -lt $deadline) {
        if (Test-Path -LiteralPath $Path) {
            $length = (Get-Item -LiteralPath $Path).Length
            if ($length -gt 0 -and $length -eq $previousLength) {
                return
            }
            $previousLength = $length
        }
        Start-Sleep -Milliseconds 100
    }

    throw "Timed out waiting for stable export file: $Path"
}

if (-not (Test-Path -LiteralPath $Pico8Path)) {
    throw "PICO-8 executable not found: $Pico8Path"
}

if (-not (Test-Path -LiteralPath $cartPath)) {
    throw "Cartridge not found: $cartPath"
}

$nodePath = Resolve-Node
$ensureLabelPath = Join-Path $projectRoot 'tools\ensure-label.mjs'
$postExportPath = Join-Path $projectRoot 'tools\post-export.mjs'

New-Item -ItemType Directory -Force -Path $webPath | Out-Null

# Clean previous export outputs only inside dist/
$generatedFiles = @(
    $pngPath,
    (Join-Path $webPath 'index.html'),
    (Join-Path $webPath 'index.js')
)
# Also remove legacy export names
$generatedFiles += @(
    (Join-Path $distPath 'locked-in-ring.p8.png')
)

$projectPrefix = [IO.Path]::GetFullPath($projectRoot).TrimEnd('\') + '\'
foreach ($generatedFile in $generatedFiles) {
    $resolvedGeneratedFile = [IO.Path]::GetFullPath($generatedFile)
    if (-not $resolvedGeneratedFile.StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to clean generated file outside project: $resolvedGeneratedFile"
    }
    if (Test-Path -LiteralPath $resolvedGeneratedFile) {
        Remove-Item -LiteralPath $resolvedGeneratedFile -Force
    }
}

Push-Location $projectRoot
try {
    & $nodePath $ensureLabelPath $cartPath
    if ($LASTEXITCODE -ne 0) {
        throw "Cartridge label generation failed with exit code $LASTEXITCODE"
    }

    Write-Host "Exporting cartridge PNG..."
    & $Pico8Path $cartName -export 'dist/ring-rush.p8.png'
    if ($LASTEXITCODE -ne 0) {
        throw "PICO-8 cartridge export failed with exit code $LASTEXITCODE"
    }
    Wait-ForStableFile $pngPath

    Write-Host "Exporting HTML player..."
    & $Pico8Path 'dist/ring-rush.p8.png' -export 'dist/web/index.html'
    if ($LASTEXITCODE -ne 0) {
        throw "PICO-8 HTML export failed with exit code $LASTEXITCODE"
    }
    Wait-ForStableFile (Join-Path $webPath 'index.html')
    Wait-ForStableFile (Join-Path $webPath 'index.js')

    & $nodePath $postExportPath (Join-Path $webPath 'index.html')
    if ($LASTEXITCODE -ne 0) {
        throw "HTML post-export step failed with exit code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}

Get-Item -LiteralPath $pngPath, (Join-Path $webPath 'index.html'), (Join-Path $webPath 'index.js') |
    Select-Object FullName, Length, LastWriteTime

Write-Host ""
Write-Host "Build complete."
Write-Host "  Local:  .\tools\serve.ps1   then open http://127.0.0.1:4173/"
Write-Host "  Pages:  push main to deploy dist/web"
