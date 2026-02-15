# Pantheon

A unified data dashboard built for Calgary Hack 2026.

## Overview

Pantheon brings together multiple data sources into a single, cohesive dashboard. It currently focuses on Google Analytics 4 traffic data and supports integrating additional sources (e.g., HubSpot) for a complete view of your metrics.

## Quick Start

Two terminals are used during development: one for the backend and one for the frontend.

1) Create and activate a virtual environment for the backend (recommended)
- macOS/Linux:
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```
- Windows:
  ```bash
  py -m venv .venv
  .venv\Scripts\activate
  ```

2) Install backend dependencies
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

3) Install frontend dependencies
- From the frontend directory:
  ```bash
  cd frontend
  npm install
  ```

## Run the App

- Start the backend (from the root directory):
  ```bash
  cd backend
  py app.py
  ```
- Start the frontend (from the root directory):
  ```bash
  cd frontend
  npm run dev
  ```

## Demo Case

For the demo we manually pull databases.

debug chance:
--> for god knows why, Sidebar.tsx sometimes is named with lowercase s instead of capital s. if this error should occur again, please rename the file to the capital s