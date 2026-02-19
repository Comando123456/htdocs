"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

// Typ für einen Kurs-Datensatz
type Kurs = {
    id_kurs?: number;
    kursnummer?: string;
    kursthema?: string;
    inhalt?: string;
    nr_dozent?: number | string;
    startdatum?: string;
    enddatum?: string;
    dauer?: number | string;
    dozent_name?: string; // JOIN – wird vom Backend per Verknüpfung mit tbl_dozenten geliefert
};

// Typ für einen Dozenten-Eintrag (wird für das Auswahlmenü benötigt)
type Dozent = {
    id_dozent: number;
    vorname: string;
    nachname: string;
};

export default function KursePage() {
    // Zustandsvariablen für Daten, Ladezustand und Fehlermeldung
    const [data, setData] = useState<Kurs[]>([]);
    const [dozenten, setDozenten] = useState<Dozent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Steuert ob das Bearbeitungs-Modal geöffnet ist
    const [editOpen, setEditOpen] = useState(false);

    // Aktuell bearbeiteter Kurs (null = neuer Eintrag)
    const [editItem, setEditItem] = useState<Kurs | null>(null);

    // Formularwerte im Modal
    const [editForm, setEditForm] = useState<Partial<Kurs>>({});

    // Basis-URL der API
    const API_BASE_URL = "http://localhost";

    // Beim ersten Laden: Kurse und Dozenten abrufen
    useEffect(() => {
        fetchData();
        fetchDozenten();
    }, []);

    // Lädt alle verfügbaren Dozenten für das Auswahlmenü
    const fetchDozenten = async () => {
        try {
            const resp = await fetch(API_BASE_URL + "/dozenten.php?all");
            if (!resp.ok) throw new Error("Fehler beim Laden der Dozenten");
            const json = await resp.json();
            if (Array.isArray(json)) {
                setDozenten(json);
            }
        } catch (e) {
            console.error("Fehler beim Laden der Dozenten:", e);
        }
    };

    // Lädt alle Kurse inkl. Dozenten-Name via JOIN-Endpunkt
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/joins.php?type=kurse");
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

    // Öffnet das Modal für einen neuen Kurs mit leeren Feldern
    const handleNew = () => {
        setEditItem(null);
        setEditForm({
            kursnummer: "",
            kursthema: "",
            inhalt: "",
            nr_dozent: "",
            startdatum: "",
            enddatum: "",
            dauer: "",
        });
        setEditOpen(true);
    };

    // Öffnet das Modal für einen bestehenden Kurs und befüllt das Formular
    const handleEdit = (p: Kurs) => {
        setEditItem(p);
        setEditForm({
            kursnummer: p.kursnummer ?? "",
            kursthema: p.kursthema ?? "",
            inhalt: p.inhalt ?? "",
            nr_dozent: p.nr_dozent ?? "",
            startdatum: p.startdatum ?? "",
            enddatum: p.enddatum ?? "",
            dauer: p.dauer ?? "",
        });
        setEditOpen(true);
    };

    // Speichert den Kurs: PUT bei Bearbeitung, POST bei Neuerstellung
    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/kurse.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? { id_kurs: editItem!.id_kurs, ...editForm } // Bestehenden Eintrag mit ID übergeben
                        : editForm                                      // Neuen Eintrag ohne ID übergeben
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

    // Löscht einen Kurs nach Bestätigung durch den Benutzer
    const handleDelete = async (p: Kurs) => {
        if (!p.id_kurs) return;
        if (
            !confirm(`Kurs löschen?\n${p.kursthema}\nDozent: ${p.dozent_name}`)
        )
            return;

        try {
            const resp = await fetch(
                `${API_BASE_URL}/kurse.php?id_kurs=${encodeURIComponent(
                    String(p.id_kurs)
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
            {/* Seitenkopf mit Titel und Button für neuen Kurs */}
            <header
                style={{
                    background: "white",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "2rem 0",
                }}
            >
                <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "1rem",
                        }}
                    >
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

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <h1
                                style={{
                                    fontSize: "2rem",
                                    fontWeight: 700,
                                    color: "#0f172a",
                                }}
                            >
                                Kurse
                            </h1>
                            <p style={{ color: "#64748b" }}>
                                Verwaltung aller Kurse
                            </p>
                        </div>
                        <button
                            onClick={handleNew}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <Plus size={18} /> Neuer Kurs
                        </button>
                    </div>
                </div>
            </header>

            {/* Hauptinhalt: Tabelle mit allen Kursen */}
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
                {/* Ladeanzeige während Daten abgerufen werden */}
                {loading && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "#64748b",
                        }}
                    >
                        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                        Lade Daten…
                    </div>
                )}

                {/* Fehlermeldung bei gescheitertem API-Aufruf */}
                {error && (
                    <div
                        style={{
                            padding: "1rem",
                            background: "#fee",
                            color: "#c00",
                            borderRadius: "0.5rem",
                        }}
                    >
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
                            <th>Kursnr.</th>
                            <th>Thema</th>
                            <th>Dozent</th>
                            <th>Start</th>
                            <th>Ende</th>
                            <th>Dauer</th>
                            <th style={{ textAlign: "right" }}>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Fallback-Zeile wenn keine Einträge vorhanden */}
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", color: "#64748b" }}>
                                    Keine Einträge
                                </td>
                            </tr>
                        ) : (
                            // Alle Kurse als Tabellenzeilen rendern
                            data.map((p) => (
                                <tr key={p.id_kurs}>
                                    <td style={{ fontWeight: 500 }}>{p.kursnummer ?? "-"}</td>
                                    <td>{p.kursthema ?? "-"}</td>
                                    <td>{p.dozent_name ?? "-"}</td>
                                    <td>{p.startdatum ?? "-"}</td>
                                    <td>{p.enddatum ?? "-"}</td>
                                    <td>{p.dauer ?? "-"}</td>
                                    <td>
                                        {/* Aktionsbuttons: Bearbeiten und Löschen */}
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "0.5rem",
                                                justifyContent: "flex-end",
                                            }}
                                        >
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

            {/* Modal für Erstellen / Bearbeiten eines Kurses */}
            {editOpen && (
                <div className="modal-overlay" onClick={() => setEditOpen(false)}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: "800px", width: "90%" }}
                        onClick={(e) => e.stopPropagation()} // Klick im Modal schliesst es nicht
                    >
                        <h2 style={{ marginBottom: "1.5rem" }}>
                            {editItem ? "Kurs bearbeiten" : "Neuer Kurs"}
                        </h2>

                        {/* Formularfelder im 2-Spalten-Grid */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "1rem",
                            }}
                        >
                            <label>
                                Kursnummer
                                <input
                                    value={editForm.kursnummer ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, kursnummer: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                Kursthema
                                <input
                                    value={editForm.kursthema ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, kursthema: e.target.value })
                                    }
                                />
                            </label>

                            {/* Dozent wird dynamisch aus der Dozenten-API befüllt */}
                            <label>
                                Dozent
                                <select
                                    value={editForm.nr_dozent ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, nr_dozent: e.target.value })
                                    }
                                >
                                    <option value="">-- Bitte wählen --</option>
                                    {dozenten.map((dozent) => (
                                        <option key={dozent.id_dozent} value={dozent.id_dozent}>
                                            {dozent.vorname} {dozent.nachname}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Dauer (h)
                                <input
                                    type="number"
                                    value={editForm.dauer ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, dauer: e.target.value })
                                    }
                                />
                            </label>

                            {/* Inhalt nimmt die volle Breite ein */}
                            <label style={{ gridColumn: "1 / -1" }}>
                                Inhalt
                                <input
                                    value={editForm.inhalt ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, inhalt: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                Startdatum
                                <input
                                    type="date"
                                    value={editForm.startdatum ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, startdatum: e.target.value })
                                    }
                                />
                            </label>
                            <label>
                                Enddatum
                                <input
                                    type="date"
                                    value={editForm.enddatum ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, enddatum: e.target.value })
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
                                style={{
                                    background: "white",
                                    color: "#64748b",
                                    border: "1px solid #e2e8f0",
                                }}
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