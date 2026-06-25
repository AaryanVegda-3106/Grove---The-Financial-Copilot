@echo off
echo Starting Grove Frontend and Backend...

:: Start the frontend in a new command window
start "Grove Frontend" cmd /k "cd frontend && npm run dev"

:: Start the backend in a new command window
start "Grove Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn main:app --reload"

echo Services are starting in separate windows. Close those windows to stop the services.
