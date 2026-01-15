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

export default function DozentenPage() {
    const [data, setData] = useState<Dozent[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<Dozent | null>(null);
    const [editForm, setEditForm] = useState<Partial<Dozent>>({});

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
    }, []);

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
                            <th style={{ textAlign: "right" }}>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!data || data.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", color: "#64748b" }}>
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
                            {[
                                ["vorname", "Vorname *"],
                                ["nachname", "Nachname *"],
                                ["strasse", "Strasse"],
                                ["plz", "PLZ"],
                                ["ort", "Ort"],
                                ["nr_land", "Land (ID)"],
                                ["geschlecht", "Geschlecht"],
                                ["telefon", "Telefon"],
                                ["handy", "Handy"],
                                ["email", "E-Mail"],
                                ["birthdate", "Geburtsdatum"],
                            ].map(([k, label]) => (
                                <label key={k}>
                                    {label}
                                    <input
                                        type={k === "birthdate" ? "date" : "text"}
                                        value={(editForm as any)[k] ?? ""}
                                        onChange={(e) =>
                                            setEditForm((f) => ({ ...f, [k]: e.target.value }))
                                        }
                                    />
                                </label>
                            ))}
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
