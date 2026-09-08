import { useState } from "react";
import { Link } from "react-router-dom";

const stages = [
  {
    label: "Print the base",
    image: "7402",
    title: "Structure starts inside.",
    alt: "Print head laying black grid infill inside an octagonal display base on a Creality build plate",
    description: "The base takes shape on the printer. The open grid is the internal infill, visible before the top surface covers it.",
    details: [
      ["Grid infill", "The internal structure of the base."],
      ["Outer perimeter", "The solid edge defining the octagonal shape."],
    ],
  },
  {
    label: "Assemble",
    image: "7430",
    title: "Separate parts. One display.",
    alt: "Assembled green lattice walls and lettering fitted to a black octagonal printed display base",
    description: "The completed base is paired with green lattice wall sections and lettering to create the display enclosure.",
    details: [
      ["Wall sections", "Open lattice panels around the perimeter."],
      ["Surface detail", "Contrasting lettering on the black base."],
    ],
  },
  {
    label: "Put it to use",
    image: "7428",
    title: "Made for the collection.",
    alt: "Four collectible fighter figures arranged inside the completed green and black printed octagonal display",
    description: "The finished printed enclosure brings the collectible figures together in a single display.",
    details: [
      ["The printed piece", "The octagonal base and display enclosure."],
      ["The finished setup", "Collectible figures arranged inside it."],
    ],
  },
];

export default function TechVisual() {
  const [selected, setSelected] = useState(0);
  const stage = stages[selected];

  return (
    <section className="tech-visual workshop-feature" aria-labelledby="workshop-feature-title">
      <div className="tech-visual-heading">
        <span>IRONROOT / FROM THE WORKBENCH</span>
        <span className="visual-cross" aria-hidden="true">+</span>
      </div>
      <div className="workshop-feature-intro">
        <span className="eyebrow">PROJECT / OCTAGONAL COLLECTOR DISPLAY</span>
        <h2 id="workshop-feature-title">One build. Three real stages.</h2>
      </div>
      <div className="workshop-stage-picker" role="group" aria-label="Explore the display build">
        {stages.map((item, index) => (
          <button type="button" key={item.image} aria-pressed={selected === index}
            aria-controls="workshop-stage" onClick={() => setSelected(index)}>
            <span>0{index + 1}</span>{item.label}
          </button>
        ))}
      </div>
      <div id="workshop-stage" className="workshop-stage" aria-live="polite" aria-atomic="true">
        <figure className="workshop-stage-photo">
          <img key={stage.image} src={`/printing/IMG_${stage.image}.jpg`}
            srcSet={`/printing/IMG_${stage.image}-small.jpg 480w, /printing/IMG_${stage.image}.jpg 1080w`}
            sizes="(max-width: 520px) 90vw, (max-width: 800px) 350px, 30vw"
            width="1080" height="1440" alt={stage.alt} fetchPriority={selected === 0 ? "high" : "auto"} />
          <figcaption>WORKSHOP PHOTO / 0{selected + 1}</figcaption>
        </figure>
        <div className="workshop-stage-notes">
          <h3>{stage.title}</h3>
          <p>{stage.description}</p>
          <dl>{stage.details.map(([title, detail]) => (
            <div key={title}><dt>{title}</dt><dd>{detail}</dd></div>
          ))}</dl>
        </div>
      </div>
      <div className="tech-visual-footer workshop-feature-footer">
        <span>ACTUAL PROJECT PHOTOS</span>
        <Link to="/work/custom-prints">Explore the print gallery ↗</Link>
      </div>
    </section>
  );
}
