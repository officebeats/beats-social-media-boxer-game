#!/usr/bin/env python3
"""Standalone PICO-8 token counter (approximates official rules)."""
import re
import sys
from pathlib import Path

FREE = {",", ".", ":", ";", "::", ")", "]", "}", "end", "local"}
KEYWORDS = {
    "and","break","do","else","elseif","false","for","function","goto",
    "if","in","nil","not","or","repeat","return","then","true","until","while"
}
# multi-char ops longest first
OPS = [
    "+=","-=","*=","/=","%=","^=","..=","<=",">=","!=","~=","==","<<",">>",
    "//","..","<-",
]

def strip_comments(src: str) -> str:
    out = []
    i = 0
    n = len(src)
    while i < n:
        if src.startswith("--[[", i):
            j = src.find("]]", i+4)
            i = n if j < 0 else j+2
            continue
        if src.startswith("--", i):
            j = src.find("\n", i)
            i = n if j < 0 else j
            continue
        out.append(src[i])
        i += 1
    return "".join(out)

def tokenize(src: str):
    src = strip_comments(src)
    tokens = []
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        if c.isspace():
            i += 1
            continue
        # strings
        if c in "\"'":
            q = c
            j = i+1
            while j < n:
                if src[j] == "\\":
                    j += 2
                    continue
                if src[j] == q:
                    j += 1
                    break
                j += 1
            tokens.append(src[i:j])
            i = j
            continue
        if src.startswith("[[", i):
            j = src.find("]]", i+2)
            j = n if j < 0 else j+2
            tokens.append(src[i:j])
            i = j
            continue
        # numbers
        if c.isdigit() or (c == "." and i+1 < n and src[i+1].isdigit()):
            j = i
            if src.startswith("0x", i) or src.startswith("0X", i):
                j += 2
                while j < n and src[j] in "0123456789abcdefABCDEF.":
                    j += 1
            else:
                while j < n and (src[j].isdigit() or src[j] in ".eExX"):
                    j += 1
            tokens.append(src[i:j])
            i = j
            continue
        # ident / keyword
        if c.isalpha() or c == "_":
            j = i+1
            while j < n and (src[j].isalnum() or src[j] == "_"):
                j += 1
            tokens.append(src[i:j])
            i = j
            continue
        # multi-char ops
        matched = False
        for op in OPS:
            if src.startswith(op, i):
                tokens.append(op)
                i += len(op)
                matched = True
                break
        if matched:
            continue
        # single char
        tokens.append(c)
        i += 1
    return tokens

def count_tokens(tokens):
    count = 0
    for i, t in enumerate(tokens):
        if t in FREE:
            continue
        # unary minus on number
        if t in ("-", "~") and i+1 < len(tokens):
            nxt = tokens[i+1]
            prev = tokens[i-1] if i > 0 else None
            if re.match(r"^\d", nxt) or (nxt.startswith("0x") or nxt.startswith("0X")):
                if prev is None or prev not in (
                    # ends of expression
                ) and not (
                    prev and (
                        re.match(r"^[\w'\"]", prev) or prev in (")", "]", "}", "end")
                    )
                ):
                    # treat as part of number - skip this op
                    if prev is None or prev in (
                        "+","-","*","/","%","^","=","<",">","!","~","(","[",
                        "{",",",";","and","or","not","return","if","then",
                        "else","elseif","while","do","for","=","..",".."
                    ) or prev in OPS or prev in ("{", "(", "[", ",", "=", "return", "and", "or", "not", "if", "then", "else", "elseif", "while", "do", "for", "until", ".." ):
                        continue
        # shorthand += etc count as 2
        if t in ("+=","-=","*=","/=","%=","^=","..="):
            count += 2
            continue
        count += 1
    return count

def main():
    path = Path(sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\admin-beats\beats-social-media-boxer-game\ring-rush.p8")
    text = path.read_text(encoding="utf-8", errors="replace")
    if "__lua__" in text:
        code = text.split("__lua__", 1)[1]
        for sec in ("__gfx__", "__gff__", "__map__", "__sfx__", "__music__", "__label__"):
            if sec in code:
                code = code.split(sec, 1)[0]
    else:
        code = text
    toks = tokenize(code)
    n = count_tokens(toks)
    print(f"tokens: {n} {n*100//8192}%")
    print(f"chars: {len(code)}")
    print(f"raw_tokens: {len(toks)}")
    return 0 if n <= 8192 else 1

if __name__ == "__main__":
    raise SystemExit(main())
