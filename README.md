# MinutesPro

MinutesPro is a professional web application designed for efficiently recording, managing, and exporting meeting minutes. It provides a distraction-free environment to track agendas, discussions, decisions, and action items.

![MinutesPro Screenshot](https://replit.com/public/images/opengraph.png)

## Features

- **Meeting Dashboard**: A centralized view of all your meeting records, searchable by title or date.
- **Comprehensive Editor**:
  - **Dynamic Agenda**: Add, reorder, and track agenda items with time allocations.
  - **Discussion & Decisions**: Dedicated sections for capturing key discussion points and final decisions.
  - **Action Items**: Track tasks with assigned owners, due dates, and completion status.
- **PDF Export**: Generate clean, professional PDF reports of your meetings with a single click. The export engine produces formatted documents suitable for sharing with stakeholders.
- **Local Persistence**: All data is automatically saved to your browser's local storage, ensuring you don't lose work during a session.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 with a custom design system (Slate & Indigo theme)
- **UI Components**: Radix UI primitives (via Shadcn UI)
- **State Management**: Zustand (with local storage persistence)
- **Routing**: Wouter
- **Icons**: Lucide React
- **PDF Generation**: html2canvas + jsPDF (Custom implementation for reliable rendering)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   The application will start on port 5000. Open the web view to interact with the app.

## Project Structure

- **`client/src/pages`**: Main application views
  - `Home.tsx`: Dashboard listing all meetings.
  - `MeetingDetail.tsx`: The core editor for viewing and editing meeting notes.
- **`client/src/lib`**: Core logic and utilities
  - `store.ts`: Zustand store definition for managing application state and persistence.
- **`client/src/components`**: Reusable UI components (Buttons, Cards, Inputs, etc.).

## Usage Guide

1. **Create a Meeting**: Click "New Meeting" on the dashboard.
2. **Plan Agenda**: Add agenda items and estimated durations.
3. **Take Notes**: Record discussion points and key decisions during the meeting.
4. **Assign Actions**: Add action items, assign owners, and set due dates.
5. **Export**: Click "Download PDF" to generate a formal record of the meeting.

## License

MIT
