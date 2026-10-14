# Assemble index.html et correcteur/index.html depuis les sources de ce dossier : python3 src/build.py (depuis la racine)
import pathlib, sys
here = pathlib.Path(__file__).parent
racine = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else (here.parent if here.name == 'src' else here / 'dist')
css = (here/'style.css').read_text(encoding='utf-8')
communs = ['01-donnees.js','02-moteur.js','03-schemas.js','04-consignes.js','05-chapitres.js','05b-projets.js','06-dossier.js']
def assembler(shell, fichiers, sortie):
    js = '\n'.join((here/f).read_text(encoding='utf-8') for f in fichiers)
    js = "(function () {\n'use strict';\n" + js + "\n})();"
    assert '</script>' not in js
    html = (here/shell).read_text(encoding='utf-8').replace('/*__CSS__*/', css).replace('/*__JS__*/', js)
    for bad in ['—', '―']:
        assert bad not in html, 'tiret cadratin présent'
    sortie.parent.mkdir(parents=True, exist_ok=True)
    sortie.write_text(html, encoding='utf-8')
    print('écrit', sortie, len(html.encode('utf-8')), 'octets')
    return js
js = assembler('shell.html', communs + ['07-interface.js'], racine / 'index.html')
(here/'bundle.js').write_text(js, encoding='utf-8')
js2 = assembler('shell-correcteur.html', communs + ['08-correcteur.js'], racine / 'correcteur' / 'index.html')
(here/'bundle-correcteur.js').write_text(js2, encoding='utf-8')
