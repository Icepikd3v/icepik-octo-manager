# Log ...🚀

# Project & Portfolio

### Samuel Farmer

![Degree Program](https://img.shields.io/badge/degree-web%20development-blue.svg)&nbsp;

<br>

## 📢 &nbsp; Weekly Stand Up

Each week I will summarize my milestone activity and progress by writing a stand-up. A stand-up is meant to be a succinct update on how things are going. Use these prompts as a guide on what to write about:

⚙️ Overview - What I worked on this past week  
🌵 Challenges - What problems did I have & how I'm addressing them  
🏆 Accomplishments - What is something I "leveled up" on this week  
🔮 Next Steps - What I plan to prioritize and do next

---

# WDV349 - Project & Portfolio I

### Week 1 - Milestone 1

⚙️ **Overview:**  
This week, I worked on:

- Researching feature branch workflows and documenting findings in `R1-Notes.md`.
- Defining the tech stack for the project and updating `TechStack.md`.
- Drafting the project proposal in `ProjectProposal.md`.
- Managing and resolving GitHub issues for Milestone 1.
- Setting up the stage branch and leaving the pull request from `dev` to `stage` open for tracking.

🌵 **Challenges:**

- Understanding the Git feature branch workflow and resolving conflicts during pull requests.
- Determining the best way to integrate my personal branding into the project name.

🏆 **Accomplishments:**

- Successfully named the project **Icepik's Octo Manager (IOM)**.
- Completed all required tasks for Milestone 1 and updated related issues on the project board.

🔮 **Next Steps:**

- Finalize the pull request from `dev` to `stage` after confirming all milestone tasks are complete.
- Begin work on Milestone 2, focusing on initial design and wireframes for the application.

---

### Week 2 - Milestone 2

⚙️ **Overview:**  
This week, I worked on:

- Designing wireframes for all key application pages, including Homepage, User Dashboard, LIVE!, Upload, and File Library.
- Developing the style tile to define the branding elements (colors, typography, icons, and UI components).
- Exporting and organizing wireframes and the style tile in the `docs` folder.
- Managing GitHub workflow by creating the `wireframes` branch and pushing all deliverables.

🌵 **Challenges:**

- Ensuring consistency across all wireframes while maintaining a balance between modern professionalism and playful accessibility.
- Selecting complementary fonts that align with the project's branding and purpose.
- Deciding whether to combine wireframes and the style tile into one branch or separate branches.

🏆 **Accomplishments:**

- Successfully completed and exported all wireframes and the style tile.
- Finalized branding decisions, including fonts, color schemes, and logo design.

🔮 **Next Steps:**

- Merge the `wireframes` branch into `dev` after reviewing the pull request.
- Close Milestone 2 and begin preparing for Milestone 3.

---

### Week 3 - Milestone 3

⚙️ **Overview:**  
This week, I worked on:

- Building a clickable prototype for the IOM app.
- Adding issues for models and state management planning.
- Researching usability principles and documenting in `R3-Notes.md`.
- Merging the `prototype` branch into `dev`.

🌵 **Challenges:**

- Linking all navigation states in Figma.
- Handling merge conflicts with R3-Notes.md.

🏆 **Accomplishments:**

- Completed a fully working prototype.
- Merged prototype to `dev` with conflicts resolved.

🔮 **Next Steps:**

- Finalize submission for Week 3 milestone.
- Begin backend work for final milestone.

---

### Week 4 - Milestone 4

⚙️ **Overview:**  
This week, I focused on:

- Completing all core frontend pages.
- Mock login/logout and route protection.
- Styling polish using Tailwind.
- GitHub documentation and milestone finalization.

🌵 **Challenges:**

- Tailwind navbar alignment.
- Footer layout consistency.

🏆 **Accomplishments:**

- Fully styled app.
- All frontend features completed.

🔮 **Next Steps:**

- Submit final PR and project board.

---

# WDV359 - Project & Portfolio II

### Week 1 - Milestone 1

⚙️ **Overview:**  
This week, I worked on:

- Researching feature branch workflows and documenting findings in `week1.md`.
- Updating the tech stack and project proposal with “Change Order” sections in their respective markdown files.
- Creating and assigning GitHub Issues, Milestones, and Project Board views.
- Setting up a new `README.md` for the frontend and verifying accurate project startup details.
- Managing and resolving GitHub branch and file recovery issues after a reset.

🌵 **Challenges:**

- Accidental file loss due to a `git reset` — resolved using `git reflog` and hard reset commands.
- Reorganizing branch structure and restoring milestone progress via GitHub and local history.
- Ensuring accurate version control without triggering additional file deletions during merges.

🏆 **Accomplishments:**

- Recovered full project environment and directory after a major Git misstep.
- Successfully completed and merged PRs for:
  - `week1.md` (in `docs/research/`)
  - `ProjectProposal.md` + Change Order
  - `TechStack.md` + Change Order
- Created and assigned 3 GitHub Issues to the project milestone and board.
- Updated and pushed a new, professional `README.md` for the frontend.

🔮 **Next Steps:**

- Begin backend folder and Express + Sequelize setup.
- Start OctoPrint API integration testing.
- Prepare wireframes and click-through mockups for Milestone 2.

---

### Week 2 - Milestone 2

⚙️ **Overview:**  
This week I focused on backend development and integration. I connected the frontend React app to the backend Express API and verified communication using live endpoints. I implemented JWT authentication and middleware protection for secure routes. I also completed setup for MongoDB and Express server logic.

🌵 **Challenges:**  
One challenge was encountering a Git push rejection due to my local `dev` branch being out of sync. I resolved this by using `git pull --rebase`, which helped me integrate remote changes without conflicts. I also troubleshooted some CORS issues and refined how the token is sent and stored during authentication.

🏆 **Accomplishments:**

- Connected frontend to backend API
- Verified token-based login and data fetch workflows
- Implemented JWT creation, middleware, and route protection
- Completed Express and MongoDB initialization
- Closed 3 GitHub issues tied to milestone: Express, MongoDB, and JWT setup
- Submitted a clean, milestone-tied pull request from `dev` to `staging`

🔮 **Next Steps:**

- Expand protected routes and print job creation logic
- Build out `PrintJob` model and upload controller
- Begin integrating OctoPrint service for live print handling
- Add frontend feedback for login success/failure and secure redirects

---

### Week 3 – Milestone 3

⚙️ **Overview:**  
This week I focused on securing the backend and preparing the app for user-facing compliance. I implemented middleware to enforce admin-only access where appropriate and added analytics logging for key user actions like uploads and print triggers. These steps lay the foundation for responsible user tracking and tier-based enforcement.

🌵 **Challenges:**  
Some challenges included structuring analytics logging in a way that wouldn’t clutter controller logic. I also had to balance route security without blocking legitimate access for verified users. Planning out scalable compliance features without overcomplicating the existing flow required careful consideration.

🏆 **Accomplishments:**

- Added admin-only middleware for sensitive routes
- Created `analyticsService.js` to log user activity
- Set up print compliance logic for subscription enforcement
- Cleaned up and documented backend routes
- Finalized all updates into `dev` with no merge issues

🔮 **Next Steps:**

- Implement webhook event handling from OctoPrint
- Begin frontend-side integration of new backend data
- Add admin dashboard elements to surface analytics
- Prepare Beta milestone and frontend polish for Week 4

---

### Week 4 – Milestone 4

⚙️ **Overview:**  
This week marked the Beta release of the project. I finalized backend development by adding maintenance mode for printers, an admin-only user list route, and webhook support for OctoPrint print events. I also cleaned up test data, removed large `.gcode` files, and ensured Swagger documentation and route protections were complete and accurate.

🌵 **Challenges:**  
Managing large file deletions and ensuring Git history remained intact was tricky. I also had to debug webhook triggers and ensure the correct response flow for maintenance mode logic. Balancing frontend tasks alongside backend polish added time pressure.

🏆 **Accomplishments:**

- Implemented printer maintenance mode logic
- Added admin-only route to list all users
- Integrated OctoPrint webhook event handling (initial version)
- Finalized Swagger docs and secured all routes
- Cleaned up repo and removed unnecessary upload artifacts
- Created Milestone 4 pull request and all supporting issues

🔮 **Next Steps:**

- Polish frontend UI and dashboard integration
- Test full upload-to-print-to-complete flow with webcam
- Record demo screencast for Showcase submission
- Submit final postmortem reflection and prepare for final week
