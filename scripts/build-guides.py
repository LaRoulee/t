#!/usr/bin/env python3
"""Builds the SEO guide pages (guide-*.html) from the content below.

Every figure comes from JOBS_AUSTRALIE_PVT.xlsx (Contacts and Calendrier tabs).
Run from the repo root:  python3 scripts/build-guides.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://aussieway.fr/'
UPDATED = '2026-09-26'
UPDATED_FR = '26 septembre 2026'
BRAND_SVG = ('<svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true"><g fill="currentColor">'
             '<path d="M16 3.2l1.05 2.3 2.5.3-1.85 1.7.5 2.5L16 8.75 13.8 10l.5-2.5-1.85-1.7 2.5-.3z"/>'
             '<path d="M8 13.2l.9 1.95 2.15.25-1.6 1.45.45 2.1L8 17.9l-1.9 1.05.45-2.1-1.6-1.45 2.15-.25z"/>'
             '<path d="M24.4 11.6l.9 1.95 2.15.25-1.6 1.45.45 2.1-1.9-1.05-1.9 1.05.45-2.1-1.6-1.45 2.15-.25z"/>'
             '<path d="M16 23.2l1.05 2.3 2.5.3-1.85 1.7.5 2.5L16 28.75 13.8 30l.5-2.5-1.85-1.7 2.5-.3z"/>'
             '<circle cx="19.6" cy="18.6" r="1"/></g></svg>')

MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
CAL = {
    'QLD': [39, 38, 64, 77, 95, 98, 95, 80, 78, 91, 62, 38], 'NSW': [9, 17, 30, 25, 49, 78, 71, 71, 56, 48, 53, 35],
    'VIC': [39, 66, 57, 47, 37, 40, 29, 28, 19, 17, 13, 32], 'SA': [30, 41, 43, 40, 5, 5, 5, 6, 5, 4, 13, 12],
    'WA': [19, 23, 24, 23, 36, 23, 28, 33, 35, 31, 18, 21], 'TAS': [49, 69, 71, 35, 11, 9, 8, 8, 8, 9, 50, 48],
    'NT': [2, 1, 1, 3, 2, 2, 2, 2, 2, 2, 3, 2],
}
VINE = [10, 52, 59, 52, 18, 2, 3, 6, 5, 5, 5, 9]
STATE_NAMES = {'QLD': 'Queensland', 'NSW': 'Nouvelle-Galles du Sud', 'VIC': 'Victoria', 'SA': 'Australie-Méridionale',
               'WA': 'Australie-Occidentale', 'TAS': 'Tasmanie', 'NT': 'Territoire du Nord'}


def img(name, alt, w=1792):
    return (f'<img src="assets/img/{name}-1600.webp" srcset="assets/img/{name}-800.webp 800w, assets/img/{name}-1600.webp 1600w, '
            f'assets/img/{name}-{w}.webp {w}w" sizes="(min-width: 900px) 860px, 100vw" alt="{alt}" width="1600" height="900" '
            f'fetchpriority="high">')


def heat_table(rows, caption):
    mx = max(max(v) for v in rows.values())
    head = ''.join(f'<th scope="col">{m}</th>' for m in MONTHS)
    body = ''
    for label, vals in rows.items():
        cells = ''.join(f'<td style="--a:{0.06 + 0.94 * v / mx:.2f}">{v}</td>' for v in vals)
        body += f'<tr><th scope="row">{label}</th>{cells}</tr>'
    return (f'<div class="gtable" role="region" aria-label="{caption}" tabindex="0"><table><caption>{caption}</caption>'
            f'<thead><tr><th scope="col">État</th>{head}</tr></thead><tbody>{body}</tbody></table></div>')


CTA = ('<aside class="gcta" aria-label="Le Guide Opérationnel">'
       '<p class="gcta__kicker">Le Guide Opérationnel</p>'
       '<p class="gcta__title">2&nbsp;303 employeurs et agences qui embauchent des backpackers, dans un seul guide.</p>'
       '<p>{line}</p>'
       '<a class="btn" href="./#acheter" data-goatcounter-click="guide-{slug}-cta">Voir le guide · 27&nbsp;€</a>'
       '</aside>')

GUIDES = [
    {
        'slug': '88-jours-pvt-australie',
        'title': 'Les 88 jours en PVT Australie : le guide pour obtenir votre 2e visa',
        'h1': 'Les 88 jours en PVT Australie',
        'desc': "Tout comprendre aux 88 jours de « specified work » : quels jobs comptent, où les faire, quels papiers garder et comment trouver un employeur.",
        'photo': ('job-cueillette-fraises', 'Backpackers en train de cueillir des fraises dans une ferme australienne', 1792),
        'cta': "Filtrez par État et par mois, et appelez directement les fermes qui recrutent pour vos 88 jours.",
        'body': f'''
<section><h2>C'est quoi, les 88 jours&nbsp;?</h2>
<p>Pour obtenir un <strong>2e visa Working Holiday</strong>, vous devez avoir fait 3 mois (88 jours) de «&nbsp;specified work&nbsp;» en zone régionale pendant votre 1er visa. Pour un <strong>3e visa</strong>, il faut 6 mois pendant le 2e.</p>
<p>Les jours se comptent en jours travaillés selon les règles du gouvernement australien&nbsp;: renseignez-vous sur la façon dont le temps partiel et les semaines incomplètes sont comptés avant de vous engager.</p></section>
<section><h2>Quels jobs comptent&nbsp;?</h2>
<ul>
<li><strong>Agriculture et élevage</strong>&nbsp;: cueillette, emballage à la ferme, travail en station d'élevage.</li>
<li><strong>Pêche et perliculture.</strong></li>
<li><strong>Arboriculture et foresterie.</strong></li>
<li><strong>Mines et construction.</strong></li>
<li><strong>Hôtellerie et tourisme</strong>&nbsp;: seulement dans les zones «&nbsp;remote / very remote&nbsp;» et en Australie du Nord.</li>
</ul>
<p>Avant d'accepter un job, vérifiez que le <strong>code postal est éligible</strong> sur le site officiel <a href="https://immi.homeaffairs.gov.au/" rel="noopener">immi.homeaffairs.gov.au</a> (rubrique Working Holiday Maker, specified work). Les règles évoluent&nbsp;: c'est la seule source qui fait foi.</p></section>
{{CTA}}
<section><h2>Les papiers à garder</h2>
<ul>
<li>Toutes vos <strong>fiches de paie</strong> (payslips).</li>
<li>Le <strong>formulaire 1263</strong> (Employment verification), que beaucoup de backpackers font remplir par l'employeur.</li>
<li>Évitez le travail non déclaré («&nbsp;cash in hand&nbsp;»)&nbsp;: aucune preuve pour vos 88 jours, et aucune protection.</li>
</ul></section>
<section><h2>Où et quand faire vos 88 jours</h2>
<p>La cueillette et le maraîchage sont les voies les plus courantes. Le bon endroit dépend du mois où vous êtes disponible&nbsp;: le Queensland recrute le plus de mai à octobre, la Tasmanie et le Victoria de novembre à mars. Voir le <a href="guide-travail-ferme-australie-calendrier.html">calendrier des embauches par État</a>.</p>
<p>Astuce&nbsp;: arrivez dans une région <strong>2 à 3 semaines avant le pic de récolte</strong>. C'est là que les fermes cherchent encore du monde.</p></section>
''',
    },
    {
        'slug': 'travail-ferme-australie-calendrier',
        'title': 'Travail en ferme en Australie : quel État recrute selon le mois',
        'h1': 'Travail en ferme en Australie&nbsp;: le calendrier des embauches',
        'desc': "Quel État australien recrute des backpackers chaque mois ? Le calendrier des embauches en ferme, État par État, établi à partir de 2 303 contacts.",
        'photo': ('hero-champ-queensland', 'Champ agricole du Queensland au coucher du soleil', 2400),
        'cta': "Dans le guide AUSSIEWAY, filtrez la colonne du mois où vous êtes disponible et obtenez la liste des employeurs qui recrutent, avec leur numéro.",
        'body': f'''
<section><h2>Le calendrier, État par État</h2>
<p>Ce tableau compte les <strong>employeurs directs qui recrutent chaque mois</strong> (hors postes «&nbsp;toute l'année&nbsp;»), d'après le guide AUSSIEWAY. Plus la case est foncée, plus il y a d'opportunités.</p>
{heat_table(CAL, "Employeurs qui recrutent, par État et par mois")}</section>
<section><h2>Ce qu'il faut retenir</h2>
<ul>
<li><strong>Queensland</strong>&nbsp;: le plus gros recruteur, de mars à novembre, avec un pic en juin (98 employeurs).</li>
<li><strong>Nouvelle-Galles du Sud</strong>&nbsp;: de juin à août, plus de 70 employeurs par mois.</li>
<li><strong>Tasmanie</strong>&nbsp;: de novembre à mars, entre 48 et 71 employeurs par mois, presque rien en hiver.</li>
<li><strong>Victoria</strong>&nbsp;: de janvier à avril, avec un pic en février (66).</li>
<li><strong>Australie-Méridionale</strong>&nbsp;: de janvier à avril (vendanges), très calme ensuite.</li>
<li><strong>Australie-Occidentale</strong>&nbsp;: régulière toute l'année, entre 18 et 36 employeurs par mois.</li>
</ul></section>
{{CTA}}
<section><h2>Arriver au bon moment</h2>
<p>Arrivez dans une région <strong>2 à 3 semaines avant le pic</strong>&nbsp;: au pic, les équipes sont déjà formées. Appelez les fermes tôt le matin, avant 9&nbsp;h, c'est là que les responsables décrochent.</p>
<p>Pour les vendanges, voir le <a href="guide-vendanges-australie-pvt.html">guide des vendanges</a>. Pour l'été austral, voir <a href="guide-travailler-tasmanie-pvt.html">travailler en Tasmanie</a>.</p></section>
''',
    },
    {
        'slug': 'vendanges-australie-pvt',
        'title': 'Vendanges en Australie en PVT : quand, où et comment postuler',
        'h1': 'Les vendanges en Australie en PVT',
        'desc': "Les vendanges australiennes ont lieu de février à avril. Régions, paie au rendement et contacts de vignobles qui embauchent des backpackers.",
        'photo': ('hero-vignoble-barossa', 'Vignoble de la Barossa Valley au lever du soleil', 2400),
        'cta': "72 vignobles et employeurs du vin sont dans le guide AUSSIEWAY, avec leur ville, leur saison et leur type de paie.",
        'body': f'''
<section><h2>Quand ont lieu les vendanges&nbsp;?</h2>
<p>En Australie, les saisons sont inversées&nbsp;: les vendanges ont lieu à la fin de l'été austral. D'après le guide AUSSIEWAY, les employeurs du vin recrutent surtout <strong>de février à avril</strong>, entre 52 et 59 par mois, contre moins de 10 le reste de l'année.</p>
{heat_table({'Vignes & vin': VINE}, "Employeurs du vin qui recrutent, par mois")}</section>
<section><h2>Où faire les vendanges</h2>
<ul>
<li><strong>Tasmanie</strong>&nbsp;: la région la mieux représentée dans le guide AUSSIEWAY (23 employeurs), autour de Pipers Brook ou Granton.</li>
<li><strong>Nouvelle-Galles du Sud</strong>&nbsp;: la Hunter Valley (Pokolbin).</li>
<li><strong>Australie-Occidentale</strong>&nbsp;: Margaret River, Albany.</li>
<li><strong>Victoria</strong>&nbsp;: Robinvale, Mildura.</li>
<li><strong>Australie-Méridionale</strong>&nbsp;: McLaren Vale, Barossa.</li>
</ul></section>
{{CTA}}
<section><h2>Comment on est payé</h2>
<p>La grande majorité des postes du vin sont payés <strong>au rendement</strong> (61 sur 72 d'après le guide AUSSIEWAY), c'est-à-dire à la quantité récoltée. Depuis avril 2022, les travailleurs agricoles payés au rendement ont un <strong>minimum horaire garanti</strong>. Vérifiez vos droits sur <a href="https://www.fairwork.gov.au/" rel="noopener">fairwork.gov.au</a> (Pay Calculator).</p>
<p>Les vendanges en zone régionale peuvent compter pour vos <a href="guide-88-jours-pvt-australie.html">88 jours</a>&nbsp;: vérifiez le code postal avant d'accepter.</p></section>
''',
    },
    {
        'slug': 'travailler-tasmanie-pvt',
        'title': 'Travailler en Tasmanie en PVT : saisons, jobs et employeurs',
        'h1': 'Travailler en Tasmanie en PVT',
        'desc': "La Tasmanie recrute des backpackers de novembre à mars : cerises, petits fruits, vignes, hôtellerie. Saisons et nombre d'employeurs par mois.",
        'photo': ('portrait-verger-manguiers', 'Travailleuse saisonnière dans un verger australien', 1792),
        'cta': "152 contacts en Tasmanie dans le guide AUSSIEWAY, à filtrer par mois et par secteur.",
        'body': f'''
<section><h2>La meilleure période</h2>
<p>La Tasmanie est le bon plan de l'été austral. D'après le guide AUSSIEWAY, <strong>entre 48 et 71 employeurs par mois</strong> y recrutent de novembre à mars, contre moins de 12 de mai à octobre.</p>
{heat_table({'TAS': CAL['TAS']}, "Employeurs qui recrutent en Tasmanie, par mois")}</section>
<section><h2>Quels jobs&nbsp;?</h2>
<ul>
<li><strong>Fruits et cueillette</strong>&nbsp;: 59 contacts, surtout les cerises (20) et les petits fruits (15), aussi des pommes.</li>
<li><strong>Hôtellerie et restauration</strong>&nbsp;: 48 contacts, dont beaucoup de postes de bar.</li>
<li><strong>Vignes et vin</strong>&nbsp;: 23 contacts.</li>
</ul>
<p>Les contacts se concentrent autour de Hobart, Launceston et Devonport. Une voiture est un vrai plus&nbsp;: beaucoup de fermes sont isolées.</p></section>
{{CTA}}
<section><h2>Préparer son arrivée</h2>
<p>Visez une arrivée <strong>début novembre</strong>, avant le pic. Préparez votre TFN, un compte bancaire et un numéro australiens, et votre CV d'une page. Les conseils pour postuler sont dans le guide <a href="guide-trouver-job-pvt-australie.html">trouver un job en PVT</a>.</p></section>
''',
    },
    {
        'slug': 'trouver-job-pvt-australie',
        'title': 'Trouver un job en PVT Australie : papiers, e-mail, appel et CV',
        'h1': 'Trouver un job en PVT Australie',
        'desc': "Les papiers à préparer, le modèle d'e-mail en anglais, la phrase à dire au téléphone, le CV australien et les arnaques à éviter.",
        'photo': ('arrivee-aeroport-sydney', "Backpackeuse qui téléphone à l'aéroport de Sydney", 1792),
        'cta': "2 078 numéros de téléphone et 1 540 e-mails d'employeurs, pour appeler dès votre arrivée.",
        'body': f'''
<section><h2>Les papiers à préparer</h2>
<ul>
<li><strong>TFN</strong> (Tax File Number)&nbsp;: numéro fiscal, gratuit, à demander en ligne sur le site de l'ATO dès l'arrivée.</li>
<li><strong>Compte bancaire</strong> et <strong>numéro de téléphone</strong> australiens.</li>
<li><strong>ABN</strong>&nbsp;: parfois demandé par des sous-traitants.</li>
<li><strong>RSA</strong>&nbsp;: obligatoire pour servir de l'alcool.</li>
<li><strong>White Card</strong>&nbsp;: obligatoire sur les chantiers.</li>
<li><strong>Permis cariste</strong>&nbsp;: un vrai plus en usine et en entrepôt.</li>
<li><strong>Une voiture</strong>&nbsp;: souvent ce qui fait la différence.</li>
</ul></section>
<section><h2>L'e-mail de candidature en anglais</h2>
<pre class="gmail">Subject: Backpacker available for farm work – from [date]

Hi [name],

My name is [first name], I'm a French backpacker on a Working Holiday visa (417).
I'm currently in [town] and available from [date] for picking or packing work, for at least [X weeks].

I'm hard-working, reliable and used to physical work. I have [a car / my own accommodation].

Could you let me know if you need any workers this season?

Kind regards,
[First name Last name]
[Australian phone number]</pre></section>
<section><h2>Au téléphone, souvent plus efficace</h2>
<p>Appelez <strong>avant 9&nbsp;h</strong>&nbsp;: c'est là que les responsables de ferme décrochent.</p>
<pre class="gmail">"Hi, my name is [first name], I'm a backpacker looking for farm work. Do you need any pickers or packers at the moment? I'm available from [date] and I have my own car."</pre></section>
{{CTA}}
<section><h2>Le CV «&nbsp;à l'australienne&nbsp;»</h2>
<ul>
<li>1 page, 2 au maximum, pas de photo en général.</li>
<li>En haut&nbsp;: numéro australien, e-mail, type de visa, dates de disponibilité, ville actuelle.</li>
<li>Mettez en avant l'expérience physique ou manuelle, le permis, les certificats.</li>
<li>Ajoutez 1 ou 2 «&nbsp;referees&nbsp;», d'anciens employeurs joignables.</li>
</ul></section>
<section><h2>Les arnaques à éviter</h2>
<ul>
<li>Ne payez <strong>jamais</strong> pour obtenir un emploi.</li>
<li>Méfiez-vous des «&nbsp;working hostels&nbsp;» qui exigent plusieurs semaines de loyer d'avance sans garantie de travail.</li>
<li>Refusez le «&nbsp;cash in hand&nbsp;»&nbsp;: pas de preuve pour vos 88 jours, aucune protection.</li>
<li>Vous avez droit au salaire minimum et à des fiches de paie&nbsp;: <a href="https://www.fairwork.gov.au/" rel="noopener">fairwork.gov.au</a>.</li>
</ul></section>
''',
    },
]


def related(slug):
    items = ''.join(f'<li><a href="guide-{g["slug"]}.html">{g["h1"]}</a></li>' for g in GUIDES if g['slug'] != slug)
    return f'<nav class="grelated" aria-label="Autres guides"><h2>Autres guides</h2><ul>{items}</ul></nav>'


def page(g):
    url = f'{SITE}guide-{g["slug"]}.html'
    name, alt, w = g['photo']
    ld = [
        {'@context': 'https://schema.org', '@type': 'Article', 'headline': g['title'], 'description': g['desc'],
         'image': f'{SITE}assets/img/{name}-1600.webp', 'datePublished': UPDATED, 'dateModified': UPDATED,
         'inLanguage': 'fr', 'author': {'@type': 'Organization', 'name': 'AUSSIEWAY', 'url': SITE},
         'publisher': {'@type': 'Organization', 'name': 'AUSSIEWAY', 'url': SITE}, 'mainEntityOfPage': url},
        {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': SITE},
            {'@type': 'ListItem', 'position': 2, 'name': 'Guides PVT', 'item': f'{SITE}guides.html'},
            {'@type': 'ListItem', 'position': 3, 'name': g['h1'].replace('&nbsp;', ' '), 'item': url}]},
    ]
    body = g['body'].replace('{CTA}', CTA.format(line=g['cta'], slug=g['slug']))
    return shell(g['title'], g['desc'], url, f'''
  <main class="legal__main guide">
    <p class="guide__crumbs"><a href="./">Accueil</a> / <a href="guides.html">Guides PVT</a></p>
    <h1 class="legal__title">{g["h1"]}</h1>
    <p class="legal__updated">Mis à jour le {UPDATED_FR} · chiffres tirés du guide AUSSIEWAY (2&nbsp;303 contacts)</p>
    <figure class="guide__photo">{img(name, alt, w)}<figcaption>Photographie générée par IA, à titre d'illustration.</figcaption></figure>
    {body}
    {related(g["slug"])}
  </main>''', ld, og_image=f'{SITE}assets/img/{name}-1600.webp')


def shell(title, desc, url, main, ld, og_image=f'{SITE}assets/img/hero-champ-queensland-og.jpg'):
    return f'''<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} · AUSSIEWAY</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="AUSSIEWAY">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{og_image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#2a2b29">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
  <link rel="preload" as="font" type="font/woff2" href="assets/fonts/archivo-latin-wdth-normal.woff2" crossorigin>
  <link rel="stylesheet" href="css/style.css">
  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body class="legal">
  <header class="legal__bar">
    <a class="brand" href="./" aria-label="AUSSIEWAY, retour à l'accueil">
      {BRAND_SVG}
      <span>AUSSIEWAY</span>
    </a>
    <a class="link" href="./#acheter">Le guide · 27&nbsp;€</a>
  </header>{main}
  <footer class="footer footer--guide">
    <nav class="footer__legal" aria-label="Informations légales">
      <a href="guides.html">Guides PVT</a>
      <a href="mentions-legales.html">Mentions légales</a>
      <a href="cgv.html">CGV</a>
      <a href="cgu.html">CGU</a>
      <a href="confidentialite.html">Confidentialité et cookies</a>
    </nav>
    <div class="footer__socials"><a class="footer__social" href="https://www.instagram.com/aussieway1" target="_blank" rel="noopener me">Instagram @aussieway1</a> <a class="footer__social" href="https://www.tiktok.com/@aussieway6" target="_blank" rel="noopener me">TikTok @aussieway6</a></div>
    <p class="footer__note">© 2026 AUSSIEWAY.</p>
  </footer>
  <script data-goatcounter="https://aussieway.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</body>
</html>
'''


def hub():
    cards = ''.join(f'''
      <li class="ghub__item"><a href="guide-{g["slug"]}.html">
        <img src="assets/img/{g["photo"][0]}-800.webp" alt="" width="800" height="450" loading="lazy">
        <span class="ghub__title">{g["h1"]}</span>
        <span class="ghub__desc">{g["desc"]}</span></a></li>''' for g in GUIDES)
    ld = [{'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': 'Guides PVT Australie', 'url': f'{SITE}guides.html',
           'hasPart': [{'@type': 'Article', 'headline': g['title'], 'url': f'{SITE}guide-{g["slug"]}.html'} for g in GUIDES]}]
    return shell('Guides PVT Australie : jobs, 88 jours, saisons', "Guides gratuits pour trouver un job en PVT Australie : 88 jours, calendrier des embauches, vendanges, Tasmanie, candidature.",
                 f'{SITE}guides.html', f'''
  <main class="legal__main guide">
    <h1 class="legal__title">Guides PVT Australie</h1>
    <p class="legal__updated">Mis à jour le {UPDATED_FR} · chiffres tirés du guide AUSSIEWAY (2&nbsp;303 contacts)</p>
    <ul class="ghub">{cards}
    </ul>
  </main>''', ld)


for g in GUIDES:
    (ROOT / f'guide-{g["slug"]}.html').write_text(page(g), encoding='utf-8')
(ROOT / 'guides.html').write_text(hub(), encoding='utf-8')

# sitemap
urls = [('', '1.0'), ('guides.html', '0.8')] + [(f'guide-{g["slug"]}.html', '0.7') for g in GUIDES] + \
       [('cgv.html', '0.3'), ('mentions-legales.html', '0.2'), ('cgu.html', '0.2'), ('confidentialite.html', '0.2')]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sm += ''.join(f'  <url><loc>{SITE}{u}</loc><lastmod>{UPDATED}</lastmod><priority>{p}</priority></url>\n' for u, p in urls)
(ROOT / 'sitemap.xml').write_text(sm + '</urlset>\n', encoding='utf-8')
print(f'{len(GUIDES)} guides + guides.html + sitemap.xml written')
