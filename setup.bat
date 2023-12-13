@echo off

:BACKEND
cd backend
call setup.bat
cd ..

:FRONTEND
cd frontend
call setup.bat
cd ..

:FINISH
echo Setup complete. Please run the "start.bat"
pause