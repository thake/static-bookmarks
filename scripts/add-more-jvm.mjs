import fs from 'node:fs/promises';

const currentData = JSON.parse(await fs.readFile('public/bookmarks.json', 'utf-8'));

const extraJavaBookmarks = [
  {
    name: "Project Reactor",
    url: "https://projectreactor.io",
    description: "Reaktives Programmier-Framework der vierten Generation für die JVM auf Basis der Reactive-Streams-Spezifikation.",
    tags: ["reactor", "reactive", "flux", "mono", "spring", "java"]
  },
  {
    name: "Mutiny Reactive Streams",
    url: "https://smallrye.io/smallrye-mutiny/",
    description: "Ereignisgesteuerte, intuitive reaktive Programmierbibliothek für modernes Java und Quarkus.",
    tags: ["mutiny", "reactive", "quarkus", "async", "java"]
  },
  {
    name: "OpenRewrite Automatisierte Refactorings",
    url: "https://docs.openrewrite.org",
    description: "Semantisches Code-Refactoring und automatisierte Framework-Upgrades (z.B. Spring Boot 2 zu 3, Java 17 zu 21).",
    tags: ["openrewrite", "refactoring", "migration", "code-quality", "java"]
  },
  {
    name: "Eclipse Collections",
    url: "https://eclipse.dev/collections/",
    description: "Speichereffiziente Collections-Bibliothek für Java mit optimierten Primitiven-Containern.",
    tags: ["collections", "performance", "memory", "eclipse", "java"]
  },
  {
    name: "Apache POI Office Documents",
    url: "https://poi.apache.org",
    description: "Die Standard-Java-Bibliothek zum Lesen und Schreiben von Microsoft Excel-, Word- und PowerPoint-Dateien.",
    tags: ["excel", "office", "documents", "apache", "java"]
  },
  {
    name: "Apache PDFBox",
    url: "https://pdfbox.apache.org",
    description: "Open-Source-Java-Tool zur Neuerstellung, Bearbeitung und Extraktion von Inhalten aus PDF-Dokumenten.",
    tags: ["pdf", "documents", "apache", "java"]
  },
  {
    name: "Kryo Schnelle Java-Serialisierung",
    url: "https://github.com/EsotericSoftware/kryo",
    description: "Schnelles und effizientes binäres Objekt-Graphen-Serialisierungsframework für Java.",
    tags: ["kryo", "serialization", "performance", "binary", "java"]
  },
  {
    name: "JNA Java Native Access",
    url: "https://github.com/java-native-access/jna",
    description: "Einfacher Zugriff auf native Shared Libraries (C/C++) ohne JNI-Code schreiben zu müssen.",
    tags: ["jna", "native", "c", "interop", "jvm", "java"]
  },
  {
    name: "Spring Authorization Server",
    url: "https://spring.io/projects/spring-authorization-server",
    description: "Offizieller OAuth 2.1 und OpenID Connect 1.0 Authorization Server von Spring.",
    tags: ["spring", "oauth2", "oidc", "security", "auth", "java"]
  }
];

const extraKotlinBookmarks = [
  {
    name: "SQLDelight Typsichere SQL-Queries",
    url: "https://cashapp.github.io/sqldelight/",
    description: "Generiert typsichere Kotlin-Code-APIs direkt aus deinen Plain-SQL-Dateien für Multiplattform.",
    tags: ["sqldelight", "sql", "kmp", "database", "cashapp", "kotlin"]
  },
  {
    name: "Apollo Kotlin GraphQL Client",
    url: "https://www.apollographql.com/docs/kotlin/",
    description: "Stark typsicherer, generierter GraphQL-Client für Android und Kotlin Multiplatform.",
    tags: ["graphql", "apollo", "kmp", "api", "mobile", "kotlin"]
  },
  {
    name: "Coil Image Loading for Android & Compose",
    url: "https://coil-kt.github.io/coil/",
    description: "Moderne, asynchrone Bildlade-Bibliothek für Android und Jetpack Compose gestützt auf Coroutines.",
    tags: ["coil", "images", "compose", "android", "coroutines", "kotlin"]
  },
  {
    name: "Decompose KMP Architektur",
    url: "https://arkivanov.github.io/Decompose/",
    description: "Bibliothek zur Aufteilung von Kotlin-Code in unabhängige Komponenten mit Routing und Navigation.",
    tags: ["decompose", "kmp", "navigation", "architecture", "kotlin"]
  },
  {
    name: "MVIKotlin Reaktive Architektur",
    url: "https://arkivanov.github.io/MVIKotlin/",
    description: "Model-View-Intent (MVI) Architektur-Framework für Multiplattform-Kotlin mit Zeitreise-Debugging.",
    tags: ["mvikotlin", "mvi", "kmp", "architecture", "kotlin"]
  },
  {
    name: "Napier KMP Logging",
    url: "https://github.com/AAkira/Napier",
    description: "Multiplattform-Logging-Bibliothek für Kotlin (Android, iOS, JVM, JavaScript).",
    tags: ["napier", "logging", "kmp", "tools", "kotlin"]
  },
  {
    name: "Kermit Multiplatform Logger",
    url: "https://kermit.touchlab.co",
    description: "Leichtgewichtige Kotlin-Logging-Utility von Touchlab für Multiplatform-Projekte.",
    tags: ["kermit", "logging", "touchlab", "kmp", "kotlin"]
  },
  {
    name: "Amper Build Tool (JetBrains)",
    url: "https://github.com/JetBrains/amper",
    description: "Deklaratives, einfaches Projektkonfigurations- und Build-Werkzeug von JetBrains für Kotlin und Java.",
    tags: ["amper", "build", "jetbrains", "tools", "kotlin"]
  },
  {
    name: "Kotlin Evolution & KEEP Proposals",
    url: "https://github.com/Kotlin/KEEP",
    description: "Kotlin Experimental and Enhancement Proposals: Der offizielle Sprach-Evolutionsprozess.",
    tags: ["keep", "specs", "evolution", "language", "kotlin"]
  }
];

currentData["Java & JVM Ökosystem"].push(...extraJavaBookmarks);
currentData["Kotlin & Multiplatform"].push(...extraKotlinBookmarks);

// Validate all bookmarks: no leading space, starts with alphanumeric
let total = 0;
for (const [cat, list] of Object.entries(currentData)) {
  for (const b of list) {
    total++;
    b.name = b.name.trim();
    if (!/^[a-zA-Z0-9(]/.test(b.name)) {
      throw new Error(`Invalid name in ${cat}: "${b.name}"`);
    }
  }
}

await fs.writeFile('public/bookmarks.json', JSON.stringify(currentData, null, 2) + '\n');
console.log(`Successfully added extra JVM bookmarks! Total bookmarks now: ${total}`);
