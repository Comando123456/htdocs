"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

// Typ für einen Lehrbetrieb-Datensatz
type Lehrbetrieb = {
    id_lehrbetrieb?: number;
    firma?: string;
    strasse?: string;
    plz?: string;
    ort?: string;
};

export default function LehrbetriebePage() {
    // Zustandsvariablen für Daten, Ladezustand und Fehlermeldung
    const [data, setData] = useState<Lehrbetrieb[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Steuert ob das Bearbeitungs-Modal geöffnet ist
    const [editOpen, setEditOpen] = useState<boolean>(false);

    // Aktuell bearbeiteter Lehrbetrieb (null = neuer Eintrag)
    const [editItem, setEditItem] = useState<Lehrbetrieb | null>(null);

    // Formularwerte im Modal
    const [editForm, setEditForm] = useState<Partial<Lehrbetrieb>>({});

    // Basis-URL der API
    const API_BASE_URL = "http://localhost";

    // Beim ersten Laden: Lehrbetriebe abrufen
    useEffect(() => {
        fetchData();
    }, []);

    // Lädt alle Lehrbetriebe von der API
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/lehrbetriebe.php?all");
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

    // Öffnet das Modal für einen neuen Lehrbetrieb mit leeren Feldern
    const handleNew = () => {
        setEditItem(null);
        setEditForm({ firma: "", strasse: "", plz: "", ort: "" });
        setEditOpen(true);
    };

    // Öffnet das Modal für einen bestehenden Lehrbetrieb und befüllt das Formular
    const handleEdit = (p: Lehrbetrieb) => {
        setEditItem(p);
        setEditForm({
            firma: p.firma ?? "",
            strasse: p.strasse ?? "",
            plz: p.plz ?? "",
            ort: p.ort ?? "",
        });
        setEditOpen(true);
    };

    // Speichert den Lehrbetrieb: PUT bei Bearbeitung, POST bei Neuerstellung
    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/lehrbetriebe.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? { id_lehrbetrieb: editItem!.id_lehrbetrieb, ...editForm } // Bestehenden Eintrag mit ID übergeben
                        : editForm                                                    // Neuen Eintrag ohne ID übergeben
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

    // Löscht einen Lehrbetrieb nach Bestätigung durch den Benutzer
    const handleDelete = async (p: Lehrbetrieb) => {
        if (!p.id_lehrbetrieb) return;
        if (!confirm(`Lehrbetrieb "${p.firma}" löschen?`)) return;

        try {
            const resp = await fetch(
                `${API_BASE_URL}/lehrbetriebe.php?id_lehrbetrieb=${encodeURIComponent(
                    String(p.id_lehrbetrieb)
                )}`,
                { method: "DELETE" }
            );

            const text = await resp.text();
            if (!resp.ok) throw new Error(text);

            // Liste nach erfolgreichem Löschen neu laden
            await fetchData();
        } catch {
            alert("Löschen fehlgeschlagen: Der Lehrbetrieb wird noch verwendet.");

        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            {/* Seitenkopf mit Titel und Button für neuen Lehrbetrieb */}
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
                                Lehrbetriebe
                            </h1>
                            <p style={{ color: "#64748b" }}>Verwaltung aller Lehrbetriebe</p>
                        </div>
                        <button
                            onClick={handleNew}
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                            <Plus size={18} /> Neuer Lehrbetrieb
                        </button>
                    </div>
                </div>
            </header>

            {/* Hauptinhalt: Tabelle mit allen Lehrbetrieben */}
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
                            <th>Firma</th>
                            <th>Strasse</th>
                            <th>PLZ</th>
                            <th>Ort</th>
                            <th style={{ textAlign: "right" }}>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Fallback-Zeile wenn keine Einträge vorhanden */}
                        {!data || data.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", color: "#64748b" }}>
                                    Keine Einträge
                                </td>
                            </tr>
                        ) : (
                            // Alle Lehrbetriebe als Tabellenzeilen rendern
                            data.map((p) => (
                                <tr key={p.id_lehrbetrieb}>
                                    <td style={{ fontWeight: 500 }}>{p.firma ?? "-"}</td>
                                    <td>{p.strasse ?? "-"}</td>
                                    <td>{p.plz ?? "-"}</td>
                                    <td>{p.ort ?? "-"}</td>
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

            {/* Modal für Erstellen / Bearbeiten eines Lehrbetriebs */}
            {editOpen && (
                <div className="modal-overlay" onClick={() => setEditOpen(false)}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: "600px", width: "90%" }}
                        onClick={(e) => e.stopPropagation()} // Klick im Modal schliesst es nicht
                    >
                        <h2 style={{ marginBottom: "1.5rem" }}>
                            {editItem ? "Lehrbetrieb bearbeiten" : "Neuer Lehrbetrieb"}
                        </h2>

                        {/* Formularfelder im 2-Spalten-Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                            {/* Firmenname nimmt die volle Breite ein */}
                            <label style={{ gridColumn: "1 / -1" }}>
                                Firma *
                                <input
                                    value={editForm.firma ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, firma: e.target.value })}
                                />
                            </label>
                            <label>
                                Strasse
                                <input
                                    value={editForm.strasse ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, strasse: e.target.value })}
                                />
                            </label>
                            <label>
                                PLZ
                                <input
                                    value={editForm.plz ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, plz: e.target.value })}
                                />
                            </label>
                            {/* Ort nimmt die volle Breite ein */}
                            <label style={{ gridColumn: "1 / -1" }}>
                                Ort
                                <input
                                    value={editForm.ort ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, ort: e.target.value })}
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