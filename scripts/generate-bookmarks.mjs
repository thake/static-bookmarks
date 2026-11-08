import fs from "node:fs/promises";

const categories = {
  "Frontend & Webentwicklung": [
    {
      "name": "Angular Dokumentation",
      "url": "https://angular.dev",
      "description": "Offizielle Dokumentation, Anleitungen und API-Referenz für modernes Angular mit Signals.",
      "tags": [
        "angular",
        "frontend",
        "typescript",
        "signals",
        "web",
        "framework"
      ]
    },
    {
      "name": "Angular Signals Guide",
      "url": "https://angular.dev/guide/signals",
      "description": "Reaktive Primitiven in Angular: signal, computed und effect im Detail.",
      "tags": [
        "angular",
        "signals",
        "reactivity",
        "frontend"
      ]
    },
    {
      "name": "Angular CLI Reference",
      "url": "https://angular.dev/tools/cli",
      "description": "Befehlszeilenwerkzeug zum Initialisieren, Entwickeln, Testen und Warten von Angular-Apps.",
      "tags": [
        "angular",
        "cli",
        "tools",
        "frontend"
      ]
    },
    {
      "name": "MDN Web Docs - JavaScript",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled",
      "description": "Umfassende Ressourcen für Webstandards, HTML, CSS und modernes JavaScript.",
      "tags": [
        "javascript",
        "web",
        "reference",
        "docs",
        "standards",
        "html",
        "css",
        "async"
      ]
    },
    {
      "name": "MDN CSS Grid Leitfaden",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout",
      "description": "Umfangreiche Einführung in CSS Grid Layout mit praktischen Beispielen.",
      "tags": [
        "css",
        "grid",
        "layout",
        "frontend",
        "mdn"
      ]
    },
    {
      "name": "TypeScript Handbuch",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "description": "Vollständiges Handbuch zum TypeScript-Typsystem und Sprachfunktionen.",
      "tags": [
        "typescript",
        "types",
        "compiler",
        "handbook",
        "javascript",
        "docs"
      ]
    },
    {
      "name": "React Dokumentation",
      "url": "https://react.dev",
      "description": "Die offizielle Dokumentation für React mit Fokus auf Funktionskomponenten und Hooks.",
      "tags": [
        "react",
        "frontend",
        "javascript",
        "jsx",
        "components"
      ]
    },
    {
      "name": "Vue.js Dokumentation",
      "url": "https://vuejs.org",
      "description": "Progressives JavaScript-Framework mit Composition API und Single File Components.",
      "tags": [
        "vue",
        "frontend",
        "javascript",
        "framework"
      ]
    },
    {
      "name": "Svelte 5 Docs",
      "url": "https://svelte.dev",
      "description": "Cybernetisch verbessertes Web-Framework mit Runes und kompilierter Reaktivität.",
      "tags": [
        "svelte",
        "runes",
        "frontend",
        "compiler"
      ]
    },
    {
      "name": "Vite Build Tool",
      "url": "https://vite.dev",
      "description": "Extrem schnelles Frontend-Tooling mit nativem ESM und optimiertem Rollup-Build.",
      "tags": [
        "vite",
        "bundler",
        "esm",
        "frontend",
        "build"
      ]
    },
    {
      "name": "Tailwind CSS Dokumentation",
      "url": "https://tailwindcss.com/docs",
      "description": "Utility-first CSS Framework für schnelles und modernes Interface-Design.",
      "tags": [
        "css",
        "tailwind",
        "design",
        "utility",
        "frontend"
      ]
    },
    {
      "name": "Astro Web Framework",
      "url": "https://astro.build",
      "description": "Web-Framework für inhaltsgetriebene Websites mit Zero-JS-Standard und Islands Architecture.",
      "tags": [
        "astro",
        "ssg",
        "islands",
        "frontend",
        "performance"
      ]
    },
    {
      "name": "Next.js Dokumentation",
      "url": "https://nextjs.org/docs",
      "description": "Fullstack-React-Framework mit App Router, Server Components und SSR.",
      "tags": [
        "nextjs",
        "react",
        "fullstack",
        "ssr",
        "frontend"
      ]
    },
    {
      "name": "Nuxt Framework",
      "url": "https://nuxt.com",
      "description": "Intuitives Vue-Framework für universelle Webanwendungen und SSR.",
      "tags": [
        "nuxt",
        "vue",
        "ssr",
        "fullstack",
        "frontend"
      ]
    },
    {
      "name": "SolidJS Reaktivität",
      "url": "https://www.solidjs.com",
      "description": "Deklaratives UI-Framework mit feingranularer Reaktivität ohne Virtual DOM.",
      "tags": [
        "solidjs",
        "reactivity",
        "frontend",
        "performance"
      ]
    },
    {
      "name": "Web Components Guide",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_components",
      "description": "Standardisierte Custom Elements, Shadow DOM und HTML Templates im Browser.",
      "tags": [
        "webcomponents",
        "shadowdom",
        "standards",
        "html"
      ]
    },
    {
      "name": "RxJS Dokumentation",
      "url": "https://rxjs.dev",
      "description": "Reaktive Programmierung für JavaScript mit Observables und Operatoren.",
      "tags": [
        "rxjs",
        "observables",
        "reactive",
        "angular",
        "async"
      ]
    },
    {
      "name": "TanStack Query",
      "url": "https://tanstack.com/query/latest",
      "description": "Leistungsstarkes asynchrones State Management, Caching und Data Fetching für TS/JS.",
      "tags": [
        "tanstack",
        "caching",
        "state",
        "fetch",
        "frontend"
      ]
    },
    {
      "name": "Zustand State Management",
      "url": "https://zustand-demo.pmnd.rs",
      "description": "Kompakte, schnelle und skalierbare State-Management-Lösung ohne Boilerplate.",
      "tags": [
        "zustand",
        "state",
        "react",
        "frontend"
      ]
    },
    {
      "name": "HTMX",
      "url": "https://htmx.org",
      "description": "Zugriff auf AJAX, CSS-Transitions, WebSockets und SSE direkt über HTML-Attribute.",
      "tags": [
        "htmx",
        "html",
        "ajax",
        "frontend",
        "minimalist"
      ]
    },
    {
      "name": "npm Registry",
      "url": "https://www.npmjs.com",
      "description": "Die weltgrößte Paketverwaltung und Registry für JavaScript und Node.js.",
      "tags": [
        "npm",
        "packages",
        "javascript",
        "node"
      ]
    },
    {
      "name": "Bun JavaScript Runtime",
      "url": "https://bun.sh",
      "description": "All-in-one JavaScript Runtime, Paketmanager, Test-Runner und Bundler.",
      "tags": [
        "bun",
        "runtime",
        "javascript",
        "performance"
      ]
    }
  ],
  "Backend & APIs": [
    {
      "name": "Node.js API Referenz",
      "url": "https://nodejs.org/docs/latest/api/",
      "description": "Offizielle API-Dokumentation für Node.js Server-Laufzeitumgebungen.",
      "tags": [
        "nodejs",
        "backend",
        "javascript",
        "runtime",
        "api"
      ]
    },
    {
      "name": "Deno Runtime",
      "url": "https://deno.com",
      "description": "Sichere JavaScript- und TypeScript-Laufzeitumgebung mit integriertem Tooling.",
      "tags": [
        "deno",
        "typescript",
        "runtime",
        "backend"
      ]
    },
    {
      "name": "Express.js Handbuch",
      "url": "https://expressjs.com",
      "description": "Minimalistisches und flexibles Node.js-Webframework für APIs.",
      "tags": [
        "express",
        "nodejs",
        "backend",
        "rest",
        "api"
      ]
    },
    {
      "name": "NestJS Architektur",
      "url": "https://nestjs.com",
      "description": "Progressives Node.js Framework mit Dependency Injection und TypeScript.",
      "tags": [
        "nestjs",
        "typescript",
        "architecture",
        "backend",
        "api"
      ]
    },
    {
      "name": "FastAPI Dokumentation",
      "url": "https://fastapi.tiangolo.com",
      "description": "Modernes, schnelles Web-Framework für Python-APIs mit automatischer Swagger-Doku.",
      "tags": [
        "fastapi",
        "python",
        "backend",
        "api",
        "openapi"
      ]
    },
    {
      "name": "The Rust Book",
      "url": "https://doc.rust-lang.org/book/",
      "description": "Das offizielle Lehrbuch für die Programmiersprache Rust: Ownership, Concurrency & Types.",
      "tags": [
        "rust",
        "systems",
        "concurrency",
        "docs",
        "backend"
      ]
    },
    {
      "name": "Go Dokumentation",
      "url": "https://go.dev/doc/",
      "description": "Offizielle Dokumentation und Tutorials für Google Go (Golang).",
      "tags": [
        "golang",
        "go",
        "backend",
        "concurrency",
        "docs"
      ]
    },
    {
      "name": "Spring Boot Guides",
      "url": "https://spring.io/guides",
      "description": "Umfassende Tutorials und Einstiegshilfen für Java Spring Boot Enterprise-Anwendungen.",
      "tags": [
        "java",
        "spring",
        "backend",
        "enterprise",
        "jvm"
      ]
    },
    {
      "name": "Ruby on Rails Guides",
      "url": "https://guides.rubyonrails.org",
      "description": "Konvention vor Konfiguration: Webentwicklung mit dem klassischen Rails-Framework.",
      "tags": [
        "ruby",
        "rails",
        "backend",
        "fullstack",
        "mvc"
      ]
    },
    {
      "name": "Actix Web (Rust)",
      "url": "https://actix.rs",
      "description": "Leistungsstarkes, pragmatisches und extrem schnelles Webframework für Rust.",
      "tags": [
        "rust",
        "actix",
        "backend",
        "performance",
        "async"
      ]
    },
    {
      "name": "Gin Web Framework (Go)",
      "url": "https://gin-gonic.com",
      "description": "HTTP-Webframework für Go mit Martini-ähnlicher API und 40-facher Performance.",
      "tags": [
        "golang",
        "gin",
        "backend",
        "http",
        "api"
      ]
    },
    {
      "name": "tRPC End-to-End Typesafe APIs",
      "url": "https://trpc.io",
      "description": "Typsichere APIs zwischen Frontend und Backend ohne Code-Generierung.",
      "tags": [
        "trpc",
        "typescript",
        "api",
        "rpc",
        "fullstack"
      ]
    },
    {
      "name": "GraphQL Spezifikation",
      "url": "https://graphql.org",
      "description": "Abfragesprache für APIs und Runtime zur Erfüllung dieser Abfragen mit vorhandenen Daten.",
      "tags": [
        "graphql",
        "api",
        "query",
        "schema",
        "backend"
      ]
    },
    {
      "name": "OpenAPI & Swagger",
      "url": "https://swagger.io/specification/",
      "description": "Standardisierte maschinenlesbare Schnittstellenbeschreibung für REST-APIs.",
      "tags": [
        "openapi",
        "swagger",
        "rest",
        "api",
        "spec"
      ]
    },
    {
      "name": "Hono Web Framework",
      "url": "https://hono.dev",
      "description": "Ultraschnelles, leichtgewichtiges Web-Framework für Cloudflare Workers, Deno, Bun und Node.",
      "tags": [
        "hono",
        "edge",
        "typescript",
        "backend",
        "serverless"
      ]
    },
    {
      "name": "Laravel Dokumentation",
      "url": "https://laravel.com/docs",
      "description": "Elegantes PHP-Web-Framework mit robuster ORM, Queues und Authentifizierung.",
      "tags": [
        "php",
        "laravel",
        "backend",
        "fullstack"
      ]
    },
    {
      "name": "gRPC Docs",
      "url": "https://grpc.io/docs/",
      "description": "Hochmodernes Open-Source RPC-Framework für Microservices über HTTP/2.",
      "tags": [
        "grpc",
        "protobuf",
        "microservices",
        "rpc",
        "backend"
      ]
    },
    {
      "name": "Django Web Framework",
      "url": "https://www.djangoproject.com",
      "description": "High-Level Python Web Framework für schnelle Entwicklung und sauberes Design.",
      "tags": [
        "python",
        "django",
        "backend",
        "orm",
        "mvc"
      ]
    },
    {
      "name": "Axum Web Framework (Rust)",
      "url": "https://github.com/tokio-rs/axum",
      "description": "Ergonomisches und modulares Webframework für Rust auf Basis von Tokio und Tower.",
      "tags": [
        "rust",
        "tokio",
        "axum",
        "async",
        "backend"
      ]
    }
  ],
  "Tools & Utilities": [
    {
      "name": "Regex101",
      "url": "https://regex101.com",
      "description": "Interaktiver Tester und Debugger für reguläre Ausdrücke mit detaillierter RegEx-Erklärung.",
      "tags": [
        "regex",
        "tools",
        "debugger",
        "testing"
      ]
    },
    {
      "name": "Can I Use Browser Support Tables",
      "url": "https://caniuse.com/ciu/comparison/long-custom-parameter-path-for-checking-browser-compatibility-features",
      "description": "Aktuelle Tabellen zur Browserunterstützung moderner Webtechnologien.",
      "tags": [
        "browsers",
        "compatibility",
        "css",
        "html",
        "specs",
        "tables",
        "support"
      ]
    },
    {
      "name": "Excalidraw",
      "url": "https://excalidraw.com",
      "description": "Virtuelles Whiteboard für handgezeichnet wirkende Skizzen, Architekturen und Diagramme.",
      "tags": [
        "diagrams",
        "design",
        "whiteboard",
        "canvas"
      ]
    },
    {
      "name": "JSON Crack",
      "url": "https://jsoncrack.com",
      "description": "Interaktive Visualisierung komplexer JSON-Datenstrukturen als Graph.",
      "tags": [
        "json",
        "visualization",
        "tools",
        "graph"
      ]
    },
    {
      "name": "Hoppscotch API Client",
      "url": "https://hoppscotch.io",
      "description": "Open-Source webbasierter API-Entwicklungs- und Test-Client (Postman Alternative).",
      "tags": [
        "api",
        "http",
        "rest",
        "graphql",
        "tools"
      ]
    },
    {
      "name": "DevDocs API Documentation",
      "url": "https://devdocs.io",
      "description": "Schnelle, strukturierte und offline-fähige Suche über hunderte Entwickler-Dokumentationen.",
      "tags": [
        "docs",
        "offline",
        "search",
        "reference",
        "tools"
      ]
    },
    {
      "name": "CyberChef The Cyber Swiss Army Knife",
      "url": "https://gchq.github.io/CyberChef/",
      "description": "Vielseitiges Web-Tool zum Ver-/Entschlüsseln, Parsen, Hashen und Konvertieren von Daten.",
      "tags": [
        "crypto",
        "encoding",
        "security",
        "conversion",
        "tools"
      ]
    },
    {
      "name": "Bundlephobia",
      "url": "https://bundlephobia.com",
      "description": "Analysiert die Bundle-Größe und Abhängigkeiten von beliebigen npm-Paketen.",
      "tags": [
        "npm",
        "bundle",
        "size",
        "performance",
        "javascript"
      ]
    },
    {
      "name": "Diffchecker",
      "url": "https://www.diffchecker.com",
      "description": "Online-Diff-Werkzeug zum visuellen Vergleichen von Texten, Code, Bildern und PDFs.",
      "tags": [
        "diff",
        "compare",
        "text",
        "tools"
      ]
    },
    {
      "name": "Squoosh Image Optimizer",
      "url": "https://squoosh.app",
      "description": "Web-App von Google zur visuellen Bildkomprimierung mit WebP, AVIF und MozJPEG.",
      "tags": [
        "images",
        "compression",
        "webp",
        "avif",
        "performance"
      ]
    },
    {
      "name": "Webhook.site",
      "url": "https://webhook.site",
      "description": "Sofortige temporäre URLs zum Testen und Inspizieren eingehender HTTP-Webhooks.",
      "tags": [
        "webhooks",
        "http",
        "testing",
        "debugging"
      ]
    },
    {
      "name": "Transform Tools",
      "url": "https://transform.tools",
      "description": "Mehrzweck-Konverter: JSON zu TypeScript, SVG zu JSX, HTML zu JSX und mehr.",
      "tags": [
        "converter",
        "typescript",
        "json",
        "svg",
        "tools"
      ]
    },
    {
      "name": "Epoch Converter",
      "url": "https://www.epochconverter.com",
      "description": "Sekundenschnelle Umrechnung von Unix-Timestamps in menschenlesbare Datumsformate.",
      "tags": [
        "timestamp",
        "time",
        "date",
        "converter"
      ]
    },
    {
      "name": "JWT.io Token Debugger",
      "url": "https://jwt.io",
      "description": "Interaktives Dekodieren, Überprüfen und Erzeugen von JSON Web Tokens.",
      "tags": [
        "jwt",
        "tokens",
        "security",
        "auth",
        "debugger"
      ]
    },
    {
      "name": "Carbon Code Image Generator",
      "url": "https://carbon.now.sh",
      "description": "Erstellt ansprechende Screenshots von Code-Snippets für Präsentationen und Social Media.",
      "tags": [
        "code",
        "screenshots",
        "images",
        "sharing"
      ]
    },
    {
      "name": "Roadmap.sh Developer Roadmaps",
      "url": "https://roadmap.sh",
      "description": "Interaktive Lernpfade und Orientierungspläne für Frontend-, Backend- und DevOps-Rollen.",
      "tags": [
        "learning",
        "career",
        "roadmaps",
        "developer"
      ]
    },
    {
      "name": "StackBlitz Online IDE",
      "url": "https://stackblitz.com",
      "description": "Sofortige Fullstack-Web-Entwicklungsumgebung im Browser powered by WebContainers.",
      "tags": [
        "ide",
        "sandbox",
        "webcontainers",
        "browser",
        "tools"
      ]
    },
    {
      "name": "CodeSandbox",
      "url": "https://codesandbox.io",
      "description": "Cloud-Entwicklungsplattform zum schnellen Prototyping und Teilen von Web-Apps.",
      "tags": [
        "sandbox",
        "ide",
        "prototyping",
        "tools"
      ]
    },
    {
      "name": "Crontab Guru",
      "url": "https://crontab.guru",
      "description": "Einfacher und übersichtlicher Editor und Rechner für Cron-Zeitplanausdrücke.",
      "tags": [
        "cron",
        "scheduler",
        "devops",
        "tools"
      ]
    }
  ],
  "Cloud, DevOps & Infrastructure": [
    {
      "name": "GitHub",
      "url": "https://github.com",
      "description": "Code-Hosting, Pull-Requests, CI/CD Actions und weltweites Open-Source-Ökosystem.",
      "tags": [
        "git",
        "code",
        "vcs",
        "collaboration"
      ]
    },
    {
      "name": "GitHub Trending Repositories",
      "url": "https://github.com/trending",
      "description": "Die beliebtesten und am schnellsten wachsenden Open-Source-Repositories auf GitHub.",
      "tags": [
        "git",
        "trending",
        "opensource",
        "community"
      ]
    },
    {
      "name": "GitHub Actions Documentation",
      "url": "https://docs.github.com/actions",
      "description": "Automatisierung von Build-, Test- und Deployment-Workflows direkt in GitHub.",
      "tags": [
        "git",
        "cicd",
        "automation",
        "devops"
      ]
    },
    {
      "name": "GitLab Platform",
      "url": "https://about.gitlab.com",
      "description": "Umfassende DevSecOps-Plattform mit integriertem Git-Repository, CI/CD und Security-Scans.",
      "tags": [
        "gitlab",
        "git",
        "cicd",
        "devops"
      ]
    },
    {
      "name": "Docker Dokumentation",
      "url": "https://docs.docker.com",
      "description": "Anleitungen und Referenzen zur Containerisierung von Software mit Docker und Compose.",
      "tags": [
        "docker",
        "containers",
        "devops",
        "infrastructure"
      ]
    },
    {
      "name": "Docker Hub Registry",
      "url": "https://hub.docker.com",
      "description": "Die weltweit führende Registry für Container-Images und offizielle Base-Images.",
      "tags": [
        "docker",
        "containers",
        "registry",
        "images"
      ]
    },
    {
      "name": "Kubernetes Dokumentation",
      "url": "https://kubernetes.io/docs/home/",
      "description": "Container-Orchestrierung im Produktivmaßstab: Pods, Services, Deployments und Ingress.",
      "tags": [
        "kubernetes",
        "k8s",
        "orchestration",
        "cloud",
        "containers"
      ]
    },
    {
      "name": "Terraform Dokumentation",
      "url": "https://developer.hashicorp.com/terraform",
      "description": "Infrastructure as Code (IaC) zur deklarativen Bereitstellung von Cloud-Ressourcen.",
      "tags": [
        "terraform",
        "iac",
        "cloud",
        "hashicorp",
        "devops"
      ]
    },
    {
      "name": "Cloudflare Dashboard",
      "url": "https://dash.cloudflare.com",
      "description": "Edge-Netzwerk, DNS, CDN, DDoS-Schutz, SSL-Zertifikate und Cloudflare Workers.",
      "tags": [
        "cloudflare",
        "cdn",
        "dns",
        "edge",
        "security"
      ]
    },
    {
      "name": "Vercel Platform",
      "url": "https://vercel.com",
      "description": "Frontend-Cloud für schnelle Deployments, Preview-URLs und globale Serverless-Edges.",
      "tags": [
        "vercel",
        "hosting",
        "frontend",
        "serverless",
        "nextjs"
      ]
    },
    {
      "name": "Netlify Plattform",
      "url": "https://www.netlify.com",
      "description": "Entwickler-Plattform für moderne Webprojekte, Continuous Deployment und Serverless Functions.",
      "tags": [
        "netlify",
        "hosting",
        "jamstack",
        "cicd"
      ]
    },
    {
      "name": "Prometheus Monitoring",
      "url": "https://prometheus.io",
      "description": "Open-Source-Monitoring-System mit Time-Series-Datenbank und Alerting-Regeln.",
      "tags": [
        "prometheus",
        "monitoring",
        "metrics",
        "devops"
      ]
    },
    {
      "name": "Grafana Dashboards",
      "url": "https://grafana.com",
      "description": "Plattform für Observability, visuelle Metrik-Dashboards und Log-Analysen.",
      "tags": [
        "grafana",
        "observability",
        "metrics",
        "dashboards"
      ]
    },
    {
      "name": "Ansible Documentation",
      "url": "https://docs.ansible.com",
      "description": "Agentenlose IT-Automatisierung für Konfigurationsmanagement und Orchestrierung.",
      "tags": [
        "ansible",
        "automation",
        "devops",
        "sysadmin"
      ]
    },
    {
      "name": "Helm Package Manager",
      "url": "https://helm.sh",
      "description": "Der Standard-Paketmanager für Kubernetes zur Verwaltung von Applikations-Charts.",
      "tags": [
        "helm",
        "kubernetes",
        "packages",
        "devops"
      ]
    },
    {
      "name": "Nginx Dokumentation",
      "url": "https://nginx.org/en/docs/",
      "description": "Leistungsfähiger HTTP-Webserver, Reverse-Proxy und Load-Balancer.",
      "tags": [
        "nginx",
        "proxy",
        "server",
        "http",
        "infrastructure"
      ]
    },
    {
      "name": "Traefik Reverse Proxy",
      "url": "https://traefik.io",
      "description": "Moderner Cloud-nativer Edge-Router mit automatischer Service Discovery.",
      "tags": [
        "traefik",
        "proxy",
        "docker",
        "cloud",
        "networking"
      ]
    },
    {
      "name": "Caddy Web Server",
      "url": "https://caddyserver.com",
      "description": "Leistungsstarker Unternehmens-Webserver mit automatischer HTTPS-Zertifizierung via Let's Encrypt.",
      "tags": [
        "caddy",
        "https",
        "server",
        "proxy"
      ]
    },
    {
      "name": "AWS Management Console",
      "url": "https://aws.amazon.com/console/",
      "description": "Verwaltungskonsole für alle Amazon Web Services wie S3, EC2, Lambda und ECS.",
      "tags": [
        "aws",
        "cloud",
        "amazon",
        "serverless",
        "devops"
      ]
    },
    {
      "name": "Argo CD GitOps",
      "url": "https://argo-cd.readthedocs.io",
      "description": "Deklaratives, GitOps-basiertes Continuous Delivery Tool für Kubernetes-Cluster.",
      "tags": [
        "argocd",
        "gitops",
        "kubernetes",
        "cicd"
      ]
    }
  ],
  "Datenbanken & Storage": [
    {
      "name": "PostgreSQL Dokumentation",
      "url": "https://www.postgresql.org/docs/",
      "description": "Die weltweit fortschrittlichste Open-Source relationale Datenbank mit JSONB und Erweiterungen.",
      "tags": [
        "postgresql",
        "sql",
        "database",
        "relational",
        "backend"
      ]
    },
    {
      "name": "SQLite Home Page",
      "url": "https://www.sqlite.org",
      "description": "Leichtgewichtige, serverlose und dateibasierte relationale SQL-Datenbank-Engine.",
      "tags": [
        "sqlite",
        "sql",
        "database",
        "embedded"
      ]
    },
    {
      "name": "Redis Dokumentation",
      "url": "https://redis.io/docs/",
      "description": "In-Memory Datenspeicher für Caching, Message-Broker und Hochleistungs-Streaming.",
      "tags": [
        "redis",
        "cache",
        "nosql",
        "in-memory",
        "database"
      ]
    },
    {
      "name": "MongoDB Handbuch",
      "url": "https://www.mongodb.com/docs/",
      "description": "Dokumentenorientierte NoSQL-Datenbank für flexibles Schema und horizontale Skalierung.",
      "tags": [
        "mongodb",
        "nosql",
        "database",
        "json",
        "backend"
      ]
    },
    {
      "name": "Supabase Open Source Firebase",
      "url": "https://supabase.com",
      "description": "PostgreSQL-Backend-as-a-Service mit Auth, Realtime-Subscriptions und Storage.",
      "tags": [
        "supabase",
        "postgresql",
        "baas",
        "auth",
        "database"
      ]
    },
    {
      "name": "Prisma ORM Docs",
      "url": "https://www.prisma.io/docs",
      "description": "Modernes Typsicheres ORM für TypeScript & Node.js mit automatischen Migrationen.",
      "tags": [
        "prisma",
        "orm",
        "typescript",
        "database",
        "sql"
      ]
    },
    {
      "name": "Drizzle ORM",
      "url": "https://orm.drizzle.team",
      "description": "Leichtgewichtiges, performantes TypeScript-ORM ohne Over-Engineering mit SQL-Syntax.",
      "tags": [
        "drizzle",
        "orm",
        "typescript",
        "sql",
        "database"
      ]
    },
    {
      "name": "MySQL Dokumentation",
      "url": "https://dev.mysql.com/doc/",
      "description": "Verbreitete Open-Source SQL-Datenbank für Webanwendungen.",
      "tags": [
        "mysql",
        "sql",
        "database",
        "relational"
      ]
    },
    {
      "name": "ClickHouse Fast DBMS",
      "url": "https://clickhouse.com/docs",
      "description": "Spaltenorientiertes DBMS für Echtzeit-Analysen von Milliarden von Datenzeilen.",
      "tags": [
        "clickhouse",
        "analytics",
        "olap",
        "bigdata",
        "database"
      ]
    },
    {
      "name": "Elasticsearch Guide",
      "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html",
      "description": "Verteilte Volltext-Such- und Analyse-Engine auf Basis von Apache Lucene.",
      "tags": [
        "elasticsearch",
        "search",
        "analytics",
        "lucene"
      ]
    },
    {
      "name": "DuckDB Analytical SQL",
      "url": "https://duckdb.org",
      "description": "In-Process SQL OLAP Datenbank-Managementsystem für schnelle lokale Datenanalyse.",
      "tags": [
        "duckdb",
        "olap",
        "analytics",
        "sql",
        "python"
      ]
    },
    {
      "name": "Neon Serverless Postgres",
      "url": "https://neon.tech",
      "description": "Vollständig serverlose PostgreSQL-Plattform mit Instant-Branching und Skalierung auf Null.",
      "tags": [
        "neon",
        "postgresql",
        "serverless",
        "cloud",
        "database"
      ]
    },
    {
      "name": "Apache Kafka",
      "url": "https://kafka.apache.org",
      "description": "Verteilte Event-Streaming-Plattform für Hochleistungs-Datenpipelines und Streaming Analytics.",
      "tags": [
        "kafka",
        "streaming",
        "events",
        "queue",
        "bigdata"
      ]
    },
    {
      "name": "RabbitMQ Message Broker",
      "url": "https://www.rabbitmq.com",
      "description": "Zuverlässiger und robuster Message Broker mit Unterstützung für AMQP, MQTT und STOMP.",
      "tags": [
        "rabbitmq",
        "amqp",
        "queue",
        "messages",
        "backend"
      ]
    },
    {
      "name": "Meilisearch Fast Search",
      "url": "https://www.meilisearch.com",
      "description": "Blitzschnelle, fehlertolerante Open-Source-Suchmaschine mit exzellenter Developer Experience.",
      "tags": [
        "search",
        "meilisearch",
        "typo-tolerance",
        "backend"
      ]
    }
  ],
  "Security & Privacy": [
    {
      "name": "OWASP Top Ten",
      "url": "https://owasp.org/www-project-top-ten/",
      "description": "Standardmäßiges Sicherheitsbewusstsein für die kritischsten Web-Sicherheitsrisiken.",
      "tags": [
        "security",
        "owasp",
        "vulnerabilities",
        "web",
        "best-practices"
      ]
    },
    {
      "name": "Have I Been Pwned",
      "url": "https://haveibeenpwned.com",
      "description": "Überprüfung, ob E-Mail-Adressen oder Passwörter in bekannten Datenlecks aufgetaucht sind.",
      "tags": [
        "security",
        "passwords",
        "breaches",
        "privacy"
      ]
    },
    {
      "name": "Let's Encrypt CA",
      "url": "https://letsencrypt.org",
      "description": "Freie, automatisierte und offene Zertifizierungsstelle für TLS/SSL-Zertifikate.",
      "tags": [
        "ssl",
        "tls",
        "certificates",
        "security",
        "https"
      ]
    },
    {
      "name": "Snyk Security Scanner",
      "url": "https://snyk.io",
      "description": "Entwickler-orientierte Sicherheitsplattform zum Finden und Beheben von Open-Source-Schwachstellen.",
      "tags": [
        "snyk",
        "security",
        "vulnerabilities",
        "dependencies"
      ]
    },
    {
      "name": "Keycloak IAM",
      "url": "https://www.keycloak.org",
      "description": "Open-Source-Identity- und Access-Management mit Single Sign-On (SSO) und OpenID Connect.",
      "tags": [
        "keycloak",
        "iam",
        "sso",
        "oauth",
        "security",
        "auth"
      ]
    },
    {
      "name": "SonarQube Code Quality",
      "url": "https://www.sonarsource.com/products/sonarqube/",
      "description": "Statische Code-Analyse zur Identifizierung von Bugs, Sicherheitslücken und Code-Smells.",
      "tags": [
        "quality",
        "security",
        "analysis",
        "code-smell"
      ]
    },
    {
      "name": "1Password",
      "url": "https://1password.com",
      "description": "Sicherer Passwort-Manager für Teams und Einzelanwender mit Secret-Management.",
      "tags": [
        "security",
        "passwords",
        "secrets",
        "privacy"
      ]
    },
    {
      "name": "Bitwarden Open Source",
      "url": "https://bitwarden.com",
      "description": "Open-Source-Passwortmanager mit Ende-zu-Ende-Verschlüsselung.",
      "tags": [
        "bitwarden",
        "passwords",
        "opensource",
        "security"
      ]
    },
    {
      "name": "Mozilla SSL Configuration Generator",
      "url": "https://ssl-config.mozilla.org",
      "description": "Empfohlene Best-Practice TLS-Konfigurationen für Nginx, Apache und HAProxy.",
      "tags": [
        "ssl",
        "tls",
        "security",
        "nginx",
        "mozilla"
      ]
    },
    {
      "name": "Censys Search Engine",
      "url": "https://censys.com",
      "description": "Suchmaschine für Internet-verbundene Server, Zertifikate und Angriffsflächen.",
      "tags": [
        "security",
        "recon",
        "certificates",
        "scanners"
      ]
    },
    {
      "name": "HashiCorp Vault",
      "url": "https://www.vaultproject.io",
      "description": "Sichere Verwaltung von Secrets, Verschlüsselungsschlüsseln und Zugriffszertifikaten.",
      "tags": [
        "vault",
        "secrets",
        "hashicorp",
        "security",
        "devops"
      ]
    },
    {
      "name": "Trivy Vulnerability Scanner",
      "url": "https://aquasecurity.github.io/trivy/",
      "description": "Umfassender Sicherheitsscanner für Container-Images, Dateisysteme und Git-Repositories.",
      "tags": [
        "trivy",
        "scanner",
        "containers",
        "security",
        "devops"
      ]
    }
  ],
  "Design, UI & UX": [
    {
      "name": "Figma Design Tool",
      "url": "https://www.figma.com",
      "description": "Kollaboratives webbasiertes UI/UX-Design- und Prototyping-Werkzeug.",
      "tags": [
        "figma",
        "design",
        "ui",
        "ux",
        "prototyping"
      ]
    },
    {
      "name": "Lucide Open Source Icons",
      "url": "https://lucide.dev",
      "description": "Schöne und konsistente Icon-Bibliothek für moderne Webanwendungen (Feather Fork).",
      "tags": [
        "icons",
        "svg",
        "ui",
        "design",
        "frontend"
      ]
    },
    {
      "name": "Font Awesome Icons",
      "url": "https://fontawesome.com",
      "description": "Die populärste Icon-Sammlung und Toolkit für Vektor-Icons im Web.",
      "tags": [
        "icons",
        "svg",
        "design",
        "web"
      ]
    },
    {
      "name": "Coolors Farbpaletten",
      "url": "https://coolors.co",
      "description": "Extrem schneller Farbpaletten-Generator für Designer und Webentwickler.",
      "tags": [
        "colors",
        "palette",
        "design",
        "generator"
      ]
    },
    {
      "name": "Unsplash Kostenlose Fotos",
      "url": "https://unsplash.com",
      "description": "Hochauflösende, lizenzfreie Fotografien für Mockups und kommerzielle Projekte.",
      "tags": [
        "photos",
        "images",
        "assets",
        "free"
      ]
    },
    {
      "name": "Mobbin Mobile & Web Patterns",
      "url": "https://mobbin.com",
      "description": "Umfangreiche Referenz-Bibliothek für echte UI-Screens, UX-Flows und Interaktionsmuster.",
      "tags": [
        "ux",
        "ui",
        "patterns",
        "inspiration",
        "mobile"
      ]
    },
    {
      "name": "Storybook Komponententests",
      "url": "https://storybook.js.org",
      "description": "Frontend-Entwicklungs- und Dokumentationsumgebung für isolierte UI-Komponenten.",
      "tags": [
        "storybook",
        "components",
        "design-system",
        "testing"
      ]
    },
    {
      "name": "Radix UI Unstyled Primitives",
      "url": "https://www.radix-ui.com",
      "description": "Barrierefreie, ungestylte UI-Komponenten für hochwertige Designsysteme.",
      "tags": [
        "radix",
        "accessibility",
        "a11y",
        "primitives",
        "react"
      ]
    },
    {
      "name": "Open Props Modern CSS",
      "url": "https://open-props.style",
      "description": "CSS Custom Properties für moderne Farben, Typografie, Animationen und Spacing.",
      "tags": [
        "css",
        "custom-properties",
        "design-tokens",
        "frontend"
      ]
    },
    {
      "name": "Google Fonts",
      "url": "https://fonts.google.com",
      "description": "Verzeichnis freier, quelloffener Schriftarten mit einfacher Web-Einbindung.",
      "tags": [
        "fonts",
        "typography",
        "design",
        "google"
      ]
    },
    {
      "name": "Dribbble Design Inspiration",
      "url": "https://dribbble.com",
      "description": "Präsentationsplattform und Community für Grafikdesigner, UI/UX-Profis und Illustratoren.",
      "tags": [
        "inspiration",
        "design",
        "ui",
        "portfolio"
      ]
    },
    {
      "name": "SVGOMG SVGO Web Interface",
      "url": "https://jakearchibald.github.io/svgomg/",
      "description": "Web-App von Jake Archibald zur visuellen und verlustfreien Optimierung von SVG-Dateien.",
      "tags": [
        "svg",
        "optimization",
        "cleaner",
        "tools"
      ]
    },
    {
      "name": "Heroicons by Tailwind Labs",
      "url": "https://heroicons.com",
      "description": "Wunderschön handgefertigte SVG-Icons von den Machern von Tailwind CSS.",
      "tags": [
        "icons",
        "svg",
        "tailwind",
        "design"
      ]
    },
    {
      "name": "Realtime Colors",
      "url": "https://www.realtimecolors.com",
      "description": "Visualisiere Farbschemata und Typografie in Echtzeit auf einer echten Website.",
      "tags": [
        "colors",
        "palette",
        "contrast",
        "design"
      ]
    }
  ],
  "Testing & Qualitätssicherung": [
    {
      "name": "Playwright End-to-End Testing",
      "url": "https://playwright.dev",
      "description": "Schnelle, zuverlässige E2E-Tests für alle modernen Browser mit automatischer Wartezeit.",
      "tags": [
        "testing",
        "e2e",
        "playwright",
        "automation",
        "browsers"
      ]
    },
    {
      "name": "Vitest Next-Gen Test Runner",
      "url": "https://vitest.dev",
      "description": "Extrem schneller Unit-Test-Runner auf Basis von Vite mit nativer ESM- und TypeScript-Unterstützung.",
      "tags": [
        "vitest",
        "unit-testing",
        "vite",
        "typescript",
        "testing"
      ]
    },
    {
      "name": "Cypress Testing Framework",
      "url": "https://www.cypress.io",
      "description": "Frontend-Test-Tool für moderne Webanwendungen mit visueller Zeitreise-Fehlerbehebung.",
      "tags": [
        "testing",
        "e2e",
        "cypress",
        "frontend"
      ]
    },
    {
      "name": "Jest JavaScript Testing",
      "url": "https://jestjs.io",
      "description": "Populäres Test-Framework mit Fokus auf Einfachheit und Snapshot-Testing.",
      "tags": [
        "jest",
        "testing",
        "unit",
        "javascript"
      ]
    },
    {
      "name": "Testing Library",
      "url": "https://testing-library.com",
      "description": "Einfache und vollständige Test-Utilities, die gute Testpraktiken fördern (DOM, Angular, React).",
      "tags": [
        "testing",
        "dom",
        "accessibility",
        "best-practices"
      ]
    },
    {
      "name": "k6 Load & Performance Testing",
      "url": "https://k6.io",
      "description": "Entwicklerzentriertes Lasttest-Tool von Grafana zum Testen der Systemstabilität.",
      "tags": [
        "load-testing",
        "performance",
        "k6",
        "qa"
      ]
    },
    {
      "name": "Google Lighthouse",
      "url": "https://developer.chrome.com/docs/lighthouse/overview/",
      "description": "Automatisiertes Open-Source-Tool zur Verbesserung der Qualität von Webseiten (Performance, SEO, A11y).",
      "tags": [
        "performance",
        "seo",
        "accessibility",
        "audit",
        "lighthouse"
      ]
    },
    {
      "name": "Mockoon Local Mock Servers",
      "url": "https://mockoon.com",
      "description": "Der einfachste und schnellste Weg, lokale Mock-APIs und Server bereitzustellen.",
      "tags": [
        "mocking",
        "api",
        "testing",
        "tools"
      ]
    },
    {
      "name": "Axe Accessibility Checker",
      "url": "https://www.deque.com/axe/",
      "description": "Weltweiter Standard für digitale Barrierefreiheitstests (a11y) und WCAG-Konformität.",
      "tags": [
        "a11y",
        "accessibility",
        "wcag",
        "audit"
      ]
    },
    {
      "name": "Chaos Mesh",
      "url": "https://chaos-mesh.org",
      "description": "Cloud-native Chaos-Engineering-Plattform für Kubernetes zur Simulation von Systemausfällen.",
      "tags": [
        "chaos-engineering",
        "kubernetes",
        "testing",
        "resilience"
      ]
    },
    {
      "name": "WebPageTest Performance Audit",
      "url": "https://www.webpagetest.org",
      "description": "Tiefgehende Performance-Messungen von echten Geräten und Standorten weltweit.",
      "tags": [
        "performance",
        "audit",
        "cwv",
        "speed"
      ]
    },
    {
      "name": "MSW Mock Service Worker",
      "url": "https://mswjs.io",
      "description": "Nahtloses API-Mocking auf Netzwerkebene für Browser und Node.js-Tests.",
      "tags": [
        "mocking",
        "api",
        "testing",
        "msw",
        "javascript"
      ]
    }
  ],
  "KI & Machine Learning": [
    {
      "name": "Hugging Face Hub",
      "url": "https://huggingface.co",
      "description": "Die zentrale Plattform für Open-Source Machine-Learning-Modelle, Datensätze und Demos.",
      "tags": [
        "ai",
        "machine-learning",
        "models",
        "nlp",
        "llm"
      ]
    },
    {
      "name": "PyTorch Dokumentation",
      "url": "https://pytorch.org",
      "description": "Führendes Open-Source Deep-Learning-Framework für Forschung und Produktion.",
      "tags": [
        "pytorch",
        "deep-learning",
        "python",
        "ai"
      ]
    },
    {
      "name": "TensorFlow Guides",
      "url": "https://www.tensorflow.org",
      "description": "Umfassende End-to-End-Plattform für maschinelles Lernen von Google.",
      "tags": [
        "tensorflow",
        "machine-learning",
        "google",
        "ai"
      ]
    },
    {
      "name": "Ollama Local LLMs",
      "url": "https://ollama.com",
      "description": "Lokale Ausführung von großen Sprachmodellen (Llama 3, Mistral, Gemma) auf dem eigenen Rechner.",
      "tags": [
        "ollama",
        "llm",
        "local-ai",
        "privacy",
        "tools"
      ]
    },
    {
      "name": "LangChain Dokumentation",
      "url": "https://www.langchain.com",
      "description": "Framework zur Erstellung von Anwendungen mit Sprachmodellen und Agents.",
      "tags": [
        "langchain",
        "agents",
        "llm",
        "ai",
        "python"
      ]
    },
    {
      "name": "OpenAI Plattform Doku",
      "url": "https://platform.openai.com/docs/",
      "description": "API-Dokumentation für GPT-Modelle, Embeddings, DALL-E und Audio-Transkription.",
      "tags": [
        "openai",
        "gpt",
        "api",
        "llm",
        "ai"
      ]
    },
    {
      "name": "Kaggle Data Science",
      "url": "https://www.kaggle.com",
      "description": "Community für Data Scientists mit Wettbewerben, Datensätzen und Jupyter-Notebooks.",
      "tags": [
        "datascience",
        "machine-learning",
        "python",
        "datasets"
      ]
    },
    {
      "name": "Papers With Code",
      "url": "https://paperswithcode.com",
      "description": "Wissenschaftliche ML-Veröffentlichungen verknüpft mit offiziellen Code-Implementierungen.",
      "tags": [
        "research",
        "papers",
        "ai",
        "benchmarks"
      ]
    },
    {
      "name": "vLLM Fast Inference",
      "url": "https://docs.vllm.ai",
      "description": "Extrem schneller und speichereffizienter LLM-Inferenz- und Serving-Engine mit PagedAttention.",
      "tags": [
        "llm",
        "serving",
        "inference",
        "performance",
        "ai"
      ]
    },
    {
      "name": "Weaviate Vektordatenbank",
      "url": "https://weaviate.io",
      "description": "Open-Source-Vektordatenbank für semantische Suche und RAG-Anwendungen.",
      "tags": [
        "vector-db",
        "rag",
        "search",
        "embeddings",
        "ai"
      ]
    },
    {
      "name": "Pinecone Vector Database",
      "url": "https://www.pinecone.io",
      "description": "Verwaltete Vektordatenbank für KI-Anwendungen, semantische Ähnlichkeit und Recommendation-Engines.",
      "tags": [
        "pinecone",
        "vector-db",
        "ai",
        "embeddings"
      ]
    },
    {
      "name": "Groq Fast LPU Inference",
      "url": "https://groq.com",
      "description": "Ultraschnelle LLM-Inferenz-Hardware (LPU) mit Hunderten von Tokens pro Sekunde.",
      "tags": [
        "groq",
        "inference",
        "llm",
        "hardware",
        "ai"
      ]
    }
  ],
  "News, Blogs & Community": [
    {
      "name": "Hacker News",
      "url": "https://news.ycombinator.com",
      "description": "Social News Website von Y Combinator mit Fokus auf Informatik, Tech-Trends und Startups.",
      "tags": [
        "news",
        "tech",
        "startup",
        "community"
      ]
    },
    {
      "name": "web.dev Modern Web Guidance & Core Web Vitals",
      "url": "https://web.dev/explore/fast",
      "description": "Leitfäden von Google und moderne Best Practices für Performance, LCP und Core Web Vitals.",
      "tags": [
        "performance",
        "cwv",
        "lcp",
        "web",
        "guidance"
      ]
    },
    {
      "name": "Lobsters Community",
      "url": "https://lobste.rs",
      "description": "Technik- und entwicklerzentrierte Community mit Einladungsprinzip und fundierten Diskussionen.",
      "tags": [
        "news",
        "tech",
        "programming",
        "community"
      ]
    },
    {
      "name": "Stack Overflow",
      "url": "https://stackoverflow.com",
      "description": "Die größte Frage-und-Antwort-Plattform für Programmierer weltweit.",
      "tags": [
        "q-and-a",
        "programming",
        "troubleshooting",
        "community"
      ]
    },
    {
      "name": "Dev.to Community",
      "url": "https://dev.to",
      "description": "Konstruktive und integrative Community für Softwareentwickler zum Teilen von Fachartikeln.",
      "tags": [
        "blog",
        "community",
        "learning",
        "articles"
      ]
    },
    {
      "name": "Heise Online Developer",
      "url": "https://www.heise.de/developer/",
      "description": "Deutsche Fachnachrichten, Hintergrundberichte und Analysen rund um Softwareentwicklung.",
      "tags": [
        "news",
        "german",
        "tech",
        "developer"
      ]
    },
    {
      "name": "Golem.de IT-News",
      "url": "https://www.golem.de",
      "description": "Deutsches IT-Nachrichtenmagazin für Profis zu Hardware, Software, Security und Netzwelt.",
      "tags": [
        "news",
        "german",
        "it",
        "security"
      ]
    },
    {
      "name": "The Changelog Podcast & News",
      "url": "https://changelog.com",
      "description": "Podcasts und News über die Open-Source-Welt, Software-Architektur und Software-Pioniere.",
      "tags": [
        "podcasts",
        "opensource",
        "audio",
        "news"
      ]
    },
    {
      "name": "Smashing Magazine",
      "url": "https://www.smashingmagazine.com",
      "description": "Hochwertige Fachartikel für Webdesigner und Frontend-Entwickler.",
      "tags": [
        "design",
        "css",
        "frontend",
        "web",
        "articles"
      ]
    },
    {
      "name": "CSS-Tricks",
      "url": "https://css-tricks.com",
      "description": "Klassische Anleitungen, Tricks und Almanach für CSS, Flexbox und responsives Webdesign.",
      "tags": [
        "css",
        "styling",
        "frontend",
        "tips"
      ]
    },
    {
      "name": "GitHub Changelog",
      "url": "https://github.blog/changelog/",
      "description": "Offizielle Ankündigungen und Neuerungen aller Features und APIs auf GitHub.",
      "tags": [
        "github",
        "changelog",
        "updates",
        "tools"
      ]
    },
    {
      "name": "Reddit r/programming",
      "url": "https://www.reddit.com/r/programming/",
      "description": "Diskussionen, Neuigkeiten und tiefe Einblicke in Algorithmen und Programmiersprachen.",
      "tags": [
        "reddit",
        "community",
        "programming",
        "discussions"
      ]
    },
    {
      "name": "TLDR Newsletter",
      "url": "https://tldr.tech",
      "description": "Kompakter täglicher Newsletter mit den wichtigsten Nachrichten aus Tech, Science und Coding.",
      "tags": [
        "newsletter",
        "tldr",
        "news",
        "tech"
      ]
    },
    {
      "name": "InfoQ Software Architecture",
      "url": "https://www.infoq.com",
      "description": "Fachbeiträge und Konferenzvorträge für Softwarearchitekten und Senior Engineers.",
      "tags": [
        "architecture",
        "enterprise",
        "engineering",
        "news"
      ]
    }
  ]
};

let total = 0;
for (const [cat, list] of Object.entries(categories)) {
  total += list.length;
}
console.log(`Total categories: ${Object.keys(categories).length}`);
console.log(`Total bookmarks: ${total}`);

await fs.writeFile("public/bookmarks.json", JSON.stringify(categories, null, 2) + "\n");
console.log("Saved bookmarks.json successfully");
