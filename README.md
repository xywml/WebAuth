# WebAuth

A lightweight web authentication solution.

## Prerequisites
- Node.js (v16+) installed
- pnpm installed globally (run `npm install -g pnpm` if missing)

## Quick Start & Deployment

### 1. Clone the Repository
```bash
git clone https://github.com/xywml/WebAuth.git
cd WebAuth
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Build the Project
```bash
pnpm run build
```
> A `dist/` directory with production-ready static assets will be generated upon successful build.

### 4. Deploy to Your Server
Copy the **entire `dist/` directory** from your local machine to the static file serving path of your server (e.g., Nginx `html/` folder, Apache `htdocs/`, etc.).
