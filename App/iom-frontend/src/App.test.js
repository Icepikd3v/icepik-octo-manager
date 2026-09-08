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
import { FACEBOOK_URL, COMPANY_EMAIL } from "./data/company";
let container, root;
beforeEach(() => {
  sessionStorage.clear();
  jest.clearAllMocks();
  api.get.mockImplementation(url => url === "/auth/me" ? Promise.reject({ response: { status: 401 } }) : Promise.resolve({ data: url === "/printers" ? { printers: [] } : [] }));
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


test("technology services lead to a security inquiry with the right topic", async () => {
  await render("/services");
  const section = container.querySelector("#security");
  expect(section.textContent).toContain("Security-camera & video-doorbell setup");
  await act(async () => section.querySelector("a").dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })));
  expect(container.querySelector("select").value).toBe("security");
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
test('admin controls require confirmation and site changes persist through the API', async () => {
  const settings = { announcement: '', homeIntro: 'Original introduction', liveIntro: 'Studio cameras', acceptingUploads: true, cameras: { ED1: true, ED2: true } };
  api.get.mockImplementation(url => Promise.resolve({ data: url === '/auth/me' ? { user: { username: 'Owner', isAdmin: true } } : url === '/admin/overview' ? { settings, printers: [{ id: 'ED1', state: 'Operational', job: { filename: 'part.gcode', path: 'part.gcode' } }], audit: [] } : settings }));
  api.post.mockResolvedValue({ data: { message: 'ED1: start accepted.' } });
  api.put.mockResolvedValue({ data: { settings } });
  await render('/admin');
  await click('Start print');
  expect(api.post).not.toHaveBeenCalled();
  expect(container.querySelector('.command-confirm').textContent).toContain('part.gcode');
  await click('Confirm start');
  expect(api.post).toHaveBeenCalledWith('/admin/printers/ED1/command', { action: 'start', confirmPrinter: 'ED1', expectedFile: 'part.gcode' });
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

test('admin opens independent full OctoPrint workspaces after preparing the site session', async () => {
  const settings = { announcement: '', homeIntro: 'Intro', liveIntro: 'Cameras', acceptingUploads: true, cameras: { ED1: true, ED2: true } };
  api.get.mockImplementation(url => Promise.resolve({ data: url === '/auth/me' ? { user: { username: 'Owner', isAdmin: true } } : url === '/admin/overview' ? { settings, printers: [{ id: 'ED1', state: 'Operational' }, { id: 'ED2', state: 'Operational' }], audit: [] } : settings }));
  api.post.mockResolvedValue({ data: { user: { username: 'Owner', isAdmin: true } } });
  await render('/admin');
  expect(container.querySelectorAll('iframe')).toHaveLength(0);
  await click('Open ED1 OctoPrint');
  expect(api.post).toHaveBeenCalledWith('/admin/octoprint/session');
  expect(container.querySelector('iframe').getAttribute('src')).toBe('/ED1/');
  await click('Open ED2 OctoPrint');
  expect([...container.querySelectorAll('iframe')].map(el => el.getAttribute('src'))).toEqual(['/ED1/', '/ED2/']);
  await click('Close workspace');
  expect(container.querySelectorAll('iframe')).toHaveLength(1);
  expect(container.querySelector('iframe').getAttribute('src')).toBe('/ED2/');
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
