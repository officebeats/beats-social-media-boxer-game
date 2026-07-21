param([switch]$SkipBuild)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$cartPath = Join-Path $projectRoot 'locked-in-ring.p8'
$distPath = Join-Path $projectRoot 'dist'
$webPath = Join-Path $distPath 'web'

if (-not $SkipBuild) { & (Join-Path $projectRoot 'build.ps1') }

$requiredFiles = @(
    $cartPath,
    (Join-Path $distPath 'locked-in-ring.p8.png'),
    (Join-Path $webPath 'index.html'),
    (Join-Path $webPath 'index.js'),
    (Join-Path $webPath '.nojekyll'),
    (Join-Path $projectRoot '.github\workflows\pages.yml'),
    (Join-Path $projectRoot 'README.md'),
    (Join-Path $projectRoot 'tools\boot-check.cjs'),
    (Join-Path $projectRoot 'tools\bag-check.cjs'),
    (Join-Path $projectRoot 'tools\likeness-check.cjs'),
    (Join-Path $projectRoot 'tools\mobile-check.cjs'),
    (Join-Path $projectRoot 'tools\playthrough.cjs')
)

$rows = foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath $file)) { throw "Required release file is missing: $file" }
    $item = Get-Item -LiteralPath $file
    if ($item.Length -eq 0 -and $item.Name -ne '.nojekyll') { throw "Required release file is empty: $file" }
    [PSCustomObject]@{ File = $item.FullName; Bytes = $item.Length }
}

$cartText = Get-Content -LiteralPath $cartPath -Raw
foreach ($section in '__lua__', '__sfx__', '__label__') {
    if (-not $cartText.Contains($section)) { throw "Cartridge is missing required section: $section" }
}

$requiredGamePatterns = @('bags={', 'function hit_bag(', 'function draw_bag(', 'function start_beat(', 'return hit!', 'gym demolition')
$missingGamePatterns = @($requiredGamePatterns | Where-Object { -not $cartText.Contains($_) })
if ($missingGamePatterns.Count -gt 0) { throw "Cartridge is missing bag-stage systems: $($missingGamePatterns -join ', ')" }

$removedGamePatterns = @('function ai_ctl(', 'function guard(', 'function decision(', 'function corner_init(', 'opponent hp')
$foundRemovedGamePatterns = @($removedGamePatterns | Where-Object { $cartText.Contains($_) })
if ($foundRemovedGamePatterns.Count -gt 0) { throw "Cartridge still contains opponent-bout systems: $($foundRemovedGamePatterns -join ', ')" }

$forbiddenNames = @('adrien', 'broner', 'deen', 'zab', 'judah', 'gerald', 'tucker', 'easter', 'ryan', 'garcia', 'ray j', 'claressa', 'shields')
$foundNames = @($forbiddenNames | Where-Object { $cartText -match [regex]::Escape($_) })
if ($foundNames.Count -gt 0) { throw "Public cartridge contains forbidden real-name references: $($foundNames -join ', ')" }

$removedPatterns = @(
    'cards=', 'function mkdeck(', 'function upd_camp(', 'camp hand',
    'function prep_init(', 'function upd_prep(', 'choose your work', 'ring rust'
)
$foundRemovedPatterns = @($removedPatterns | Where-Object { $cartText.Contains($_) })
if ($foundRemovedPatterns.Count -gt 0) { throw "Cartridge contains deferred progression code: $($foundRemovedPatterns -join ', ')" }

$sfxMatch = [regex]::Match($cartText, '(?s)__sfx__\r?\n(.*?)(?:\r?\n__\w+__)')
if (-not $sfxMatch.Success) { throw 'Unable to parse the SFX section.' }
$sfxRows = @($sfxMatch.Groups[1].Value -split '\r?\n' | Where-Object { $_.Trim().Length -gt 0 })
if ($sfxRows.Count -lt 11) { throw "Expected at least 11 SFX rows, found $($sfxRows.Count)." }
foreach ($index in 8..10) {
    if (-not $sfxRows[$index].StartsWith('00080020')) { throw "Trap loop SFX row $index is not configured to loop." }
}
foreach ($pattern in 'sfx(8,0)', 'sfx(9,1)', 'sfx(10,2)', 'sfx(win and 7 or 6,3)') {
    if (-not $cartText.Contains($pattern)) { throw "Audio routing is missing: $pattern" }
}

$htmlText = Get-Content -LiteralPath (Join-Path $webPath 'index.html') -Raw
foreach ($pattern in 'locked-in-ring-test-bridge', 'Locked-In Bag Break', 'viewport-fit=cover', 'touch-action: none', 'window.pico8_buttons[0]') {
    if (-not $htmlText.Contains($pattern)) { throw "Exported HTML is missing: $pattern" }
}

$workflowText = Get-Content -LiteralPath (Join-Path $projectRoot '.github\workflows\pages.yml') -Raw
foreach ($pattern in 'actions/configure-pages@v5', 'enablement: true', 'actions/upload-pages-artifact@v4', 'actions/deploy-pages@v4', 'path: dist/web') {
    if (-not $workflowText.Contains($pattern)) { throw "Pages workflow is missing: $pattern" }
}

$rows | Format-Table -AutoSize
'RELEASE_STATIC_CHECKS_OK'
