"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

// Typ für einen Kurse-Lernende-Datensatz (Zuordnungstabelle)
type KursLernender = {
    id_kurse_lernende?: number;
    nr_kurs?: number | string;
    nr_lernende?: number | string;
    note?: number | string;
    kursthema?: string;
    lernender_name?: string; // JOIN – wird vom Backend per Verknüpfung geliefert
};

// Typ für einen Kurs-Eintrag (wird für das Auswahlmenü benötigt)
type Kurs = {
    id_kurs: number;
    kursnummer: string;
    kursthema: string;
};

// Typ für einen Lernenden-Eintrag (wird für das Auswahlmenü benötigt)
type Lernender = {
    id_lernende: number;
    vorname: string;
    nachname: string;
};

export default function KurseLernendePage() {
    // Zustandsvariablen für Daten, Ladezustand und Fehlermeldung
    const [data, setData] = useState<KursLernender[]>([]);
    const [kurse, setKurse] = useState<Kurs[]>([]);
    const [lernende, setLernende] = useState<Lernender[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Steuert ob das Bearbeitungs-Modal geöffnet ist
    const [editOpen, setEditOpen] = useState(false);

    // Aktuell bearbeiteter Eintrag (null = neuer Eintrag)
    const [editItem, setEditItem] = useState<KursLernender | null>(null);

    // Formularwerte im Modal
    const [editForm, setEditForm] = useState<Partial<KursLernender>>({});

    // Basis-URL der API
    const API_BASE_URL = "http://localhost";

    // Beim ersten Laden: Zuordnungen, Kurse und Lernende abrufen
    useEffect(() => {
        fetchData();
        fetchKurse();
        fetchLernende();
    }, []);

    // Lädt alle verfügbaren Kurse für das Auswahlmenü
    const fetchKurse = async () => {
        try {
            const resp = await fetch(API_BASE_URL + "/kurse.php?all");
            if (!resp.ok) throw new Error("Fehler beim Laden der Kurse");
            const json = await resp.json();
            if (Array.isArray(json)) {
                setKurse(json);
            }
        } catch (e) {
            console.error("Fehler beim Laden der Kurse:", e);
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

    // Lädt alle Kurse-Lernende-Zuordnungen inkl. Namen via JOIN-Endpunkt
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/joins.php?type=kurse_lernende");
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
        setEditForm({ nr_kurs: "", nr_lernende: "", note: "" });
        setEditOpen(true);
    };

    // Öffnet das Modal für einen bestehenden Eintrag und befüllt das Formular
    const handleEdit = (p: KursLernender) => {
        setEditItem(p);
        setEditForm({
            nr_kurs: p.nr_kurs ?? "",
            nr_lernende: p.nr_lernende ?? "",
            note: p.note ?? "",
        });
        setEditOpen(true);
    };

    // Speichert den Eintrag: PUT bei Bearbeitung, POST bei Neuerstellung
    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/kurse_lernende.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? { id_kurse_lernende: editItem!.id_kurse_lernende, ...editForm } // Bestehenden Eintrag mit ID übergeben
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

    // Löscht eine Zuordnung nach Bestätigung durch den Benutzer
    const handleDelete = async (p: KursLernender) => {
        if (!p.id_kurse_lernende) return;
        if (!confirm(`Eintrag löschen?\nKurs: ${p.kursthema}\nLernender: ${p.lernender_name}`))
            return;

        try {
            const resp = await fetch(
                `${API_BASE_URL}/kurse_lernende.php?id_kurse_lernende=${encodeURIComponent(
                    String(p.id_kurse_lernende)
                )}`,
                { method: "DELETE" }
            );

            const text = await resp.text();
            if (!resp.ok) throw new Error(text);

            // Liste nach erfolgreichem Löschen neu laden
            await fetchData();
        } catch {
            alert("Löschen fehlgeschlagen: Der Datensatz ist noch Kursen bzw. Lernenden zugeordnet. Entfernen Sie zuerst die entsprechenden Zuordnungen.");
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
                                Kurse – Lernende
                            </h1>
                            <p style={{ color: "#64748b" }}>
                                Zuordnung von Lernenden zu Kursen
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

            {/* Hauptinhalt: Tabelle mit allen Kurse-Lernende-Zuordnungen */}
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
                            <th>Kurs</th>
                            <th>Lernender</th>
                            <th>Note</th>
                            <th style={{ textAlign: "right" }}>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Fallback-Zeile wenn keine Einträge vorhanden */}
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center", color: "#64748b" }}>
                                    Keine Einträge
                                </td>
                            </tr>
                        ) : (
                            // Alle Zuordnungen als Tabellenzeilen rendern
                            data.map((p) => (
                                <tr key={p.id_kurse_lernende}>
                                    <td style={{ fontWeight: 500 }}>{p.kursthema ?? "-"}</td>
                                    <td>{p.lernender_name ?? "-"}</td>
                                    <td>{p.note ?? "-"}</td>
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

            {/* Modal für Erstellen / Bearbeiten einer Kurse-Lernende-Zuordnung */}
            {editOpen && (
                <div className="modal-overlay" onClick={() => setEditOpen(false)}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: "600px", width: "90%" }}
                        onClick={(e) => e.stopPropagation()} // Klick im Modal schliesst es nicht
                    >
                        <h2 style={{ marginBottom: "1.5rem" }}>
                            {editItem ? "Eintrag bearbeiten" : "Neuer Kurse–Lernende Eintrag"}
                        </h2>

                        {/* Formularfelder: Kurs, Lernender und Note */}
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {/* Kurs wird dynamisch aus der Kurse-API befüllt */}
                            <label>
                                Kurs
                                <select
                                    value={editForm.nr_kurs ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, nr_kurs: e.target.value })
                                    }
                                >
                                    <option value="">-- Bitte wählen --</option>
                                    {kurse.map((kurs) => (
                                        <option key={kurs.id_kurs} value={kurs.id_kurs}>
                                            {kurs.kursnummer} - {kurs.kursthema}
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

                            {/* Note: Schweizer Skala 1–6 mit Schritten von 0.1 */}
                            <label>
                                Note
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="6"
                                    value={editForm.note ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, note: e.target.value })
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