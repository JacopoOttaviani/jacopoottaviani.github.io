"""List in-body RomaToday links (2022+) that look like bomb stories and are not fetched yet."""
import json, re, sys
a = json.load(open(sys.argv[1]))
have = {x['url'] for x in a}
kw = re.compile(r'bomb|esplos|ordign|boato|deflagra|attentat|petard|scopp', re.I)
new = set()
for x in a:
    if x['published'][:4] < '2022':
        continue
    for l in x['links']:
        if l not in have and kw.search(l.rsplit('/', 1)[-1]) and ('/cronaca/' in l or '/dossier/' in l):
            new.add(l)
open(sys.argv[2], 'w').write('\n'.join(sorted(new)))
print('new links', len(new))
