# Icepik's Octo Manager (IOM)

## Application Definition Statement

**Icepik's Octo Manager (IOM)** is a web application designed to integrate with the OctoPrint API, enabling users to manage their 3D printing tasks efficiently. This application provides tools for uploading and managing 3D model files, live control of 3D printers, and real-time status monitoring. Advanced features, such as model editing and subscription-based services, are also planned to enhance the experience for serious hobbyists and small businesses.

## Target Market

The target market includes:

- **Age:** 18–45 years old.
- **Demographics:** Makers, hobbyists, educators, and small businesses interested in 3D printing.
- **Employment Sectors:** Engineers, designers, educators, and entrepreneurs.
- **Income Level:** Middle-to-high income groups capable of investing in 3D printing technology.
- **Hobbies/Interests:** DIY projects, prototyping, model building, and creative technology.

**Primary Research:** Discussions with local makerspace members revealed common frustrations with managing print jobs and the need for better model organization and monitoring tools.

**Secondary Research:** Industry articles, including reports from 3D printing blogs, highlighted OctoPrint as a widely used solution, but users often seek a more polished interface and advanced features.

## User Profile / Persona

**Persona 1: Alex, The Hobbyist**

- **Age:** 27
- **Occupation:** Software Developer
- **Goals:** Simplify print management and avoid failed prints during long jobs.
- **Pain Points:** Finds OctoPrint's UI overwhelming and lacks access to model preview features.

**Persona 2: Mia, The Educator**

- **Age:** 35
- **Occupation:** High School Teacher
- **Goals:** Manage print queues for classroom projects efficiently.
- **Pain Points:** Needs real-time monitoring and better job scheduling.

## Use Cases

1. **Uploading a 3D Model for Printing**

   - User logs in.
   - Uploads a `.gcode` file.
   - Application validates and stores the file.
   - User selects a printer and starts the job.

2. **Monitoring Printer Status**
   - User logs in.
   - Navigates to the dashboard.
   - Views real-time printer status and job progress.
   - Receives alerts for errors or completion.

## Problem Statement

Managing 3D printing tasks can be time-consuming and error-prone, especially for users relying on OctoPrint's basic interface. This application addresses the need for an intuitive, streamlined experience to minimize wasted time and materials.

## Pain Points

1. **Complexity:** Existing interfaces like OctoPrint are powerful but not user-friendly.
2. **Lack of Advanced Features:** Model previews, editing tools, and queue management are often missing.
3. **Monitoring Challenges:** Users lack efficient real-time notifications or remote control options.

## Solution Statement

**Icepik's Octo Manager (IOM)** simplifies 3D printing by providing an intuitive interface, real-time monitoring, and advanced model management tools. It differentiates itself from competitors by enhancing OctoPrint's functionality with polished visuals and subscription-based features.

## Competition

1. **OctoPrint**: Direct competitor offering a robust but outdated and technical UI.
2. **AstroPrint**: Indirect competitor focused on cloud-based 3D printer management but lacks live editing features.
3. **PrusaSlicer**: A slicing tool offering some similar functionalities but no API integration for remote management.

## Features & Functionality

1. **Dashboard**: Provides a central hub for managing all connected printers.
2. **File Upload & Validation**: Users can upload `.gcode` files, which are validated for errors before printing.
3. **Real-Time Monitoring**: Tracks printer status and job progress with notifications.
4. **Advanced Model Editing**: Allows users to make simple changes to 3D models within the app.
5. **Subscription Features**: Includes enhanced editing tools, print analytics, and cloud storage.

## Integrations

1. **OctoPrint API**: Primary integration for interacting with 3D printers. [API Documentation](https://docs.octoprint.org/en/master/api/)
   - **Usage:** Fetch and send printer data, manage print jobs, and monitor status.
2. **Cloud Storage API (e.g., AWS S3)**: For storing user-uploaded 3D models.
   - **Usage:** Secure file storage for advanced subscription users.

---

## 🔁 Change Order

**Proposal and Tech Stack Confirmed**: ✅ Yes

**Estimated Work Remaining**:  
Approximately 60–70% of the project remains. The frontend has been bootstrapped and partially implemented. The backend API, database, and deployment are planned for Milestone 2 and 3.

**Proposed Changes to Scope**:  
No changes to the confirmed scope at this time. However, if time allows later this month, additional features such as user authentication and subscription billing may be proposed as enhancements in future milestones.
