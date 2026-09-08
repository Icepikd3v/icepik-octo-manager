export const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61579584716845";
export const services = [
  {
    id: "web",
    number: "01",
    icon: "</>",
    title: "Websites & applications",
    short: "Thoughtful design. Useful software.",
    description:
      "Custom websites and web applications shaped around how your business actually works.",
    items: [
      "Responsive website design",
      "Custom web applications",
      "API and service integrations",
      "Updates, troubleshooting & maintenance",
    ],
  },
  {
    id: "repair",
    number: "02",
    icon: "⌁",
    title: "Technology & repair",
    short: "Find the problem. Restore the possibility.",
    description:
      "Hands-on troubleshooting, electronics repair, and practical help getting your technology working again.",
    items: [
      "Computer and laptop repairs",
      "Electronics diagnostics",
      "Circuit-board repair assessment",
      "Device setup & installation",
    ],
  },
  {
    id: "printing",
    number: "03",
    icon: "◇",
    title: "Custom 3D printing",
    short: "Your idea, made tangible.",
    description:
      "Practical parts, prototypes, and personal creations—without having to own a 3D printer.",
    items: [
      "Custom FDM printing",
      "Replacement parts & prototypes",
      "Project and material review",
      "Per-project quotes",
    ],
  },
];
const shot = (time) => `/Screenshot 2026-09-07 at ${time}\u202fPM.png`;
export const projects = [
  {
    id: "custom-prints",
    category: "3D printing",
    title: "From useful parts to original creations",
    description:
      "Custom FDM work, including a red printed part and a blue octopus model, shared from the IronRoot workshop.",
    image: shot("7.12.45"),
    alt: "IronRoot Facebook post showing a red part on a Creality print bed and a blue octopus model",
    date: "August 14, 2025",
    position: "print",
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
