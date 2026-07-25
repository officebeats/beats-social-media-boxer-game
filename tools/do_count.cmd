@echo off
cd /d C:\Users\admin-beats\pico8-mcp-server\shrinko8
python shrinko8.py C:\Users\admin-beats\beats-social-media-boxer-game\ring-rush.p8 --count > C:\Users\admin-beats\beats-social-media-boxer-game\tools\token-count-out.txt 2>&1
python C:\Users\admin-beats\beats-social-media-boxer-game\tools\count_tokens.py >> C:\Users\admin-beats\beats-social-media-boxer-game\tools\token-count-out.txt 2>&1
python C:\Users\admin-beats\beats-social-media-boxer-game\tools\pico_count.py >> C:\Users\admin-beats\beats-social-media-boxer-game\tools\token-count-out.txt 2>&1
type C:\Users\admin-beats\beats-social-media-boxer-game\tools\token-count-out.txt
