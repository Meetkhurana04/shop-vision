# Makefile — Shopvision development shortcuts
# Usage: make <target>
# On Windows, install "make" via: winget install GnuWin32.Make
# Or just run the commands inside each target manually.

.PHONY: install dev seed test backup

## Install all Python dependencies into a virtual environment
install:
	python -m venv .venv
	.venv\Scripts\pip install -r requirements.txt

## Start the development server with auto-reload
dev:
	.venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## Seed the database with default categories and owner account
seed:
	.venv\Scripts\python seed.py

## Run tests
test:
	.venv\Scripts\pytest tests/ -v

## Backup the SQLite database to a timestamped file
backup:
	@for /f "tokens=2 delims==" %%i in ('wmic os get localdatetime /format:list') do set DT=%%i
	copy shopvision.db shopvision_backup_%date:~-4%-%date:~3,2%-%date:~0,2%.db
	@echo Backup created.

## Reset database (DANGER: deletes all data)
reset-db:
	del /f shopvision.db
	.venv\Scripts\python seed.py
