# Trello Clone Task Management Board

This is a simple Trello-like task management board built with React (Vite + Tailwind CSS) for the frontend and Python (FastAPI + SQLAlchemy) for the backend.

## Deployed Link

[(https://trello-clone-app-cyan.vercel.app/)]

## Demo Video

[(https://drive.google.com/file/d/1_PAaRHhEyMaQpKI-pyCJf6NcVVeV9pSa/view?usp=drive_link)]

## Features

*   View tasks organized in "To Do", "In Progress", and "Done" columns.
*   Create new tasks with a title, description, and status.
*   Edit existing tasks.
*   Delete tasks.
*   Drag and drop tasks between columns to update their status.
*   Persistent storage of tasks in a database.

## Project Structure
trello-clone/
├── backend/ # FastAPI application
├── frontend/ # React application
├── .gitignore
└── README.md

## Technologies Used

*   **Frontend:**
    *   React (with Vite)
    *   Tailwind CSS
    *   React Beautiful DnD (for drag and drop)
    *   Axios (for API calls)
    *   Heroicons (for icons)
*   **Backend:**
    *   Python
    *   FastAPI
    *   SQLAlchemy (with SQLite for development)
    *   Uvicorn (ASGI server)

## Setup and Installation

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (v8.x or later) or yarn
*   Python (v3.8 or later recommended)
*   pip (Python package installer)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Environment Variables (Optional for local SQLite):**
    Create a `.env` file in the `backend/` directory if you want to override defaults (e.g., for a different database or frontend URL).
    Example `backend/.env`:
    ```env
    # DATABASE_URL="postgresql://user:password@host:port/dbname" # For PostgreSQL
    # FRONTEND_URL="http://your-custom-frontend-url.com"
    ```
    If using the default SQLite, no `.env` file is strictly needed for the backend to run locally.
5.  **Run the backend server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will be available at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend 
    # (If you are in the root, otherwise navigate from backend: cd ../frontend)
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the `frontend/` directory.
    `frontend/.env`:
    ```env
    VITE_API_BASE_URL=http://localhost:8000/api
    ```
    (This tells the frontend where to find the backend API during local development).
4.  **Run the frontend development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The frontend will be available at `http://localhost:5173`.


## Design Choices

*   **Backend (FastAPI):** Chosen for its speed, ease of use, automatic data validation (with Pydantic), and auto-generated API documentation. Python was preferred as per requirements.
*   **Database (SQLAlchemy with SQLite):** SQLAlchemy provides a powerful ORM. SQLite was used for local development due to its simplicity (no separate server needed). For deployment, a more robust database like PostgreSQL is recommended.
*   **Frontend (React with Vite):** Vite provides a fast development experience. React is a popular and powerful library for building UIs.
*   **Styling (Tailwind CSS):** Chosen for its utility-first approach, allowing for rapid UI development and easy customization without writing much custom CSS.
*   **Drag and Drop (React Beautiful DnD):** Used as specified in the project requirements.
*   **State Management (React Hooks):** `useState` and `useEffect` were used for managing local component state and side effects, sufficient for this application's complexity.
*   **API Communication (Axios):** A popular promise-based HTTP client for making API requests.
*   **Monorepo Structure:** Both backend and frontend are in a single GitHub repository for ease of management for this project size.
*   [Add any other specific design choices you made, e.g., why you structured a particular component a certain way, optimistic updates, error handling approach, etc.]

## Further Improvements / Future Work

*   User authentication and authorization.
*   Real-time updates (e.g., using WebSockets).
*   More detailed task properties (due dates, assignees, labels).
*   Column reordering.
*   Mobile responsiveness enhancements.
*   More comprehensive error handling and user feedback.
*   Unit and integration tests.
