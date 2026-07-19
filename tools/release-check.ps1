param(
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$cartPath = Join-Path $projectRoot 'locked-in-ring.p8'
$distPath = Join-Path $projectRoot 'dist'
$webPath = Join-Path $distPath 'web'

if (-not $SkipBuild) {
    & (Join-Path $projectRoot 'build.ps1')
}

$requiredFiles = @(
    $cartPath,
    (Join-Path $distPath 'locked-in-ring.p8.png'),
    (Join-Path $webPath 'index.html'),
    (Join-Path $webPath 'index.js'),
    (Join-Path $projectRoot 'README.md'),
    (Join-Path $projectRoot 'tools\playthrough.cjs'),
    (Join-Path $projectRoot 'tools\defense-check.cjs'),
    (Join-Path $projectRoot 'tools\animation-check.cjs'),
    (Join-Path $projectRoot 'tools\combo-check.cjs'),
    (Join-Path $projectRoot 'tools\ui-check.cjs'),
    (Join-Path $projectRoot 'tools\mobile-check.cjs'),
    (Join-Path $projectRoot 'tools\balance-check.cjs'),
    (Join-Path $projectRoot 'tools\arcade-feel-check.cjs')
)

$rows = foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Required release file is missing: $file"
    }

    $item = Get-Item -LiteralPath $file
    if ($item.Length -eq 0) {
        throw "Required release file is empty: $file"
    }

    [PSCustomObject]@{ File = $item.FullName; Bytes = $item.Length }
}

$cartText = Get-Content -LiteralPath $cartPath -Raw
foreach ($section in '__lua__', '__sfx__', '__label__') {
    if (-not $cartText.Contains($section)) {
        throw "Cartridge is missing required section: $section"
    }
}
$forbiddenNames = @(
    'adrien', 'broner', 'deen', 'zab', 'judah', 'gerald', 'tucker',
    'easter', 'ryan', 'garcia', 'ray j', 'claressa', 'shields'
)

$foundNames = @($forbiddenNames | Where-Object { $cartText -match [regex]::Escape($_) })
if ($foundNames.Count -gt 0) {
    throw "Public cartridge contains forbidden real-name references: $($foundNames -join ', ')"
}

$removedCardPatterns = @(
    'cards=', 'function mkdeck(', 'function upd_camp(', 'function draw_camp(',
    'function card_face(', 'camp hand', 'campn', 'card bonus'
)
$foundCardPatterns = @($removedCardPatterns | Where-Object { $cartText.Contains($_) })
if ($foundCardPatterns.Count -gt 0) {
    throw "Fighting-only cartridge contains removed card-system code: $($foundCardPatterns -join ', ')"
}

$removedTrainingPatterns = @(
    'function prep_init(', 'function upd_prep(', 'function draw_prep(',
    'choose your work', 'ring rust', 'camp_st', 'skipn', 'drn={'
)
$foundTrainingPatterns = @($removedTrainingPatterns | Where-Object { $cartText.Contains($_) })
if ($foundTrainingPatterns.Count -gt 0) {
    throw "Direct-fight cartridge contains removed training code: $($foundTrainingPatterns -join ', ')"
}

$htmlText = Get-Content -LiteralPath (Join-Path $webPath 'index.html') -Raw
if (-not $htmlText.Contains('locked-in-ring-test-bridge')) {
    throw 'Exported HTML is missing the GPIO/fullscreen bridge.'
}
if (-not $htmlText.Contains('Locked-In Ring')) {
    throw 'Exported HTML is missing the release title.'
}
if (-not $htmlText.Contains('viewport-fit=cover')) {
    throw 'Exported HTML is missing the mobile viewport contract.'
}
if (-not $htmlText.Contains('touch-action: none')) {
    throw 'Exported HTML is missing touch gesture suppression.'
}
if (-not $htmlText.Contains('window.pico8_buttons[0]')) {
    throw 'Exported HTML is missing the A/B button bridge.'
}

$rows | Format-Table -AutoSize
'RELEASE_STATIC_CHECKS_OK'
