export const DEMO_EMAIL = "demo@ironroot.example";
export const DEMO_PASSWORD = "IronRootDemo!";
export const DEMO_NAME = "Demo Maker";
export const DEMO_TOKEN = "frontend-demo-token";
const KEY = "ironroot.demo.session";
export function getDemoUser() {
  if (process.env.NODE_ENV === "production") return null;
  try {
    const user = JSON.parse(sessionStorage.getItem(KEY));
    return user?.name ? user : null;
  } catch {
    return null;
  }
}
export function startDemo(name = DEMO_NAME) {
  if (process.env.NODE_ENV === "production") return;
  sessionStorage.setItem(KEY, JSON.stringify({ name, email: DEMO_EMAIL }));
}
export function endDemo() {
  sessionStorage.removeItem(KEY);
}
