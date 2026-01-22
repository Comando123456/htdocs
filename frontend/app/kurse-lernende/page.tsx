"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

type KursLernender = {
    id_kurse_lernende?: number;
    nr_kurs?: number | string;
    nr_lernende?: number | string;
    note?: number | string;
    kursthema?: string;
    lernender_name?: string;
};

type Kurs = {
    id_kurs: number;
    kursnummer: string;
    kursthema: string;
};

type Lernender = {
    id_lernende: number;
    vorname: string;
    nachname: string;
};

export default function KurseLernendePage() {
    const [data, setData] = useState<KursLernender[]>([]);
    const [kurse, setKurse] = useState<Kurs[]>([]);
    const [lernende, setLernende] = useState<Lernender[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<KursLernender | null>(null);
    const [editForm, setEditForm] = useState<Partial<KursLernender>>({});

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
        fetchKurse();
        fetchLernende();
    }, []);

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

    const handleNew = () => {
        setEditItem(null);
        setEditForm({ nr_kurs: "", nr_lernende: "", note: "" });
        setEditOpen(true);
    };

    const handleEdit = (p: KursLernender) => {
        setEditItem(p);
        setEditForm({
            nr_kurs: p.nr_kurs ?? "",
            nr_lernende: p.nr_lernende ?? "",
            note: p.note ?? "",
        });
        setEditOpen(true);
    };

    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/kurse_lernende.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? { id_kurse_lernende: editItem!.id_kurse_lernende, ...editForm }
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
                            <th>Kurs</th>
                            <th>Lernender</th>
                            <th>Note</th>
                            <th style={{ textAlign: "right" }}>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center", color: "#64748b" }}>
                                    Keine Einträge
                                </td>
                            </tr>
                        ) : (
                            data.map((p) => (
                                <tr key={p.id_kurse_lernende}>
                                    <td style={{ fontWeight: 500 }}>{p.kursthema ?? "-"}</td>
                                    <td>{p.lernender_name ?? "-"}</td>
                                    <td>{p.note ?? "-"}</td>
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
                        style={{ maxWidth: "600px", width: "90%" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: "1.5rem" }}>
                            {editItem ? "Eintrag bearbeiten" : "Neuer Kurse–Lernende Eintrag"}
                        </h2>

                        <div style={{ display: "grid", gap: "1rem" }}>
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