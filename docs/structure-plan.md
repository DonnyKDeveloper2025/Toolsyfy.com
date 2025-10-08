# Toolsyfy - Architecture & Structure Plan

This document outlines the refactored architecture of the Toolsyfy project, designed for scalability, maintainability, and performance.

## 1. Core Architecture: Hybrid App Model

Toolsyfy is a hybrid application:
- **React SPA (Single Page Application):** The main landing page (`/`) is a React application that serves as the primary tool directory and discovery interface. It handles searching, filtering, favorites, and the admin panel.
- **Static HTML Tools:** Each individual tool (located in `public/tools/`) is a self-contained, static HTML page with its own vanilla JavaScript for functionality. This makes tools extremely fast to load, easy to develop, and independent of the main React app's lifecycle.

## 2. Shared Component Injection

To maintain a consistent look and feel, all static tool pages share a universal header, footer, and toolbar. This is achieved via a client-side injection mechanism.

- **`public/shared/shared-injector.js`:** This is the core script responsible for this system. On any tool page, it dynamically fetches and injects the HTML for shared components into designated placeholder elements (`<div data-shared="...">`).
- **Isolation:** This approach ensures that updates to the header or footer can be made in one place (`public/shared/`) and will automatically apply to all 1000+ tools without needing to edit each tool's HTML file. It also means tool developers don'---