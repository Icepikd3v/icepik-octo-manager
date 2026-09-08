export const COMPANY_EMAIL = "ironrootsolutions@gmail.com";
export const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61579584716845";
export const services = [
  {
    id: "printing", number: "01", icon: "◇",
    title: "Custom 3D printing",
    short: "From digital model to physical part.",
    description: "Display pieces, prototypes, and practical parts, made around your project.",
    items: ["Custom FDM printing", "Prototypes, display pieces & replacement parts", "Model, material & print preparation review", "Individual project quotes"],
  },
  {
    id: "web", number: "02", icon: "</>",
    title: "Web & software",
    short: "Software shaped around the way you work.",
    description: "Web applications, software design, and useful tools for your business or next idea.",
    items: ["Website & web application builds", "Software design & development", "Business tools, integrations & automation", "Application maintenance & support"],
  },
  {
    id: "repair", number: "03", icon: "⌁",
    title: "Hardware repair",
    short: "Understand the fault. Find the next step.",
    description: "Hands-on diagnostics and repair for computers, electronics, and the devices you rely on.",
    items: ["Desktop & laptop diagnostics", "Screen & component repair", "Circuit-board repair assessment", "Device upgrades & troubleshooting"],
  },
  {
    id: "security", number: "04", icon: "⌖",
    title: "Security & setup",
    short: "Connect the equipment. Make it usable.",
    description: "Security-camera systems, device installations, and network setup with a practical handover.",
    items: ["Security-camera & video-doorbell setup", "Camera placement & connectivity planning", "Home & small-business network setup", "Device configuration & user walkthroughs"],
  },
];
const shot = (time) => `/Screenshot 2026-09-07 at ${time}\u202fPM.png`;
export const projects = [
  {
    id: "custom-prints",
    category: "3D printing",
    title: "From useful parts to original creations",
    description:
      "Display pieces, character figures, a glowing rocket, and the work in progress behind the finished prints.",
    image: "/printing/IMG_7639.jpg",
    alt: "Two printed helmeted figures in blue and white jackets on the IronRoot workbench",
    date: "August 14, 2025",
    position: "gallery",
    gallery: true,
    archiveImage: shot("7.12.45"),
  },
  {
    id: "board-repair",
    category: "Electronics",
    title: "Getting to the root of a board fault",
    description:
      "A washer control-board repair project, documenting the workbench and pressure-sensor components.",
    image: shot("7.12.27"),
    alt: "IronRoot Facebook post with a washer control board and close-up repair photos",
    date: "August 14, 2025",
    position: "board",
  },
  {
    id: "laptop-repair",
    category: "Electronics",
    title: "A second life for an Acer Nitro 5",
    description:
      "A screen repair project, shown from disassembly through to the laptop powering on again.",
    image: shot("7.12.34"),
    alt: "IronRoot Facebook post showing an Acer laptop disassembled and running after screen repair",
    date: "August 14, 2025",
    position: "laptop",
  },
  {
    id: "dashcam",
    category: "Installations",
    title: "A cleaner dashcam installation",
    description:
      "A Vantrue N4 Pro installation with front, rear, and cabin views and concealed cabling.",
    image: shot("7.12.39"),
    alt: "IronRoot Facebook post documenting a Vantrue N4 Pro dashcam installation",
    date: "August 14, 2025",
    position: "dashcam",
  },
  {
    id: "five-boards",
    category: "Electronics",
    title: "Back on the bench. Back in service.",
    description:
      "A follow-up from the workshop featuring five repaired boards and the hands-on work behind them.",
    image: shot("7.13.09"),
    alt: "IronRoot Facebook workshop update showing repaired control boards",
    date: "August 22, 2025",
    position: "batch",
  },
];
export const webPost = shot("7.13.03");
