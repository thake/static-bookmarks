import fs from 'node:fs/promises';

const currentData = JSON.parse(await fs.readFile('public/bookmarks.json', 'utf-8'));

const javaBookmarks = [
  {
    name: "Java SE Dokumentation (Oracle)",
    url: "https://docs.oracle.com/en/java/javase/",
    description: "Offizielle Java Platform Standard Edition Dokumentation und API-Spezifikation.",
    tags: ["java", "jvm", "oracle", "docs", "backend", "standard"]
  },
  {
    name: "OpenJDK Open Java Development Kit",
    url: "https://openjdk.org",
    description: "Die quelloffene Referenzimplementierung der Java SE Plattform mit allen JDK Enhancement Proposals (JEPs).",
    tags: ["java", "openjdk", "jvm", "opensource", "jep"]
  },
  {
    name: "Adoptium Eclipse Temurin",
    url: "https://adoptium.net",
    description: "Kostenlose, hochqualitative OpenJDK-Binärdateien und Builds von der Eclipse Foundation.",
    tags: ["java", "adoptium", "temurin", "jvm", "runtime"]
  },
  {
    name: "Spring Boot Dokumentation",
    url: "https://spring.io/projects/spring-boot",
    description: "Führendes Java-Enterprise-Framework für eigenständige, produktionsreife Microservices.",
    tags: ["java", "spring", "springboot", "backend", "enterprise", "microservices"]
  },
  {
    name: "Spring Framework Referenz",
    url: "https://docs.spring.io/spring-framework/reference/",
    description: "Kern-Dokumentation für Dependency Injection, AOP, WebFlux und Event-Publishing in Spring.",
    tags: ["spring", "java", "ioc", "di", "architecture"]
  },
  {
    name: "Spring Security Guide",
    url: "https://spring.io/projects/spring-security",
    description: "Umfassendes Authentifizierungs- und Autorisierungs-Framework für Spring-Anwendungen.",
    tags: ["spring", "security", "auth", "oauth2", "jwt", "java"]
  },
  {
    name: "Spring Data JPA",
    url: "https://spring.io/projects/spring-data-jpa",
    description: "Einfache Repository-Abstraktion und Datenzugriffsschicht über Hibernate und JPA.",
    tags: ["spring", "jpa", "hibernate", "database", "sql", "java"]
  },
  {
    name: "Spring Cloud",
    url: "https://spring.io/projects/spring-cloud",
    description: "Werkzeuge für Entwickler zur schnellen Erstellung gängiger Muster in verteilten Systemen.",
    tags: ["spring", "cloud", "microservices", "distributed", "java"]
  },
  {
    name: "Quarkus Supersonic Subatomic Java",
    url: "https://quarkus.io",
    description: "Kubernetes-natives Java-Framework optimiert für GraalVM und HotSpot mit minimalem Speicherverbrauch.",
    tags: ["quarkus", "java", "kubernetes", "cloud", "graalvm", "native"]
  },
  {
    name: "Micronaut Framework",
    url: "https://micronaut.io",
    description: "Modernes JVM-basiertes Fullstack-Framework mit Ahead-of-Time (AOT) Dependency Injection.",
    tags: ["micronaut", "java", "jvm", "aot", "microservices", "serverless"]
  },
  {
    name: "Jakarta EE Spezifikation",
    url: "https://jakarta.ee",
    description: "Offene Enterprise-Standards für Java-Cloudanwendungen (Nachfolger von Java EE).",
    tags: ["jakarta", "javaee", "standards", "enterprise", "java"]
  },
  {
    name: "Eclipse Vert.x Reaktive Apps",
    url: "https://vertx.io",
    description: "Event-getriebenes und nicht-blockierendes Toolkit zum Erstellen reaktiver Anwendungen auf der JVM.",
    tags: ["vertx", "reactive", "async", "event-driven", "jvm", "java"]
  },
  {
    name: "Apache Maven Projekt",
    url: "https://maven.apache.org",
    description: "Standard-Software-Projektmanagement- und Build-Werkzeug basierend auf dem Project Object Model (POM).",
    tags: ["maven", "build", "java", "dependency-management", "tools"]
  },
  {
    name: "Gradle Build Tool für Java",
    url: "https://gradle.org",
    description: "Hochperformantes, flexibles Build-Automatisierungstool mit inkrementellen Builds und Build-Cache.",
    tags: ["gradle", "build", "automation", "jvm", "java", "kotlin"]
  },
  {
    name: "SDKMAN! JVM Versionsmanager",
    url: "https://sdkman.io",
    description: "Befehlszeilenwerkzeug zur parallelen Verwaltung mehrerer SDK-Versionen (Java, Kotlin, Gradle, Maven).",
    tags: ["sdkman", "cli", "jvm", "version-manager", "tools", "java"]
  },
  {
    name: "Baeldung Java Tutorials",
    url: "https://www.baeldung.com",
    description: "Praxisorientierte Schritt-für-Schritt-Anleitungen zu Java, Spring Boot, REST und Security.",
    tags: ["baeldung", "tutorials", "java", "spring", "learning"]
  },
  {
    name: "Foojay Friends of OpenJDK",
    url: "https://foojay.io",
    description: "Zentrale Community-Plattform für Neuigkeiten,JDK-Vergleiche und Meinungen rund um OpenJDK.",
    tags: ["foojay", "openjdk", "community", "news", "java"]
  },
  {
    name: "GraalVM Polyglot Runtime",
    url: "https://www.graalvm.org",
    description: "Hochleistungs-JDK zur Vorkompilierung von Java-Apps in native Maschinencode-Binärdateien.",
    tags: ["graalvm", "native-image", "performance", "compiler", "jvm"]
  },
  {
    name: "Lombok Project",
    url: "https://projectlombok.org",
    description: "Java-Bibliothek zur automatischen Generierung von Gettern, Settern, Konstruktoren und Builders via Annotationen.",
    tags: ["lombok", "boilerplate", "annotations", "java"]
  },
  {
    name: "MapStruct Java Bean Mapper",
    url: "https://mapstruct.org",
    description: "Code-Generator zur typsicheren und extrem schnellen Konvertierung zwischen DTOs und Entitäten.",
    tags: ["mapstruct", "mapping", "code-generator", "dto", "java"]
  },
  {
    name: "Jackson JSON Prozessor",
    url: "https://github.com/FasterXML/jackson",
    description: "Die Standardbibliothek zum Parsen, Generieren und Serialisieren von JSON und XML auf der JVM.",
    tags: ["jackson", "json", "serialization", "java", "parser"]
  },
  {
    name: "Google Guava Java Libraries",
    url: "https://github.com/google/guava",
    description: "Kernbibliotheken von Google für Collections, Caching, Primitiven-Unterstützung und Concurrency.",
    tags: ["guava", "google", "collections", "utilities", "java"]
  },
  {
    name: "Apache Commons",
    url: "https://commons.apache.org",
    description: "Sammlung wiederverwendbarer Open-Source-Java-Komponenten von String-Utils bis IO und Math.",
    tags: ["apache", "commons", "libraries", "utilities", "java"]
  },
  {
    name: "Apache Tomcat",
    url: "https://tomcat.apache.org",
    description: "Open-Source-Webserver und Servlet-Container für Jakarta Servlet und WebSocket-Anwendungen.",
    tags: ["tomcat", "server", "servlet", "jakarta", "java"]
  },
  {
    name: "Eclipse Jetty",
    url: "https://eclipse.dev/jetty/",
    description: "Hochgradig skalierbarer und leichtgewichtiger HTTP-Server und Servlet-Container.",
    tags: ["jetty", "server", "http", "servlet", "embedded", "java"]
  },
  {
    name: "Helidon Microprofile Framework",
    url: "https://helidon.io",
    description: "Cloud-native Sammlung von Java-Bibliotheken von Oracle zur Erstellung von Microservices mit Virtual Threads.",
    tags: ["helidon", "microservices", "virtual-threads", "oracle", "java"]
  },
  {
    name: "Dropwizard REST Framework",
    url: "https://www.dropwizard.io",
    description: "Etabliertes Java-Framework zur schnellen Entwicklung von RESTful Webdiensten.",
    tags: ["dropwizard", "rest", "backend", "metrics", "java"]
  },
  {
    name: "Byte Buddy Bytecode Manipulation",
    url: "https://bytebuddy.net",
    description: "Bibliothek zur Laufzeit-Erstellung und -Modifikation von Java-Klassen ohne Compiler-Hilfe.",
    tags: ["bytebuddy", "bytecode", "jvm", "metaprogramming", "java"]
  },
  {
    name: "VisualVM JVM Monitoring",
    url: "https://visualvm.github.io",
    description: "Visuelles Tool zur Überwachung von JVM-Prozessen, Heap-Dumps, Thread-Analyse und Profiling.",
    tags: ["visualvm", "profiling", "jvm", "monitoring", "heap-dump", "tools"]
  },
  {
    name: "Amazon Corretto OpenJDK",
    url: "https://aws.amazon.com/corretto/",
    description: "Kostenlose, plattformübergreifende Produktions-Distribution von OpenJDK von Amazon.",
    tags: ["corretto", "aws", "openjdk", "jvm", "runtime"]
  },
  {
    name: "BellSoft Liberica JDK",
    url: "https://bell-sw.com/liberica-jdk/",
    description: "Standardkonforme OpenJDK-Distribution mit Unterstützung für JavaFX und optimierten Alpine-Docker-Containern.",
    tags: ["liberica", "bellsoft", "openjdk", "docker", "alpine"]
  },
  {
    name: "Azul Zulu OpenJDK",
    url: "https://www.azul.com/downloads/?package=jdk",
    description: "Zertifizierte, unternehmenstaugliche Builds von OpenJDK für Linux, macOS und Windows.",
    tags: ["azul", "zulu", "openjdk", "jvm", "enterprise"]
  },
  {
    name: "JUG (Java User Groups) Deutschland",
    url: "https://www.jug-deutschland.de",
    description: "Dachorganisation und Übersicht der regionalen Java User Groups in Deutschland.",
    tags: ["community", "meetup", "german", "networking", "java"]
  },
  {
    name: "IntelliJ IDEA Java IDE",
    url: "https://www.jetbrains.com/idea/",
    description: "Die führende Entwicklungsumgebung für Java, Kotlin und polyglotte Entwicklung von JetBrains.",
    tags: ["intellij", "ide", "jetbrains", "developer-tools", "java", "kotlin"]
  },
  {
    name: "Eclipse IDE für Java",
    url: "https://www.eclipse.org/ide/",
    description: "Klassische Open-Source-Entwicklungsumgebung mit erweiterbarem Plugin-Ökosystem.",
    tags: ["eclipse", "ide", "opensource", "java"]
  },
  {
    name: "Apache NetBeans",
    url: "https://netbeans.apache.org",
    description: "Vielseitige IDE für Java SE, Java EE und Webentwicklung der Apache Software Foundation.",
    tags: ["netbeans", "ide", "apache", "java"]
  },
  {
    name: "JBang Zero-Ceremony Java",
    url: "https://www.jbang.dev",
    description: "Java-Dateien und Skripte direkt per Befehlszeile ausführen ohne Build-Tool oder Setup.",
    tags: ["jbang", "scripting", "cli", "tools", "java"]
  }
];

