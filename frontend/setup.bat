:PREREQUISITES
echo Checking prerequisites...
call npm --version 2>NUL
IF NOT errorlevel 0 (
	echo Couldn't find npm on this machine.
)

:FRONTEND
echo Installing frontend...
call npm install -s