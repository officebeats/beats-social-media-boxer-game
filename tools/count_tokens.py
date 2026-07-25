#!/usr/bin/env python3
"""Count PICO-8 tokens via shrinko8."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(r"C:\Users\admin-beats\pico8-mcp-server\shrinko8")))

from pico_cart import read_cart
from pico_tokenize import tokenize, count_tokens
from pico_process import Source

cart_path = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\admin-beats\beats-social-media-boxer-game\ring-rush.p8"
cart = read_cart(cart_path)
source = Source(cart_path, cart.code)
tokens, errors = tokenize(source)
count = count_tokens(tokens)
chars = len(cart.code)
print(f"tokens: {count} {count*100//8192}%")
print(f"chars: {chars}")
if errors:
    print(f"tokenize errors: {len(errors)}")
    for e in errors[:10]:
        print(f"  {e}")
sys.exit(0 if count <= 8192 else 1)
