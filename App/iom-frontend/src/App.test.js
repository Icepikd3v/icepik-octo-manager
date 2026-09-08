import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { getDemoUser } from "./constants/demoAuth";
import { FACEBOOK_URL } from "./data/company";
let container, root;
beforeEach(() => {
  sessionStorage.clear();
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
  await click("Copy message");
  expect(container.querySelector('[role="status"]').textContent).toContain(
    "Copy is unavailable",
  );
});
test("mock login, logout and route protection remain in the development workspace", async () => {
  await render("/live");
  expect(container.textContent).toContain("Print workspace preview.");
  await click("Explore demo workspace");
  expect(getDemoUser().name).toBe("Demo Maker");
  expect(container.querySelectorAll(".printer-card").length).toBe(3);
  expect(container.textContent).toContain("0 / 3 connected");
  await click("Exit demo");
  expect(getDemoUser()).toBeNull();
  expect(container.textContent).toContain("Explore demo workspace");
});
test("development file preview stores only metadata and opens in the library", async () => {
  await render("/dev");
  await click("Explore demo workspace");
  await click("New project");
  const input = container.querySelector("input[type=file]");
  Object.defineProperty(input, "files", {
    value: [new File(["G28"], "test-part.gcode")],
  });
  await act(async () =>
    input.dispatchEvent(new Event("change", { bubbles: true })),
  );
  await click("Add to demo library");
  expect(JSON.parse(sessionStorage.getItem("ironroot.demo.files"))[0]).toEqual({
    id: expect.any(Number),
    name: "test-part.gcode",
    size: 3,
  });
  await click("Open file library");
  expect(container.textContent).toContain("test-part.gcode");
});
