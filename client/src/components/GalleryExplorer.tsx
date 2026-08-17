import { useMemo, useState } from "react";
import { ArrowUpRight, MessageCircle, Send, X } from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type GalleryExplorerProps = { lang: "ru" | "tic" };
type Category = "all" | "mosaic" | "sacred" | "painting" | "study" | "objects" | "context";
type SortMode = "category" | "title";

const labels: Record<Category, { ru: string; tic: string }> = {
  all: { ru: "Все материалы", tic: "Tucc i materiali" },
  mosaic: { ru: "Мозаика и монументальная живопись", tic: "Mosaich e pittura monumentâ" },
  sacred: { ru: "Иконопись и сакральные мотивы", tic: "Icone e motiv sacri" },
  painting: { ru: "Живопись и портрет", tic: "Pittura e ritratt" },
  study: { ru: "Рисунок и учебная мастерская", tic: "Disegn e bottega" },
  objects: { ru: "Предметы и экспозиция", tic: "Oggett e esposizion" },
  context: { ru: "Фрагменты места", tic: "Framment del loegh" },
};

const categories: Category[] = ["all", "mosaic", "sacred", "painting", "study", "objects", "context"];

export default function GalleryExplorer({ lang }: GalleryExplorerProps) {
  const [category, setCategory] = useState<Category>("all");
  const [sortMode, setSortMode] = useState<SortMode>("category");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const galleryQuery = trpc.gallery.list.useQuery();
  const authConfig = trpc.gallery.configStatus.useQuery();
  const selectedInput = useMemo(() => ({ photoId: selectedId ?? 0 }), [selectedId]);
  const commentsQuery = trpc.gallery.comments.useQuery(selectedInput, { enabled: selectedId !== null });
  const addComment = trpc.gallery.addComment.useMutation({
    onSuccess: async () => {
      setCommentText("");
      await utils.gallery.comments.invalidate(selectedInput);
    },
  });

  const photos = useMemo(() => {
    const source = (galleryQuery.data ?? []).filter((photo) => category === "all" || photo.category === category);
    return [...source].sort((a, b) => sortMode === "title" ? (a.title ?? "").localeCompare(b.title ?? "", "ru") : a.category.localeCompare(b.category));
  }, [galleryQuery.data, category, sortMode]);
  const selectedPhoto = galleryQuery.data?.find((photo) => photo.id === selectedId) ?? null;

  const submitComment = () => {
    if (!selectedId || !commentText.trim()) return;
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    addComment.mutate({ photoId: selectedId, content: commentText.trim() });
  };

  return (
    <section className="gallery-explorer" id="gallery">
      <div className="gallery-explorer-head">
        <div>
          <div className="eyebrow">ФОНД / 2026 / {galleryQuery.data?.length ?? "—"} ФОТОГРАФИЙ</div>
          <h2>{lang === "ru" ? <>Смысловые<br /><em>папки.</em></> : <>Cartell<br /><em>de memoria.</em></>}</h2>
        </div>
        <p>{lang === "ru" ? "Загруженные материалы разложены по визуальному смыслу. Неизвестные авторы, даты и места не выдумываются: атрибуцию можно уточнить в комментариях." : "I material caricad hin ordinad per sens visual. Autor, data e loegh sconossud restan neutri: la comunità la podarà completar nei comment."}</p>
      </div>

      <div className="gallery-toolbar">
        <div className="gallery-filters" role="tablist" aria-label="Категории галереи">
          {categories.map((item) => (
            <button key={item} className={category === item ? "gallery-filter active" : "gallery-filter"} onClick={() => setCategory(item)}>
              {labels[item][lang]}
            </button>
          ))}
        </div>
        <label className="gallery-sort">{lang === "ru" ? "Порядок" : "Ordine"}
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
            <option value="category">{lang === "ru" ? "По папке" : "Per cartell"}</option>
            <option value="title">{lang === "ru" ? "По названию" : "Per titol"}</option>
          </select>
        </label>
      </div>

      {galleryQuery.isLoading ? <div className="gallery-empty">Загружаем фонд…</div> : (
        <div className="gallery-explorer-layout">
          <div className="gallery-catalog">
            {photos.map((photo) => (
              <button className={selectedId === photo.id ? "catalog-card selected" : "catalog-card"} key={photo.id} onClick={() => setSelectedId(photo.id)}>
                <span className="catalog-image"><img src={photo.url} alt={photo.title ?? "Фотография из фонда"} loading="lazy" /></span>
                <span className="catalog-meta"><small>{labels[photo.category as Category]?.[lang] ?? photo.category} / {String(photo.id).padStart(3, "0")}</small><strong>{photo.title ?? "Без атрибуции"}</strong><span className="catalog-source">ПОЛЬЗОВАТЕЛЬСКИЙ ФОНД / ФОТОФИКСАЦИЯ / 2026</span><span>Открыть дело <ArrowUpRight size={13} /></span></span>
              </button>
            ))}
          </div>

          <aside className={selectedPhoto ? "gallery-detail is-open" : "gallery-detail"} aria-live="polite">
            {selectedPhoto ? <>
              <button className="detail-close" onClick={() => setSelectedId(null)} aria-label="Закрыть"><X size={18} /></button>
              <img className="detail-image" src={selectedPhoto.url} alt={selectedPhoto.title ?? "Фотография из фонда"} />
              <div className="detail-kicker">ДЕЛО / {String(selectedPhoto.id).padStart(3, "0")} / {labels[selectedPhoto.category as Category]?.[lang]}</div>
              <h3>{selectedPhoto.title ?? "Без атрибуции"}</h3>
              <p className="detail-note">{lang === "ru" ? "Визуальное свидетельство из пользовательского фонда. Дополнительные сведения можно уточнить в комментариях." : "Testimoni visual del fond de l'utent. I detaj podon vegnì precisad nei comment."}</p>
              <div className="comments-block">
                <div className="comments-heading"><span><MessageCircle size={15} /> {lang === "ru" ? "Комментарии" : "Comment"}</span><small>{commentsQuery.data?.length ?? 0}</small></div>
                <div className="comments-list">
                  {(commentsQuery.data ?? []).map((comment) => <article className="comment-item" key={comment.id}><strong>{comment.userName || "Участник фонда"}</strong><time>{new Date(comment.createdAt).toLocaleDateString("ru-RU")}</time><p>{comment.content}</p></article>)}
                  {!commentsQuery.isLoading && commentsQuery.data?.length === 0 && <p className="comments-empty">Пока нет комментариев. Добавьте уточнение к делу.</p>}
                </div>
                <div className="comment-form">
                  <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder={isAuthenticated ? "Ваше уточнение или воспоминание…" : "Войдите, чтобы оставить комментарий"} maxLength={2000} />
                  <button onClick={submitComment} disabled={addComment.isPending || !commentText.trim()}><Send size={15} /> {isAuthenticated ? "Отправить" : "Войти и написать"}</button>
                  {authConfig.data?.authRequired && !isAuthenticated && <small>Публикация комментариев доступна после входа через Manus OAuth.</small>}
                </div>
              </div>
            </> : <div className="detail-placeholder"><span>01</span><p>Выберите фотографию, чтобы открыть дело и увидеть комментарии.</p></div>}
          </aside>
        </div>
      )}
    </section>
  );
}
