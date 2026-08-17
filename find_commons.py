import requests
for term in ["Kizhi Pogost", "St Basil Cathedral Moscow", "Russian restoration monument"]:
    data = requests.get("https://commons.wikimedia.org/w/api.php", params={"action":"query","generator":"search","gsrsearch":term,"gsrnamespace":6,"gsrlimit":5,"prop":"imageinfo","iiprop":"url","iiurlwidth":1400,"format":"json"}, timeout=20).json()
    print("TERM", term)
    for page in data.get("query", {}).get("pages", {}).values():
        info=page.get("imageinfo", [{}])[0]
        print(page.get("title"), info.get("thumburl") or info.get("url"))
