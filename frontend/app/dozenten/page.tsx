"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

type Dozent = {
    id_dozent?: number;
    vorname?: string;
    nachname?: string;
    strasse?: string;
    plz?: string;
    ort?: string;
    nr_land?: number | string;
    geschlecht?: string;
    telefon?: string;
    handy?: string;
    email?: string;
    birthdate?: string;
};

type Land = {
    id_country: number;
    country: string;
};

export default function DozentenPage() {
    const [data, setData] = useState<Dozent[] | null>(null);
    const [laender, setLaender] = useState<Land[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<Dozent | null>(null);
    const [editForm, setEditForm] = useState<Partial<Dozent>>({});

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
        fetchLaender();
    }, []);

    const fetchLaender = async () => {
        try {
            const resp = await fetch(API_BASE_URL + "/laender.php?all");
            if (!resp.ok) throw new Error("Fehler beim Laden der Länder");
            const json = await resp.json();
            if (Array.isArray(json)) {
                setLaender(json);
            }
        } catch (e) {
            console.error("Fehler beim Laden der Länder:", e);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/dozenten.php?all");
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

    const getLandName = (nr_land: number | string | undefined): string => {
        if (!nr_land) return "-";
        const land = laender.find(l => l.id_country === Number(nr_land));
        return land ? land.country : String(nr_land);
    };

    const handleNew = () => {
        setEditItem(null);
        setEditForm({
            vorname: "",
            nachname: "",
            strasse: "",
            plz: "",
            ort: "",
            nr_land: "",
            geschlecht: "",
            telefon: "",
            handy: "",
            email: "",
            birthdate: "",
        });
        setEditOpen(true);
    };

    const handleEdit = (p: Dozent) => {
        setEditItem(p);
        setEditForm({
            vorname: p.vorname ?? "",
            nachname: p.nachname ?? "",
            strasse: p.strasse ?? "",
            plz: p.plz ?? "",
            ort: p.ort ?? "",
            nr_land: p.nr_land ?? "",
            geschlecht: p.geschlecht ?? "",
            telefon: p.telefon ?? "",
            handy: p.handy ?? "",
            email: p.email ?? "",
            birthdate: p.birthdate ?? "",
        });
        setEditOpen(true);
    };

    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/dozenten.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? { id_dozent: editItem!.id_dozent, ...editForm }
                        : editForm
                ),
            });

            const text = await resp.text();
            if (!resp.ok) throw new Error(text);

            await fetchData();
        } catch {
            alert("Speichern fehlgeschlagen");
        } finally {
            setEditItem(null);
        }
    };

    const handleDelete = async (p: Dozent) => {
        if (!p.id_dozent) return;
        if (!confirm(`Dozent "${p.vorname} ${p.nachname}" löschen?`)) return;

        try {
            const resp = await fetch(
                `${API_BASE_URL}/dozenten.php?id_dozent=${encodeURIComponent(
                    String(p.id_dozent)
                )}`,
                { method: "DELETE" }
            );

            const text = await resp.text();
            if (!resp.ok) throw new Error(text);

            await fetchData();
        } catch {
            alert("Löschen fehlgeschlagen");
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            {/* Header */}
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
                                Dozenten
                            </h1>
                            <p style={{ color: "#64748b" }}>Verwaltung aller Dozenten</p>
                        </div>
                        <button
                            onClick={handleNew}
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                            <Plus size={18} /> Neuer Dozent
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
                {loading && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b" }}>
                        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                        Lade Daten…
                    </div>
                )}

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
                            <th>Vorname</th>
                            <th>Nachname</th>
                            <th>E-Mail</th>
                            <th>Ort</th>
                            <th>Land</th>
                            <th style={{ textAlign: "right" }}>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!data || data.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>
                                    Keine Einträge
                                </td>
                            </tr>
                        ) : (
                            data.map((p) => (
                                <tr key={p.id_dozent}>
                                    <td style={{ fontWeight: 500 }}>{p.vorname ?? "-"}</td>
                                    <td>{p.nachname ?? "-"}</td>
                                    <td style={{ color: "#64748b" }}>{p.email ?? "-"}</td>
                                    <td>{p.ort ?? "-"}</td>
                                    <td>{getLandName(p.nr_land)}</td>
                                    <td>
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

            {/* Modal */}
            {editOpen && (
                <div className="modal-overlay" onClick={() => setEditOpen(false)}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: "800px", width: "90%" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: "1.5rem" }}>
                            {editItem ? "Dozent bearbeiten" : "Neuer Dozent"}
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "1rem",
                            }}
                        >
                            <label>
                                Vorname *
                                <input
                                    type="text"
                                    value={editForm.vorname ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, vorname: e.target.value })}
                                />
                            </label>

                            <label>
                                Nachname *
                                <input
                                    type="text"
                                    value={editForm.nachname ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, nachname: e.target.value })}
                                />
                            </label>

                            <label style={{ gridColumn: "1 / -1" }}>
                                Strasse
                                <input
                                    type="text"
                                    value={editForm.strasse ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, strasse: e.target.value })}
                                />
                            </label>

                            <label>
                                PLZ
                                <input
                                    type="text"
                                    value={editForm.plz ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, plz: e.target.value })}
                                />
                            </label>

                            <label>
                                Ort
                                <input
                                    type="text"
                                    value={editForm.ort ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, ort: e.target.value })}
                                />
                            </label>

                            <label>
                                Land
                                <select
                                    value={editForm.nr_land ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, nr_land: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid var(--border)",
                                        background: "var(--surface)",
                                        color: "var(--text)"
                                    }}
                                >
                                    <option value="">-- Bitte wählen --</option>
                                    {laender.map((land) => (
                                        <option key={land.id_country} value={land.id_country}>
                                            {land.country}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Geschlecht
                                <select
                                    value={editForm.geschlecht ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, geschlecht: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid var(--border)",
                                        background: "var(--surface)",
                                        color: "var(--text)"
                                    }}
                                >
                                    <option value="">-- Bitte wählen --</option>
                                    <option value="m">Männlich</option>
                                    <option value="w">Weiblich</option>
                                    <option value="d">Divers</option>
                                </select>
                            </label>

                            <label>
                                Telefon
                                <input
                                    type="tel"
                                    value={editForm.telefon ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })}
                                />
                            </label>

                            <label>
                                Handy
                                <input
                                    type="tel"
                                    value={editForm.handy ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, handy: e.target.value })}
                                />
                            </label>

                            <label style={{ gridColumn: "1 / -1" }}>
                                E-Mail
                                <input
                                    type="email"
                                    value={editForm.email ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </label>

                            <label style={{ gridColumn: "1 / -1" }}>
                                Geburtsdatum
                                <input
                                    type="date"
                                    value={editForm.birthdate ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                                />
                            </label>
                        </div>

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