const kotlinBookmarks = [
  {
    name: "Kotlin Offizielle Dokumentation",
    url: "https://kotlinlang.org/docs/home.html",
    description: "Offizielle Referenz, Sprachspezifikation und Anleitungen für moderne Kotlin-Entwicklung von JetBrains.",
    tags: ["kotlin", "docs", "jetbrains", "jvm", "language"]
  },
  {
    name: "Kotlin Standard Library Referenz",
    url: "https://kotlinlang.org/api/core/kotlin-stdlib/",
    description: "Vollständige API-Dokumentation für Collections, Scope Functions, Ranges und Core Utilities.",
    tags: ["kotlin", "stdlib", "api", "reference", "docs"]
  },
  {
    name: "Kotlin Coroutines Guide",
    url: "https://kotlinlang.org/docs/coroutines-overview.html",
    description: "Umfassender Leitfaden zu asynchroner Programmierung mit Coroutines, Suspend Functions und Channels.",
    tags: ["kotlin", "coroutines", "async", "concurrency", "performance"]
  },
  {
    name: "Kotlin Flow Reaktive Streams",
    url: "https://kotlinlang.org/docs/flow.html",
    description: "Asynchrone kalte und heiße Streams (StateFlow, SharedFlow) für reaktive Datenflüsse.",
    tags: ["kotlin", "flow", "reactive", "streams", "coroutines"]
  },
  {
    name: "Kotlin Multiplatform (KMP)",
    url: "https://www.jetbrains.com/kotlin-multiplatform/",
    description: "Gemeinsame Geschäftslogik für Android, iOS, Desktop und Web teilen mit 100% nativer Performance.",
    tags: ["kmp", "multiplatform", "mobile", "ios", "android", "kotlin"]
  },
  {
    name: "Compose Multiplatform UI",
    url: "https://www.jetbrains.com/lp/compose-multiplatform/",
    description: "Deklaratives UI-Framework für gemeinsame Benutzeroberflächen auf iOS, Android, Desktop und Web.",
    tags: ["compose", "multiplatform", "ui", "declarative", "kotlin"]
  },
  {
    name: "Ktor Web Framework",
    url: "https://ktor.io",
    description: "Asynchrones, leichtgewichtiges Framework von JetBrains zur Erstellung von Microservices und HTTP-Clients.",
    tags: ["ktor", "kotlin", "backend", "http", "coroutines", "microservices"]
  },
  {
    name: "Arrow Functional Companion for Kotlin",
    url: "https://arrow-kt.io",
    description: "Funktionale Programmierung in Kotlin: Either, Raise-DSL, typed Errors und Immutability.",
    tags: ["arrow", "functional", "either", "error-handling", "kotlin"]
  },
  {
    name: "Exposed SQL Library for Kotlin",
    url: "https://jetbrains.github.io/Exposed/",
    description: "Idiomatische Kotlin-SQL-Bibliothek von JetBrains mit typsicherer DSL und DAO-Modus.",
    tags: ["exposed", "sql", "database", "orm", "dsl", "kotlin"]
  },
  {
    name: "Kotlinx Serialization",
    url: "https://github.com/Kotlin/kotlinx.serialization",
    description: "Multiplattform-Compiler-Plugin für JSON, Protobuf, CBOR und YAML Serialisierung.",
    tags: ["serialization", "json", "kmp", "compiler", "kotlin"]
  },
  {
    name: "Kotlinx DateTime",
    url: "https://github.com/Kotlin/kotlinx-datetime",
    description: "Multiplattform-Bibliothek für Datum, Uhrzeit und Zeitzonen-Berechnungen in Kotlin.",
    tags: ["datetime", "kmp", "time", "utilities", "kotlin"]
  },
  {
    name: "Kotlin Playground Online",
    url: "https://play.kotlinlang.org",
    description: "Interaktive Online-Entwicklungsumgebung zum Ausprobieren von Kotlin-Code im Browser.",
    tags: ["playground", "online", "sandbox", "learning", "kotlin"]
  },
  {
    name: "Android Developers Kotlin Guide",
    url: "https://developer.android.com/kotlin",
    description: "Offizielle Google-Dokumentation für moderne Android-App-Entwicklung mit Kotlin.",
    tags: ["android", "mobile", "google", "kotlin", "apps"]
  },
  {
    name: "Jetpack Compose für Android",
    url: "https://developer.android.com/jetpack/compose",
    description: "Googles modernes natives UI-Toolkit für beschleunigte Android-Entwicklung mit weniger Code.",
    tags: ["android", "compose", "ui", "mobile", "kotlin"]
  },
  {
    name: "Koin Dependency Injection",
    url: "https://insert-koin.io",
    description: "Pragmatisches und leichtgewichtiges Dependency-Injection-Framework für Kotlin und Android ohne Reflection.",
    tags: ["koin", "di", "dependency-injection", "android", "kmp", "kotlin"]
  },
  {
    name: "Kodein Framework",
    url: "https://kosi-libs.org/kodein/",
    description: "Schmerzfreies Multiplattform-Dependency-Injection-Framework für Kotlin.",
    tags: ["kodein", "di", "multiplatform", "kotlin"]
  },
  {
    name: "Detekt Statische Code-Analyse",
    url: "https://detekt.dev",
    description: "Statisches Code-Analyse-Tool für Kotlin zur Durchsetzung von Code-Qualität und Smell-Erkennung.",
    tags: ["detekt", "linter", "code-quality", "analysis", "kotlin"]
  },
  {
    name: "Ktlint Linter für Kotlin",
    url: "https://pinterest.github.io/ktlint/",
    description: "Anti-Bikeshedding Linter und automatischer Formatter für Kotlin-Code nach offiziellem Styleguide.",
    tags: ["ktlint", "linter", "formatter", "code-style", "kotlin"]
  },
  {
    name: "Dokka Dokumentationsgenerator",
    url: "https://kotlinlang.org/docs/dokka-introduction.html",
    description: "Dokumentations-Engine für Kotlin, die Code-Kommentare in ansprechende HTML- und Markdown-Dokumente umwandelt.",
    tags: ["dokka", "documentation", "kdoc", "tools", "kotlin"]
  },
  {
    name: "Kotest Test-Framework",
    url: "https://kotest.io",
    description: "Flexibles und umfassendes Multiplattform-Test-Framework mit BehaviorSpec, StringSpec und Property Testing.",
    tags: ["kotest", "testing", "assertions", "property-testing", "kotlin"]
  },
  {
    name: "MockK Mocking-Bibliothek",
    url: "https://mockk.io",
    description: "Leistungsstarke Mocking-Bibliothek maßgeschneidert für Kotlin mit Coroutine-Unterstützung.",
    tags: ["mockk", "mocking", "testing", "unit-testing", "kotlin"]
  },
  {
    name: "Spring Boot mit Kotlin Support",
    url: "https://spring.io/guides/tutorials/spring-boot-kotlin/",
    description: "Offizielles Tutorial zur Erstellung typsicherer Spring Boot Services mit Kotlin und Router-DSLs.",
    tags: ["spring", "kotlin", "backend", "dsl", "enterprise"]
  },
  {
    name: "Kotlin Symbol Processing (KSP)",
    url: "https://kotlinlang.org/docs/ksp-overview.html",
    description: "Leistungsstarke und bis zu 2x schnellere Alternative zu KAPT für Annotation-Processing in Kotlin.",
    tags: ["ksp", "compiler", "annotations", "code-generation", "kotlin"]
  },
  {
    name: "Kotlin Weekly Newsletter",
    url: "https://kotlinweekly.net",
    description: "Wöchentlicher E-Mail-Newsletter mit den neuesten Artikeln, Bibliotheken, Videos und Podcasts über Kotlin.",
    tags: ["newsletter", "community", "news", "articles", "kotlin"]
  },
  {
    name: "Kotlin Discussions Forum",
    url: "https://discuss.kotlinlang.org",
    description: "Offizielles Diskussionsforum für Fragen, Sprachvorschläge und Architekturdiskussionen rund um Kotlin.",
    tags: ["forum", "community", "discussions", "support", "kotlin"]
  },
  {
    name: "Talking Kotlin Podcast",
    url: "https://talkingkotlin.com",
    description: "Monatlicher Podcast von JetBrains mit Interviews von Branchenexperten und Kotlin-Kernentwicklern.",
    tags: ["podcast", "audio", "interviews", "community", "kotlin"]
  },
  {
    name: "KotlinConf Konferenz",
    url: "https://kotlinconf.com",
    description: "Die offizielle weltweite Fachkonferenz von JetBrains mit Keynotes und tiefen technischen Vorträgen.",
    tags: ["conference", "events", "jetbrains", "talks", "kotlin"]
  },
  {
    name: "Awesome Kotlin",
    url: "https://github.com/KotlinBy/awesome-kotlin",
    description: "Kuratierte Liste der beliebtesten Kotlin-Bibliotheken, Frameworks, Ressourcen und Buchtipps.",
    tags: ["awesome", "curated", "resources", "libraries", "kotlin"]
  },
  {
    name: "Kotlin Koans Interaktive Übungen",
    url: "https://kotlinlang.org/docs/koans.html",
    description: "Praktische Übungen zum Kennenlernen der Syntax und Idiome von Kotlin im Browser oder in IntelliJ.",
    tags: ["learning", "exercises", "koans", "beginner", "kotlin"]
  },
  {
    name: "Kotlin by Example",
    url: "https://play.kotlinlang.org/byExample/overview",
    description: "Kurze, fokussierte Code-Beispiele zur Erklärung aller wesentlichen Kotlin-Konzepte.",
    tags: ["examples", "snippets", "learning", "kotlin"]
  },
  {
    name: "Reddit r/Kotlin",
    url: "https://www.reddit.com/r/Kotlin/",
    description: "Aktive Reddit-Community für News, Bibliotheks-Vorstellungen und Diskussionen.",
    tags: ["reddit", "community", "discussions", "social", "kotlin"]
  }
];

