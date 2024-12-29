# **Project & Portfolio**

- **Research Notes - Milestone 4**
- **Samuel Farmer**
- **Assignment Due Date: Dec 22, 2024**

<br>

## **Topic - Front-End Development and Deployment Best Practices**

This document contains research notes on **React best practices, PropTypes, ModuleCSS, ESLint, deployment workflows, and enhanced Figma usage** applied to **Icepik's Octo Manager (IOM)**.

<br>

## **Sub-Topic 1 - Thinking in React**

**Brief overview of research:** React's core principle is breaking down the UI into **modular, reusable components**. It encourages clarity, maintainability, and scalability.

- **Key Finding 1:** Components represent individual UI pieces with isolated logic and styling.

  - **Application:** IOM breaks down sections into reusable components like **Header**, **Button**, **Card**, and **Form**.

- **Key Finding 2:** Component hierarchy allows complex UIs to be built from smaller building blocks.

  - **Application:** IOM uses a **Parent-Child structure** for components, e.g., `Dashboard` as a parent for multiple child components (`Upload`, `LIVE!`).

- **Key Finding 3:** Props allow data to pass from parent to child components.

  - **Application:** `Header` receives `logo` and `navLinks` as props to dynamically display navigation items.

- **Key Finding 4:** State manages dynamic content and user interactions.

  - **Application:** `Upload` component uses state to track file status (`Uploading`, `Completed`, `Error`).

- **Key Finding 5:** Conditional rendering optimizes UI changes.
  - **Application:** Buttons toggle between active and disabled states based on printer availability.

<br>

## **Sub-Topic 2 - File Structure in React**

**Brief overview of research:** A well-organized file structure simplifies development, debugging, and scaling.

- **Key Finding 1:** Group reusable components in a `/components` folder.

  - **Application:** IOM stores reusable elements like `Header.jsx`, `Button.jsx`, and `Card.jsx` in `/src/components`.

- **Key Finding 2:** Page-level components reside in a `/pages` folder.

  - **Application:** Screens such as `Dashboard.jsx` and `Upload.jsx` are managed in `/src/pages`.

- **Key Finding 3:** Assets like images, icons, and fonts should have a dedicated `/assets` folder.

  - **Application:** Logos, backgrounds, and SVGs are organized under `/src/assets`.

- **Key Finding 4:** State management logic resides in a `/context` folder.

  - **Application:** Global app states are centralized using **React Context API**.

- **Key Finding 5:** Separate API calls in a `/services` folder.
  - **Application:** API integrations, such as those with **OctoPrint API**, are managed in `/src/services`.

<br>

## **Sub-Topic 3 - Why ESLint?**

**Brief overview of research:** ESLint is a **static code analysis tool** used to identify problems and enforce consistent code standards.

- **Key Finding 1:** Detects syntax and logical errors early.

  - **Application:** ESLint ensures no unused variables or undefined functions in IOM's components.

- **Key Finding 2:** Enforces best practices for React development.

  - **Application:** Code follows a consistent format, reducing bugs and improving readability.

- **Key Finding 3:** Integrates well with Prettier for auto-formatting.

  - **Application:** Ensures consistent spacing, indentation, and style across all files.

- **Key Finding 4:** Enhances collaboration by enforcing team-wide coding standards.

  - **Application:** Team members follow the same linting rules, avoiding conflicts.

- **Key Finding 5:** Provides warnings and suggestions for optimization.
  - **Application:** Identifies unnecessary re-renders and inefficient code blocks.

<br>

## **Sub-Topic 4 - PropTypes & DefaultProps**

**Brief overview of research:** PropTypes and DefaultProps enforce **type safety** and prevent runtime errors in React components.

- **Key Finding 1:** PropTypes validate the data passed to components.

  - **Application:** Ensures that `Header` only receives `logo` (string) and `navLinks` (array of objects).

- **Key Finding 2:** DefaultProps provide fallback values.

  - **Application:** Prevents errors when props are not explicitly passed to components.

- **Key Finding 3:** Improves debugging clarity.

  - **Application:** Invalid prop types display warnings in the console during development.

- **Key Finding 4:** Enhances component reusability.

  - **Application:** Components can handle diverse use cases without breaking.

- **Key Finding 5:** Reduces reliance on runtime checks.
  - **Application:** Errors are caught during development instead of production.

<br>

## **Sub-Topic 5 - Why ModuleCSS?**

**Brief overview of research:** ModuleCSS prevents **global CSS conflicts** by scoping styles to individual components.

- **Key Finding 1:** CSS classes are locally scoped.

  - **Application:** `Header.module.css` ensures styles don’t accidentally affect `Button`.

- **Key Finding 2:** Improved maintainability.

  - **Application:** Styles are component-specific, avoiding a single massive CSS file.

- **Key Finding 3:** Easy debugging of styles.

  - **Application:** Scoped styles are easier to track in the browser's developer tools.

- **Key Finding 4:** Modular CSS enhances reusability.

  - **Application:** Components can be reused with their unique styles.

- **Key Finding 5:** Works seamlessly with build tools (e.g., Webpack).
  - **Application:** Ensures optimized style imports.

<br>

## **Sub-Topic 6 - Advanced Figma Techniques**

**Brief overview of research:** Advanced Figma techniques improve clarity, precision, and collaboration during the design process.

- **Key Finding 1:** Overlays allow interactive elements without creating new pages.

  - **Application:** Dropdown menus and modals in IOM are implemented as overlays.

- **Key Finding 2:** Opacity settings reveal true design intentions.

  - **Application:** Adjusted opacity ensures colors match final production output accurately.

- **Key Finding 3:** Component Variants streamline reusable design assets.

  - **Application:** Buttons and cards in IOM use Figma variants for consistency.

- **Key Finding 4:** Use of constraints ensures responsive designs.

  - **Application:** Layouts adapt to different screen sizes effectively.

- **Key Finding 5:** Real-time collaboration optimizes feedback loops.
  - **Application:** Shared Figma links allowed team members and instructors to provide timely feedback.

<br>

## **Reference Links**

- **React Documentation:** [https://reactjs.org/docs/getting-started.html](https://reactjs.org/docs/getting-started.html)
- **ESLint Docs:** [https://eslint.org/docs/user-guide/getting-started](https://eslint.org/docs/user-guide/getting-started)
- **Heroku Guide:** [https://devcenter.heroku.com](https://devcenter.heroku.com)
- **Figma Advanced Techniques:** [https://help.figma.com](https://help.figma.com)

---
