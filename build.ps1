param(
    [string]$Pico8Path = 'C:\Program Files (x86)\PICO-8\pico8.exe'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$cartPath = Join-Path $projectRoot 'locked-in-ring.p8'
$distPath = Join-Path $projectRoot 'dist'
$webPath = Join-Path $distPath 'web'
$nodePath = 'C:\Users\admin-beats\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$ensureLabelPath = Join-Path $projectRoot 'tools\ensure-label.mjs'
$postExportPath = Join-Path $projectRoot 'tools\post-export.mjs'

function Wait-ForStableFile {
    param(
        [string]$Path,
        [int]$TimeoutSeconds = 15
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

if (-not (Test-Path -LiteralPath $nodePath)) {
    throw "Bundled Node.js executable not found: $nodePath"
}

New-Item -ItemType Directory -Force -Path $webPath | Out-Null

$generatedFiles = @(
    (Join-Path $distPath 'locked-in-ring.p8.png'),
    (Join-Path $webPath 'index.html'),
    (Join-Path $webPath 'index.js')
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

    & $Pico8Path 'locked-in-ring.p8' -export 'dist/locked-in-ring.p8.png'
    if ($LASTEXITCODE -ne 0) {
        throw "PICO-8 cartridge export failed with exit code $LASTEXITCODE"
    }
    Wait-ForStableFile (Join-Path $distPath 'locked-in-ring.p8.png')

    & $Pico8Path 'dist/locked-in-ring.p8.png' -export 'dist/web/index.html'
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

Get-Item -LiteralPath (Join-Path $distPath 'locked-in-ring.p8.png'), (Join-Path $webPath 'index.html'), (Join-Path $webPath 'index.js') |
    Select-Object FullName, Length, LastWriteTime
