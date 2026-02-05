# Lumea APISIX Dashboard

A modern, high-performance, and visually stunning alternative dashboard for Apache APISIX. Built with SvelteKit and optimized for speed and clarity.

![Lumea Theme](https://github.com/user-attachments/assets/...) <!-- Placeholder for actual screenshot -->

## ✨ Features

- **Forced Light Theme**: Ultra-bright, high-contrast interface designed for maximum productivity (using "Lumea" aesthetic).
- **Full Module Coverage**: Manage Routes, Services, Upstreams, Consumers, and SSL/Certificates.
- **Advanced Plugin System**: Marketplace-style UI with smart templates and JSON editing capabilities.
- **Smart Import/Export**: Bulk configuration management with preview capabilities.
- **Admin API Proxy**: Integrated server-side proxy for handling CORS and securing Admin Keys.

## 🚀 Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

### Docker Deployment

1. **Build and start**:
   ```bash
   docker-compose up -d --build
   ```
   The dashboard will be available at [http://localhost:3000](http://localhost:3000).

## 🛠 Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/)
- **Logic**: TypeScript
- **Styling**: Tailwind CSS & DaisyUI
- **Icons**: Lucide Svelte

## 🔐 Security

The dashboard handles APISIX Admin Key security through environment variables and server-side proxying. Ensure your `.env` or Docker environment variables are properly configured.

---

Built with precision for the Apache APISIX ecosystem.
