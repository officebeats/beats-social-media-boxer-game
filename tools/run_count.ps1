$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\admin-beats\pico8-mcp-server\shrinko8'
$out = 'C:\Users\admin-beats\beats-social-media-boxer-game\tools\token-count.txt'
python shrinko8.py 'C:\Users\admin-beats\beats-social-media-boxer-game\ring-rush.p8' --count 2>&1 | Tee-Object -FilePath $out
python 'C:\Users\admin-beats\beats-social-media-boxer-game\tools\count_tokens.py' 2>&1 | Tee-Object -FilePath $out -Append
python 'C:\Users\admin-beats\beats-social-media-boxer-game\tools\pico_count.py' 2>&1 | Tee-Object -FilePath $out -Append
