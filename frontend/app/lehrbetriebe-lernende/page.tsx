"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

// Typ für einen Lehrbetriebe-Lernende-Datensatz (Zuordnungstabelle)
type LehrbetriebLernender = {
    id_lehrbetriebe_lernende?: number;
    nr_lehrbetrieb?: number | string;
    nr_lernende?: number | string;
    start?: string;
    ende?: string;
    beruf?: string;
    firma?: string;         // JOIN – Firmenname aus tbl_lehrbetriebe
    lernender_name?: string; // JOIN – vollständiger Name aus tbl_lernende
};

// Typ für einen Lehrbetrieb-Eintrag (wird für das Auswahlmenü benötigt)
type Lehrbetrieb = {
    id_lehrbetrieb: number;
    firma: string;
};

// Typ für einen Lernenden-Eintrag (wird für das Auswahlmenü benötigt)
type Lernender = {
    id_lernende: number;
    vorname: string;
    nachname: string;
};

export default function LehrbetriebeLernendePage() {
    // Zustandsvariablen für Daten, Ladezustand und Fehlermeldung
    const [data, setData] = useState<LehrbetriebLernender[]>([]);
    const [lehrbetriebe, setLehrbetriebe] = useState<Lehrbetrieb[]>([]);
    const [lernende, setLernende] = useState<Lernender[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Steuert ob das Bearbeitungs-Modal geöffnet ist
    const [editOpen, setEditOpen] = useState(false);

    // Aktuell bearbeiteter Eintrag (null = neuer Eintrag)
    const [editItem, setEditItem] = useState<LehrbetriebLernender | null>(null);

    // Formularwerte im Modal
    const [editForm, setEditForm] = useState<Partial<LehrbetriebLernender>>({});

    // Basis-URL der API
    const API_BASE_URL = "http://localhost";

    // Beim ersten Laden: Zuordnungen, Lehrbetriebe und Lernende abrufen
    useEffect(() => {
        fetchData();
        fetchLehrbetriebe();
        fetchLernende();
    }, []);

    // Lädt alle verfügbaren Lehrbetriebe für das Auswahlmenü
    const fetchLehrbetriebe = async () => {
        try {
            const resp = await fetch(API_BASE_URL + "/lehrbetriebe.php?all");
            if (!resp.ok) throw new Error("Fehler beim Laden der Lehrbetriebe");
            const json = await resp.json();
            if (Array.isArray(json)) {
                setLehrbetriebe(json);
            }
        } catch (e) {
            console.error("Fehler beim Laden der Lehrbetriebe:", e);
        }
    };

    // Lädt alle verfügbaren Lernenden für das Auswahlmenü
    const fetchLernende = async () => {
        try {
            const resp = await fetch(API_BASE_URL + "/lernende.php?all");
            if (!resp.ok) throw new Error("Fehler beim Laden der Lernenden");
            const json = await resp.json();
            if (Array.isArray(json)) {
                setLernende(json);
            }
        } catch (e) {
            console.error("Fehler beim Laden der Lernenden:", e);
        }
    };

    // Lädt alle Lehrbetriebe-Lernende-Zuordnungen inkl. Namen via JOIN-Endpunkt
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(
                API_BASE_URL + "/joins.php?type=lehrbetriebe_lernende"
            );
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

    // Öffnet das Modal für einen neuen Eintrag mit leeren Feldern
    const handleNew = () => {
        setEditItem(null);
        setEditForm({
            nr_lehrbetrieb: "",
            nr_lernende: "",
            start: "",
            ende: "",
            beruf: "",
        });
        setEditOpen(true);
    };

    // Öffnet das Modal für einen bestehenden Eintrag und befüllt das Formular
    const handleEdit = (p: LehrbetriebLernender) => {
        setEditItem(p);
        setEditForm({
            nr_lehrbetrieb: p.nr_lehrbetrieb ?? "",
            nr_lernende: p.nr_lernende ?? "",
            start: p.start ?? "",
            ende: p.ende ?? "",
            beruf: p.beruf ?? "",
        });
        setEditOpen(true);
    };

    // Speichert den Eintrag: PUT bei Bearbeitung, POST bei Neuerstellung
    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/lehrbetriebe_lernende.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? {
                            id_lehrbetriebe_lernende:
                            editItem!.id_lehrbetriebe_lernende, // Bestehenden Eintrag mit ID übergeben
                            ...editForm,
                        }
                        : editForm // Neuen Eintrag ohne ID übergeben
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

    // Löscht eine Zuordnung nach Bestätigung durch den Benutzer
    const handleDelete = async (p: LehrbetriebLernender) => {
        if (!p.id_lehrbetriebe_lernende) return;
        if (
            !confirm(
                `Eintrag löschen?\nLehrbetrieb: ${p.firma}\nLernender: ${p.lernender_name}`
            )
        )
            return;

        try {
            const resp = await fetch(
                `${API_BASE_URL}/lehrbetriebe_lernende.php?id_lehrbetriebe_lernende=${encodeURIComponent(
                    String(p.id_lehrbetriebe_lernende)
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
            {/* Seitenkopf mit Titel und Button für neuen Eintrag */}
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
                                Lehrbetriebe – Lernende
                            </h1>
                            <p style={{ color: "#64748b" }}>
                                Zuordnung von Lernenden zu Lehrbetrieben
                            </p>
                        </div>
                        <button
                            onClick={handleNew}
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                            <Plus size={18} /> Neuer Eintrag
                        </button>
                    </div>
                </div>
            </header>

            {/* Hauptinhalt: Tabelle mit allen Lehrbetriebe-Lernende-Zuordnungen */}
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
                            <th>Lehrbetrieb</th>
                            <th>Lernender</th>
                            <th>Start</th>
                            <th>Ende</th>
                            <th>Beruf</th>
                            <th style={{ textAlign: "right" }}>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Fallback-Zeile wenn keine Einträge vorhanden */}
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>
                                    Keine Einträge
                                </td>
                            </tr>
                        ) : (
                            // Alle Zuordnungen als Tabellenzeilen rendern
                            data.map((p) => (
                                <tr key={p.id_lehrbetriebe_lernende}>
                                    <td style={{ fontWeight: 500 }}>{p.firma ?? "-"}</td>
                                    <td>{p.lernender_name ?? "-"}</td>
                                    <td>{p.start ?? "-"}</td>
                                    <td>{p.ende ?? "-"}</td>
                                    <td>{p.beruf ?? "-"}</td>
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

            {/* Modal für Erstellen / Bearbeiten einer Lehrbetriebe-Lernende-Zuordnung */}
            {editOpen && (
                <div className="modal-overlay" onClick={() => setEditOpen(false)}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: "650px", width: "90%" }}
                        onClick={(e) => e.stopPropagation()} // Klick im Modal schliesst es nicht
                    >
                        <h2 style={{ marginBottom: "1.5rem" }}>
                            {editItem
                                ? "Eintrag bearbeiten"
                                : "Neuer Lehrbetriebe–Lernende Eintrag"}
                        </h2>

                        {/* Formularfelder: Lehrbetrieb, Lernender, Zeitraum und Beruf */}
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {/* Lehrbetrieb wird dynamisch aus der Lehrbetriebe-API befüllt */}
                            <label>
                                Lehrbetrieb
                                <select
                                    value={editForm.nr_lehrbetrieb ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, nr_lehrbetrieb: e.target.value })
                                    }
                                >
                                    <option value="">-- Bitte wählen --</option>
                                    {lehrbetriebe.map((betrieb) => (
                                        <option key={betrieb.id_lehrbetrieb} value={betrieb.id_lehrbetrieb}>
                                            {betrieb.firma}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {/* Lernender wird dynamisch aus der Lernende-API befüllt */}
                            <label>
                                Lernender
                                <select
                                    value={editForm.nr_lernende ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, nr_lernende: e.target.value })
                                    }
                                >
                                    <option value="">-- Bitte wählen --</option>
                                    {lernende.map((lernender) => (
                                        <option key={lernender.id_lernende} value={lernender.id_lernende}>
                                            {lernender.vorname} {lernender.nachname}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Startdatum
                                <input
                                    type="date"
                                    value={editForm.start ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, start: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                Enddatum
                                <input
                                    type="date"
                                    value={editForm.ende ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, ende: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                Beruf
                                <input
                                    type="text"
                                    value={editForm.beruf ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, beruf: e.target.value })
                                    }
                                />
                            </label>
                        </div>

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