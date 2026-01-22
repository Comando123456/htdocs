"use client";
import { useState } from "react";
import {
    GraduationCap,
    Users,
    BookOpen,
    Building2,
    Globe,
    UserCheck,
    TrendingUp,
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

    const navItems = [
        {
            title: "Lernende",
            description: "Verwaltung aller Lernenden",
            href: "/lernende",
            icon: GraduationCap,
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            stats: "248 Aktiv"
        },
        {
            title: "Dozenten",
            description: "Verwaltung der Dozenten",
            href: "/dozenten",
            icon: Users,
            gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            stats: "42 Dozenten"
        },
        {
            title: "Kurse",
            description: "Verwaltung der Kurse",
            href: "/kurse",
            icon: BookOpen,
            gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            stats: "36 Kurse"
        },
        {
            title: "Kurse-Lernende",
            description: "Zuordnung Kurse zu Lernenden",
            href: "/kurse-lernende",
            icon: UserCheck,
            gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            stats: "512 Zuordnungen"
        },
        {
            title: "Lehrbetriebe",
            description: "Verwaltung der Lehrbetriebe",
            href: "/lehrbetriebe",
            icon: Building2,
            gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            stats: "68 Betriebe"
        },
        {
            title: "Lehrbetriebe-Lernende",
            description: "Zuordnung Lehrbetriebe zu Lernenden",
            href: "/lehrbetriebe-lernende",
            icon: Building2,
            gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
            stats: "248 Zuordnungen"
        },
        {
            title: "Länder",
            description: "Verwaltung der Länder",
            href: "/laender",
            icon: Globe,
            gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            stats: "12 Länder"
        }
    ];

    const quickStats = [
        { label: "Aktive Kurse", value: "36", icon: BookOpen, trend: "+12%" },
        { label: "Lernende", value: "248", icon: GraduationCap, trend: "+8%" },
        { label: "Abschlussrate", value: "94%", icon: Award, trend: "+3%" },
        { label: "Nächster Kurs", value: "3 Tage", icon: Calendar, trend: "" }
    ];

    const recentActivities = [
        { action: "Neuer Kurs erstellt", item: "Web Development Basics", time: "vor 2 Stunden" },
        { action: "Lernende hinzugefügt", item: "Maria Schmidt", time: "vor 4 Stunden" },
        { action: "Dozent aktualisiert", item: "Dr. Hans Müller", time: "vor 1 Tag" }
    ];

    return (
        <div style={{ minHeight: "100vh", background: darkMode ? "linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)" : "linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)", transition: "background 0.3s ease" }}>
            {/* Top Navigation Bar */}
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
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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

            {/* Hero Section */}
            <div style={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "3rem 2rem 2rem"
            }}>
                <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "20px",
                    padding: "3rem",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                }}>
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

                        {/* Search Bar */}
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

                {/* Quick Stats */}
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
                                {stat.trend && (
                                    <span style={{
                                        fontSize: "0.875rem",
                                        color: "#22c55e",
                                        fontWeight: "600",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.25rem"
                                    }}>
                                        <TrendingUp size={14} />
                                        {stat.trend}
                                    </span>
                                )}
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

                {/* Main Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
                    {/* Navigation Cards */}
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

                    {/* Recent Activity */}
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
                                    <div style={{ fontSize: "0.875rem", color: darkMode ? "#94a3b8" : "#64748b", marginBottom: "0.5rem" }}>
                                        {activity.item}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                        {activity.time}
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