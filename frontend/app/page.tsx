"use client";
import Link from "next/link";
import {
    GraduationCap,
    Users,
    BookOpen,
    Building2,
    Globe,
    UserCheck
} from "lucide-react";

export default function HomePage() {
    const navItems = [
        {
            title: "Lernende",
            description: "Verwaltung aller Lernenden",
            href: "/lernende",
            icon: GraduationCap,
            color: "#3b82f6"
        },
        {
            title: "Dozenten",
            description: "Verwaltung der Dozenten",
            href: "/dozenten",
            icon: Users,
            color: "#8b5cf6"
        },
        {
            title: "Kurse",
            description: "Verwaltung der Kurse",
            href: "/kurse",
            icon: BookOpen,
            color: "#10b981"
        },
        {
            title: "Kurse-Lernende",
            description: "Zuordnung Kurse zu Lernenden",
            href: "/kurse-lernende",
            icon: UserCheck,
            color: "#f59e0b"
        },
        {
            title: "Lehrbetriebe",
            description: "Verwaltung der Lehrbetriebe",
            href: "/lehrbetriebe",
            icon: Building2,
            color: "#ef4444"
        },
        {
            title: "Lehrbetriebe-Lernende",
            description: "Zuordnung Lehrbetriebe zu Lernenden",
            href: "/lehrbetriebe-lernende",
            icon: Building2,
            color: "#ec4899"
        },
        {
            title: "Länder",
            description: "Verwaltung der Länder",
            href: "/laender",
            icon: Globe,
            color: "#06b6d4"
        }
    ];

    return (
        <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
            {/* Header */}
            <header
                style={{
                    background: "white",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "2rem 0"
                }}
            >
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        padding: "0 2rem"
                    }}
                >
                    <h1
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: "700",
                            color: "#0f172a",
                            marginBottom: "0.5rem"
                        }}
                    >
                        Kursverwaltung
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
                        Zentrale Verwaltung für Kurse, Lernende und Lehrbetriebe
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "3rem 2rem"
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "1.5rem"
                    }}
                >
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{ textDecoration: "none" }}
                            >
                                <div
                                    style={{
                                        background: "white",
                                        borderRadius: "0.75rem",
                                        padding: "2rem",
                                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                                        transition: "all 0.2s ease",
                                        cursor: "pointer",
                                        border: "1px solid #e2e8f0",
                                        height: "100%"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 10px 15px rgba(0, 0, 0, 0.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            marginBottom: "1rem"
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                borderRadius: "0.5rem",
                                                background: `${item.color}15`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            <Icon
                                                size={24}
                                                style={{ color: item.color }}
                                            />
                                        </div>
                                        <h3
                                            style={{
                                                fontSize: "1.25rem",
                                                fontWeight: "600",
                                                color: "#0f172a",
                                                margin: 0
                                            }}
                                        >
                                            {item.title}
                                        </h3>
                                    </div>
                                    <p
                                        style={{
                                            color: "#64748b",
                                            margin: 0,
                                            lineHeight: "1.6"
                                        }}
                                    >
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <footer
                style={{
                    marginTop: "4rem",
                    padding: "2rem",
                    textAlign: "center",
                    color: "#64748b",
                    borderTop: "1px solid #e2e8f0"
                }}
            >
                <p>Kursverwaltungssystem © 2025</p>
            </footer>
        </main>
    );
}