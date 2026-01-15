"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

type LehrbetriebLernender = {
    id_lehrbetriebe_lernende?: number;
    nr_lehrbetrieb?: number | string;
    nr_lernende?: number | string;
    start?: string;
    ende?: string;
    beruf?: string;
    firma?: string;
    lernender_name?: string;
};

export default function LehrbetriebeLernendePage() {
    const [data, setData] = useState<LehrbetriebLernender[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<LehrbetriebLernender | null>(null);
    const [editForm, setEditForm] = useState<Partial<LehrbetriebLernender>>({});

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
    }, []);

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
                            editItem!.id_lehrbetriebe_lernende,
                            ...editForm,
                        }
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
                            <th>Lehrbetrieb</th>
                            <th>Lernender</th>
                            <th>Start</th>
                            <th>Ende</th>
                            <th>Beruf</th>
                            <th style={{ textAlign: "right" }}>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>
                                    Keine Einträge
                                </td>
                            </tr>
                        ) : (
                            data.map((p) => (
                                <tr key={p.id_lehrbetriebe_lernende}>
                                    <td style={{ fontWeight: 500 }}>{p.firma ?? "-"}</td>
                                    <td>{p.lernender_name ?? "-"}</td>
                                    <td>{p.start ?? "-"}</td>
                                    <td>{p.ende ?? "-"}</td>
                                    <td>{p.beruf ?? "-"}</td>
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
                        style={{ maxWidth: "650px", width: "90%" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: "1.5rem" }}>
                            {editItem
                                ? "Eintrag bearbeiten"
                                : "Neuer Lehrbetriebe–Lernende Eintrag"}
                        </h2>

                        <div style={{ display: "grid", gap: "1rem" }}>
                            {[
                                ["nr_lehrbetrieb", "Lehrbetrieb ID"],
                                ["nr_lernende", "Lernende ID"],
                                ["start", "Startdatum"],
                                ["ende", "Enddatum"],
                                ["beruf", "Beruf"],
                            ].map(([k, label]) => (
                                <label key={k}>
                                    {label}
                                    <input
                                        type={
                                            k === "start" || k === "ende"
                                                ? "date"
                                                : "text"
                                        }
                                        value={(editForm as any)[k] ?? ""}
                                        onChange={(e) =>
                                            setEditForm((f) => ({
                                                ...f,
                                                [k]: e.target.value,
                                            }))
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
