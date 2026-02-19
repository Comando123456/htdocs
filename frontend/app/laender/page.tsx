"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

// Typ für einen Länder-Datensatz
type Land = {
    id_country?: number;
    country?: string;
};

export default function LaenderPage() {
    // Zustandsvariablen für Daten, Ladezustand und Fehlermeldung
    const [data, setData] = useState<Land[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Steuert ob das Bearbeitungs-Modal geöffnet ist
    const [editOpen, setEditOpen] = useState<boolean>(false);

    // Aktuell bearbeitetes Land (null = neuer Eintrag)
    const [editItem, setEditItem] = useState<Land | null>(null);

    // Formularwerte im Modal
    const [editForm, setEditForm] = useState<Partial<Land>>({});

    // Basis-URL der API
    const API_BASE_URL = "http://localhost";

    // Beim ersten Laden: Länderliste abrufen
    useEffect(() => {
        fetchData();
    }, []);

    // Lädt alle Länder von der API
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/laender.php?all");
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();
            if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
            setData(json);
        } catch (e: any) {
            setError(e?.message ?? "Fehler beim Laden");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Öffnet das Modal für ein neues Land mit leerem Feld
    const handleNew = () => {
        setEditItem(null);
        setEditForm({ country: "" });
        setEditOpen(true);
    };

    // Öffnet das Modal für ein bestehendes Land und befüllt das Formular
    const handleEdit = (p: Land) => {
        setEditItem(p);
        setEditForm({ country: p.country ?? "" });
        setEditOpen(true);
    };

    // Speichert das Land: PUT bei Bearbeitung, POST bei Neuerstellung
    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/laender.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? { id_country: editItem!.id_country, country: editForm.country } // Bestehenden Eintrag mit ID übergeben
                        : editForm                                                          // Neuen Eintrag ohne ID übergeben
                ),
            });

            const text = await resp.text();
            if (!resp.ok) throw new Error(text);

            // Liste nach erfolgreichem Speichern neu laden
            await fetchData();
        } catch {
            alert("Speichern fehlgeschlagen");
        } finally {
            setEditItem(null);
        }
    };

    // Löscht ein Land nach Bestätigung durch den Benutzer
    const handleDelete = async (p: Land) => {
        if (!p.id_country) return;
        if (!confirm(`Land "${p.country}" löschen?`)) return;

        try {
            const resp = await fetch(
                `${API_BASE_URL}/laender.php?id_country=${encodeURIComponent(
                    String(p.id_country)
                )}`,
                { method: "DELETE" }
            );

            const text = await resp.text();
            if (!resp.ok) throw new Error(text);

            // Liste nach erfolgreichem Löschen neu laden
            await fetchData();
        } catch {
            alert("Löschen fehlgeschlagen");
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            {/* Seitenkopf mit Titel und Button für neues Land */}
            <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "2rem 0" }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <button
                            onClick={() => window.history.back()}
                            style={{
                                background: "white",
                                color: "#64748b",
                                border: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <ArrowLeft size={18} /> Zurück
                        </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a" }}>
                                Länder
                            </h1>
                            <p style={{ color: "#64748b" }}>Verwaltung aller Länder</p>
                        </div>
                        <button
                            onClick={handleNew}
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                            <Plus size={18} /> Neues Land
                        </button>
                    </div>
                </div>
            </header>

            {/* Hauptinhalt: Tabelle mit allen Ländern */}
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
                {/* Ladeanzeige während Daten abgerufen werden */}
                {loading && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b" }}>
                        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                        Lade Daten…
                    </div>
                )}

                {/* Fehlermeldung bei gescheitertem API-Aufruf */}
                {error && (
                    <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "0.5rem" }}>
                        {error}
                    </div>
                )}

                <div
                    style={{
                        background: "white",
                        borderRadius: "0.75rem",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                    }}
                >
                    <table>
                        <thead>
                        <tr>
                            <th>Land</th>
                            <th style={{ textAlign: "right" }}>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Fallback-Zeile wenn keine Einträge vorhanden */}
                        {!data || data.length === 0 ? (
                            <tr>
                                <td colSpan={2} style={{ textAlign: "center", color: "#64748b" }}>
                                    Keine Einträge
                                </td>
                            </tr>
                        ) : (
                            // Alle Länder als Tabellenzeilen rendern
                            data.map((p) => (
                                <tr key={p.id_country}>
                                    <td style={{ fontWeight: 500 }}>{p.country ?? "-"}</td>
                                    <td>
                                        {/* Aktionsbuttons: Bearbeiten und Löschen */}
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <button
                                                onClick={() => handleEdit(p)}
                                                style={{
                                                    padding: "0.5rem",
                                                    background: "#f8fafc",
                                                    color: "#3b82f6",
                                                    border: "1px solid #e2e8f0",
                                                }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p)}
                                                style={{
                                                    padding: "0.5rem",
                                                    background: "#fef2f2",
                                                    color: "#ef4444",
                                                    border: "1px solid #fee",
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal für Erstellen / Bearbeiten eines Landes */}
            {editOpen && (
                <div className="modal-overlay" onClick={() => setEditOpen(false)}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: "500px", width: "90%" }}
                        onClick={(e) => e.stopPropagation()} // Klick im Modal schliesst es nicht
                    >
                        <h2 style={{ marginBottom: "1.5rem" }}>
                            {editItem ? "Land bearbeiten" : "Neues Land"}
                        </h2>

                        {/* Einziges Pflichtfeld: Landesname */}
                        <label style={{ display: "block" }}>
                            Land *
                            <input
                                value={editForm.country ?? ""}
                                onChange={(e) => setEditForm({ country: e.target.value })}
                            />
                        </label>

                        {/* Modal-Aktionen: Abbrechen oder Speichern */}
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "flex-end",
                                marginTop: "1.5rem",
                            }}
                        >
                            <button
                                onClick={() => setEditOpen(false)}
                                style={{ background: "white", color: "#64748b", border: "1px solid #e2e8f0" }}
                            >
                                Abbrechen
                            </button>
                            <button onClick={handleSave}>Speichern</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}