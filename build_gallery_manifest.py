from pathlib import Path
import json
import re

log = Path('/home/ubuntu/nasledie-rossii/gallery-upload-log.txt').read_text()
rows = []
current = None
for line in log.splitlines():
    match = re.search(r'/nasledie-gallery/(.*)$', line)
    if match and 'Uploading file' in line:
        current = re.split(r'\s+\(size', match.group(1), maxsplit=1)[0]
    elif line.startswith('Storage Path:') and current:
        rows.append((current, line.split(': ', 1)[1].strip()))
        current = None

# Categories are based on the contact-sheet review. Unknown metadata stays neutral.
category_members = {
    'mosaic': {'IMG-20221211-WA0000.webp','IMG-20230830-WA0000.webp','IMG-20230831-WA0000.webp','IMG-20230906-WA0000.webp','IMG-20230914-WA0000.webp','IMG-20230914-WA0002.webp','IMG_1217.webp','IMG_1570.webp','IMG_20221109_122622.webp','IMG_3054.webp','IMG_3154.webp','IMG_6648.webp','IMG_6662.webp','IMG_6743.webp','IMG_8457.webp','IMG_9026.webp'},
    'sacred': {'IM114копия.webp','IMG_0302.webp','IMG_1057.webp','IMG_1229.webp','IMG_1678.webp','IMG_3168.webp','IMG_6739.webp','IMG_6743.webp','IMG_7548.PNG','IMG_1217.webp'},
    'painting': {'IMG_0297.webp','IMG_0530.webp','IMG_0673.webp','IMG_0676.webp','IMG_1234.webp','IMG_1506.webp','IMG_1619.webp','IMG_1621.webp','IMG_1623.webp','IMG_2043.webp','IMG_4099.webp','IMG_4274.webp','IMG_4434.webp','IMG_4467.webp','IMG_5605.webp','IMG_5790.webp','IMG_9145.webp','IMG_9215.webp','IMG_9275.webp','IMG_9292.webp','image(64).jpg'},
    'study': {'IMG_2328.webp','IMG_2994.webp','IMG_3581(1).webp','IMG_3582.webp','IMG_3583.webp','IMG_4345.webp','IMG_5118.webp','IMG_5161.webp','IMG_5164.webp','IMG_5167.webp','IMG_5198.webp','IMG_5199.webp','IMG_5206.webp','IMG_7111.webp','IMG_8191.webp','IMG_8646.webp','IMG_8930.webp','IMG_8941.webp','IMG_9032.webp','IMG_9026.webp','IMG_9275.webp'},
    'objects': {'IMG_0301.webp','IMG_0302.webp','IMG_5184.webp','IMG_5185.webp','IMG_5198.webp','IMG_5199.webp','IMG_5206.webp','IMG_6915.webp','IMG_7060.webp','ff037bb301984b59eee677e9b4b1f4bf1a992790.webp'},
}
labels = {
    'mosaic': ('Мозаика и монументальная живопись', 'Фрагменты панно, мозаик и декоративных поверхностей'),
    'sacred': ('Иконопись и сакральные мотивы', 'Образы, иконные створки и храмовая декоративная пластика'),
    'painting': ('Живопись и портрет', 'Фигуративные полотна, портреты и сюжетные композиции'),
    'study': ('Рисунок и учебная мастерская', 'Наброски, академическая фигура и рабочие листы'),
    'objects': ('Предметы и экспозиционные материалы', 'Раскладки, образцы, макеты и музейная подача'),
    'context': ('Фрагменты места и контекст', 'Общий вид, окружение и статус фиксации без дополнительной атрибуции'),
}

def category_for(name):
    # More specific groups win over the broad painting/study defaults.
    for category in ('mosaic','sacred','objects','study','painting'):
        if name in category_members[category]:
            return category
    return 'context'

manifest = []
for name, storage_path in rows:
    category = category_for(name)
    title, note = labels[category]
    manifest.append({
        'filename': name,
        'src': storage_path,
        'category': category,
        'title': title,
        'note': note,
    })
Path('/home/ubuntu/nasledie-rossii/gallery-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
seed_sql = []
for item in manifest:
    def sql(value):
        return "'" + value.replace("'", "''") + "'"
    seed_sql.append(
        "INSERT INTO gallery_photos (url, file_key, category, title) VALUES "
        f"({sql(item['src'])}, {sql(item['src'].removeprefix('/manus-storage/'))}, {sql(item['category'])}, {sql(item['title'])});"
    )
Path('/home/ubuntu/nasledie-rossii/seed-gallery.sql').write_text("\n".join(seed_sql) + "\n")
print(f'manifest: {len(manifest)} images')
for category in labels:
    print(category, sum(item['category'] == category for item in manifest))
