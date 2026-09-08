import { useEffect, useRef, useState } from "react";
import { printingPhotos } from "../data/printingGallery";

const filters = ["All photos", "Finished pieces", "In progress", "Workshop"];

export default function PrintingGallery() {
  const [filter, setFilter] = useState("All photos");
  const [limit, setLimit] = useState(9);
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const photos = filter === "All photos"
    ? printingPhotos
    : printingPhotos.filter(photo => photo.category === filter);

  const isOpen = selected !== null;
  useEffect(() => {
    if (!isOpen) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]); // Keep the dialog open while moving between photos.

  function move(direction) {
    setSelected(current => (current + direction + photos.length) % photos.length);
  }

  const current = selected === null ? null : photos[selected];

  return (
    <section className="printing-gallery" id="print-gallery" aria-labelledby="printing-gallery-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">FROM THE WORKBENCH</p>
          <h2 id="printing-gallery-title">Layer by layer.<br />Idea by idea.</h2>
        </div>
        <p>Finished pieces, small details, and the steps in between. A closer look at what we’ve been printing.</p>
      </div>
      <div className="gallery-toolbar">
        <div className="gallery-filters" role="group" aria-label="Filter printing photos">
          {filters.map(label => (
            <button key={label} type="button" aria-pressed={filter === label}
              onClick={() => { setFilter(label); setLimit(9); }}>
              {label}
            </button>
          ))}
        </div>
        <p className="gallery-count" role="status">{photos.length} photos</p>
      </div>
      <div className="printing-gallery-grid">
        {photos.slice(0, limit).map((photo, index) => (
          <figure className="printing-gallery-card" key={photo.id}>
            <button className="gallery-photo-button" type="button"
              aria-label={`Enlarge photo: ${photo.title}`} onClick={() => setSelected(index)}>
              <img src={photo.thumbnail} srcSet={`${photo.thumbnail} 480w, ${photo.src} 1080w`}
                sizes="(max-width: 600px) 90vw, (max-width: 1000px) 44vw, 28vw"
                alt={photo.alt} width="1080" height="1440" loading="lazy" decoding="async" />
              <span className="gallery-enlarge" aria-hidden="true">↗</span>
            </button>
            <figcaption><span className="eyebrow">{photo.category}</span><h3>{photo.title}</h3></figcaption>
          </figure>
        ))}
      </div>
      {limit < photos.length && <div className="gallery-more"><button className="button secondary"
        onClick={() => setLimit(value => value + 9)}>Show more photos ({photos.length - limit} remaining) ↓</button></div>}
      <dialog ref={dialog} className="gallery-dialog" aria-labelledby="gallery-photo-title"
        onCancel={() => setSelected(null)} onClose={() => setSelected(null)}
        onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}
        onKeyDown={event => {
          if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        }}>
        {current && <div className="gallery-dialog-content">
          <div className="gallery-dialog-top"><span>{selected + 1} / {photos.length}</span>
            <button type="button" className="gallery-close" onClick={() => setSelected(null)} autoFocus>Close ×</button></div>
          <img className="gallery-full-photo" src={current.src} alt={current.alt} />
          <div className="gallery-dialog-caption"><p className="eyebrow">{current.category}</p><h3 id="gallery-photo-title">{current.title}</h3></div>
          <div className="gallery-dialog-nav"><button type="button" onClick={() => move(-1)}>← Previous</button>
            <button type="button" onClick={() => move(1)}>Next →</button></div>
        </div>}
      </dialog>
    </section>
  );
}
