"use client";
import React, { useEffect, useState } from "react";

type Land = {
    id_country?: number;
    country?: string;
};

export default function LaenderPage() {
    const [data, setData] = useState<Land[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const [editItem, setEditItem] = useState<Land | null>(null);
    const [editForm, setEditForm] = useState<Partial<Land>>({});

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/laender.php?all");
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
        setEditForm({ country: "" });
        setEditOpen(true);
    };

    const handleEdit = (p: Land) => {
        setEditItem(p);
        setEditForm({ country: p.country ?? "" });
        setEditOpen(true);
    };

    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/laender.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? {
                            id_country: editItem!.id_country,
                            country: editForm.country,
                        }
                        : editForm
                ),
            });

            const text = await resp.text();
            if (!resp.ok) {
                throw new Error(text);
            }

            await fetchData();
        } catch {
            alert("Speichern fehlgeschlagen");
        } finally {
            setEditItem(null);
        }
    };

    const handleDelete = async (p: Land) => {
        if (!p.id_country) {
            alert("Keine gültige ID");
            return;
        }

        if (!confirm(`Land "${p.country}" löschen?`)) return;

        try {
            const resp = await fetch(
                API_BASE_URL +
                "/laender.php?id_country=" +
                encodeURIComponent(String(p.id_country)),
                { method: "DELETE" }
            );

            const text = await resp.text();
            if (!resp.ok) {
                throw new Error(text);
            }

            await fetchData();
        } catch {
            alert("Löschen fehlgeschlagen");
        }
    };

    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Kursverwaltung – Länder</h1>

            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <button
                    onClick={() => window.history.back()}
                    style={{
                        marginRight: "0.5rem",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                    }}
                >
                    Zurück
                </button>
                <button
                    onClick={handleNew}
                    style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                >
                    Neues Land
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
                    Länder Übersicht
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
                        Land
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
                            colSpan={2}
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
                        <tr key={p.id_country}>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                }}
                            >
                                {p.country ?? "-"}
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
                            width: "500px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>{editItem ? "Land bearbeiten" : "Neues Land"}</h2>

                        <label style={{ display: "block", marginTop: "1rem" }}>
                            Land *
                            <input
                                type="text"
                                style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    marginTop: "0.25rem",
                                }}
                                value={editForm.country ?? ""}
                                onChange={(e) =>
                                    setEditForm({ country: e.target.value })
                                }
                            />
                        </label>

                        <div
                            style={{
                                marginTop: "1.5rem",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "0.5rem",
                            }}
                        >
                            <button
                                onClick={() => setEditOpen(false)}
                                style={{ padding: "0.5rem 1rem" }}
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: "0.5rem 1rem",
                                    background: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                }}
                            >
                                Speichern
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
