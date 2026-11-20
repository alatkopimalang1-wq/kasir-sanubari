# Sanubari Roastery Web Platform

> Public-facing ecommerce, brand, and coffee experience website for **Sanubari Roastery** (Malang, East Java).

---

## 🧭 Project Map of Content (Obsidian Vault Hub)

This repository is configured as an **Obsidian Vault**. You can open the root folder in Obsidian to navigate, view graph connections, and edit project documentation.

| Document | Purpose |
| :--- | :--- |
| **[[AGENTS.md]]** | Mandatory guidelines and scope guardrails for development agents |
| **[[docs/ORIGINAL_PROMPT.md]]** | Original client requirements and source of truth |
| **[[docs/IMPLEMENTATION_PLAN.md]]** | Full implementation plan: routes, schema, architecture, phases |
| **[[docs/research/FINDINGS.md]]** | Research findings comparing reference sites (`nircoffee.id` & `sanubariroastery.id`) |
| **[[docs/research/REPORT.generated.md]]** | Automated analysis report and route manifests |

---

## 🎨 Brand Identity

* **Primary (`brand-700`):** `#2E474E`
* **Deep Dark (`brand-900`):** `#1B2B2F`
* **Warm Canvas (`cream-50`):** `#F7F5F0`
* **Accent Warmth (`accent-copper`):** `#B8794A`
* **Neutral Band (`sand-200`):** `#E8E1D4`

---

## 💻 Tech Stack

* **Framework:** Laravel 12
* **Frontend:** Inertia.js v3 + React 19 + TypeScript
* **Styling:** Tailwind CSS v4
* **Database:** SQLite
* **Testing:** Pest PHP
* **Local Development:** http://sanubari.test (Laravel Herd)

---

## ⚡ Quick Start

```bash
# Install PHP & Node dependencies
composer install
npm install

# Setup environment & database
php artisan migrate --seed

# Start development servers
npm run dev
```