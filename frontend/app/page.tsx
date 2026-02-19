"use client";
import { useState, useEffect } from "react";
import {
    GraduationCap,
    Users,
    BookOpen,
    Building2,
    Globe,
    UserCheck,
    Calendar,
    Award,
    ChevronRight,
    Search,
    Bell,
    Settings,
    Moon,
    Sun
} from "lucide-react";

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [darkMode, setDarkMode] = useState(true);

    // Zustandsvariablen für echte Zahlen aus der API
    const [countLernende, setCountLernende] = useState<number>(0);
    const [countDozenten, setCountDozenten] = useState<number>(0);
    const [countKurse, setCountKurse] = useState<number>(0);
    const [countLehrbetriebe, setCountLehrbetriebe] = useState<number>(0);
    const [countLaender, setCountLaender] = useState<number>(0);
    const [countKurseLernende, setCountKurseLernende] = useState<number>(0);
    const [countLehrbetriebeLernende, setCountLehrbetriebeLernende] = useState<number>(0);

    // Abschlussrate: Anteil der Noten >= 4.0 an allen bewerteten Einträgen
    const [abschlussrate, setAbschlussrate] = useState<string>("–");

    // Nächster Kurs: frühestes Startdatum das in der Zukunft liegt
    const [naechsterKurs, setNaechsterKurs] = useState<string>("–");

    // Kürzliche Aktivitäten: letzte Einträge aus Lernende, Dozenten, Kurse und Kurse-Lernende
    const [recentActivities, setRecentActivities] = useState<{ action: string; item: string }[]>([]);

    // Basis-URL der API
    const API_BASE_URL = "http://localhost";

    // Beim ersten Laden: alle Zählwerte von der API abrufen
    useEffect(() => {
        // Anzahl Lernende
        fetch(API_BASE_URL + "/lernende.php?all")
            .then(r => r.json())
            .then(json => Array.isArray(json) && setCountLernende(json.length))
            .catch(() => console.error("Fehler beim Laden der Lernenden"));

        // Anzahl Dozenten
        fetch(API_BASE_URL + "/dozenten.php?all")
            .then(r => r.json())
            .then(json => Array.isArray(json) && setCountDozenten(json.length))
            .catch(() => console.error("Fehler beim Laden der Dozenten"));

        // Anzahl Kurse + nächster Kurs berechnen
        fetch(API_BASE_URL + "/kurse.php?all")
            .then(r => r.json())
            .then(json => {
                if (!Array.isArray(json)) return;
                setCountKurse(json.length);

                // Heutiges Datum als YYYY-MM-DD String (Timezone-sicher, kein UTC-Bug)
                const nowLocal = new Date();
                const heuteStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, "0")}-${String(nowLocal.getDate()).padStart(2, "0")}`;

                // Filtert alle Kurse mit einem Startdatum >= heute (String-Vergleich, da ISO-Format)
                const zukuenftigeKurse = json
                    .filter((k: any) => k.startdatum && k.startdatum >= heuteStr)
                    .sort((a: any, b: any) => a.startdatum.localeCompare(b.startdatum));

                if (zukuenftigeKurse.length > 0) {
                    // Berechnet Differenz in Tagen via lokale Datumsstrings
                    const [y, m, d] = zukuenftigeKurse[0].startdatum.split("-").map(Number);
                    const naechstesDatum = new Date(y, m - 1, d); // lokale Zeit, kein UTC
                    const heuteDatum = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate());
                    const diffTage = Math.round((naechstesDatum.getTime() - heuteDatum.getTime()) / (1000 * 60 * 60 * 24));

                    if (diffTage === 0) {
                        setNaechsterKurs("Heute");
                    } else if (diffTage === 1) {
                        setNaechsterKurs("Morgen");
                    } else {
                        setNaechsterKurs(`${diffTage} Tage`);
                    }
                } else {
                    setNaechsterKurs("Keiner");
                }
            })
            .catch(() => console.error("Fehler beim Laden der Kurse"));

        // Anzahl Lehrbetriebe
        fetch(API_BASE_URL + "/lehrbetriebe.php?all")
            .then(r => r.json())
            .then(json => Array.isArray(json) && setCountLehrbetriebe(json.length))
            .catch(() => console.error("Fehler beim Laden der Lehrbetriebe"));

        // Anzahl Länder
        fetch(API_BASE_URL + "/laender.php?all")
            .then(r => r.json())
            .then(json => Array.isArray(json) && setCountLaender(json.length))
            .catch(() => console.error("Fehler beim Laden der Länder"));

        // Anzahl Kurse-Lernende-Zuordnungen + Abschlussrate berechnen
        fetch(API_BASE_URL + "/kurse_lernende.php?all")
            .then(r => r.json())
            .then(json => {
                if (!Array.isArray(json)) return;
                setCountKurseLernende(json.length);

                // Filtert nur Einträge mit einer gesetzten Note
                const bewertet = json.filter((e: any) => e.note !== null && e.note !== "" && e.note !== undefined);

                if (bewertet.length > 0) {
                    // Zählt Einträge mit Note >= 4.0 (bestanden)
                    const bestanden = bewertet.filter((e: any) => parseFloat(e.note) >= 4.0).length;
                    const rate = Math.round((bestanden / bewertet.length) * 100);
                    setAbschlussrate(`${rate}%`);
                } else {
                    // Noch keine bewerteten Einträge vorhanden
                    setAbschlussrate("–");
                }
            })
            .catch(() => console.error("Fehler beim Laden der Kurse-Lernende"));

        // Anzahl Lehrbetriebe-Lernende-Zuordnungen
        fetch(API_BASE_URL + "/lehrbetriebe_lernende.php?all")
            .then(r => r.json())
            .then(json => Array.isArray(json) && setCountLehrbetriebeLernende(json.length))
            .catch(() => console.error("Fehler beim Laden der Lehrbetriebe-Lernende"));

        // Kürzliche Aktivitäten: letzte 3 Einträge aus jeder Tabelle laden und zusammenführen
        Promise.all([
            fetch(API_BASE_URL + "/lernende.php?all").then(r => r.json()),
            fetch(API_BASE_URL + "/dozenten.php?all").then(r => r.json()),
            fetch(API_BASE_URL + "/kurse.php?all").then(r => r.json()),
            fetch(API_BASE_URL + "/kurse_lernende.php?all").then(r => r.json()),
            fetch(API_BASE_URL + "/lehrbetriebe.php?all").then(r => r.json()),
            fetch(API_BASE_URL + "/lehrbetriebe_lernende.php?all").then(r => r.json()),
        ]).then(([lernende, dozenten, kurse, kurseLernende, lehrbetriebe, lehrbetriebeLernende]) => {
            const activities: { action: string; item: string }[] = [];

            // Letzter Lernender
            if (Array.isArray(lernende) && lernende.length > 0) {
                const last = lernende[lernende.length - 1];
                activities.push({ action: "Neuer Lernender", item: `${last.vorname ?? ""} ${last.nachname ?? ""}`.trim() });
            }

            // Letzter Dozent
            if (Array.isArray(dozenten) && dozenten.length > 0) {
                const last = dozenten[dozenten.length - 1];
                activities.push({ action: "Neuer Dozent", item: `${last.vorname ?? ""} ${last.nachname ?? ""}`.trim() });
            }

            // Letzter Kurs
            if (Array.isArray(kurse) && kurse.length > 0) {
                const last = kurse[kurse.length - 1];
                activities.push({ action: "Neuer Kurs", item: last.kursthema ?? last.kursnummer ?? "–" });
            }

            // Letzte Kurse-Lernende-Zuordnung
            if (Array.isArray(kurseLernende) && kurseLernende.length > 0) {
                const last = kurseLernende[kurseLernende.length - 1];
                activities.push({ action: "Neue Kurszuordnung", item: last.lernender_name ?? `Eintrag #${last.id_kurse_lernende}` });
            }

            // Letzter Lehrbetrieb
            if (Array.isArray(lehrbetriebe) && lehrbetriebe.length > 0) {
                const last = lehrbetriebe[lehrbetriebe.length - 1];
                activities.push({ action: "Neuer Lehrbetrieb", item: last.firma ?? "–" });
            }

            // Letzte Lehrbetriebe-Lernende-Zuordnung
            if (Array.isArray(lehrbetriebeLernende) && lehrbetriebeLernende.length > 0) {
                const last = lehrbetriebeLernende[lehrbetriebeLernende.length - 1];
                activities.push({ action: "Neue Betriebszuordnung", item: last.lernender_name ?? `Eintrag #${last.id_lehrbetriebe_lernende}` });
            }

            // Maximal 6 Einträge anzeigen
            setRecentActivities(activities.slice(0, 6));
        }).catch(() => console.error("Fehler beim Laden der kürzlichen Aktivitäten"));
    }, []);

    // Navigationskarten mit echten Zählwerten aus der API
    const navItems = [
        {
            title: "Lernende",
            description: "Verwaltung aller Lernenden",
            href: "/lernende",
            icon: GraduationCap,
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            stats: `${countLernende} Aktiv`
        },
        {
            title: "Dozenten",
            description: "Verwaltung der Dozenten",
            href: "/dozenten",
            icon: Users,
            gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            stats: `${countDozenten} Dozenten`
        },
        {
            title: "Kurse",
            description: "Verwaltung der Kurse",
            href: "/kurse",
            icon: BookOpen,
            gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            stats: `${countKurse} Kurse`
        },
        {
            title: "Kurse-Lernende",
            description: "Zuordnung Kurse zu Lernenden",
            href: "/kurse-lernende",
            icon: UserCheck,
            gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            stats: `${countKurseLernende} Zuordnungen`
        },
        {
            title: "Lehrbetriebe",
            description: "Verwaltung der Lehrbetriebe",
            href: "/lehrbetriebe",
            icon: Building2,
            gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            stats: `${countLehrbetriebe} Betriebe`
        },
        {
            title: "Lehrbetriebe-Lernende",
            description: "Zuordnung Lehrbetriebe zu Lernenden",
            href: "/lehrbetriebe-lernende",
            icon: Building2,
            gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
            stats: `${countLehrbetriebeLernende} Zuordnungen`
        },
        {
            title: "Länder",
            description: "Verwaltung der Länder",
            href: "/laender",
            icon: Globe,
            gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            stats: `${countLaender} Länder`
        }
    ];

    // Schnellstatistiken – alle vier Werte kommen jetzt aus der API
    const quickStats = [
        { label: "Aktive Kurse",  value: String(countKurse),  icon: BookOpen  },
        { label: "Lernende",      value: String(countLernende), icon: GraduationCap },
        { label: "Abschlussrate", value: abschlussrate,         icon: Award    },
        { label: "Nächster Kurs", value: naechsterKurs,         icon: Calendar }
    ];



    return (
        <div style={{ minHeight: "100vh", background: darkMode ? "linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)" : "linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)", transition: "background 0.3s ease" }}>
            {/* Navigationsleiste mit Dark Mode Toggle, Benachrichtigungen und Einstellungen */}
            <nav style={{
                background: darkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                borderBottom: darkMode ? "1px solid rgba(51, 65, 85, 0.8)" : "1px solid rgba(226, 232, 240, 0.8)",
                position: "sticky",
                top: 0,
                zIndex: 100,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                transition: "all 0.3s ease"
            }}>
                <div style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    padding: "1rem 2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    {/* Logo und App-Name */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <GraduationCap color="white" size={24} />
                        </div>
                        <span style={{ fontSize: "1.25rem", fontWeight: "700", color: darkMode ? "#f8fafc" : "#0f172a" }}>
                            Kursverwaltung
                        </span>
                    </div>

                    {/* Aktionsbuttons: Dark Mode, Benachrichtigungen, Einstellungen */}
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        {/* Schaltet zwischen Dark und Light Mode */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            style={{
                                background: darkMode ? "rgba(248, 250, 252, 0.1)" : "rgba(15, 23, 42, 0.05)",
                                border: "none",
                                padding: "0.5rem",
                                cursor: "pointer",
                                color: darkMode ? "#f8fafc" : "#64748b",
                                boxShadow: "none",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(248, 250, 252, 0.2)" : "rgba(15, 23, 42, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(248, 250, 252, 0.1)" : "rgba(15, 23, 42, 0.05)";
                            }}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button style={{
                            background: "transparent",
                            border: "none",
                            padding: "0.5rem",
                            cursor: "pointer",
                            color: darkMode ? "#f8fafc" : "#64748b",
                            boxShadow: "none"
                        }}>
                            <Bell size={20} />
                        </button>
                        <button style={{
                            background: "transparent",
                            border: "none",
                            padding: "0.5rem",
                            cursor: "pointer",
                            color: darkMode ? "#f8fafc" : "#64748b",
                            boxShadow: "none"
                        }}>
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hauptinhalt */}
            <div style={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "3rem 2rem 2rem"
            }}>
                {/* Hero-Banner mit Begrüssung und Suchfeld */}
                <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "20px",
                    padding: "3rem",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                }}>
                    {/* Dekoratives Hintergrundleuchten */}
                    <div style={{
                        position: "absolute",
                        top: "-50px",
                        right: "-50px",
                        width: "300px",
                        height: "300px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "50%",
                        filter: "blur(40px)"
                    }}></div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <h1 style={{
                            fontSize: "3rem",
                            fontWeight: "800",
                            marginBottom: "1rem",
                            lineHeight: "1.1"
                        }}>
                            Willkommen zurück!
                        </h1>
                        <p style={{ fontSize: "1.25rem", opacity: 0.9, marginBottom: "2rem" }}>
                            Zentrale Verwaltung für Kurse, Lernende und Lehrbetriebe
                        </p>

                        {/* Suchfeld */}
                        <div style={{
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "12px",
                            padding: "0.75rem 1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            maxWidth: "600px",
                            border: "1px solid rgba(255, 255, 255, 0.3)"
                        }}>
                            <Search size={20} style={{ opacity: 0.7 }} />
                            <input
                                type="text"
                                placeholder="Suche nach Kursen, Lernenden, Dozenten..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "white",
                                    fontSize: "1rem",
                                    outline: "none",
                                    width: "100%",
                                    padding: 0
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Schnellstatistiken – alle vier Werte kommen aus der API */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1.5rem",
                    margin: "2rem 0"
                }}>
                    {quickStats.map((stat, idx) => (
                        <div key={idx} style={{
                            background: darkMode ? "#1e293b" : "white",
                            borderRadius: "16px",
                            padding: "1.5rem",
                            boxShadow: darkMode ? "0 4px 6px rgba(0, 0, 0, 0.3)" : "0 4px 6px rgba(0, 0, 0, 0.05)",
                            border: darkMode ? "1px solid #334155" : "1px solid #f1f5f9",
                            transition: "all 0.3s ease"
                        }}
                             onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = "translateY(-4px)";
                                 e.currentTarget.style.boxShadow = "0 12px 20px rgba(0, 0, 0, 0.1)";
                             }}
                             onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = "translateY(0)";
                                 e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.05)";
                             }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                                <stat.icon size={24} style={{ color: "#667eea" }} />
                            </div>
                            <div style={{ fontSize: "2rem", fontWeight: "700", color: darkMode ? "#f8fafc" : "#0f172a", marginBottom: "0.25rem" }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: "0.875rem", color: darkMode ? "#94a3b8" : "#64748b" }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Hauptraster: Verwaltungskarten links, Aktivitäten rechts */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
                    {/* Navigationskarten zu den Verwaltungsbereichen */}
                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: darkMode ? "#f8fafc" : "#0f172a" }}>
                            Verwaltungsbereiche
                        </h2>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "1.25rem"
                        }}>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <a
                                        href={item.href}
                                        key={item.href}
                                        style={{
                                            textDecoration: "none",
                                            background: darkMode ? "#1e293b" : "white",
                                            borderRadius: "16px",
                                            padding: "1.75rem",
                                            boxShadow: darkMode ? "0 4px 6px rgba(0, 0, 0, 0.3)" : "0 4px 6px rgba(0, 0, 0, 0.05)",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            cursor: "pointer",
                                            border: darkMode ? "1px solid #334155" : "1px solid #f1f5f9",
                                            position: "relative",
                                            overflow: "hidden",
                                            display: "block"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                                            e.currentTarget.style.boxShadow = "0 20px 25px rgba(0, 0, 0, 0.15)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                                            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.05)";
                                        }}
                                    >
                                        {/* Dekorativer Farbverlauf in der oberen rechten Ecke */}
                                        <div style={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            width: "100px",
                                            height: "100px",
                                            background: item.gradient,
                                            opacity: 0.1,
                                            borderRadius: "0 16px 0 100%"
                                        }}></div>

                                        <div style={{ position: "relative", zIndex: 1 }}>
                                            {/* Icon mit Farbverlauf-Hintergrund */}
                                            <div style={{
                                                width: "56px",
                                                height: "56px",
                                                borderRadius: "12px",
                                                background: item.gradient,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginBottom: "1rem",
                                                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)"
                                            }}>
                                                <Icon size={28} color="white" />
                                            </div>

                                            <h3 style={{
                                                fontSize: "1.125rem",
                                                fontWeight: "700",
                                                color: darkMode ? "#f8fafc" : "#0f172a",
                                                marginBottom: "0.5rem"
                                            }}>
                                                {item.title}
                                            </h3>

                                            <p style={{
                                                color: darkMode ? "#94a3b8" : "#64748b",
                                                fontSize: "0.875rem",
                                                marginBottom: "1rem",
                                                lineHeight: "1.5"
                                            }}>
                                                {item.description}
                                            </p>

                                            {/* Echte Anzahl aus der API und Pfeil-Icon */}
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center"
                                            }}>
                                                <span style={{
                                                    fontSize: "0.75rem",
                                                    fontWeight: "600",
                                                    color: "#94a3b8",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.05em"
                                                }}>
                                                    {item.stats}
                                                </span>
                                                <ChevronRight size={18} style={{ color: "#cbd5e1" }} />
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Kürzliche Aktivitäten */}
                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: darkMode ? "#f8fafc" : "#0f172a" }}>
                            Kürzliche Aktivitäten
                        </h2>
                        <div style={{
                            background: darkMode ? "#1e293b" : "white",
                            borderRadius: "16px",
                            padding: "1.5rem",
                            boxShadow: darkMode ? "0 4px 6px rgba(0, 0, 0, 0.3)" : "0 4px 6px rgba(0, 0, 0, 0.05)",
                            border: darkMode ? "1px solid #334155" : "1px solid #f1f5f9"
                        }}>
                            {/* Aktivitätsliste mit Trennlinien zwischen den Einträgen */}
                            {recentActivities.map((activity, idx) => (
                                <div key={idx} style={{
                                    paddingBottom: idx < recentActivities.length - 1 ? "1.25rem" : 0,
                                    marginBottom: idx < recentActivities.length - 1 ? "1.25rem" : 0,
                                    borderBottom: idx < recentActivities.length - 1 ? (darkMode ? "1px solid #334155" : "1px solid #f1f5f9") : "none"
                                }}>
                                    <div style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "600",
                                        color: darkMode ? "#f8fafc" : "#0f172a",
                                        marginBottom: "0.25rem"
                                    }}>
                                        {activity.action}
                                    </div>
                                    <div style={{ fontSize: "0.875rem", color: darkMode ? "#94a3b8" : "#64748b" }}>
                                        {activity.item}
                                    </div>
                                </div>
                            ))}
                            <button style={{
                                width: "100%",
                                marginTop: "1rem",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                border: "none",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 8px 16px rgba(102, 126, 234, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}>
                                Alle Aktivitäten anzeigen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}