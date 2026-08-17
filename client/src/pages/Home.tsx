import { useState } from "react";
import { ArrowDown, ArrowUpRight, BookOpen, Camera, ChevronRight, CircleDot, Menu, X } from "lucide-react";

const photos = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/bc/St._Basil%27s_Cathedral%2C_Moscow.jpg",
    title: "Собор Покрова на Рву",
    note: "Москва / объект культурного наследия / современная фиксация",
    source: "Wikimedia Commons / Zeynel Cebeci / CC BY-SA 4.0",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/76/0420Ac._Kizhi_Pogost.jpg",
    title: "Памятник под охраной",
    note: "Карелия / Кижский погост / фиксация 2022",
    source: "Wikimedia Commons / Александровы АГ / CC BY-SA 4.0",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Kizhi_Pogost%2C_1916.jpg",
    title: "До реставрационной системы",
    note: "Карелия / Кижский погост / архивный кадр 1916",
    source: "Wikimedia Commons / Музей-заповедник «Кижи» / 1916",
  },
];

const eras = {
  empire: {
    label: "Российская империя",
    years: "до 1917",
    kicker: "ИСТОКИ",
    title: "Наследие, которое складывалось веками",
    text: "Храмы, усадьбы, монастыри, промыслы и городские ансамбли формировали культурный ландшафт России задолго до появления единой государственной системы охраны.",
    stat: "многообразие регионов",
    image: photos[0].src,
  },
  ussr: {
    label: "Советский Союз",
    years: "1917—1991",
    kicker: "СИСТЕМА ОХРАНЫ",
    title: "Культура не исчезла — ее учились сохранять",
    text: "Советский период принес и утраты, и новый язык ответственности: учет, реставрационные мастерские, научную фиксацию, охранные договоры и просветительскую работу.",
    stat: "30 000+ памятников на учете к 1960 году",
    image: photos[1].src,
  },
};

