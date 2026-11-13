#!/usr/bin/env python3
"""Collect the user's own messages from local Claude Code transcripts, so The Muuus reads what they actually said.

Reads only ~/.claude/projects/<project>/*.jsonl on this machine (by default only the current project's folder;
--all reads every project) and writes only --out. Skips tool results, skill bodies, system notes, session summaries
and very long pastes.
"""
import argparse, glob, json, os, sys
from datetime import date, timedelta

p = argparse.ArgumentParser()
p.add_argument('--since', default=(date.today() - timedelta(days=10)).isoformat(), help='YYYY-MM-DD (default: 10 days ago)')
p.add_argument('--out', required=True)
p.add_argument('--max-len', type=int, default=3000)
p.add_argument('--project', default=os.getcwd(), help='project directory whose transcripts to read (default: current directory)')
p.add_argument('--all', action='store_true', help='read the transcripts of every project on this machine')
a = p.parse_args()

# Claude Code keeps a project's transcripts in ~/.claude/projects/<its absolute path with every / and . as ->/
folder = '*' if a.all else os.path.abspath(a.project).replace('/', '-').replace('.', '-')
rows = []
for f in glob.glob(os.path.expanduser(f'~/.claude/projects/{folder}/*.jsonl')):
    try:
        lines = open(f, encoding='utf-8', errors='replace')
    except OSError:
        continue
    for l in lines:
        try:
            r = json.loads(l)
        except ValueError:
            continue
        if r.get('type') != 'user' or r.get('isSidechain'):
            continue
        ts = r.get('timestamp') or ''
        if ts[:10] < a.since:
            continue
        c = (r.get('message') or {}).get('content')
        t = c if isinstance(c, str) else ' '.join(x.get('text', '') for x in (c or []) if isinstance(x, dict) and x.get('type') == 'text')
        t = t.strip()
        if not t or t.startswith('<') or 'Base directory for this skill' in t or 'This session is being continued' in t or len(t) > a.max_len:
            continue
        rows.append((ts, t))

rows.sort()
seen, out = set(), []
for ts, t in rows:
    if t in seen:
        continue
    seen.add(t)
    out.append(f'- {ts[:16]}Z: {t}')
with open(a.out, 'w', encoding='utf-8') as w:
    w.write(f"# The user's own messages since {a.since} (verbatim)\n\n" + '\n'.join(out) + '\n')
print(f'{len(out)} messages -> {a.out}', file=sys.stderr)