const testingAndDataBookmarks = [
  {
    name: "JUnit 5 Benutzerhandbuch",
    url: "https://junit.org/junit5/docs/current/user-guide/",
    description: "Die nächste Generation von JUnit für entwicklerorientiertes Testen auf der JVM mit Jupiter-Engine.",
    tags: ["junit", "testing", "unit-testing", "java", "jvm"]
  },
  {
    name: "Testcontainers Java",
    url: "https://testcontainers.com",
    description: "Echte Docker-Container (PostgreSQL, Kafka, Redis) programmatisch in Integrationstests hochfahren.",
    tags: ["testcontainers", "docker", "integration-testing", "testing", "java", "kotlin"]
  },
  {
    name: "Mockito Mocking Framework",
    url: "https://site.mockito.org",
    description: "Beliebtestes Mocking-Framework für Java mit sauberer und intuitiver API für Unit-Tests.",
    tags: ["mockito", "mocking", "testing", "unit-testing", "java"]
  },
  {
    name: "AssertJ Fluent Assertions",
    url: "https://assertj.github.io/doc/",
    description: "Flüssige, lesbare und ausdrucksstarke Assertion-Bibliothek für Java-Tests.",
    tags: ["assertj", "assertions", "testing", "quality", "java"]
  },
  {
    name: "ArchUnit Architektur-Tests",
    url: "https://www.archunit.org",
    description: "Java-Architektur- und Schichtenregeln (z.B. Hexagonal / Onion) als automatisierte Unit-Tests prüfen.",
    tags: ["archunit", "architecture", "testing", "code-quality", "java"]
  },
  {
    name: "WireMock HTTP Mocking",
    url: "https://wiremock.org",
    description: "Flexibler Simulator für HTTP-basierte APIs zur isolierten Prüfung von Third-Party-Webdiensten.",
    tags: ["wiremock", "mocking", "http", "api", "integration-testing", "java"]
  },
  {
    name: "REST Assured API Testing",
    url: "https://rest-assured.io",
    description: "Java-DSL für einfaches und elegantes Testen und Validieren von REST-Services.",
    tags: ["rest-assured", "rest", "api", "testing", "java"]
  },
  {
    name: "Awaitility Asynchronous Testing",
    url: "https://github.com/awaitility/awaitility",
    description: "Kleine DSL zum präzisen Testen asynchroner Systeme und Concurrency-Bedingungen.",
    tags: ["awaitility", "async", "testing", "concurrency", "java"]
  },
  {
    name: "JaCoCo Code Coverage",
    url: "https://www.jacoco.org/jacoco/",
    description: "Standard-Java-Code-Coverage-Bibliothek für Maven, Gradle und SonarQube.",
    tags: ["jacoco", "coverage", "testing", "metrics", "java"]
  },
  {
    name: "SpotBugs Statische Analyse",
    url: "https://spotbugs.github.io",
    description: "Statische Code-Analyse zur Erkennung von über 400 potenziellen Bugs im Java-Bytecode.",
    tags: ["spotbugs", "static-analysis", "code-quality", "security", "java"]
  },
  {
    name: "Checkstyle Code-Standard-Prüfer",
    url: "https://checkstyle.sourceforge.io",
    description: "Entwicklungswerkzeug zur automatisierten Durchsetzung einheitlicher Java-Codierungsstandards.",
    tags: ["checkstyle", "code-style", "quality", "linter", "java"]
  },
  {
    name: "PMD Source Code Analyzer",
    url: "https://pmd.github.io",
    description: "Erkennt ungenutzte Variablen, leere Catch-Blöcke und ineffiziente Objekt-Erstellung in Java.",
    tags: ["pmd", "static-analysis", "code-smells", "java"]
  },
  {
    name: "Error Prone (Google)",
    url: "https://errorprone.info",
    description: "Erweiterung des Java-Compilers von Google zur Erkennung von Fehlern bereits zur Compile-Zeit.",
    tags: ["error-prone", "google", "compiler", "bugs", "java"]
  },
  {
    name: "Flyway Database Migrations",
    url: "https://flywaydb.org",
    description: "Open-Source-Tool für versionskontrollierte relationale Datenbankmigrationen mit Plain-SQL.",
    tags: ["flyway", "database", "migrations", "sql", "devops", "java"]
  },
  {
    name: "Liquibase Database DevOps",
    url: "https://www.liquibase.com",
    description: "Datenbank-Refactoring und Migrationsverwaltung via XML, YAML, JSON oder SQL-Skripte.",
    tags: ["liquibase", "database", "migrations", "devops", "java"]
  },
  {
    name: "jOOQ Typesafe SQL für Java",
    url: "https://www.jooq.org",
    description: "Generiert Java-Code aus Datenbank-Schemata für 100% typsichere und lesbare SQL-Queries.",
    tags: ["jooq", "sql", "typesafe", "database", "orm-alternative", "java"]
  },
  {
    name: "Hibernate ORM Dokumentation",
    url: "https://hibernate.org/orm/documentation/",
    description: "Die de-facto Standard-Implementierung von Jakarta Persistence (JPA) für relationale Datenbanken.",
    tags: ["hibernate", "orm", "jpa", "database", "sql", "java"]
  },
  {
    name: "HikariCP JDBC Connection Pool",
    url: "https://github.com/brettwooldridge/HikariCP",
    description: "Der schnellste und leichtgewichtigste JDBC-Verbindungspool für Java Enterprise-Systeme.",
    tags: ["hikaricp", "jdbc", "performance", "database", "java"]
  },
  {
    name: "Resilience4j Fault Tolerance",
    url: "https://resilience4j.readme.io",
    description: "Leichtgewichtiges Fehlertoleranz-Framework inspiriert von Netflix Hystrix (Circuit Breaker, Rate Limiter).",
    tags: ["resilience4j", "circuit-breaker", "resilience", "microservices", "java"]
  },
  {
    name: "Micrometer Application Metrics",
    url: "https://micrometer.io",
    description: "Vendor-neutrale Metrik-Fassade für Java (Prometheus, Datadog, Grafana, CloudWatch).",
    tags: ["micrometer", "metrics", "monitoring", "observability", "java"]
  },
  {
    name: "Logback Logging Framework",
    url: "https://logback.qos.ch",
    description: "Der direkte Nachfolger von log4j und Standard-Logging-Backend für moderne Java-Anwendungen.",
    tags: ["logback", "logging", "slf4j", "backend", "java"]
  },
  {
    name: "SLF4J Simple Logging Facade",
    url: "https://www.slf4j.org",
    description: "Abstraktionsschicht für verschiedene Logging-Frameworks zur flexiblen Konfiguration bei Deployment.",
    tags: ["slf4j", "logging", "facade", "java"]
  },
  {
    name: "Netty Event-Driven Network Framework",
    url: "https://netty.io",
    description: "Asynchrones, Event-getriebenes Netzwerk-Anwendungsframework für performante Protokoll-Server und -Clients.",
    tags: ["netty", "network", "async", "nio", "high-performance", "java"]
  },
  {
    name: "Apache Camel Integration",
    url: "https://camel.apache.org",
    description: "Umfassendes Integrations-Framework basierend auf bekannten Enterprise Integration Patterns (EIPs).",
    tags: ["camel", "integration", "eip", "enterprise", "java"]
  },
  {
    name: "Debezium Change Data Capture",
    url: "https://debezium.io",
    description: "Verteilte Open-Source-Plattform zur Echtzeit-Erfassung von Datenbankänderungen über Kafka.",
    tags: ["debezium", "cdc", "kafka", "streaming", "database", "java"]
  }
];

currentData["Java & JVM Ökosystem"] = javaBookmarks;
currentData["Kotlin & Multiplatform"] = kotlinBookmarks;

// Append testing and data tools to existing or new
if (!currentData["Testing & Qualitätssicherung"]) {
  currentData["Testing & Qualitätssicherung"] = [];
}
// Add the new testing & data items into Testing & Qualitätssicherung or a dedicated JVM tools category
currentData["JVM Tools & Frameworks"] = testingAndDataBookmarks;

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
console.log(`Successfully added JVM bookmarks! Total bookmarks now: ${total}`);