export default function Home() {
  const [era, setEra] = useState<keyof typeof eras>("empire");
  const [menuOpen, setMenuOpen] = useState(false);
  const current = eras[era];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Наследие России — на главную">
          <img src="/manus-storage/nasledie-mark_baadc2fe.png" alt="" className="brand-mark" />
          <span><b>Наследие</b><small>России</small></span>
        </a>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Открыть меню">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menuOpen ? "nav is-open" : "nav"}>
          <button onClick={() => scrollTo("chronology")}>Хронология</button>
          <button onClick={() => scrollTo("document")}>Документ 1960</button>
          <button onClick={() => scrollTo("gallery")}>Фотогалерея</button>
        </nav>
        <div className="topbar-index">АРХИВ / 01</div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><CircleDot size={12} fill="currentColor" /> ЦИФРОВОЙ АРХИВ КУЛЬТУРЫ</div>
          <h1>Сохранить<br /><em>память</em> места.</h1>
          <p className="hero-lead">История культурного наследия России — от имперских истоков к советской системе охраны, реставрации и ответственности.</p>
          <button className="text-link" onClick={() => scrollTo("chronology")}>Смотреть сквозь время <ArrowDown size={16} /></button>
        </div>
        <div className="hero-visual">
          <div className="hero-photo" style={{ backgroundImage: `url(${current.image})` }} aria-label="Фотография архитектурного наследия" />
          <div className="hero-stamp">ФОНД<br /><strong>РФ</strong><br />1960</div>
          <div className="hero-caption"><span>01 — 02</span><span>{current.label} / {current.years}</span></div>
        </div>
        <div className="hero-note">«Памятники культуры —<br />общая ответственность»</div>
      </section>

      <section className="chronology" id="chronology">
        <div className="section-index"><span>01</span><span className="vertical-label">ХРОНОЛОГИЯ</span></div>
        <div className="chronology-main">
          <div className="section-heading">
            <div><div className="eyebrow">ДВЕ ЭПОХИ / ОДНА ПАМЯТЬ</div><h2>Наследие<br /><em>не прерывается.</em></h2></div>
            <p>Меняются государственные формы, язык и инструменты. Но остается вопрос: кто отвечает за то, что досталось нам?</p>
          </div>
          <div className="timeline-spine" aria-hidden="true"><span>1917</span><i></i><span>1960</span><i></i><span>1991</span></div><div className="era-switcher" role="tablist" aria-label="Выбор исторического периода">
            {(Object.keys(eras) as Array<keyof typeof eras>).map((key) => (
              <button key={key} role="tab" aria-selected={era === key} className={era === key ? "era-tab active" : "era-tab"} onClick={() => setEra(key)}>
                <span className="era-dot" /> <span>{eras[key].label}</span><small>{eras[key].years}</small>
              </button>
            ))}
          </div>
          <article className="era-card">
            <div className="era-card-image" style={{ backgroundImage: `url(${current.image})` }} />
            <div className="era-card-content"><div className="eyebrow">{current.kicker}</div><h3>{current.title}</h3><p>{current.text}</p><div className="stat-line"><span className="stat-number">{era === "ussr" ? "30K+" : "XIX"}</span><span>{current.stat}</span></div></div>
            <div className="era-card-arrow"><ArrowUpRight size={25} /></div>
          </article>
        </div>
      </section>

      <section className="document-section" id="document">
        <div className="document-aside"><div className="document-label">ДОКУМЕНТ</div><div className="document-year">1960</div><div className="document-line" /></div>
        <div className="document-body"><div className="eyebrow">ПОСТАНОВЛЕНИЕ СОВЕТА МИНИСТРОВ РСФСР</div><h2>Охрана — это<br /><em>не только стены.</em></h2><blockquote>«За сохранность всех памятников культуры полную ответственность несут Советы…»</blockquote><div className="document-grid"><div><span className="mono">01 / УЧЕТ</span><p>Выявлять и фиксировать памятники археологии, истории, архитектуры и искусства.</p></div><div><span className="mono">02 / РЕСТАВРАЦИЯ</span><p>Развивать специальные мастерские и вести научно обоснованные работы.</p></div><div><span className="mono">03 / ЛЮДИ</span><p>Вовлекать жителей и молодежь в охрану и популяризацию наследия.</p></div></div><a href="https://docs.cntd.ru/document/9012089" target="_blank" rel="noreferrer" className="source-link">Читать полный текст документа <ArrowUpRight size={15} /></a></div>
      </section>

      <section className="numbers-section">
        <div className="eyebrow">ЧТО УДАЛОСЬ ЗАФИКСИРОВАТЬ</div><div className="big-number">30<span>тыс.</span></div><p>памятников было выявлено и взято на учет к 1960 году.</p><div className="number-foot"><span>Более 2 000</span><span>прошли ремонтно-реставрационные работы</span><span>Около 700</span><span>восстановлены после разрушений войны</span></div>
      </section>

      <section className="gallery-section" id="gallery"><div className="gallery-heading"><div><div className="eyebrow">ФОТОГРАФИЧЕСКАЯ ПАМЯТЬ / ИНВЕНТАРЬ</div><h2>Место говорит<br /><em>дольше слов.</em></h2></div><p>Архив — это не только постановления. Это фактура дерева, камня и света, в которой продолжается история.</p></div><div className="gallery-grid">{photos.map((photo, index) => <figure key={photo.title} className={index === 0 ? "photo-card photo-large" : "photo-card"}><div className="photo-image" style={{ backgroundImage: `url(${photo.src})` }} /><figcaption><span>{photo.note}</span><strong>{photo.title}</strong><small>{photo.source}</small></figcaption></figure>)}</div></section>

      <footer className="footer"><div className="footer-brand"><img src="/manus-storage/nasledie-mark_baadc2fe.png" alt="" className="brand-mark" /><span><b>Наследие</b><small>России</small></span></div><p>Небольшой цифровой архив о преемственности, охране и сохранении культуры.</p><div className="footer-meta"><span>© 2026 / РЕДАКЦИОННЫЙ ПРОЕКТ</span><span>ИСТОЧНИК ТЕКСТА: ЦНТД</span></div></footer>
    </main>
  );
}
