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

### ✅ Week 3 Log – Milestone 3

#### ⚙️ Overview – What I worked on this past week

This week, I focused on **security, compliance, and analytics** improvements across the backend of the IOM project. I implemented admin-only analytics routes (`/api/analytics`) with support for summary data, top users, breakdowns, and CSV export. I also expanded our print job lifecycle to log events like start, pause, cancel, resume, and ship — and integrated email notifications accordingly. In addition, I wrote a [Terms of Service draft](../terms.md) and completed Week 3 research on OWASP security risks and GitHub CodeQL scanning.

#### 🌵 Challenges – What problems did I have & how I’m addressing them

I ran into some access control issues when testing the admin routes and needed to verify that only admin users could access the analytics endpoints. Debugging that and verifying the role-based middleware was key. Another challenge was refining the analytics event logging to include `jobId` metadata and validating event integrity without creating duplicates. I addressed this by adding logging at each major backend lifecycle point with consistent structure.

#### 🏆 Accomplishments – What is something I "leveled up" on this week

I leveled up my **full-stack backend engineering** skills by implementing a full analytics reporting system from MongoDB to API to CSV export. This required planning out aggregation pipelines, writing clean and modular services, and ensuring admin-only access control throughout the routes. I also refined GitHub workflows by tracking every task with labeled issues and pushing all changes through structured pull requests.

#### 🔮 Next Steps – What I plan to prioritize and do next

- Begin frontend implementation of the analytics dashboard (read-only for admins)
- Prepare milestone 4 planning (user dashboards, print job tracking UI)
- Add user settings page for managing email preferences
- Finalize and merge dev to stage, and stage to main if stable

---

### Week 4 - Milestone 4

Final stand-up...
