"use client";
import React, { useEffect, useState } from "react";

type Lehrbetrieb = {
    id_lehrbetrieb?: number;
    firma?: string;
    strasse?: string;
    plz?: string;
    ort?: string;
};

export default function LehrbetriebePage() {
    const [data, setData] = useState<Lehrbetrieb[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const [editItem, setEditItem] = useState<Lehrbetrieb | null>(null);
    const [editForm, setEditForm] = useState<Partial<Lehrbetrieb>>({});

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/lehrbetriebe.php?all");
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }
            const json = await resp.json();
            if (!Array.isArray(json)) {
                throw new Error("Unerwartetes Antwortformat");
            }
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
            firma: "",
            strasse: "",
            plz: "",
            ort: "",
        });
        setEditOpen(true);
    };

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

    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/lehrbetriebe.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? {
                            id_lehrbetrieb: editItem!.id_lehrbetrieb,
                            ...editForm,
                        }
                        : editForm
                ),
            });

            const text = await resp.text();
            if (!resp.ok) {
                throw new Error(text);
            }

            await fetchData();
        } catch (e) {
            alert("Speichern fehlgeschlagen");
        } finally {
            setEditItem(null);
        }
    };

    const handleDelete = async (p: Lehrbetrieb) => {
        if (!p.id_lehrbetrieb) {
            alert("Keine gültige ID");
            return;
        }

        if (!confirm(`Lehrbetrieb "${p.firma}" löschen?`)) return;

        try {
            const resp = await fetch(
                API_BASE_URL +
                "/lehrbetriebe.php?id_lehrbetrieb=" +
                encodeURIComponent(String(p.id_lehrbetrieb)),
                { method: "DELETE" }
            );

            const text = await resp.text();
            if (!resp.ok) {
                throw new Error(text);
            }

            await fetchData();
        } catch (e) {
            alert("Löschen fehlgeschlagen");
        }
    };

    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Kursverwaltung – Lehrbetriebe</h1>

            <div style={{ margin: "1rem 0" }}>
                <button
                    onClick={() => window.history.back()}
                    style={{ marginRight: "0.5rem" }}
                >
                    Zurück
                </button>
                <button onClick={handleNew}>Neuer Lehrbetrieb</button>
            </div>

            {loading && <p>Lade Daten …</p>}
            {error && <p style={{ color: "crimson" }}>{error}</p>}

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
                    Lehrbetriebe Übersicht
                </caption>
                <thead>
                <tr>
                    <th
                        style={{
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            textAlign: "left",
                        }}
                    >
                        Firma
                    </th>
                    <th
                        style={{
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            textAlign: "left",
                        }}
                    >
                        Strasse
                    </th>
                    <th
                        style={{
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            textAlign: "left",
                        }}
                    >
                        PLZ
                    </th>
                    <th
                        style={{
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            textAlign: "left",
                        }}
                    >
                        Ort
                    </th>
                    <th
                        style={{
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            textAlign: "left",
                        }}
                    >
                        Aktionen
                    </th>
                </tr>
                </thead>
                <tbody>
                {!data || data.length === 0 ? (
                    <tr>
                        <td
                            colSpan={5}
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
                        <tr key={p.id_lehrbetrieb}>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                }}
                            >
                                {p.firma ?? "-"}
                            </td>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                }}
                            >
                                {p.strasse ?? "-"}
                            </td>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                }}
                            >
                                {p.plz ?? "-"}
                            </td>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                }}
                            >
                                {p.ort ?? "-"}
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
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleEdit(p)}
                                >
                                    Bearbeiten
                                </button>
                                <button
                                    style={{
                                        padding: "0.25rem 0.5rem",
                                        cursor: "pointer",
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
                        <h2>{editItem ? "Bearbeiten" : "Neu"}</h2>

                        {[
                            ["firma", "Firma *"],
                            ["strasse", "Strasse"],
                            ["plz", "PLZ"],
                            ["ort", "Ort"],
                        ].map(([key, label]) => (
                            <label
                                key={key}
                                style={{ display: "block", marginTop: "0.75rem" }}
                            >
                                {label}
                                <input
                                    style={{
                                        width: "100%",
                                        padding: "0.5rem",
                                        marginTop: "0.25rem",
                                    }}
                                    value={(editForm as any)[key] ?? ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({
                                            ...f,
                                            [key]: e.target.value,
                                        }))
                                    }
                                />
                            </label>
                        ))}

                        <div
                            style={{
                                marginTop: "1.5rem",
                                textAlign: "right",
                            }}
                        >
                            <button
                                onClick={() => setEditOpen(false)}
                                style={{ marginRight: "0.5rem" }}
                            >
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
