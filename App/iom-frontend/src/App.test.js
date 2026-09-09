import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import api from "./utils/api";
jest.mock("./utils/api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), interceptors: { response: { use: jest.fn(), eject: jest.fn() } } },
  errorMessage: err => err.response?.data?.message || "Service unavailable",
}));
import { FACEBOOK_URL, COMPANY_EMAIL, projects as originalProjects, RESUME_URL } from "./data/company";
let container, root;
beforeEach(() => {
  sessionStorage.clear();
  jest.clearAllMocks();
  api.get.mockImplementation(url => url === "/auth/me" ? Promise.reject({ response: { status: 401 } }) : Promise.resolve({ data: url === "/public/projects" ? { projects: originalProjects } : url === "/printers" ? { printers: [] } : [] }));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});
async function render(path = "/") {
  await act(async () =>
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    ),
  );
}
async function click(text) {
  const el = [...container.querySelectorAll("button,a")].find((el) =>
    el.textContent.includes(text),
  );
  expect(el).toBeDefined();
  await act(async () =>
    el.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    ),
  );
}
async function change(el, value) {
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(el),
    "value",
  ).set;
  await act(async () => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
test("public navigation presents the company and a real contact destination", async () => {
  await render();
  expect(container.querySelector("h1").textContent).toContain("Technology.");
  expect(container.querySelector("main").textContent).not.toContain("Demo");
  await click("Let’s talk");
  expect(container.querySelector("h1").textContent).toContain(
    "What can we help",
  );
  expect(
    container.querySelector('a[href="' + FACEBOOK_URL + '"]'),
  ).not.toBeNull();
  expect(document.title).toContain("Start a Project");
});
test("work filters lead to the matching project and original screenshot", async () => {
  await render("/work");
  await click("Electronics");
  expect(container.querySelectorAll(".project-card").length).toBe(3);
  expect(container.querySelector('[aria-pressed="true"]').textContent).toBe(
    "Electronics",
  );
  await click("A second life");
  expect(container.querySelector("h1").textContent).toContain(
    "A second life for an Acer Nitro 5",
  );
  expect(container.querySelector("figure img").getAttribute("src")).toContain(
    "7.12.34",
  );
});
test("unknown project has a useful not-found page", async () => {
  await render("/work/does-not-exist");
  expect(container.querySelector("h1").textContent).toBe(
    "A little off the path.",
  );
});
test("contact prepares a brief without submitting it and handles unavailable clipboard", async () => {
  await render("/contact?service=printing");
  expect(container.querySelector("select").value).toBe("printing");
  await change(container.querySelector("input"), "Sam");
  await change(
    container.querySelector("form textarea"),
    "I need a small prototype bracket, approximately 50 mm wide.",
  );
  await act(async () =>
    container
      .querySelector("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(container.querySelector("#project-brief").value).toContain("I'm Sam");
  expect(container.querySelector("#project-brief").value).toContain(
    "3D printing",
  );
  expect(container.textContent).toContain("Your message has not been sent");
  expect(sessionStorage.length).toBe(0);
  const draft = container.querySelector('a[href^="mailto:"][href*="subject="]');
  expect(draft.getAttribute("href").split("?")[0]).toBe(`mailto:${COMPANY_EMAIL}`);
  const query = new URLSearchParams(draft.getAttribute("href").split("?")[1]);
  expect(query.get("body")).toBe(container.querySelector("#project-brief").value);
  expect(query.get("subject")).toContain("3D printing");
  expect(api.post).not.toHaveBeenCalled();
  await click("Copy message");
  expect(container.querySelector('[role="status"]').textContent).toContain(
    "Copy is unavailable",
  );
});
test("workspace requires real sign-in and ignores legacy demo storage", async () => {
  sessionStorage.setItem("ironroot.demo.session", JSON.stringify({ name: "Demo Maker" }));
  await render("/live");
  expect(container.textContent).toContain("Welcome back.");
  expect(container.querySelectorAll(".printer-card")).toHaveLength(0);
  expect(api.get).not.toHaveBeenCalledWith("/printers", expect.anything());
});
test("sign-in opens live printers and logout closes the workspace", async () => {
  api.post.mockImplementation(url => Promise.resolve({ data: url === "/auth/login" ? { user: { username: "Sam" } } : {} }));
  api.get.mockImplementation(url => url === "/auth/me" ? Promise.reject({ response: { status: 401 } }) : Promise.resolve({ data: { printers: [{ id: "ED1", name: "ED1", state: "Operational", connected: true, nozzle: { actual: 22, target: 0 } }, { id: "ED2", name: "ED2", state: "Unavailable", connected: false }] } }));
  await render("/live");
  await change(container.querySelector('input[type="email"]'), "sam@example.com");
  await change(container.querySelector('input[type="password"]'), "a-real-test-password");
  await act(async () => container.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  expect(api.post).toHaveBeenCalledWith("/auth/login", { email: "sam@example.com", password: "a-real-test-password" });
  expect(container.querySelectorAll(".printer-card")).toHaveLength(2);
  expect(container.textContent).toContain("1 / 2 connected");
  expect(container.textContent).toContain("22.0 °C");
  await click("Sign out");
  expect(api.post).toHaveBeenCalledWith("/auth/logout");
  expect(container.textContent).toContain("Welcome back.");
});
test("upload sends file contents and selected printer; library loads saved records", async () => {
  const saved = { _id: "saved-id", name: "test-part.gcode", size: 3, printer: "ED2", status: "ready", uploadDate: "2026-09-08" };
  api.get.mockImplementation(url => Promise.resolve({ data: url === "/auth/me" ? { user: { username: "Sam" } } : [saved] }));
  api.post.mockResolvedValue({ data: { file: saved } });
  await render("/upload");
  const input = container.querySelector("input[type=file]");
  const file = new File(["G28"], "test-part.gcode");
  Object.defineProperty(input, "files", { value: [file] });
  await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
  await change(container.querySelector("select"), "ED2");
  await click("Upload file");
  const [url, form] = api.post.mock.calls[0];
  expect(url).toBe("/models/upload");
  expect(form.get("file")).toBe(file);
  expect(form.get("printer")).toBe("ED2");
  expect(sessionStorage.length).toBe(0);
  expect(container.textContent).toContain("saved to your library");
  await click("Open file library");
  expect(container.textContent).toContain("test-part.gcode");
  expect(container.textContent).not.toContain("Sample project");
});
test("failed sign-in shows an error and does not open the workspace", async () => {
  api.post.mockRejectedValue({ response: { status: 401, data: { message: "Email or password is incorrect." } } });
  await render("/login");
  await act(async () => container.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  expect(container.querySelector('[role="alert"]').textContent).toContain("Email or password is incorrect");
  expect(container.querySelector(".workspace-toolbar")).toBeNull();
});
test("empty libraries do not show sample files", async () => {
  api.get.mockImplementation(url => Promise.resolve({ data: url === "/auth/me" ? { user: { username: "Sam" } } : [] }));
  await render("/file-library");
  expect(container.textContent).toContain("Upload your first STL");
  expect(container.querySelectorAll(".file-row")).toHaveLength(0);
});

test("printing gallery filters real photos and expands the full collection", async () => {
  await render("/3d-printing");
  expect(container.querySelectorAll(".printing-gallery-card")).toHaveLength(9);
  expect(container.querySelector(".gallery-count").textContent).toBe("21 photos");
  await click("Show more photos");
  await click("Show more photos");
  expect(container.querySelectorAll(".printing-gallery-card")).toHaveLength(21);
  await click("In progress");
  expect(container.querySelectorAll(".printing-gallery-card")).toHaveLength(4);
  expect(container.querySelector('.gallery-filters [aria-pressed="true"]').textContent).toBe("In progress");
  expect([...container.querySelectorAll(".printing-gallery-card img")].every(img => img.getAttribute("src").startsWith("/printing/"))).toBe(true);
});

test("enlarged gallery photos navigate with arrow keys and close cleanly", async () => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  await render("/3d-printing");
  await act(async () => container.querySelector(".gallery-photo-button").click());
  expect(container.querySelector("dialog").hasAttribute("open")).toBe(true);
  expect(container.querySelector(".gallery-full-photo").getAttribute("src")).toBe("/printing/IMG_7639.jpg");
  await act(async () => container.querySelector("dialog").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
  expect(container.querySelector(".gallery-full-photo").getAttribute("src")).toBe("/printing/IMG_7430.jpg");
  await click("Close ×");
  expect(container.querySelector("dialog").hasAttribute("open")).toBe(false);
  expect(document.body.style.overflow).toBe("");
});


test("general tech requests lead to the right inquiry topic", async () => {
  await render("/services");
  const link = container.querySelector('a[href="/contact?service=general"]');
  await act(async () => link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })));
  expect(container.querySelector("select").value).toBe("general");
  expect(container.querySelector("select").textContent).toContain("Software design & development");
});

test("home offers direct paths for printing and technology projects", async () => {
  await render();
  expect(container.querySelector('.future-hero a[href="/3d-printing"]')).not.toBeNull();
  expect(container.querySelector('.future-hero a[href="/services"]')).not.toBeNull();
  expect(container.querySelector('.print-entry a[href="/dashboard"]')).not.toBeNull();
  expect(container.querySelector('.tech-entry a[href="/contact"]')).not.toBeNull();
});

test("hero explains a real build and switches between documented stages", async () => {
  await render();
  const feature = container.querySelector(".workshop-feature");
  expect(feature.querySelector("img").getAttribute("src")).toBe("/printing/IMG_7402.jpg");
  expect(feature.textContent).toContain("Grid infill");
  await click("Assemble");
  expect(feature.querySelector("img").getAttribute("src")).toBe("/printing/IMG_7430.jpg");
  expect(feature.textContent).toContain("Wall sections");
  await click("Put it to use");
  expect(feature.querySelector("img").getAttribute("src")).toBe("/printing/IMG_7428.jpg");
  expect(feature.querySelector('[aria-pressed="true"]').textContent).toContain("Put it to use");
  expect(feature.querySelector('a').getAttribute("href")).toBe("/work/custom-prints");
});

test('public live view works without login and handles offline cameras', async () => {
  api.get.mockImplementation(url => url === '/auth/me' ? Promise.reject({ response: { status: 401 } }) : Promise.resolve({ data: url === '/public/printers' ? { printers: [{ id: 'ED1', name: 'ED1', state: 'Operational', connected: true, camera: { enabled: true, stream: '/api/public/cameras/ED1' } }, { id: 'ED2', name: 'ED2', state: 'Unavailable', connected: false, camera: { enabled: false } }] } : {} }));
  await render('/watch');
  expect(container.querySelectorAll('.printer-card')).toHaveLength(2);
  expect(container.textContent).not.toContain('Welcome back.');
  expect(container.textContent).toContain('Not broadcasting right now');
  const camera = container.querySelector('.camera-feed');
  await act(async () => camera.dispatchEvent(new Event('error')));
  expect(container.textContent).toContain('Camera offline');
  await click('Retry camera');
  expect(container.querySelector('.camera-feed')).not.toBeNull();
  expect(container.textContent).not.toContain('Current file');
});
test('members cannot open administration', async () => {
  api.get.mockImplementation(url => Promise.resolve({ data: url === '/auth/me' ? { user: { username: 'Member', isAdmin: false } } : {} }));
  await render('/admin');
  expect(container.textContent).toContain('Administrator access required');
  expect(api.get).not.toHaveBeenCalledWith('/admin/overview');
});
test('website maintenance has its own view and persists settings', async () => {
  const settings = { announcement: '', homeIntro: 'Original introduction', liveIntro: 'Studio cameras', acceptingUploads: true, cameras: { ED1: true, ED2: true } };
  api.get.mockImplementation(url => Promise.resolve({ data: url === '/auth/me' ? { user: { username: 'Owner', isAdmin: true } } : url === '/admin/website' ? { settings, audit: [] } : url.includes('projects') ? { projects: [] } : settings }));
  api.put.mockResolvedValue({ data: { settings } });
  await render('/admin/website');
  expect(container.querySelector('iframe')).toBeNull();
  await change(container.querySelector('.admin-settings textarea'), 'Open for commissions');
  await act(async () => container.querySelector('.admin-settings form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(api.put).toHaveBeenCalledWith('/admin/site', { ...settings, announcement: 'Open for commissions' });
  expect(container.textContent).toContain('Website settings saved');
});
test('signup waits for verification rather than granting a dashboard session', async () => {
  api.post.mockResolvedValue({ data: { verificationRequired: true, email: 'new@example.test', message: 'Check your email.' } });
  await render('/signup');
  await change(container.querySelector('input[name="username"]'), 'New Member');
  await change(container.querySelector('input[type="email"]'), 'new@example.test');
  await change(container.querySelector('input[type="password"]'), 'A-new-password-123');
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(container.textContent).toContain('One more step.');
  expect(container.querySelector('.workspace-toolbar')).toBeNull();
});
test('email link and code verify the account before opening the dashboard', async () => {
  const token = 'a'.repeat(64);
  api.post.mockResolvedValue({ data: { user: { username: 'Verified Member' } } });
  await render(`/verify-email#token=${token}`);
  await change(container.querySelector('input[autocomplete="one-time-code"]'), '123456');
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(api.post).toHaveBeenCalledWith('/auth/verify-email', { token, code: '123456' });
  expect(container.querySelector('.workspace-toolbar')).not.toBeNull();
});

test('printer console opens OctoPrint directly, preserves tab sessions, and supports focus view', async () => {
  api.get.mockImplementation(url => Promise.resolve({ data: url === '/auth/me' ? { user: { username: 'Owner', isAdmin: true } } : url === '/admin/printers' ? { printers: [{ id: 'ED1', state: 'Operational' }, { id: 'ED2', state: 'Printing' }] } : {} }));
  api.post.mockResolvedValue({ data: {} });
  await render('/admin');
  const first = container.querySelector('iframe');
  expect(first.getAttribute('src')).toBe('/ED1/');
  await act(async () => container.querySelector('#tab-ED2').click());
  expect(container.querySelectorAll('iframe')).toHaveLength(2);
  expect(container.querySelector('#workspace-ED1').hidden).toBe(true);
  await act(async () => container.querySelector('#tab-ED1').click());
  expect(container.querySelector('#workspace-ED1 iframe')).toBe(first);
  expect(container.querySelector('.admin-settings')).toBeNull();
  await click('Focus view'); expect(container.querySelector('.admin-console-focused')).not.toBeNull();
  await click('Exit focus view'); expect(container.querySelector('.admin-console-focused')).toBeNull();
});

test('homepage cameras show only actively printing filenames and no printer telemetry', async () => {
  api.get.mockImplementation(url => url === '/auth/me' ? Promise.reject({ response: { status: 401 } }) : Promise.resolve({ data: url === '/public/printers' ? { printers: [{ id: 'ED1', name: 'ED1', connected: true, state: 'Printing', job: { filename: 'active-part.gcode', completion: 25 }, nozzle: { actual: 210, target: 210 }, camera: { enabled: true, stream: '/api/public/cameras/ED1' } }, { id: 'ED2', name: 'ED2', connected: true, state: 'Operational', job: { filename: 'previous-part.gcode' }, camera: { enabled: true, stream: '/api/public/cameras/ED2' } }] } : {} }));
  await render('/');
  const cameras = container.querySelector('#live-cameras');
  expect(cameras.querySelectorAll('.camera-feed')).toHaveLength(2);
  expect(cameras.textContent).toContain('active-part.gcode');
  expect(cameras.textContent).not.toContain('previous-part.gcode');
  expect(cameras.textContent).not.toMatch(/Nozzle|Time remaining|25%|210/);
  expect(container.querySelector('.site-nav a[href="/watch"]')).toBeNull();
});


test('résumé portfolio is linked from About', async () => {
  await render('/about');
  expect(container.querySelector(`a[href="${RESUME_URL}"]`)).not.toBeNull();
});
test('website project editor creates a draft and can publish it', async () => {
  const settings = { announcement: '', homeIntro: 'Intro', liveIntro: 'Cameras', acceptingUploads: true, cameras: { ED1: true, ED2: true } };
  api.get.mockImplementation(url => Promise.resolve({ data: url === '/auth/me' ? { user: { username: 'Owner', isAdmin: true } } : url === '/admin/website' ? { settings, audit: [] } : { projects: [] } }));
  let saved;
  api.post.mockImplementation((url, body) => { saved = { ...body, id: 'new-print-1234abcd' }; return Promise.resolve({ data: { project: saved } }); });
  api.put.mockImplementation((url, body) => Promise.resolve({ data: { project: { ...body, id: saved.id } } }));
  await render('/admin/website');
  const form = container.querySelector('.portfolio-editor form');
  await change(form.querySelector('input'), 'New bracket print');
  await change(form.querySelector('textarea'), 'A completed custom bracket for a customer.');
  await change(form.querySelector('input[maxlength="250"]'), 'Printed bracket on the workbench');
  await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(saved.status).toBe('draft');
  expect(container.textContent).toContain('Draft saved.');
  const visibility = [...form.querySelectorAll('select')].find(select => select.querySelector('option[value="published"]'));
  await change(visibility, 'published');
  await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(api.put).toHaveBeenCalledWith('/admin/projects/new-print-1234abcd', expect.objectContaining({ status: 'published', title: 'New bracket print' }));
  expect(container.textContent).toContain('Project published on the website.');
});

function useBuildProjects() {
  const projects = require('../../iom-backend/config/projectDefaults.json');
  api.get.mockImplementation(url => url === '/auth/me' ? Promise.reject({ response: { status: 401 } }) : Promise.resolve({ data: url === '/public/projects' ? { projects } : [] }));
}
test('web project thumbnails open an embedded demo with working display and restart controls', async () => {
  useBuildProjects();
  await render('/work');
  await act(async () => [...container.querySelectorAll('.work-filters button')].find(button => button.textContent === 'Web & software').click());
  expect(container.querySelectorAll('.project-card')).toHaveLength(7);
  const link = container.querySelector('.project-image[href="/work/rick-and-morty-react"]');
  await act(async () => link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
  const frame = container.querySelector('iframe');
  expect(frame.src).toBe('https://resume-site-eight-snowy.vercel.app/embedded/rick-and-morty-react');
  expect(frame.title).toContain('interactive demo');
  expect(frame.getAttribute('sandbox')).not.toContain('allow-top-navigation');
  const button = label => [...container.querySelectorAll('button')].find(value => value.textContent === label);
  await act(async () => button('Mobile').click());
  expect(container.querySelector('.build-frame-mobile')).not.toBeNull();
  await act(async () => button('Reload demo').click());
  expect(container.querySelector('iframe')).not.toBe(frame);
  await act(async () => button('Close demo').click());
  expect(container.querySelector('iframe')).toBeNull();
  await act(async () => button('Launch demo').click());
  expect(container.querySelector('iframe')).not.toBeNull();
  expect(container.querySelector('a[href="https://github.com/Icepikd3v/rick-and-morty-react"]')).not.toBeNull();
});
test('AOTG shows a selectable screenshot walkthrough without connecting to the app', async () => {
  useBuildProjects();
  await render('/work/aotg-transportation');
  expect(container.querySelector('iframe')).toBeNull();
  expect(container.querySelectorAll('.build-screenshots button')).toHaveLength(8);
  await act(async () => container.querySelectorAll('.build-screenshots button')[2].click());
  expect(container.querySelector('.build-screen-view img').getAttribute('src')).toBe('/web-builds/aotg-consumer_upcoming_rides.png');
  expect(container.querySelectorAll('.build-screenshots button')[2].getAttribute('aria-pressed')).toBe('true');
  expect(container.textContent).not.toContain('Original company post');
});
