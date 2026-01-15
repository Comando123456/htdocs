"use client";
import React, { useEffect, useState } from "react";

type KursLernender = {
    id_kurse_lernende?: number;
    nr_kurs?: number | string;
    nr_lernende?: number | string;
    note?: number | string;
};

export default function KurseLernendePage() {
    const [data, setData] = useState<KursLernender[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<KursLernender | null>(null);
    const [editForm, setEditForm] = useState<Partial<KursLernender>>({});

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/kurse_lernende.php?all");
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
            nr_kurs: "",
            nr_lernende: "",
            note: "",
        });
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
                        ? {
                            id_kurse_lernende: editItem!.id_kurse_lernende,
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

    const handleDelete = async (p: KursLernender) => {
        if (!p.id_kurse_lernende) {
            alert("Keine gültige ID");
            return;
        }

        if (
            !confirm(
                `Eintrag löschen? (Kurs ${p.nr_kurs}, Lernender ${p.nr_lernende})`
            )
        )
            return;

        try {
            const resp = await fetch(
                API_BASE_URL +
                "/kurse_lernende.php?id_kurse_lernende=" +
                encodeURIComponent(String(p.id_kurse_lernende)),
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
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Kursverwaltung – Kurse–Lernende</h1>

            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <button
                    onClick={() => window.history.back()}
                    style={{ marginRight: "0.5rem", padding: "0.5rem 1rem" }}
                >
                    Zurück
                </button>
                <button
                    onClick={handleNew}
                    style={{ padding: "0.5rem 1rem" }}
                >
                    Neuer Eintrag
                </button>
            </div>

            {loading && <p>Lade Daten …</p>}
            {error && <p style={{ color: "crimson" }}>Fehler: {error}</p>}

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "1rem",
                }}
            >
                <caption
                    style={{
                        textAlign: "left",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                    }}
                >
                    Kurse–Lernende Übersicht
                </caption>
                <thead>
                <tr>
                    {["Kurs ID", "Lernende ID", "Note", "Aktionen"].map(
                        (h) => (
                            <th
                                key={h}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                    textAlign: "left",
                                }}
                            >
                                {h}
                            </th>
                        )
                    )}
                </tr>
                </thead>
                <tbody>
                {!data || data.length === 0 ? (
                    <tr>
                        <td
                            colSpan={4}
                            style={{
                                border: "1px solid #ccc",
                                padding: "0.5rem",
                            }}
                        >
                            Keine Einträge vorhanden.
                        </td>
                    </tr>
                ) : (
                    data.map((p) => (
                        <tr key={p.id_kurse_lernende}>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                }}
                            >
                                {p.nr_kurs ?? "-"}
                            </td>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                }}
                            >
                                {p.nr_lernende ?? "-"}
                            </td>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                }}
                            >
                                {p.note ?? "-"}
                            </td>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                }}
                            >
                                <button
                                    style={{
                                        marginRight: "0.5rem",
                                        padding: "0.25rem 0.5rem",
                                    }}
                                    onClick={() => handleEdit(p)}
                                >
                                    Bearbeiten
                                </button>
                                <button
                                    style={{
                                        padding: "0.25rem 0.5rem",
                                    }}
                                    onClick={() => handleDelete(p)}
                                >
                                    Löschen
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            {editOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setEditOpen(false)}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "2rem",
                            width: "600px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>
                            {editItem
                                ? "Eintrag bearbeiten"
                                : "Neuer Kurse–Lernende Eintrag"}
                        </h2>

                        <div style={{ marginTop: "1rem" }}>
                            {[
                                ["nr_kurs", "Kurs ID"],
                                ["nr_lernende", "Lernende ID"],
                                ["note", "Note"],
                            ].map(([k, label]) => (
                                <label
                                    key={k}
                                    style={{
                                        display: "block",
                                        marginTop: "0.75rem",
                                    }}
                                >
                                    {label}
                                    <input
                                        type={k === "note" ? "number" : "text"}
                                        step={k === "note" ? "0.1" : undefined}
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            marginTop: "0.25rem",
                                        }}
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
                                marginTop: "1.5rem",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "0.5rem",
                            }}
                        >
                            <button onClick={() => setEditOpen(false)}>
                                Abbrechen
                            </button>
                            <button onClick={handleSave}>Speichern</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
