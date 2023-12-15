:PREREQUISITES
echo Checking prerequisites...
python --version 2>NUL
IF NOT errorlevel 0 (
	echo Couldn't find python on this machine.
)

:BACKEND
echo Installing backend...

IF NOT EXIST venv\ (
	echo Creating python virtual environment...
	python3.10 -m venv venv
)

call ./venv/Scripts/activate.bat

echo Installing requirements...
pip install --disable-pip-version-check -r requirements.txt