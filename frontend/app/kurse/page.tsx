"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

type Kurs = {
    id_kurs?: number;
    kursnummer?: string;
    kursthema?: string;
    inhalt?: string;
    nr_dozent?: number | string;
    startdatum?: string;
    enddatum?: string;
    dauer?: number | string;
    dozent_name?: string; // JOIN
};

export default function KursePage() {
    const [data, setData] = useState<Kurs[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<Kurs | null>(null);
    const [editForm, setEditForm] = useState<Partial<Kurs>>({});

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
    }, []);

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

    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/kurse.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? { id_kurs: editItem!.id_kurs, ...editForm }
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

            await fetchData();
        } catch {
            alert("Löschen fehlgeschlagen");
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            {/* Header */}
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

            {/* Content */}
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
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
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", color: "#64748b" }}>
                                    Keine Einträge
                                </td>
                            </tr>
                        ) : (
                            data.map((p) => (
                                <tr key={p.id_kurs}>
                                    <td style={{ fontWeight: 500 }}>{p.kursnummer ?? "-"}</td>
                                    <td>{p.kursthema ?? "-"}</td>
                                    <td>{p.dozent_name ?? "-"}</td>
                                    <td>{p.startdatum ?? "-"}</td>
                                    <td>{p.enddatum ?? "-"}</td>
                                    <td>{p.dauer ?? "-"}</td>
                                    <td>
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

            {/* Modal */}
            {editOpen && (
                <div className="modal-overlay" onClick={() => setEditOpen(false)}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: "800px", width: "90%" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: "1.5rem" }}>
                            {editItem ? "Kurs bearbeiten" : "Neuer Kurs"}
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "1rem",
                            }}
                        >
                            {[
                                ["kursnummer", "Kursnummer"],
                                ["kursthema", "Kursthema"],
                                ["nr_dozent", "Dozent ID"],
                                ["dauer", "Dauer (h)"],
                            ].map(([k, label]) => (
                                <label key={k}>
                                    {label}
                                    <input
                                        value={(editForm as any)[k] ?? ""}
                                        onChange={(e) =>
                                            setEditForm((f) => ({ ...f, [k]: e.target.value }))
                                        }
                                    />
                                </label>
                            ))}

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
